import type { FilterOperator } from "@fixspace/domain";

export interface PropertyQueryHandler {
  getFilterOperators(): FilterOperator[];
}
