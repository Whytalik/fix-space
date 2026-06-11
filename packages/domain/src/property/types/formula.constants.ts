import { PropertyType } from "../property-type.enum";
import { FormulaType } from "./formula.types";

export const DEFAULT_FORMULA_PROPERTY = {
  type: FormulaType.CUSTOM,
  expression: "",
  resultType: PropertyType.TEXT,
  uiState: {},
};
