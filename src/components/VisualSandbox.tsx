import React, { useRef, useState, useEffect } from "react";
import { PowerBIDataConfig, PowerBIVisualSettings, VisualProjectFiles, VisualTemplateType } from "../types";
import { motion } from "motion/react";
import { ShieldCheck, Play, RefreshCw, Layers, Sliders, CheckCircle2, AlertTriangle, Sparkles, Download, FileSpreadsheet, Maximize2, Minimize2, X, ChevronsUpDown, ChevronsDownUp, Hash, Coins, Banknote, Save, MessageSquarePlus, MessageSquare, Check, Pencil, Filter, ChevronRight, ChevronDown } from "lucide-react";

interface SandboxProps {
  files: VisualProjectFiles;
  templateId: VisualTemplateType;
  dataConfig: PowerBIDataConfig;
  settings: PowerBIVisualSettings;
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
  const [numberFormatStyle, setNumberFormatStyle] = useState<"whole" | "thousand" | "million">("whole");
  const [showLogs, setShowLogs] = useState(false);

  // User-facing presentation config states
  const [userFontType, setUserFontType] = useState<"sans" | "display" | "mono" | "serif">("sans");
  const [userFontSize, setUserFontSize] = useState<number>(settings.fontSize || 11);
  const [userRowPadding, setUserRowPadding] = useState<"compact" | "cozy" | "spacious">("cozy");

  useEffect(() => {
    if (settings.fontSize) {
      setUserFontSize(settings.fontSize);
    }
  }, [settings.fontSize]);

  const getFontFamilyClass = () => {
    switch (userFontType) {
      case "display":
        return "font-display";
      case "mono":
        return "font-mono";
      case "serif":
        return "font-serif";
      default:
        return "font-sans";
    }
  };

