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
    "version": "1.0.0",
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
  "capabilities": "capabilities.json"
}`,
      "capabilities.json": `{
  "dataRoles": [
    {
      "displayName": "Financial Accounts Hierarchy",
      "name": "category",
      "kind": "Grouping"
    },
    {
      "displayName": "Actual Measure",
      "name": "values",
      "kind": "Measure"
    },
    {
      "displayName": "Budget Measure",
      "name": "budget",
      "kind": "Measure"
    }
  ],
  "dataViewMappings": [
    {
      "categorical": {
        "categories": {
          "for": {
            "in": "category"
          }
        },
        "values": {
          "select": [
            { "bind": { "to": "values" } },
            { "bind": { "to": "budget" } }
          ]
        }
      }
    }
  ]
}`,
      "src/visual.ts": `import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { select as d3Select } from "d3-selection";

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
    private container: d3.Selection<HTMLDivElement, any, any, any>;
    private collapsedState: { [key: string]: boolean } = {};

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.container = d3Select(this.target)
            .append("div")
            .classed("financial-matrix-container", true);
    }

    public update(options: VisualUpdateOptions) {
        this.container.selectAll("*").remove(); // Clean slate

        const dataView = options.dataViews[0];
        if (!dataView || !dataView.categorical || !dataView.categorical.categories) {
            this.container.append("div")
                .classed("no-data-msg", true)
                .text("Select a hierarchy category and numeric measures (Actual & Budget) to load the financial statements.");
            return;
        }

        const categories = dataView.categorical.categories[0].values;
        const actuals = dataView.categorical.values[0] ? dataView.categorical.values[0].values : [];
        const budgets = dataView.categorical.values[1] ? dataView.categorical.values[1].values : [];

        // Parse rows representing financial hierarchy
        const parsedRows: FinancialRow[] = [];
        let previousParentIdByLevel: string[] = [];

        categories.forEach((catValue, idx) => {
            const rawCat = String(catValue);
            // Calculate indentation level by checking leading spaces
            const leadingSpaces = rawCat.match(/^\\s*/);
            const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
            const cleanName = rawCat.trim();
            const id = cleanName.toLowerCase().replace(/\\s+/g, "-");

            const actual = Number(actuals[idx] || 0);
            const budget = Number(budgets[idx] || 0);

            // Classify subtotals based on name or level rules
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

            // Build parent-child mapping based on level heuristics
            previousParentIdByLevel[level] = id;
            const parentId = level > 0 ? previousParentIdByLevel[level - 1] : null;

            // Retain collapse states across updates
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

        // Determine real-time visibility based on parent collapsed states
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

        // Construct HTML Table
        const table = this.container.append("table").classed("pbi-matrix-table", true);

        // Header
        const thead = table.append("thead");
        const headerRow = thead.append("tr");
        headerRow.append("th").text("Accounts (Hierarchy)");
        headerRow.append("th").classed("num-cell", true).text("Actual");
        headerRow.append("th").classed("num-cell", true).text("Budget");
        headerRow.append("th").classed("num-cell", true).text("Variance ($)");
        headerRow.append("th").classed("num-cell", true).text("Variance (%)");

        // Body
        const tbody = table.append("tbody");
        parsedRows.forEach((row) => {
            if (!row.visible) return;

            const tr = tbody.append("tr")
                .classed("matrix-row", true)
                .classed("row-level-" + row.level, true)
                .classed("subtotal-row", row.isSubtotal)
                .classed("grandtotal-row", row.isGrandTotal);

            // Accounts cell with expand/collapse plus-minus
            const accountsCell = tr.append("td")
                .style("padding-left", \`\${row.level * 16 + 12}px\`);

            // Check if this row is a parent (has children next in index)
            const hasChildrenCount = parsedRows.filter(r => r.parentId === row.id).length > 0;

            if (hasChildrenCount) {
                const btn = accountsCell.append("span")
                    .classed("expand-collapse-btn", true)
                    .html(row.collapsed ? "&#9656; " : "&#9662; ");
                
                btn.on("click", (e) => {
                    e.stopPropagation();
                    this.collapsedState[row.id] = !this.collapsedState[row.id];
                    this.update(options); // Trigger fresh rendering
                });
            } else {
                accountsCell.append("span")
                    .classed("leaf-bullet", true)
                    .html("&bull; ");
            }

            accountsCell.append("span")
                .classed("account-name", true)
                .text(row.cleanName);

            // Computed variance values
            const varianceVal = row.actual - row.budget;
            const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;

            // Formatter helpers
            const formatNum = (v: number) => {
                if (v < 0) return \`(\${Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 })})\`;
                return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
            };

            const formatPct = (v: number) => {
                const sign = v > 0 ? "+" : "";
                return \`\${sign}\${v.toFixed(1)}%\`;
            };

            // Write values
            tr.append("td").classed("num-cell", true).text(formatNum(row.actual));
            tr.append("td").classed("num-cell", true).text(formatNum(row.budget));

            // Variance Dollar Indicator styling
            const moneyVarCell = tr.append("td").classed("num-cell", true).text(formatNum(varianceVal));
            if (varianceVal > 0) {
                moneyVarCell.classed("text-favorable", true);
            } else if (varianceVal < 0) {
                moneyVarCell.classed("text-unfavorable", true);
            }

            // Variance Percentage Bar styling
            const pctVarCell = tr.append("td").classed("num-cell", true);
            pctVarCell.append("span")
                .classed("badge-variance", true)
                .classed("badge-fav", variancePct >= 0)
                .classed("badge-unfav", variancePct < 0)
                .text(formatPct(variancePct));
        });
    }

    public destroy(): void {
        this.container.selectAll("*").remove();
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
    "d3-selection": "^3.0.0"
  },
  "devDependencies": {
    "powerbi-visuals-api": "^5.3.0"
  }
}`,
      "tsconfig.json": `{
  "compilerOptions": {
    "target": "es2015",
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
