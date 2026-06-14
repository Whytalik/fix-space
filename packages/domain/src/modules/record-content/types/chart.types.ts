export type ChartType = "line" | "bar" | "pie" | "radar" | "area" | "scatter";

export type ChartAggregate = "sum" | "avg" | "count" | "cumulative-sum";

export interface ChartRelationSource {
  type: "relation";
  relationField: string;
  xField: string;
  yField: string;
  aggregate?: ChartAggregate;
  groupBy?: string;
}

export interface ChartPropertiesSource {
  type: "record-properties";
  fields: string[];
}

export type ChartSource = ChartRelationSource | ChartPropertiesSource;

export interface ChartComponentData {
  chartType: ChartType;
  title?: string;
  source: ChartSource;
}
