import { Module } from "@nestjs/common";
import { PropertyController } from "./property.controller";
import { PropertyRepository } from "./repositories/property.repository";
import { PropertyService } from "./property.service";
import {
  ButtonHandler,
  CheckboxHandler,
  DateHandler,
  DurationHandler,
  FormulaHandler,
  NumberHandler,
  PROPERTY_TYPE_HANDLERS,
  ProgressHandler,
  PropertyTypeRegistry,
  RatingHandler,
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
  DurationHandler,
  SelectHandler,
  StatusHandler,
  RelationHandler,
  FormulaHandler,
  RatingHandler,
  ProgressHandler,
  ButtonHandler,
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
