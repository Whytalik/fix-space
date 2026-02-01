import { Module } from '@nestjs/common';
import { PropertyValueService } from './property-value.service';
import { PropertyValueController } from './property-value.controller';

@Module({
  controllers: [PropertyValueController],
  providers: [PropertyValueService],
  exports: [PropertyValueService],
})
export class PropertyValueModule {}
