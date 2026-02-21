import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import {
  NumberHandler,
  PROPERTY_TYPE_HANDLERS,
  PropertyTypeRegistry,
  TextHandler,
} from './types';

const handlers = [TextHandler, NumberHandler];

@Module({
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyTypeRegistry,
    ...handlers,
    {
      provide: PROPERTY_TYPE_HANDLERS,
      useFactory: (
        ...handlerInstances: InstanceType<(typeof handlers)[number]>[]
      ) => handlerInstances,
      inject: handlers,
    },
  ],
  exports: [PropertyService, PropertyTypeRegistry],
})
export class PropertyModule {}
