import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MeController } from './me.controller';
import { MeService } from './me.service';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [PrismaModule],
})
export class MeModule {}
