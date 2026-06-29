/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { templates } from "./data/templates";
import { VisualSandbox } from "./components/VisualSandbox";
import { PowerBIDataPanel } from "./components/PowerBIDataPanel";
import { PowerBIFormatPane } from "./components/PowerBIFormatPane";
import { CodeWorkspace } from "./components/CodeWorkspace";
import { CopilotPanel } from "./components/CopilotPanel";
import { DAXMeasuresPanel } from "./components/DAXMeasuresPanel";
import { VisualTemplateType, VisualProjectFiles, PowerBIDataConfig, PowerBIVisualSettings, DAXMeasure, ConditionalFormattingRule, FxConfig } from "./types";
import { motion } from "motion/react";
import JSZip from "jszip";
import { 
  BarChart3, 
  CircleDot, 
  Gauge, 
  Compass, 
  Activity, 
  Download, 
  BookOpen, 
  Sliders, 
  Info, 
  Laptop, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  Table,
  Plus,
  Trash2,
  Calculator
} from "lucide-react";

// Initial datasets representing the default values for each report template type
const initialDatasets: Record<VisualTemplateType, PowerBIDataConfig> = {
  matrix: {
    rowsRole: "Financial Statement Row",
    columnsRole: "Comparison Scenario (Actual vs Budget)",
    valuesRole: "Numeric Amount Measure",
    rows: [
      { category: "Revenue", value: 1250000, secondaryValue: 1200000 },
      { category: "  Product Sales", value: 850000, secondaryValue: 800000 },
      { category: "  Service Contracts", value: 400000, secondaryValue: 400000 },
      { category: "Cost of Goods Sold", value: 450000, secondaryValue: 430000 },
      { category: "  Material Expenses", value: 300000, secondaryValue: 280000 },
      { category: "  Direct Labor Costs", value: 150000, secondaryValue: 150000 },
      { category: "Gross Profit", value: 800000, secondaryValue: 770000 },
      { category: "Operating Expenses", value: 350000, secondaryValue: 360000 },
      { category: "  Salaries & Wages", value: 200000, secondaryValue: 195000 },
      { category: "  Rent & Facilities", value: 45000, secondaryValue: 45000 },
      { category: "  Marketing Campaigns", value: 105000, secondaryValue: 120000 },
      { category: "EBITDA", value: 450000, secondaryValue: 410000 },
      { category: "Depreciation & Amortization", value: 50000, secondaryValue: 50000 },
      { category: "Net Income", value: 400000, secondaryValue: 360000 }
    ]
  }
};

const initialSettingsMap: Record<VisualTemplateType, PowerBIVisualSettings> = {
  matrix: {
    showTitle: true,
    titleText: "Profitbase Financial Matrix View",
    titleBgColor: "#f1f5f9",
    titleTextColor: "#1e293b",
    accentColor: "#0f172a",
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    fontSize: 11,
    showTooltip: true,
    enableAnimation: true,
    hideEmptyExpand: false,
    enableDownloadAsExcel: true,
    enableSorting: false,
    enableVisualSearch: false,
    showGroupExpand: true,
    enableColumnExpansion: true,
    daxMeasures: [
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
    ],
    enableRowVarianceFormatting: false,
    enableRowHeatmap: false,
    columnFormattingTarget: "none",
    columnFormattingType: "none",
    positiveColor: "#10b981",
    negativeColor: "#ef4444",
    selectedTheme: "light",
    fontFamily: "sans",
    rowPadding: "cozy",
    showGridLines: true,
    highlightSubtotals: true,
    showAccentBorders: true,
    columnWidthMode: "auto",
    columnWidthValue: 120,
    rowHeightMode: "auto",
    rowHeightValue: 32,
    formatStyle: "whole",
    showCommentary: true,
    enableExpandedHighlight: false,
    expandedParentBgColor: "#f8fafc",
    expandedParentTextColor: "#0f172a",
    expandedChildBgColor: "#ffffff",
    expandedChildTextColor: "#334155",
    enableDaxCondFormatting: false,
    daxCondFormatMode: "rules",
    daxCondFieldValueTarget: "background",
    daxCondMeasureId: "dax-sum",
    daxCondTarget: "all",
    daxCondCondition: "greater",
    daxCondValue1: 1000000,
    daxCondValue2: 2000000,
    daxCondBgColor: "#f0fdf4",
    daxCondTextColor: "#15803d",
    customRules: [
      {
        id: "rule-1",
        target: "row-header",
        operator: "contains",
        value: "Revenue",
        bgColor: "#e6fffa",
        textColor: "#007d67",
        isBold: true
      },
      {
        id: "rule-2",
        target: "variancePct",
        operator: "less",
        value: "0",
        bgColor: "#fff5f5",
        textColor: "#e53e3e",
        isBold: true
      }
    ],
    cfRules: [
      {
        id: "cf-rule-1",
        name: "High Performance Sales (Rule Engine)",
        isEnabled: true,
        engine: "rule",
        priority: 3,
        targetType: "cell",
        targetColumn: "actual",
        ruleField: "actual",
        ruleOperator: "greater",
        ruleValue1: "1500000",
        style: {
          background: "#ecfdf5",
          foreground: "#047857",
          fontWeight: "bold",
          borderColor: "#10b981",
          icon: "check",
          tooltip: "High Sales Volume: Exceeds 1.5M threshold"
        }
      },
      {
        id: "cf-rule-2",
        name: "Expense Accounts Flag (Text Engine)",
        isEnabled: true,
        engine: "text",
        priority: 2,
        targetType: "row",
        textField: "name",
        textOperator: "startsWith",
        textValue: "9",
        style: {
          background: "#fff5f5",
          foreground: "#b91c1c",
          fontWeight: "bold",
          fontStyle: "italic",
          icon: "flag",
          tooltip: "Cost Center: Row matches expense accounts code starting with 9"
        }
      },
      {
        id: "cf-rule-3",
        name: "Profit Warning Indicator (Expression Engine)",
        isEnabled: true,
        engine: "expression",
        priority: 1,
        targetType: "row",
        expressionString: "Profit < 0 AND Sales > 500000",
        style: {
          background: "#fffbeb",
          foreground: "#b45309",
          fontWeight: "bold",
          icon: "warning",
          borderColor: "#f59e0b",
          tooltip: "Underperforming warning: negative profit with high sales volume"
        }
      }
    ]
  }
};


