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
  rowsRole: string;     // e.g. "Financial Statement Row"
  columnsRole: string;  // e.g. "Comparison Scenario (Actual vs Budget)"
  valuesRole: string;   // e.g. "Numeric Amount Measure"
  rows: PowerBIDataRow[];
}

export interface PowerBIVisualSettings {
  showTitle: boolean;
  titleText: string;
  titleBgColor?: string;
  titleTextColor?: string;
  accentColor: string;
  borderColor: string;
  backgroundColor: string;
  fontSize: number;
  showTooltip: boolean;
  enableAnimation: boolean;
  hideEmptyExpand: boolean;
  daxMeasures?: DAXMeasure[];
  enableRowVarianceFormatting?: boolean;
  enableRowHeatmap?: boolean;
  columnFormattingTarget?: "none" | "actual" | "budget" | "variance" | "variancePct";
  columnFormattingType?: "none" | "heatmap" | "databars" | "icons";
  positiveColor?: string;
  negativeColor?: string;
  selectedTheme?: "light" | "dark" | "slate" | "sepia";
  fontFamily?: "sans" | "display" | "mono" | "serif" | "segoe" | "aptos";
  rowPadding?: "compact" | "cozy" | "spacious";
  showGridLines?: boolean;
  highlightSubtotals?: boolean;
  showAccentBorders?: boolean;
  columnWidthMode?: "auto" | "fixed";
  columnWidthValue?: number;
  rowHeightMode?: "auto" | "fixed";
  rowHeightValue?: number;
  formatStyle?: "whole" | "thousand" | "million";
  showCommentary?: boolean;
  headerBgColor?: string;
  headerTextColor?: string;
  rowBgColor?: string;
  rowTextColor?: string;
  subtotalBgColor?: string;
  subtotalTextColor?: string;
  grandtotalBgColor?: string;
  grandtotalTextColor?: string;
  hoverBgColor?: string;
  gridLineColor?: string;
  // Power BI Custom Format pane elements
  enableDownloadAsExcel?: boolean;
  enableSorting?: boolean;
  enableVisualSearch?: boolean;
  showGroupExpand?: boolean;
  enableColumnExpansion?: boolean;
  // Row Expansion Formatting
  enableExpandedHighlight?: boolean;
  expandedParentBgColor?: string;
  expandedParentTextColor?: string;
  expandedChildBgColor?: string;
  expandedChildTextColor?: string;
  // DAX Conditional Formatting
  enableDaxCondFormatting?: boolean;
  daxCondFormatMode?: "rules" | "fieldValue";
  daxCondFieldValueTarget?: "background" | "font" | "both";
  daxCondMeasureId?: string;
  daxCondTarget?: "rows" | "columns" | "all";
  daxCondCondition?: "greater" | "less" | "between";
  daxCondValue1?: number;
  daxCondValue2?: number;
  daxCondBgColor?: string;
  daxCondTextColor?: string;
  customRules?: ConditionalFormattingRule[];
  fxSettings?: Record<string, FxConfig>;
  cfRules?: any[]; // Holds advanced multi-engine rules
}

export interface FxConfig {
  property: string;
  mode: "field-value" | "rules";
  measureId: string;
  operator?: "greater" | "less" | "equal";
  value?: string;
  resultValue?: string;
  fallbackValue?: string;
}

export interface ConditionalFormattingRule {
  id: string;
  target: string; // Allow flexible targets including custom row or standard columns
  operator: "greater" | "less" | "equal" | "contains" | "empty" | "between";
  value: string;
  bgColor: string;
  textColor: string;
  isBold?: boolean;
  useDax?: boolean;
  daxMeasureId?: string;
}

export interface DAXMeasure {
  id: string;
  name: string;
  formula: string;
  expressionType: "sum" | "avg" | "custom";
}
