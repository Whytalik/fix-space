import { Module } from "@nestjs/common";
import { PropertyController } from "./property.controller";
import { PropertyRepository } from "./repositories/property.repository";
import { PropertyService } from "./property.service";
import {
  CheckboxHandler,
  DateHandler,
  FormulaHandler,
  NumberHandler,
  PROPERTY_TYPE_HANDLERS,
  PropertyTypeRegistry,
  RelationHandler,
  SelectHandler,
  StatusHandler,
  TextHandler,
} from "./types";

const handlers = [
  TextHandler,
  NumberHandler,
  CheckboxHandler,
  DateHandler,
  SelectHandler,
  StatusHandler,
  RelationHandler,
  FormulaHandler,
];

@Module({
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyRepository,
    PropertyTypeRegistry,
    ...handlers,
    {
      provide: PROPERTY_TYPE_HANDLERS,
      useFactory: (...handlerInstances: InstanceType<(typeof handlers)[number]>[]) => handlerInstances,
      inject: handlers,
    },
  ],
  exports: [PropertyService, PropertyRepository, PropertyTypeRegistry],
})
export class PropertyModule {}
