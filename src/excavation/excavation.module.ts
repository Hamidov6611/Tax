import { Module } from '@nestjs/common';
import { ExcavationController } from './excavation.controller';
import { ExcavationService } from './excavation.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ExcavationController],
  providers: [ExcavationService],
  imports: [PrismaModule],
})
export class ExcavationModule {}
