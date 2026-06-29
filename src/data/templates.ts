import { VisualTemplate } from "../types";

export const templates: VisualTemplate[] = [
  {
    id: "matrix",
    name: "Financial Matrix",
    description: "Hierarchical reporting matrix modeled on the Profitbase Financial Matrix. Supports expand/collapse headers, parent row aggregations, Actual vs. Budget tracking, variance calculations, and conditional format styling.",
    difficulty: "Advanced",
    icon: "Table",
    files: {
      "pbiviz.json": `{
  "visual": {
    "name": "profitbaseFinancialMatrix",
    "displayName": "Profitbase Financial Matrix",
    "guid": "ProfitbaseFinancialMatrix554A1",
    "visualClassName": "ProfitbaseFinancialMatrix",
    "version": "1.0.0.0",
    "description": "Premium hierarchical P&L table statement custom visual.",
    "supportUrl": "https://powerbi.microsoft.com",
    "gitHubUrl": ""
  },
  "apiVersion": "5.3.0",
  "author": {
    "name": "Power BI Custom Visual Developer",
    "email": "dev@financial-matrix.com"
  },
  "assets": {
    "icon": "assets/icon.png"
  },
  "externalJS": [],
  "style": "style/visual.less",
  "capabilities": "capabilities.json",
  "privileges": [
    {
      "name": "ExportContent",
      "essential": true
    }
  ]
}`,
      "capabilities.json": `{
  "dataRoles": [
    {
      "displayName": "Rows (Hierarchy)",
      "name": "rows",
      "kind": "Grouping"
    },
    {
      "displayName": "Columns (Scenario)",
      "name": "columns",
      "kind": "Grouping"
    },
    {
      "displayName": "Values (Measures)",
      "name": "values",
      "kind": "Measure"
    }
  ],
  "dataViewMappings": [
    {
      "categorical": {
        "categories": {
          "select": [
            { "bind": { "to": "rows" } },
            { "bind": { "to": "columns" } }
          ]
        },
        "values": {
          "select": [
            { "bind": { "to": "values" } }
          ]
        }
      }
    }
  ],
  "objects": {
    "gridTheme": {
      "displayName": "Grid Theme & Styles",
      "properties": {
        "selectedTheme": {
          "displayName": "Theme Preset",
          "type": {
            "enumeration": [
              { "value": "light", "displayName": "Light (Clean)" },
              { "value": "dark", "displayName": "Dark (Modern)" },
              { "value": "slate", "displayName": "Slate (Professional)" },
              { "value": "sepia", "displayName": "Sepia (Warm)" }
            ]
          }
        },
        "fontFamily": {
          "displayName": "Font Family Typeface",
          "type": {
            "enumeration": [
              { "value": "sans", "displayName": "Inter (Sans)" },
              { "value": "display", "displayName": "Space Jakarta" },
              { "value": "mono", "displayName": "JetBrains Mono" },
              { "value": "serif", "displayName": "Georgia (Serif)" },
              { "value": "segoe", "displayName": "Segoe Condensed" },
              { "value": "aptos", "displayName": "Aptos" }
            ]
          }
        },
        "fontSize": {
          "displayName": "Font Size",
          "type": {
            "integer": true
          }
        },
        "rowPadding": {
          "displayName": "Padding Density",
          "type": {
            "enumeration": [
              { "value": "compact", "displayName": "Compact (Dense)" },
              { "value": "cozy", "displayName": "Cozy (Standard)" },
              { "value": "spacious", "displayName": "Spacious (Luxe)" }
            ]
          }
        },
        "showGridLines": {
          "displayName": "Show Cell Gridlines",
          "type": {
            "bool": true
          }
        },
        "highlightSubtotals": {
          "displayName": "Highlight & Bold Subtotals",
          "type": {
            "bool": true
          }
        },
        "showAccentBorders": {
          "displayName": "Hierarchy Accent Ribbon",
          "type": {
            "bool": true
          }
        },
        "columnWidthMode": {
          "displayName": "Column Width Mode",
          "type": {
            "enumeration": [
              { "value": "auto", "displayName": "Auto-Fit Content" },
              { "value": "fixed", "displayName": "Fixed Width (px)" }
            ]
          }
        },
        "columnWidthValue": {
          "displayName": "Fixed Column Width (px)",
          "type": {
            "integer": true
          }
        },
        "rowHeightMode": {
          "displayName": "Row Height Mode",
          "type": {
            "enumeration": [
              { "value": "auto", "displayName": "Auto-Fit" },
              { "value": "fixed", "displayName": "Fixed Height (px)" }
            ]
          }
        },
        "rowHeightValue": {
          "displayName": "Fixed Row Height (px)",
          "type": {
            "integer": true
          }
        },
        "headerBgColor": {
          "displayName": "Header Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "headerTextColor": {
          "displayName": "Header Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "rowBgColor": {
          "displayName": "Row Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "rowTextColor": {
          "displayName": "Row Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "subtotalBgColor": {
          "displayName": "Subtotal Row Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "subtotalTextColor": {
          "displayName": "Subtotal Row Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "grandtotalBgColor": {
          "displayName": "Grand Total Row Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "grandtotalTextColor": {
          "displayName": "Grand Total Row Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "hoverBgColor": {
          "displayName": "Row Hover Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "gridLineColor": {
          "displayName": "Grid Line Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "accentColor": {
          "displayName": "Accent Ribbon Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "hideEmptyExpand": {
          "displayName": "Hide Empty Expand Buttons",
          "type": {
            "bool": true
          }
        }
      }
    },
    "numberFormatting": {
      "displayName": "Number Formats",
      "properties": {
        "formatStyle": {
          "displayName": "Financial Scale Unit",
          "type": {
            "enumeration": [
              { "value": "whole", "displayName": "Whole Numbers" },
              { "value": "thousand", "displayName": "Thousands (K)" },
              { "value": "million", "displayName": "Millions (M)" }
            ]
          }
        }
      }
    },
    "toolbarSettings": {
      "displayName": "Table Header Toolbar",
      "properties": {
        "showToolbar": {
          "displayName": "Show Heading Toolbar",
          "type": {
            "bool": true
          }
        },
        "showTitle": {
          "displayName": "Show Reporting Title",
          "type": {
            "bool": true
          }
        },
        "titleText": {
          "displayName": "Title Text Content",
          "type": {
            "text": true
          }
        },
        "titleBgColor": {
          "displayName": "Title Background Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "titleTextColor": {
          "displayName": "Title Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "showExpandCollapse": {
          "displayName": "Show Expand/Collapse All",
          "type": {
            "bool": true
          }
        },
        "showExport": {
          "displayName": "Show Export XLS (Download)",
          "type": {
            "bool": true
          }
        },
        "showMaximize": {
          "displayName": "Show Focus/Maximize Button",
          "type": {
            "bool": true
          }
        }
      }
    },
    "commentaryColumn": {
      "displayName": "Hierarchy Commentary",
      "properties": {
        "showCommentary": {
          "displayName": "Enable Custom Notes Column",
          "type": {
            "bool": true
          }
        }
      }
    },
    "conditionalFormatting": {
      "displayName": "Conditional Formats",
      "properties": {
        "enableRowVarianceFormatting": {
          "displayName": "Highlight Row Variances",
          "type": {
            "bool": true
          }
        },
        "enableRowHeatmap": {
          "displayName": "Core Revenue Heatmap",
          "type": {
            "bool": true
          }
        },
        "columnFormattingTarget": {
          "displayName": "Target Column Format",
          "type": {
            "enumeration": [
              { "value": "none", "displayName": "None" },
              { "value": "actual", "displayName": "Actual" },
              { "value": "budget", "displayName": "Budget" },
              { "value": "variance", "displayName": "Variance" },
              { "value": "variancePct", "displayName": "Variance %" }
            ]
          }
        },
        "columnFormattingType": {
          "displayName": "Format Styles Type",
          "type": {
            "enumeration": [
              { "value": "none", "displayName": "None" },
              { "value": "heatmap", "displayName": "Cell Dynamic Heatmap" },
              { "value": "databars", "displayName": "Cell Gradient Databars" },
              { "value": "icons", "displayName": "Positive/Negative Status Icons" }
            ]
          }
        },
        "positiveColor": {
          "displayName": "Favorable Positive Accent",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "negativeColor": {
          "displayName": "Unfavorable Negative Accent",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "enableExpandedHighlight": {
          "displayName": "Row Expansion Highlight",
          "type": {
            "bool": true
          }
        },
        "expandedParentBgColor": {
          "displayName": "Expanded Parent BG Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "expandedParentTextColor": {
          "displayName": "Expanded Parent Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "expandedChildBgColor": {
          "displayName": "Expanded Child BG Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "expandedChildTextColor": {
          "displayName": "Expanded Child Text Color",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "enableDaxCondFormatting": {
          "displayName": "DAX Conditional Formatting",
          "type": {
            "bool": true
          }
        },
        "daxCondMeasureId": {
          "displayName": "DAX Measure Base",
          "type": {
            "text": true
          }
        },
        "daxCondTarget": {
          "displayName": "DAX Match Target",
          "type": {
            "enumeration": [
              { "value": "rows", "displayName": "Rows Bold Highlight" },
              { "value": "columns", "displayName": "Columns Specific" },
              { "value": "all", "displayName": "All Intersectors" }
            ]
          }
        },
        "daxCondCondition": {
          "displayName": "DAX Operator Condition",
          "type": {
            "enumeration": [
              { "value": "greater", "displayName": "Greater Than" },
              { "value": "less", "displayName": "Less Than" },
              { "value": "between", "displayName": "Between Bounds" }
            ]
          }
        },
        "daxCondValue1": {
          "displayName": "Threshold / Min Bound",
          "type": {
            "numeric": true
          }
        },
        "daxCondValue2": {
          "displayName": "Max Bound",
          "type": {
            "numeric": true
          }
        },
        "daxCondBgColor": {
          "displayName": "DAX Highlight BG",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "daxCondTextColor": {
          "displayName": "DAX Highlight Font",
          "type": {
            "fill": {
              "solid": {
                "color": {
                  "supportsConditionalFormatting": true
                }
              }
            }
          }
        },
        "daxMeasuresJson": {
          "displayName": "DAX Measures List (JSON)",
          "type": {
            "text": true
          }
        },
        "customRulesJson": {
          "displayName": "Conditional Formatting Rules (JSON)",
          "type": {
            "text": true
          }
        }
      }
    }
  },
  "privileges": [
    {
      "name": "ExportContent",
      "essential": true
    }
  ]
}`,
      "src/visual.ts": `/* eslint-disable */
import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import { select as d3Select, Selection } from "d3-selection";
import * as XLSX from "xlsx";

// Safe robust helper to retrieve capability properties with default values
function getValue<T>(object: any, propertyName: string, defaultValue: T): T {
    if (object && object[propertyName] !== undefined && object[propertyName] !== null) {
        const property = object[propertyName];
        if (typeof property === "object" && property.solid && property.solid.color !== undefined) {
            return property.solid.color as unknown as T;
        }
        return property as T;
    }
    return defaultValue;
}

// Helper to evaluate mock DAX formulas dynamically based on actual and budget metrics
function evaluateDAX(formula: string, actual: number, budget: number, rowContext?: any): any {
    const cleaned = (formula || "").trim();
    if (!cleaned) return 0;

    // Pre-normalize common typos in LEFT/RIGHT/MID: Left[Account Code] -> LEFT([Account Code])
    let expr = cleaned
        .replace(/LEFT\\s*\\[([^\\]]+)\\]\\s*,\\s*([0-9]+)/gi, "LEFT([$1], $2)")
        .replace(/RIGHT\\s*\\[([^\\]]+)\\]\\s*,\\s*([0-9]+)/gi, "RIGHT([$1], $2)");

    let categoryName = "";
    if (rowContext) {
        categoryName = (rowContext.category || rowContext.cleanName || rowContext.name || "").trim();
    }
    
    let accountCode = categoryName;
    const leadingCodeMatch = categoryName.match(/^([0-9\\.\\-\\/]+)/);
    if (leadingCodeMatch) {
        accountCode = leadingCodeMatch[1].trim();
    }

    const variance = actual - budget;
    const variancePct = budget !== 0 ? (variance / budget) * 100 : 0;

    // Perform substitutions of column bracket references
    expr = expr
        .replace(/\\[Actual\\]/gi, String(actual))
        .replace(/\\[Sales\\]/gi, String(actual))
        .replace(/\\[Budget\\]/gi, String(budget))
        .replace(/\\[Variance\\]/gi, String(variance))
        .replace(/\\[Profit\\]/gi, String(variance))
        .replace(/\\[VariancePct\\]/gi, String(variancePct))
        .replace(/\\[Variance\\s*%\\]/gi, String(variancePct))
        .replace(/\\[Account\\s*Code\\]/gi, JSON.stringify(accountCode))
        .replace(/\\[AccountCode\\]/gi, JSON.stringify(accountCode))
        .replace(/\\[Code\\]/gi, JSON.stringify(accountCode))
        .replace(/\\[Account\\]/gi, JSON.stringify(categoryName))
        .replace(/\\[Category\\]/gi, JSON.stringify(categoryName))
        .replace(/\\[Name\\]/gi, JSON.stringify(categoryName))
        .replace(/\\[Description\\]/gi, JSON.stringify(categoryName))
        .replace(/\\[Account\\s*Name\\]/gi, JSON.stringify(categoryName))
        .replace(/\\[AccountName\\]/gi, JSON.stringify(categoryName));

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
        subExpr = subExpr.replace(/DIVIDE\\s*\\(([^,]+),([^)]+)\\)/gi, "($1)/($2)");
        subExpr = subExpr.replace(/AVERAGE\\s*\\(([^,]+),([^)]+)\\)/gi, "(($1)+($2))/2");
        subExpr = subExpr.replace(/SUM\\s*\\(([^,]+),([^)]+)\\)/gi, "(($1)+($2))");

        // String manipulation function regex replacements inside evalMath:
        // 1. LEFT(str, len)
        subExpr = subExpr.replace(/LEFT\\s*\\(([^,]+),([^)]+)\\)/gi, (match, s, len) => {
            const evaluatedStr = evalMath(s);
            const evaluatedLen = Number(evalMath(len)) || 0;
            return JSON.stringify(String(evaluatedStr).substring(0, evaluatedLen));
        });

        // 2. RIGHT(str, len)
        subExpr = subExpr.replace(/RIGHT\\s*\\(([^,]+),([^)]+)\\)/gi, (match, s, len) => {
            const evaluatedStr = evalMath(s);
            const evaluatedLen = Number(evalMath(len)) || 0;
            const str = String(evaluatedStr);
            return JSON.stringify(str.substring(Math.max(0, str.length - evaluatedLen)));
        });

        // 3. MID(str, start, len)
        subExpr = subExpr.replace(/MID\\s*\\(([^,]+),([^,]+),([^)]+)\\)/gi, (match, s, start, len) => {
            const evaluatedStr = evalMath(s);
            const evaluatedStart = Number(evalMath(start)) || 1;
            const evaluatedLen = Number(evalMath(len)) || 0;
            const str = String(evaluatedStr);
            const actualStart = Math.max(0, evaluatedStart - 1);
            return JSON.stringify(str.substring(actualStart, actualStart + evaluatedLen));
        });

        // 4. UPPER(str)
        subExpr = subExpr.replace(/UPPER\\s*\\(([^)]+)\\)/gi, (match, s) => {
            return JSON.stringify(String(evalMath(s)).toUpperCase());
        });

        // 5. LOWER(str)
        subExpr = subExpr.replace(/LOWER\\s*\\(([^)]+)\\)/gi, (match, s) => {
            return JSON.stringify(String(evalMath(s)).toLowerCase());
        });

        // 6. TRIM(str)
        subExpr = subExpr.replace(/TRIM\\s*\\(([^)]+)\\)/gi, (match, s) => {
            return JSON.stringify(String(evalMath(s)).trim());
        });

        // 7. LEN(str)
        subExpr = subExpr.replace(/LEN\\s*\\(([^)]+)\\)/gi, (match, s) => {
            return String(String(evalMath(s)).length);
        });

        // Replace single '=' with '==' and '<>' with '!=' for JS engine evaluation, except when inside Lookbehind
        let safeSubExpr = subExpr;
        safeSubExpr = safeSubExpr.replace(/(?<![<>=])=(?![=])/g, "==");
        safeSubExpr = safeSubExpr.replace(/<>/g, "!=");

        try {
            const result = new Function("return (" + safeSubExpr + ");")();
            return result;
        } catch (err) {
            return trimmed;
        }
    };

    // Robust paren-aware IF evaluator
    while (true) {
        const ifMatch = expr.match(/IF\\s*\\(/i);
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
            const stringified = typeof resolvedVal === "string" ? '"' + resolvedVal + '"' : String(resolvedVal);
            
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
}

// Helpers to resolve the active columns to show based on the Columns Field input
function getActiveColumns(columnsRole: string, valuesRole: string = ""): { label: string; id: string; isNumeric: boolean }[] {
    const columnsStr = (columnsRole || "").trim();
    const valuesStr = (valuesRole || "").trim();

    const valueFields = valuesStr 
        ? valuesStr.split(",").map(s => s.trim()).filter(Boolean)
        : ["Actual", "Budget"];

    if (!columnsStr) {
        return valueFields.map((field, i) => ({
            label: field,
            id: i === 0 ? "actual" : i === 1 ? "budget" : "measure-" + i,
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

function getColumnValue(
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

interface FinancialRow {
    rawCategory: string;
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
}

export class ProfitbaseFinancialMatrix implements IVisual {
    private target: HTMLElement;
    private container: Selection<HTMLDivElement, any, any, any>;
    private host: any = null;
    private collapsedState: { [key: string]: any } = {};
    private isMaximized: boolean = false;
    private isHelpOpen: boolean = false;
    private isSettingsOpen: boolean = false;
    private lastOptions: VisualUpdateOptions | null = null;
    private editingCommentRowId: string | null = null;
    private editingCommentValue: string | null = null;
    private settingOverrides: any = {
        gridTheme: {},
        toolbarSettings: {},
        numberFormatting: {},
        conditionalFormatting: {}
    };
    private currentSettings = {
        gridTheme: {
            selectedTheme: "light",
            fontFamily: "sans",
            fontSize: 11,
            rowPadding: "cozy",
            showGridLines: true,
            highlightSubtotals: true,
            showAccentBorders: true,
            columnWidthMode: "auto",
            columnWidthValue: 120,
            rowHeightMode: "auto",
            rowHeightValue: 32,
            headerBgColor: "",
            headerTextColor: "",
            rowBgColor: "",
            rowTextColor: "",
            subtotalBgColor: "",
            subtotalTextColor: "",
            grandtotalBgColor: "",
            grandtotalTextColor: "",
            hoverBgColor: "",
            gridLineColor: "",
            accentColor: "",
            hideEmptyExpand: false
        },
        toolbarSettings: {
            showToolbar: true,
            showTitle: true,
            titleText: "Financial Matrix",
            titleBgColor: "",
            titleTextColor: "",
            showExpandCollapse: true,
            showExport: true,
            showMaximize: true
        },
        numberFormatting: {
            formatStyle: "whole"
        },
        commentaryColumn: {
            showCommentary: true
        },
        conditionalFormatting: {
            enableRowVarianceFormatting: false,
            enableRowHeatmap: false,
            columnFormattingTarget: "none",
            columnFormattingType: "none",
            positiveColor: "#10b981",
            negativeColor: "#ef4444",
            enableExpandedHighlight: false,
            expandedParentBgColor: "#f8fafc",
            expandedParentTextColor: "#0f172a",
            expandedChildBgColor: "#ffffff",
            expandedChildTextColor: "#334155",
            enableDaxCondFormatting: false,
            daxCondMeasureId: "",
            daxCondTarget: "all",
            daxCondCondition: "greater",
            daxCondValue1: 100000,
            daxCondValue2: 1000000,
            daxCondBgColor: "#f0fdf4",
            daxCondTextColor: "#15803d",
            daxMeasuresJson: "[]",
            customRulesJson: "[]"
        }
    };

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.container = d3Select(this.target)
            .append("div")
            .classed("financial-matrix-container", true);
        this.host = options.host;
    }

    public update(options: VisualUpdateOptions) {
        this.lastOptions = options;
        this.container.selectAll("*").remove(); // Clean slate

        const dataView = options.dataViews[0];
        if (!dataView || !dataView.categorical) {
            this.container.selectAll("*").remove();
            return;
        }

        const rowCategories = dataView.categorical.categories 
            ? dataView.categorical.categories.filter(c => c.source.roles && c.source.roles["rows"])
            : [];
        const valueMeasures = dataView.categorical.values 
            ? dataView.categorical.values.filter(v => v.source.roles && v.source.roles["values"])
            : [];

        if (rowCategories.length === 0 || valueMeasures.length === 0) {
            this.container.selectAll("*").remove(); // Completely blank
            return;
        }

        const categories = rowCategories[0].values;
        const actuals = valueMeasures[0] ? valueMeasures[0].values : [];
        const budgets = valueMeasures[1] ? valueMeasures[1].values : [];

        // --- Retrieve dynamic settings from capabilities properties pane ---
        const metadata = dataView.metadata;
        const objects = metadata && metadata.objects ? metadata.objects : {};

        // 1. Grid Theme & Styles properties
        const gridThemeObj = objects["gridTheme"] || {};
        this.currentSettings.gridTheme.selectedTheme = getValue<string>(gridThemeObj, "selectedTheme", this.currentSettings.gridTheme.selectedTheme || "light");
        this.currentSettings.gridTheme.fontFamily = getValue<string>(gridThemeObj, "fontFamily", this.currentSettings.gridTheme.fontFamily || "sans");
        this.currentSettings.gridTheme.fontSize = getValue<number>(gridThemeObj, "fontSize", this.currentSettings.gridTheme.fontSize ?? 11);
        this.currentSettings.gridTheme.rowPadding = getValue<string>(gridThemeObj, "rowPadding", this.currentSettings.gridTheme.rowPadding || "cozy");
        this.currentSettings.gridTheme.showGridLines = getValue<boolean>(gridThemeObj, "showGridLines", this.currentSettings.gridTheme.showGridLines ?? true);
        this.currentSettings.gridTheme.highlightSubtotals = getValue<boolean>(gridThemeObj, "highlightSubtotals", this.currentSettings.gridTheme.highlightSubtotals ?? true);
        this.currentSettings.gridTheme.showAccentBorders = getValue<boolean>(gridThemeObj, "showAccentBorders", this.currentSettings.gridTheme.showAccentBorders ?? true);
        this.currentSettings.gridTheme.columnWidthMode = getValue<string>(gridThemeObj, "columnWidthMode", this.currentSettings.gridTheme.columnWidthMode || "auto");
        this.currentSettings.gridTheme.columnWidthValue = getValue<number>(gridThemeObj, "columnWidthValue", this.currentSettings.gridTheme.columnWidthValue ?? 120);
        this.currentSettings.gridTheme.rowHeightMode = getValue<string>(gridThemeObj, "rowHeightMode", this.currentSettings.gridTheme.rowHeightMode || "auto");
        this.currentSettings.gridTheme.rowHeightValue = getValue<number>(gridThemeObj, "rowHeightValue", this.currentSettings.gridTheme.rowHeightValue ?? 32);
        this.currentSettings.gridTheme.hideEmptyExpand = getValue<boolean>(gridThemeObj, "hideEmptyExpand", this.currentSettings.gridTheme.hideEmptyExpand ?? false);

        // 1b. Table Header Toolbar Settings properties
        const toolbarSettingsObj = objects["toolbarSettings"] || {};
        this.currentSettings.toolbarSettings.showToolbar = getValue<boolean>(toolbarSettingsObj, "showToolbar", this.currentSettings.toolbarSettings.showToolbar ?? true);
        this.currentSettings.toolbarSettings.showTitle = getValue<boolean>(toolbarSettingsObj, "showTitle", this.currentSettings.toolbarSettings.showTitle ?? true);
        this.currentSettings.toolbarSettings.titleText = getValue<string>(toolbarSettingsObj, "titleText", this.currentSettings.toolbarSettings.titleText || "Financial Matrix");
        this.currentSettings.toolbarSettings.titleBgColor = getValue<string>(toolbarSettingsObj, "titleBgColor", this.currentSettings.toolbarSettings.titleBgColor || "");
        this.currentSettings.toolbarSettings.titleTextColor = getValue<string>(toolbarSettingsObj, "titleTextColor", this.currentSettings.toolbarSettings.titleTextColor || "");
        this.currentSettings.toolbarSettings.showExpandCollapse = getValue<boolean>(toolbarSettingsObj, "showExpandCollapse", this.currentSettings.toolbarSettings.showExpandCollapse ?? true);
        this.currentSettings.toolbarSettings.showExport = getValue<boolean>(toolbarSettingsObj, "showExport", this.currentSettings.toolbarSettings.showExport ?? true);
        this.currentSettings.toolbarSettings.showMaximize = getValue<boolean>(toolbarSettingsObj, "showMaximize", this.currentSettings.toolbarSettings.showMaximize ?? true);

        // 2. Number Scale Formatting properties
        const numberFormattingObj = objects["numberFormatting"] || {};
        this.currentSettings.numberFormatting.formatStyle = getValue<string>(numberFormattingObj, "formatStyle", this.currentSettings.numberFormatting.formatStyle || "whole");

        // 3. Commentary Column properties
        const commentaryColumnObj = objects["commentaryColumn"] || {};
        this.currentSettings.commentaryColumn.showCommentary = getValue<boolean>(commentaryColumnObj, "showCommentary", this.currentSettings.commentaryColumn.showCommentary ?? true);

        // 4. Conditional Formatting properties
        const condFormattingObj = objects["conditionalFormatting"] || {};
        this.currentSettings.conditionalFormatting.enableRowVarianceFormatting = getValue<boolean>(condFormattingObj, "enableRowVarianceFormatting", this.currentSettings.conditionalFormatting.enableRowVarianceFormatting ?? false);
        this.currentSettings.conditionalFormatting.enableRowHeatmap = getValue<boolean>(condFormattingObj, "enableRowHeatmap", this.currentSettings.conditionalFormatting.enableRowHeatmap ?? false);
        this.currentSettings.conditionalFormatting.columnFormattingTarget = getValue<string>(condFormattingObj, "columnFormattingTarget", this.currentSettings.conditionalFormatting.columnFormattingTarget || "none");
        this.currentSettings.conditionalFormatting.columnFormattingType = getValue<string>(condFormattingObj, "columnFormattingType", this.currentSettings.conditionalFormatting.columnFormattingType || "none");
        this.currentSettings.conditionalFormatting.positiveColor = getValue<string>(condFormattingObj, "positiveColor", this.currentSettings.conditionalFormatting.positiveColor || "#10b981");
        this.currentSettings.conditionalFormatting.negativeColor = getValue<string>(condFormattingObj, "negativeColor", this.currentSettings.conditionalFormatting.negativeColor || "#ef4444");
        this.currentSettings.conditionalFormatting.enableExpandedHighlight = getValue<boolean>(condFormattingObj, "enableExpandedHighlight", this.currentSettings.conditionalFormatting.enableExpandedHighlight ?? false);
        this.currentSettings.conditionalFormatting.expandedParentBgColor = getValue<string>(condFormattingObj, "expandedParentBgColor", this.currentSettings.conditionalFormatting.expandedParentBgColor || "#f8fafc");
        this.currentSettings.conditionalFormatting.expandedParentTextColor = getValue<string>(condFormattingObj, "expandedParentTextColor", this.currentSettings.conditionalFormatting.expandedParentTextColor || "#0f172a");
        this.currentSettings.conditionalFormatting.expandedChildBgColor = getValue<string>(condFormattingObj, "expandedChildBgColor", this.currentSettings.conditionalFormatting.expandedChildBgColor || "#ffffff");
        this.currentSettings.conditionalFormatting.expandedChildTextColor = getValue<string>(condFormattingObj, "expandedChildTextColor", this.currentSettings.conditionalFormatting.expandedChildTextColor || "#334155");
        this.currentSettings.conditionalFormatting.enableDaxCondFormatting = getValue<boolean>(condFormattingObj, "enableDaxCondFormatting", this.currentSettings.conditionalFormatting.enableDaxCondFormatting ?? false);
        this.currentSettings.conditionalFormatting.daxCondFormatMode = getValue<string>(condFormattingObj, "daxCondFormatMode", this.currentSettings.conditionalFormatting.daxCondFormatMode || "rules");
        this.currentSettings.conditionalFormatting.daxCondFieldValueTarget = getValue<string>(condFormattingObj, "daxCondFieldValueTarget", this.currentSettings.conditionalFormatting.daxCondFieldValueTarget || "background");
        this.currentSettings.conditionalFormatting.daxCondMeasureId = getValue<string>(condFormattingObj, "daxCondMeasureId", this.currentSettings.conditionalFormatting.daxCondMeasureId || "");
        this.currentSettings.conditionalFormatting.daxCondTarget = getValue<string>(condFormattingObj, "daxCondTarget", this.currentSettings.conditionalFormatting.daxCondTarget || "all");
        this.currentSettings.conditionalFormatting.daxCondCondition = getValue<string>(condFormattingObj, "daxCondCondition", this.currentSettings.conditionalFormatting.daxCondCondition || "greater");
        this.currentSettings.conditionalFormatting.daxCondValue1 = getValue<number>(condFormattingObj, "daxCondValue1", this.currentSettings.conditionalFormatting.daxCondValue1 ?? 100000);
        this.currentSettings.conditionalFormatting.daxCondValue2 = getValue<number>(condFormattingObj, "daxCondValue2", this.currentSettings.conditionalFormatting.daxCondValue2 ?? 1000000);
        this.currentSettings.conditionalFormatting.daxCondBgColor = getValue<string>(condFormattingObj, "daxCondBgColor", this.currentSettings.conditionalFormatting.daxCondBgColor || "#f0fdf4");
        this.currentSettings.conditionalFormatting.daxCondTextColor = getValue<string>(condFormattingObj, "daxCondTextColor", this.currentSettings.conditionalFormatting.daxCondTextColor || "#15803d");
        this.currentSettings.conditionalFormatting.daxMeasuresJson = getValue<string>(condFormattingObj, "daxMeasuresJson", this.currentSettings.conditionalFormatting.daxMeasuresJson || "[]");
        this.currentSettings.conditionalFormatting.customRulesJson = getValue<string>(condFormattingObj, "customRulesJson", this.currentSettings.conditionalFormatting.customRulesJson || "[]");

        // --- Apply dynamic overrides from the in-visual modal controls ---
        if (this.settingOverrides) {
            if (this.settingOverrides.gridTheme) {
                Object.assign(this.currentSettings.gridTheme, this.settingOverrides.gridTheme);
            }
            if (this.settingOverrides.toolbarSettings) {
                Object.assign(this.currentSettings.toolbarSettings, this.settingOverrides.toolbarSettings);
            }
            if (this.settingOverrides.numberFormatting) {
                Object.assign(this.currentSettings.numberFormatting, this.settingOverrides.numberFormatting);
            }
            if (this.settingOverrides.conditionalFormatting) {
                Object.assign(this.currentSettings.conditionalFormatting, this.settingOverrides.conditionalFormatting);
            }
        }

        // --- Populate local rendering variables ---
        const selectedTheme = this.currentSettings.gridTheme.selectedTheme;
        const fontFamily = this.currentSettings.gridTheme.fontFamily;
        const fontSize = this.currentSettings.gridTheme.fontSize;
        const rowPadding = this.currentSettings.gridTheme.rowPadding;
        const showGridLines = this.currentSettings.gridTheme.showGridLines;
        const highlightSubtotals = this.currentSettings.gridTheme.highlightSubtotals;
        const showAccentBorders = this.currentSettings.gridTheme.showAccentBorders;
        const columnWidthMode = this.currentSettings.gridTheme.columnWidthMode;
        const columnWidthValue = this.currentSettings.gridTheme.columnWidthValue;
        const rowHeightMode = this.currentSettings.gridTheme.rowHeightMode;
        const rowHeightValue = this.currentSettings.gridTheme.rowHeightValue;

        const showToolbar = this.currentSettings.toolbarSettings.showToolbar;
        const showTitle = this.currentSettings.toolbarSettings.showTitle;
        const titleText = this.currentSettings.toolbarSettings.titleText;
        const titleBgColor = this.currentSettings.toolbarSettings.titleBgColor || "";
        const titleTextColor = this.currentSettings.toolbarSettings.titleTextColor || "";
        const showExpandCollapse = this.currentSettings.toolbarSettings.showExpandCollapse;
        const showExport = this.currentSettings.toolbarSettings.showExport;
        const showMaximize = this.currentSettings.toolbarSettings.showMaximize;

        const formatStyle = this.currentSettings.numberFormatting.formatStyle;
        const showCommentary = this.currentSettings.commentaryColumn.showCommentary;

        const enableRowVarianceFormatting = this.currentSettings.conditionalFormatting.enableRowVarianceFormatting;
        const enableRowHeatmap = this.currentSettings.conditionalFormatting.enableRowHeatmap;
        const columnFormattingTarget = this.currentSettings.conditionalFormatting.columnFormattingTarget;
        const columnFormattingType = this.currentSettings.conditionalFormatting.columnFormattingType;
        const positiveColor = this.currentSettings.conditionalFormatting.positiveColor;
        const negativeColor = this.currentSettings.conditionalFormatting.negativeColor;

        const enableExpandedHighlight = this.currentSettings.conditionalFormatting.enableExpandedHighlight;
        const expandedParentBgColor = this.currentSettings.conditionalFormatting.expandedParentBgColor;
        const expandedParentTextColor = this.currentSettings.conditionalFormatting.expandedParentTextColor;
        const expandedChildBgColor = this.currentSettings.conditionalFormatting.expandedChildBgColor;
        const expandedChildTextColor = this.currentSettings.conditionalFormatting.expandedChildTextColor;

        const enableDaxCondFormatting = this.currentSettings.conditionalFormatting.enableDaxCondFormatting;
        const daxCondFormatMode = this.currentSettings.conditionalFormatting.daxCondFormatMode;
        const daxCondFieldValueTarget = this.currentSettings.conditionalFormatting.daxCondFieldValueTarget;
        const daxCondMeasureId = this.currentSettings.conditionalFormatting.daxCondMeasureId;
        const daxCondTarget = this.currentSettings.conditionalFormatting.daxCondTarget;
        const daxCondCondition = this.currentSettings.conditionalFormatting.daxCondCondition;
        const daxCondValue1 = this.currentSettings.conditionalFormatting.daxCondValue1;
        const daxCondValue2 = this.currentSettings.conditionalFormatting.daxCondValue2;
        const daxCondBgColor = this.currentSettings.conditionalFormatting.daxCondBgColor;
        const daxCondTextColor = this.currentSettings.conditionalFormatting.daxCondTextColor;
        const daxMeasuresJson = this.currentSettings.conditionalFormatting.daxMeasuresJson;
        const customRulesJson = this.currentSettings.conditionalFormatting.customRulesJson;

        const hideEmptyExpand = this.currentSettings.gridTheme.hideEmptyExpand;

        let daxMeasures: any[] = [];
        try {
            daxMeasures = JSON.parse(daxMeasuresJson || "[]");
        } catch (e) {
            daxMeasures = [];
        }

        if (daxMeasures.length === 0) {
            daxMeasures = [
                {
                    id: "dax-avg",
                    name: "Average Actual & Budget",
                    formula: "AVERAGE([Actual], [Budget])",
                    expressionType: "avg"
                },
                {
                    id: "dax-sum",
                    name: "Total Volume (Actual + Budget)",
                    formula: "[Actual] + [Budget]",
                    expressionType: "sum"
                }
            ];
            this.currentSettings.conditionalFormatting.daxMeasuresJson = JSON.stringify(daxMeasures);
        }

        let customRules: any[] = [];
        try {
            customRules = JSON.parse(customRulesJson || "[]");
        } catch (e) {
            customRules = [];
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
                (rule.target === "row-header" && colId === "row-header") ||
                (rule.target === "row") ||
                (rule.target === colId);

            if (!isTargetMatch) return {};

            let isMatch = false;

            if ((rule.target === "row-header" || rule.target === "row") && !rule.useDax) {
                const textVal = String(rowName).toLowerCase().trim();
                const ruleVal = String(rule.value || "").toLowerCase().trim();
                if (rule.operator === "contains") {
                    isMatch = textVal.indexOf(ruleVal) !== -1;
                } else if (rule.operator === "equal") {
                    isMatch = textVal === ruleVal;
                } else if (rule.operator === "empty") {
                    isMatch = textVal === "";
                }
            } else {
                let numVal = Number(cellVal);
                if (rule.useDax && rule.daxMeasureId) {
                    const measure = daxMeasures.find((m: any) => m.id === rule.daxMeasureId);
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

        // --- Apply corporate typography typeface, sizing and custom colors properties ---
        let appliedFont = 'sans-serif';
        if (fontFamily === "sans") appliedFont = '"Inter", "Segoe UI", Arial, sans-serif';
        else if (fontFamily === "display") appliedFont = '"Space Grotesk", "Space Jakarta sans", sans-serif';
        else if (fontFamily === "mono") appliedFont = '"JetBrains Mono", monospace';
        else if (fontFamily === "serif") appliedFont = 'Georgia, serif';
        else if (fontFamily === "segoe") appliedFont = '"Segoe UI Condensed", "Segoe UI", sans-serif';
        else if (fontFamily === "aptos") appliedFont = '"Aptos", "Segoe UI", sans-serif';

        let bg = "#ffffff";
        let text = "#1e293b";
        let borderClr = "#e2e8f0";
        let headerBg = "#f8fafc";
        let subtotalBg = "#f1f5f9";
        let grandtotalBg = "#e2e8f0";
        let hoverBg = "#f1f5f9";

        if (selectedTheme === "dark") {
            bg = "#0b0f19";
            text = "#f1f5f9";
            borderClr = "#1e293b";
            headerBg = "#111827";
            subtotalBg = "#1f2937";
            grandtotalBg = "#374151";
            hoverBg = "#1f2937";
        } else if (selectedTheme === "slate") {
            bg = "#0f172a";
            text = "#f8fafc";
            borderClr = "#334155";
            headerBg = "#1e293b";
            subtotalBg = "#1e293b";
            grandtotalBg = "#475569";
            hoverBg = "#1e293b";
        } else if (selectedTheme === "sepia") {
            bg = "#faf6ee";
            text = "#433422";
            borderClr = "#ebdcb9";
            headerBg = "#f5ebd3";
            subtotalBg = "#eddcb5";
            grandtotalBg = "#d8c395";
            hoverBg = "#f3e5c8";
        }

        // --- Apply custom color overrides if specified from capabilities properties pane ---
        const headerBgColor = this.currentSettings.gridTheme.headerBgColor = getValue<string>(gridThemeObj, "headerBgColor", this.currentSettings.gridTheme.headerBgColor || headerBg);
        const headerTextColor = this.currentSettings.gridTheme.headerTextColor = getValue<string>(gridThemeObj, "headerTextColor", this.currentSettings.gridTheme.headerTextColor || text);
        const rowBgColor = this.currentSettings.gridTheme.rowBgColor = getValue<string>(gridThemeObj, "rowBgColor", this.currentSettings.gridTheme.rowBgColor || bg);
        const rowTextColor = this.currentSettings.gridTheme.rowTextColor = getValue<string>(gridThemeObj, "rowTextColor", this.currentSettings.gridTheme.rowTextColor || text);
        const subtotalBgColor = this.currentSettings.gridTheme.subtotalBgColor = getValue<string>(gridThemeObj, "subtotalBgColor", this.currentSettings.gridTheme.subtotalBgColor || subtotalBg);
        const subtotalTextColor = this.currentSettings.gridTheme.subtotalTextColor = getValue<string>(gridThemeObj, "subtotalTextColor", this.currentSettings.gridTheme.subtotalTextColor || text);
        const grandtotalBgColor = this.currentSettings.gridTheme.grandtotalBgColor = getValue<string>(gridThemeObj, "grandtotalBgColor", this.currentSettings.gridTheme.grandtotalBgColor || grandtotalBg);
        const grandtotalTextColor = this.currentSettings.gridTheme.grandtotalTextColor = getValue<string>(gridThemeObj, "grandtotalTextColor", this.currentSettings.gridTheme.grandtotalTextColor || text);
        const hoverBgColor = this.currentSettings.gridTheme.hoverBgColor = getValue<string>(gridThemeObj, "hoverBgColor", this.currentSettings.gridTheme.hoverBgColor || hoverBg);
        const gridLineColor = this.currentSettings.gridTheme.gridLineColor = getValue<string>(gridThemeObj, "gridLineColor", this.currentSettings.gridTheme.gridLineColor || borderClr);
        const accentColor = this.currentSettings.gridTheme.accentColor = getValue<string>(gridThemeObj, "accentColor", this.currentSettings.gridTheme.accentColor || "#0f172a");

        // Apply maximized/fullscreen positioning styles
        if (this.isMaximized) {
            d3Select(this.target)
                .style("position", "fixed")
                .style("top", "0")
                .style("left", "0")
                .style("width", "100vw")
                .style("height", "100vh")
                .style("z-index", "999999")
                .style("background-color", rowBgColor);
        } else {
            d3Select(this.target)
                .style("position", "")
                .style("top", "")
                .style("left", "")
                .style("width", "")
                .style("height", "")
                .style("z-index", "")
                .style("background-color", "");
        }

        this.container
            .style("font-family", appliedFont)
            .style("font-size", fontSize + "px")
            .style("color", rowTextColor)
            .style("background-color", rowBgColor);

        // Padding Sizing configurations
        let paddingY = "8px";
        let paddingX = "12px";
        if (rowPadding === "compact") {
            paddingY = "4px";
            paddingX = "8px";
        } else if (rowPadding === "spacious") {
            paddingY = "14px";
            paddingX = "16px";
        }

        if (rowHeightMode === "fixed") {
            const val = typeof rowHeightValue === 'number' ? rowHeightValue : 32;
            const calcPaddingY = Math.max(0, Math.floor((val - fontSize - 6) / 2)) + "px";
            paddingY = calcPaddingY;
        }

        const borderStyle = showGridLines ? "1px solid " + borderClr : "none";

        // Parse rows representing financial hierarchy
        const parsedRows: FinancialRow[] = [];
        const activeRowCategories = dataView.categorical.categories.filter(c => c.source.roles && c.source.roles["rows"]);
        const activeCategories = activeRowCategories.length > 0 ? activeRowCategories : [dataView.categorical.categories[0]];

        if (activeCategories.length > 1) {
            // MULTI-FIELD HIERARCHICAL TREE BUILDING
            interface TempNode {
                name: string;
                id: string;
                parentId: string | null;
                level: number;
                actual: number;
                budget: number;
                children: Map<string, TempNode>;
                isSubtotal: boolean;
                isGrandTotal: boolean;
            }

            const pathsMap = new Map<string, TempNode>();
            const numPoints = activeCategories[0].values.length;

            for (let idx = 0; idx < numPoints; idx++) {
                const pathParts: string[] = [];
                activeCategories.forEach((catObj) => {
                    const val = catObj.values[idx];
                    let strVal = val !== null && val !== undefined ? String(val).trim() : "";
                    if (strVal === "") {
                        strVal = "(Blank)";
                    }
                    pathParts.push(strVal);
                });

                const actual = Number(actuals[idx] || 0);
                const budget = Number(budgets[idx] || 0);

                let currentPathStr = "";
                for (let level = 0; level < pathParts.length; level++) {
                    const partName = pathParts[level];
                    const parentPathStr = currentPathStr;
                    currentPathStr = currentPathStr === "" ? partName : currentPathStr + " > " + partName;

                    const id = currentPathStr.toLowerCase().replace(/[^a-z0-0-a-z0-9]+/gi, "-").replace(/-+/gi, "-");
                    const parentId = level > 0 ? parentPathStr.toLowerCase().replace(/[^a-z0-0-a-z0-9]+/gi, "-").replace(/-+/gi, "-") : null;

                    if (!pathsMap.has(currentPathStr)) {
                        const lowerName = partName.toLowerCase();
                        const isSubtotal = level < pathParts.length - 1 || 
                                           lowerName.includes("gross profit") || 
                                           lowerName.includes("ebitda") || 
                                           lowerName.includes("ebit") || 
                                           lowerName.includes("operating income") || 
                                           lowerName.includes("total cost of goods") || 
                                           lowerName.includes("operating expenses");
                        const isGrandTotal = lowerName.includes("net income") || 
                                             lowerName.includes("net earnings") || 
                                             lowerName.includes("grand total");

                        pathsMap.set(currentPathStr, {
                            name: partName,
                            id,
                            parentId,
                            level,
                            actual: 0,
                            budget: 0,
                            children: new Map<string, TempNode>(),
                            isSubtotal,
                            isGrandTotal
                        });
                    }

                    const node = pathsMap.get(currentPathStr);
                    if (node) {
                        node.actual += actual;
                        node.budget += budget;
                    }
                }
            }

            // Link parents and children
            const rootNodes: TempNode[] = [];
            pathsMap.forEach((node, pathStr) => {
                if (node.parentId === null) {
                    rootNodes.push(node);
                } else {
                    const parentPathParts = pathStr.split(" > ");
                    parentPathParts.pop();
                    const parentPathStr = parentPathParts.join(" > ");
                    const parentNode = pathsMap.get(parentPathStr);
                    if (parentNode) {
                        parentNode.children.set(node.name, node);
                    }
                }
            });

            // Flatten tree preserving order
            const visited = new Set<string>();
            const visit = (node: TempNode) => {
                if (visited.has(node.id)) return;
                visited.add(node.id);

                if (this.collapsedState[node.id] === undefined) {
                    this.collapsedState[node.id] = node.level > 0; // Collapsed sub-elements by default
                }

                parsedRows.push({
                    rawCategory: node.name,
                    cleanName: node.name,
                    level: node.level,
                    actual: node.actual,
                    budget: node.budget,
                    isSubtotal: node.isSubtotal,
                    isGrandTotal: node.isGrandTotal,
                    visible: true,
                    collapsed: this.collapsedState[node.id],
                    parentId: node.parentId,
                    id: node.id
                });

                node.children.forEach((child) => {
                    visit(child);
                });
            };

            // Traversal starting from each distinct root elements seen in original dataset index order
            for (let idx = 0; idx < numPoints; idx++) {
                const rootPart = String(activeCategories[0].values[idx]).trim();
                const rootNode = pathsMap.get(rootPart);
                if (rootNode) {
                    visit(rootNode);
                }
            }
        } else {
            // SINGLE FIELD DETAILED SPACE-INDENT TREE OR FLAT HIERARCHY fallbacks
            let previousParentIdByLevel: string[] = [];
            activeCategories[0].values.forEach((catValue, idx) => {
                const rawCat = String(catValue);
                const leadingSpaces = rawCat.match(/^\\s*/);
                const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
                const cleanName = rawCat.trim();
                const id = cleanName.toLowerCase().replace(/\\s+/g, "-");

                const actual = Number(actuals[idx] || 0);
                const budget = Number(budgets[idx] || 0);

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

                previousParentIdByLevel[level] = id;
                const parentId = level > 0 ? previousParentIdByLevel[level - 1] : null;

                if (this.collapsedState[id] === undefined) {
                    this.collapsedState[id] = false;
                }

                parsedRows.push({
                    rawCategory: rawCat,
                    cleanName,
                    level,
                    actual,
                    budget,
                    isSubtotal,
                    isGrandTotal,
                    visible: true,
                    collapsed: this.collapsedState[id],
                    parentId,
                    id
                });
            });
        }

        // Determine parent collapsed visibility
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

        // --- STATS HELPER FOR CONDITIONAL HEATMAPS / DATA BARS ---
        const nonTotalRows = parsedRows.filter(r => !r.isSubtotal && !r.isGrandTotal && r.visible);
        const getMinMaxStats = (type: "actual" | "budget" | "variance" | "variancePct") => {
            let vals = [];
            if (type === "actual") vals = nonTotalRows.map(r => r.actual);
            else if (type === "budget") vals = nonTotalRows.map(r => r.budget);
            else if (type === "variance") vals = nonTotalRows.map(r => r.actual - r.budget);
            else if (type === "variancePct") vals = nonTotalRows.map(r => r.budget !== 0 ? ((r.actual - r.budget) / r.budget) * 100 : 0);

            if (vals.length === 0) return { min: 0, max: 0, absMax: 1 };
            return {
                min: Math.min(...vals),
                max: Math.max(...vals),
                absMax: Math.max(...vals.map(Math.abs), 1)
            };
        };

        const colStats = {
            actual: getMinMaxStats("actual"),
            budget: getMinMaxStats("budget"),
            variance: getMinMaxStats("variance"),
            variancePct: getMinMaxStats("variancePct")
        };

        const getHeatmapColor = (val: number, type: "actual" | "budget" | "variance" | "variancePct") => {
            const stats = colStats[type];
            const { min, max } = stats;
            if (max === min) return "";
            let percent = 0;
            if (val >= 0) {
                percent = max > 0 ? val / max : 0;
                const rawHex = Math.round(percent * 35).toString(16);
                const opacityHex = rawHex.length < 2 ? "0" + rawHex : rawHex;
                return positiveColor + opacityHex;
            } else {
                percent = min < 0 ? val / min : 0;
                const rawHex = Math.round(percent * 35).toString(16);
                const opacityHex = rawHex.length < 2 ? "0" + rawHex : rawHex;
                return negativeColor + opacityHex;
            }
        };

        // --- RENDER HEADING TOOLBAR ---
        const toolbar = this.container.append("div")
            .classed("financial-matrix-toolbar", true)
            .style("display", showToolbar ? "flex" : "none")
            .style("align-items", "center")
            .style("justify-content", "space-between")
            .style("padding", "6px 12px")
            .style("border-bottom", borderStyle)
            .style("background-color", titleBgColor || headerBgColor)
            .style("gap", "8px");

        toolbar.append("div")
            .text(titleText)
            .style("display", showTitle ? "block" : "none")
            .style("font-size", "11px")
            .style("font-weight", "700")
            .style("color", titleTextColor || headerTextColor)
            .style("letter-spacing", "0.03em")
            .style("text-transform", "uppercase");

        const btnGroup = toolbar.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "6px");

        // Expand All Buttons
        const btnExpand = btnGroup.append("button")
            .attr("title", "Expand All")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", showExpandCollapse ? "inline-flex" : "none")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html("<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><path d='m7 15 5 5 5-5'></path><path d='m7 9 5-5 5 5'></path></svg>");

        btnExpand.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnExpand.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            parsedRows.forEach((row) => {
                this.collapsedState[row.id] = false;
            });
            this.update(options);
        });

        // Collapse All Buttons
        const btnCollapse = btnGroup.append("button")
            .attr("title", "Collapse All")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", showExpandCollapse ? "inline-flex" : "none")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html("<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><path d='m7 20 5-5 5 5'></path><path d='m7 4 5 5 5-5'></path></svg>");

        btnCollapse.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnCollapse.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            parsedRows.forEach((row) => {
                this.collapsedState[row.id] = true;
            });
            this.update(options);
        });

        // Download Excel Button
        const btnExport = btnGroup.append("button")
            .attr("title", "Export XLS")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", showExport ? "inline-flex" : "none")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html("<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path><polyline points='7 10 12 15 17 10'></polyline><line x1='12' y1='15' x2='12' y2='3'></line></svg>");

        btnExport.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnExport.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }

            const downloadFilename = "Financial_Statement_export.xlsx";

            // Generate genuine XLSX workbook using SheetJS
            const aoaData: any[][] = [];

            // Table Column Headers
            aoaData.push([
                "Accounts (Hierarchy)",
                "Actual",
                "Budget",
                "Variance ($)",
                "Variance (%)",
                "Remarks / Notes"
            ]);

            // Populate table body records
            parsedRows.forEach((row) => {
                if (!row.visible) return;
                const vVal = row.actual - row.budget;
                const vPct = row.budget !== 0 ? (vVal / row.budget) * 100 : 0;
                const rComment = this.collapsedState[row.id + "-comment"] || "";

                const indent = "  ".repeat(row.level);

                aoaData.push([
                    indent + row.cleanName,
                    row.actual,
                    row.budget,
                    vVal,
                    Number(vPct.toFixed(1)),
                    rComment
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(aoaData);

            // Apply auto column-width for beautiful cell layout
            const colWidths = aoaData.reduce((widths, row) => {
                row.forEach((val, i) => {
                    const strLen = String(val ?? "").length;
                    widths[i] = Math.max(widths[i] || 10, strLen + 2);
                });
                return widths;
            }, [] as number[]);
            worksheet["!cols"] = colWidths.map(w => ({ wch: w }));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Statement");

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

            // Power BI Custom Visual Host Download/Export Service Integration (blocks sandbox iframe issues in app.powerbi.com)
            const downloadService = this.host && this.host.downloadService;
            if (downloadService) {
                if (typeof downloadService.exportVisualsContent === "function") {
                    try {
                        downloadService.exportVisualsContent(excelBase64, downloadFilename, "base64", "xlsx file")
                            .then((result: boolean) => {
                                console.log("Custom visual exported successfully via exportVisualsContent:", result);
                            })
                            .catch((error: any) => {
                                console.error("Custom visual export failed via exportVisualsContent:", error);
                            });
                        return;
                    } catch (err) {
                        console.error("exportVisualsContent call failed, moving to next method:", err);
                    }
                }
                
                if (typeof downloadService.exportVisualsContentExtended === "function") {
                    try {
                        downloadService.exportVisualsContentExtended(excelBase64, downloadFilename, "base64", "xlsx file")
                            .then((result: any) => {
                                console.log("Custom visual exported successfully via exportVisualsContentExtended:", result);
                            })
                            .catch((error: any) => {
                                console.error("Custom visual export failed via exportVisualsContentExtended:", error);
                            });
                        return;
                    } catch (err) {
                        console.error("exportVisualsContentExtended call failed, moving to next method:", err);
                    }
                }

                if (typeof downloadService.downloadSingleFile === "function") {
                    try {
                        downloadService.downloadSingleFile(downloadFilename, excelBase64, "base64", "xlsx")
                            .then((result: boolean) => {
                                console.log("Custom visual downloaded successfully via downloadSingleFile:", result);
                            })
                            .catch((error: any) => {
                                console.error("Custom visual download failed via downloadSingleFile:", error);
                            });
                        return;
                    } catch (err) {
                        console.error("downloadSingleFile call failed:", err);
                    }
                }
            }

            // Fallback: Data URI download (bypasses allow-downloads sandbox restrictions in local dev, PBIRS on-premise, etc.)
            try {
                console.log("Using fallback data URI download to bypass sandbox limits...");
                const dataUri = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + excelBase64;
                const link = document.createElement("a");
                link.href = dataUri;
                link.download = downloadFilename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log("Exported matrix to genuine Excel XLSX via Data URI.");
            } catch (fallbackErr) {
                console.error("Data URI fallback failed, trying blob URL as absolute last resort:", fallbackErr);
                try {
                    const blob = new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = downloadFilename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                } catch (lastErr) {
                    console.error("All export fallbacks failed:", lastErr);
                }
            }
        });

        // Settings Button
        const btnSettings = btnGroup.append("button")
            .attr("title", "Settings")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", "inline-flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html("<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><circle cx='12' cy='12' r='3'></circle><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'></path></svg>");

        btnSettings.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnSettings.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.isSettingsOpen = !this.isSettingsOpen;
            this.isHelpOpen = false;
            this.update(options);
        });

        // Help Button
        const btnHelp = btnGroup.append("button")
            .attr("title", "Help / Guide")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", "inline-flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html("<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><circle cx='12' cy='12' r='10'></circle><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'></path><line x1='12' y1='17' x2='12.01' y2='17'></line></svg>");

        btnHelp.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnHelp.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.isHelpOpen = !this.isHelpOpen;
            this.isSettingsOpen = false;
            this.update(options);
        });

        // Maximize/Minimize Button
        const btnMaximize = btnGroup.append("button")
            .attr("title", this.isMaximized ? "Minimize Focus Mode" : "Maximize Focus Mode")
            .style("background", subtotalBgColor)
            .style("border", "1px solid " + gridLineColor)
            .style("border-radius", "4px")
            .style("cursor", "pointer")
            .style("width", "26px")
            .style("height", "26px")
            .style("color", headerTextColor)
            .style("display", showMaximize ? "inline-flex" : "none")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("padding", "0")
            .style("transition", "background-color 0.2s")
            .html(this.isMaximized ? 
                "<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><path d='M4 14h6v6'></path><path d='M20 10h-6V4'></path><path d='M14 10l7-7'></path><path d='M10 14l-7 7'></path></svg>" : 
                "<svg viewBox='0 0 24 24' width='14' height='14' stroke='currentColor' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round' style='display:block;'><path d='M15 3h6v6'></path><path d='M9 21H3v-6'></path><path d='M21 3l-7 7'></path><path d='M3 21l7-7'></path></svg>"
            );

        btnMaximize.on("mouseover", function() {
            d3Select(this).style("background-color", hoverBgColor);
        }).on("mouseout", function() {
            d3Select(this).style("background-color", subtotalBgColor);
        });

        btnMaximize.on("click", (event) => {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.isMaximized = !this.isMaximized;
            this.update(options);
        });

        // Construct HTML Table
        const table = this.container.append("table")
            .classed("pbi-matrix-table", true)
            .style("border-collapse", "collapse")
            .style("width", "100%")
            .style("border", showGridLines ? "1px solid " + gridLineColor : "none")
            .style("background", rowBgColor);

        // Resolve the Columns Well configuration dynamically
        const colCategories = dataView.categorical.categories.filter(c => c.source.roles && c.source.roles["columns"]);
        const columnsRole = colCategories.length > 0 ? colCategories[0].source.displayName : "";
        const columnsStr = (columnsRole || "").trim();
        const isDefaultScenario = !columnsStr || 
            columnsStr.toLowerCase().includes("scenario") || 
            columnsStr.toLowerCase().includes("budget") || 
            columnsStr.toLowerCase().includes("actual");
        
        const valuesRole = valueMeasures.map(v => v.source.displayName).join(", ");
        const renderedCols = getActiveColumns(columnsRole, valuesRole);

        // Header
        const thead = table.append("thead")
            .style("background-color", headerBgColor)
            .style("border-bottom", "2px solid " + gridLineColor);

        const headerRow = thead.append("tr");
        if (rowHeightMode === "fixed") {
            headerRow.style("height", rowHeightValue + "px");
        }
        headerRow.append("th").text("Accounts (Hierarchy)")
            .style("padding", paddingY + " " + paddingX)
            .style("color", headerTextColor)
            .style("font-weight", "700")
            .style("font-size", (fontSize - 1) + "px")
            .style("background-color", headerBgColor);

        renderedCols.forEach(col => {
            const th = headerRow.append("th")
                .classed("num-cell", true)
                .text(col.label)
                .style("padding", paddingY + " " + paddingX)
                .style("color", headerTextColor)
                .style("font-weight", "700")
                .style("font-size", (fontSize - 1) + "px")
                .style("text-align", "right")
                .style("background-color", headerBgColor);

            if (columnWidthMode === "fixed") {
                th.style("width", columnWidthValue + "px");
            }
        });

        // Inject dynamic custom visual DAX measure headers
        if (isDefaultScenario && daxMeasures && daxMeasures.length > 0) {
            daxMeasures.forEach((m: any) => {
                const th = headerRow.append("th")
                    .classed("num-cell", true)
                    .classed("dax-header", true)
                    .text(m.name)
                    .attr("title", m.formula)
                    .style("padding", paddingY + " " + paddingX)
                    .style("color", "#4f46e5")
                    .style("font-weight", "700")
                    .style("font-size", (fontSize - 1) + "px")
                    .style("text-align", "right")
                    .style("background-color", headerBgColor);

                if (columnWidthMode === "fixed") {
                    th.style("width", columnWidthValue + "px");
                }
            });
        }

        if (showCommentary) {
            headerRow.append("th")
                .text("Notes / Remarks")
                .style("padding", paddingY + " " + paddingX)
                .style("color", headerTextColor)
                .style("font-weight", "700")
                .style("font-size", (fontSize - 1) + "px")
                .style("text-align", "left")
                .style("background-color", headerBgColor);
        }

        // Formatter helpers
        const formatNum = (v: number) => {
            let scaled = v;
            let suffix = "";
            let decimals = 0;

            if (formatStyle === "thousand") {
                scaled = v / 1000;
                suffix = "K";
                decimals = 1;
            } else if (formatStyle === "million") {
                scaled = v / 1000000;
                suffix = "M";
                decimals = 2;
            }

            const rawFormatted = Math.abs(scaled).toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });

            if (v < 0) {
                return "(" + rawFormatted + suffix + ")";
            }
            return rawFormatted + suffix;
        };

        const formatPct = (v: number) => {
            const sign = v > 0 ? "+" : "";
            return sign + v.toFixed(1) + "%";
        };

        // Body
        const tbody = table.append("tbody");
        parsedRows.forEach((row) => {
            if (!row.visible) return;

            let currentRowBg = row.isGrandTotal ? grandtotalBgColor : row.isSubtotal ? subtotalBgColor : rowBgColor;
            let currentRowText = row.isGrandTotal ? grandtotalTextColor : row.isSubtotal ? subtotalTextColor : rowTextColor;
            
            const varianceVal = row.actual - row.budget;
            const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;

            // Applied dynamic Row conditional variations highlights
            if (enableRowVarianceFormatting && !row.isSubtotal && !row.isGrandTotal) {
                currentRowBg = varianceVal > 0 ? positiveColor + "15" : negativeColor + "15";
            } else if (enableRowHeatmap && !row.isSubtotal && !row.isGrandTotal) {
                currentRowBg = getHeatmapColor(row.actual, "actual");
            }

            // Check expansion hierarchy roles
            const hasChildren = parsedRows.filter(r => r.parentId === row.id).length > 0;
            const isExpandedParent = hasChildren && !row.collapsed;
            const isChildRow = row.level > 0 && !row.isGrandTotal && !row.isSubtotal;

            let rowTextColorOverride: string | undefined = undefined;
            let rowBgColorOverride: string | undefined = undefined;

            let isDaxCondActive = false;
            let daxFieldValueBgColor: string | undefined = undefined;
            let daxFieldValueTextColor: string | undefined = undefined;

            if (enableDaxCondFormatting && daxCondMeasureId) {
                const measure = daxMeasures.find(m => m.id === daxCondMeasureId);
                if (measure) {
                    const daxVal = evaluateDAX(measure.formula, row.actual, row.budget, row);
                    if (daxCondFormatMode === "fieldValue") {
                        if (typeof daxVal === "string" && daxVal.trim()) {
                            const color = daxVal.trim();
                            if (daxCondFieldValueTarget === "background" || daxCondFieldValueTarget === "both") {
                                daxFieldValueBgColor = color;
                            }
                            if (daxCondFieldValueTarget === "font" || daxCondFieldValueTarget === "both") {
                                daxFieldValueTextColor = color;
                            }
                        }
                    } else {
                        const op = daxCondCondition || "greater";
                        const val1 = daxCondValue1 ?? 0;
                        const val2 = daxCondValue2 ?? 0;

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

            // Expanded hierarchy group colorization overrides
            if (enableExpandedHighlight) {
                if (isExpandedParent) {
                    rowTextColorOverride = expandedParentTextColor || "#0f172a";
                    rowBgColorOverride = expandedParentBgColor || "#f8fafc";
                } else if (isChildRow) {
                    rowTextColorOverride = expandedChildTextColor || "#334155";
                    rowBgColorOverride = expandedChildBgColor || "#ffffff";
                }
            }

            // DAX rule evaluation colors integration
            if (isDaxCondActive && daxCondFormatMode !== "fieldValue") {
                const target = daxCondTarget || "all";
                if (target === "all" || target === "rows") {
                    rowTextColorOverride = daxCondTextColor || "#15803d";
                    rowBgColorOverride = daxCondBgColor || "#f0fdf4";
                }
            } else if (enableDaxCondFormatting && daxCondFormatMode === "fieldValue") {
                const target = daxCondTarget || "all";
                if (target === "all" || target === "rows") {
                    if (daxFieldValueBgColor) {
                        rowBgColorOverride = daxFieldValueBgColor;
                    }
                    if (daxFieldValueTextColor) {
                        rowTextColorOverride = daxFieldValueTextColor;
                    }
                }
            }

            if (rowBgColorOverride) currentRowBg = rowBgColorOverride;
            if (rowTextColorOverride) currentRowText = rowTextColorOverride;

            const tr = tbody.append("tr")
                .classed("matrix-row", true)
                .style("background-color", currentRowBg)
                .style("border-bottom", borderStyle);

            if (rowHeightMode === "fixed") {
                tr.style("height", rowHeightValue + "px");
            }

            // Action row hover bg inside Power BI via dynamic element listener
            tr.on("mouseover", function() {
                d3Select(this).style("background-color", hoverBgColor);
            }).on("mouseout", function() {
                d3Select(this).style("background-color", currentRowBg);
            });

            // Accounts cell with expand/collapse plus-minus
            const accountsCell = tr.append("td")
                .style("padding-top", paddingY)
                .style("padding-bottom", paddingY)
                .style("padding-left", (row.level * 16 + 12) + "px")
                .style("padding-right", paddingX)
                .style("color", currentRowText)
                .style("background-color", currentRowBg);

            if (showAccentBorders && row.level === 0) {
                accountsCell.style("border-left", "4px solid " + accentColor);
            } else if (showGridLines) {
                accountsCell.style("border-left", borderStyle);
            }
            if (showGridLines) {
                accountsCell.style("border-right", borderStyle);
            }

            // Check if this row is a parent
            const hasChildrenCount = parsedRows.filter(r => r.parentId === row.id).length > 0;

            if (hasChildrenCount) {
                const btn = accountsCell.append("span")
                    .classed("expand-collapse-btn", true)
                    .html(row.collapsed ? "&#9656; " : "&#9662; ")
                    .style("cursor", "pointer")
                    .style("margin-right", "6px")
                    .style("font-weight", "bold")
                    .style("color", currentRowText);
                
                btn.on("click", (e) => {
                    e.stopPropagation();
                    this.collapsedState[row.id] = !this.collapsedState[row.id];
                    this.update(options);
                });
            } else {
                const bullet = accountsCell.append("span")
                    .classed("leaf-bullet", true);
                if (hideEmptyExpand) {
                    bullet.html("&nbsp; ")
                        .style("margin-right", "8px");
                } else {
                    bullet.html("&bull; ")
                        .style("margin-right", "8px")
                        .style("color", currentRowText)
                        .style("opacity", "0.4");
                }
            }

            accountsCell.append("span")
                .classed("account-name", true)
                .text(row.cleanName)
                .style("font-weight", (row.isSubtotal || row.isGrandTotal) && highlightSubtotals ? "700" : "500")
                .style("color", currentRowText);

            let actualCell: Selection<HTMLTableCellElement, any, any, any> | null = null;
            let budgetCell: Selection<HTMLTableCellElement, any, any, any> | null = null;
            let moneyVarCell: Selection<HTMLTableCellElement, any, any, any> | null = null;
            let pctVarCell: Selection<HTMLTableCellElement, any, any, any> | null = null;

            renderedCols.forEach((col, cIdx) => {
                if (isDefaultScenario) {
                    if (col.id === "actual") {
                        actualCell = tr.append("td").classed("num-cell", true).style("padding", paddingY + " " + paddingX).style("text-align", "right").style("background-color", currentRowBg);
                        if (columnWidthMode === "fixed") actualCell.style("width", columnWidthValue + "px");
                        if (showGridLines) actualCell.style("border-left", borderStyle).style("border-right", borderStyle);
                        actualCell.text(formatNum(row.actual))
                            .style("color", currentRowText)
                            .style("font-weight", (row.isSubtotal || row.isGrandTotal) && highlightSubtotals ? "750" : "500");
                    } else if (col.id === "budget") {
                        budgetCell = tr.append("td").classed("num-cell", true).style("padding", paddingY + " " + paddingX).style("text-align", "right").style("background-color", currentRowBg);
                        if (columnWidthMode === "fixed") budgetCell.style("width", columnWidthValue + "px");
                        if (showGridLines) budgetCell.style("border-left", borderStyle).style("border-right", borderStyle);
                        budgetCell.text(formatNum(row.budget))
                            .style("color", currentRowText)
                            .style("font-weight", (row.isSubtotal || row.isGrandTotal) && highlightSubtotals ? "750" : "500");
                    } else if (col.id === "variance") {
                        moneyVarCell = tr.append("td").classed("num-cell", true).style("padding", paddingY + " " + paddingX).style("text-align", "right").style("background-color", currentRowBg);
                        if (columnWidthMode === "fixed") moneyVarCell.style("width", columnWidthValue + "px");
                        if (showGridLines) moneyVarCell.style("border-left", borderStyle).style("border-right", borderStyle);
                        moneyVarCell.text(formatNum(varianceVal))
                            .style("font-weight", "600");
                        if (varianceVal > 0) {
                            moneyVarCell.style("color", positiveColor);
                        } else if (varianceVal < 0) {
                            moneyVarCell.style("color", negativeColor);
                        } else {
                            moneyVarCell.style("color", currentRowText);
                        }
                    } else if (col.id === "variancePct") {
                        pctVarCell = tr.append("td").classed("num-cell", true).style("padding", paddingY + " " + paddingX).style("text-align", "right").style("background-color", currentRowBg);
                        if (columnWidthMode === "fixed") pctVarCell.style("width", columnWidthValue + "px");
                        if (showGridLines) pctVarCell.style("border-left", borderStyle).style("border-right", borderStyle);
                        const varSpan = pctVarCell.append("span")
                            .classed("badge-variance", true)
                            .style("display", "inline-block")
                            .style("padding", "2px 6px")
                            .style("border-radius", "4px")
                            .style("font-size", (fontSize - 1) + "px")
                            .style("font-weight", "700")
                            .text(formatPct(variancePct));

                        if (variancePct >= 0) {
                            varSpan.style("background-color", positiveColor + "20").style("color", positiveColor);
                        } else {
                            varSpan.style("background-color", negativeColor + "20").style("color", negativeColor);
                        }
                    }
                } else {
                    const cellVal = getColumnValue(row, col.id, cIdx, renderedCols.length);
                    const cell = tr.append("td").classed("num-cell", true).style("padding", paddingY + " " + paddingX).style("text-align", "right").style("background-color", currentRowBg);
                    if (columnWidthMode === "fixed") cell.style("width", columnWidthValue + "px");
                    if (showGridLines) cell.style("border-left", borderStyle).style("border-right", borderStyle);
                    
                    cell.text(formatNum(cellVal))
                        .style("color", currentRowText)
                        .style("font-weight", (row.isSubtotal || row.isGrandTotal || col.id === "total") && highlightSubtotals ? "750" : "500");

                    cell.on("contextmenu", (event: any) => {
                        this.showContextMenu(event, row, col.id, options);
                    });
                    
                    if (columnFormattingTarget === "actual" && col.id !== "total" && columnFormattingType !== "none" && !row.isSubtotal && !row.isGrandTotal) {
                        if (columnFormattingType === "heatmap") {
                            const heatColor = getHeatmapColor(cellVal, "actual");
                            if (heatColor) {
                                cell.style("background-color", heatColor);
                            }
                        } else if (columnFormattingType === "databars") {
                            const { absMax } = colStats["actual"];
                            const cellWidthPercent = (Math.abs(cellVal) / (absMax || 1)) * 80;
                            const barColor = cellVal < 0 ? negativeColor : positiveColor;
                            cell.style("background", "linear-gradient(to left, " + barColor + "25 " + cellWidthPercent + "%, transparent 0%)");
                        } else if (columnFormattingType === "icons") {
                            const iconStr = cellVal > 0 ? "▲ " : cellVal < 0 ? "▼ " : "● ";
                            const iconColor = cellVal > 0 ? positiveColor : cellVal < 0 ? negativeColor : text;
                            cell.insert("span", ":first-child")
                                .text(iconStr)
                                .style("color", iconColor)
                                .style("font-size", fontSize + "px")
                                .style("margin-right", "4px");
                        }
                    }
                }
            });

            // Apply column-level conditional formatting targets
            if (isDefaultScenario && columnFormattingTarget !== "none" && columnFormattingType !== "none" && !row.isSubtotal && !row.isGrandTotal) {
                let targetCell: Selection<HTMLTableCellElement, any, any, any> | null = null;
                let targetVal = 0;
                let targetKey: "actual" | "budget" | "variance" | "variancePct" = "actual";

                if (columnFormattingTarget === "actual") {
                    targetCell = actualCell;
                    targetVal = row.actual;
                    targetKey = "actual";
                } else if (columnFormattingTarget === "budget") {
                    targetCell = budgetCell;
                    targetVal = row.budget;
                    targetKey = "budget";
                } else if (columnFormattingTarget === "variance") {
                    targetCell = moneyVarCell;
                    targetVal = varianceVal;
                    targetKey = "variance";
                } else if (columnFormattingTarget === "variancePct") {
                    targetCell = pctVarCell;
                    targetVal = variancePct;
                    targetKey = "variancePct";
                }

                if (targetCell) {
                    if (columnFormattingType === "heatmap") {
                        const heatColor = getHeatmapColor(targetVal, targetKey);
                        if (heatColor) {
                            targetCell.style("background-color", heatColor);
                        }
                    } else if (columnFormattingType === "databars") {
                        const { absMax } = colStats[targetKey];
                        const cellWidthPercent = (Math.abs(targetVal) / absMax) * 80;
                        const barColor = targetVal < 0 ? negativeColor : positiveColor;
                        targetCell.style("background", "linear-gradient(to left, " + barColor + "25 " + cellWidthPercent + "%, transparent 0%)");
                    } else if (columnFormattingType === "icons") {
                        const iconStr = targetVal > 0 ? "▲ " : targetVal < 0 ? "▼ " : "● ";
                        const iconColor = targetVal > 0 ? positiveColor : targetVal < 0 ? negativeColor : text;
                        targetCell.insert("span", ":first-child")
                            .text(iconStr)
                            .style("color", iconColor)
                            .style("font-size", fontSize + "px")
                            .style("margin-right", "4px");
                    }
                }
            }

            // Apply DAX conditional formatting overrides on standard columns
            if (isDaxCondActive && daxCondFormatMode !== "fieldValue") {
                const target = daxCondTarget || "all";
                if (target === "all" || target === "columns") {
                    if (actualCell) {
                        (actualCell as any).style("background-color", daxCondBgColor || "#f0fdf4")
                            .style("color", daxCondTextColor || "#15803d");
                    }
                    if (budgetCell) {
                        (budgetCell as any).style("background-color", daxCondBgColor || "#f0fdf4")
                            .style("color", daxCondTextColor || "#15803d");
                    }
                }
            } else if (enableDaxCondFormatting && daxCondFormatMode === "fieldValue") {
                const target = daxCondTarget || "all";
                if (target === "all" || target === "columns") {
                    if (actualCell) {
                        if (daxFieldValueBgColor) (actualCell as any).style("background-color", daxFieldValueBgColor);
                        if (daxFieldValueTextColor) (actualCell as any).style("color", daxFieldValueTextColor);
                    }
                    if (budgetCell) {
                        if (daxFieldValueBgColor) (budgetCell as any).style("background-color", daxFieldValueBgColor);
                        if (daxFieldValueTextColor) (budgetCell as any).style("color", daxFieldValueTextColor);
                    }
                }
            }

            // Attach dynamic right-click context menu handlers for on-the-fly conditional formatting
            accountsCell.on("contextmenu", (event: any) => {
                this.showContextMenu(event, row, "row-header", options);
            });
            if (actualCell) {
                (actualCell as any).on("contextmenu", (event: any) => {
                    this.showContextMenu(event, row, "actual", options);
                });
            }
            if (budgetCell) {
                (budgetCell as any).on("contextmenu", (event: any) => {
                    this.showContextMenu(event, row, "budget", options);
                });
            }
            if (moneyVarCell) {
                (moneyVarCell as any).on("contextmenu", (event: any) => {
                    this.showContextMenu(event, row, "variance", options);
                });
            }
            if (pctVarCell) {
                (pctVarCell as any).on("contextmenu", (event: any) => {
                    this.showContextMenu(event, row, "variancePct", options);
                });
            }

            // Inject dynamic custom visual DAX measure values for each row
            if (isDefaultScenario && daxMeasures && daxMeasures.length > 0) {
                daxMeasures.forEach((m: any) => {
                    const daxVal = evaluateDAX(m.formula, row.actual, row.budget, row);

                    let condBg: string | undefined = undefined;
                    let condTextColor: string | undefined = undefined;

                    // Specific DAX Conditional highlighting
                    if (isDaxCondActive && daxCondFormatMode !== "fieldValue") {
                        const target = daxCondTarget || "all";
                        if (target === "all" || target === "columns") {
                            condBg = daxCondBgColor || "#f0fdf4";
                            condTextColor = daxCondTextColor || "#15803d";
                        }
                    } else if (enableDaxCondFormatting && daxCondFormatMode === "fieldValue") {
                        const target = daxCondTarget || "all";
                        if (target === "all" || target === "columns") {
                            condBg = daxFieldValueBgColor;
                            condTextColor = daxFieldValueTextColor;
                        }
                    }

                    const cell = tr.append("td")
                        .classed("num-cell", true)
                        .classed("dax-cell", true)
                        .style("padding", paddingY + " " + paddingX)
                        .style("text-align", "right")
                        .style("background-color", condBg || currentRowBg)
                        .style("color", condTextColor || (isExpandedParent ? (expandedParentTextColor || "#0f172a") : "#334155"))
                        .style("font-weight", "700");

                    if (columnWidthMode === "fixed") {
                        cell.style("width", columnWidthValue + "px");
                    }
                    if (showGridLines) {
                        cell.style("border-left", borderStyle)
                            .style("border-right", borderStyle);
                    }

                    cell.text(formatNum(daxVal));
                });
            }

            // --- Apply Custom Conditional Formatting Rules (Line & Cell) ---
            if (customRules && customRules.length > 0) {
                customRules.forEach((rule: any) => {
                    const rowName = row.cleanName || "";

                    const targets = [
                        { colId: "row-header", cell: accountsCell, val: rowName },
                        { colId: "actual", cell: actualCell, val: row.actual },
                        { colId: "budget", cell: budgetCell, val: row.budget },
                        { colId: "variance", cell: moneyVarCell, val: varianceVal },
                        { colId: "variancePct", cell: pctVarCell, val: variancePct }
                    ];

                    targets.forEach(t => {
                        if (t.cell) {
                            const match = evaluateCustomRule(t.colId, t.val, rowName, rule, row.actual, row.budget);
                            if (match.matchBg) {
                                t.cell.style("background-color", match.matchBg);
                            }
                            if (match.matchText) {
                                t.cell.style("color", match.matchText);
                                // Also propagate color to nested spans (like accounts list labels & bullet arrows)
                                if (t.colId === "row-header") {
                                    t.cell.selectAll("span").style("color", match.matchText);
                                }
                            }
                            if (match.matchBold) {
                                t.cell.style("font-weight", "bold");
                            }
                        }
                    });
                });
            }

            // Notes Column commentary
            if (showCommentary) {
                const commentaryKey = row.id + "-comment";
                const commCell = tr.append("td")
                    .style("padding-top", paddingY)
                    .style("padding-bottom", paddingY)
                    .style("padding-left", paddingX)
                    .style("padding-right", paddingX)
                    .style("background-color", currentRowBg)
                    .style("position", "relative")
                    .style("min-width", "220px")
                    .style("vertical-align", "middle");

                if (showGridLines) {
                    commCell.style("border-left", borderStyle).style("border-right", borderStyle);
                }

                const cellContainer = commCell.append("div")
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("justify-content", "space-between")
                    .style("gap", "6px")
                    .style("width", "100%")
                    .style("min-height", "22px");

                const isEditing = this.editingCommentRowId === row.id;

                if (isEditing) {
                    const textVal = this.editingCommentValue !== null ? this.editingCommentValue : (this.collapsedState[commentaryKey] || "");
                    
                    const input = cellContainer.append("input")
                        .attr("type", "text")
                        .attr("value", textVal)
                        .attr("placeholder", "Add custom commentary...")
                        .style("flex", "1")
                        .style("width", "100%")
                        .style("font-size", fontSize + "px")
                        .style("font-family", "inherit")
                        .style("font-weight", "500")
                        .style("padding", "2px 8px")
                        .style("border", "1px solid #6366f1")
                        .style("border-radius", "6px")
                        .style("outline", "none")
                        .style("background-color", "#ffffff")
                        .style("color", "#1e293b");

                    // Focus input
                    setTimeout(() => {
                        try {
                            (input.node() as HTMLInputElement)?.focus();
                        } catch (e) {}
                    }, 50);

                    input.on("input", () => {
                        this.editingCommentValue = (input.node() as HTMLInputElement).value;
                    });

                    input.on("keydown", (e: any) => {
                        const ev = e as KeyboardEvent;
                        if (ev.key === "Enter") {
                            const val = (input.node() as HTMLInputElement).value.trim();
                            if (val) {
                                this.collapsedState[commentaryKey] = val;
                            } else {
                                delete this.collapsedState[commentaryKey];
                            }
                            this.editingCommentRowId = null;
                            this.editingCommentValue = null;
                            this.update(options);
                        } else if (ev.key === "Escape") {
                            this.editingCommentRowId = null;
                            this.editingCommentValue = null;
                            this.update(options);
                        }
                    });

                    const btnGroup = cellContainer.append("div")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("gap", "4px")
                        .style("flex-shrink", "0");

                    // 1. Save Button
                    const saveBtn = btnGroup.append("button")
                        .attr("title", "Save")
                        .style("padding", "4px")
                        .style("background", "#ecfdf5")
                        .style("color", "#059669")
                        .style("border", "1px solid #10b981")
                        .style("border-radius", "4px")
                        .style("cursor", "pointer")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("justify-content", "center")
                        .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>');

                    saveBtn.on("click", (e: any) => {
                        const ev = e || (window as any).event;
                        if (ev) {
                            if (ev.stopPropagation) ev.stopPropagation();
                            if (ev.preventDefault) ev.preventDefault();
                        }
                        const val = (input.node() as HTMLInputElement).value.trim();
                        if (val) {
                            this.collapsedState[commentaryKey] = val;
                        } else {
                            delete this.collapsedState[commentaryKey];
                        }
                        this.editingCommentRowId = null;
                        this.editingCommentValue = null;
                        this.update(options);
                    });

                    // 2. Dismiss Button
                    const dismissBtn = btnGroup.append("button")
                        .attr("title", "Dismiss")
                        .style("padding", "4px")
                        .style("background", "#fef2f2")
                        .style("color", "#dc2626")
                        .style("border", "1px solid #ef4444")
                        .style("border-radius", "4px")
                        .style("cursor", "pointer")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("justify-content", "center")
                        .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>');

                    dismissBtn.on("click", (e: any) => {
                        const ev = e || (window as any).event;
                        if (ev) {
                            if (ev.stopPropagation) ev.stopPropagation();
                            if (ev.preventDefault) ev.preventDefault();
                        }
                        this.editingCommentRowId = null;
                        this.editingCommentValue = null;
                        this.update(options);
                    });

                } else {
                    const currentComment = this.collapsedState[commentaryKey];
                    const contentWrapper = cellContainer.append("div")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("gap", "6px")
                        .style("flex", "1")
                        .style("min-width", "0");

                    if (currentComment) {
                        contentWrapper.append("span")
                            .style("color", "#6366f1")
                            .style("display", "inline-flex")
                            .style("align-items", "center")
                            .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 11px; height: 11px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>');

                        contentWrapper.append("span")
                            .style("font-style", "italic")
                            .style("font-size", fontSize + "px")
                            .style("color", currentRowText)
                            .style("font-weight", "500")
                            .style("white-space", "nowrap")
                            .style("overflow", "hidden")
                            .style("text-overflow", "ellipsis")
                            .style("max-width", "130px")
                            .attr("title", currentComment)
                            .text(currentComment);
                    } else {
                        contentWrapper.append("span")
                            .style("font-style", "italic")
                            .style("font-size", Math.max(9, fontSize - 1) + "px")
                            .style("color", "#94a3b8")
                            .style("user-select", "none")
                            .text("No commentary");
                    }

                    const btnGroup = cellContainer.append("div")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("gap", "4px")
                        .style("flex-shrink", "0")
                        .style("margin-left", "auto");

                    // 1. Check Button / Save sync status indicator
                    const saveBtn = btnGroup.append("button")
                        .attr("title", "Saved & Sync")
                        .style("padding", "4px")
                        .style("background", "transparent")
                        .style("color", "#10b981")
                        .style("border", "none")
                        .style("border-radius", "4px")
                        .style("cursor", "pointer")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("justify-content", "center")
                        .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>');

                    saveBtn.on("click", (e: any) => {
                        const ev = e || (window as any).event;
                        if (ev && ev.stopPropagation) ev.stopPropagation();
                    });

                    // 2. Edit Button
                    const editBtn = btnGroup.append("button")
                        .attr("title", "Edit Commentary")
                        .style("padding", "4px")
                        .style("background", "transparent")
                        .style("color", "#4f46e5")
                        .style("border", "none")
                        .style("border-radius", "4px")
                        .style("cursor", "pointer")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("justify-content", "center")
                        .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>');

                    editBtn.on("click", (e: any) => {
                        const ev = e || (window as any).event;
                        if (ev) {
                            if (ev.stopPropagation) ev.stopPropagation();
                            if (ev.preventDefault) ev.preventDefault();
                        }
                        this.editingCommentRowId = row.id;
                        this.editingCommentValue = this.collapsedState[commentaryKey] || "";
                        this.update(options);
                    });

                    // 3. Dismiss/Delete commentary Button
                    const dismissBtn = btnGroup.append("button")
                        .attr("title", "Dismiss / Clear")
                        .style("padding", "4px")
                        .style("background", "transparent")
                        .style("color", "#f43f5e")
                        .style("border", "none")
                        .style("border-radius", "4px")
                        .style("cursor", "pointer")
                        .style("display", "flex")
                        .style("align-items", "center")
                        .style("justify-content", "center")
                        .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>');

                    dismissBtn.on("click", (e: any) => {
                        const ev = e || (window as any).event;
                        if (ev) {
                            if (ev.stopPropagation) ev.stopPropagation();
                            if (ev.preventDefault) ev.preventDefault();
                        }
                        if (this.collapsedState[commentaryKey]) {
                            delete this.collapsedState[commentaryKey];
                            this.update(options);
                        }
                    });
                }
            }
        });

        // Ensure relative layout context on visual's container for perfect absolute modal stacking
        this.container.style("position", "relative");

        // --- RENDER RECURSIVE USER MANUAL / GUIDE ---
        if (this.isHelpOpen) {
            const helpOverlay = this.container.append("div")
                .classed("matrix-help-popup", true)
                .style("position", "absolute")
                .style("top", "44px")
                .style("right", "12px")
                .style("width", "360px")
                .style("max-width", "calc(100% - 24px)")
                .style("max-height", "calc(100% - 64px)")
                .style("background-color", rowBgColor)
                .style("border", "1px solid " + gridLineColor)
                .style("border-radius", "8px")
                .style("box-shadow", "0 10px 25px -5px rgba(0,0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)")
                .style("z-index", "99999")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("font-family", appliedFont)
                .style("color", rowTextColor)
                .style("overflow-y", "auto");

            const helpHeader = helpOverlay.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "space-between")
                .style("padding", "10px 14px")
                .style("border-bottom", "1px solid " + gridLineColor)
                .style("background-color", headerBgColor);

            helpHeader.append("div")
                .text("Financial Matrix User Manual")
                .style("font-size", "11px")
                .style("font-weight", "700")
                .style("text-transform", "uppercase")
                .style("color", headerTextColor)
                .style("letter-spacing", "0.03em");

            const closeHelp = helpHeader.append("button")
                .attr("title", "Close manual")
                .style("border", "none")
                .style("background", "transparent")
                .style("cursor", "pointer")
                .style("padding", "2px 6px")
                .style("color", headerTextColor)
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .style("line-height", "1")
                .style("display", "flex")
                .style("align-items", "center")
                .html("&times;");

            closeHelp.on("click", () => {
                this.isHelpOpen = false;
                this.update(options);
            });

            const helpBody = helpOverlay.append("div")
                .style("padding", "14px")
                .style("font-size", "11px")
                .style("line-height", "1.5")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "12px");

            // Overview
            const p1 = helpBody.append("div");
            p1.append("div")
                .text("DESIGN OVERVIEW")
                .style("font-weight", "700")
                .style("font-size", "9px")
                .style("color", accentColor)
                .style("letter-spacing", "0.05em")
                .style("margin-bottom", "4px");
            p1.append("div")
                .text("The Custom Financial Matrix compiles hierarchical corporate accounts dynamically. Tailored specifically for Profit & Loss statement structures with advanced drill and formatting tools.")
                .style("opacity", "0.85");

            // Key Gestures
            const p2 = helpBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "6px");
            p2.append("div")
                .text("INTERACTIONS & GESTURES")
                .style("font-weight", "700")
                .style("font-size", "9px")
                .style("color", accentColor)
                .style("letter-spacing", "0.05em");

            const actions = [
                { title: "▶ Hierarchy Drilling", desc: "Toggle chevron arrows directly to dive deep (Drill down) or collapse summary nodes." },
                { title: "📝 Live Remarks", desc: "Directly click and enter text in any cell inside the Remarks column. Sourced local states will seamlessly cache comments on change." },
                { title: "📥 Pro-grade Download", desc: "The 'Export XLS' button converts the parsed statements into styled workbook sheets matching your dynamic color filters." },
                { title: "⚙ Instant Style Controls", desc: "Toggle heatmaps, headers, and color systems on-the-fly without needing any canvas edits." }
            ];

            actions.forEach(act => {
                const item = p2.append("div").style("margin-bottom", "2px");
                item.append("div").text(act.title).style("font-weight", "600").style("color", headerTextColor);
                item.append("div").text(act.desc).style("opacity", "0.8").style("padding-left", "8px");
            });

            // Help Footer
            helpBody.append("div")
                .style("padding-top", "8px")
                .style("border-top", "1px dashed " + gridLineColor)
                .style("font-size", "9px")
                .style("opacity", "0.7")
                .style("text-align", "center")
                .text("Power BI Template • Version 1.4.2 • Profitbase AS");
        }

        // --- RENDER INTERACTIVE DIRECT-STYLING SETTINGS PANEL ---
        if (this.isSettingsOpen) {
            const settingsOverlay = this.container.append("div")
                .classed("matrix-settings-popup", true)
                .style("position", "absolute")
                .style("top", "44px")
                .style("right", "12px")
                .style("width", "360px")
                .style("max-width", "calc(100% - 24px)")
                .style("max-height", "calc(100% - 64px)")
                .style("background-color", rowBgColor)
                .style("border", "1px solid " + gridLineColor)
                .style("border-radius", "8px")
                .style("box-shadow", "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)")
                .style("z-index", "99999")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("font-family", appliedFont)
                .style("color", rowTextColor)
                .style("overflow-y", "auto");

            const settingsHeader = settingsOverlay.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "space-between")
                .style("padding", "10px 14px")
                .style("border-bottom", "1px solid " + gridLineColor)
                .style("background-color", headerBgColor);

            settingsHeader.append("div")
                .text("Instant Matrix Settings")
                .style("font-size", "11px")
                .style("font-weight", "700")
                .style("text-transform", "uppercase")
                .style("color", headerTextColor)
                .style("letter-spacing", "0.03em");

            const closeSettings = settingsHeader.append("button")
                .attr("title", "Close settings")
                .style("border", "none")
                .style("background", "transparent")
                .style("cursor", "pointer")
                .style("padding", "2px 6px")
                .style("color", headerTextColor)
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .style("line-height", "1")
                .style("display", "flex")
                .style("align-items", "center")
                .html("&times;");

            closeSettings.on("click", () => {
                this.isSettingsOpen = false;
                this.update(options);
            });

            const settingsBody = settingsOverlay.append("div")
                .style("padding", "14px")
                .style("font-size", "11px")
                .style("line-height", "1.5")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "12px");

            // Row 1: Theme Selection
            const themeGroup = settingsBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "4px");
            themeGroup.append("label")
                .text("Active Palette Theme")
                .style("font-weight", "600")
                .style("color", headerTextColor);
            const selectTheme = themeGroup.append("select")
                .style("padding", "4px 8px")
                .style("border-radius", "4px")
                .style("font-size", "10px")
                .style("border", "1px solid " + gridLineColor)
                .style("background-color", headerBgColor)
                .style("color", rowTextColor)
                .style("outline", "none")
                .style("cursor", "pointer");

            const themeOptions = [
                { value: "light", label: "Corporate Light" },
                { value: "dark", label: "Charcoal Dark" },
                { value: "slate", label: "Deep Slate" },
                { value: "sepia", label: "Warm Sepia" }
            ];
            themeOptions.forEach(opt => {
                selectTheme.append("option")
                    .attr("value", opt.value)
                    .property("selected", selectedTheme === opt.value)
                    .text(opt.label);
            });

            selectTheme.on("change", () => {
                this.settingOverrides.gridTheme = this.settingOverrides.gridTheme || {};
                this.settingOverrides.gridTheme.selectedTheme = selectTheme.property("value");
                // Clear manual design color overrides so the selected theme's auto colors take primary effect!
                delete this.settingOverrides.gridTheme.headerBgColor;
                delete this.settingOverrides.gridTheme.headerTextColor;
                delete this.settingOverrides.gridTheme.rowBgColor;
                delete this.settingOverrides.gridTheme.rowTextColor;
                delete this.settingOverrides.gridTheme.subtotalBgColor;
                delete this.settingOverrides.gridTheme.subtotalTextColor;
                delete this.settingOverrides.gridTheme.grandtotalBgColor;
                delete this.settingOverrides.gridTheme.grandtotalTextColor;
                delete this.settingOverrides.gridTheme.hoverBgColor;
                delete this.settingOverrides.gridTheme.gridLineColor;
                this.update(options);
            });

            // Row 2: Accent Brand Swatches
            const accentGroup = settingsBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "6px");
            accentGroup.append("label")
                .text("Accent Brand Indicator")
                .style("font-weight", "600")
                .style("color", headerTextColor);
            const colorSwatches = accentGroup.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("gap", "8px");

            const accents = [
                { color: "#0f172a", label: "Slate" },
                { color: "#4f46e5", label: "Indigo" },
                { color: "#10b981", label: "Emerald" },
                { color: "#0ea5e9", label: "Sky" },
                { color: "#f43f5e", label: "Rose" },
                { color: "#f59e0b", label: "Amber" }
            ];

            accents.forEach(acc => {
                const swatch = colorSwatches.append("div")
                    .attr("title", acc.label)
                    .style("width", "16px")
                    .style("height", "16px")
                    .style("border-radius", "50%")
                    .style("background-color", acc.color)
                    .style("cursor", "pointer")
                    .style("border", accentColor.toLowerCase() === acc.color.toLowerCase() ? "2px solid #ffffff" : "none")
                    .style("box-shadow", "0 0 0 1px " + gridLineColor);

                swatch.on("click", () => {
                    this.settingOverrides.gridTheme = this.settingOverrides.gridTheme || {};
                    this.settingOverrides.gridTheme.accentColor = acc.color;
                    this.update(options);
                });
            });

            // Row 3: Font Typography Family
            const fontGroup = settingsBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "4px");
            fontGroup.append("label")
                .text("Typography Font")
                .style("font-weight", "600")
                .style("color", headerTextColor);
            const selectFont = fontGroup.append("select")
                .style("padding", "4px 8px")
                .style("border-radius", "4px")
                .style("font-size", "10px")
                .style("border", "1px solid " + gridLineColor)
                .style("background-color", headerBgColor)
                .style("color", rowTextColor)
                .style("outline", "none")
                .style("cursor", "pointer");

            const fontOpts = [
                { value: "sans", label: "Inter Sans-serif" },
                { value: "display", label: "Space Grotesk (Tech)" },
                { value: "mono", label: "JetBrains Mono" },
                { value: "serif", label: "Georgia Serif" },
                { value: "segoe", label: "Segoe UI Condensed" },
                { value: "aptos", label: "Aptos Corporate" }
            ];
            fontOpts.forEach(opt => {
                selectFont.append("option")
                    .attr("value", opt.value)
                    .property("selected", fontFamily === opt.value)
                    .text(opt.label);
            });

            selectFont.on("change", () => {
                this.settingOverrides.gridTheme = this.settingOverrides.gridTheme || {};
                this.settingOverrides.gridTheme.fontFamily = selectFont.property("value");
                this.update(options);
            });

            // Row 4: Padding density
            const paddingGroup = settingsBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "4px");
            paddingGroup.append("label")
                .text("Row Spacing Density")
                .style("font-weight", "600")
                .style("color", headerTextColor);
            const selectPadding = paddingGroup.append("select")
                .style("padding", "4px 8px")
                .style("border-radius", "4px")
                .style("font-size", "10px")
                .style("border", "1px solid " + gridLineColor)
                .style("background-color", headerBgColor)
                .style("color", rowTextColor)
                .style("outline", "none")
                .style("cursor", "pointer");

            selectPadding.append("option").attr("value", "cozy").property("selected", rowPadding === "cozy").text("Cozy (standard)");
            selectPadding.append("option").attr("value", "compact").property("selected", rowPadding === "compact").text("Compact (dense)");

            selectPadding.on("change", () => {
                this.settingOverrides.gridTheme = this.settingOverrides.gridTheme || {};
                this.settingOverrides.gridTheme.rowPadding = selectPadding.property("value");
                this.update(options);
            });

            // Row 5: Dynamic Checkbox Toggles
            const checkboxSec = settingsBody.append("div")
                .style("display", "flex")
                .style("flex-direction", "column")
                .style("gap", "6px")
                .style("padding-top", "6px")
                .style("border-top", "1px dashed " + gridLineColor);

            const toggles = [
                { key: "showGridLines", target: "gridTheme", value: showGridLines, label: "Draw Table Grid lines" },
                { key: "highlightSubtotals", target: "gridTheme", value: highlightSubtotals, label: "Emphasize Subtotals (Bold)" },
                { key: "showAccentBorders", target: "gridTheme", value: showAccentBorders, label: "Apply Left Accent Border on Level 0" },
                { key: "showCommentary", target: "commentaryColumn", value: showCommentary, label: "Show Commentary / Remarks Column" },
                { key: "enableRowVarianceFormatting", target: "conditionalFormatting", value: enableRowVarianceFormatting, label: "Format Variance Column (Red/Green)" },
                { key: "enableRowHeatmap", target: "conditionalFormatting", value: enableRowHeatmap, label: "Format Budget Heatmap (Values Highlight)" }
            ];

            toggles.forEach(t => {
                const item = checkboxSec.append("label")
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("gap", "8px")
                    .style("cursor", "pointer")
                    .style("font-weight", "500");

                const chk = item.append("input")
                    .attr("type", "checkbox")
                    .property("checked", t.value)
                    .style("cursor", "pointer");

                item.append("span").text(t.label);

                chk.on("change", () => {
                    this.settingOverrides[t.target] = this.settingOverrides[t.target] || {};
                    this.settingOverrides[t.target][t.key] = chk.property("checked");
                    this.update(options);
                });
            });
        }
    }

    public destroy(): void {
        this.container.selectAll("*").remove();
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumeration {
        const objectName = options.objectName;
        const objectEnumeration: VisualObjectInstance[] = [];

        switch (objectName) {
            case "gridTheme":
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        selectedTheme: this.currentSettings.gridTheme.selectedTheme,
                        fontFamily: this.currentSettings.gridTheme.fontFamily,
                        fontSize: this.currentSettings.gridTheme.fontSize,
                        rowPadding: this.currentSettings.gridTheme.rowPadding,
                        showGridLines: this.currentSettings.gridTheme.showGridLines,
                        highlightSubtotals: this.currentSettings.gridTheme.highlightSubtotals,
                        showAccentBorders: this.currentSettings.gridTheme.showAccentBorders,
                        columnWidthMode: this.currentSettings.gridTheme.columnWidthMode,
                        columnWidthValue: this.currentSettings.gridTheme.columnWidthValue,
                        rowHeightMode: this.currentSettings.gridTheme.rowHeightMode,
                        rowHeightValue: this.currentSettings.gridTheme.rowHeightValue,
                        headerBgColor: { solid: { color: this.currentSettings.gridTheme.headerBgColor || "" } },
                        headerTextColor: { solid: { color: this.currentSettings.gridTheme.headerTextColor || "" } },
                        rowBgColor: { solid: { color: this.currentSettings.gridTheme.rowBgColor || "" } },
                        rowTextColor: { solid: { color: this.currentSettings.gridTheme.rowTextColor || "" } },
                        subtotalBgColor: { solid: { color: this.currentSettings.gridTheme.subtotalBgColor || "" } },
                        subtotalTextColor: { solid: { color: this.currentSettings.gridTheme.subtotalTextColor || "" } },
                        grandtotalBgColor: { solid: { color: this.currentSettings.gridTheme.grandtotalBgColor || "" } },
                        grandtotalTextColor: { solid: { color: this.currentSettings.gridTheme.grandtotalTextColor || "" } },
                        hoverBgColor: { solid: { color: this.currentSettings.gridTheme.hoverBgColor || "" } },
                        gridLineColor: { solid: { color: this.currentSettings.gridTheme.gridLineColor || "" } },
                        accentColor: { solid: { color: this.currentSettings.gridTheme.accentColor || "" } },
                        hideEmptyExpand: this.currentSettings.gridTheme.hideEmptyExpand
                    },
                    selector: null
                });
                break;
            case "numberFormatting":
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        formatStyle: this.currentSettings.numberFormatting.formatStyle
                    },
                    selector: null
                });
                break;
            case "commentaryColumn":
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        showCommentary: this.currentSettings.commentaryColumn.showCommentary
                    },
                    selector: null
                });
                break;
            case "toolbarSettings":
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        showToolbar: this.currentSettings.toolbarSettings.showToolbar,
                        showTitle: this.currentSettings.toolbarSettings.showTitle,
                        titleText: this.currentSettings.toolbarSettings.titleText,
                        titleBgColor: { solid: { color: this.currentSettings.toolbarSettings.titleBgColor || "" } },
                        titleTextColor: { solid: { color: this.currentSettings.toolbarSettings.titleTextColor || "" } },
                        showExpandCollapse: this.currentSettings.toolbarSettings.showExpandCollapse,
                        showExport: this.currentSettings.toolbarSettings.showExport,
                        showMaximize: this.currentSettings.toolbarSettings.showMaximize
                    },
                    selector: null
                });
                break;
            case "conditionalFormatting":
                objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        enableRowVarianceFormatting: this.currentSettings.conditionalFormatting.enableRowVarianceFormatting,
                        enableRowHeatmap: this.currentSettings.conditionalFormatting.enableRowHeatmap,
                        columnFormattingTarget: this.currentSettings.conditionalFormatting.columnFormattingTarget,
                        columnFormattingType: this.currentSettings.conditionalFormatting.columnFormattingType,
                        positiveColor: { solid: { color: this.currentSettings.conditionalFormatting.positiveColor } },
                        negativeColor: { solid: { color: this.currentSettings.conditionalFormatting.negativeColor } },
                        enableExpandedHighlight: this.currentSettings.conditionalFormatting.enableExpandedHighlight,
                        expandedParentBgColor: { solid: { color: this.currentSettings.conditionalFormatting.expandedParentBgColor } },
                        expandedParentTextColor: { solid: { color: this.currentSettings.conditionalFormatting.expandedParentTextColor } },
                        expandedChildBgColor: { solid: { color: this.currentSettings.conditionalFormatting.expandedChildBgColor } },
                        expandedChildTextColor: { solid: { color: this.currentSettings.conditionalFormatting.expandedChildTextColor } },
                        enableDaxCondFormatting: this.currentSettings.conditionalFormatting.enableDaxCondFormatting,
                        daxCondMeasureId: this.currentSettings.conditionalFormatting.daxCondMeasureId,
                        daxCondTarget: this.currentSettings.conditionalFormatting.daxCondTarget,
                        daxCondCondition: this.currentSettings.conditionalFormatting.daxCondCondition,
                        daxCondValue1: this.currentSettings.conditionalFormatting.daxCondValue1,
                        daxCondValue2: this.currentSettings.conditionalFormatting.daxCondValue2,
                        daxCondBgColor: { solid: { color: this.currentSettings.conditionalFormatting.daxCondBgColor } },
                        daxCondTextColor: { solid: { color: this.currentSettings.conditionalFormatting.daxCondTextColor } },
                        daxMeasuresJson: this.currentSettings.conditionalFormatting.daxMeasuresJson,
                        customRulesJson: this.currentSettings.conditionalFormatting.customRulesJson
                    },
                    selector: null
                });
                break;
        }

        return objectEnumeration;
    }

    private showContextMenu(event: MouseEvent, row: any, colId: string, options: any) {
        event.preventDefault();
        event.stopPropagation();
        
        // Remove any existing context menus
        this.container.selectAll(".pbi-custom-context-menu").remove();

        const menu = this.container.append("div")
            .classed("pbi-custom-context-menu", true)
            .style("position", "absolute")
            .style("left", (event.clientX || event.pageX || 100) + "px")
            .style("top", (event.clientY || event.pageY || 100) + "px")
            .style("background", "#ffffff")
            .style("border", "1px solid #cbd5e1")
            .style("border-radius", "6px")
            .style("box-shadow", "0 4px 12px rgba(15, 23, 42, 0.15)")
            .style("padding", "6px 0")
            .style("z-index", "99999")
            .style("font-family", "inherit")
            .style("font-size", "11px")
            .style("min-width", "180px");

        const rowName = row.cleanName || "";
        
        // Option 1: Format Row Header or Row
        let targetLabel = "row-header";
        let displayTargetName = "Row Header (" + rowName + ")";
        if (colId !== "row-header") {
            targetLabel = colId;
            displayTargetName = "Column '" + colId.toUpperCase() + "' for '" + rowName + "'";
        }

        menu.append("div")
            .style("padding", "6px 12px")
            .style("cursor", "pointer")
            .style("color", "#1e293b")
            .style("font-weight", "500")
            .html("🎨 Conditional format " + displayTargetName + "...")
            .on("mouseover", function() { d3Select(this).style("background", "#f1f5f9"); })
            .on("mouseout", function() { d3Select(this).style("background", "transparent"); })
            .on("click", (e: any) => {
                e.stopPropagation();
                menu.remove();
                this.showFormattingModal(row, colId, options);
            });

        // Option 2: Format entire row
        menu.append("div")
            .style("padding", "6px 12px")
            .style("cursor", "pointer")
            .style("color", "#1e293b")
            .style("font-weight", "500")
            .html("⚡ Format entire Row '" + rowName + "'...")
            .on("mouseover", function() { d3Select(this).style("background", "#f1f5f9"); })
            .on("mouseout", function() { d3Select(this).style("background", "transparent"); })
            .on("click", (e: any) => {
                e.stopPropagation();
                menu.remove();
                this.showFormattingModal(row, "row", options);
            });

        // Option 3: Clear all custom rules
        menu.append("div")
            .style("padding", "6px 12px")
            .style("cursor", "pointer")
            .style("color", "#ef4444")
            .style("font-weight", "500")
            .html("🧹 Clear all custom formatting rules")
            .on("mouseover", function() { d3Select(this).style("background", "#fee2e2"); })
            .on("mouseout", function() { d3Select(this).style("background", "transparent"); })
            .on("click", (e: any) => {
                e.stopPropagation();
                menu.remove();
                this.saveCustomRules([], options);
            });

        // Auto close custom-menu when clicking elsewhere
        d3Select(document).on("click.contextmenu-close", () => {
            menu.remove();
            d3Select(document).on("click.contextmenu-close", null);
        });
    }

    private showFormattingModal(row: any, colId: string, options: any) {
        // Remove existing modals
        this.container.selectAll(".pbi-custom-modal-overlay").remove();

        const overlay = this.container.append("div")
            .classed("pbi-custom-modal-overlay", true)
            .style("position", "absolute")
            .style("top", "0")
            .style("left", "0")
            .style("width", "100%")
            .style("height", "100%")
            .style("background", "rgba(15, 23, 42, 0.4)")
            .style("display", "flex")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("z-index", "100000");

        const modal = overlay.append("div")
            .style("background", "#ffffff")
            .style("border-radius", "8px")
            .style("border", "1px solid #cbd5e1")
            .style("box-shadow", "0 10px 25px rgba(15, 23, 42, 0.15)")
            .style("width", "340px")
            .style("padding", "16px")
            .style("font-family", "inherit")
            .style("color", "#0f172a");

        const rowName = row.cleanName || "";

        // Modal Header
        const header = modal.append("div")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("align-items", "center")
            .style("margin-bottom", "14px");

        header.append("span")
            .style("font-weight", "700")
            .style("font-size", "13px")
            .style("color", "#1e293b")
            .text("Conditional Formatting Rule");

        header.append("button")
            .style("background", "transparent")
            .style("border", "none")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("color", "#64748b")
            .style("cursor", "pointer")
            .html("&times;")
            .on("click", () => overlay.remove());

        // Body Elements
        const form = modal.append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("gap", "10px")
            .style("font-size", "11px");

        // Info block
        form.append("div")
            .style("background", "#f8fafc")
            .style("border-radius", "4px")
            .style("padding", "6px 8px")
            .style("font-size", "10.5px")
            .style("color", "#475569")
            .html("Applying formatting override when analyzing <strong>" + rowName + "</strong> on target <strong>" + colId.toUpperCase() + "</strong>.");

        // Operator choose (Contains OR Equal)
        const opGroup = form.append("div").style("display", "flex").style("flex-direction", "column").style("gap", "3px");
        opGroup.append("label").text("Condition Operator").style("font-weight", "600").style("color", "#475569");
        const opSelect = opGroup.append("select")
            .style("padding", "4px 8px")
            .style("border-radius", "4px")
            .style("border", "1px solid #cbd5e1")
            .style("outline", "none");

        // operator choices
        const isHeaderOrRow = colId === "row-header" || colId === "row";
        const operators = isHeaderOrRow 
            ? [{ value: "contains", label: "Text Contains" }, { value: "equal", label: "Text Matches Exactly" }, { value: "empty", label: "Text is Blank" }]
            : [{ value: "greater", label: "Greater Than (>)" }, { value: "less", label: "Less Than (<)" }, { value: "equal", label: "Equals (=)" }];

        operators.forEach(op => {
            opSelect.append("option").attr("value", op.value).text(op.label);
        });

        // Compare Value
        const valGroup = form.append("div").style("display", "flex").style("flex-direction", "column").style("gap", "3px");
        valGroup.append("label").text("Match / Compare Value").style("font-weight", "600").style("color", "#475569");
        const valInput = valGroup.append("input")
            .attr("type", isHeaderOrRow ? "text" : "number")
            .attr("value", isHeaderOrRow ? rowName : "0")
            .style("padding", "4px 8px")
            .style("border-radius", "4px")
            .style("border", "1px solid #cbd5e1")
            .style("outline", "none");

        // BG, text, and bold
        const colorsRow = form.append("div").style("display", "flex").style("gap", "12px");

        const bgGroup = colorsRow.append("div").style("display", "flex").style("flex-direction", "column").style("gap", "3px").style("flex", "1");
        bgGroup.append("label").text("Row/Cell BG").style("font-weight", "600").style("color", "#475569");
        const bgPicker = bgGroup.append("input")
            .attr("type", "color")
            .attr("value", "#fef08a") // Default soft yellow highlight
            .style("width", "100%")
            .style("padding", "2px")
            .style("border", "1px solid #cbd5e1")
            .style("border-radius", "4px")
            .style("cursor", "pointer");

        const fgGroup = colorsRow.append("div").style("display", "flex").style("flex-direction", "column").style("gap", "3px").style("flex", "1");
        fgGroup.append("label").text("Font Color").style("font-weight", "600").style("color", "#475569");
        const fgPicker = fgGroup.append("input")
            .attr("type", "color")
            .attr("value", "#000000") // Default black text
            .style("width", "100%")
            .style("padding", "2px")
            .style("border", "1px solid #cbd5e1")
            .style("border-radius", "4px")
            .style("cursor", "pointer");

        // DAX Option evaluation configuration
        let hasDaxFeatures = false;
        let daxToggle: any = null;
        let daxSelect: any = null;
        let daxGroup: any = null;

        let daxMeasuresList: any[] = [];
        try {
            daxMeasuresList = JSON.parse(this.currentSettings.conditionalFormatting.daxMeasuresJson || "[]");
        } catch (e) {
            daxMeasuresList = [];
        }

        if (daxMeasuresList.length > 0) {
            hasDaxFeatures = true;

            const toggleGroup = form.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("gap", "6px")
                .style("margin-top", "4px");
            
            daxToggle = toggleGroup.append("input")
                .attr("type", "checkbox")
                .attr("id", "pbi-modal-dax-chk")
                .style("cursor", "pointer");

            toggleGroup.append("label")
                .attr("for", "pbi-modal-dax-chk")
                .text("Evaluate DAX Measure instead of cell value")
                .style("font-weight", "600")
                .style("color", "#4f46e5")
                .style("cursor", "pointer");

            daxGroup = form.append("div")
                .style("display", "none") // starts hidden
                .style("flex-direction", "column")
                .style("gap", "3px");

            daxGroup.append("label").text("Base DAX Measure").style("font-weight", "600").style("color", "#475569");
            
            daxSelect = daxGroup.append("select")
                .style("padding", "4px 8px")
                .style("border-radius", "4px")
                .style("border", "1px solid #cbd5e1")
                .style("outline", "none")
                .style("color", "#1e293b")
                .style("font-weight", "500");

            daxMeasuresList.forEach((m: any) => {
                daxSelect.append("option").attr("value", m.id).text(m.name + " (" + m.formula + ")");
            });

            daxToggle.on("change", () => {
                const checked = daxToggle.property("checked");
                daxGroup.style("display", checked ? "flex" : "none");

                if (isHeaderOrRow) {
                    opSelect.selectAll("option").remove();
                    const currentOps = checked
                        ? [{ value: "greater", label: "Greater Than (>)" }, { value: "less", label: "Less Than (<)" }, { value: "equal", label: "Equals (=)" }]
                        : [{ value: "contains", label: "Text Contains" }, { value: "equal", label: "Text Matches Exactly" }, { value: "empty", label: "Text is Blank" }];
                    currentOps.forEach(op => {
                        opSelect.append("option").attr("value", op.value).text(op.label);
                    });
                    valInput.attr("type", checked ? "number" : "text")
                            .property("value", checked ? "0" : rowName);
                }
            });
        }

        const boldGroup = form.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("gap", "6px")
            .style("margin", "4px 0");
        const boldCheck = boldGroup.append("input")
            .attr("type", "checkbox")
            .attr("id", "pbi-modal-bold-chk")
            .style("cursor", "pointer");
        boldGroup.append("label")
            .attr("for", "pbi-modal-bold-chk")
            .text("Make format font text bold")
            .style("font-weight", "600")
            .style("color", "#475569")
            .style("cursor", "pointer");

        // Action Buttons Row
        const actionsRow = modal.append("div")
            .style("display", "flex")
            .style("justify-content", "end")
            .style("gap", "8px")
            .style("margin-top", "16px");

        actionsRow.append("button")
            .style("padding", "4px 10px")
            .style("border-radius", "4px")
            .style("border", "1px solid #cbd5e1")
            .style("background", "#ffffff")
            .style("color", "#64748b")
            .style("cursor", "pointer")
            .style("font-size", "11px")
            .text("Cancel")
            .on("click", () => overlay.remove());

        actionsRow.append("button")
            .style("padding", "4px 12px")
            .style("border-radius", "4px")
            .style("border", "none")
            .style("background", "#4f46e5")
            .style("color", "#ffffff")
            .style("cursor", "pointer")
            .style("font-weight", "600")
            .style("font-size", "11px")
            .text("Save Rule")
            .on("click", () => {
                const op = opSelect.property("value");
                const compareVal = valInput.property("value");
                const bg = bgPicker.property("value");
                const fg = fgPicker.property("value");
                const bold = boldCheck.property("checked");

                const useDax = hasDaxFeatures && daxToggle ? daxToggle.property("checked") : false;
                const daxMeasureId = hasDaxFeatures && daxSelect ? daxSelect.property("value") : undefined;

                const newRule = {
                    id: "rule-" + Date.now(),
                    target: colId,
                    operator: op,
                    value: compareVal,
                    bgColor: bg,
                    textColor: fg,
                    isBold: bold,
                    useDax: useDax,
                    daxMeasureId: daxMeasureId
                };

                let currentRules: any[] = [];
                try {
                    currentRules = JSON.parse(this.currentSettings.conditionalFormatting.customRulesJson || "[]");
                } catch(e) {
                    currentRules = [];
                }

                currentRules.push(newRule);
                this.saveCustomRules(currentRules, options);
                overlay.remove();
            });
    }

    private saveCustomRules(updatedRules: any[], options: any) {
        const rulesStr = JSON.stringify(updatedRules);
        this.currentSettings.conditionalFormatting.customRulesJson = rulesStr;
        this.settingOverrides.conditionalFormatting = this.settingOverrides.conditionalFormatting || {};
        this.settingOverrides.conditionalFormatting.customRulesJson = rulesStr;

        if (this.host && typeof this.host.persistProperties === "function") {
            this.host.persistProperties({
                merge: [{
                    objectName: "conditionalFormatting",
                    selector: null,
                    properties: {
                        customRulesJson: rulesStr
                    }
                }]
            });
        }
        this.update(options);
    }
}`,
      "style/visual.less": `.financial-matrix-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: transparent;
    padding: 12px;
    box-sizing: border-box;

    .no-data-msg {
        color: #94a3b8;
        font-size: 13px;
        text-align: center;
        padding: 40px 20px;
        line-height: 1.6;
    }

    .pbi-matrix-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        background: #ffffff;

        thead {
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            
            th {
                padding: 10px 12px;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.05em;
                color: #475569;
                text-align: left;
                
                &.num-cell {
                    text-align: right;
                }
            }
        }

        tbody {
            .matrix-row {
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.15s ease;

                &:hover {
                    background-color: #f1f5f9;
                }

                td {
                    padding: 8px 12px;
                    color: #1e293b;
                    
                    &.num-cell {
                        text-align: right;
                        font-family: inherit;
                        font-weight: 500;
                    }

                    .expand-collapse-btn {
                        display: inline-block;
                        width: 14px;
                        cursor: pointer;
                        color: #64748b;
                        font-weight: bold;
                        user-select: none;
                        transition: color 0.2s ease;
                        
                        &:hover {
                            color: #0f172a;
                        }
                    }

                    .leaf-bullet {
                        display: inline-block;
                        width: 14px;
                        color: #cbd5e1;
                        user-select: none;
                    }

                    .account-name {
                        font-weight: 500;
                    }

                    .text-favorable {
                        color: #22c55e;
                        font-weight: 600;
                    }

                    .text-unfavorable {
                        color: #ef4444;
                        font-weight: 600;
                    }

                    .badge-variance {
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: 600;

                        &.badge-fav {
                            background-color: rgba(34, 197, 94, 0.1);
                            color: #15803d;
                        }
                        &.badge-unfav {
                            background-color: rgba(239, 68, 68, 0.1);
                            color: #b91c1c;
                        }
                    }
                }

                &.row-level-0 {
                    background-color: #fdfdfd;
                    td .account-name {
                        font-weight: 700;
                        color: #0f172a;
                    }
                }

                &.row-level-1 {
                    td .account-name {
                        color: #334155;
                    }
                }

                &.subtotal-row {
                    background-color: #f8fafc;
                    border-top: 1px solid #cbd5e1;
                    border-bottom: 2px solid #cbd5e1;
                    
                    td {
                        font-weight: 700 !important;
                        
                        .account-name {
                            font-weight: 700 !important;
                            color: #0f172a;
                        }
                    }
                }

                &.grandtotal-row {
                    background-color: #f1f5f9;
                    border-top: 2px solid #0f172a;
                    border-bottom: 4px double #0f172a;
                    
                    td {
                        font-weight: 800 !important;
                        font-size: 13px;
                        
                        .account-name {
                            font-weight: 850 !important;
                            color: #0f172a;
                        }
                    }
                }
            }
        }
    }
}`,
      "package.json": `{
  "name": "profitbase-financial-matrix",
  "version": "1.0.0",
  "description": "Profitbase financial table customized reporting visual.",
  "scripts": {
    "pbiviz": "pbiviz start",
    "package": "pbiviz package"
  },
  "dependencies": {
    "core-js": "^3.30.0",
    "d3-selection": "^3.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/d3": "^7.4.0",
    "@types/d3-selection": "^3.0.0",
    "powerbi-visuals-api": "^5.3.0"
  }
}`,
      "tsconfig.json": `{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["es2017", "dom"],
    "module": "commonjs",
    "outDir": ".tmp/build/",
    "sourceMap": true,
    "declaration": true,
    "noImplicitAny": false,
    "strict": false
  },
  "files": [
    "src/visual.ts"
  ]
}`
    }
  }
];
