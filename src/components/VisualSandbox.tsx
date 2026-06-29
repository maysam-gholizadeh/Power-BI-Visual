import React, { useRef, useState, useEffect } from "react";
import { PowerBIDataConfig, PowerBIVisualSettings, VisualProjectFiles, VisualTemplateType } from "../types";
import { evaluateCFFramework } from "../utils/conditionalFormatting";
import { motion } from "motion/react";
import { ShieldCheck, Play, RefreshCw, Layers, Sliders, CheckCircle2, AlertTriangle, Sparkles, Download, FileSpreadsheet, Maximize2, Minimize2, X, ChevronsUpDown, ChevronsDownUp, Hash, Coins, Banknote, Save, MessageSquarePlus, MessageSquare, Check, Pencil, Filter, ChevronRight, ChevronDown, Settings, HelpCircle, ArrowUp, ArrowDown, CornerDownRight, Database, Send, Trash2, Undo, Server, Globe } from "lucide-react";
import * as XLSX from "xlsx";

interface SandboxProps {
  files: VisualProjectFiles;
  templateId: VisualTemplateType;
  dataConfig: PowerBIDataConfig;
  settings: PowerBIVisualSettings;
}

// Helpers to resolve the active columns to show based on the Columns Field input
export function getActiveColumns(columnsRole: string, valuesRole: string = ""): { label: string; id: string; isNumeric: boolean }[] {
  const columnsStr = (columnsRole || "").trim();
  const valuesStr = (valuesRole || "").trim();

  const valueFields = valuesStr 
    ? valuesStr.split(",").map(s => s.trim()).filter(Boolean)
    : ["Actual", "Budget"];

  if (!columnsStr) {
    return valueFields.map((field, i) => ({
      label: field,
      id: i === 0 ? "actual" : i === 1 ? "budget" : `measure-${i}`,
      isNumeric: true
    }));
  }

  const lowerCol = columnsStr.toLowerCase();
  
  // Check if it matches default scenario
  if (lowerCol.includes("scenario") || lowerCol.includes("budget") || lowerCol.includes("actual")) {
    return [
      { label: "Actual", id: "actual", isNumeric: true },
      { label: "Budget", id: "budget", isNumeric: true },
      { label: "Variance ($)", id: "variance", isNumeric: true },
      { label: "Variance (%)", id: "variancePct", isNumeric: true }
    ];
  }

  let labels: string[] = [];
  if (lowerCol === "months" || lowerCol === "month" || lowerCol.includes("month")) {
    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  } else if (lowerCol === "quarter" || lowerCol === "quarters" || lowerCol.includes("quarter")) {
    labels = ["Q1", "Q2", "Q3", "Q4"];
  } else if (lowerCol === "year" || lowerCol === "years" || lowerCol.includes("year")) {
    labels = ["2024", "2025", "2026"];
  } else if (lowerCol === "region" || lowerCol === "regions" || lowerCol.includes("country") || lowerCol.includes("territory") || lowerCol.includes("region")) {
    labels = ["North", "South", "East", "West"];
  } else if (columnsStr.includes(",")) {
    labels = columnsStr.split(",").map(c => c.trim()).filter(Boolean);
  } else {
    labels = [columnsStr];
  }

  const cols = labels.map(lbl => ({
    label: lbl,
    id: lbl.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    isNumeric: true
  }));

  // Append a Total column
  cols.push({
    label: "Total",
    id: "total",
    isNumeric: true
  });

  return cols;
}

export function getColumnValue(
  row: { category?: string; cleanName: string; actual: number }, 
  colId: string, 
  colIndex: number, 
  totalColsCount: number
): number {
  if (colId === "total") {
    return row.actual;
  }
  
  const cat = (row.category || row.cleanName || "").trim().toLowerCase();
  const n = totalColsCount - 1; // number of columns excluding total
  if (n <= 0) return row.actual;

  let weights: number[] = [];
  
  if (n === 12) {
    // Months: Jan (0) to Dec (11)
    if (cat.includes("rent") || cat.includes("facilities") || cat.includes("depreciation") || cat.includes("amortization")) {
      weights = Array(12).fill(1 / 12);
    } else if (cat.includes("marketing")) {
      weights = [0.04, 0.05, 0.08, 0.08, 0.08, 0.06, 0.06, 0.07, 0.09, 0.11, 0.14, 0.14];
    } else if (cat.includes("service")) {
      weights = [0.08, 0.08, 0.081, 0.081, 0.082, 0.082, 0.083, 0.083, 0.084, 0.084, 0.085, 0.085];
    } else if (cat.includes("salaries") || cat.includes("labor") || cat.includes("operating")) {
      weights = [0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.109];
    } else {
      // Q4 Peak (Revenue, COGS, Sales, Net Income, etc.)
      weights = [0.06, 0.07, 0.08, 0.08, 0.08, 0.075, 0.065, 0.065, 0.085, 0.10, 0.11, 0.13];
    }
  } else if (n === 4) {
    // Quarters: Q1 (0) to Q4 (3)
    let mWeights: number[] = [];
    if (cat.includes("rent") || cat.includes("facilities") || cat.includes("depreciation") || cat.includes("amortization")) {
      mWeights = Array(12).fill(1 / 12);
    } else if (cat.includes("marketing")) {
      mWeights = [0.04, 0.05, 0.08, 0.08, 0.08, 0.06, 0.06, 0.07, 0.09, 0.11, 0.14, 0.14];
    } else if (cat.includes("service")) {
      mWeights = [0.08, 0.08, 0.081, 0.081, 0.082, 0.082, 0.083, 0.083, 0.084, 0.084, 0.085, 0.085];
    } else if (cat.includes("salaries") || cat.includes("labor") || cat.includes("operating")) {
      mWeights = [0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.081, 0.109];
    } else {
      mWeights = [0.06, 0.07, 0.08, 0.08, 0.08, 0.075, 0.065, 0.065, 0.085, 0.10, 0.11, 0.13];
    }
    weights = [
      mWeights[0] + mWeights[1] + mWeights[2],
      mWeights[3] + mWeights[4] + mWeights[5],
      mWeights[6] + mWeights[7] + mWeights[8],
      mWeights[9] + mWeights[10] + mWeights[11],
    ];
  } else if (n === 3) {
    // Years: 2024, 2025, 2026
    weights = [0.30, 0.33, 0.37];
  } else if (n === 2) {
    // Scenario columns / Budget vs Actual fallback
    weights = [0.55, 0.45];
  } else {
    // North, South, East, West or custom region list
    const hash = cat.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < n; i++) {
      weights.push(1 + 0.3 * Math.sin((hash + i) * 1.5) + 0.1 * Math.cos(i * 2.3));
    }
  }

  // Normalize weights
  const sumWeights = weights.reduce((sum, w) => sum + w, 0) || 1;
  const shares = weights.map(w => w / sumWeights);

  // Generate rounded values
  let sumVals = 0;
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    const val = Math.round(row.actual * shares[i]);
    values.push(val);
    sumVals += val;
  }

  // Correct rounding errors so sum is exactly row.actual
  const diff = row.actual - sumVals;
  if (diff !== 0 && values.length > 0) {
    values[values.length - 1] += diff;
  }

  return values[colIndex];
}

