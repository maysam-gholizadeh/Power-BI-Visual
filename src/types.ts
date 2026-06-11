export interface VisualProjectFiles {
  "pbiviz.json": string;
  "capabilities.json": string;
  "src/visual.ts": string;
  "style/visual.less": string;
  "package.json": string;
  "tsconfig.json": string;
}

export type VisualTemplateType = "matrix";

export interface VisualTemplate {
  id: VisualTemplateType;
  name: string;
  description: string;
  icon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  files: VisualProjectFiles;
}

export interface PowerBIDataRow {
  category: string;
  value: number;
  secondaryValue?: number; // target or target measure
}

export interface PowerBIDataConfig {
  categoryRole: string; // e.g. "Category"
  measureRole: string; // e.g. "Values"
  secondaryMeasureRole?: string; // e.g. "Target"
  rows: PowerBIDataRow[];
}

export interface PowerBIVisualSettings {
  showTitle: boolean;
  titleText: string;
  accentColor: string;
  borderColor: string;
  backgroundColor: string;
  fontSize: number;
  showTooltip: boolean;
  enableAnimation: boolean;
  hideEmptyExpand: boolean;
  daxMeasures?: DAXMeasure[];
}

export interface DAXMeasure {
  id: string;
  name: string;
  formula: string;
  expressionType: "sum" | "avg" | "custom";
}
