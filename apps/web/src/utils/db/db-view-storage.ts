import type { RecordFilterDto, RecordSortDto } from "@fixspace/domain";
import { FilterLogic } from "@fixspace/domain/enums";

const filtersKey = (id: string) => `db-filters:${id}`;
const sortsKey = (id: string) => `db-sorts:${id}`;
const logicKey = (id: string) => `db-filter-logic:${id}`;

export function loadFilters(id: string): RecordFilterDto[] {
  try {
    const raw = localStorage.getItem(filtersKey(id));
    return raw ? (JSON.parse(raw) as RecordFilterDto[]) : [];
  } catch {
    return [];
  }
}

export function saveFilters(id: string, filters: RecordFilterDto[]): void {
  try {
    if (filters.length === 0) {
      localStorage.removeItem(filtersKey(id));
    } else {
      localStorage.setItem(filtersKey(id), JSON.stringify(filters));
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

export function loadSorts(id: string): RecordSortDto[] {
  try {
    const raw = localStorage.getItem(sortsKey(id));
    return raw ? (JSON.parse(raw) as RecordSortDto[]) : [];
  } catch {
    return [];
  }
}

export function saveSorts(id: string, sorts: RecordSortDto[]): void {
  try {
    if (sorts.length === 0) {
      localStorage.removeItem(sortsKey(id));
    } else {
      localStorage.setItem(sortsKey(id), JSON.stringify(sorts));
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

export function loadFilterLogic(id: string): FilterLogic {
  try {
    const raw = localStorage.getItem(logicKey(id));
    return (raw as FilterLogic) ?? FilterLogic.AND;
  } catch {
    return FilterLogic.AND;
  }
}

export function saveFilterLogic(id: string, logic: FilterLogic): void {
  try {
    if (logic === FilterLogic.AND) {
      localStorage.removeItem(logicKey(id));
    } else {
      localStorage.setItem(logicKey(id), logic);
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

const wrapCellsKey = (id: string) => `db-wrap-cells:${id}`;

export function loadWrapCells(id: string): boolean {
  try {
    return localStorage.getItem(wrapCellsKey(id)) === "true";
  } catch {
    return false;
  }
}

export function saveWrapCells(id: string, wrap: boolean): void {
  try {
    if (!wrap) {
      localStorage.removeItem(wrapCellsKey(id));
    } else {
      localStorage.setItem(wrapCellsKey(id), "true");
    }
    // eslint-disable-next-line no-empty
  } catch {}
}
