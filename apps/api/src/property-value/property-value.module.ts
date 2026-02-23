import { Module } from '@nestjs/common';
import { PropertyModule } from '../property/property.module';
import { PropertyValueController } from './property-value.controller';
import { PropertyValueService } from './property-value.service';

@Module({
  imports: [PropertyModule],
  controllers: [PropertyValueController],
  providers: [PropertyValueService],
  exports: [PropertyValueService],
})
export class PropertyValueModule { }
