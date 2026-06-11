/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { templates } from "./data/templates";
import { VisualSandbox } from "./components/VisualSandbox";
import { PowerBIDataPanel } from "./components/PowerBIDataPanel";
import { CodeWorkspace } from "./components/CodeWorkspace";
import { CopilotPanel } from "./components/CopilotPanel";
import { DAXMeasuresPanel } from "./components/DAXMeasuresPanel";
import { VisualTemplateType, VisualProjectFiles, PowerBIDataConfig, PowerBIVisualSettings, DAXMeasure } from "./types";
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
    categoryRole: "Financial Statement Row",
    measureRole: "Actual Revenue / Cost",
    secondaryMeasureRole: "Budget Revenue / Cost",
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
    accentColor: "#0f172a",
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    fontSize: 12,
    showTooltip: true,
    enableAnimation: true,
    hideEmptyExpand: false,
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

  const [activeTab, setActiveTab] = useState<"fields" | "format" | "dax" | "copilot">("fields");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

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
    const activeProject = projectFilesMap[activeTemplate];
    const originalTemplate = templates.find(t => t.id === activeTemplate);
    const vizName = originalTemplate ? originalTemplate.name.replace(/\s+/g, "") : "CustomPowerBI";

    try {
      const zip = new JSZip();
      
      // root structures
      zip.file("pbiviz.json", activeProject["pbiviz.json"]);
      zip.file("capabilities.json", activeProject["capabilities.json"]);
      zip.file("package.json", activeProject["package.json"]);
      zip.file("tsconfig.json", activeProject["tsconfig.json"]);

      // child directory directories
      zip.folder("src")?.file("visual.ts", activeProject["src/visual.ts"]);
      zip.folder("style")?.file("visual.less", activeProject["style/visual.less"]);

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
    return <Table size={15} />;
  };

  const currentFiles = projectFilesMap[activeTemplate];
  const currentDataset = datasetMap[activeTemplate];
  const currentSettings = settingsMap[activeTemplate];

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#1a1a1a] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden [id='pbi-main-layout']">
      
      {/* 🚀 Brand Minimalism Navigation Header */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-10 shadow-[0_2px_18px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          {/* Custom Brand Logo - Microsoft Power BI gold representation */}
          <div className="w-8 h-8 bg-gradient-to-tr from-[#e5b209] to-[#fcd93a] rounded-lg shadow-sm flex items-center justify-center text-black shrink-0 relative transition-all duration-300 hover:scale-105 hover:rotate-2">
            <svg className="w-5 h-5 text-slate-900 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
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
            <div className="bg-gray-50/50 px-2 py-0.5 border-b border-gray-100 flex text-xs font-semibold">
              <button
                onClick={() => setActiveTab("fields")}
                className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "fields"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-405 text-gray-400 font-medium"
                }`}
              >
                Data Fields
              </button>
              <button
                onClick={() => setActiveTab("format")}
                className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "format"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-405 text-gray-400 font-medium"
                }`}
              >
                Format Visual
              </button>
              <button
                onClick={() => setActiveTab("dax")}
                className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 hover:text-black transition-all cursor-pointer ${
                  activeTab === "dax"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-405 text-gray-400 font-medium"
                }`}
              >
                DAX Measures
              </button>
              <button
                onClick={() => setActiveTab("copilot")}
                className={`flex-1 text-center py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 hover:text-black transition-all cursor-pointer flex justify-center items-center gap-1 ${
                  activeTab === "copilot"
                    ? "border-b-black text-gray-950 font-bold"
                    : "border-b-transparent text-gray-405 text-gray-400 font-medium"
                }`}
              >
                <Sparkles size={11} className="text-gray-400 animate-pulse" />
                <span>Copilot AI</span>
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
                <div className="space-y-4 text-xs font-sans">
                  {/* Title Toggle options */}
                  <div className="bg-white border border-gray-100 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-gray-800">Show Reporting Title</span>
                      <span className="text-[11px] text-gray-400">Append container card headers</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentSettings.showTitle}
                        onChange={(e) => setSettingsMap(prev => ({
                          ...prev,
                          [activeTemplate]: { ...prev[activeTemplate], showTitle: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                    </label>
                  </div>

                  {currentSettings.showTitle && (
                    <div className="bg-white border border-gray-100 p-3.5 rounded-xl space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-gray-450 text-gray-400 mb-1 font-mono">Title Text Content</label>
                      <input
                        type="text"
                        value={currentSettings.titleText}
                        onChange={(e) => setSettingsMap(prev => ({
                          ...prev,
                          [activeTemplate]: { ...prev[activeTemplate], titleText: e.target.value }
                        }))}
                        className="w-full bg-gray-50 border border-gray-100 focus:border-black rounded-lg px-3 py-1.5 outline-none font-sans text-gray-800 font-medium text-xs transition-all"
                      />
                    </div>
                  )}

                  {/* Accenting color picker */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs">
                    <div>
                      <span className="font-bold tracking-tight font-display text-slate-800 text-[11px] block">Corporate Theme Presets</span>
                      <span className="text-[10px] text-slate-400">Applies dynamic left-ribbon brand highlights to major categories</span>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { hex: "#0f172a", name: "Midnight" },
                        { hex: "#059669", name: "Vanguard" },
                        { hex: "#e5b209", name: "Active Gold" },
                        { hex: "#f59e0b", name: "Bloomberg" },
                        { hex: "#6366f1", name: "Modern Purple" },
                        { hex: "#1d4ed8", name: "Royal Cobalt" }
                      ].map((themeObj, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSettingsMap(prev => ({
                            ...prev,
                            [activeTemplate]: { ...prev[activeTemplate], accentColor: themeObj.hex }
                          }))}
                          className={`h-8 rounded-lg border relative transition-all duration-300 hover:scale-105 hover:shadow-xs cursor-pointer ${
                            currentSettings.accentColor === themeObj.hex 
                              ? "ring-2 ring-slate-800 ring-offset-1 scale-105 border-white" 
                              : "border-slate-200/60 opacity-85 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: themeObj.hex }}
                          title={`${themeObj.name} (${themeObj.hex})`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 text-slate-400 border-t border-slate-100">
                      <span className="font-medium">Active Board Accent</span>
                      <span className="font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">{currentSettings.accentColor}</span>
                    </div>
                  </div>

                  {/* Tooltips settings */}
                  <div className="bg-white border border-gray-100 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-gray-800">Tooltips Mapping</span>
                      <span className="text-[11px] text-gray-400">Enable hover tooltip overlay</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentSettings.showTooltip}
                        onChange={(e) => setSettingsMap(prev => ({
                          ...prev,
                          [activeTemplate]: { ...prev[activeTemplate], showTooltip: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                    </label>
                  </div>

                  {/* Auto-Hide Empty Leaf Expand Option */}
                  <div className="bg-white border border-gray-100 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-gray-800">Auto-Hide Leaf Expand</span>
                      <span className="text-[11px] text-gray-400">Hide bullet/placeholder if no children</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={currentSettings.hideEmptyExpand}
                        onChange={(e) => setSettingsMap(prev => ({
                          ...prev,
                          [activeTemplate]: { ...prev[activeTemplate], hideEmptyExpand: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                    </label>
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

      </div>
    </div>
  );
}