  const getNameCellPaddingClass = () => {
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
    setEditingCommentRowId(null);
    setEditingCommentValue("");
    setSaveSuccess(false);
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

  const hasUnsavedChanges = JSON.stringify(comments) !== JSON.stringify(draftComments);

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
      `update(options) called. dataView parsed successfully. Bindings: { Category: "${dataConfig.categoryRole}", Value: "${dataConfig.measureRole}" } with ${rowCount} rows.`
    );
  }, [dataConfig, templateId, settings]);

  const handleExportToExcel = () => {
    const parsedRows: Array<{
      cleanName: string;
      level: number;
      actual: number;
      budget: number;
      isSubtotal: boolean;
      isGrandTotal: boolean;
      id: string;
      visible: boolean;
      parentId: string | null;
    }> = [];

    let previousParentIdByLevel: string[] = [];

    dataConfig.rows.forEach((row) => {
      const rawCat = row.category;
      const leadingSpaces = rawCat.match(/^\s*/);
      const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
      const cleanName = rawCat.trim();
      const id = cleanName.toLowerCase().replace(/\s+/g, "-");

      const actual = row.value;
      const budget = row.secondaryValue ?? 0;

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

      parsedRows.push({
        cleanName,
        level,
        actual,
        budget,
        isSubtotal,
        isGrandTotal,
        id,
        visible: true,
        parentId
      });
    });

    // Check visibility based on parental collapsed states
    parsedRows.forEach((row) => {
      let currentParentId = row.parentId;
      while (currentParentId) {
        const parentRow = parsedRows.find(r => r.id === currentParentId);
        if (parentRow && collapsedRows[parentRow.id]) {
          row.visible = false;
          break;
        }
        currentParentId = parentRow ? parentRow.parentId : null;
      }
    });

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

    const evaluateDAX = (formula: string, actual: number, budget: number): number => {
      let cleaned = formula.toUpperCase().trim();
      
      // Fast path evaluations for common structures
      if (cleaned.startsWith("AVERAGE(") && cleaned.endsWith(")")) {
        return (actual + budget) / 2;
      }
      if (cleaned.startsWith("SUM(") && cleaned.endsWith(")")) {
        return actual + budget;
      }
      if (cleaned === "[ACTUAL] + [BUDGET]") {
        return actual + budget;
      }
      if (cleaned === "([ACTUAL] + [BUDGET]) / 2") {
        return (actual + budget) / 2;
      }

      // generalize expression replacement
      const formulaWithValues = formula
        .replace(/\[Actual\]/gi, String(actual))
        .replace(/\[Budget\]/gi, String(budget));
      
      // Strict mathematical expression whitelist sanitization
      const sanitized = formulaWithValues.replace(/[^0-9.\s+\-*/()]/g, "");

      try {
        const result = new Function(`return (${sanitized});`)();
        return typeof result === "number" && !isNaN(result) ? result : 0;
      } catch (err) {
        console.warn("DAX calculated column parsing fallback:", formula, err);
        return 0;
      }
    };

    const daxMeasures = settings.daxMeasures || [];

    const daxHeaders = daxMeasures.map((m) => {
      return `<th style="text-align: right; width: 140px; background-color: #f5f3ff; color: #4f46e5; border: 1px solid #cbd5e1;">${m.name}</th>`;
    }).join("");

    let htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Financial Matrix Report</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:OutlineSymbols/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th { 
      background-color: #0f172a; 
      color: #ffffff; 
      font-weight: bold; 
      border: 1px solid #cbd5e1; 
      padding: 10px 12px; 
      font-size: 11px; 
      text-transform: uppercase; 
      letter-spacing: 0.05em;
    }
    td { 
      border: 1px solid #e2e8f0; 
      padding: 8px 12px; 
      font-size: 11px; 
      vertical-align: middle; 
      color: #334155;
    }
    .level-0 { font-weight: bold; background-color: #fdfdfd; color: #0f172a; }
    .level-1 { background-color: #ffffff; }
    .level-2 { background-color: #ffffff; }
    .subtotal { 
      font-weight: bold !important; 
      background-color: #f8fafc !important; 
      border-top: 1px solid #94a3b8 !important; 
      border-bottom: 2px solid #94a3b8 !important; 
      color: #0f172a !important;
    }
    .grandtotal { 
      font-weight: bold !important; 
      background-color: #f1f5f9 !important; 
      border-top: 2px solid #0f172a !important; 
      border-bottom: 4px double #0f172a !important; 
      font-size: 12px !important;
      color: #0f172a !important;
    }
    .num { text-align: right; }
    .fav-val { color: #059669; font-weight: bold; text-align: right; }
    .unfav-val { color: #dc2626; font-weight: bold; text-align: right; }
    .badge-fav { 
      background-color: #ecfdf5; 
      color: #047857; 
      font-weight: bold; 
      text-align: right; 
    }
    .badge-unfav { 
      background-color: #fef2f2; 
      color: #b91c1c; 
      font-weight: bold; 
      text-align: right; 
    }
  </style>
</head>
<body>
  <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 5px;">
    ${settings.showTitle ? settings.titleText : "Profitbase Financial Matrix View"}
  </div>
  <div style="font-size: 10px; color: #64748b; margin-bottom: 15px;">
    Exported on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  </div>

  <!-- Slicer / applied filters details table (Colored dark below report title) -->
  <table style="margin-bottom: 20px; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif;">
    <tr>
      <td colspan="${6 + daxMeasures.length}" style="background-color: #1e293b; color: #ffffff; font-size: 11px; padding: 12px 16px; font-weight: bold; border: 1px solid #0f172a; letter-spacing: 0.4px;">
        Source : ${filterSource} &nbsp;,&nbsp; Year = ${filterYear} &nbsp;,&nbsp; Month : ${filterMonth} &nbsp;,&nbsp; Company : ${filterCompany}
      </td>
    </tr>
  </table>

  <table>
    <thead>
      <tr>
        <th style="text-align: left; width: 220px;">Accounts (Hierarchy)</th>
        <th style="text-align: right; width: 120px;">Actual</th>
        <th style="text-align: right; width: 120px;">Budget</th>
        ${daxHeaders}
        <th style="text-align: right; width: 120px;">Variance ($)</th>
        <th style="text-align: right; width: 120px;">Variance (%)</th>
        <th style="text-align: left; width: 220px; background-color: #eef2ff; color: #4338ca;">Row Commentary</th>
      </tr>
    </thead>
    <tbody>
`;

    parsedRows.forEach((row) => {
      // Establish outline level styling and matching collapsed visibility
      let trStyles = "";
      if (row.level > 0) {
        trStyles += `mso-outline-level:${row.level};`;
      }
      if (!row.visible) {
        trStyles += "display:none;";
      }

      const varianceVal = row.actual - row.budget;
      const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;

      let clsName = `level-${row.level}`;
      if (row.isGrandTotal) {
        clsName = "grandtotal";
      } else if (row.isSubtotal) {
        clsName = "subtotal";
      }

      let spacePrefix = "";
      for (let i = 0; i < row.level; i++) {
        // Prepend non-breaking spaces to represent the visual padding/indentation in Excel natively
        spacePrefix += "&#160;&#160;&#160;&#160;";
      }

      let varValClass = "num";
      if (varianceVal > 0) varValClass = "fav-val";
      else if (varianceVal < 0) varValClass = "unfav-val";

      const varValStr = (varianceVal > 0 ? "+" : "") + formatNum(varianceVal);

      let varPctClass = variancePct >= 0 ? "badge-fav" : "badge-unfav";
      const varPctStr = (variancePct > 0 ? "+" : "") + variancePct.toFixed(1) + "%";

      const daxCells = daxMeasures.map((m) => {
        const daxVal = evaluateDAX(m.formula, row.actual, row.budget);
        return `<td class="num" style="font-weight: bold; color: #4f46e5;">${formatNum(daxVal)}</td>`;
      }).join("");

      const rowComment = draftComments[row.id] || "";

      const trStyleAttr = trStyles ? ` style="${trStyles}"` : "";

      htmlContent += `
      <tr class="${clsName}"${trStyleAttr}>
        <td style="padding-left: ${row.level * 10 + 8}px;">
          ${spacePrefix}${row.cleanName}
        </td>
        <td class="num">${formatNum(row.actual)}</td>
        <td class="num">${formatNum(row.budget)}</td>
        ${daxCells}
        <td class="${varValClass}">${varValStr}</td>
        <td class="${varPctClass}" style="text-align: right;">${varPctStr}</td>
        <td style="font-style: italic; color: #475569;">${rowComment}</td>
      </tr>`;
    });

    htmlContent += `
    </tbody>
  </table>
</body>
</html>
`;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const titleClean = (settings.titleText || "Financial_Statement")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-0_]+/gi, "_");
    link.download = `${titleClean}_export.xls`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog(`Exported matrix to Excel successfully (${parsedRows.filter(r => r.visible).length} rows exported).`);
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
    const evaluateDAX = (formula: string, actual: number, budget: number): number => {
      let cleaned = formula.toUpperCase().trim();
      
      // Fast path evaluations for common structures
      if (cleaned.startsWith("AVERAGE(") && cleaned.endsWith(")")) {
        return (actual + budget) / 2;
      }
      if (cleaned.startsWith("SUM(") && cleaned.endsWith(")")) {
        return actual + budget;
      }
      if (cleaned === "[ACTUAL] + [BUDGET]") {
        return actual + budget;
      }
      if (cleaned === "([ACTUAL] + [BUDGET]) / 2") {
        return (actual + budget) / 2;
      }

      // generalize expression replacement
      const formulaWithValues = formula
        .replace(/\[Actual\]/gi, String(actual))
        .replace(/\[Budget\]/gi, String(budget));
      
      // Strict mathematical expression whitelist sanitization
      const sanitized = formulaWithValues.replace(/[^0-9.\s+\-*/()]/g, "");

      try {
        const result = new Function(`return (${sanitized});`)();
        return typeof result === "number" && !isNaN(result) ? result : 0;
      } catch (err) {
        console.warn("DAX calculated column parsing fallback:", formula, err);
        return 0;
      }
    };

    // Parse the dataConfig rows
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

    let previousParentIdByLevel: string[] = [];

    dataConfig.rows.forEach((row, idx) => {
      const rawCat = row.category;
      const leadingSpaces = rawCat.match(/^\s*/);
      const level = leadingSpaces ? Math.floor(leadingSpaces[0].length / 2) : 0;
      const cleanName = rawCat.trim();
      const id = cleanName.toLowerCase().replace(/\s+/g, "-");

      const actual = row.value;
      const budget = row.secondaryValue ?? 0;

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

      parsedRows.push({
        cleanName,
        level,
        actual,
        budget,
        isSubtotal,
        isGrandTotal,
        visible: true,
        collapsed: !!collapsedRows[id],
        parentId,
        id
      });
    });

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

    return (
      <div className={`w-full h-full overflow-auto p-4 bg-white select-text ${getFontFamilyClass()}`} style={{ fontSize: `${userFontSize}px` }}>
        
        {/* Power BI Styled Active Slicers Ribbon */}
        <div className="mb-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.01),0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
              <Filter size={12} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold tracking-tight font-display text-[11px] text-slate-800 block">Interactive Scope Filters</span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block leading-none">Power BI Native Slicers</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Source */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors focus-within:ring-1 focus-within:ring-slate-300">
              <span className="text-[10px] text-slate-400 font-medium font-sans">Source</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterSource}
                onChange={(e) => {
                  setFilterSource(e.target.value);
                  addLog(`Slicer: Source filter changed to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-slate-700 font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight"
                style={{ color: settings.accentColor }}
              >
                <option value="Actual">Actual</option>
                <option value="Budget">Budget</option>
                <option value="Forecast">Forecast</option>
                <option value="Plan">Plan</option>
              </select>
            </div>

            {/* Year */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors focus-within:ring-1 focus-within:ring-slate-300">
              <span className="text-[10px] text-slate-400 font-medium font-sans">Year</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  addLog(`Slicer: Year filter changed to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-slate-700 font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight"
                style={{ color: settings.accentColor }}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            {/* Month */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors focus-within:ring-1 focus-within:ring-slate-300">
              <span className="text-[10px] text-slate-400 font-medium font-sans">Month</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterMonth}
                onChange={(e) => {
                  setFilterMonth(e.target.value);
                  addLog(`Slicer: Month filter changed to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-slate-700 font-bold text-[11px] cursor-pointer outline-none py-0.5 focus:ring-0 leading-tight"
                style={{ color: settings.accentColor }}
              >
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors focus-within:ring-1 focus-within:ring-slate-300">
              <span className="text-[10px] text-slate-400 font-medium font-sans">Company</span>
              <div className="w-1 h-3 rounded-full" style={{ backgroundColor: settings.accentColor }} />
              <select
                value={filterCompany}
                onChange={(e) => {
                  setFilterCompany(e.target.value);
                  addLog(`Slicer: Company filter changed to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-slate-700 font-bold text-[11px] cursor-pointer outline-none py-0.5"
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

        {/* Presentation Customization Sizers Bar on Top */}
        <div className="mb-4 bg-white border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Sliders size={12} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-[11px] text-slate-800 block">Report Theme & Grid Configurator</span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block leading-none">End User Styling Controls</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Font Type Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50/70 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-305 transition-all focus-within:bg-white">
              <span className="text-[10px] text-slate-400 font-medium">Font Type</span>
              <select
                value={userFontType}
                onChange={(e) => {
                  setUserFontType(e.target.value as any);
                  addLog(`Design: Changed visual font style to ${e.target.value}`);
                }}
                className="bg-transparent border-none text-slate-705 text-slate-700 font-bold text-[10.5px] cursor-pointer outline-none py-0.5 leading-tight pr-1"
              >
                <option value="sans">Inter (Sans)</option>
                <option value="display">Jakarta (Display)</option>
                <option value="mono">JetBrains (Mono)</option>
                <option value="serif">Georgia (Serif)</option>
              </select>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50/70 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-305 transition-all focus-within:bg-white">
              <span className="text-[10px] text-slate-400 font-medium">Font Size</span>
              <select
                value={userFontSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value, 10);
                  setUserFontSize(size);
                  addLog(`Design: Adjusted grid core font size to ${size}px`);
                }}
                className="bg-transparent border-none text-slate-705 text-slate-700 font-bold text-[10.5px] cursor-pointer outline-none py-0.5 leading-tight pr-1"
              >
                <option value="10">10px (Compact)</option>
                <option value="11">11px (Lean)</option>
                <option value="12">12px (Regular)</option>
                <option value="13">13px (Cozy)</option>
                <option value="14">14px (Spacious)</option>
                <option value="15">15px (Readability)</option>
                <option value="16">16px (Enlarged)</option>
              </select>
            </div>

            {/* Row Padding Pill Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50/70 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-medium">Padding</span>
              <div className="flex items-center bg-white rounded-md p-0.5 border border-slate-200 shadow-3xs">
                {(["compact", "cozy", "spacious"] as const).map((pad) => (
                  <button
                    key={pad}
                    type="button"
                    onClick={() => {
                      setUserRowPadding(pad);
                      addLog(`Design: Switched grid row spacing density to ${pad}`);
                    }}
                    className={`px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider transition-all cursor-pointer leading-tight ${
                      userRowPadding === pad
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {pad === "compact" ? "Dense" : pad === "cozy" ? "Cozy" : "Luxe"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-200 bg-white text-left text-xs shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-lg overflow-hidden">
          <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
            <tr>
              <th className={`font-bold text-slate-500 uppercase tracking-widest text-[9.5px] w-[26%] select-none ${getNameCellPaddingClass()}`}>Accounts (Hierarchy)</th>
              <th className={`font-semibold text-slate-500 uppercase tracking-wider text-[9px] text-right font-mono border-l border-slate-100 bg-[#f8fafc]/50 ${getValueCellPaddingClass()}`}>Actual</th>
              <th className={`font-semibold text-slate-500 uppercase tracking-wider text-[9px] text-right font-mono border-l border-slate-100 bg-[#f8fafc]/50 ${getValueCellPaddingClass()}`}>Budget</th>
              {/* Dynamic Simulated DAX Columns */}
              {(settings.daxMeasures || []).map((m) => (
                <th key={m.id} className={`font-bold text-indigo-700 uppercase tracking-wider text-[9px] text-right bg-indigo-50/40 border-l border-indigo-100/60 ${getValueCellPaddingClass()}`} title={m.formula}>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px]">🧮</span>
                    <span>{m.name}</span>
                  </div>
                </th>
              ))}
              <th className={`font-bold text-slate-700 uppercase tracking-wider text-[9.5px] text-right border-l border-slate-200 bg-slate-50 ${getValueCellPaddingClass()}`}>Variance ($)</th>
              <th className={`font-bold text-slate-700 uppercase tracking-wider text-[9.5px] text-right border-l border-slate-100 bg-slate-50 ${getValueCellPaddingClass()}`}>Variance (%)</th>
              {/* Custom row commentary column header */}
              <th className={`font-semibold text-indigo-600 uppercase tracking-widest text-[9.5px] text-left border-l border-slate-200 bg-slate-50/50 w-1/5 min-w-[170px] ${getNameCellPaddingClass()}`}>Row Commentary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 divide-slate-100">
            {parsedRows.map((row, idx) => {
              if (!row.visible) return null;

              const varianceVal = row.actual - row.budget;
              const variancePct = row.budget !== 0 ? (varianceVal / row.budget) * 100 : 0;

              // Check if row has children (is parent)
              const hasChildren = parsedRows.some(r => r.parentId === row.id);
              const isExpandedParent = hasChildren && !row.collapsed;
              const isChildRow = row.level > 0 && !row.isGrandTotal && !row.isSubtotal;

              // Subtotal/Grandtotal styling
              let rowClass = "hover:bg-slate-50/40 transition-colors group";
              let rowStyles: React.CSSProperties = {};

              // Visual Left Accent Ribbon for core structural segments (level 0 root lines)
              if (isExpandedParent) {
                rowStyles.borderLeft = `3px solid #f97316`; // Vibrant orange left border
              } else if (row.level === 0 && !row.isGrandTotal) {
                rowStyles.borderLeft = `3px solid ${settings.accentColor}`;
              } else if (isChildRow) {
                rowStyles.borderLeft = `3px solid #eab308`; // Rich gold left border
              } else {
                rowStyles.borderLeft = `3px solid transparent`;
              }

              if (row.isGrandTotal) {
                rowClass = "bg-slate-100/90 font-extrabold border-t-[3px] border-slate-800 border-b-[4px] border-double border-b-slate-800 text-slate-900";
              } else if (row.isSubtotal) {
                rowClass = "bg-[#f8fafc] font-bold border-t border-slate-200 border-b-[2px] border-slate-200 text-slate-800";
              } else if (isExpandedParent) {
                rowClass = "bg-orange-500 text-slate-950 font-bold transition-colors group shadow-xs";
              } else if (isChildRow) {
                rowClass = "bg-yellow-50/80 hover:bg-yellow-100/70 transition-colors group text-slate-800";
              } else if (row.level === 0) {
                rowClass = "bg-slate-50/30 font-semibold text-slate-800";
              }

              // Pretty presentation for variances (GAAP accounting style represents negative numbers with parenthesis)
              const formatVarianceVal = (val: number) => {
                if (val < 0) {
                  return `(${formatNum(Math.abs(val))})`;
                }
                return val > 0 ? `+${formatNum(val)}` : formatNum(val);
              };

              return (
                <tr key={idx} className={rowClass} style={rowStyles}>
                  {/* Account Name Cell (With Indented Interactive Hierarchy Controls) */}
                  <td className={`flex items-center gap-2 min-w-0 ${getNameCellPaddingClass()}`} style={{ paddingLeft: `${row.level * 16 + 12}px` }}>
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
                    <span className={`truncate leading-tight ${
                      isExpandedParent
                        ? "text-slate-950 font-bold text-xs"
                        : row.isGrandTotal 
                        ? "text-slate-900 font-bold text-xs" 
                        : row.isSubtotal 
                        ? "text-slate-900 font-bold" 
                        : isChildRow 
                        ? "text-slate-800 font-medium text-[11px]" 
                        : "text-slate-750 font-semibold"
                    }`}>
                      {row.cleanName}
                    </span>
                  </td>

                  {/* Standard columns cells */}
                  <td className={`text-right font-semibold font-mono text-[11px] border-l border-slate-100/40 ${isExpandedParent ? "text-slate-950 font-bold" : "text-slate-800"} ${getValueCellPaddingClass()}`}>{formatNum(row.actual)}</td>
                  <td className={`text-right font-medium font-mono text-[11px] border-l border-slate-100/40 ${isExpandedParent ? "text-slate-950/80 font-bold" : "text-slate-400"} ${getValueCellPaddingClass()}`}>{formatNum(row.budget)}</td>
                  
                  {/* Dynamic Simulated DAX Values */}
                  {(settings.daxMeasures || []).map((m) => {
                    const daxVal = evaluateDAX(m.formula, row.actual, row.budget);
                    return (
                      <td key={m.id} className={`text-right font-mono text-[11px] border-l border-indigo-100/40 ${
                        isExpandedParent ? "text-slate-950 font-bold bg-orange-600/10" : "font-bold text-indigo-700 bg-indigo-50/15"
                      } ${getValueCellPaddingClass()}`} title={`${m.name}: ${m.formula}`}>
                        {formatNum(daxVal)}
                      </td>
                    );
                  })}

                  {/* Variance ($) Column in GAAP Accounting style */}
                  <td className={`text-right font-bold font-mono text-[11px] border-l border-slate-200/50 ${
                    isExpandedParent
                      ? "text-slate-950 bg-orange-600/10"
                      : varianceVal > 0 
                      ? "text-emerald-700 bg-slate-50/10" 
                      : varianceVal < 0 
                      ? "text-rose-700 bg-slate-50/10" 
                      : "text-slate-500 bg-slate-50/10"
                  } ${getValueCellPaddingClass()}`}>
                    {formatVarianceVal(varianceVal)}
                  </td>

                  {/* Variance (%) Column as rounded Pill badge */}
                  <td className={`text-right border-l border-slate-100/40 select-none ${
                    isExpandedParent ? "bg-orange-600/10 text-slate-950" : "bg-slate-50/10"
                  } ${getValueCellPaddingClass()}`}>
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
                  </td>

                  {/* Row Commentary cell */}
                  <td className={`border-l border-slate-200 align-middle text-left font-sans text-[11px] min-w-[170px] relative ${
                    isExpandedParent ? "text-slate-950 bg-orange-600/10" : ""
                  } ${getNameCellPaddingClass()}`}>
                    {editingCommentRowId === row.id ? (
                      <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
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
                              setEditingCommentRowId(null);
                            } else if (e.key === "Escape") {
                              setEditingCommentRowId(null);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const updated = { ...draftComments, [row.id]: editingCommentValue.trim() };
                            if (!editingCommentValue.trim()) {
                              delete updated[row.id];
                            }
                            setDraftComments(updated);
                            setEditingCommentRowId(null);
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors shrink-0 cursor-pointer"
                          title="Apply comment raw draft"
                        >
                          <Check size={12} className="stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingCommentRowId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors shrink-0 cursor-pointer"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group min-h-[22px]">
                        {draftComments[row.id] ? (
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <MessageSquare size={11} className={isExpandedParent ? "text-slate-950 shrink-0" : "text-indigo-500 shrink-0"} />
                            <span className={`italic truncate max-w-[190px] leading-tight ${isExpandedParent ? "text-slate-950 font-semibold" : "text-slate-750 font-medium"}`} title={draftComments[row.id]}>
                              {draftComments[row.id]}
                            </span>
                          </div>
                        ) : (
                          <span className={`italic select-none text-[10px] ${isExpandedParent ? "text-slate-800" : "text-slate-300"}`}>No commentary</span>
                        )}
                        <div className="flex items-center gap-1 ml-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCommentRowId(row.id);
                              setEditingCommentValue(draftComments[row.id] || "");
                            }}
                            className={`p-1 rounded transition-all cursor-pointer opacity-85 group-hover:opacity-100 ${
                              isExpandedParent 
                                ? "text-slate-950 hover:bg-orange-600/30" 
                                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title={draftComments[row.id] ? "Edit commentary" : "Add custom row commentary"}
                          >
                            {draftComments[row.id] ? (
                              <Pencil size={11} />
                            ) : (
                              <MessageSquarePlus size={12} className={isExpandedParent ? "text-slate-900" : "text-indigo-400 hover:text-indigo-650 hover:scale-110 transition-transform"} />
                            )}
                          </button>
                          {draftComments[row.id] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = { ...draftComments };
                                delete updated[row.id];
                                setDraftComments(updated);
                              }}
                              className={`p-1 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100 font-bold ${
                                isExpandedParent 
                                  ? "text-slate-950 hover:bg-orange-600/30" 
                                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title="Delete commentary footnote"
                            >
                              <X size={11} />
                            </button>
                          )}
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:shadow-xs active:scale-98 cursor-pointer shadow-2xs select-none"
            title="Download formatted spreadsheet directly to Excel"
          >
            <FileSpreadsheet size={13} className="shrink-0" />
            <span>Export to Excel</span>
          </button>
          <span className="text-[9px] text-slate-400 font-mono bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200">
            API v5.3.0
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-205 border-slate-200">
            <ShieldCheck size={12} className="text-emerald-500 stroke-[2.5]" />
            <span className="font-medium font-sans">Strict Sandbox Protected</span>
          </div>
        </div>
      </div>

      {/* Main Sandbox Canvas Splitter */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#f9fafb]">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">
          <div
            ref={containerRef}
            style={{ width: viewport.width, height: viewport.height }}
            className="bg-white border border-gray-150 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative flex flex-col overflow-hidden max-w-full max-h-full"
          >
            {/* Visual Frame Title Bar (Power BI Spec) */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/20 select-none">
              <span className="text-[11px] font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.accentColor }} />
                <span>{settings.showTitle ? settings.titleText : "Custom Visual Report Canvas"}</span>
              </span>
              <div className="flex items-center gap-3">
                {/* Expand / Collapse All Actions */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={expandAllRows}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title="Expand All Levels"
                  >
                    <ChevronsUpDown size={12} className="stroke-[2.5]" />
                  </button>
                  <button
                    onClick={collapseAllRows}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    title="Collapse All Levels"
                  >
                    <ChevronsDownUp size={12} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Number Format Scale Segment Selector */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-250 border-slate-200 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("whole"); addLog("Scale changed to whole numbers."); }}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 leading-none ${numberFormatStyle === "whole" ? "bg-white text-slate-800 font-bold shadow-2xs border border-slate-200/50" : "text-slate-400 hover:text-slate-600 font-medium"}`}
                    title="Whole Numbers"
                  >
                    <Hash size={11} className="stroke-[2]" />
                    <span className="hidden xs:inline font-mono text-[9px]">1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("thousand"); addLog("Scale changed to thousands ($K)."); }}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 leading-none ${numberFormatStyle === "thousand" ? "bg-white text-slate-800 font-bold shadow-2xs border border-slate-200/50" : "text-slate-400 hover:text-slate-600 font-medium"}`}
                    title="Thousands"
                  >
                    <Coins size={11} className="stroke-[2]" />
                    <span className="hidden xs:inline font-mono text-[9px]">K</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("million"); addLog("Scale changed to millions ($M)."); }}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 leading-none ${numberFormatStyle === "million" ? "bg-white text-slate-800 font-bold shadow-2xs border border-slate-200/50" : "text-slate-400 hover:text-slate-600 font-medium"}`}
                    title="Millions"
                  >
                    <Banknote size={11} className="stroke-[2]" />
                    <span className="hidden xs:inline font-mono text-[9px]">M</span>
                  </button>
                </div>

                {/* Save Commentary changes */}
                <div className="flex items-center border-l border-slate-200 pl-2.5">
                  <button
                    onClick={handleSaveAllComments}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 cursor-pointer ${
                      saveSuccess
                        ? "bg-emerald-500 text-white shadow-2xs"
                        : hasUnsavedChanges
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs ring-2 ring-indigo-500/20"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                    }`}
                    title={hasUnsavedChanges ? "You have unsaved annotations. Click to Save." : "Save commentary / annotations changes"}
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={11} className="stroke-[3]" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save size={11} />
                        <span>Save Comments</span>
                      </>
                    )}
                    {hasUnsavedChanges && !saveSuccess && (
                      <span className="flex h-2 w-2 relative ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Action icons */}
                <div className="flex items-center gap-1 border-l border-gray-150 pl-1.5 ms-1.5">
                  <button
                    onClick={handleExportToExcel}
                    className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition-all cursor-pointer"
                    title="Export formatted Matrix to Excel"
                  >
                    <FileSpreadsheet size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsExpanded(true);
                      addLog("Opened matrix in maximized popup mode.");
                    }}
                    className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Open Matrix in a bigger window"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>

                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-100" />
                </div>
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-xs tracking-wider font-mono text-gray-300 uppercase">
                  Matrix Advanced Viewer Mode
                </span>
                <span className="text-gray-500 px-2">|</span>
                <span className="text-xs text-white opacity-90 font-medium">
                  {settings.showTitle ? settings.titleText : "Interactive Financial Matrix Report"}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Expand / Collapse All Actions */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                  <button
                    onClick={expandAllRows}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
                    title="Expand All Levels"
                  >
                    <ChevronsUpDown size={14} />
                  </button>
                  <button
                    onClick={collapseAllRows}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
                    title="Collapse All Levels"
                  >
                    <ChevronsDownUp size={14} />
                  </button>
                </div>

                {/* Number Format Scale Segment Selector */}
                <div className="flex items-center bg-slate-850 bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("whole"); addLog("Scale changed to whole numbers."); }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${numberFormatStyle === "whole" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-450 text-slate-400 hover:text-slate-200"}`}
                    title="Whole Numbers"
                  >
                    <Hash size={12} />
                    <span className="font-mono text-[9px] font-bold">WHOLE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("thousand"); addLog("Scale changed to thousands ($K)."); }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${numberFormatStyle === "thousand" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-450 text-slate-400 hover:text-slate-200"}`}
                    title="Thousands"
                  >
                    <Coins size={12} />
                    <span className="font-mono text-[9px] font-bold">THOUSANDS ($K)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNumberFormatStyle("million"); addLog("Scale changed to millions ($M)."); }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${numberFormatStyle === "million" ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-450 text-slate-400 hover:text-slate-200"}`}
                    title="Millions"
                  >
                    <Banknote size={12} />
                    <span className="font-mono text-[9px] font-bold">MILLIONS ($M)</span>
                  </button>
                </div>

                {/* Modal Save Comments Button */}
                <button
                  onClick={handleSaveAllComments}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm select-none ${
                    saveSuccess
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : hasUnsavedChanges
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 animate-pulse"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:bg-slate-750 border border-slate-700"
                  }`}
                  title={hasUnsavedChanges ? "You have unsaved changes. Click to Save." : "Save commentary changes"}
                >
                  {saveSuccess ? <Check size={13} className="stroke-[3]" /> : <Save size={13} />}
                  <span>{saveSuccess ? "Saved!" : "Save Comments"}</span>
                  {hasUnsavedChanges && !saveSuccess && (
                    <span className="flex h-1.5 w-1.5 relative ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                  )}
                </button>

                <button
                  onClick={handleExportToExcel}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm select-none"
                  title="Export to formatted Excel spreadsheet"
                >
                  <FileSpreadsheet size={13} />
                  <span>Download Excel</span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer ml-1"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

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
    </div>
  );
};
