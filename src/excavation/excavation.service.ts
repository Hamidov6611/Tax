import {
    BadRequestException,
    Injectable,
    PreconditionFailedException,
  } from '@nestjs/common';
  import { Prisma, Status } from '@prisma/client';
  import { ErrorCode, PaginationParams } from 'src/config/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import * as XLSX from 'xlsx';
import { CurrentUser } from 'src/decorators/user.decorator';
import { paginate, getPagination } from 'src/decorators/pagination.decorator';
import Tax, { formatSendDate, stringifyIfObject } from 'src/utils/tax';
import * as multer from 'multer';

  
  @Injectable()
  export class ExcavationService {
    constructor(private prisma: PrismaService) {}
  
    async uploadExcelFile(
      file: multer.Express.Multer.File,
      currentUser: CurrentUser,
    ): Promise<any[]> {
      // The file.buffer contains the Excel file content
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  
      // Assuming the first sheet is what you want to read
  
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      if (jsonData.length === 0 || Object.values(jsonData[0])?.length !== 10) {
        throw new BadRequestException(
          'Invalid excel file format',
          ErrorCode.INVALID_FIELD,
        );
      }
  
      const rows = jsonData.map((row) => {
        const values = Object.values(row);
  
        // Splitting Dsi code to viloyat and tuman
        const [viloyat, tuman] = values[7]?.split('/');
  
        return {
          send_id: values[0] as number,
          date: values[1] as string,
          vilayotName: values[2] as string,
          tumanAndRiverName: values[3] as string,
          areaName: values[4] as string,
          address: values[5] as string,
          tin: parseInt(values[6]) as number,
          dsiCode: values[7] as string,
          name: values[8] as string,
          count: values[9] as number,
          ns10: parseInt(viloyat),
          ns11: parseInt(tuman),
        };
      });
      // console.log(rows);
  
      await this.prisma.excavation.deleteMany({
        where: {
          id: {
            in: rows.map((row) => row.send_id),
          },
        },
      });
  
      await this.prisma.excavation.createMany({
        data: rows.map((row) => {
          if (!row.count) {
            console.log(row);
          }
          return {
            id: row.send_id,
            date: row.date,
            createdById: currentUser.id,
            viloyatName: row.vilayotName,
            tumanAndRiverName: row.tumanAndRiverName,
            areaName: row.areaName,
            address: row.address,
            tin: row.tin,
            dsiCode: row.dsiCode,
            organizationName: row.name,
            count: row.count,
            ns10: row.ns10,
            ns11: row.ns11,
            excelFileName: file.originalname,
          };
        }),
      });
  
      // this.sendToTaxSystem();
  
      return rows;
    }
  
    async sendToTaxSystem() {
      const entriesToSend = await this.prisma.excavation.findMany({
        where: {
          status: Status.NOT_SENT,
        },
      });
  
      entriesToSend.forEach(async (entry) => {
        const result = await Tax.sendEntry({
          send_id: entry.id.toString(),
          send_date: formatSendDate(entry.date),
          ns10: entry.ns10.toString(),
          ns11: entry.ns11.toString(),
          // TODO: Remove TEST after testing ends
          address: entry.address,
          name: entry.organizationName,
          tin: entry.tin.toString(),
          count: entry.count.toString(),
        }).catch((e) => {
          console.error(e);
          return e.response;
        });
  
        if (result?.data && result?.data?.success) {
          await this.prisma.excavation.update({
            where: {
              id: entry.id,
            },
            data: {
              status: Status.SUCCESS,
            },
          });
        } else {
          console.log('TAX FAILED', result);
  
          await this.prisma.excavation.update({
            where: {
              id: entry.id,
            },
            data: {
              status: Status.ERROR,
              taxSystemError:
                result?.data?.text +
                  (result?.data?.data
                    ? "\n\nMa'lumot: " + stringifyIfObject(result.data.data)
                    : '') || '',
            },
          });
        }
      });
    }
  
    async getExcavations() {
      return this.prisma.excavation.findMany();
    }
  
    async getAll(pagination: PaginationParams) {
      const where: Prisma.ExcavationWhereInput = {};
  
      const count = await this.prisma.excavation.count({
        where,
      });
  
      const excavation = await this.prisma.excavation.findMany({
        ...getPagination(pagination),
        where,
        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            id: 'desc',
          },
        ],
      });
  
      return paginate(excavation, count);
    }
  
    async retrySendToTaxSystem(id: number) {
      const entry = await this.prisma.excavation.findUnique({
        where: {
          id: id,
        },
      });
  
      const result = await Tax.sendEntry({
        send_id: entry.id.toString(),
        send_date: formatSendDate(entry.date),
        ns10: entry.ns10.toString(),
        ns11: entry.ns11.toString(),
        // TODO: Remove TEST after testing ends
        address: entry.address,
        name: entry.organizationName,
        tin: entry.tin.toString(),
        count: entry.count.toString(),
      }).catch((e) => {
        console.error(e);
        return e.response;
      });
  
      if (result?.data && result?.data?.success) {
        await this.prisma.excavation.update({
          where: {
            id: entry.id,
          },
          data: {
            status: Status.SUCCESS,
          },
        });
  
        return {};
      } else {
        await this.prisma.excavation.update({
          where: {
            id: entry.id,
          },
          data: {
            status: Status.ERROR,
            taxSystemError: result?.data?.text || '',
          },
        });
  
        throw new PreconditionFailedException(
          'Action failed',
          ErrorCode.ACTION_FAILED,
        );
      }
    }
  }
  