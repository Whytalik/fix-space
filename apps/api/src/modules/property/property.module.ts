import { Module, forwardRef } from "@nestjs/common";
import { ViewModule } from "@/modules/view/view.module";
import { DatabaseModule } from "@/modules/database/database.module";
import { PropertyController } from "./property.controller";
import { PropertyRepository } from "./repositories/property.repository";
import { PropertyService } from "./property.service";
import {
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
import { FormulaEngine } from "./types/formula/formula-engine.service";
import { FormulaRecalculator } from "./types/formula/formula-recalculator.service";

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
];

@Module({
  imports: [ViewModule, forwardRef(() => DatabaseModule)],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyRepository,
    PropertyTypeRegistry,
    FormulaEngine,
    FormulaRecalculator,
    ...handlers,
    {
      provide: PROPERTY_TYPE_HANDLERS,
      useFactory: (...handlerInstances: InstanceType<(typeof handlers)[number]>[]) => handlerInstances,
      inject: handlers,
    },
  ],
  exports: [PropertyService, PropertyRepository, PropertyTypeRegistry, FormulaEngine, FormulaRecalculator],
})
export class PropertyModule {}