export default function App() {
  const [activeTemplate, setActiveTemplate] = useState<VisualTemplateType>("matrix");
  
  // Track visual files state independently per template, so switching retains customizations!
  const [projectFilesMap, setProjectFilesMap] = useState<Record<VisualTemplateType, VisualProjectFiles>>(() => {
    const filesRecord = {} as Record<VisualTemplateType, VisualProjectFiles>;
    templates.forEach(t => {
      filesRecord[t.id] = { ...t.files };
    });
    return filesRecord;
  });

  const [datasetMap, setDatasetMap] = useState<Record<VisualTemplateType, PowerBIDataConfig>>(initialDatasets);
  const [settingsMap, setSettingsMap] = useState<Record<VisualTemplateType, PowerBIVisualSettings>>(initialSettingsMap);

  const handleAddRule = () => {
    const newRule: ConditionalFormattingRule = {
      id: "rule-" + Date.now(),
      target: "row-header",
      operator: "contains",
      value: "",
      bgColor: "#fef3c7",
      textColor: "#92400e",
      isBold: true
    };
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.customRules || [];
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          customRules: [...activeRules, newRule]
        }
      };
    });
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<ConditionalFormattingRule>) => {
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.customRules || [];
      const updatedRules = activeRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          customRules: updatedRules
        }
      };
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.customRules || [];
      const updatedRules = activeRules.filter(rule => rule.id !== ruleId);
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          customRules: updatedRules
        }
      };
    });
  };

  const handleAddCFRule = () => {
    const newRule = {
      id: "cf-" + Date.now(),
      name: "New Advanced Rule",
      isEnabled: true,
      engine: "rule" as const,
      priority: 5,
      targetType: "cell" as const,
      targetColumn: "actual",
      ruleField: "actual",
      ruleOperator: "greater" as const,
      ruleValue1: "100000",
      ruleValue2: "",
      textField: "name",
      textOperator: "startsWith" as const,
      textValue: "",
      expressionString: "Actual > 100000",
      measureId: currentSettings.daxMeasures && currentSettings.daxMeasures.length > 0 ? currentSettings.daxMeasures[0].id : "",
      measureTargetProperty: "background" as const,
      style: {
        background: "#f3f4f6",
        foreground: "#111827",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        borderColor: "",
        borderThickness: "",
        borderRadius: "",
        icon: "",
        opacity: 1,
        tooltip: "",
        animation: ""
      }
    };
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.cfRules || [];
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          cfRules: [...activeRules, newRule]
        }
      };
    });
  };

  const handleUpdateCFRule = (ruleId: string, updates: any) => {
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.cfRules || [];
      const updatedRules = activeRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          cfRules: updatedRules
        }
      };
    });
  };

  const handleDeleteCFRule = (ruleId: string) => {
    setSettingsMap(prev => {
      const activeRules = prev[activeTemplate]?.cfRules || [];
      const updatedRules = activeRules.filter(rule => rule.id !== ruleId);
      return {
        ...prev,
        [activeTemplate]: {
          ...prev[activeTemplate],
          cfRules: updatedRules
        }
      };
    });
  };

  const [activeTab, setActiveTab] = useState<"fields" | "format" | "rules" | "dax" | "copilot">("fields");
  const [formatSubTab, setFormatSubTab] = useState<"visual" | "general">("visual");
  const [formatSearchQuery, setFormatSearchQuery] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    license: true,
    download: false,
    commenting: false,
    sort: false,
    search: false,
    group: false,
    grid: false,
    columnHeaders: false,
    columnExpansion: false,
    columnStyles: false,
    title: false,
    canvas: false,
    scaleUnits: false,
    headerIcons: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // States for handling visual-settings "fx" formatting configuration
  const [activeFxProperty, setActiveFxProperty] = useState<string | null>(null);
  const [activeFxLabel, setActiveFxLabel] = useState<string>("");
  const [fxEditState, setFxEditState] = useState<FxConfig | null>(null);

  // Quick helper to write active file mods
  const handleFileChange = (fileName: keyof VisualProjectFiles, content: string) => {
    setProjectFilesMap(prev => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [fileName]: content
      }
    }));
  };

  const handleResetTemplate = () => {
    const originalTemplate = templates.find(t => t.id === activeTemplate);
    if (originalTemplate) {
      setProjectFilesMap(prev => ({
        ...prev,
        [activeTemplate]: { ...originalTemplate.files }
      }));
      setDatasetMap(prev => ({
        ...prev,
        [activeTemplate]: { ...initialDatasets[activeTemplate] }
      }));
      setSettingsMap(prev => ({
        ...prev,
        [activeTemplate]: { ...initialSettingsMap[activeTemplate] }
      }));
      setInfoMessage(`Reset current ${originalTemplate.name} code and models back to original boilertrack defaults.`);
      setTimeout(() => setInfoMessage(null), 3500);
    }
  };

  const openFxConfig = (property: string, label: string) => {
    setActiveFxProperty(property);
    setActiveFxLabel(label);
    const existing = currentSettings.fxSettings?.[property] || {
      measureId: currentSettings.daxMeasures?.[0]?.id || "",
      mode: "rules",
      operator: "greater",
      value: 100000,
      resultValue: property.toLowerCase().includes("bg") || property === "accentColor" ? "#10b981" : "#15803d",
      fallbackValue: property.toLowerCase().includes("bg") || property === "accentColor" ? "#ef4444" : "#b91c1c"
    };
    setFxEditState(existing as any);
  };

  const saveFxConfig = () => {
    if (!activeFxProperty || !fxEditState) return;
    setSettingsMap(prev => {
      const active = prev[activeTemplate];
      const fxMap = { ...(active.fxSettings || {}) };
      fxMap[activeFxProperty] = fxEditState;
      return {
        ...prev,
        [activeTemplate]: {
          ...active,
          fxSettings: fxMap
        }
      };
    });
    setActiveFxProperty(null);
    setFxEditState(null);
    setInfoMessage(`Successfully bound the formatting of "${activeFxLabel}" to the selected measure metrics.`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const removeFxConfig = (property: string) => {
    setSettingsMap(prev => {
      const active = prev[activeTemplate];
      const fxMap = { ...(active.fxSettings || {}) };
      delete fxMap[property];
      return {
        ...prev,
        [activeTemplate]: {
          ...active,
          fxSettings: fxMap
        }
      };
    });
    setActiveFxProperty(null);
    setFxEditState(null);
    setInfoMessage(`Removed DAX measure binding for "${activeFxLabel}". Restored back to flat preset selections.`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  // Triggered by Visual Copilot after AI refactors files
  const handleCopilotApply = (explanation: string, updatedFiles: Partial<VisualProjectFiles>) => {
    setProjectFilesMap(prev => {
      const mergedFiles = { ...prev[activeTemplate] };
      (Object.keys(updatedFiles) as Array<keyof VisualProjectFiles>).forEach(k => {
        if (updatedFiles[k]) {
          mergedFiles[k] = updatedFiles[k] as string;
        }
      });
      return {
        ...prev,
        [activeTemplate]: mergedFiles
      };
    });
    
    // Auto sync visual colors settings if specified inside the result explanation
    const cleanExp = explanation.toLowerCase();
    if (cleanExp.includes("color") || cleanExp.includes("theme") || cleanExp.includes("background")) {
      const detectedColor = 
        cleanExp.includes("purple") || cleanExp.includes("violet") ? "#a855f7" :
        cleanExp.includes("cyan") || cleanExp.includes("blue") ? "#06b6d4" :
        cleanExp.includes("orange") || cleanExp.includes("amber") ? "#f97316" :
        cleanExp.includes("green") || cleanExp.includes("emerald") ? "#10b981" : null;
      if (detectedColor) {
        setSettingsMap(prev => ({
          ...prev,
          [activeTemplate]: {
            ...prev[activeTemplate],
            accentColor: detectedColor
          }
        }));
      }
    }
  };

  // ZIP workspace exporter using client-side JSZip
  const handleExportZip = async () => {
    const originalTemplate = templates.find(t => t.id === activeTemplate);
    const activeProject = projectFilesMap[activeTemplate];
    const vizName = originalTemplate ? originalTemplate.name.replace(/\s+/g, "") : "CustomPowerBI";

    try {
      const zip = new JSZip();
      
      // Load current visual templates definitions
      let exportedVisualTS = activeProject["src/visual.ts"] || (originalTemplate ? originalTemplate.files["src/visual.ts"] : "");
      let exportedCapabilitiesJSON = activeProject["capabilities.json"] || (originalTemplate ? originalTemplate.files["capabilities.json"] : "");

      // Pre-compile the custom visual config settings template values
      const exportSettings = {
        gridTheme: {
          selectedTheme: currentSettings.selectedTheme || "light",
          fontFamily: currentSettings.fontFamily || "sans",
          fontSize: currentSettings.fontSize ?? 11,
          rowPadding: currentSettings.rowPadding || "cozy",
          showGridLines: currentSettings.showGridLines ?? true,
          highlightSubtotals: currentSettings.highlightSubtotals ?? true,
          showAccentBorders: currentSettings.showAccentBorders ?? true,
          columnWidthMode: currentSettings.columnWidthMode || "auto",
          columnWidthValue: currentSettings.columnWidthValue ?? 120,
          rowHeightMode: currentSettings.rowHeightMode || "auto",
          rowHeightValue: currentSettings.rowHeightValue ?? 32,
          headerBgColor: currentSettings.headerBgColor || "",
          headerTextColor: currentSettings.headerTextColor || "",
          rowBgColor: currentSettings.rowBgColor || "",
          rowTextColor: currentSettings.rowTextColor || "",
          subtotalBgColor: currentSettings.subtotalBgColor || "",
          subtotalTextColor: currentSettings.subtotalTextColor || "",
          grandtotalBgColor: currentSettings.grandtotalBgColor || "",
          grandtotalTextColor: currentSettings.grandtotalTextColor || "",
          hoverBgColor: currentSettings.hoverBgColor || "",
          gridLineColor: currentSettings.gridLineColor || "",
          accentColor: currentSettings.accentColor || "",
          hideEmptyExpand: currentSettings.hideEmptyExpand ?? false
        },
        toolbarSettings: {
          showToolbar: true,
          showTitle: currentSettings.showTitle ?? true,
          titleText: currentSettings.titleText || "Financial Matrix",
          titleBgColor: currentSettings.titleBgColor || "",
          titleTextColor: currentSettings.titleTextColor || "",
          showExpandCollapse: true,
          showExport: true,
          showMaximize: true
        },
        numberFormatting: {
          formatStyle: currentSettings.formatStyle || "whole"
        },
        commentaryColumn: {
          showCommentary: currentSettings.showCommentary ?? true
        },
        conditionalFormatting: {
          enableRowVarianceFormatting: currentSettings.enableRowVarianceFormatting ?? false,
          enableRowHeatmap: currentSettings.enableRowHeatmap ?? false,
          columnFormattingTarget: currentSettings.columnFormattingTarget || "none",
          columnFormattingType: currentSettings.columnFormattingType || "none",
          positiveColor: currentSettings.positiveColor || "#10b981",
          negativeColor: currentSettings.negativeColor || "#ef4444",
          enableExpandedHighlight: currentSettings.enableExpandedHighlight ?? false,
          expandedParentBgColor: currentSettings.expandedParentBgColor || "#f8fafc",
          expandedParentTextColor: currentSettings.expandedParentTextColor || "#0f172a",
          expandedChildBgColor: currentSettings.expandedChildBgColor || "#ffffff",
          expandedChildTextColor: currentSettings.expandedChildTextColor || "#334155",
          enableDaxCondFormatting: currentSettings.enableDaxCondFormatting ?? false,
          daxCondFormatMode: currentSettings.daxCondFormatMode || "rules",
          daxCondFieldValueTarget: currentSettings.daxCondFieldValueTarget || "background",
          daxCondMeasureId: currentSettings.daxCondMeasureId || "",
          daxCondTarget: currentSettings.daxCondTarget || "all",
          daxCondCondition: currentSettings.daxCondCondition || "greater",
          daxCondValue1: currentSettings.daxCondValue1 ?? 100000,
          daxCondValue2: currentSettings.daxCondValue2 ?? 1000000,
          daxCondBgColor: currentSettings.daxCondBgColor || "#f0fdf4",
          daxCondTextColor: currentSettings.daxCondTextColor || "#15803d",
          daxMeasuresJson: JSON.stringify(currentSettings.daxMeasures || []),
          customRulesJson: JSON.stringify(currentSettings.customRules || [])
        }
      };

      // Substitute the currentSettings definition dynamically inside visual.ts
      const startMarker = "private currentSettings = {";
      const startIdx = exportedVisualTS.indexOf(startMarker);
      if (startIdx !== -1) {
        const endIdx = exportedVisualTS.indexOf("};", startIdx);
        if (endIdx !== -1) {
          const pre = exportedVisualTS.substring(0, startIdx);
          const post = exportedVisualTS.substring(endIdx + 2);
          const settingsValueStr = `private currentSettings = ${JSON.stringify(exportSettings, null, 12)}`;
          exportedVisualTS = pre + settingsValueStr + post;
        }
      }

      // Automatically patch any stripped backslashes in regexes in the exported visual.ts
      exportedVisualTS = exportedVisualTS
        .replace(/\/LEFTs\*\[\(\[\^\]\]\+\)\]s\*,s\*\(\[0-9\]\+\)\/gi/g, "/LEFT\\\\s*\\\\[([^\\\\]]+)\\\\]\\\\s*,\\\\s*([0-9]+)/gi")
        .replace(/\/RIGHTs\*\[\(\[\^\]\]\+\)\]s\*,s\*\(\[0-9\]\+\)\/gi/g, "/RIGHT\\\\s*\\\\[([^\\\\]]+)\\\\]\\\\s*,\\\\s*([0-9]+)/gi")
        .replace(/\/DIVIDEs\*\\\(\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/DIVIDE\\\\s*\\\\(([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/AVERAGEs\*\\\(\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/AVERAGE\\\\s*\\\\(([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/SUMs\*\\\(\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/SUM\\\\s*\\\\(([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/LEFTs\*\\\(\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/LEFT\\\\s*\\\\(([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/RIGHTs\*\\\(\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/RIGHT\\\\s*\\\\(([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/MIDs\*\\\(\(\[\^,\]\+\),\(\[\^,\]\+\),\(\[\^\)\]\+\)\\\)\/gi/g, "/MID\\\\s*\\\\(([^,]+),([^,]+),([^)]+)\\\\)/gi")
        .replace(/\/UPPERs\*\\\(\(\[\^\)\]\+\)\\\)\/gi/g, "/UPPER\\\\s*\\\\(([^)]+)\\\\)/gi")
        .replace(/\/LOWERs\*\\\(\(\[\^\)\]\+\)\\\)\/gi/g, "/LOWER\\\\s*\\\\(([^)]+)\\\\)/gi")
        .replace(/\/TRIMs\*\\\(\(\[\^\)\]\+\)\\\)\/gi/g, "/TRIM\\\\s*\\\\(([^)]+)\\\\)/gi")
        .replace(/\/LENs\*\\\(\(\[\^\)\]\+\)\\\)\/gi/g, "/LEN\\\\s*\\\\(([^)]+)\\\\)/gi")
        .replace(/\/IFs\*\\\(/gi, "/IF\\\\s*\\\\(")
        .replace(/\.match\(\/\^\\\(\[0-9\.-\/\]\+\)\\\)\/\)/g, ".match(/^([0-9\\\\.\\\\-\\\\/]+)/)");

      // root structures
      zip.file("pbiviz.json", activeProject["pbiviz.json"]);
      zip.file("capabilities.json", exportedCapabilitiesJSON);
      zip.file("package.json", activeProject["package.json"]);
      zip.file("tsconfig.json", activeProject["tsconfig.json"]);

      // child directory directories
      zip.folder("src")?.file("visual.ts", exportedVisualTS);
      zip.folder("style")?.file("visual.less", activeProject["style/visual.less"]);

      // Generate dynamic high-fidelity glowing circular network sphere image for assets/icon.png
      const generateCustomIconBase64 = (): string => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gMJDgkoB8+iWAAAAElJREFUeNrt0gENAAAAwqD3T20ON6hAYcCgQYMGDRo0aNCgQYMGDRo0aNCgQYMGDRo0aNCgQYMGDRo0aNCgQYMGDRo2aNCgQYMHG8DfAAn6p6pZfInEAAAAAElFTkSuQmCC";

        // 1. Draw rounded square background
        const rad = 28;
        ctx.beginPath();
        ctx.moveTo(rad, 0);
        ctx.lineTo(128 - rad, 0);
        ctx.quadraticCurveTo(128, 0, 128, rad);
        ctx.lineTo(128, 128 - rad);
        ctx.quadraticCurveTo(128, 128, 128 - rad, 128);
        ctx.lineTo(rad, 128);
        ctx.quadraticCurveTo(0, 128, 0, 128 - rad);
        ctx.lineTo(0, rad);
        ctx.quadraticCurveTo(0, 0, rad, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 128, 128);
        grad.addColorStop(0, "#4f14a0"); // rich royal purple
        grad.addColorStop(0.5, "#251368"); // deep indigo
        grad.addColorStop(1, "#110530"); // dark purple
        ctx.fillStyle = grad;
        ctx.fill();

        // 2. Draw glowing network sphere
        const cx = 64;
        const cy = 64;
        const r = 36;
        const numNodes = 8;
        const nodeCoords: { x: number; y: number }[] = [];

        for (let i = 0; i < numNodes; i++) {
          const angle = (i * 2 * Math.PI) / numNodes;
          nodeCoords.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
          });
        }

        // Draw interconnected curved arcs with glow shadow
        ctx.shadowColor = "#818cf8";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(167, 139, 250, 0.75)";

        nodeCoords.forEach((node, i) => {
          // Connect to next nodes with curved arcs
          for (let offset = 2; offset <= 4; offset++) {
            const targetNode = nodeCoords[(i + offset) % numNodes];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            const midX = (node.x + targetNode.x) / 2;
            const midY = (node.y + targetNode.y) / 2;
            const ctrlX = midX + (cx - midX) * 0.35;
            const ctrlY = midY + (cy - midY) * 0.35;
            ctx.quadraticCurveTo(ctrlX, ctrlY, targetNode.x, targetNode.y);
            ctx.stroke();
          }
        });

        // Draw glowing white circular nodes
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ffffff";

        nodeCoords.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        return canvas.toDataURL("image/png").split(",")[1];
      };

      const customIconBase64 = generateCustomIconBase64();
      zip.folder("assets")?.file("icon.png", customIconBase64, { base64: true });

      // generate zip blob
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${vizName.toLowerCase()}-pbiviz-project.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("ZIP packaging failed. Check active files code constraints.");
    }
  };

  const getTemplateIcon = (id: VisualTemplateType) => {
    return (
      <svg className="w-5 h-5 text-violet-400" viewBox="0 0 64 64" fill="none">
        <defs>
          <filter id="neon-glow-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.8">
          <path d="M 50 32 Q 32 32, 14 32" />
          <path d="M 32 14 Q 32 32, 32 50" />
          <path d="M 44.7 19.3 Q 32 32, 19.3 44.7" />
          <path d="M 19.3 19.3 Q 32 32, 44.7 44.7" />
        </g>
        <circle cx="50" cy="32" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="44.7" cy="44.7" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="32" cy="50" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="19.3" cy="44.7" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="14" cy="32" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="19.3" cy="19.3" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="32" cy="14" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
        <circle cx="44.7" cy="19.3" r="2" fill="#ffffff" filter="url(#neon-glow-sm)" />
      </svg>
    );
  };

  const renderFxModal = () => {
    if (!activeFxProperty || !fxEditState) return null;

    const isBg = activeFxProperty.toLowerCase().includes("bg") || activeFxProperty === "accentColor";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in [id='fx-modal-root']">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col font-sans [id='fx-modal-box']">
          
          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 text-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <div>
                <h3 className="font-bold text-[9px] uppercase tracking-wider text-slate-400 font-mono">Dynamic FX Formatting Engine</h3>
                <p className="font-bold text-xs text-slate-800">Assign DAX Rule - {activeFxLabel}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveFxProperty(null);
                setFxEditState(null);
              }}
              className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
            >
              &times;
            </button>
          </div>

          <div className="p-5 space-y-4 text-[11px] overflow-y-auto max-h-[70vh]">
            {/* 1. Measure Select */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-slate-400 uppercase font-mono block">Format based on DAX Measure / Column</label>
              <select
                value={fxEditState.measureId || ""}
                onChange={(e) => setFxEditState(prev => prev ? { ...prev, measureId: e.target.value } : null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 outline-none"
              >
                <option value="">-- Choose registered DAX measure --</option>
                {(currentSettings.daxMeasures || []).map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.formula})</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 leading-normal">
                If the custom visual contains registered Calculated Columns or virtual DAX statements, they will be computed contextually per row or header state.
              </p>
            </div>

            {/* 2. Format Mode Select */}
            <div className="space-y-1">
              <label className="text-[9.5px] font-bold text-slate-400 uppercase font-mono block">Formatting Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFxEditState(prev => prev ? { ...prev, mode: "rules" } : null)}
                  className={`py-1.5 rounded-lg border font-semibold text-[10.5px] cursor-pointer transition-all ${
                    fxEditState.mode === "rules"
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Conditional Rules
                </button>
                <button
                  type="button"
                  onClick={() => setFxEditState(prev => prev ? { ...prev, mode: "field" } : null)}
                  className={`py-1.5 rounded-lg border font-semibold text-[10.5px] cursor-pointer transition-all ${
                    fxEditState.mode === "field"
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Field Sign-based Color
                </button>
              </div>
            </div>

            {/* Mode Specific parameters */}
            {fxEditState.mode === "rules" ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block">Rule Conditions Mapping</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">If value is</span>
                    <select
                      value={fxEditState.operator || "greater"}
                      onChange={(e) => setFxEditState(prev => prev ? { ...prev, operator: e.target.value as any } : null)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-855"
                    >
                      <option value="greater">Greater Than (&gt;)</option>
                      <option value="less">Less Than (&lt;)</option>
                      <option value="equal">Equals (=)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Comparison Threshold</span>
                    <input
                      type="number"
                      value={fxEditState.value ?? 0}
                      onChange={(e) => setFxEditState(prev => prev ? { ...prev, value: parseFloat(e.target.value) || 0 } : null)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-800 text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                      {isBg ? "Matched Color Code" : "Matched Text Color"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fxEditState.resultValue || "#10b981"}
                        onChange={(e) => setFxEditState(prev => prev ? { ...prev, resultValue: e.target.value } : null)}
                        className="w-6 h-6 rounded border border-slate-200 bg-transparent shrink-0 cursor-pointer"
                      />
                      <span className="font-mono text-slate-600 font-semibold uppercase">{fxEditState.resultValue || "#10b981"}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                      {isBg ? "Otherwise Color" : "Otherwise Text Color"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fxEditState.fallbackValue || "#ef4444"}
                        onChange={(e) => setFxEditState(prev => prev ? { ...prev, fallbackValue: e.target.value } : null)}
                        className="w-6 h-6 rounded border border-slate-200 bg-transparent shrink-0 cursor-pointer"
                      />
                      <span className="font-mono text-slate-600 font-semibold uppercase">{fxEditState.fallbackValue || "#ef4444"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-150 space-y-2">
                <span className="text-[9px] font-bold text-indigo-700 uppercase font-mono block">Sign-Based Smart Coloring</span>
                <p className="text-[10px] text-indigo-600 leading-normal font-sans">
                  Automatically paints cells or rows to positive and negative palette values depending on evaluated numeric sign:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] text-indigo-500 font-bold block uppercase tracking-wider">Positive Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fxEditState.resultValue || "#10b981"}
                        onChange={(e) => setFxEditState(prev => prev ? { ...prev, resultValue: e.target.value } : null)}
                        className="w-6 h-6 rounded border border-indigo-200 bg-transparent shrink-0 cursor-pointer"
                      />
                      <span className="font-mono text-indigo-700 font-semibold uppercase">{fxEditState.resultValue || "#10b981"}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-indigo-500 font-bold block uppercase tracking-wider">Negative Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fxEditState.fallbackValue || "#ef4444"}
                        onChange={(e) => setFxEditState(prev => prev ? { ...prev, fallbackValue: e.target.value } : null)}
                        className="w-6 h-6 rounded border border-indigo-200 bg-transparent shrink-0 cursor-pointer"
                      />
                      <span className="font-mono text-indigo-700 font-semibold uppercase">{fxEditState.fallbackValue || "#ef4444"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              onClick={() => removeFxConfig(activeFxProperty)}
              className="px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all"
            >
              Clear FX Binding
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveFxProperty(null);
                  setFxEditState(null);
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveFxConfig}
                disabled={!fxEditState.measureId}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  fxEditState.measureId
                    ? "bg-black text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Apply FX Formula
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentFiles = projectFilesMap[activeTemplate];
  const currentDataset = datasetMap[activeTemplate];
  const currentSettings = settingsMap[activeTemplate];

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#1a1a1a] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden [id='pbi-main-layout']">
      
      {/* 🚀 Brand Minimalism Navigation Header */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-10 shadow-[0_2px_18px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          {/* Custom Brand Logo - Glowing circular network sphere icon matching user-provided specifications */}
          <div className="w-9 h-9 bg-gradient-to-br from-[#4f14a0] via-[#251368] to-[#110530] rounded-xl shadow-sm flex items-center justify-center shrink-0 relative transition-all duration-300 hover:scale-105 hover:rotate-2 border border-violet-500/20 group">
            <svg className="w-7 h-7 text-white" viewBox="0 0 64 64" fill="none">
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              
              {/* Connected arcs */}
              <g stroke="url(#arc-grad)" strokeWidth="1.2">
                {/* Diagonal lines */}
                <path d="M 50 32 Q 32 32, 14 32" filter="url(#neon-glow)" />
                <path d="M 32 14 Q 32 32, 32 50" filter="url(#neon-glow)" />
                <path d="M 44.7 19.3 Q 32 32, 19.3 44.7" filter="url(#neon-glow)" />
                <path d="M 19.3 19.3 Q 32 32, 44.7 44.7" filter="url(#neon-glow)" />
                
                {/* Curve arcs forming bounds */}
                <path d="M 50 32 Q 44.7 44.7, 32 50" fill="none" opacity="0.6" />
                <path d="M 32 50 Q 19.3 44.7, 14 32" fill="none" opacity="0.6" />
                <path d="M 14 32 Q 19.3 19.3, 32 14" fill="none" opacity="0.6" />
                <path d="M 32 14 Q 44.7 19.3, 50 32" fill="none" opacity="0.6" />

                {/* Internal aesthetic cross-paths */}
                <path d="M 50 32 Q 38.3 25.7, 19.3 19.3" fill="none" opacity="0.5" />
                <path d="M 14 32 Q 25.7 38.3, 44.7 44.7" fill="none" opacity="0.5" />
              </g>

              {/* Glowing Nodes */}
              <circle cx="50" cy="32" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="44.7" cy="44.7" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="32" cy="50" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="19.3" cy="44.7" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="14" cy="32" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="19.3" cy="19.3" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="32" cy="14" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
              <circle cx="44.7" cy="19.3" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
            </svg>
          </div>

          <div className="h-5 w-px bg-slate-200"></div>

          <div>
            <h1 className="font-display font-bold text-xs text-slate-800 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Power BI Visual Workspace</span>
              <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                SDK PRO v5.3
              </span>
            </h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold leading-tight">Interactive Matrix Sandbox • Production Spec</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Info Alerts */}
          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] rounded-lg flex items-center gap-1.5 font-medium shadow-2xs"
            >
              <Info size={11} className="text-slate-400" />
              <span>{infoMessage}</span>
            </motion.div>
          )}

          {/* Export custom visual project zipped button */}
          <button
            onClick={handleExportZip}
            className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-semibold flex items-center gap-2 cursor-pointer leading-none active:scale-98"
          >
            <Download size={13} className="stroke-[2.5]" />
            <span>Publish pbiviz Package</span>
          </button>
        </div>
      </header>

      {/* Primary Workspace Panels Splitter */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: Parameters, Buckets & Datasets Selection */}
        <div className="w-full lg:w-[410px] bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col shrink-0 min-h-0 overflow-y-auto p-4 space-y-4">
          
          {/* 1. Templates selector card */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <FolderOpen size={13} className="text-gray-400" />
              <span>Select Project Template</span>
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {templates.map((t) => {
                const isSelected = activeTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTemplate(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs outline-none select-none flex items-center gap-3 cursor-pointer group ${
                      isSelected
                        ? "bg-gray-50 border-gray-900 text-gray-900"
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all ${
                      isSelected 
                        ? "bg-gray-950 text-white" 
                        : "bg-gray-50 text-gray-400 group-hover:text-gray-500 group-hover:bg-gray-100/80"
                    }`}>
                      {getTemplateIcon(t.id)}
                    </div>
                    <div className="flex-1 space-y-0.5 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold tracking-tight text-[12px] group-hover:text-gray-900 transition-colors ${
                          isSelected ? "text-gray-950 font-bold" : "text-gray-700"
                        }`}>
                          {t.name}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          t.difficulty === "Beginner" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : t.difficulty === "Intermediate"
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>{t.difficulty}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Format settings vs Data wells mapping */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col flex-1 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
            <div className="bg-gray-50/50 px-2 py-0.5 border-b border-gray-100 flex text-xs font-semibold overflow-x-auto whitespace-nowrap scrollbar-none gap-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("fields")}
                className={`px-2 py-2.5 text-[10px] font-extrabold uppercase tracking-wider border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "fields"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-500 font-medium opacity-80"
                }`}
              >
                Fields
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("format")}
                className={`px-2 py-2.5 text-[10px] font-extrabold uppercase tracking-wider border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "format"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-500 font-medium opacity-80"
                }`}
              >
                Format
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={`px-2 py-2.5 text-[10px] font-extrabold uppercase tracking-wider border-b-2 hover:text-indigo-600 transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "rules"
                    ? "border-b-indigo-600 text-indigo-700 font-bold"
                    : "border-b-transparent text-gray-500 font-medium opacity-80"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Conditional (fx)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dax")}
                className={`px-2 py-2.5 text-[10px] font-extrabold uppercase tracking-wider border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "dax"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-500 font-medium opacity-80"
                }`}
              >
                DAX
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("copilot")}
                className={`px-2 py-2.5 text-[10px] font-extrabold uppercase tracking-wider border-b-2 hover:text-purple-600 transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "copilot"
                    ? "border-b-purple-600 text-purple-700 font-bold"
                    : "border-b-transparent text-gray-500 font-medium opacity-80"
                }`}
              >
                <Sparkles size={11} className="text-purple-500" />
                <span>AI Copilot</span>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {activeTab === "fields" ? (
                <PowerBIDataPanel
                  dataConfig={currentDataset}
                  onChange={(d) => setDatasetMap(prev => ({ ...prev, [activeTemplate]: d }))}
                  showSecondary={true}
                />
              ) : activeTab === "format" ? (
                <PowerBIFormatPane
                  currentSettings={currentSettings}
                  activeTemplate={activeTemplate}
                  setSettingsMap={setSettingsMap}
                  openFxConfig={openFxConfig}
                  formatSubTab={formatSubTab}
                  setFormatSubTab={setFormatSubTab}
                  formatSearchQuery={formatSearchQuery}
                  setFormatSearchQuery={setFormatSearchQuery}
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  setActiveTab={setActiveTab}
                />
              ) : activeTab === "rules" ? (
                <div className="space-y-4 text-xs font-sans overflow-y-auto">
                  {/* Pro Active Formatting Console Header Banner */}
                  <div className="bg-indigo-50/70 border border-indigo-150 p-4 rounded-xl space-y-2">
                    <span className="font-bold text-indigo-950 tracking-tight block text-[11px] font-sans flex items-center gap-1.5">
                      <Sparkles size={12} className="text-indigo-600 animate-pulse" />
                      <span>Dynamic Excel & Power BI Rule Engine</span>
                    </span>
                    <p className="text-[10.5px] text-indigo-800 leading-relaxed font-medium">
                      Define heatmaps, KPI progress markers, or custom formula threshold rules. When exporting the customized report template, these visual configurations compile directly into standard Power BI theme styles.
                    </p>
                  </div>

                  {/* Power BI Conditional Formatting Section */}
                  <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-3.5 shadow-2xs">
                    <div>
                      <span className="font-bold tracking-tight font-display text-slate-800 text-[11px] block">Conditional Formatting</span>
                      <span className="text-[10px] text-slate-400">Apply rules to table rows and numeric columns</span>
                    </div>

                    {/* Row Formatting Toggles */}
                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Row-Level Rules</span>
                      
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="font-medium text-slate-700 block text-[11px]">Row Variance highlight</span>
                          <span className="text-[9.5px] text-slate-400 font-sans block leading-tight">Green / Red highlights based on Variance</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentSettings.enableRowVarianceFormatting || false}
                          onChange={(e) => setSettingsMap(prev => ({
                            ...prev,
                            [activeTemplate]: { ...prev[activeTemplate], enableRowVarianceFormatting: e.target.checked }
                          }))}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div>
                          <span className="font-medium text-slate-700 block text-[11px]">Row Heatmap gradient</span>
                          <span className="text-[9.5px] text-slate-400 font-sans block leading-tight">Shade background based on actual value size</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentSettings.enableRowHeatmap || false}
                          onChange={(e) => setSettingsMap(prev => ({
                            ...prev,
                            [activeTemplate]: { ...prev[activeTemplate], enableRowHeatmap: e.target.checked }
                          }))}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Column Formatting Options */}
                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Column-Level Rules</span>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-medium block">Target Column</label>
                        <select
                          value={currentSettings.columnFormattingTarget || "none"}
                          onChange={(e) => setSettingsMap(prev => ({
                            ...prev,
                            [activeTemplate]: { ...prev[activeTemplate], columnFormattingTarget: e.target.value as any }
                          }))}
                          className="w-full bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-850 outline-none"
                        >
                          <option value="none">None (Disabled)</option>
                          <option value="actual">Actual</option>
                          <option value="budget">Budget</option>
                          <option value="variance">Variance ($)</option>
                          <option value="variancePct">Variance (%)</option>
                        </select>
                      </div>

                      {currentSettings.columnFormattingTarget && currentSettings.columnFormattingTarget !== "none" && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[10px] text-slate-400 font-medium block">Formatting Style</label>
                          <select
                            value={currentSettings.columnFormattingType || "none"}
                            onChange={(e) => setSettingsMap(prev => ({
                              ...prev,
                              [activeTemplate]: { ...prev[activeTemplate], columnFormattingType: e.target.value as any }
                            }))}
                            className="w-full bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-850 outline-none"
                          >
                            <option value="none">Choose action...</option>
                            <option value="heatmap">Cell Heatmap Background Gradient</option>
                            <option value="databars">Data Bars (Proportion Charts)</option>
                            <option value="icons">KPI Status Icons (Indicators)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* DAX Measures Conditional Formatting Block */}
                    <div className="space-y-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider font-mono block">DAX-Driven Conditional Styles</span>
                          <span className="text-[9.5px] text-slate-400 font-sans block leading-tight">Format layout styling using calculated DAX measure bounds</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentSettings.enableDaxCondFormatting || false}
                          onChange={(e) => setSettingsMap(prev => ({
                            ...prev,
                            [activeTemplate]: { ...prev[activeTemplate], enableDaxCondFormatting: e.target.checked }
                          }))}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                        />
                      </div>

                      {currentSettings.enableDaxCondFormatting && (
                        <div className="space-y-3 pl-2 border-l-2 border-indigo-400 pt-1 animate-fade-in text-[11px]">
                          {/* Format Style Mode Selector */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-indigo-600 font-bold block uppercase tracking-wider">Format Style</label>
                            <select
                              value={currentSettings.daxCondFormatMode || "rules"}
                              onChange={(e) => setSettingsMap(prev => ({
                                ...prev,
                                [activeTemplate]: { ...prev[activeTemplate], daxCondFormatMode: e.target.value as any }
                              }))}
                              className="w-full bg-indigo-50 border border-indigo-200 rounded-md px-2 py-1 text-[11px] font-bold text-indigo-900 outline-none"
                            >
                              <option value="rules">Rules (Value comparisons)</option>
                              <option value="fieldValue">Field Value (Dynamic measure returns hex color)</option>
                            </select>
                          </div>

                          {/* 1. Select DAX measure */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-medium block">
                              {currentSettings.daxCondFormatMode === "fieldValue" ? "Measure returning Hex Color / format string" : "Based on DAX Measure"}
                            </label>
                            <select
                              value={currentSettings.daxCondMeasureId || ""}
                              onChange={(e) => setSettingsMap(prev => ({
                                ...prev,
                                [activeTemplate]: { ...prev[activeTemplate], daxCondMeasureId: e.target.value }
                              }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none"
                            >
                              <option value="">-- Select a DAX Measure --</option>
                              {(currentSettings.daxMeasures || []).map((m) => (
                                <option key={m.id} value={m.id}>{m.name} ({m.formula})</option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Format Target */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-medium block">Apply formatting to</label>
                            <select
                              value={currentSettings.daxCondTarget || "all"}
                              onChange={(e) => setSettingsMap(prev => ({
                                ...prev,
                                [activeTemplate]: { ...prev[activeTemplate], daxCondTarget: e.target.value as any }
                              }))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none"
                            >
                              <option value="all">Whole Row (Columns & Headers)</option>
                              <option value="rows">Hierarchy Header Label Row Only</option>
                              <option value="columns">Numeric Metric Columns Only</option>
                            </select>
                          </div>

                          {currentSettings.daxCondFormatMode === "fieldValue" ? (
                            /* Field Value specific sub-targets (apply to Bg, Font or Both) */
                            <div className="space-y-1 p-2 bg-indigo-50/50 border border-indigo-100 rounded-md">
                              <label className="text-[9.5px] text-indigo-700 font-bold block">Apply color as</label>
                              <select
                                value={currentSettings.daxCondFieldValueTarget || "background"}
                                onChange={(e) => setSettingsMap(prev => ({
                                  ...prev,
                                  [activeTemplate]: { ...prev[activeTemplate], daxCondFieldValueTarget: e.target.value as any }
                                }))}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 font-semibold outline-none"
                              >
                                <option value="background">Background Fill (Hex color)</option>
                                <option value="font">Text / Font Color (Hex color)</option>
                                <option value="both">Both Fill and Font Color</option>
                              </select>
                              <p className="text-[8.5px] text-slate-500 mt-1 leading-snug">
                                Ensure your DAX measure evaluates to a hex code like <code className="font-bold text-indigo-600 font-mono">"#FF0000"</code> or a CSS color name so the visual can apply it dynamically.
                              </p>
                            </div>
                          ) : (
                            /* Rules Mode inputs: Conditions & Colors */
                            <>
                              {/* 3. Condition Operator */}
                              <div className="space-y-1">
                                <label className="text-[9.5px] text-slate-400 font-medium block">Condition Operator</label>
                                <select
                                  value={currentSettings.daxCondCondition || "greater"}
                                  onChange={(e) => setSettingsMap(prev => ({
                                    ...prev,
                                    [activeTemplate]: { ...prev[activeTemplate], daxCondCondition: e.target.value as any }
                                  }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none"
                                >
                                  <option value="greater">Is greater than (&gt; val)</option>
                                  <option value="less">Is less than (&lt; val)</option>
                                  <option value="between">Is strictly between (min, max)</option>
                                </select>
                              </div>

                              {/* 4. Values */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9.5px] text-slate-400 font-medium block">
                                    {currentSettings.daxCondCondition === "between" ? "Min Bounds" : "Threshold Limit"}
                                  </span>
                                  <input
                                    type="number"
                                    value={currentSettings.daxCondValue1 ?? 100000}
                                    onChange={(e) => setSettingsMap(prev => ({
                                      ...prev,
                                      [activeTemplate]: { ...prev[activeTemplate], daxCondValue1: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 font-bold"
                                  />
                                </div>

                                {currentSettings.daxCondCondition === "between" && (
                                  <div className="space-y-1">
                                    <span className="text-[9.5px] text-slate-400 font-medium block">Max Bounds</span>
                                    <input
                                      type="number"
                                      value={currentSettings.daxCondValue2 ?? 1000000}
                                      onChange={(e) => setSettingsMap(prev => ({
                                        ...prev,
                                        [activeTemplate]: { ...prev[activeTemplate], daxCondValue2: parseFloat(e.target.value) || 0 }
                                      }))}
                                      className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-800 font-bold"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* 5. Custom Colors */}
                              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Font Color</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={currentSettings.daxCondTextColor || "#15803d"}
                                      onChange={(e) => setSettingsMap(prev => ({
                                        ...prev,
                                        [activeTemplate]: { ...prev[activeTemplate], daxCondTextColor: e.target.value }
                                      }))}
                                      className="w-4 h-4 cursor-pointer rounded border border-slate-200 bg-transparent"
                                    />
                                    <span className="text-[9px] font-mono font-medium text-slate-600 uppercase">{currentSettings.daxCondTextColor || "#15803d"}</span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Highlight BG</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={currentSettings.daxCondBgColor || "#f0fdf4"}
                                      onChange={(e) => setSettingsMap(prev => ({
                                        ...prev,
                                        [activeTemplate]: { ...prev[activeTemplate], daxCondBgColor: e.target.value }
                                      }))}
                                      className="w-4 h-4 cursor-pointer rounded border border-slate-200 bg-transparent"
                                    />
                                    <span className="text-[9px] font-mono font-medium text-slate-600 uppercase">{currentSettings.daxCondBgColor || "#f0fdf4"}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Advanced Conditional Formatting Multi-Engine Suite */}
                    <div className="space-y-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider font-sans block flex items-center gap-1">
                            <Sparkles size={11} className="text-indigo-600 animate-pulse" />
                            <span>Formatting Engine Suite</span>
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-sans block leading-tight">Combine Rules, Text, Expressions, and DAX Measures</span>
                        </div>
                        <button
                          onClick={handleAddCFRule}
                          className="flex items-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all select-none cursor-pointer shadow-sm"
                        >
                          <Plus size={11} className="stroke-[3]" /> Add Rule
                        </button>
                      </div>

                      <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                        {(!currentSettings.cfRules || currentSettings.cfRules.length === 0) ? (
                          <div className="text-center py-5 bg-slate-50/50 border border-dashed border-slate-205 rounded-xl p-3">
                            <span className="text-[10.5px] text-slate-400 font-medium font-sans">No advanced formatting engines configured yet.</span>
                          </div>
                        ) : (
                          (currentSettings.cfRules || []).map((rule: any, rIdx: number) => {
                            const isExpanded = rule._uiExpanded !== false;
                            return (
                              <div key={rule.id} className={`bg-white border rounded-xl shadow-xs transition-all ${rule.isEnabled ? 'border-slate-200/90' : 'border-slate-200/40 opacity-70'}`}>
                                {/* Card Header */}
                                <div className="flex items-center justify-between bg-slate-50/60 px-3 py-2 border-b border-slate-100 rounded-t-xl gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={rule.isEnabled !== false}
                                      onChange={(e) => handleUpdateCFRule(rule.id, { isEnabled: e.target.checked })}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={rule.name || ""}
                                      onChange={(e) => handleUpdateCFRule(rule.id, { name: e.target.value })}
                                      className="bg-transparent border-0 font-bold text-[10.5px] text-slate-700 focus:ring-0 p-0 hover:bg-slate-200/40 focus:bg-white rounded px-1 transition-colors w-full outline-none"
                                      placeholder="Rule Name"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCFRule(rule.id, { _uiExpanded: !isExpanded })}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded text-[10px] font-mono"
                                      title={isExpanded ? "Collapse" : "Expand"}
                                    >
                                      {isExpanded ? "▲" : "▼"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCFRule(rule.id)}
                                      className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="p-3 space-y-3 text-[10.5px]">
                                    {/* 1. Engine & Priority Selection */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Format Engine</label>
                                        <select
                                          value={rule.engine}
                                          onChange={(e) => handleUpdateCFRule(rule.id, { engine: e.target.value })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-semibold text-slate-850 outline-none"
                                        >
                                          <option value="rule">Rule-Based Engine</option>
                                          <option value="text">Text/String Engine</option>
                                          <option value="expression">Expression Engine</option>
                                          <option value="measure">Measure Engine</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Priority Rank</label>
                                        <input
                                          type="number"
                                          value={rule.priority ?? 5}
                                          onChange={(e) => handleUpdateCFRule(rule.id, { priority: parseInt(e.target.value) || 5 })}
                                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-850 outline-none text-center"
                                          placeholder="1-10 (lower runs first)"
                                        />
                                      </div>
                                    </div>

                                    {/* 2. Target Settings */}
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/50 border border-slate-100 rounded-lg">
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Scope</label>
                                        <select
                                          value={rule.targetType}
                                          onChange={(e) => handleUpdateCFRule(rule.id, { targetType: e.target.value })}
                                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] text-slate-800 outline-none font-medium"
                                        >
                                          <option value="cell">Entire Cell</option>
                                          <option value="row">Entire Row</option>
                                          <option value="column">Entire Column</option>
                                          <option value="hierarchy">Hierarchy Node</option>
                                          <option value="subtotal">Subtotal Row/Col</option>
                                          <option value="grandtotal">Grand Total Row/Col</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scope Metric</label>
                                        <select
                                          value={rule.targetColumn || "All"}
                                          onChange={(e) => handleUpdateCFRule(rule.id, { targetColumn: e.target.value })}
                                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] text-slate-800 outline-none font-medium"
                                        >
                                          <option value="All">All Columns</option>
                                          <option value="actual">Actual</option>
                                          <option value="budget">Budget</option>
                                          <option value="variance">Variance</option>
                                          <option value="variancePct">Variance %</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* 3. Engine Parameters Section */}
                                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider block">Engine Conditions</span>
                                      
                                      {rule.engine === "rule" && (
                                        <div className="space-y-2 animate-fade-in">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Field</span>
                                              <select
                                                value={rule.ruleField || "actual"}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { ruleField: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                              >
                                                <option value="actual">Actual</option>
                                                <option value="budget">Budget</option>
                                                <option value="variance">Variance</option>
                                                <option value="variancePct">Variance %</option>
                                              </select>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Operator</span>
                                              <select
                                                value={rule.ruleOperator || "greater"}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { ruleOperator: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                              >
                                                <option value="greater">Greater Than (&gt;)</option>
                                                <option value="less">Less Than (&lt;)</option>
                                                <option value="greaterOrEqual">Greater/Equal (&gt;=)</option>
                                                <option value="lessOrEqual">Less/Equal (&lt;=)</option>
                                                <option value="equal">Equal To (=)</option>
                                                <option value="notEqual">Not Equal To (!=)</option>
                                                <option value="between">Is Between</option>
                                              </select>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">
                                                {rule.ruleOperator === "between" ? "Min Value" : "Value"}
                                              </span>
                                              <input
                                                type="text"
                                                value={rule.ruleValue1 ?? ""}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { ruleValue1: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-800 font-semibold"
                                                placeholder="e.g. 100000"
                                              />
                                            </div>
                                            {rule.ruleOperator === "between" && (
                                              <div className="space-y-1">
                                                <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Max Value</span>
                                                <input
                                                  type="text"
                                                  value={rule.ruleValue2 ?? ""}
                                                  onChange={(e) => handleUpdateCFRule(rule.id, { ruleValue2: e.target.value })}
                                                  className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-800 font-semibold"
                                                  placeholder="e.g. 500000"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {rule.engine === "text" && (
                                        <div className="space-y-2 animate-fade-in">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Text Field</span>
                                              <select
                                                value={rule.textField || "name"}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { textField: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                              >
                                                <option value="name">Row Name</option>
                                              </select>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Operator</span>
                                              <select
                                                value={rule.textOperator || "startsWith"}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { textOperator: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                              >
                                                <option value="startsWith">Starts With</option>
                                                <option value="endsWith">Ends With</option>
                                                <option value="contains">Contains</option>
                                                <option value="equals">Equals Exactly</option>
                                                <option value="notEquals">Does Not Equal</option>
                                                <option value="isEmpty">Is Empty</option>
                                                <option value="isNotEmpty">Is Not Empty</option>
                                              </select>
                                            </div>
                                          </div>
                                          {!["isEmpty", "isNotEmpty"].includes(rule.textOperator || "") && (
                                            <div className="space-y-1">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Match Value</span>
                                              <input
                                                type="text"
                                                value={rule.textValue || ""}
                                                onChange={(e) => handleUpdateCFRule(rule.id, { textValue: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-800 font-semibold"
                                                placeholder="e.g. Sales"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {rule.engine === "expression" && (
                                        <div className="space-y-2 animate-fade-in">
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                              <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Formula Expression</span>
                                              <span className="text-[8px] text-indigo-600 font-semibold">Excel/DAX compatible syntax</span>
                                            </div>
                                            <textarea
                                              value={rule.expressionString || ""}
                                              onChange={(e) => handleUpdateCFRule(rule.id, { expressionString: e.target.value })}
                                              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px] font-mono text-slate-800 outline-none h-14 resize-none"
                                              placeholder="e.g. Actual > 100000 AND Name contains 'Revenue'"
                                            />
                                          </div>
                                          
                                          {/* Clickable help chips */}
                                          <div className="space-y-1">
                                            <span className="text-[8px] font-bold text-slate-400 block uppercase">Formula Helper Macros</span>
                                            <div className="flex flex-wrap gap-1">
                                              {["Actual", "Budget", "Variance", "VariancePct", "Profit", "Revenue", "AND", "OR", "NOT", "ISBLANK"].map((macro) => (
                                                <button
                                                  key={macro}
                                                  type="button"
                                                  onClick={() => {
                                                    const currentExpr = rule.expressionString || "";
                                                    const space = currentExpr && !currentExpr.endsWith(" ") ? " " : "";
                                                    handleUpdateCFRule(rule.id, { expressionString: `${currentExpr}${space}${macro}` });
                                                  }}
                                                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold transition-all shrink-0 cursor-pointer"
                                                >
                                                  +{macro}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {rule.engine === "measure" && (
                                        <div className="space-y-2 animate-fade-in">
                                          <div className="space-y-1">
                                            <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Select Calculated Measure</span>
                                            <select
                                              value={rule.measureId || ""}
                                              onChange={(e) => handleUpdateCFRule(rule.id, { measureId: e.target.value })}
                                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                            >
                                              <option value="">-- Choose Measure --</option>
                                              {(currentSettings.daxMeasures || []).map((m: any) => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Apply Output To Style Property</span>
                                            <select
                                              value={rule.measureTargetProperty || "background"}
                                              onChange={(e) => handleUpdateCFRule(rule.id, { measureTargetProperty: e.target.value })}
                                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-850 outline-none"
                                            >
                                              <option value="background">Background Fill (evaluates measure return value as Hex color)</option>
                                              <option value="foreground">Font/Text Color (evaluates measure return value as Hex color)</option>
                                              <option value="icon">KPI Icon (evaluates measure return value as status name)</option>
                                              <option value="borderColor">Border Line Color (evaluates measure return value as Hex color)</option>
                                              <option value="allStyles">All Styles (evaluates measure return value directly)</option>
                                            </select>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* 4. Formatting Output Styles Section */}
                                    <div className="space-y-2.5 border-t border-slate-100 pt-2.5 bg-slate-50/30 p-2 rounded-lg">
                                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider block">Resulting Cell Style</span>
                                      
                                      {/* Background & Text Colors */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Background</span>
                                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
                                            <input
                                              type="color"
                                              value={rule.style?.background || "#ffffff"}
                                              onChange={(e) => handleUpdateCFRule(rule.id, {
                                                style: { ...(rule.style || {}), background: e.target.value }
                                              })}
                                              className="w-4 h-4 cursor-pointer border-0 bg-transparent rounded"
                                            />
                                            <span className="text-[8.5px] font-mono font-medium uppercase text-slate-500">{rule.style?.background || "#ffffff"}</span>
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Text Color</span>
                                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
                                            <input
                                              type="color"
                                              value={rule.style?.foreground || "#111827"}
                                              onChange={(e) => handleUpdateCFRule(rule.id, {
                                                style: { ...(rule.style || {}), foreground: e.target.value }
                                              })}
                                              className="w-4 h-4 cursor-pointer border-0 bg-transparent rounded"
                                            />
                                            <span className="text-[8.5px] font-mono font-medium uppercase text-slate-500">{rule.style?.foreground || "#111827"}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Borders & Custom SVG/KPI icon */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block">Border Color</span>
                                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-1">
                                            <input
                                              type="color"
                                              value={rule.style?.borderColor || "#ffffff"}
                                              onChange={(e) => handleUpdateCFRule(rule.id, {
                                                style: { ...(rule.style || {}), borderColor: e.target.value }
                                              })}
                                              className="w-4 h-4 cursor-pointer border-0 bg-transparent rounded"
                                            />
                                            <span className="text-[8.5px] font-mono font-medium uppercase text-slate-500">{rule.style?.borderColor || "#ffffff"}</span>
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block font-sans">KPI Icon</span>
                                          <select
                                            value={rule.style?.icon || ""}
                                            onChange={(e) => handleUpdateCFRule(rule.id, {
                                              style: { ...(rule.style || {}), icon: e.target.value }
                                            })}
                                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[9.5px] font-semibold text-slate-800 outline-none"
                                          >
                                            <option value="">No Icon</option>
                                            <option value="check">Checkmark (Success)</option>
                                            <option value="warning">Warning Symbol</option>
                                            <option value="error">Error Indicator</option>
                                            <option value="arrow-up">Arrow Up (▲)</option>
                                            <option value="arrow-down">Arrow Down (▼)</option>
                                            <option value="neutral-dash">Neutral Dash (▬)</option>
                                            <option value="star">Star Rating</option>
                                            <option value="flag">Alert Flag</option>
                                          </select>
                                        </div>
                                      </div>

                                      {/* Typography Styles and emphasis buttons */}
                                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCFRule(rule.id, {
                                            style: { ...(rule.style || {}), fontWeight: rule.style?.fontWeight === "bold" ? "normal" : "bold" }
                                          })}
                                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all ${
                                            rule.style?.fontWeight === "bold"
                                              ? "bg-slate-900 border-slate-900 text-white"
                                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          Bold
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCFRule(rule.id, {
                                            style: { ...(rule.style || {}), fontStyle: rule.style?.fontStyle === "italic" ? "normal" : "italic" }
                                          })}
                                          className={`px-2 py-0.5 rounded text-[9.5px] italic border transition-all ${
                                            rule.style?.fontStyle === "italic"
                                              ? "bg-slate-900 border-slate-900 text-white font-bold"
                                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          Italic
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCFRule(rule.id, {
                                            style: { ...(rule.style || {}), textDecoration: rule.style?.textDecoration === "underline" ? "none" : "underline" }
                                          })}
                                          className={`px-2 py-0.5 rounded text-[9.5px] underline border transition-all ${
                                            rule.style?.textDecoration === "underline"
                                              ? "bg-slate-900 border-slate-900 text-white font-bold"
                                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          Underline
                                        </button>
                                      </div>

                                      {/* Rich details: Animation & Tooltips */}
                                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-1.5">
                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block font-sans">CSS Animation</span>
                                          <select
                                            value={rule.style?.animation || ""}
                                            onChange={(e) => handleUpdateCFRule(rule.id, {
                                              style: { ...(rule.style || {}), animation: e.target.value }
                                            })}
                                            className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 text-[9.5px] text-slate-800 outline-none"
                                          >
                                            <option value="">None</option>
                                            <option value="pulse">Pulse effect</option>
                                            <option value="bounce">Bounce alert</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[8px] font-bold text-slate-400 uppercase block font-sans">Custom Tooltip</span>
                                          <input
                                            type="text"
                                            value={rule.style?.tooltip || ""}
                                            onChange={(e) => handleUpdateCFRule(rule.id, {
                                              style: { ...(rule.style || {}), tooltip: e.target.value }
                                            })}
                                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] text-slate-800 font-semibold"
                                            placeholder="Hover text hint..."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Custom Alert Colors */}
                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Design Color Palettes</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-emerald-750 block uppercase">Positive Color</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={currentSettings.positiveColor || "#10b981"}
                              onChange={(e) => setSettingsMap(prev => ({
                                ...prev,
                                [activeTemplate]: { ...prev[activeTemplate], positiveColor: e.target.value }
                              }))}
                              className="w-5 h-5 cursor-pointer rounded border border-slate-205"
                            />
                            <span className="text-[10px] font-mono font-medium text-slate-600 uppercase">{currentSettings.positiveColor || "#10b981"}</span>
                          </div>
                        </div>

                        <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-bold text-rose-750 block uppercase">Negative Color</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={currentSettings.negativeColor || "#ef4444"}
                              onChange={(e) => setSettingsMap(prev => ({
                                ...prev,
                                [activeTemplate]: { ...prev[activeTemplate], negativeColor: e.target.value }
                              }))}
                              className="w-5 h-5 cursor-pointer rounded border border-slate-205"
                            />
                            <span className="text-[10px] font-mono font-medium text-slate-600 uppercase">{currentSettings.negativeColor || "#ef4444"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ) : activeTab === "dax" ? (
                <DAXMeasuresPanel
                  settings={currentSettings}
                  onChange={(updatedMeasures) => {
                    setSettingsMap(prev => ({
                      ...prev,
                      [activeTemplate]: { ...prev[activeTemplate], daxMeasures: updatedMeasures }
                    }));
                  }}
                />
              ) : (
                <CopilotPanel
                  files={currentFiles}
                  templateType={activeTemplate}
                  onApplyChanges={handleCopilotApply}
                />
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Reporting Sandbox Sandbox */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 space-y-4">
          <div className="flex-1 min-h-[300px]">
            <VisualSandbox
              files={currentFiles}
              templateId={activeTemplate}
              dataConfig={currentDataset}
              settings={currentSettings}
            />
          </div>

          {/* Quick Guide section bottom middle */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-[0_4px_30px_rgba(0,0,0,0.01)] flex flex-col gap-2.5">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between w-full cursor-pointer hover:text-gray-700 select-none focus:outline-none"
              title={showGuide ? "Hide Power BI setup guide" : "Show Power BI setup guide"}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-gray-400" />
                <span>How do I install and run inside Power BI? ({showGuide ? "Hide" : "Show"})</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100 font-sans normal-case">
                {showGuide ? "Click to hide deployment explanations" : "Click to show developer setup steps"}
              </span>
            </button>
            {showGuide && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs leading-normal pt-1 border-t border-gray-50">
                {[
                  { step: "1. CLI Setup", desc: "Run 'npm install -g powerbi-visuals-tools' in your local terminal to install the SDK." },
                  { step: "2. Visual Create", desc: "Initialize empty visual via 'pbiviz new myVisual' or extract our downloaded file folder project." },
                  { step: "3. Run Server", desc: "Open directory & type 'pbiviz start'. This boots a secure local testing server on port 8080." },
                  { step: "4. Add in Report", desc: "Add Developer Visual from the Visualizations Panel. Map your real category buckets." }
                ].map((s, idx) => (
                  <div key={idx} className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                    <span className="font-bold text-gray-900 tracking-tight block text-[11px] font-mono">{s.step}</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Terminal Explorer */}
        <div className="w-full lg:w-[480px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col min-h-0 p-4">
          <CodeWorkspace
            files={currentFiles}
            onChangeFile={handleFileChange}
            onReset={handleResetTemplate}
          />
        </div>

        {/* Dynamic FX formatting popup element */}
        {renderFxModal()}

      </div>
    </div>
  );
}
