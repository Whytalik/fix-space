import { Injectable } from "@nestjs/common";
import { PropertyType } from "@nucleus/domain";
import { PropertyTypeHandler } from "../handler.interface";

@Injectable()
export class CheckboxHandler implements PropertyTypeHandler {
  type: PropertyType;
  validate(value: unknown): boolean {
    throw new Error("Method not implemented.");
  }
  formatValue(value: unknown): unknown {
    throw new Error("Method not implemented.");
  }
  getDefaultValue(): unknown {
    throw new Error("Method not implemented.");
  }
}