export const VisualSandbox: React.FC<SandboxProps> = ({
  files,
  templateId,
  dataConfig,
  settings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 420, height: 320 });
  const [logs, setLogs] = useState<string[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [collapsedRows, setCollapsedRows] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const lastParsedRowsRef = useRef<any[]>([]);

  // Power BI Drill Down / Hierarchy states
  const [isDrillDownMode, setIsDrillDownMode] = useState<boolean>(false);
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [nextLevelOnly, setNextLevelOnly] = useState<boolean>(false);
  const [showDrillTips, setShowDrillTips] = useState<boolean>(true);
  const [numberFormatStyle, setNumberFormatStyle] = useState<"whole" | "thousand" | "million">(() => {
    try {
      const saved = localStorage.getItem("pbi_number_format_style");
      return (saved as any) || "whole";
    } catch {
      return "whole";
    }
  });
  const [showLogs, setShowLogs] = useState(false);

  // User-facing presentation config states
  const [userFontType, setUserFontType] = useState<"sans" | "display" | "mono" | "serif" | "segoe" | "aptos">(() => {
    try {
      const saved = localStorage.getItem("pbi_user_font_family");
      return (saved as any) || "sans";
    } catch {
      return "sans";
    }
  });
  const [userFontSize, setUserFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("pbi_user_font_size");
      return saved ? parseInt(saved, 10) : (settings.fontSize || 11);
    } catch {
      return settings.fontSize || 11;
    }
  });
  const [userRowPadding, setUserRowPadding] = useState<"compact" | "cozy" | "spacious">(() => {
    try {
      const saved = localStorage.getItem("pbi_user_row_padding");
      return (saved as any) || "cozy";
    } catch {
      return "cozy";
    }
  });
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "slate" | "sepia">(() => {
    try {
      const saved = localStorage.getItem("pbi_selected_theme");
      return (saved as any) || "light";
    } catch {
      return "light";
    }
  });
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [visualSearchVal, setVisualSearchVal] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    const timer = window.setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  const evaluateDAX = (formula: string, actual: number, budget: number, rowContext?: any): any => {
    const cleaned = (formula || "").trim();
    if (!cleaned) return 0;

    // Pre-normalize common typos in LEFT/RIGHT/MID: Left[Account Code] -> LEFT([Account Code])
    let expr = cleaned
      .replace(/LEFT\s*\[([^\]]+)\]\s*,\s*([0-9]+)/gi, "LEFT([$1], $2)")
      .replace(/RIGHT\s*\[([^\]]+)\]\s*,\s*([0-9]+)/gi, "RIGHT([$1], $2)");

    let categoryName = "";
    if (rowContext) {
      categoryName = (rowContext.category || rowContext.cleanName || rowContext.name || "").trim();
    }
    
    let accountCode = categoryName;
    const leadingCodeMatch = categoryName.match(/^([0-9\.\-\/]+)/);
    if (leadingCodeMatch) {
      accountCode = leadingCodeMatch[1].trim();
    }

    const variance = actual - budget;
    const variancePct = budget !== 0 ? (variance / budget) * 100 : 0;

    // Perform substitutions of column bracket references
    expr = expr
      .replace(/\[Actual\]/gi, String(actual))
      .replace(/\[Sales\]/gi, String(actual))
      .replace(/\[Budget\]/gi, String(budget))
      .replace(/\[Variance\]/gi, String(variance))
      .replace(/\[Profit\]/gi, String(variance))
      .replace(/\[VariancePct\]/gi, String(variancePct))
      .replace(/\[Variance\s*%\]/gi, String(variancePct))
      .replace(/\[Account\s*Code\]/gi, JSON.stringify(accountCode))
      .replace(/\[AccountCode\]/gi, JSON.stringify(accountCode))
      .replace(/\[Code\]/gi, JSON.stringify(accountCode))
      .replace(/\[Account\]/gi, JSON.stringify(categoryName))
      .replace(/\[Category\]/gi, JSON.stringify(categoryName))
      .replace(/\[Name\]/gi, JSON.stringify(categoryName))
      .replace(/\[Description\]/gi, JSON.stringify(categoryName))
      .replace(/\[Account\s*Name\]/gi, JSON.stringify(categoryName))
      .replace(/\[AccountName\]/gi, JSON.stringify(categoryName));

    // Handle trivial static colors or formats
    if (/^["']?#[0-9A-Fa-f]{3,8}["']?$/.test(expr)) {
      return expr.replace(/["']/g, "");
    }
    if (/^["']?(red|green|blue|black|white|purple|yellow|orange|grey|gray)["']?$/i.test(expr)) {
      return expr.replace(/["']/g, "");
    }

    const evalMath = (mathExpr: string): any => {
      let trimmed = mathExpr.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
      }
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1);
      }
      if (/^#[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
        return trimmed;
      }
      
      let subExpr = trimmed;
      subExpr = subExpr.replace(/DIVIDE\s*\(([^,]+),([^)]+)\)/gi, "($1)/($2)");
      subExpr = subExpr.replace(/AVERAGE\s*\(([^,]+),([^)]+)\)/gi, "(($1)+($2))/2");
      subExpr = subExpr.replace(/SUM\s*\(([^,]+),([^)]+)\)/gi, "(($1)+($2))");

      // String manipulation function regex replacements inside evalMath:
      // 1. LEFT(str, len)
      subExpr = subExpr.replace(/LEFT\s*\(([^,]+),([^)]+)\)/gi, (match, s, len) => {
        const evaluatedStr = evalMath(s);
        const evaluatedLen = Number(evalMath(len)) || 0;
        return JSON.stringify(String(evaluatedStr).substring(0, evaluatedLen));
      });

      // 2. RIGHT(str, len)
      subExpr = subExpr.replace(/RIGHT\s*\(([^,]+),([^)]+)\)/gi, (match, s, len) => {
        const evaluatedStr = evalMath(s);
        const evaluatedLen = Number(evalMath(len)) || 0;
        const str = String(evaluatedStr);
        return JSON.stringify(str.substring(Math.max(0, str.length - evaluatedLen)));
      });

      // 3. MID(str, start, len)
      subExpr = subExpr.replace(/MID\s*\(([^,]+),([^,]+),([^)]+)\)/gi, (match, s, start, len) => {
        const evaluatedStr = evalMath(s);
        const evaluatedStart = Number(evalMath(start)) || 1;
        const evaluatedLen = Number(evalMath(len)) || 0;
        const str = String(evaluatedStr);
        const actualStart = Math.max(0, evaluatedStart - 1);
        return JSON.stringify(str.substring(actualStart, actualStart + evaluatedLen));
      });

      // 4. UPPER(str)
      subExpr = subExpr.replace(/UPPER\s*\(([^)]+)\)/gi, (match, s) => {
        return JSON.stringify(String(evalMath(s)).toUpperCase());
      });

      // 5. LOWER(str)
      subExpr = subExpr.replace(/LOWER\s*\(([^)]+)\)/gi, (match, s) => {
        return JSON.stringify(String(evalMath(s)).toLowerCase());
      });

      // 6. TRIM(str)
      subExpr = subExpr.replace(/TRIM\s*\(([^)]+)\)/gi, (match, s) => {
        return JSON.stringify(String(evalMath(s)).trim());
      });

      // 7. LEN(str)
      subExpr = subExpr.replace(/LEN\s*\(([^)]+)\)/gi, (match, s) => {
        return String(String(evalMath(s)).length);
      });

      // Replace single '=' with '==' and '<>' with '!=' for JS engine evaluation, except when inside Lookbehind
      let safeSubExpr = subExpr;
      safeSubExpr = safeSubExpr.replace(/(?<![<>=])=(?![=])/g, "==");
      safeSubExpr = safeSubExpr.replace(/<>/g, "!=");

      try {
        const result = new Function(`return (${safeSubExpr});`)();
        return result;
      } catch (err) {
        return trimmed;
      }
    };

    // Robust paren-aware IF evaluator
    while (true) {
      const ifMatch = expr.match(/IF\s*\(/i);
      if (!ifMatch) break;

      const startIdx = ifMatch.index!;
      const openParenIdx = startIdx + ifMatch[0].length - 1;
      
      // Find the matching closing parenthesis for this IF
      let parenDepth = 0;
      let closeParenIdx = -1;
      let insideQuotes = false;
      for (let j = openParenIdx; j < expr.length; j++) {
        const c = expr[j];
        if ((c === '"' || c === "'") && (j === 0 || expr.charCodeAt(j - 1) !== 92)) {
          insideQuotes = !insideQuotes;
        }
        if (!insideQuotes) {
          if (c === '(') parenDepth++;
          if (c === ')') {
            parenDepth--;
            if (parenDepth === 0) {
              closeParenIdx = j;
              break;
            }
          }
        }
      }

      if (closeParenIdx === -1) {
        break;
      }

      const fullMatch = expr.substring(startIdx, closeParenIdx + 1);
      const inner = expr.substring(openParenIdx + 1, closeParenIdx);

      // Split inner into arguments by comma, respecting paren depth and quotes
      const args: string[] = [];
      let temp = "";
      let depth = 0;
      let inQuotes = false;
      for (let k = 0; k < inner.length; k++) {
        const char = inner[k];
        if ((char === '"' || char === "'") && (k === 0 || inner.charCodeAt(k - 1) !== 92)) {
          inQuotes = !inQuotes;
        }
        if (char === ',' && depth === 0 && !inQuotes) {
          args.push(temp.trim());
          temp = "";
        } else {
          if (char === '(') depth++;
          if (char === ')') depth--;
          temp += char;
        }
      }
      args.push(temp.trim());

      if (args.length >= 2) {
        const cond = args[0];
        const trueValStr = args[1];
        const falseValStr = args[2] || '""';

        const condResult = !!evalMath(cond);
        const resolvedVal = condResult ? evalMath(trueValStr) : evalMath(falseValStr);
        const stringified = typeof resolvedVal === "string" ? `"${resolvedVal}"` : String(resolvedVal);
        
        expr = expr.substring(0, startIdx) + stringified + expr.substring(closeParenIdx + 1);
      } else {
        break;
      }
    }

    if (expr.toUpperCase().startsWith("SWITCH")) {
      const innerIdx = expr.indexOf("(");
      const lastIdx = expr.lastIndexOf(")");
      if (innerIdx !== -1 && lastIdx !== -1) {
        const inner = expr.substring(innerIdx + 1, lastIdx);
        const args: string[] = [];
        let temp = "";
        let depth = 0;
        let inQuotes = false;
        for (let i = 0; i < inner.length; i++) {
          const char = inner[i];
          if ((char === '"' || char === "'") && (i === 0 || inner.charCodeAt(i - 1) !== 92)) {
            inQuotes = !inQuotes;
          }
          if (char === ',' && depth === 0 && !inQuotes) {
            args.push(temp.trim());
            temp = "";
          } else {
            if (char === '(') depth++;
            if (char === ')') depth--;
            temp += char;
          }
        }
        args.push(temp.trim());

        if (args.length >= 3) {
          const switchVal = evalMath(args[0]);
          for (let i = 1; i < args.length - 1; i += 2) {
            const condVal = evalMath(args[i]);
            if (condVal === switchVal || (switchVal === true && condVal)) {
              return evalMath(args[i+1]);
            }
          }
          if (args.length % 2 === 0) {
            return evalMath(args[args.length - 1]);
          }
        }
      }
    }

    return evalMath(expr);
  };

  const resolveGeneralFxProperty = (property: string, defaultValue: string): string => {
    if (!settings.fxSettings) return defaultValue;
    const fxConfig = settings.fxSettings[property];
    if (!fxConfig || !fxConfig.measureId) return defaultValue;

    const measure = (settings.daxMeasures || []).find(m => m.id === fxConfig.measureId);
    if (!measure) return defaultValue;

    // Find grand total or count sum using component-wide ref list
    let totActual = 0;
    let totBudget = 0;
    const targetRows = lastParsedRowsRef.current && lastParsedRowsRef.current.length > 0
      ? lastParsedRowsRef.current
      : (dataConfig.rows || []);

    const grandTotalRow = targetRows.find((r: any) => r.isGrandTotal);
    if (grandTotalRow) {
      totActual = grandTotalRow.actual;
      totBudget = grandTotalRow.budget;
    } else {
      targetRows.forEach((r: any) => {
        if (!r.isSubtotal && !r.isGrandTotal) {
          totActual += r.actual || 0;
          totBudget += r.budget || 0;
        }
      });
    }

    const daxVal = evaluateDAX(measure.formula, totActual, totBudget);

    if (property === "titleText") {
      if (fxConfig.mode === "rules") {
        const op = fxConfig.operator || "greater";
        const compareVal = Number(fxConfig.value) || 0;
        let isMatch = false;

        if (op === "greater") {
          isMatch = daxVal > compareVal;
        } else if (op === "less") {
          isMatch = daxVal < compareVal;
        } else if (op === "equal") {
          isMatch = daxVal === compareVal;
        }

        if (isMatch) {
          return fxConfig.resultValue || `${settings.titleText || "Report"} (Target Met)`;
        } else {
          return fxConfig.fallbackValue || `${settings.titleText || "Report"} (Below Target)`;
        }
      } else {
        // Field value
        return `${settings.titleText || "Financial Matrix"} - ${measure.name}: $${Math.round(daxVal).toLocaleString()}`;
      }
    }

    // General handler for all color properties (accentColor, titleBgColor, titleTextColor, etc.)
    if (property === "accentColor" || property === "titleBgColor" || property === "titleTextColor") {
      if (fxConfig.mode === "rules" || fxConfig.mode === "field-value") {
        if (fxConfig.mode === "rules") {
          const op = fxConfig.operator || "greater";
          const compareVal = Number(fxConfig.value) || 0;
          let isMatch = false;

          if (op === "greater") {
            isMatch = daxVal > compareVal;
          } else if (op === "less") {
            isMatch = daxVal < compareVal;
          } else if (op === "equal") {
            isMatch = daxVal === compareVal;
          }

          return isMatch ? (fxConfig.resultValue || defaultValue) : (fxConfig.fallbackValue || defaultValue);
        } else {
          // Field-value formatting: If the evaluation result is a valid hex color, use it.
          if (typeof daxVal === "string" && (daxVal.startsWith("#") || /^[a-zA-Z]+$/.test(daxVal))) {
            return daxVal;
          }
          return daxVal > 0 ? (defaultValue || "#10b981") : (defaultValue || "#ef4444");
        }
      }
    }

    return defaultValue;
  };
  const [showCommentaryColumn, setShowCommentaryColumn] = useState(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("pbi_show_grid_lines");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [highlightSubtotals, setHighlightSubtotals] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("pbi_highlight_subtotals");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const [showAccentBorders, setShowAccentBorders] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("pbi_show_accent_borders");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const [columnWidthMode, setColumnWidthMode] = useState<"auto" | "fixed">(() => {
    try {
      const saved = localStorage.getItem("pbi_column_width_mode");
      return (saved as any) || "auto";
    } catch {
      return "auto";
    }
  });
  const [columnWidthValue, setColumnWidthValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("pbi_column_width_value");
      return saved ? parseInt(saved, 10) : 120;
    } catch {
      return 120;
    }
  });
  const [rowHeightMode, setRowHeightMode] = useState<"auto" | "fixed">(() => {
    try {
      const saved = localStorage.getItem("pbi_row_height_mode");
      return (saved as any) || "auto";
    } catch {
      return "auto";
    }
  });
  const [rowHeightValue, setRowHeightValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("pbi_row_height_value");
      return saved ? parseInt(saved, 10) : 36;
    } catch {
      return 36;
    }
  });

  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("pbi_user_font_family", userFontType);
      localStorage.setItem("pbi_user_font_size", String(userFontSize));
      localStorage.setItem("pbi_user_row_padding", userRowPadding);
      localStorage.setItem("pbi_selected_theme", selectedTheme);
      localStorage.setItem("pbi_show_grid_lines", String(showGridLines));
      localStorage.setItem("pbi_highlight_subtotals", String(highlightSubtotals));
      localStorage.setItem("pbi_show_accent_borders", String(showAccentBorders));
      localStorage.setItem("pbi_number_format_style", numberFormatStyle);
      localStorage.setItem("pbi_column_width_mode", columnWidthMode);
      localStorage.setItem("pbi_column_width_value", String(columnWidthValue));
      localStorage.setItem("pbi_row_height_mode", rowHeightMode);
      localStorage.setItem("pbi_row_height_value", String(rowHeightValue));

      setSettingsSaveSuccess(true);
      addLog("Design: Saved visual settings layout preferences permanently to local storage.");
      setTimeout(() => setSettingsSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save layout settings", err);
    }
  };

  const renderSettingsPopover = () => {
    if (!showSettingsPopover) return null;
    return (
      <div className={`absolute top-14 right-4 z-50 w-72 border rounded-xl shadow-2xl p-4 text-xs select-none transition-all duration-300 ${
        selectedTheme === "dark" ? "bg-[#0b0f19] border-slate-800 text-slate-100" :
        selectedTheme === "slate" ? "bg-slate-900 border-slate-705 text-slate-100" :
        selectedTheme === "sepia" ? "bg-[#faf6ee] border-[#ebdcb9] text-[#433422]" :
        "bg-white/95 backdrop-blur-md border-slate-200 text-slate-700"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-3 border-current/10">
          <div className="flex items-center gap-2">
            <Settings className="text-indigo-500 animate-spin" size={14} style={{ animationDuration: '5s' }} />
            <span className="font-bold tracking-tight text-[11px] uppercase">Format Options</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveSettings}
              className={`flex items-center justify-center p-1.5 rounded transition-all duration-350 cursor-pointer shadow-3xs ${
                settingsSaveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-750 hover:bg-indigo-700 text-white"
              }`}
              title="Save Settings"
            >
              {settingsSaveSuccess ? (
                <Check size={11} className="stroke-[3.5]" />
              ) : (
                <Save size={11} />
              )}
            </button>
            <button 
              onClick={() => setShowSettingsPopover(false)} 
              className="p-1 rounded-md hover:bg-current/10 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Theme Select */}
          <div>
            <label className="block text-[10px] font-semibold text-current/60 uppercase tracking-wider mb-1.5">Visual Active Theme</label>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg border border-current/10 bg-current/5">
              {(["light", "dark", "slate", "sepia"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTheme(t);
                    addLog(`Design: Changed visual grid theme preset to ${t}`);
                  }}
                  className={`py-1 rounded text-[10px] capitalize font-semibold transition-all cursor-pointer ${
                    selectedTheme === t
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-current/60 hover:text-current hover:bg-current/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Font Type Select */}
          <div>
            <label className="block text-[10px] font-semibold text-current/60 uppercase tracking-wider mb-1">Visual Font Family</label>
            <select
              value={userFontType}
              onChange={(e) => {
                setUserFontType(e.target.value as any);
                addLog(`Design: Adjusted grid visual style to ${e.target.value}`);
              }}
              className="w-full bg-current/5 border border-current/10 rounded-lg py-1 px-2 text-[11px] font-medium outline-none text-current"
            >
              <option className="text-slate-800 bg-white" value="sans">Inter (Sans)</option>
              <option className="text-slate-800 bg-white" value="display">Space Jakarta (Display)</option>
              <option className="text-slate-800 bg-white" value="mono">JetBrains (Mono)</option>
              <option className="text-slate-800 bg-white" value="serif">Georgia (Serif)</option>
              <option className="text-slate-800 bg-white" value="segoe">Segoe Condensed</option>
              <option className="text-slate-800 bg-white" value="aptos">Aptos</option>
            </select>
          </div>

          {/* Font Size Select */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-semibold text-current/60 uppercase tracking-wider">Canvas Font Size</label>
              <span className="font-mono text-[10px] px-1 bg-current/5 rounded font-bold text-indigo-500">{userFontSize}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="16"
              step="1"
              value={userFontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value, 10);
                setUserFontSize(size);
                addLog(`Design: Adjusted grid core font size to ${size}px`);
              }}
              className="w-full accent-indigo-600 bg-current/10 h-1 rounded-lg cursor-pointer animate-none"
            />
          </div>

          {/* Row Padding Selection */}
          <div>
            <label className="block text-[10px] font-semibold text-current/60 uppercase tracking-wider mb-1.5">Row Padding Height</label>
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg border border-current/10 bg-current/5">
              {(["compact", "cozy", "spacious"] as const).map((pad) => (
                <button
                  key={pad}
                  onClick={() => {
                    setUserRowPadding(pad);
                    addLog(`Design: Switched grid row height padding to ${pad}`);
                  }}
                  className={`py-1 rounded text-[10px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    userRowPadding === pad
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-current/60 hover:text-current hover:bg-current/5"
                  }`}
                >
                  {pad === "compact" ? "Dense" : pad === "cozy" ? "Cozy" : "Luxe"}
                </button>
              ))}
            </div>
          </div>

          {/* Number Scale Display Style */}
          <div>
            <label className="block text-[10px] font-semibold text-current/60 uppercase tracking-wider mb-1.5">Financial Number Scale</label>
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg border border-current/10 bg-current/5">
              {[
                { id: "whole", label: "Whole" },
                { id: "thousand", label: "K" },
                { id: "million", label: "M" }
              ].map((nm) => (
                <button
                  key={nm.id}
                  onClick={() => {
                    setNumberFormatStyle(nm.id as any);
                    addLog(`Scale changed to ${nm.label} numbers via settings.`);
                  }}
                  className={`py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    numberFormatStyle === nm.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-current/60 hover:text-current hover:bg-current/5"
                  }`}
                >
                  {nm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Custom Options Toggles */}
          <div className="border-t pt-2.5 border-current/10 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-current/70 text-[10.5px]">Show Cell Grid Lines</span>
              <input 
                type="checkbox"
                checked={showGridLines}
                onChange={(e) => {
                  setShowGridLines(e.target.checked);
                  addLog(`Design: ${e.target.checked ? "Enabled" : "Disabled"} table cell grid lines.`);
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-current/70 text-[10.5px]">Auto-Apply Subtotal Bolds</span>
              <input 
                type="checkbox"
                checked={highlightSubtotals}
                onChange={(e) => {
                  setHighlightSubtotals(e.target.checked);
                  addLog(`Design: ${e.target.checked ? "Enabled" : "Disabled"} subtotals bolds.`);
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-current/70 text-[10.5px]">Enable Left Accent Ribbon</span>
              <input 
                type="checkbox"
                checked={showAccentBorders}
                onChange={(e) => {
                  setShowAccentBorders(e.target.checked);
                  addLog(`Design: ${e.target.checked ? "Enabled" : "Disabled"} hierarchy left ribbon accents.`);
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
            </label>

            {/* Developer Column & Row sizing */}
            <div className="border-t pt-2 border-current/10 space-y-2 mt-1">
              <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Dev Layout Sizing</span>
              
              <div className="space-y-2">
                {/* Column Width */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-current/70 text-[10px]">Column Width Mode</span>
                    <span className="font-mono text-[9px] px-1 bg-current/5 rounded text-indigo-500 uppercase">{columnWidthMode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg border border-current/10 bg-current/5">
                    {(["auto", "fixed"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setColumnWidthMode(m);
                          addLog(`Design: Column width mode set to ${m}.`);
                        }}
                        className={`py-0.5 rounded text-[9px] capitalize font-semibold transition-all cursor-pointer ${
                          columnWidthMode === m
                            ? "bg-slate-900 text-white shadow-3xs"
                            : "text-current/60 hover:text-current hover:bg-current/5"
                        }`}
                      >
                        {m === "auto" ? "Auto-Fit" : "Fixed Width"}
                      </button>
                    ))}
                  </div>
                </div>

                 {columnWidthMode === "fixed" && (
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-current/60 text-[10px]">Width Value (px)</span>
                    <input
                      type="number"
                      min="10"
                      max="400"
                      value={columnWidthValue}
                      onChange={(e) => {
                        const val = Math.max(10, parseInt(e.target.value, 10) || 10);
                        setColumnWidthValue(val);
                      }}
                      className="w-20 bg-current/10 border border-current/10 rounded px-1.5 py-0.5 text-[10px] text-right font-medium outline-none text-current"
                    />
                  </div>
                )}

                {/* Row Height */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-current/70 text-[10px]">Row Height Mode</span>
                    <span className="font-mono text-[9px] px-1 bg-current/5 rounded text-indigo-500 uppercase">{rowHeightMode}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg border border-current/10 bg-current/5">
                    {(["auto", "fixed"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setRowHeightMode(m);
                          addLog(`Design: Row height mode set to ${m}.`);
                        }}
                        className={`py-0.5 rounded text-[9px] capitalize font-semibold transition-all cursor-pointer ${
                          rowHeightMode === m
                            ? "bg-slate-900 text-white shadow-3xs"
                            : "text-current/60 hover:text-current hover:bg-current/5"
                        }`}
                      >
                        {m === "auto" ? "Auto-Fit" : "Fixed Height"}
                      </button>
                    ))}
                  </div>
                </div>

                {rowHeightMode === "fixed" && (
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="text-current/60 text-[10px]">Height Value (px)</span>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={rowHeightValue}
                      onChange={(e) => {
                        const val = Math.max(10, parseInt(e.target.value, 10) || 10);
                        setRowHeightValue(val);
                      }}
                      className="w-20 bg-current/10 border border-current/10 rounded px-1.5 py-0.5 text-[10px] text-right font-medium outline-none text-current"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Conditional formatting interactive synchronization states
  const [rowVarianceHighlight, setRowVarianceHighlight] = useState(settings.enableRowVarianceFormatting || false);
  const [rowHeatmap, setRowHeatmap] = useState(settings.enableRowHeatmap || false);
  const [colTarget, setColTarget] = useState(settings.columnFormattingTarget || "none");
  const [colType, setColType] = useState(settings.columnFormattingType || "none");
  const [posColor, setPosColor] = useState(settings.positiveColor || "#10b981");
  const [negColor, setNegColor] = useState(settings.negativeColor || "#ef4444");

  useEffect(() => {
    setRowVarianceHighlight(settings.enableRowVarianceFormatting || false);
  }, [settings.enableRowVarianceFormatting]);

  useEffect(() => {
    setRowHeatmap(settings.enableRowHeatmap || false);
  }, [settings.enableRowHeatmap]);

  useEffect(() => {
    setColTarget(settings.columnFormattingTarget || "none");
  }, [settings.columnFormattingTarget]);

  useEffect(() => {
    setColType(settings.columnFormattingType || "none");
  }, [settings.columnFormattingType]);

  useEffect(() => {
    setPosColor(settings.positiveColor || "#10b981");
  }, [settings.positiveColor]);

  useEffect(() => {
    setNegColor(settings.negativeColor || "#ef4444");
  }, [settings.negativeColor]);

  useEffect(() => {
    if (settings.fontSize) {
      setUserFontSize(settings.fontSize);
    }
  }, [settings.fontSize]);

  useEffect(() => {
    if (settings.selectedTheme !== undefined) {
      setSelectedTheme(settings.selectedTheme);
    }
  }, [settings.selectedTheme]);

  useEffect(() => {
    if (settings.fontFamily !== undefined) {
      setUserFontType(settings.fontFamily);
    }
  }, [settings.fontFamily]);

  useEffect(() => {
    if (settings.rowPadding !== undefined) {
      setUserRowPadding(settings.rowPadding);
    }
  }, [settings.rowPadding]);

  useEffect(() => {
    if (settings.showGridLines !== undefined) {
      setShowGridLines(settings.showGridLines);
    }
  }, [settings.showGridLines]);

  useEffect(() => {
    if (settings.highlightSubtotals !== undefined) {
      setHighlightSubtotals(settings.highlightSubtotals);
    }
  }, [settings.highlightSubtotals]);

  useEffect(() => {
    if (settings.showAccentBorders !== undefined) {
      setShowAccentBorders(settings.showAccentBorders);
    }
  }, [settings.showAccentBorders]);

  useEffect(() => {
    if (settings.columnWidthMode !== undefined) {
      setColumnWidthMode(settings.columnWidthMode);
    }
  }, [settings.columnWidthMode]);

  useEffect(() => {
    if (settings.columnWidthValue !== undefined) {
      setColumnWidthValue(settings.columnWidthValue);
    }
  }, [settings.columnWidthValue]);

  useEffect(() => {
    if (settings.rowHeightMode !== undefined) {
      setRowHeightMode(settings.rowHeightMode);
    }
  }, [settings.rowHeightMode]);

  useEffect(() => {
    if (settings.rowHeightValue !== undefined) {
      setRowHeightValue(settings.rowHeightValue);
    }
  }, [settings.rowHeightValue]);

  useEffect(() => {
    if (settings.formatStyle !== undefined) {
      setNumberFormatStyle(settings.formatStyle as any);
    }
  }, [settings.formatStyle]);

  useEffect(() => {
    if (settings.showCommentary !== undefined) {
      setShowCommentaryColumn(settings.showCommentary);
    }
  }, [settings.showCommentary]);

  const getFontFamilyClass = () => {
    switch (userFontType) {
      case "display":
        return "font-display";
      case "mono":
        return "font-mono";
      case "serif":
        return "font-serif";
      case "segoe":
        return "font-segoe";
      case "aptos":
        return "font-aptos";
      default:
        return "font-sans";
    }
  };

  const getNameCellPaddingClass = () => {
    if (rowHeightMode === "fixed") {
      return "px-3.5";
    }
    switch (userRowPadding) {
      case "compact":
        return "py-1.5 px-3";
      case "spacious":
        return "py-4 px-5";
      default:
        return "py-2.5 px-3.5";
    }
  };

  const getValueCellPaddingClass = () => {
    if (rowHeightMode === "fixed") {
      return "px-3";
    }
    switch (userRowPadding) {
      case "compact":
        return "py-1.5 px-2.5";
      case "spacious":
        return "py-4 px-3.5";
      default:
        return "py-2.5 px-3";
    }
  };

  // Active interactive report filters
  const [filterSource, setFilterSource] = useState<string>("Actual");
  const [filterYear, setFilterYear] = useState<string>("2026");
  const [filterMonth, setFilterMonth] = useState<string>("Jun");
  const [filterCompany, setFilterCompany] = useState<string>("X");

  const [comments, setComments] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`pbi_matrix_comments_${templateId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [draftComments, setDraftComments] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`pbi_matrix_comments_${templateId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingCommentRowId, setEditingCommentRowId] = useState<string | null>(null);
  const [editingCommentValue, setEditingCommentValue] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Writeback & Dynamic Cell Overrides (Inforiver Spec)
  const [cellEdits, setCellEdits] = useState<Record<string, { actual?: number; budget?: number }>>(() => {
    try {
      const saved = localStorage.getItem(`pbi_matrix_celledits_${templateId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: "actual" | "budget" } | null>(null);
  const [editingCellValue, setEditingCellValue] = useState<string>("");
  const [writebackDestination, setWritebackDestination] = useState<"local" | "postgres" | "webhook">("local");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [showWritebackPanel, setShowWritebackPanel] = useState(false);
  const [isWritingBack, setIsWritingBack] = useState(false);
  const [writebackRecords, setWritebackRecords] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pbi_matrix_comments_${templateId}`);
      const initialComments = saved ? JSON.parse(saved) : {};
      setComments(initialComments);
      setDraftComments(initialComments);
    } catch {
      setComments({});
      setDraftComments({});
    }

    try {
      const savedEdits = localStorage.getItem(`pbi_matrix_celledits_${templateId}`);
      setCellEdits(savedEdits ? JSON.parse(savedEdits) : {});
    } catch {
      setCellEdits({});
    }

    setEditingCommentRowId(null);
    setEditingCommentValue("");
    setEditingCell(null);
    setSaveSuccess(false);

    // Fetch live writeback records from the central server registry
    fetch("/api/writebacks")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.history) {
          setWritebackRecords(data.history);
        }
      })
      .catch(err => console.error("Fail to load writeback logs:", err));
  }, [templateId]);

  const handleSaveAllComments = () => {
    try {
      localStorage.setItem(`pbi_matrix_comments_${templateId}`, JSON.stringify(draftComments));
      setComments(draftComments);
      setSaveSuccess(true);
      addLog("Saved all row commentary changes to local storage.");
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save comments", err);
    }
  };

  const handleCellEditSave = (rowId: string, colId: "actual" | "budget", value: number) => {
    const currentRows = lastParsedRowsRef.current || [];
    const targetRow = currentRows.find(r => r.id === rowId);
    if (!targetRow) {
      setEditingCell(null);
      return;
    }

    const hasChildren = currentRows.some(r => r.parentId === rowId);
    const updated = { ...cellEdits };

    const allocateDescendants = (id: string, col: "actual" | "budget", targetVal: number, editsObj: any) => {
      const children = currentRows.filter(r => r.parentId === id);
      if (children.length === 0) {
        if (!editsObj[id]) editsObj[id] = {};
        editsObj[id][col] = targetVal;
        return;
      }

      const getActiveVal = (childId: string) => {
        if (editsObj[childId] && editsObj[childId][col] !== undefined) {
          return editsObj[childId][col];
        }
        const childRow = currentRows.find(r => r.id === childId);
        return childRow ? childRow[col] : 0;
      };

      const childrenVals = children.map(c => ({ id: c.id, value: getActiveVal(c.id) }));
      const sumChildren = childrenVals.reduce((acc, cv) => acc + cv.value, 0);

      const allocatedVals: Record<string, number> = {};

      if (sumChildren !== 0) {
        const ratio = targetVal / sumChildren;
        let sumAllocated = 0;
        childrenVals.forEach((c, i) => {
          if (i === childrenVals.length - 1) {
            allocatedVals[c.id] = targetVal - sumAllocated;
          } else {
            const share = Math.round(c.value * ratio);
            allocatedVals[c.id] = share;
            sumAllocated += share;
          }
        });
      } else {
        let sumAllocated = 0;
        childrenVals.forEach((c, i) => {
          if (i === childrenVals.length - 1) {
            allocatedVals[c.id] = targetVal - sumAllocated;
          } else {
            const share = Math.round(targetVal / children.length);
            allocatedVals[c.id] = share;
            sumAllocated += share;
          }
        });
      }

      children.forEach(c => {
        allocateDescendants(c.id, col, allocatedVals[c.id], editsObj);
      });

      if (editsObj[id]) {
        delete editsObj[id][col];
        if (Object.keys(editsObj[id]).length === 0) {
          delete editsObj[id];
        }
      }
    };

    if (hasChildren) {
      allocateDescendants(rowId, colId, value, updated);
      addLog(`Proportional Allocation triggered! Distributed new parent subtotal ${value} on column "${colId}" down to descendants of "${rowId}".`);
      showToast("Distributed and allocated parent values down to children.");
    } else {
      if (!updated[rowId]) updated[rowId] = {};
      updated[rowId][colId] = value;
      addLog(`Applied direct cell override on leaf row: "${rowId}" | Column: "${colId}" set to ${value}`);
      showToast("Override recorded! Subtotals will recalculate.");
    }

    setCellEdits(updated);
    try {
      localStorage.setItem(`pbi_matrix_celledits_${templateId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingCell(null);
  };

  const handleResetAllEdits = () => {
    setCellEdits({});
    try {
      localStorage.removeItem(`pbi_matrix_celledits_${templateId}`);
    } catch {}
    addLog("Cleared all manual writeback and numerical overrides.");
    showToast("Cleared all cell overrides.");
  };

  const executeServerWriteback = async () => {
    setIsWritingBack(true);
    addLog(`Initiating writeback process. Target: ${writebackDestination.toUpperCase()}`);
    
    const payload = {
      templateId,
      destination: writebackDestination,
      webhookUrl: writebackDestination === "webhook" ? webhookUrl : undefined,
      timestamp: new Date().toISOString(),
      user: "M.GHolizadeh.Gtb@gmail.com",
      filters: {
        source: filterSource,
        year: filterYear,
        month: filterMonth,
        company: filterCompany
      },
      edits: cellEdits,
      commentaries: draftComments,
      auditedRowsList: lastParsedRowsRef.current?.map(r => ({
        id: r.id,
        categoryName: r.cleanName,
        level: r.level,
        finalActual: r.actual,
        finalBudget: r.budget,
        rowComment: draftComments[r.id] || ""
      })) || []
    };

    try {
      const response = await fetch("/api/writeback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          destination: writebackDestination,
          edits: cellEdits,
          payload
        })
      });

      if (!response.ok) {
        throw new Error(`Writeback server returned bad status: ${response.status}`);
      }

      const resData = await response.json();
      
      if (writebackDestination === "webhook" && webhookUrl) {
        try {
          addLog(`Forwarding HTTP POST trigger payload to external webhook: [${webhookUrl}]...`);
          await fetch("/api/writeback-forward", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUrl: webhookUrl, payload })
          });
          addLog("External Webhook proxy triggered successfully.");
        } catch (webhookErr: any) {
          addLog(`External Webhook dispatch warning: ${webhookErr.message || webhookErr}`);
        }
      }

      if (resData.success) {
        setWritebackRecords(prev => [resData.record, ...prev]);
        addLog(`Writeback SUCCESS: Saved and registered edit payload (ID: ${resData.record.id}).`);
        showToast("Writeback successfully completed!");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Writeback ERROR: Failed to communicate edit payload. ${err.message || err}`);
      showToast("Writeback execution failed.");
    } finally {
      setIsWritingBack(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(comments) !== JSON.stringify(draftComments) || Object.keys(cellEdits).length > 0;

  const expandAllRows = () => {
    setCollapsedRows({});
    addLog("Expanded all matrix hierarchy levels.");
  };

  const collapseAllRows = () => {
    const allParentIds: Record<string, boolean> = {};
    const previousParentIdByLevel: string[] = [];
    
    dataConfig.rows.forEach(row => {
      const rawCat = row.category;
      const leadingSpaces = rawCat.match(/^\s*/);
      const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
      const cleanName = rawCat.trim();
      const id = cleanName.toLowerCase().replace(/\s+/g, "-");
      previousParentIdByLevel[level] = id;
      const parentId = level > 0 ? previousParentIdByLevel[level - 1] : null;

      if (parentId) {
        allParentIds[parentId] = true;
      }
    });

    setCollapsedRows(allParentIds);
    addLog("Collapsed all matrix hierarchy levels.");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setCollapsedRows({});
    setIsDrillDownMode(false);
    setDrillPath([]);
    setNextLevelOnly(false);
  }, [templateId]);

  // Life-cycle Logger helper
  const addLog = (message: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  // Resize boundaries
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(e.clientX - rect.left, 240);
      const newHeight = Math.max(e.clientY - rect.top, 180);
      setViewport({
        width: Math.min(newWidth, 750),
        height: Math.min(newHeight, 550)
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        addLog("Viewport resized. update(options) executed by Power BI Host.");
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Simulate Power BI construction & update life-cycle logs
  useEffect(() => {
    addLog(`constructor(options) called. Host bound for ${templateId.toUpperCase()}`);
  }, [templateId]);

  useEffect(() => {
    const rowCount = dataConfig.rows.length;
    addLog(
      `update(options) called. dataView parsed successfully. Bindings: { Rows: "${dataConfig.rowsRole}", Columns: "${dataConfig.columnsRole}", Values: "${dataConfig.valuesRole}" } with ${rowCount} rows.`
    );
  }, [dataConfig, templateId, settings]);

  const handleExportToExcel = () => {
    // Read from the precompiled, highly precise list of rows matching the visualization exactly!
    const rowsToExport = lastParsedRowsRef.current.length > 0 
      ? lastParsedRowsRef.current 
      : [];

    if (rowsToExport.length === 0) {
      showToast("No data available to export yet. Please generate or modify the matrix first.");
      return;
    }

    const daxMeasures = settings.daxMeasures || [];
    const excelColsList = getActiveColumns(dataConfig.columnsRole, dataConfig.valuesRole);
    const isDefaultScen = !dataConfig.columnsRole || 
      dataConfig.columnsRole.toLowerCase().includes("scenario") || 
      dataConfig.columnsRole.toLowerCase().includes("budget") || 
      dataConfig.columnsRole.toLowerCase().includes("actual");

    // Process title cleanly with 0-9 typo fix
    const titleClean = (settings.titleText || "Financial_Statement")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/gi, "_");
    const downloadFilename = `${titleClean}_export.xlsx`;

    addLog(`Compiling genuine worksheet structure in-memory via SheetJS (xlsx)...`);

    // Build the 2D Array Sheet Data
    const aoaData: any[][] = [];

    // Filter Headers (professional Financial report context)
    aoaData.push(["Profitbase Financial Matrix Report - Direct Excel Export"]);
    aoaData.push([`Exported on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
    aoaData.push([`Slicer Details:`]);
    aoaData.push([`  Source: ${filterSource || "All"}`, `  Year: ${filterYear || "All"}`, `  Month: ${filterMonth || "All"}`, `  Company: ${filterCompany || "All"}`]);
    aoaData.push([]); // Padding row

    // Table Column Headers
    const headers: string[] = ["Accounts (Hierarchy)"];
    excelColsList.forEach(col => {
      headers.push(col.label);
    });
    if (isDefaultScen) {
      daxMeasures.forEach(m => {
        headers.push(m.name);
      });
    }
    headers.push("Row Commentary");
    aoaData.push(headers);

    // Populate data records
    rowsToExport.forEach((row) => {
      if (!row.visible) return; // Keep same expand state visual representation

      const record: any[] = [];
      const spacePrefix = "  ".repeat(row.level);
      record.push(spacePrefix + row.cleanName);

      excelColsList.forEach((col, cIdx) => {
        if (isDefaultScen) {
          if (col.id === "actual") {
            record.push(row.actual);
          } else if (col.id === "budget") {
            record.push(row.budget);
          } else if (col.id === "variance") {
            record.push(row.actual - row.budget);
          } else if (col.id === "variancePct") {
            const varianceVal = row.actual - row.budget;
            const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;
            record.push(Number(variancePct.toFixed(1)));
          }
        } else {
          const cellVal = getColumnValue(row, col.id, cIdx, excelColsList.length);
          record.push(cellVal);
        }
      });

      if (isDefaultScen) {
        daxMeasures.forEach((m) => {
          const daxVal = evaluateDAX(m.formula, row.actual, row.budget, row);
          const parsedNum = Number(daxVal);
          record.push(isNaN(parsedNum) ? daxVal : parsedNum);
        });
      }

      record.push(draftComments[row.id] || "");
      aoaData.push(record);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoaData);
    const visibleRowsToExport = rowsToExport.filter((r) => r.visible);

    // Apply auto column-width for neat cell wrapping
    const colWidths = aoaData.reduce((widths, row) => {
      row.forEach((val, i) => {
        const strLen = String(val ?? "").length;
        widths[i] = Math.max(widths[i] || 10, strLen + 2);
      });
      return widths;
    }, [] as number[]);
    worksheet["!cols"] = colWidths.map(w => ({ wch: w }));

    // Apply standard number formatting to numeric cells
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
    for (let r = range.s.r; r <= range.e.r; ++r) {
      for (let c = range.s.c; c <= range.e.c; ++c) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellRef];
        if (!cell) continue;

        // Skip header rows for number formatting
        if (r < 6) continue;

        const rowObj = visibleRowsToExport[r - 6];
        if (rowObj) {
          const isFirstCol = c === 0;
          const isLastCol = c === range.e.c;
          const isNumericCol = !isFirstCol && !isLastCol;

          // Standard Number formats (Supported natively in SheetJS Community Edition)
          if (isNumericCol && typeof cell.v === "number") {
            const colHeader = headers[c] || "";
            const colHeaderLower = colHeader.toLowerCase();

            if (colHeaderLower.includes("%") || colHeaderLower.includes("pct") || colHeaderLower.includes("percentage") || colHeaderLower.includes("variance (%)")) {
              cell.t = "n";
              cell.z = `0.0"%"`; // Displays values like 15.4 as 15.4% nicely
            } else if (colHeaderLower.includes("variance") || colHeaderLower.includes("var")) {
              cell.t = "n";
              cell.z = `+$#,##0;-$#,##0;0`;
            } else {
              cell.t = "n";
              cell.z = `$#,##0;($#,##0);"-"`;
            }
          }
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "P&L Matrix Report");

    try {
      addLog(`Initiating direct client-side export of "${downloadFilename}"...`);
      // Write workbook as binary array (not base64 directly to avoid format corruption issues)
      const wbOut = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;

      // Convert ArrayBuffer to binary string
      const uint8Array = new Uint8Array(wbOut);
      let binaryStr = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binaryStr += String.fromCharCode(uint8Array[i]);
      }

      // Build base64 from actual binary bytes
      const excelBase64 = btoa(binaryStr);
      const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
      
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addLog(`Direct browser download completed successfully via Data URI.`);
      showToast("Spreadsheet compiled and downloaded as XLSX!");
    } catch (err) {
      console.warn("Data URI export failed, attempting standard Blob fallback:", err);
      try {
        const rawArray = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
        const blob = new Blob([rawArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addLog(`Direct browser download completed successfully via direct Blob URL fallback.`);
        showToast("Spreadsheet compiled and downloaded as XLSX!");
      } catch (fbErr) {
        console.error("Direct client Excel download completely failed:", fbErr);
        showToast("Excel download failed.");
      }
    }
  };

  // Dynamic D3-style parsing from direct files to showcase visual alignment
  const extractValueFromTS = (regex: RegExp, defaultValue: string): string => {
    try {
      const code = files["src/visual.ts"];
      const match = code.match(regex);
      if (match && match[1]) {
        return match[1].replace(/['"`]/g, "").trim();
      }
    } catch {}
    return defaultValue;
  };

  // Extract variables out of visual.ts or style/visual.less to simulate active rendering!
  const strokeColor = extractValueFromTS(/stroke",\s*(['"`].*?['"`])/, "#1e3a8a");
  const barColor = extractValueFromTS(/fill",\s*(['"`].*?['"`])/, settings.accentColor);
  const candyColor = extractValueFromTS(/fill",\s*(['"`]#?[a-zA-Z0-9]+['"`])/, "#f43f5e");

  // Render high-fidelity SVG according to template specifications
  const renderInteractiveVisual = () => {
    const { width, height } = viewport;
    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2.5;

    if (chartW <= 0 || chartH <= 0) return null;

    if (templateId === "kpi") {
      const radius = Math.min(width, height) / 2.7;
      const val = dataConfig.rows[0]?.value ?? 0;
      const label = dataConfig.rows[0]?.category ?? "Selected Key metric";

      return (
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {/* Main Circle */}
          <circle
            cx={0}
            cy={0}
            r={radius}
            fill={settings.backgroundColor === "transparent" ? settings.accentColor : settings.backgroundColor}
            stroke={strokeColor || "#1e3b8a"}
            strokeWidth={settings.showTitle ? 3 : 1.5}
            className="transition-all duration-300 shadow-md"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
          />
          {/* Primary value */}
          <text
            x={0}
            y={5}
            textAnchor="middle"
            fill="#ffffff"
            fontWeight="bold"
            fontSize={`${radius * 0.35}px`}
            className="font-sans"
          >
            {val.toLocaleString()}
          </text>
          {/* Sub category label */}
          <text
            x={0}
            y={radius * 0.45}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.85)"
            fontSize={`${radius * 0.16}px`}
            fontWeight="500"
            className="font-sans uppercase tracking-wider"
          >
            {label}
          </text>
        </g>
      );
    }

    if (templateId === "bar") {
      const maxVal = Math.max(...dataConfig.rows.map((r) => r.value), 10);
      const colWidth = chartW / dataConfig.rows.length;
      const innerGap = colWidth * 0.25;
      const barW = colWidth - innerGap;

      return (
        <g transform={`translate(${padding * 1.2}, ${padding})`}>
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const yPos = chartH * (1 - ratio);
            return (
              <line
                key={idx}
                x1={0}
                y1={yPos}
                x2={chartW}
                y2={yPos}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Bars */}
          {dataConfig.rows.map((row, idx) => {
            const colX = idx * colWidth + innerGap / 2;
            const barH = (row.value / maxVal) * chartH;
            const barY = chartH - barH;

            return (
              <g key={idx} className="group">
                {/* Simulated bar element */}
                <rect
                  x={colX}
                  y={barY}
                  width={barW}
                  height={barH}
                  fill={barColor}
                  rx={6}
                  className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                />

                {/* Animated value labels on bars */}
                <text
                  x={colX + barW / 2}
                  y={barY - 8}
                  textAnchor="middle"
                  fill="#1e293b"
                  fontWeight="600"
                  fontSize="11px"
                  className="font-sans opacity-95"
                >
                  {row.value.toLocaleString()}
                </text>

                {/* Category label */}
                <text
                  x={colX + barW / 2}
                  y={chartH + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="11px"
                  fontWeight="500"
                  className="font-sans"
                >
                  {row.category}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    if (templateId === "gauge") {
      const actual = dataConfig.rows[0]?.value ?? 0;
      const target = dataConfig.rows[0]?.secondaryValue ?? 100;
      const percentage = Math.min((actual / target) * 100, 100);

      const r = Math.min(width, height) / 2.3;
      const center = { x: width / 2, y: height / 2 + 10 };

      // Convert percentage to arc polar path coordinates (semi circle -135 to +135 deg)
      const valueAngle = -135 + (270 * percentage) / 100;

      const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
          x: cx + radius * Math.cos(angleInRadians),
          y: cy + radius * Math.sin(angleInRadians),
        };
      };

      const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
          "M", start.x, start.y,
          "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
      };

      const bgArc = describeArc(center.x, center.y, r, -135, 135);
      const valArc = describeArc(center.x, center.y, r, -135, valueAngle);

      return (
        <g>
          {/* Base gauge track */}
          <path
            d={bgArc}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={r * 0.16}
            strokeLinecap="round"
          />

          {/* Colored progress sector */}
          <path
            d={valArc}
            fill="none"
            stroke={settings.accentColor === "#3b82f6" ? "#10b981" : settings.accentColor}
            strokeWidth={r * 0.16}
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Value Display */}
          <text
            x={center.x}
            y={center.y - r * 0.05}
            textAnchor="middle"
            fill="#0f172a"
            fontWeight="800"
            fontSize={`${r * 0.28}px`}
            className="font-sans"
          >
            {percentage.toFixed(0)}%
          </text>

          {/* Subtext mapping actual vs target */}
          <text
            x={center.x}
            y={center.y + r * 0.2}
            textAnchor="middle"
            fill="#64748b"
            fontWeight="500"
            fontSize={`${r * 0.12}px`}
            className="font-sans"
          >
            {actual.toLocaleString()} / {target.toLocaleString()} target
          </text>
        </g>
      );
    }

    if (templateId === "lollipop") {
      const maxVal = Math.max(...dataConfig.rows.map((r) => r.value), 10);
      const rowHeight = chartH / dataConfig.rows.length;

      return (
        <g transform={`translate(${padding * 1.6}, ${padding})`}>
          {dataConfig.rows.map((row, idx) => {
            const rY = idx * rowHeight + rowHeight / 2;
            const rX = (row.value / maxVal) * chartW;

            return (
              <g key={idx}>
                {/* Horizontal connection line */}
                <line
                  x1={0}
                  y1={rY}
                  x2={rX}
                  y2={rY}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="3,3"
                />

                {/* Candy head circle */}
                <circle
                  cx={rX}
                  cy={rY}
                  r={7}
                  fill={candyColor}
                  stroke="#9f1239"
                  strokeWidth={1.5}
                  className="transition-all duration-200 hover:scale-125 cursor-pointer"
                />

                {/* Y Axis Label */}
                <text
                  x={-15}
                  y={rY + 4}
                  textAnchor="end"
                  fill="#475569"
                  fontSize="11px"
                  fontWeight="600"
                  className="font-sans"
                >
                  {row.category}
                </text>

                {/* Value marker text */}
                <text
                  x={rX + 15}
                  y={rY + 4}
                  fill="#1e293b"
                  fontSize="11px"
                  fontWeight="500"
                  className="font-mono"
                >
                  {row.value.toLocaleString()}
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    if (templateId === "radar") {
      // Draw standard 5-axis radial star web
      const maxVal = 100;
      const numAxes = dataConfig.rows.length;
      const r = Math.min(width, height) / 2.3;
      const center = { x: width / 2, y: height / 2 };

      const angleStep = (2 * Math.PI) / numAxes;

      // Draw level polygon paths
      const numLevels = 4;
      const polygons = Array.from({ length: numLevels }, (_, levelIdx) => {
        const levelRadius = r * ((levelIdx + 1) / numLevels);
        const points = dataConfig.rows.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center.x + levelRadius * Math.cos(angle);
          const y = center.y + levelRadius * Math.sin(angle);
          return `${x},${y}`;
        });
        return points.join(" ");
      });

      // Data coordinates for actual scores
      const dataPoints = dataConfig.rows.map((row, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const boundedVal = Math.min(row.value, maxVal);
        const dataR = r * (boundedVal / maxVal);
        const x = center.x + dataR * Math.cos(angle);
        const y = center.y + dataR * Math.sin(angle);
        return { x, y, category: row.category, value: row.value };
      });

      const scorePolygonStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

      return (
        <g>
          {/* Circular/Concentric level frames */}
          {polygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          ))}

          {/* Spikes / Axes */}
          {dataConfig.rows.map((row, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const ax = center.x + r * Math.cos(angle);
            const ay = center.y + r * Math.sin(angle);
            const labelX = center.x + (r + 18) * Math.cos(angle);
            const labelY = center.y + (r + 14) * Math.sin(angle);

            return (
              <g key={i}>
                <line
                  x1={center.x}
                  y1={center.y}
                  x2={ax}
                  y2={ay}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={Math.cos(angle) > 0.1 ? "start" : Math.cos(angle) < -0.1 ? "end" : "middle"}
                  fill="#475569"
                  fontSize="10px"
                  fontWeight="600"
                  className="font-sans"
                >
                  {row.category}
                </text>
              </g>
            );
          })}

          {/* Primary data shape */}
          <polygon
            points={scorePolygonStr}
            fill="#06b6d4"
            fillOpacity={0.25}
            stroke="#0891b2"
            strokeWidth={2.5}
            className="transition-all duration-300"
          />

          {/* Vertex Dots */}
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#0891b2"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          ))}
        </g>
      );
    }

    return null;
  };

  const renderMatrixVisualHTML = () => {
    if (!dataConfig.rowsRole || !dataConfig.valuesRole || dataConfig.rows.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-transparent min-h-[300px]" id="empty-visual-blank-state">
          {/* Completely blank visual container as requested when no roles mapped */}
        </div>
      );
    }

    const evaluateCustomRule = (
      colId: string, 
      cellVal: string | number, 
      rowName: string,
      rule: any,
      rowActual?: number,
      rowBudget?: number
    ): { matchBg?: string, matchText?: string, matchBold?: boolean } => {
      const isTargetMatch = 
        (rule.target === "row-header" && colId === "name") ||
        (rule.target === "row") ||
        (rule.target === colId);

      if (!isTargetMatch) return {};

      let isMatch = false;

      if ((rule.target === "row-header" || rule.target === "row") && !rule.useDax) {
        const textVal = String(rowName).toLowerCase().trim();
        const ruleVal = String(rule.value || "").toLowerCase().trim();
        if (rule.operator === "contains") {
          isMatch = textVal.includes(ruleVal);
        } else if (rule.operator === "equal") {
          isMatch = textVal === ruleVal;
        } else if (rule.operator === "empty") {
          isMatch = textVal === "";
        }
      } else {
        let numVal = Number(cellVal);
        if (rule.useDax && rule.daxMeasureId) {
          const measure = (settings.daxMeasures || []).find((m: any) => m.id === rule.daxMeasureId);
          if (measure) {
            numVal = evaluateDAX(measure.formula, rowActual ?? 0, rowBudget ?? 0, { category: rowName, actual: rowActual, budget: rowBudget });
          }
        }
        const ruleNum = Number(rule.value) || 0;
        if (rule.operator === "greater") {
          isMatch = numVal > ruleNum;
        } else if (rule.operator === "less") {
          isMatch = numVal < ruleNum;
        } else if (rule.operator === "equal") {
          isMatch = numVal === ruleNum;
        }
      }

      if (isMatch) {
         return {
           matchBg: rule.bgColor,
           matchText: rule.textColor,
           matchBold: rule.isBold
         };
      }

      return {};
    };

    const getFxStyleValue = (property: string, row: any, defaultValue: string): string => {
      if (!settings.fxSettings) return defaultValue;
      const fxConfig = settings.fxSettings[property];
      if (!fxConfig || !fxConfig.measureId) return defaultValue;

      const measure = (settings.daxMeasures || []).find(m => m.id === fxConfig.measureId);
      if (!measure) return defaultValue;

      const daxVal = evaluateDAX(measure.formula, row.actual, row.budget, row);

      if (fxConfig.mode === "rules") {
        const op = fxConfig.operator || "greater";
        const compareVal = Number(fxConfig.value) || 0;
        let isMatch = false;

        if (op === "greater") {
          isMatch = daxVal > compareVal;
        } else if (op === "less") {
          isMatch = daxVal < compareVal;
        } else if (op === "equal") {
          isMatch = daxVal === compareVal;
        }

        if (isMatch) {
          return fxConfig.resultValue || defaultValue;
        } else {
          return fxConfig.fallbackValue || defaultValue;
        }
      } else {
        // Field value mode - sign-based color mapping
        if (daxVal > 0) {
          return fxConfig.resultValue || "#10b981";
        } else if (daxVal < 0) {
          return fxConfig.fallbackValue || "#ef4444";
        }
        return defaultValue;
      }
    };

    const rowsFieldLevels = dataConfig.rowsRole
      ? dataConfig.rowsRole.split(",").map(s => s.trim()).filter(Boolean)
      : ["Row Dimension"];

    // Parse the dataConfig rows with dynamic multi-level drill-down mock generator
    const parsedRows: Array<{
      cleanName: string;
      level: number;
      actual: number;
      budget: number;
      isSubtotal: boolean;
      isGrandTotal: boolean;
      visible: boolean;
      collapsed: boolean;
      parentId: string | null;
      id: string;
    }> = [];

    const rawRowsList = [...dataConfig.rows];

    // Build lists with calculated clean names and depths
    const initialRows = rawRowsList.map((row, index) => {
      const rawCat = row.category;
      const leadingSpaces = rawCat.match(/^\s*/);
      const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
      return {
        category: rawCat.trim(),
        level,
        value: row.value,
        secondaryValue: row.secondaryValue ?? 0,
        originalIndex: index
      };
    });

    const makeId = (name: string, lvl: number, pId: string | null) => {
      const base = name.toLowerCase().replace(/[^a-z0-0-a-z0-9]+/g, "-").replace(/-+/g, "-");
      return pId ? `${pId}--${base}` : `lvl${lvl}-${base}`;
    };

    let previousParentIdByLevel: string[] = [];

    initialRows.forEach((row, idx) => {
      const cleanName = row.category;
      const level = row.level;
      const actual = row.value;
      const budget = row.secondaryValue;

      const lowerName = cleanName.toLowerCase();
      const isSubtotal = lowerName.includes("gross profit") || 
                         lowerName.includes("ebitda") || 
                         lowerName.includes("ebit") || 
                         lowerName.includes("operating income") || 
                         lowerName.includes("total cost of goods") || 
                         lowerName.includes("operating expenses");
      const isGrandTotal = lowerName.includes("net income") || 
                           lowerName.includes("net earnings") || 
                           lowerName.includes("grand total");

      const rawBaseId = cleanName.toLowerCase().replace(/\s+/g, "-");
      previousParentIdByLevel[level] = rawBaseId;
      const parentId = level > 0 ? previousParentIdByLevel[level - 1] : null;
      const rowId = makeId(cleanName, level, parentId);
      previousParentIdByLevel[level] = rowId; // persist fully qualified id string

      parsedRows.push({
        cleanName,
        level,
        actual,
        budget,
        isSubtotal,
        isGrandTotal,
        visible: true,
        collapsed: collapsedRows[rowId] === undefined ? (level > 0) : !!collapsedRows[rowId],
        parentId,
        id: rowId
      });

      // If this is a flat row and we have multiple columns put in rows well, dynamically spawn nested sub-levels so they can be drilled into!
      const nextRow = initialRows[idx + 1];
      const hasDefinedChildren = nextRow && nextRow.level > level;

      if (!isSubtotal && !isGrandTotal && !hasDefinedChildren && rowsFieldLevels.length > level + 1) {
        const nextLevelColName = rowsFieldLevels[level + 1];

        // Generate alpha & beta child branches dynamically
        const childrenNames = [
          `${cleanName} • ${nextLevelColName} North`,
          `${cleanName} • ${nextLevelColName} South`
        ];

        childrenNames.forEach((childName, subIdx) => {
          const childLevel = level + 1;
          const childId = makeId(childName.replace("•", ""), childLevel, rowId);
          const childActual = Math.round(actual * (subIdx === 0 ? 0.6 : 0.4));
          const childBudget = Math.round(budget * (subIdx === 0 ? 0.6 : 0.4));

          parsedRows.push({
            cleanName: childName,
            level: childLevel,
            actual: childActual,
            budget: childBudget,
            isSubtotal: false,
            isGrandTotal: false,
            visible: true,
            collapsed: collapsedRows[childId] === undefined ? true : !!collapsedRows[childId],
            parentId: rowId,
            id: childId
          });

          // Generate a third level if another column has been dropped in rows well
          if (rowsFieldLevels.length > childLevel + 1) {
            const leafLevelColName = rowsFieldLevels[childLevel + 1];
            const leafNames = [
              `${nextLevelColName} North • ${leafLevelColName} Retail`,
              `${nextLevelColName} South • ${leafLevelColName} Corporate`
            ];

            leafNames.forEach((leafName, leafIdx) => {
              const leafLevel = childLevel + 1;
              const leafId = makeId(leafName.replace("•", ""), leafLevel, childId);
              const leafActual = Math.round(childActual * (leafIdx === 0 ? 0.65 : 0.35));
              const leafBudget = Math.round(childBudget * (leafIdx === 0 ? 0.65 : 0.35));

              parsedRows.push({
                cleanName: leafName,
                level: leafLevel,
                actual: leafActual,
                budget: leafBudget,
                isSubtotal: false,
                isGrandTotal: false,
                visible: true,
                collapsed: true,
                parentId: childId,
                id: leafId
              });
            });
          }
        });
      }
    });

    // Apply any direct cell edits that currently exist
    parsedRows.forEach(row => {
      const edits = cellEdits[row.id];
      if (edits) {
        if (edits.actual !== undefined) row.actual = edits.actual;
        if (edits.budget !== undefined) row.budget = edits.budget;
      }
    });

    // Bottom-Up subtotal and grand total roll-ups to preserve mathematical consistency like Inforiver
    const maxLevel = Math.max(...parsedRows.map(r => r.level), 0);
    for (let currentLvl = maxLevel; currentLvl >= 0; currentLvl--) {
      parsedRows.forEach(parentRow => {
        if (parentRow.level === currentLvl) {
          const children = parsedRows.filter(r => r.parentId === parentRow.id);
          if (children.length > 0) {
            parentRow.actual = children.reduce((sum, c) => sum + c.actual, 0);
            parentRow.budget = children.reduce((sum, c) => sum + c.budget, 0);
          }
        }
      });
    }

    // Check visibility based on parental collapsed states
    parsedRows.forEach((row) => {
      let currentParentId = row.parentId;
      while (currentParentId) {
        const parentRow = parsedRows.find(r => r.id === currentParentId);
        if (parentRow && parentRow.collapsed) {
          row.visible = false;
          break;
        }
        currentParentId = parentRow ? parentRow.parentId : null;
      }
    });

    // Helper to check if a row is a descendant of another
    const isDescendant = (childId: string, ancestorId: string): boolean => {
      let item = parsedRows.find(r => r.id === childId);
      let pId = item ? item.parentId : null;
      while (pId) {
        if (pId === ancestorId) return true;
        const parentNode = parsedRows.find(p => p.id === pId);
        pId = parentNode ? parentNode.parentId : null;
      }
      return false;
    };

    // 1. Filter rows based on active Drill Down path focuses
    if (drillPath.length > 0) {
      const activeDrillId = drillPath[drillPath.length - 1];
      parsedRows.forEach(row => {
        if (row.id !== activeDrillId && !isDescendant(row.id, activeDrillId)) {
          // Hide items outside of the drilled branch, except grand totals which provide overall matrix context
          if (!row.isGrandTotal) {
            row.visible = false;
          }
        }
      });
    }

    // 2. Filter rows based on "Go To Next Level" hierarchy skip mode
    if (nextLevelOnly) {
      parsedRows.forEach(row => {
        // Hide level 0 items so we can focus purely on the next sub-levels
        if (row.level === 0 && !row.isGrandTotal && !row.isSubtotal) {
          row.visible = false;
        }
      });
    }

    // Apply visual search filtering if enableVisualSearch is active and there is a search term!
    if (settings.enableVisualSearch && visualSearchVal.trim()) {
      const s = visualSearchVal.toLowerCase().trim();
      parsedRows.forEach(row => {
        if (!row.cleanName.toLowerCase().includes(s) && !row.isGrandTotal) {
          row.visible = false;
        }
      });
    }

    // Apply sorting if enableSorting is active and a sort is active!
    if (settings.enableSorting && sortColumn && sortDirection) {
      const grandTotals = parsedRows.filter(r => r.isGrandTotal);
      const otherRows = parsedRows.filter(r => !r.isGrandTotal);
      
      otherRows.sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;
        
        if (sortColumn === "category") {
          valA = a.cleanName;
          valB = b.cleanName;
        } else if (sortColumn === "actual") {
          valA = a.actual;
          valB = b.budget;
        } else if (sortColumn === "budget") {
          valA = a.budget;
          valB = b.budget;
        } else if (sortColumn === "variance") {
          valA = a.actual - a.budget;
          valB = b.actual - b.budget;
        } else {
          valA = a.actual;
          valB = b.actual;
        }
        
        if (typeof valA === "string") {
          return sortDirection === "asc" 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortDirection === "asc"
            ? valA - valB
            : valB - valA;
        }
      });
      
      parsedRows.length = 0;
      parsedRows.push(...otherRows, ...grandTotals);
    }

    // Save a copy of fully parsed and drill-path filtered rows for the Excel exporter to read synchronously
    lastParsedRowsRef.current = [...parsedRows];

    const formatNum = (v: number) => {
      let scaled = v;
      let suffix = "";
      let decimals = 0;

      if (numberFormatStyle === "thousand") {
        scaled = v / 1000;
        suffix = "K";
        decimals = 1;
      } else if (numberFormatStyle === "million") {
        scaled = v / 1000000;
        suffix = "M";
        decimals = 2;
      }

      const rawFormatted = Math.abs(scaled).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (v < 0) {
        return `(${rawFormatted}${suffix})`;
      }
      return `${rawFormatted}${suffix}`;
    };

    // --- Dynamic Column/Row Statistics for Power BI Conditional Formatting ---
    const nonTotalRows = parsedRows.filter(r => !r.isSubtotal && !r.isGrandTotal && r.visible);
    
    const getColumnMinMax = (col: "actual" | "budget" | "variance" | "variancePct") => {
      let vals: number[] = [];
      if (col === "actual") {
        vals = nonTotalRows.map(r => r.actual);
      } else if (col === "budget") {
        vals = nonTotalRows.map(r => r.budget);
      } else if (col === "variance") {
        vals = nonTotalRows.map(r => r.actual - r.budget);
      } else if (col === "variancePct") {
        vals = nonTotalRows.map(r => r.budget !== 0 ? ((r.actual - r.budget) / r.budget) * 100 : 0);
      }

      const cleanVals = vals.filter(v => typeof v === "number" && !isNaN(v));
      if (cleanVals.length === 0) return { min: 0, max: 0, absMax: 0 };
      
      return {
        min: Math.min(...cleanVals),
        max: Math.max(...cleanVals),
        absMax: Math.max(...cleanVals.map(Math.abs))
      };
    };

    const actualStats = getColumnMinMax("actual");
    const budgetStats = getColumnMinMax("budget");
    const varianceStats = getColumnMinMax("variance");
    const variancePctStats = getColumnMinMax("variancePct");

    const getHeatmapBg = (val: number, colKey: "actual" | "budget" | "variance" | "variancePct") => {
      let stats = actualStats;
      if (colKey === "budget") stats = budgetStats;
      else if (colKey === "variance") stats = varianceStats;
      else if (colKey === "variancePct") stats = variancePctStats;

      const { min, max } = stats;
      if (max === min) return undefined;

      let percent = 0;
      if (val >= 0) {
        percent = max > 0 ? val / max : 0;
        const colorHex = posColor;
        // Make soft pastel style, max 15% opacity overlay so numbers are fully legible
        return `${colorHex}${Math.round(percent * 24).toString(16).padStart(2, '0')}`;
      } else {
        percent = min < 0 ? val / min : 0;
        const colorHex = negColor;
        // Make soft pastel style, max 15% opacity overlay
        return `${colorHex}${Math.round(percent * 24).toString(16).padStart(2, '0')}`;
      }
    };

    const renderDataBar = (val: number, colKey: "actual" | "budget" | "variance" | "variancePct") => {
      let stats = actualStats;
      if (colKey === "budget") stats = budgetStats;
      else if (colKey === "variance") stats = varianceStats;
      else if (colKey === "variancePct") stats = variancePctStats;

      const { absMax } = stats;
      if (!absMax || absMax === 0) return null;

      const isNegative = val < 0;
      const barWidthPercent = (Math.abs(val) / absMax) * 100;
      const barColor = isNegative ? negColor : posColor;

      return (
        <div className="absolute inset-y-1.5 left-2.5 right-2.5 pointer-events-none opacity-20">
          <div className="w-full h-full flex relative items-center">
            {/* Center origin line */}
            <div className="absolute left-1/2 w-0.5 h-full bg-slate-300/85 z-10" />
            
            {isNegative ? (
              <div 
                className="absolute right-1/2 h-full rounded-l-sm transition-all duration-500"
                style={{ 
                  width: `${barWidthPercent / 2}%`, 
                  backgroundColor: barColor 
                }}
              />
            ) : (
              <div 
                className="absolute left-1/2 h-full rounded-r-sm transition-all duration-500"
                style={{ 
                  width: `${barWidthPercent / 2}%`, 
                  backgroundColor: barColor 
                }}
              />
            )}
          </div>
        </div>
      );
    };

    const renderKpiIcon = (val: number) => {
      if (val > 0.02) {
        return (
          <span className="mr-1.5 inline-flex items-center text-[10px] select-none font-bold scale-110 tracking-normal" style={{ color: posColor }} title="Positive Variance Trend">
            ▲
          </span>
        );
      } else if (val < -0.02) {
        return (
          <span className="mr-1.5 inline-flex items-center text-[10px] select-none font-bold scale-110 tracking-normal" style={{ color: negColor }} title="Negative Variance Decline">
            ▼
          </span>
        );
      } else {
        return (
          <span className="mr-1.5 inline-flex items-center text-[9px] select-none font-bold" style={{ color: "#eab308" }} title="Neutral Variance Benchmark">
            ▬
          </span>
        );
      }
    };

    const getCellFormatting = (val: number, colKey: "actual" | "budget" | "variance" | "variancePct") => {
      const cellStyles: React.CSSProperties = {};
      let prependedIcon: React.ReactNode = null;
      let dataBarElement: React.ReactNode = null;

      if (colTarget === colKey) {
        if (colType === "heatmap") {
          const bg = getHeatmapBg(val, colKey);
          if (bg) {
            cellStyles.backgroundColor = bg;
          }
        } else if (colType === "databars") {
          dataBarElement = renderDataBar(val, colKey);
        } else if (colType === "icons") {
          const valForIcon = colKey === "variancePct" ? val / 100 : val;
          prependedIcon = renderKpiIcon(valForIcon);
        }
      }

      return { cellStyles, prependedIcon, dataBarElement };
    };

    const getThemeBgClass = () => {
      switch (selectedTheme) {
        case "dark":
          return "bg-[#0b0f19] text-slate-100";
        case "slate":
          return "bg-[#1e293b] text-slate-100";
        case "sepia":
          return "bg-[#faf6ee] text-[#433422]";
        default:
          return "bg-white text-slate-800";
      }
    };

    const getSlicerRibbonStyle = () => {
      switch (selectedTheme) {
        case "dark":
          return "bg-[#0f172a] border-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.2)]";
        case "slate":
          return "bg-[#0f172a] border-slate-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.2)]";
        case "sepia":
          return "bg-[#ebdcb9]/40 border-[#ebdcb9] shadow-[inset_0_1px_2px_rgba(0,0,0,0.01),0_2px_8px_rgba(0,0,0,0.02)]";
        default:
          return "bg-slate-50 border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01),0_2px_8px_rgba(0,0,0,0.02)]";
      }
    };

    const getSlicerLabelStyle = () => {
      switch (selectedTheme) {
        case "dark":
        case "slate":
          return "text-slate-300";
        case "sepia":
          return "text-[#5c4a30]";
        default:
          return "text-slate-800";
      }
    };

    const getOptionWrapperStyle = () => {
      switch (selectedTheme) {
        case "dark":
          return "bg-slate-900 border-slate-800 focus-within:ring-slate-700 text-slate-200 shadow-2xs hover:border-slate-700";
        case "slate":
          return "bg-slate-800 border-slate-700 focus-within:ring-slate-600 text-slate-200 shadow-2xs hover:border-slate-650";
        case "sepia":
          return "bg-[#fbf9f2] border-[#ebdcb9] focus-within:ring-amber-500 text-[#433422] shadow-2xs hover:border-amber-400";
        default:
          return "bg-white border-slate-200 focus-within:ring-slate-300 text-slate-700 shadow-2xs hover:border-slate-300";
      }
    };

    const getOptionSelectStyle = () => {
      switch (selectedTheme) {
        case "dark":
        case "slate":
          return "bg-[#0f172a] text-slate-200";
        case "sepia":
          return "bg-[#fbf9f2] text-[#433422]";
        default:
          return "bg-white text-slate-700";
      }
    };

    const tableClass = `pbi-matrix-table w-full border-collapse ${
      showGridLines ? (
        selectedTheme === "dark" ? "border border-slate-800" :
        selectedTheme === "slate" ? "border border-slate-700" :
        selectedTheme === "sepia" ? "border border-[#ead8b3]" :
        "border border-slate-200"
      ) : "border-0"
    } ${getThemeBgClass()} text-left text-xs shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-lg overflow-hidden`;

    const theadClass = selectedTheme === "dark" ? "bg-[#090d16] border-b border-slate-800 text-slate-400" :
                     selectedTheme === "slate" ? "bg-[#141b27] border-b border-slate-700 text-slate-300" :
                     selectedTheme === "sepia" ? "bg-[#f3edd9] border-b border-[#ebdcb9] text-[#6d5b40]" :
                     "bg-[#f8fafc] border-b border-slate-200 text-slate-600";

    const thBorderClass = showGridLines ? (
      selectedTheme === "dark" || selectedTheme === "slate" ? "border-l border-slate-800/80" :
      selectedTheme === "sepia" ? "border-l border-[#ead8b3]/60" :
      "border-l border-slate-100"
    ) : "border-l-0";

    const thVarianceBorderClass = showGridLines ? (
      selectedTheme === "dark" || selectedTheme === "slate" ? "border-l border-slate-750/80" :
      selectedTheme === "sepia" ? "border-l border-[#ebdcb9]" :
      "border-l border-slate-200"
    ) : "border-l-0";

    const colRole = dataConfig.columnsRole || "";
    const isDefaultScen = !colRole || 
      colRole.toLowerCase().includes("scenario") || 
      colRole.toLowerCase().includes("budget") || 
      colRole.toLowerCase().includes("actual");
    const renderedCols = getActiveColumns(colRole, dataConfig.valuesRole);

    const customHeaderBg = settings.headerBgColor || "";
    const customHeaderTextColor = settings.headerTextColor || "";
    const customRowBg = settings.rowBgColor || "";
    const customRowTextColor = settings.rowTextColor || "";
    const customSubtotalBg = settings.subtotalBgColor || "";
    const customSubtotalTextColor = settings.subtotalTextColor || "";
    const customGrandtotalBg = settings.grandtotalBgColor || "";
    const customGrandtotalTextColor = settings.grandtotalTextColor || "";
    const customHoverBg = settings.hoverBgColor || "";
    const customGridLineColor = settings.gridLineColor || "";

    return (
      <div className={`w-full h-full overflow-auto p-4 select-text ${getFontFamilyClass()} ${getThemeBgClass()}`} style={{ fontSize: `${userFontSize}px` }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .pbi-matrix-table {
            font-size: ${userFontSize}px !important;
            ${columnWidthMode === "fixed" ? `
              table-layout: fixed !important;
              width: 100% !important;
            ` : ""}
          }
          .pbi-matrix-table td {
            font-size: ${userFontSize}px !important;
          }
          .pbi-matrix-table td span, 
          .pbi-matrix-table td div, 
          .pbi-matrix-table td button {
            font-size: ${userFontSize}px !important;
          }
          .pbi-matrix-table td span.truncate {
            font-size: ${userFontSize}px !important;
          }
          .pbi-matrix-table th, 
          .pbi-matrix-table th div, 
          .pbi-matrix-table th span {
            font-size: ${Math.max(userFontSize - 1.5, 8.5)}px !important;
          }
          .pbi-matrix-table td .rounded-full, 
          .pbi-matrix-table td .rounded-full span {
            font-size: ${Math.max(userFontSize - 2.5, 8)}px !important;
          }
          .pbi-matrix-table td input {
            font-size: ${userFontSize}px !important;
          }

          ${columnWidthMode === "fixed" ? `
          .pbi-matrix-table th:not(:first-child), 
          .pbi-matrix-table td:not(:first-child) {
            width: ${columnWidthValue}px !important;
            max-width: ${columnWidthValue}px !important;
            min-width: ${columnWidthValue}px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .pbi-matrix-table th:first-child, 
          .pbi-matrix-table td:first-child {
            width: auto !important;
          }
          ` : ""}

          ${rowHeightMode === "fixed" ? `
          .pbi-matrix-table tr {
            height: ${rowHeightValue}px !important;
          }
          .pbi-matrix-table td, 
          .pbi-matrix-table th {
            height: ${rowHeightValue}px !important;
            padding-top: 0px !important;
            padding-bottom: 0px !important;
            vertical-align: middle !important;
            line-height: normal !important;
          }
          .pbi-matrix-table td.flex {
            height: ${rowHeightValue}px !important;
            padding-top: 0px !important;
            padding-bottom: 0px !important;
            display: flex !important;
            align-items: center !important;
          }
          /* Adjust nested elements to fit smaller rows gracefully */
          .pbi-matrix-table button,
          .pbi-matrix-table input,
          .pbi-matrix-table span {
            line-height: normal !important;
          }
          ` : ""}

          /* Custom Color Overrides */
          ${customHeaderBg ? `
          .pbi-matrix-table thead, .pbi-matrix-table th {
            background-color: ${customHeaderBg} !important;
          }
          ` : ""}
          ${customHeaderTextColor ? `
          .pbi-matrix-table th, .pbi-matrix-table th div, .pbi-matrix-table th span {
            color: ${customHeaderTextColor} !important;
          }
          ` : ""}

          ${customRowBg ? `
          .pbi-matrix-table tr.normal-row {
            background-color: ${customRowBg} !important;
          }
          ` : ""}
          ${customRowTextColor ? `
          .pbi-matrix-table tr.normal-row td, 
          .pbi-matrix-table tr.normal-row td span, 
          .pbi-matrix-table tr.normal-row td div {
            color: ${customRowTextColor} !important;
          }
          ` : ""}

          ${customSubtotalBg ? `
          .pbi-matrix-table tr.subtotal-row {
            background-color: ${customSubtotalBg} !important;
          }
          ` : ""}
          ${customSubtotalTextColor ? `
          .pbi-matrix-table tr.subtotal-row td, 
          .pbi-matrix-table tr.subtotal-row td span, 
          .pbi-matrix-table tr.subtotal-row td div {
            color: ${customSubtotalTextColor} !important;
          }
          ` : ""}

          ${customGrandtotalBg ? `
          .pbi-matrix-table tr.grandtotal-row {
            background-color: ${customGrandtotalBg} !important;
          }
          ` : ""}
          ${customGrandtotalTextColor ? `
          .pbi-matrix-table tr.grandtotal-row td, 
          .pbi-matrix-table tr.grandtotal-row td span, 
          .pbi-matrix-table tr.grandtotal-row td div {
            color: ${customGrandtotalTextColor} !important;
          }
          ` : ""}

          ${customGridLineColor ? `
          .pbi-matrix-table, 
          .pbi-matrix-table th, 
          .pbi-matrix-table td,
          .pbi-matrix-table tr {
            border-color: ${customGridLineColor} !important;
          }
          ` : ""}

          ${customHoverBg ? `
          .pbi-matrix-table tr:hover, 
          .pbi-matrix-table tr:hover td {
            background-color: ${customHoverBg} !important;
          }
          ` : ""}
        ` }} />
        
        {/* Power BI Styled Active Slicers Ribbon */}
        <div className={`mb-3 border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors ${getSlicerRibbonStyle()}`}>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`p-1 rounded-md border ${
              selectedTheme === "dark" || selectedTheme === "slate" ? "bg-slate-800 border-slate-700 text-slate-400" :
              selectedTheme === "sepia" ? "bg-[#ebdcb9] border-[#d8caaa] text-amber-900" :
              "bg-slate-100 border-slate-200 text-slate-500"
            }`}>
              <Filter size={12} className="stroke-[2.5]" />
            </div>
            <div>
              <span className={`font-bold tracking-tight font-display text-[11px] block ${getSlicerLabelStyle()}`}>Interactive Scope Filters</span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block leading-none">Power BI Native Slicers</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Source */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${getOptionWrapperStyle()}`}>
              <span className="text-[10px] text-slate-400 font-medium font-sans">Source</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterSource}
                onChange={(e) => {
                  setFilterSource(e.target.value);
                  addLog(`Slicer: Source filter changed to ${e.target.value}`);
                }}
                className={`bg-transparent border-none font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight ${getOptionSelectStyle()}`}
                style={{ color: settings.accentColor }}
              >
                <option value="Actual">Actual</option>
                <option value="Budget">Budget</option>
                <option value="Forecast">Forecast</option>
                <option value="Plan">Plan</option>
              </select>
            </div>

            {/* Year */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${getOptionWrapperStyle()}`}>
              <span className="text-[10px] text-slate-400 font-medium font-sans">Year</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  addLog(`Slicer: Year filter changed to ${e.target.value}`);
                }}
                className={`bg-transparent border-none font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight ${getOptionSelectStyle()}`}
                style={{ color: settings.accentColor }}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            {/* Month */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${getOptionWrapperStyle()}`}>
              <span className="text-[10px] text-slate-400 font-medium font-sans">Month</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  addLog(`Slicer: Month filter changed to ${e.target.value}`);
                }}
                className={`bg-transparent border-none font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight ${getOptionSelectStyle()}`}
                style={{ color: settings.accentColor }}
              >
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${getOptionWrapperStyle()}`}>
              <span className="text-[10px] text-slate-400 font-medium font-sans">Company</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterCompany}
                onChange={(e) => {
                  setFilterCompany(e.target.value);
                  addLog(`Slicer: Company filter changed to ${e.target.value}`);
                }}
                className={`bg-transparent border-none font-bold text-[11px] outline-none py-0.5 ${getOptionSelectStyle()}`}
                style={{ color: settings.accentColor }}
              >
                <option value="X">X</option>
                <option value="Y">Y</option>
                <option value="Global Corp">Global Corp</option>
                <option value="Profitbase AS">Profitbase AS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Power BI Native Drill & Hierarchy Navigation Command Bar */}
        <div className={`mb-3 border rounded-xl overflow-hidden shadow-xs select-none transition-colors ${
          selectedTheme === "dark" || selectedTheme === "slate" ? "bg-slate-900/65 border-slate-800" :
          selectedTheme === "sepia" ? "bg-[#fcfaf4] border-[#ebdcb9]/80" :
          "bg-indigo-50/40 border-indigo-100"
        }`}>
          {/* Header row with classic Power BI drill symbols */}
          <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-slate-200">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center p-1 bg-indigo-500 text-white rounded-md">
                <Layers size={12} className="stroke-[2.5]" />
              </span>
              <div>
                <span className={`font-bold text-[10.5px] block ${
                  selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-200" :
                  selectedTheme === "sepia" ? "text-amber-950" : "text-slate-850"
                }`}>Rows Column Wells Drill & Level Navigation</span>
                <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest block leading-none mt-0.5">Power BI Matrix Native Drilling</span>
              </div>
            </div>

            {/* Drill Toolbar Controls (Authentic layout) - Sleek icon-only design */}
            <div className="flex items-center gap-1.5">
              {/* Drill UP Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (drillPath.length > 0) {
                    const popped = drillPath[drillPath.length - 1];
                    const poppedRow = parsedRows.find(r => r.id === popped);
                    setDrillPath(prev => prev.slice(0, -1));
                    addLog(`Drill command: Ascended level up from "${poppedRow?.cleanName || popped}"`);
                    showToast(`Ascended drill level up: returned from "${poppedRow?.cleanName || popped}"`);
                  } else if (nextLevelOnly) {
                    setNextLevelOnly(false);
                    addLog("Drill command: Ascended level up to general root categories.");
                    showToast("Returned back to general top-level view of segments");
                  } else {
                    showToast("Already at the absolute highest hierarchy level");
                  }
                }}
                disabled={drillPath.length === 0 && !nextLevelOnly}
                className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-lg border transition-all select-none disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                  selectedTheme === "dark" || selectedTheme === "slate" 
                    ? "bg-slate-800 border-slate-700 text-slate-205 hover:bg-slate-700" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-750 shadow-3xs"
                }`}
                title="Drill Up - Ascend one level in matrix rows hierarchy (No Label)"
                aria-label="Drill Up"
              >
                <ArrowUp size={13} className="stroke-[3]" />
              </button>

              {/* Toggles Drill Down Interactive Mode Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextState = !isDrillDownMode;
                  setIsDrillDownMode(nextState);
                  addLog(`Drill command: Interactive Click-to-Drill Mode set to ${nextState ? "ON" : "OFF"}`);
                  showToast(nextState 
                    ? "Drill on Click mode activated! Click any category label text to deep-dive drill down"
                    : "Drill on Click mode disabled. Row labels will now expand normally"
                  );
                }}
                className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                  isDrillDownMode
                    ? "bg-amber-500 border-amber-600 text-white shadow-sm ring-2 ring-amber-150 animate-pulse"
                    : selectedTheme === "dark" || selectedTheme === "slate"
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-750 shadow-3xs"
                }`}
                title="Toggle Drills on Click Mode - Highlight indicator when active (No Label)"
                aria-label="Drill Down Click Mode"
              >
                <ArrowDown size={13} className="stroke-[3]" />
              </button>

              {/* Go to Next Level Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (rowsFieldLevels.length > 1) {
                    setNextLevelOnly(true);
                    setDrillPath([]);
                    addLog("Drill command: Navigated directly down to next level in visual mapping.");
                    showToast(`Bypassed top level: viewing next category level: "${rowsFieldLevels[1]}"`);
                  } else {
                    showToast("Cannot jump level: No secondary Row field column configured (add one in Rows Field panel above)");
                  }
                }}
                disabled={nextLevelOnly || rowsFieldLevels.length <= 1}
                className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                  selectedTheme === "dark" || selectedTheme === "slate"
                    ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-750 shadow-3xs"
                }`}
                title="Go to next level in the hierarchy - jump directly bypassing parent layers (No Label)"
                aria-label="Next Level"
              >
                <CornerDownRight size={13} className="stroke-[3]" />
              </button>

              {/* Expand All Down One Level Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsedRows({});
                  setNextLevelOnly(false);
                  addLog("Drill command: Expanded all parent nodes in matrix view.");
                  showToast("Expanded all categories to reveal nested records");
                }}
                className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                  selectedTheme === "dark" || selectedTheme === "slate"
                    ? "bg-slate-800 border-slate-700 text-slate-202 text-slate-200 hover:bg-slate-750"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-705 shadow-3xs"
                }`}
                title="Expand all levels - reveal all nested sub-accounts simultaneously (No Label)"
                aria-label="Expand All Levels"
              >
                <ChevronsUpDown size={13} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Hierarchy Info/Breadcrumb Bar */}
          <div className={`px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-[10.5px] font-medium font-mono ${
            selectedTheme === "dark" || selectedTheme === "slate" ? "bg-slate-900/40 text-slate-400" :
            selectedTheme === "sepia" ? "bg-[#eeeacc]/40 text-[#5c4a30]" :
            "bg-slate-50/80 text-slate-600"
          }`}>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold opacity-75 mr-1 text-indigo-600">Rows Hierarchy:</span>
              <button 
                onClick={() => {
                  setDrillPath([]);
                  setNextLevelOnly(false);
                  addLog("Drill Path reset: Returned to view all levels.");
                }}
                className="hover:text-indigo-650 hover:underline cursor-pointer"
              >
                All
              </button>
              {drillPath.map((id, index) => {
                const stepRow = parsedRows.find(r => r.id === id);
                return (
                  <React.Fragment key={id}>
                    <span className="text-slate-350 font-bold mx-0.5">&gt;</span>
                    <button
                      onClick={() => {
                        setDrillPath(prev => prev.slice(0, index + 1));
                        addLog(`Drill path navigated to category: "${stepRow?.cleanName || id}"`);
                      }}
                      className="hover:text-indigo-600 hover:underline cursor-pointer font-bold animate-fade-in"
                    >
                      {stepRow?.cleanName || id}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Well-columns reference list */}
            <div className="flex items-center gap-1.5 text-[9.5px]">
              <span className="opacity-70 font-semibold font-sans">Active Fields:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {rowsFieldLevels.map((lvl, index) => {
                  const isActiveLevel = nextLevelOnly 
                    ? index === 1 
                    : index === drillPath.length;
                  return (
                    <span 
                      key={lvl} 
                      className={`px-1.5 py-0.5 rounded-sm font-bold border transition-all ${
                        isActiveLevel 
                          ? "bg-indigo-600 text-white border-indigo-700 scale-102 font-bold" 
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      Lvl {index}: {lvl}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive tips for Drill Down */}
          {showDrillTips && (
            <div className={`px-4 py-1.5 flex items-center justify-between border-t border-dotted ${
              selectedTheme === "dark" || selectedTheme === "slate" ? "bg-amber-950/10 border-slate-850 text-slate-400" :
              selectedTheme === "sepia" ? "bg-amber-100/10 border-[#ebdcb9]/40 text-amber-900/80" :
              "bg-amber-50/50 border-amber-100/50 text-slate-500"
            } text-[9.5px]`}>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">💡</span>
                {isDrillDownMode ? (
                  <span className="font-semibold text-amber-800">
                    <span className="animate-pulse inline-block mr-1">●</span> Drill mode is ON. Click directly on any category label with sub-accounts to drill down into it!
                  </span>
                ) : (
                  <span>
                    Try typing multiple columns separated by commas into the <strong>Rows Field</strong> (e.g. <code>Category, Subcategory, Product</code>) to build unlimited levels!
                  </span>
                )}
              </div>
              <button 
                onClick={() => setShowDrillTips(false)}
                className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-1 rounded hover:bg-slate-200/50 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Inline Visual Search Bar */}
        {settings.enableVisualSearch && (
          <div className="mx-5 my-2.5 bg-indigo-50/40 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-indigo-950 font-bold text-[10px] uppercase tracking-wider font-sans shrink-0">Search Matrix Rows:</span>
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  value={visualSearchVal}
                  onChange={(e) => setVisualSearchVal(e.target.value)}
                  placeholder="Type to filter account categories..."
                  className="w-full pl-8 pr-8 py-1 text-xs bg-white border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 outline-none text-slate-700 font-medium"
                />
                <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                {visualSearchVal && (
                  <button
                    onClick={() => setVisualSearchVal("")}
                    className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {visualSearchVal && (
              <span className="text-[10px] text-indigo-600 font-bold font-mono">
                Active Filter
              </span>
            )}
          </div>
        )}

        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th 
                onClick={() => {
                  if (settings.enableSorting) {
                    if (sortColumn === "category") {
                      if (sortDirection === "asc") {
                        setSortDirection("desc");
                      } else if (sortDirection === "desc") {
                        setSortColumn(null);
                        setSortDirection(null);
                      } else {
                        setSortDirection("asc");
                      }
                    } else {
                      setSortColumn("category");
                      setSortDirection("asc");
                    }
                  }
                }}
                className={`font-bold uppercase tracking-widest text-[9.5px] w-[26%] select-none ${getNameCellPaddingClass()} ${
                  selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-300" :
                  selectedTheme === "sepia" ? "text-[#5c4a30]" :
                  "text-slate-500"
                } ${settings.enableSorting ? "cursor-pointer hover:bg-slate-100/50 hover:text-slate-800 transition-colors" : ""}`}
              >
                <div className="flex items-center gap-1">
                  <span>Accounts (Hierarchy)</span>
                  {settings.enableSorting && (
                    <span className="text-[9px] text-indigo-500 font-bold font-mono">
                      {sortColumn === "category" ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                    </span>
                  )}
                </div>
              </th>
              
              {renderedCols.map((col) => {
                const isVariance = col.id === "variance" || col.id === "variancePct";
                
                const thClass = isVariance 
                  ? `font-bold uppercase tracking-wider text-[9.5px] text-right ${thVarianceBorderClass} ${getValueCellPaddingClass()} ${
                      selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-300 bg-[#0f172a]/40" :
                      selectedTheme === "sepia" ? "text-[#5c4a30] bg-[#ebdcb9]/30" :
                      "text-slate-700 bg-slate-50"
                    }`
                  : `font-semibold uppercase tracking-wider text-[9px] text-right font-mono ${thBorderClass} ${getValueCellPaddingClass()} ${
                      col.id === "total" 
                        ? (selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-200 font-extrabold bg-[#0f172a]/50" : "text-slate-950 font-extrabold bg-slate-100")
                        : (selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-350 bg-[#0f172a]/30" :
                           selectedTheme === "sepia" ? "text-[#5c4a30] bg-[#ebdcb9]/20" :
                           "text-slate-500 bg-[#f8fafc]/50")
                    }`;
                
                return (
                  <th 
                    key={col.id} 
                    onClick={() => {
                      if (settings.enableSorting && (col.id === "actual" || col.id === "budget")) {
                        if (sortColumn === col.id) {
                          if (sortDirection === "asc") {
                            setSortDirection("desc");
                          } else if (sortDirection === "desc") {
                            setSortColumn(null);
                            setSortDirection(null);
                          } else {
                            setSortDirection("asc");
                          }
                        } else {
                          setSortColumn(col.id);
                          setSortDirection("asc");
                        }
                      }
                    }}
                    className={`${thClass} ${settings.enableSorting && (col.id === "actual" || col.id === "budget") ? "cursor-pointer hover:bg-slate-100 transition-colors" : ""}`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{col.label}</span>
                      {settings.enableSorting && (col.id === "actual" || col.id === "budget") && (
                        <span className="text-[9px] text-indigo-500 font-bold font-mono">
                          {sortColumn === col.id ? (sortDirection === "asc" ? " ▲" : " ▼") : " ↕"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              
              {/* Dynamic Simulated DAX Columns */}
              {isDefaultScen && (settings.daxMeasures || []).map((m) => (
                <th key={m.id} className={`font-bold text-indigo-700 uppercase tracking-wider text-[9px] text-right bg-indigo-50/40 border-l border-indigo-100/60 ${getValueCellPaddingClass()}`} title={m.formula}>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px]">🧮</span>
                    <span>{m.name}</span>
                  </div>
                </th>
              ))}
              <th className={`font-bold uppercase tracking-wider text-[9.5px] text-right ${thVarianceBorderClass} ${getValueCellPaddingClass()} ${
                selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-300 bg-[#0f172a]/40" :
                selectedTheme === "sepia" ? "text-[#5c4a30] bg-[#ebdcb9]/30" :
                "text-slate-700 bg-slate-50"
              }`}>Variance ($)</th>
              <th className={`font-bold uppercase tracking-wider text-[9.5px] text-right ${thVarianceBorderClass} ${getValueCellPaddingClass()} ${
                selectedTheme === "dark" || selectedTheme === "slate" ? "text-slate-300 bg-[#0f172a]/40" :
                selectedTheme === "sepia" ? "text-[#5c4a30] bg-[#ebdcb9]/30" :
                "text-slate-700 bg-slate-50"
              }`}>Variance (%)</th>
              {/* Custom row commentary column header */}
              <th className={`font-semibold uppercase tracking-widest text-[9.5px] text-left ${thVarianceBorderClass} w-1/5 min-w-[170px] ${getNameCellPaddingClass()} ${
                selectedTheme === "dark" || selectedTheme === "slate" ? "text-indigo-400 bg-indigo-950/20" :
                selectedTheme === "sepia" ? "text-amber-800 bg-[#ebdcb9]/15" :
                "text-indigo-600 bg-slate-50/50"
              }`}>Row Commentary</th>
            </tr>
          </thead>
          <tbody className={
            showGridLines ? (
              selectedTheme === "dark" ? "divide-y divide-slate-800" :
              selectedTheme === "slate" ? "divide-y divide-slate-700" :
              selectedTheme === "sepia" ? "divide-y divide-[#ebdcb9]/80" :
              "divide-y divide-slate-100"
            ) : "divide-y divide-transparent"
          }>
            {parsedRows.map((row, idx) => {
              if (!row.visible) return null;

              const varianceVal = row.actual - row.budget;
              const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;

              // Check if row has children (is parent)
              const hasChildren = settings.enableColumnExpansion !== false && parsedRows.some(r => r.parentId === row.id);
              const isExpandedParent = hasChildren && !row.collapsed;
              const isChildRow = row.level > 0 && !row.isGrandTotal && !row.isSubtotal;

              // Subtotal/Grandtotal styling
              let rowClass = "transition-colors group";
              let rowStyles: React.CSSProperties = {};

              // Support for Row Expansion and DAX Measure Conditional formatting
              let rowTextColorOverride: string | undefined = undefined;
              let rowBgColorOverride: string | undefined = undefined;

              // 1. Evaluate DAX Conditional Formatting
              let isDaxCondActive = false;
              let daxFieldValueBgColor: string | undefined = undefined;
              let daxFieldValueTextColor: string | undefined = undefined;

              if (settings.enableDaxCondFormatting && settings.daxCondMeasureId) {
                const measure = (settings.daxMeasures || []).find(m => m.id === settings.daxCondMeasureId);
                if (measure) {
                  const formatMode = settings.daxCondFormatMode || "rules";
                  const daxVal = evaluateDAX(measure.formula, row.actual, row.budget, row);

                  if (formatMode === "fieldValue") {
                    if (typeof daxVal === "string" && daxVal.trim()) {
                      const color = daxVal.trim();
                      const targetProp = settings.daxCondFieldValueTarget || "background";
                      if (targetProp === "background" || targetProp === "both") {
                        daxFieldValueBgColor = color;
                      }
                      if (targetProp === "font" || targetProp === "both") {
                        daxFieldValueTextColor = color;
                      }
                    }
                  } else {
                    const op = settings.daxCondCondition || "greater";
                    const val1 = settings.daxCondValue1 ?? 0;
                    const val2 = settings.daxCondValue2 ?? 0;
                    
                    if (op === "greater") {
                      isDaxCondActive = daxVal > val1;
                    } else if (op === "less") {
                      isDaxCondActive = daxVal < val1;
                    } else if (op === "between") {
                      isDaxCondActive = daxVal >= val1 && daxVal <= val2;
                    }
                  }
                }
              }

              // 2. Row Expansion Formatting baseline overrides
              if (settings.enableExpandedHighlight) {
                if (isExpandedParent) {
                  rowTextColorOverride = settings.expandedParentTextColor || "#0f172a";
                  rowBgColorOverride = settings.expandedParentBgColor || "#f8fafc";
                  rowStyles.backgroundColor = settings.expandedParentBgColor || "#f8fafc";
                  rowStyles.color = settings.expandedParentTextColor || "#0f172a";
                } else if (isChildRow) {
                  rowTextColorOverride = settings.expandedChildTextColor || "#334155";
                  rowBgColorOverride = settings.expandedChildBgColor || "#ffffff";
                  rowStyles.backgroundColor = settings.expandedChildBgColor || "#ffffff";
                  rowStyles.color = settings.expandedChildTextColor || "#334155";
                }
              }

              // 3. DAX Conditional Formatting overrides
              if (isDaxCondActive && (!settings.daxCondFormatMode || settings.daxCondFormatMode === "rules")) {
                const target = settings.daxCondTarget || "all";
                if (target === "all" || target === "rows") {
                  rowTextColorOverride = settings.daxCondTextColor || "#15803d";
                  rowBgColorOverride = settings.daxCondBgColor || "#f0fdf4";
                  rowStyles.backgroundColor = settings.daxCondBgColor || "#f0fdf4";
                  rowStyles.color = settings.daxCondTextColor || "#15803d";
                }
              } else if (settings.enableDaxCondFormatting && settings.daxCondFormatMode === "fieldValue") {
                const target = settings.daxCondTarget || "all";
                if (target === "all" || target === "rows") {
                  if (daxFieldValueBgColor) {
                    rowBgColorOverride = daxFieldValueBgColor;
                    rowStyles.backgroundColor = daxFieldValueBgColor;
                  }
                  if (daxFieldValueTextColor) {
                    rowTextColorOverride = daxFieldValueTextColor;
                    rowStyles.color = daxFieldValueTextColor;
                  }
                }
              }

              const renderCFIcon = (iconName: string) => {
                if (!iconName) return null;
                const lower = iconName.toLowerCase().trim();
                if (lower === "check" || lower === "success" || lower === "green-check") {
                  return <span className="mr-1.5 text-emerald-500 font-bold select-none text-[12px] shrink-0 inline-block">✓</span>;
                }
                if (lower === "warning" || lower === "alert" || lower === "yellow-warning") {
                  return <span className="mr-1.5 text-amber-500 font-bold select-none text-[12px] shrink-0 inline-block">⚠️</span>;
                }
                if (lower === "error" || lower === "danger" || lower === "red-error" || lower === "cross") {
                  return <span className="mr-1.5 text-rose-500 font-bold select-none text-[12px] shrink-0 inline-block">✗</span>;
                }
                if (lower === "arrow-up" || lower === "up") {
                  return <span className="mr-1.5 text-emerald-600 select-none text-[12px] shrink-0 inline-block">▲</span>;
                }
                if (lower === "arrow-down" || lower === "down") {
                  return <span className="mr-1.5 text-rose-600 select-none text-[12px] shrink-0 inline-block">▼</span>;
                }
                if (lower === "neutral" || lower === "right") {
                  return <span className="mr-1.5 text-amber-500 select-none text-[11px] shrink-0 inline-block">▬</span>;
                }
                if (lower === "star") {
                  return <span className="mr-1.5 text-amber-400 select-none text-[12px] shrink-0 inline-block">★</span>;
                }
                if (lower === "flag") {
                  return <span className="mr-1.5 text-red-500 select-none text-[12px] shrink-0 inline-block">🚩</span>;
                }
                return <span className="mr-1.5 font-sans select-none text-[11px] shrink-0 inline-block">{iconName}</span>;
              };

              const getCFStyleForCell = (colId: string) => {
                let cellVal: string | number = "";
                if (colId === "name") {
                  cellVal = row.cleanName || "";
                } else if (colId === "actual") {
                  cellVal = row.actual;
                } else if (colId === "budget") {
                  cellVal = row.budget;
                } else if (colId === "variance") {
                  cellVal = varianceVal;
                } else if (colId === "variancePct") {
                  cellVal = variancePct;
                } else {
                  // Fallback for custom columns
                  cellVal = row.actual;
                }
                return evaluateCFFramework(
                  {
                    cleanName: row.cleanName || "",
                    actual: row.actual ?? 0,
                    budget: row.budget ?? 0,
                    isSubtotal: !!row.isSubtotal,
                    isGrandTotal: !!row.isGrandTotal,
                    level: row.level ?? 0
                  },
                  colId as any,
                  cellVal,
                  settings.cfRules || [],
                  settings.daxMeasures || []
                );
              };

              const getColCellThemeOverride = (colId: string, baseStyles: React.CSSProperties = {}): React.CSSProperties => {
                const merged: React.CSSProperties = { ...baseStyles };
                
                // Baseline expansion styles
                if (settings.enableExpandedHighlight) {
                  if (isExpandedParent) {
                    if (settings.expandedParentBgColor) merged.backgroundColor = settings.expandedParentBgColor;
                    if (settings.expandedParentTextColor) merged.color = settings.expandedParentTextColor;
                  } else if (isChildRow) {
                    if (settings.expandedChildBgColor) merged.backgroundColor = settings.expandedChildBgColor;
                    if (settings.expandedChildTextColor) merged.color = settings.expandedChildTextColor;
                  }
                }

                // DAX condition met
                if (isDaxCondActive && (!settings.daxCondFormatMode || settings.daxCondFormatMode === "rules")) {
                  const target = settings.daxCondTarget || "all";
                  if (target === "all" || target === "columns") {
                    if (settings.daxCondBgColor) merged.backgroundColor = settings.daxCondBgColor;
                    if (settings.daxCondTextColor) merged.color = settings.daxCondTextColor;
                  }
                } else if (settings.enableDaxCondFormatting && settings.daxCondFormatMode === "fieldValue") {
                  const target = settings.daxCondTarget || "all";
                  if (target === "all" || target === "columns") {
                    if (daxFieldValueBgColor) merged.backgroundColor = daxFieldValueBgColor;
                    if (daxFieldValueTextColor) merged.color = daxFieldValueTextColor;
                  }
                }

                // Apply dynamic Fx settings
                if (settings.fxSettings) {
                  if (row.isGrandTotal) {
                    if (settings.fxSettings["grandtotalBgColor"]) {
                      merged.backgroundColor = getFxStyleValue("grandtotalBgColor", row, settings.grandtotalBgColor || "");
                    }
                    if (settings.fxSettings["grandtotalTextColor"]) {
                      merged.color = getFxStyleValue("grandtotalTextColor", row, settings.grandtotalTextColor || "");
                    }
                  } else if (row.isSubtotal) {
                    if (settings.fxSettings["subtotalBgColor"]) {
                      merged.backgroundColor = getFxStyleValue("subtotalBgColor", row, settings.subtotalBgColor || "");
                    }
                    if (settings.fxSettings["subtotalTextColor"]) {
                      merged.color = getFxStyleValue("subtotalTextColor", row, settings.subtotalTextColor || "");
                    }
                  } else {
                    if (settings.fxSettings["rowBgColor"]) {
                      merged.backgroundColor = getFxStyleValue("rowBgColor", row, settings.rowBgColor || "");
                    }
                    if (settings.fxSettings["rowTextColor"]) {
                      merged.color = getFxStyleValue("rowTextColor", row, settings.rowTextColor || "");
                    }
                  }
                }

                // Evaluate Custom Conditional Formatting Rules (Sequential application)
                if (settings.customRules && settings.customRules.length > 0) {
                  settings.customRules.forEach((rule) => {
                    let cellVal: string | number = "";
                    if (colId === "name") {
                      cellVal = row.cleanName || "";
                    } else if (colId === "actual") {
                      cellVal = row.actual;
                    } else if (colId === "budget") {
                      cellVal = row.budget;
                    } else if (colId === "variance") {
                      cellVal = varianceVal;
                    } else if (colId === "variancePct") {
                      cellVal = variancePct;
                    }

                    const match = evaluateCustomRule(colId, cellVal, row.cleanName || "", rule, row.actual, row.budget);
                    if (match.matchBg) merged.backgroundColor = match.matchBg;
                    if (match.matchText) merged.color = match.matchText;
                    if (match.matchBold) {
                      merged.fontWeight = "bold";
                    }
                  });
                }

                // ADVANCED CF PIPELINE MERGE (Overrides rules and customRules)
                const adv = getCFStyleForCell(colId);
                if (adv.background) merged.backgroundColor = adv.background;
                if (adv.foreground) merged.color = adv.foreground;
                if (adv.fontWeight) merged.fontWeight = adv.fontWeight;
                if (adv.fontStyle) merged.fontStyle = adv.fontStyle;
                if (adv.textDecoration) merged.textDecoration = adv.textDecoration;
                if (adv.borderColor) merged.borderColor = adv.borderColor;
                if (adv.borderThickness) merged.borderWidth = adv.borderThickness;
                if (adv.borderRadius) merged.borderRadius = adv.borderRadius;
                if (adv.fontSize) merged.fontSize = adv.fontSize;
                if (adv.fontFamily) merged.fontFamily = adv.fontFamily;
                if (adv.opacity !== undefined) merged.opacity = adv.opacity;
                if (adv.padding) merged.padding = adv.padding;
                if (adv.cursor) merged.cursor = adv.cursor;

                return merged;
              };

              // Visual Left Accent Ribbon for core structural segments (level 0 root lines)
              let activeAccentColor = settings.accentColor;
              if (settings.fxSettings && settings.fxSettings["accentColor"]) {
                activeAccentColor = resolveGeneralFxProperty("accentColor", settings.accentColor);
              }

              if (isExpandedParent) {
                rowStyles.borderLeft = `3px solid #f97316`; // Vibrant orange left border
              } else if (row.level === 0 && !row.isGrandTotal) {
                rowStyles.borderLeft = `3px solid ${activeAccentColor}`;
              } else if (isChildRow) {
                rowStyles.borderLeft = `3px solid #eab308`; // Rich gold left border
              } else {
                rowStyles.borderLeft = `3px solid transparent`;
              }

              // Apply theme variations on rows
              if (row.isGrandTotal) {
                if (selectedTheme === "dark" || selectedTheme === "slate") {
                  rowClass = "bg-[#0e1626] font-extrabold border-t-[3px] border-slate-700 border-b-[4px] border-double border-b-slate-700 text-slate-100";
                } else if (selectedTheme === "sepia") {
                  rowClass = "bg-[#ebdcb9]/75 font-extrabold border-t-[3px] border-[#ebdcb9] border-b-[4px] border-double border-b-[#ebdcb9] text-[#433422]";
                } else {
                  rowClass = "bg-slate-100/90 font-extrabold border-t-[3px] border-slate-800 border-b-[4px] border-double border-b-slate-800 text-slate-900";
                }
              } else if (row.isSubtotal) {
                if (selectedTheme === "dark" || selectedTheme === "slate") {
                  rowClass = "bg-[#131b2c] font-bold border-t border-slate-800 border-b-[2px] border-slate-800 text-slate-200";
                } else if (selectedTheme === "sepia") {
                  rowClass = "bg-[#eedfac]/50 font-bold border-t border-[#ebdcb9] border-b-[2px] border-[#ebdcb9] text-[#5c4a30]";
                } else {
                  rowClass = "bg-[#f8fafc] font-bold border-t border-slate-200 border-b-[2px] border-slate-200 text-slate-800";
                }
              } else if (isExpandedParent) {
                if (selectedTheme === "dark" || selectedTheme === "slate") {
                  rowClass = "bg-orange-950/20 text-orange-200 font-bold transition-colors group shadow-xs";
                } else if (selectedTheme === "sepia") {
                  rowClass = "bg-orange-100/70 text-orange-950 font-bold transition-colors group shadow-xs";
                } else {
                  rowClass = "bg-orange-500 text-slate-950 font-bold transition-colors group shadow-xs";
                }
              } else if (isChildRow) {
                if (selectedTheme === "dark" || selectedTheme === "slate") {
                  rowClass = "bg-yellow-950/10 hover:bg-yellow-905 bg-yellow-900/5 text-yellow-100/90 transition-colors group";
                } else if (selectedTheme === "sepia") {
                  rowClass = "bg-yellow-100/35 hover:bg-yellow-100/50 text-[#5c4a30] transition-colors group";
                } else {
                  rowClass = "bg-yellow-50/80 hover:bg-yellow-100/70 transition-colors group text-slate-800";
                }
              } else if (row.level === 0) {
                if (selectedTheme === "dark" || selectedTheme === "slate") {
                  rowClass = "bg-slate-900/10 font-semibold text-slate-200 hover:bg-slate-900/30";
                } else if (selectedTheme === "sepia") {
                  rowClass = "bg-[#fcfaf4]/50 font-semibold text-[#433422] hover:bg-[#ebdcb9]/20";
                } else {
                  rowClass = "bg-slate-50/30 font-semibold text-slate-800 hover:bg-slate-100/40";
                }
              }

              // Apply User-defined Row-Level Conditional Formatting Rules
              if (!row.isGrandTotal && !row.isSubtotal) {
                if (rowVarianceHighlight) {
                  if (varianceVal > 0) {
                    rowClass = "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-950 font-semibold transition-colors group";
                    rowStyles.borderLeft = `3px solid ${posColor}`;
                  } else if (varianceVal < 0) {
                    rowClass = "bg-rose-500/10 hover:bg-rose-500/20 text-rose-950 font-semibold transition-colors group";
                    rowStyles.borderLeft = `3px solid ${negColor}`;
                  } else {
                    rowClass = "bg-slate-50/40 hover:bg-slate-100/40 text-slate-850 font-medium transition-colors group";
                    rowStyles.borderLeft = "3px solid transparent";
                  }
                } else if (rowHeatmap) {
                  const maxVal = actualStats.max;
                  if (maxVal > 0) {
                    const pct = Math.max(0, Math.min(row.actual / maxVal, 1));
                    rowStyles.backgroundColor = `rgba(15, 23, 42, ${pct * 0.12})`; // Subtle midnight shade overlay
                    rowClass = "hover:bg-slate-200/30 text-slate-900 font-bold transition-colors group";
                    rowStyles.borderLeft = `3px solid ${settings.accentColor}`;
                  }
                }
              }

              // Pretty presentation for variances (GAAP accounting style represents negative numbers with parenthesis)
              const formatVarianceVal = (val: number) => {
                if (val < 0) {
                  return `(${formatNum(Math.abs(val))})`;
                }
                return val > 0 ? `+${formatNum(val)}` : formatNum(val);
              };

              const rowTypeClass = row.isGrandTotal ? "grandtotal-row" : row.isSubtotal ? "subtotal-row" : "normal-row";
              return (
                <tr key={idx} className={`${rowClass} ${rowTypeClass}`} style={rowStyles}>
                  {/* Account Name Cell (With Indented Interactive Hierarchy Controls) */}
                  <td 
                    className={`flex items-center gap-2 min-w-0 ${getNameCellPaddingClass()} ${getCFStyleForCell("name").animation === "pulse" ? "animate-pulse" : getCFStyleForCell("name").animation === "bounce" ? "animate-bounce" : ""}`} 
                    style={getColCellThemeOverride("name", { paddingLeft: `${row.level * 16 + 12}px` })}
                    title={getCFStyleForCell("name").tooltip || undefined}
                  >
                    {hasChildren ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollapsedRows(prev => ({ ...prev, [row.id]: !prev[row.id] }));
                        }}
                        className={`w-4 h-4 flex items-center justify-center rounded-md ${
                          isExpandedParent ? "text-slate-950 hover:bg-orange-600/35" : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        } transition-all focus:outline-none shrink-0 cursor-pointer`}
                        title={row.collapsed ? "Expand accounts level" : "Collapse accounts level"}
                      >
                        {row.collapsed ? (
                          <ChevronRight size={13} className="stroke-[3]" />
                        ) : (
                          <ChevronDown size={13} className="stroke-[3]" />
                        )}
                      </button>
                    ) : settings.hideEmptyExpand ? (
                      <div className="w-4 h-4 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 flex items-center justify-center shrink-0 select-none">
                        <div className={`w-1.5 h-1.5 rounded-full ${isChildRow ? "bg-amber-500 group-hover:bg-amber-600" : isExpandedParent ? "bg-slate-950" : "bg-slate-300 group-hover:bg-slate-400"} transition-colors`} />
                      </div>
                    )}
                    <span 
                      onClick={(e) => {
                        if (isDrillDownMode && hasChildren) {
                          e.stopPropagation();
                          setDrillPath(prev => [...prev, row.id]);
                          setCollapsedRows(prev => ({ ...prev, [row.id]: false }));
                          addLog(`Interactive Drill Down into category: "${row.cleanName}"`);
                        }
                      }}
                      className={`truncate leading-tight flex items-center ${
                        isDrillDownMode && hasChildren ? "cursor-zoom-in hover:underline decoration-dashed decoration-indigo-500 hover:text-indigo-650" : ""
                      } ${
                        isExpandedParent
                          ? "text-slate-950 font-bold text-xs"
                          : row.isGrandTotal 
                          ? "text-slate-900 font-bold text-xs" 
                          : row.isSubtotal 
                          ? "text-slate-900 font-bold" 
                          : isChildRow 
                          ? "text-slate-800 font-medium text-[11px]" 
                          : "text-slate-750 font-semibold"
                      }`}
                      style={rowTextColorOverride ? { color: rowTextColorOverride } : undefined}
                      title={getCFStyleForCell("name").tooltip || (isDrillDownMode && hasChildren ? "Click to Drill Down into this exact category" : undefined)}
                    >
                      {getCFStyleForCell("name").svgIcon ? (
                        <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell("name").svgIcon || "" }} />
                      ) : getCFStyleForCell("name").icon ? (
                        renderCFIcon(getCFStyleForCell("name").icon || "")
                      ) : null}
                      <span>{row.cleanName}</span>
                    </span>

                    {/* Instantly Drill Down Shortcut Hover-Only-Button */}
                    {hasChildren && !isDrillDownMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrillPath(prev => [...prev, row.id]);
                          setCollapsedRows(prev => ({ ...prev, [row.id]: false }));
                          addLog(`Instant drill shortcut triggered on: "${row.cleanName}"`);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-indigo-55 hover:text-indigo-600 text-slate-400 cursor-pointer transition-all ml-1 shrink-0"
                        title={`Direct drill-down into "${row.cleanName}"`}
                      >
                        <CornerDownRight size={10} className="stroke-[3.5]" />
                      </button>
                    )}

                    {/* Active Columns Mapping Tag */}
                    {rowsFieldLevels.length > 1 && !row.isGrandTotal && !row.isSubtotal && (
                      <span 
                        className="opacity-0 group-hover:opacity-100 scale-90 transition-all font-mono text-[8px] bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-indigo-600 rounded-sm px-1 py-0.2 select-none shrink-0 cursor-help"
                        title={`This category is part of the custom column field: ${rowsFieldLevels[row.level] || rowsFieldLevels[rowsFieldLevels.length - 1]}`}
                      >
                        {rowsFieldLevels[row.level] || rowsFieldLevels[rowsFieldLevels.length - 1] || "Dimension"}
                      </span>
                    )}
                  </td>

                  {/* Standard columns cells with conditional formatting integration */}
                  {renderedCols.map((col, cIdx) => {
                    if (isDefaultScen) {
                      if (col.id === "actual") {
                        const isEditing = editingCell?.rowId === row.id && editingCell?.colId === "actual";
                        const { cellStyles, prependedIcon, dataBarElement } = getCellFormatting(row.actual, "actual");
                        
                        if (isEditing) {
                          return (
                            <td 
                              key={col.id}
                              className="text-right font-semibold font-mono text-[11px] border-l border-slate-200/50 p-1 relative bg-white z-20"
                              style={{ width: "120px" }}
                            >
                              <input
                                type="number"
                                className="w-full bg-slate-50 border-2 border-indigo-500 rounded px-1.5 py-0.5 text-right text-[11px] font-mono text-slate-900 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none"
                                value={editingCellValue}
                                onChange={(e) => setEditingCellValue(e.target.value)}
                                onBlur={() => handleCellEditSave(row.id, "actual", Number(editingCellValue) || 0)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCellEditSave(row.id, "actual", Number(editingCellValue) || 0);
                                  } else if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={col.id}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ rowId: row.id, colId: "actual" });
                              setEditingCellValue(String(row.actual));
                            }}
                            className={`text-right font-semibold font-mono text-[11px] border-l border-slate-100/40 relative cursor-pointer hover:bg-indigo-50/30 hover:shadow-inner transition-colors group/cell ${
                              isExpandedParent ? "text-slate-950 font-bold" : "text-slate-800"
                            } ${getValueCellPaddingClass()} ${getCFStyleForCell("actual").animation === "pulse" ? "animate-pulse" : getCFStyleForCell("actual").animation === "bounce" ? "animate-bounce" : ""}`} 
                            style={getColCellThemeOverride("actual", cellStyles)}
                            title={getCFStyleForCell("actual").tooltip || "Double-click to override or distribute totals"}
                          >
                            {dataBarElement}
                            <div className="relative z-10 flex items-center justify-end">
                              <Pencil size={8} className="absolute left-1 top-1/2 -translate-y-1/2 text-indigo-500 opacity-0 group-hover/cell:opacity-100 transition-opacity stroke-[3] pointer-events-none" />
                              {getCFStyleForCell("actual").svgIcon ? (
                                <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell("actual").svgIcon || "" }} />
                              ) : getCFStyleForCell("actual").icon ? (
                                renderCFIcon(getCFStyleForCell("actual").icon || "")
                              ) : prependedIcon}
                              <span className="border-b border-dashed border-transparent group-hover/cell:border-indigo-400/50 pb-0.2">{formatNum(row.actual)}</span>
                            </div>
                          </td>
                        );
                      } else if (col.id === "budget") {
                        const isEditing = editingCell?.rowId === row.id && editingCell?.colId === "budget";
                        const { cellStyles, prependedIcon, dataBarElement } = getCellFormatting(row.budget, "budget");

                        if (isEditing) {
                          return (
                            <td 
                              key={col.id}
                              className="text-right font-medium font-mono text-[11px] border-l border-slate-200/50 p-1 relative bg-white z-20"
                              style={{ width: "120px" }}
                            >
                              <input
                                type="number"
                                className="w-full bg-slate-50 border-2 border-indigo-500 rounded px-1.5 py-0.5 text-right text-[11px] font-mono text-slate-900 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none"
                                value={editingCellValue}
                                onChange={(e) => setEditingCellValue(e.target.value)}
                                onBlur={() => handleCellEditSave(row.id, "budget", Number(editingCellValue) || 0)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCellEditSave(row.id, "budget", Number(editingCellValue) || 0);
                                  } else if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={col.id}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingCell({ rowId: row.id, colId: "budget" });
                              setEditingCellValue(String(row.budget));
                            }}
                            className={`text-right font-medium font-mono text-[11px] border-l border-slate-100/40 relative cursor-pointer hover:bg-slate-500/10 hover:shadow-inner transition-colors group/cell ${
                              isExpandedParent ? "text-slate-950/80 font-bold" : "text-slate-400"
                            } ${getValueCellPaddingClass()} ${getCFStyleForCell("budget").animation === "pulse" ? "animate-pulse" : getCFStyleForCell("budget").animation === "bounce" ? "animate-bounce" : ""}`} 
                            style={getColCellThemeOverride("budget", cellStyles)}
                            title={getCFStyleForCell("budget").tooltip || "Double-click to override or distribute budget"}
                          >
                            {dataBarElement}
                            <div className="relative z-10 flex items-center justify-end">
                              <Pencil size={8} className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-450 opacity-0 group-hover/cell:opacity-100 transition-opacity stroke-[3] pointer-events-none" />
                              {getCFStyleForCell("budget").svgIcon ? (
                                <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell("budget").svgIcon || "" }} />
                              ) : getCFStyleForCell("budget").icon ? (
                                renderCFIcon(getCFStyleForCell("budget").icon || "")
                              ) : prependedIcon}
                              <span className="border-b border-dashed border-transparent group-hover/cell:border-indigo-400/50 pb-0.2">{formatNum(row.budget)}</span>
                            </div>
                          </td>
                        );
                      } else if (col.id === "variance") {
                        const { cellStyles, prependedIcon, dataBarElement } = getCellFormatting(varianceVal, "variance");
                        const noFormatColorClass = isExpandedParent
                          ? "text-slate-950 bg-orange-600/10"
                          : varianceVal > 0 
                          ? "text-emerald-700 bg-slate-50/10" 
                          : varianceVal < 0 
                          ? "text-rose-700 bg-slate-50/10" 
                          : "text-slate-500 bg-slate-50/10";
                        return (
                          <td 
                            key={col.id}
                            className={`text-right font-bold font-mono text-[11px] border-l border-slate-200/50 relative ${
                              colTarget === "variance" && colType !== "none" ? "text-slate-950" : noFormatColorClass
                            } ${getValueCellPaddingClass()} ${getCFStyleForCell("variance").animation === "pulse" ? "animate-pulse" : getCFStyleForCell("variance").animation === "bounce" ? "animate-bounce" : ""}`} 
                            style={getColCellThemeOverride("variance", cellStyles)}
                            title={getCFStyleForCell("variance").tooltip || undefined}
                          >
                            {dataBarElement}
                            <div className="relative z-10 flex items-center justify-end">
                              {getCFStyleForCell("variance").svgIcon ? (
                                <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell("variance").svgIcon || "" }} />
                              ) : getCFStyleForCell("variance").icon ? (
                                renderCFIcon(getCFStyleForCell("variance").icon || "")
                              ) : prependedIcon}
                              <span>{formatVarianceVal(varianceVal)}</span>
                            </div>
                          </td>
                        );
                      } else if (col.id === "variancePct") {
                        const { cellStyles, prependedIcon, dataBarElement } = getCellFormatting(variancePct, "variancePct");
                        return (
                          <td 
                            key={col.id}
                            className={`text-right border-l border-slate-100/40 select-none relative ${
                              isExpandedParent ? "bg-orange-600/10 text-slate-950" : "bg-slate-50/10"
                            } ${getValueCellPaddingClass()} ${getCFStyleForCell("variancePct").animation === "pulse" ? "animate-pulse" : getCFStyleForCell("variancePct").animation === "bounce" ? "animate-bounce" : ""}`} 
                            style={getColCellThemeOverride("variancePct", cellStyles)}
                            title={getCFStyleForCell("variancePct").tooltip || undefined}
                          >
                            {dataBarElement}
                            <div className="relative z-10 flex items-center justify-end gap-1">
                              {getCFStyleForCell("variancePct").svgIcon ? (
                                <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell("variancePct").svgIcon || "" }} />
                              ) : getCFStyleForCell("variancePct").icon ? (
                                renderCFIcon(getCFStyleForCell("variancePct").icon || "")
                              ) : prependedIcon}
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                                isExpandedParent
                                  ? "bg-white/80 text-slate-950 border-orange-400"
                                  : variancePct >= 0 
                                  ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/50" 
                                  : "bg-rose-50/90 text-rose-700 border-rose-200/50"
                              }`}>
                                <span className="text-[9px] leading-none">{variancePct >= 0 ? "▲" : "▼"}</span>
                                <span>{Math.abs(variancePct).toFixed(1)}%</span>
                              </span>
                            </div>
                          </td>
                        );
                      }
                    } else {
                      const cellVal = getColumnValue(row, col.id, cIdx, renderedCols.length);
                      const { cellStyles, prependedIcon, dataBarElement } = colTarget === "actual" && col.id !== "total"
                        ? getCellFormatting(cellVal, "actual")
                        : { cellStyles: {}, prependedIcon: null, dataBarElement: null };
                      const isTotalOrSubtotal = row.isSubtotal || row.isGrandTotal || col.id === "total";
                      return (
                        <td 
                          key={col.id}
                          className={`text-right font-mono text-[11px] border-l border-slate-100/40 relative ${
                            isTotalOrSubtotal 
                              ? "font-extrabold text-slate-950 bg-slate-50/10" 
                              : isExpandedParent 
                              ? "text-slate-950 font-bold" 
                              : "text-slate-800"
                          } ${getValueCellPaddingClass()} ${getCFStyleForCell(col.id).animation === "pulse" ? "animate-pulse" : getCFStyleForCell(col.id).animation === "bounce" ? "animate-bounce" : ""}`} 
                          style={getColCellThemeOverride(col.id, cellStyles)}
                          title={getCFStyleForCell(col.id).tooltip || undefined}
                        >
                          {dataBarElement}
                          <div className="relative z-10 flex items-center justify-end">
                            {getCFStyleForCell(col.id).svgIcon ? (
                              <span className="mr-1.5 inline-block w-4 h-4 shrink-0" dangerouslySetInnerHTML={{ __html: getCFStyleForCell(col.id).svgIcon || "" }} />
                            ) : getCFStyleForCell(col.id).icon ? (
                              renderCFIcon(getCFStyleForCell(col.id).icon || "")
                            ) : prependedIcon}
                            <span>{formatNum(cellVal)}</span>
                          </div>
                        </td>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Dynamic Simulated DAX Values */}
                  {isDefaultScen && (settings.daxMeasures || []).map((m) => {
                    const daxVal = evaluateDAX(m.formula, row.actual, row.budget, row);
                    return (
                      <td key={m.id} className={`text-right font-mono text-[11px] border-l border-indigo-100/40 ${
                        isExpandedParent ? "text-slate-950 font-bold bg-orange-600/10" : "font-bold text-indigo-700 bg-indigo-50/15"
                      } ${getValueCellPaddingClass()}`} style={getColCellThemeOverride(`dax_${m.id}`)} title={`${m.name}: ${m.formula}`}>
                        {formatNum(daxVal)}
                      </td>
                    );
                  })}

                  {/* Row Commentary cell */}
                  <td className={`border-l border-slate-200 align-middle text-left font-sans text-[11px] min-w-[210px] relative ${
                    isExpandedParent ? "text-slate-950 bg-orange-600/10" : ""
                  } ${getNameCellPaddingClass()}`} style={getColCellThemeOverride("commentary")}>
                    {editingCommentRowId === row.id ? (
                      <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          id={`comment-input-${row.id}`}
                          type="text"
                          className="flex-1 text-[11px] bg-white border border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded-lg px-2 py-1 text-slate-800 font-medium shadow-2xs"
                          placeholder="Add custom commentary..."
                          value={editingCommentValue}
                          onChange={(e) => setEditingCommentValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const updated = { ...draftComments, [row.id]: editingCommentValue.trim() };
                              if (!editingCommentValue.trim()) {
                                delete updated[row.id];
                              }
                              setDraftComments(updated);
                              setComments(updated);
                              localStorage.setItem(`pbi_matrix_comments_${templateId}`, JSON.stringify(updated));
                              setEditingCommentRowId(null);
                              addLog("Saved commentary changes.");
                            } else if (e.key === "Escape") {
                              setEditingCommentRowId(null);
                            }
                          }}
                          autoFocus
                        />
                        {/* 1. Save Icon Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const updated = { ...draftComments, [row.id]: editingCommentValue.trim() };
                            if (!editingCommentValue.trim()) {
                              delete updated[row.id];
                            }
                            setDraftComments(updated);
                            setComments(updated);
                            localStorage.setItem(`pbi_matrix_comments_${templateId}`, JSON.stringify(updated));
                            setEditingCommentRowId(null);
                            addLog("Saved commentary changes.");
                            showToast("Commentary saved!");
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200/50 rounded-md transition-colors shrink-0 cursor-pointer flex items-center justify-center bg-white"
                          title="Save"
                        >
                          <Save size={12} className="stroke-[2.5]" />
                        </button>
                        {/* 2. Edit Icon Button (focuses input) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const input = document.getElementById(`comment-input-${row.id}`);
                            if (input) input.focus();
                          }}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-200/50 rounded-md transition-colors shrink-0 cursor-pointer flex items-center justify-center bg-white"
                          title="Edit (Active)"
                        >
                          <Pencil size={12} />
                        </button>
                        {/* 3. Dismiss Icon Button (discards edit) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingCommentRowId(null);
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 border border-rose-200/50 rounded-md transition-colors shrink-0 cursor-pointer flex items-center justify-center bg-white"
                          title="Dismiss"
                        >
                          <X size={12} className="stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group min-h-[22px] w-full">
                        {draftComments[row.id] ? (
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <MessageSquare size={11} className={isExpandedParent ? "text-slate-950 shrink-0" : "text-indigo-500 shrink-0"} />
                            <span className={`italic truncate max-w-[130px] leading-tight ${isExpandedParent ? "text-slate-950 font-semibold" : "text-slate-750 font-medium"}`} title={draftComments[row.id]}>
                              {draftComments[row.id]}
                            </span>
                          </div>
                        ) : (
                          <span className={`italic select-none text-[10px] ${isExpandedParent ? "text-slate-800" : "text-slate-300"}`}>No commentary</span>
                        )}
                        <div className="flex items-center gap-1 ml-1 shrink-0">
                          {/* 1. Save Icon Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast("Commentary is up to date and saved!");
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isExpandedParent 
                                ? "text-slate-950 hover:bg-orange-600/30" 
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title="Saved & Sync"
                          >
                            <Save size={11} className="stroke-[2]" />
                          </button>
                          {/* 2. Edit Icon Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCommentRowId(row.id);
                              setEditingCommentValue(draftComments[row.id] || "");
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isExpandedParent 
                                ? "text-slate-950 hover:bg-orange-600/30" 
                                : "text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title="Edit"
                          >
                            <Pencil size={11} />
                          </button>
                          {/* 3. Dismiss Icon Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (draftComments[row.id]) {
                                const updated = { ...draftComments };
                                delete updated[row.id];
                                setDraftComments(updated);
                                setComments(updated);
                                localStorage.setItem(`pbi_matrix_comments_${templateId}`, JSON.stringify(updated));
                                addLog("Dismissed and deleted commentary.");
                                showToast("Commentary dismissed!");
                              } else {
                                showToast("Nothing to dismiss.");
                              }
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isExpandedParent 
                                ? "text-slate-950 hover:bg-orange-600/30" 
                                : "text-rose-500 hover:bg-rose-50"
                            }`}
                            title="Dismiss"
                          >
                            <X size={11} className="stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full [id='pbi-visual-sandbox']">
      {/* Sandbox Header */}
      <div className="bg-slate-50/50 px-5 py-3.5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="font-display text-[11px] font-bold tracking-wider text-slate-700 uppercase">Power BI Sandbox Canvas</span>
        </div>
        <div className="flex items-center gap-2">
          {settings.enableDownloadAsExcel !== false && (
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-xs active:scale-98 cursor-pointer shadow-xs select-none"
              title="Download formatted spreadsheet directly to Excel"
            >
              <FileSpreadsheet size={13} className="shrink-0" />
              <span>Export to Excel</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowWritebackPanel(!showWritebackPanel);
              showToast(showWritebackPanel ? "Closed Writeback Configurations" : "Opened Inforiver Writeback Console");
            }}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-xs active:scale-98 cursor-pointer shadow-xs select-none ${
              showWritebackPanel 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 animate-pulse"
            }`}
            title="Configure and trigger Inforiver-compatible writebacks & allocate parent values"
          >
            <Database size={13} className="shrink-0" />
            <span>Writeback Center</span>
            {Object.keys(cellEdits).length > 0 && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-bounce shrink-0" />
            )}
          </button>

          {/* Top-Right Interactive Help Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHelpModal(true);
              showToast("Opened visual help and tutorial modal");
            }}
            className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all cursor-pointer relative shadow-3xs"
            title="Help Guidance - Open interactive tutorial popup"
            aria-label="Help"
          >
            <HelpCircle size={14} className="stroke-[2.5]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
            </span>
          </button>

          {/* Top-Right Interactive Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsPopover(!showSettingsPopover);
              showToast(showSettingsPopover ? "Closed formatting configuration options" : "Opened formatting options and theme customizers");
            }}
            className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer shadow-3xs ${
              showSettingsPopover 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40 hover:border-indigo-200'
            }`}
            title="Formatting & Themes Settings - Toggle format panel"
            aria-label="Format Settings"
          >
            <Settings 
              size={14} 
              className={showSettingsPopover ? "animate-spin text-white" : "text-slate-500"} 
              style={{ animationDuration: '6s' }} 
            />
          </button>
        </div>
      </div>

      {showWritebackPanel && (
        <div className="bg-slate-900 text-slate-100 p-4 border-b border-slate-800 transition-all shadow-md select-none shrink-0" id="inforiver-writeback-dashboard">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left side: Configuration */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <Database className="text-indigo-400" size={16} />
                  <h3 className="font-semibold text-xs tracking-wide uppercase text-slate-200">
                    Inforiver-style Writeback Console
                  </h3>
                </div>
                <div className="text-[10px] font-mono bg-indigo-900/40 text-indigo-300 border border-indigo-805 rounded px-1.5 py-0.5">
                  {Object.keys(cellEdits).length} overrides active
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                    Destination target
                  </label>
                  <select
                    value={writebackDestination}
                    onChange={(e) => setWritebackDestination(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs rounded-md text-slate-105 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="local">Local Memory Storage (Simulated)</option>
                    <option value="webhook">REST Webhook API Dispatcher</option>
                    <option value="postgres">Relational DB Server (SQL Writeback)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                    Manual override actions
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={executeServerWriteback}
                      disabled={isWritingBack}
                      className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors font-sans text-xs shrink-0 cursor-pointer"
                    >
                      {isWritingBack ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Send size={11} />
                      )}
                      <span>Run Writeback</span>
                    </button>
                    
                    <button
                      onClick={handleResetAllEdits}
                      className="flex items-center justify-center bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 text-slate-300 rounded-md p-1.5 cursor-pointer transition-colors"
                      title="Clear and reset all direct overrides"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {writebackDestination === "webhook" && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    Webhook Trigger Endpoint URL
                  </span>
                  <div className="flex gap-2">
                    <Globe size={13} className="text-slate-400 mt-1.5 shrink-0" />
                    <input
                      type="url"
                      placeholder="https://prod-webhook.powerautomate.com/workflows/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-100 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-[9px] text-slate-505 font-medium block">
                    Submits a clean structured JSON document with full filtered hierarchies for Power Automate triggers or custom API proxies.
                  </span>
                </div>
              )}
            </div>

            {/* Right side: Auditing logs & historical records */}
            <div className="w-full md:w-80 bg-slate-950/70 rounded-lg p-3 border border-slate-800 flex flex-col h-[155px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 font-sans">
                  <Server size={10} className="text-emerald-400" />
                  Audit logs & History ({writebackRecords.length})
                </span>
                <span className="text-[9px] bg-emerald-950/50 text-emerald-400 px-1 py-0.2 rounded font-semibold tracking-wide border border-emerald-900 border-opacity-50">
                  ONLINE
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[10px] font-mono scrollbar-thin scrollbar-thumb-slate-800">
                {writebackRecords.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center text-[10px] py-4">
                    <Database size={16} className="text-slate-600 mb-1 animate-pulse" />
                    <span>No writebacks committed yet.</span>
                  </div>
                ) : (
                  writebackRecords.map((r: any, idx) => (
                    <div key={idx} className="bg-slate-900 hover:bg-indigo-950/20 p-2 rounded border border-slate-800 hover:border-indigo-900/50 transition-colors flex flex-col gap-1 text-[9px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-indigo-300">{r.id}</span>
                        <span className="text-[8px] text-slate-505">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>Target: {String(r.destination).toUpperCase()}</span>
                        <span className="text-[8px] text-indigo-400 font-bold">{r.editsCount} edits stored</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sandbox Canvas Splitter */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#f9fafb]">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">
          <div
            ref={containerRef}
            style={{ width: viewport.width, height: viewport.height }}
            className="bg-white border border-gray-150 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative flex flex-col overflow-hidden max-w-full max-h-full"
          >
            {renderSettingsPopover()}

            {/* Visual Frame Title Bar (Power BI Spec) */}
            <div 
              className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 select-none transition-colors duration-300"
              style={{ 
                backgroundColor: resolveGeneralFxProperty("titleBgColor", settings.titleBgColor || "#f1f5f9"),
                color: resolveGeneralFxProperty("titleTextColor", settings.titleTextColor || "#1e293b")
              }}
            >
              <span className="text-[11px] font-bold font-display tracking-tight flex items-center gap-2" style={{ color: "inherit" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: resolveGeneralFxProperty("accentColor", settings.accentColor || "#357ae8") }} />
                <span>{settings.showTitle ? resolveGeneralFxProperty("titleText", settings.titleText || "Financial Matrix") : "Custom Visual Report Canvas"}</span>
              </span>
              <div className="flex items-center gap-2">
                {/* 5. Help Icon Button (Opens interactive tutorial model; leftmost icon) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHelpModal(true);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-2xs transition-all cursor-pointer relative"
                  title="Help"
                >
                  <HelpCircle size={13} className="stroke-[2.2]" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </button>

                {/* 4. Expand and Collapse Row Toggle Icons */}
                {settings.showGroupExpand !== false && (
                  <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        expandAllRows();
                      }}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                      title="Expand"
                    >
                      <ChevronsUpDown size={12} className="stroke-[2.5]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        collapseAllRows();
                      }}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                      title="Collapse"
                    >
                      <ChevronsDownUp size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                )}

                {/* 3. Open in Bigger Window (Maximize) Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    addLog("Opened matrix in maximized popup mode.");
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-200 hover:shadow-2xs transition-all cursor-pointer"
                  title="Maximize"
                >
                  <Maximize2 size={13} className="stroke-[2.2]" />
                </button>

                {/* 2. Download Excel Workbook Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportToExcel();
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:bg-slate-50 hover:border-emerald-200 hover:shadow-2xs transition-all cursor-pointer"
                  title="Download"
                >
                  <Download size={13} className="stroke-[2]" />
                </button>

                {/* 1. Setting Icon Button (opens options; rightmost icon) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsPopover(!showSettingsPopover);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                    showSettingsPopover 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 bg-white hover:border-indigo-200 hover:shadow-2xs'
                  }`}
                  title="Setting"
                >
                  <Settings 
                    size={13} 
                    className={showSettingsPopover ? "animate-spin text-white" : "text-slate-500"} 
                    style={{ animationDuration: '6s' }} 
                  />
                </button>
              </div>
            </div>

            {/* Render Target containing mock canvas viewport */}
            <div className="flex-1 relative overflow-hidden" style={{ minWidth: 200, minHeight: 150 }}>
              {renderMatrixVisualHTML()}
            </div>

            {/* Simulated Report Page Footer details */}
            <div className="bg-gray-50/50 border-t border-gray-100 px-3 py-1.5 flex justify-between items-center text-[10px] text-gray-400 font-mono">
              <span>{viewport.width} &times; {viewport.height} px</span>
              <span className="uppercase tracking-wider font-bold text-[8px] text-gray-300">Live Custom Viewport</span>
            </div>

            {/* Resize handle in the bottom right */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-[2px] hover:bg-gray-50 transition-colors"
              title="Drag to resize custom visual boundaries"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-300 fill-current">
                <path d="M6 0 L8 0 L8 8 L0 8 L0 6 L4 6 L4 4 L6 4 Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Life-cycle Event Logs Pane */}
        <div className={`bg-white border-t border-gray-100 flex flex-col text-xs transition-all duration-200 ${showLogs ? "h-32" : "h-8"}`}>
          <div className="px-3.5 py-1.5 bg-gray-50/55 border-b border-gray-100 text-[10px] font-mono text-gray-400 flex items-center justify-between">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-1.5 font-bold tracking-widest uppercase text-gray-400 hover:text-gray-700 transition-colors cursor-pointer select-none focus:outline-none"
              title={showLogs ? "Hide lifecycle events console" : "Show lifecycle events console"}
            >
              <RefreshCw size={11} className={`text-gray-400 ${showLogs ? "animate-spin-slow" : ""}`} />
              <span>Power BI Lifecycle Events ({showLogs ? "Hide" : "Show"})</span>
            </button>
            {showLogs ? (
              <button
                onClick={() => setLogs([])}
                className="text-[9px] uppercase tracking-wider font-bold text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                Clear
              </button>
            ) : (
              <span className="text-[9px] text-gray-300 font-mono italic">
                {logs.length > 0 ? `${logs.length} events logged` : "No events recorded"}
              </span>
            )}
          </div>
          {showLogs && (
            <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[10px] text-gray-650 text-gray-650 space-y-1.5 scrollbar-thin select-text bg-white">
              {logs.length === 0 ? (
                <div className="text-gray-300 italic py-2 text-center font-sans text-[11px]">No lifecycle events recorded yet. Modify dataset matrix to trigger.</div>
              ) : (
                logs.map((log, index) => {
                  const isUpdate = log.includes("update(");
                  const isResize = log.includes("resized");
                  return (
                    <div
                      key={index}
                      className={`leading-relaxed py-0.5 border-l-2 pl-2 ${
                        isUpdate 
                          ? "text-gray-900 border-black font-semibold" 
                          : isResize 
                          ? "text-gray-500 border-gray-300" 
                          : "text-gray-400 border-gray-150"
                      }`}
                    >
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Expanded View Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden border border-gray-100 relative"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 text-slate-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-xs tracking-wider font-mono text-slate-500 uppercase">
                  Matrix Advanced Viewer Mode
                </span>
                <span className="text-slate-400 px-2">|</span>
                <span className="text-xs text-slate-800 font-semibold">
                  {settings.showTitle ? resolveGeneralFxProperty("titleText", settings.titleText || "Financial Matrix") : "Interactive Financial Matrix Report"}
                </span>
              </div>
              
              <div className="flex items-center gap-2 font-sans">
                {/* 5. Help Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHelpModal(true);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-200 hover:shadow-2xs transition-all cursor-pointer relative"
                  title="Help"
                >
                  <HelpCircle size={13} className="stroke-[2.2]" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </button>

                {/* 4. Expand and Collapse Row Toggle Icons */}
                <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      expandAllRows();
                    }}
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                    title="Expand"
                  >
                    <ChevronsUpDown size={12} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      collapseAllRows();
                    }}
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer"
                    title="Collapse"
                  >
                    <ChevronsDownUp size={12} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* 3. Close/Minimize Icon Button Just before download */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-100 hover:bg-red-50 hover:text-red-650 hover:text-red-600 hover:border-red-200 hover:shadow-2xs transition-all cursor-pointer"
                  title="Minimize"
                >
                  <Minimize2 size={13} className="stroke-[2.2]" />
                </button>

                {/* 2. Download Excel Workbook Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportToExcel();
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:bg-slate-50 hover:border-emerald-200 hover:shadow-2xs transition-all cursor-pointer"
                  title="Download"
                >
                  <Download size={13} className="stroke-[2]" />
                </button>

                {/* 1. Setting Icon Button (opens options; rightmost icon) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettingsPopover(!showSettingsPopover);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                    showSettingsPopover 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 bg-white hover:border-indigo-200 hover:shadow-2xs'
                  }`}
                  title="Setting"
                >
                  <Settings 
                    size={13} 
                    className={showSettingsPopover ? "animate-spin text-white" : "text-slate-500"} 
                    style={{ animationDuration: '6s' }} 
                  />
                </button>
              </div>
            </div>

            {renderSettingsPopover()}

            {/* Modal Body containing renderMatrixVisualHTML */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/50 p-6 flex flex-col">
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                  {renderMatrixVisualHTML()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-sans">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-bold">ESC</span>
                <span>or click the close icon to dismiss larger window view</span>
              </div>
              <span className="font-mono text-[10px] text-gray-400">Profitbase Hierarchy Sandbox Engine &bull; Shared Sync State</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Interactive Training & Walkthrough Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-indigo-400 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider font-mono">Visual Matrix &bull; Interactive Guide</span>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed max-w-full">
              <p className="text-slate-500 text-center pb-2 border-b border-slate-100 font-medium">
                Welcome to the Financial Matrix Visual! Here is a simple walkthrough to help you master this interactive reporting component.
              </p>

              {/* 1. Hierarchy Group */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <ChevronsUpDown size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Hierarchy Drill-Down & Control</h4>
                  <p className="text-slate-600">
                    Click the interactive <span className="bg-slate-100 rounded px-1 py-0.5 font-bold font-mono">+</span> and <span className="bg-slate-100 rounded px-1 py-0.5 font-bold font-mono">-</span> expander buttons on parent category rows to expand or collapse child levels in realtime. Use the <strong>Hierarchy Toggle Icons</strong> in the header to expand or collapse all rows simultaneously.
                  </p>
                </div>
              </div>

              {/* 2. Format & Layout Preferences Group */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 mt-0.5">
                  <Settings size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Visual Formatting & Settings</h4>
                  <p className="text-slate-600">
                    Click the <strong>Settings</strong> cog icon in the header to open the Format & Preference popover. Customize the visual grid theme (Light, Sepia, Dark, Slate), font families, row padding density (Dense, Cozy, Luxe), toggle grid lines, or enable the left-border hierarchy accent ribbon.
                  </p>
                </div>
              </div>

              {/* 3. Financial Number Scaling Group */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg shrink-0 mt-0.5 font-mono text-[9px] font-bold h-9 w-9 flex items-center justify-center">
                  $M
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Number Display Units Selection</h4>
                  <p className="text-slate-600">
                    Need standard financial units? Turn on <strong>Financial Number Scaling</strong> in the Settings popover to toggle dividing values by thousands (<strong>K</strong>) or millions (<strong>M</strong>), or revert back to standard <strong>Whole</strong> numbers with decimals automatically.
                  </p>
                </div>
              </div>

              {/* 4. Commentary & Annotations Group */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Save size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Saving Financial Commentary</h4>
                  <p className="text-slate-600">
                    Double-click any numeric cell to add personalized inline cell notes, or type in the custom <strong>Row Commentary</strong> column directly. Click the <strong>Save</strong> button in the visual header to permanently preserve your work across sessions in your browser.
                  </p>
                </div>
              </div>

              {/* 5. Download Export Group */}
              <div className="flex gap-3.5 items-start">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0 mt-0.5">
                  <Download size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Export Matrix to Excel File</h4>
                  <p className="text-slate-600">
                    Click the <strong>Download</strong> icon in the header bar to immediately compile, format, and export current data into a fully compatible Microsoft Excel spreadsheet. Your current filter selections and calculations will be exported with the workbook.
                  </p>
                </div>
              </div>

              {/* 6. Power BI Desktop Sync Guide */}
              <div className="flex gap-3.5 items-start pt-3.5 border-t border-dashed border-slate-100">
                <div className="p-2 bg-rose-50 text-rose-700 rounded-lg shrink-0 mt-0.5 animate-pulse">
                  <ShieldCheck size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 text-rose-700">Desktop Power BI Visual Alignment</h4>
                  <div className="text-slate-600 font-medium bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/40 mt-1 space-y-1.5 list-none">
                    <div>&bull; <strong>Formatting Properties:</strong> Toggle visual themes, fonts, commentary boxes, and column settings inside the <strong>Power BI Formatting Pane</strong> on the right hand side of the desktop screen.</div>
                    <div>&bull; <strong>Hierarchy Tree:</strong> Drag multiple fields into the <strong>Rows Well</strong> in Power BI to automatically spawn the expandable/collapsible tree in your report.</div>
                    <div>&bull; <strong>Commentary Sync:</strong> Text comments entered in Power BI require an active Commentary string data field mapped to enable cross-report persistence.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition-colors"
                title="Dismiss Guide"
              >
                Got It, Thanks!
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Toast Notification system */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-full py-2.5 px-4 flex items-center gap-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] text-[11px] font-sans font-semibold animate-bounce-short"
          style={{ animationDuration: '2.5s' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
