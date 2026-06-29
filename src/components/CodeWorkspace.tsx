import React, { useState, useMemo } from "react";
import { VisualProjectFiles } from "../types";
import { 
  Folder, 
  FileCode, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  RefreshCw,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { validatePBIProject, ValidationItem } from "../utils/pbiValidator";

interface CodeWorkspaceProps {
  files: VisualProjectFiles;
  onChangeFile: (fileName: keyof VisualProjectFiles, content: string) => void;
  onReset: () => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  files,
  onChangeFile,
  onReset
}) => {
  const [activeFile, setActiveFile] = useState<keyof VisualProjectFiles | "validation_report">("src/visual.ts");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "error" | "warning" | "success">("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const fileDescriptions: Record<keyof VisualProjectFiles, string> = {
    "src/visual.ts": "This is the primary visual entry point. Power BI compiles this class, maps construction options (options.element) and executes update() sequentially whenever data values, filters, size parameters or visual formatting settings change.",
    "capabilities.json": "Defines what input buckets (e.g. Category, Values) appear in the metadata field well, maps how Power BI structures values categorical layouts, and declares setting formatting properties.",
    "style/visual.less": "Hosts standard CSS or LESS styling directives mapped exclusively for styling visual nodes. This is automatically bundled into the compiled Power BI package.",
    "pbiviz.json": "The main packaging manifest declaring model parameters, UUID identifiers, major Visual API guidelines, styling points, directories, and package schemas.",
    "package.json": "Declares powerbi-visuals-api libraries, d3-selection requirements, and other typescript compilables loaded for building the visual package.",
    "tsconfig.json": "Standard TypeScript configurations ensuring the package correctly parses es2015 outputs for seamless cross-browser compatibility inside Power BI."
  };

  const report = useMemo(() => {
    return validatePBIProject(files);
  }, [files]);

  const handleCopy = () => {
    if (activeFile === "validation_report") {
      // Copy the validation text report
      const textReport = report.items
        .map(item => `[${item.type.toUpperCase()}] [${item.category}] ${item.title}\n${item.description}\n${item.details ? `Details: ${item.details}\n` : ""}`)
        .join("\n---\n\n");
      navigator.clipboard.writeText(`Power BI Visual Compatibility Report\nScore: ${report.score}/100\nStatus: ${report.isValid ? "VALID" : "CONTAINS ERRORS"}\n\n${textReport}`);
    } else {
      navigator.clipboard.writeText(files[activeFile]);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualScan = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 600);
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return report.items;
    return report.items.filter(item => item.type === activeFilter);
  }, [report.items, activeFilter]);

  const stats = useMemo(() => {
    const counts = {
      all: report.items.length,
      error: 0,
      warning: 0,
      success: 0
    };
    report.items.forEach(item => {
      if (item.type === "error") counts.error++;
      else if (item.type === "warning") counts.warning++;
      else if (item.type === "success") counts.success++;
    });
    return counts;
  }, [report.items]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getScoreGrade = (score: number) => {
    if (score === 100) return "A+";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    return "F";
  };

  return (
    <div className="bg-white text-[#1a1a1a] rounded-xl overflow-hidden border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.01)] flex flex-col h-full [id='pbi-code-terminal']">
      {/* Code Workspace Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Folder size={15} className="text-gray-900" />
          <h3 className="font-mono text-[10px] font-bold leading-normal tracking-widest text-gray-400 uppercase">
            Power BI Project Files
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-black bg-white border border-gray-100 rounded transition-all cursor-pointer shadow-sm"
            title="Reset active boilerplate template"
          >
            <RotateCcw size={11} className="shrink-0" />
            <span>Reset Boilerplate</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-black text-white rounded hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>{activeFile === "validation_report" ? "Copy Report" : "Copy Code"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs list with horizontal scroll and Compliance Validator tab */}
      <div className="flex bg-gray-50 border-b border-gray-100 overflow-x-auto scrollbar-none text-xs">
        {(Object.keys(files) as Array<keyof VisualProjectFiles>).map((fileName) => {
          const isActive = activeFile === fileName;
          return (
            <button
              key={fileName}
              onClick={() => {
                setActiveFile(fileName);
                setIsEditing(false);
              }}
              className={`px-4 py-3 font-mono border-r border-gray-100 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-black border-b-2 border-b-black font-semibold"
                  : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/40"
              }`}
            >
              <FileCode size={13} className={isActive ? "text-black" : "text-gray-400"} />
              <span>{fileName}</span>
            </button>
          );
        })}

        {/* COMPLIANCE VALIDATOR TAB */}
        <button
          onClick={() => {
            setActiveFile("validation_report");
            setIsEditing(false);
          }}
          className={`px-4 py-3 font-mono flex items-center gap-2 shrink-0 transition-all cursor-pointer border-r border-gray-100 ml-auto ${
            activeFile === "validation_report"
              ? "bg-[#e0e7ff] text-indigo-700 border-b-2 border-b-indigo-700 font-bold"
              : report.isValid
              ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/30"
              : "text-rose-600 hover:text-rose-700 hover:bg-rose-50/30 animate-pulse"
          }`}
          title="Verify visual files against Power BI Desktop import schema"
        >
          {report.isValid ? (
            <ShieldCheck size={14} className="shrink-0" />
          ) : (
            <ShieldAlert size={14} className="shrink-0 text-rose-500 animate-bounce" />
          )}
          <span>PBI Validator</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold ${
            report.isValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {report.score}%
          </span>
        </button>
      </div>

      {/* Main interactive files viewport splitter */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {activeFile === "validation_report" ? (
          /* ========================================================== */
          /* POWER BI DESKTOP SCHEMA VALIDATOR DASHBOARD */
          /* ========================================================== */
          <div className="flex-1 flex flex-col min-h-0 bg-[#fafbfe]">
            {/* Validation Dashboard Header */}
            <div className="bg-white p-4 border-b border-gray-100 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-sans border shadow-xs ${getScoreColor(report.score)}`}>
                  <span className="text-lg leading-none">{getScoreGrade(report.score)}</span>
                  <span className="text-[9px] uppercase tracking-wide opacity-80 mt-0.5">Grade</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <span>Power BI Desktop Readiness</span>
                    <Sparkles size={12} className="text-indigo-500" />
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {report.isValid 
                      ? "Visual fits import standards. Ready for desktop ingestion!" 
                      : `Found ${stats.error} blocking errors preventing successful Desktop execution.`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleManualScan}
                disabled={isValidating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw size={11} className={`shrink-0 ${isValidating ? "animate-spin" : ""}`} />
                <span>{isValidating ? "Scanning..." : "Re-Scan Project"}</span>
              </button>
            </div>

            {/* Filter Pills list */}
            <div className="bg-white/60 px-4 py-2 border-b border-gray-100 shrink-0 flex items-center gap-2 text-[10px]">
              <span className="text-slate-400 font-medium mr-1 font-mono uppercase tracking-wider text-[9px]">Filters:</span>
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  activeFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                All ({stats.all})
              </button>
              <button
                onClick={() => setActiveFilter("error")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === "error" 
                    ? "bg-rose-600 text-white" 
                    : stats.error > 0 
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <XCircle size={10} />
                <span>Errors ({stats.error})</span>
              </button>
              <button
                onClick={() => setActiveFilter("warning")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === "warning" 
                    ? "bg-amber-500 text-white" 
                    : stats.warning > 0 
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-400 opacity-60"
                }`}
              >
                <AlertTriangle size={10} />
                <span>Warnings ({stats.warning})</span>
              </button>
              <button
                onClick={() => setActiveFilter("success")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === "success" ? "bg-emerald-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                <CheckCircle size={10} />
                <span>Passed ({stats.success})</span>
              </button>
            </div>

            {/* Scrollable Report Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-slate-400 text-[11px] space-y-1">
                  <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No issues of this category found.</p>
                  <p>All scanned requirements are fully compliant with Power BI requirements.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItem === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className={`bg-white rounded-xl border transition-all cursor-pointer select-none text-[11px] hover:border-slate-300 ${
                        item.type === "error" 
                          ? "border-rose-100 hover:shadow-xs" 
                          : item.type === "warning" 
                          ? "border-amber-100 hover:shadow-xs" 
                          : "border-slate-100"
                      }`}
                    >
                      {/* Card Content Row */}
                      <div className="p-3.5 flex gap-3 items-start">
                        {item.type === "error" && (
                          <XCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                        )}
                        {item.type === "warning" && (
                          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        )}
                        {item.type === "success" && (
                          <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-800">{item.title}</span>
                            <span className="text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Expandable Technical Details Drawer */}
                      {item.details && (
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-60 border-t border-slate-100" : "max-h-0"}`}>
                          <div className="p-3.5 bg-slate-50/60 text-[10.5px] font-sans leading-relaxed text-slate-600">
                            <div className="font-bold text-slate-700 mb-1">Developer Recommendation:</div>
                            <p>{item.details}</p>
                            <div className="mt-2 text-[9px] font-mono text-slate-400 bg-white border border-slate-100 p-2 rounded-lg">
                              SYSTEM CHECK ID: {item.id}
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
        ) : (
          /* ========================================================== */
          /* STANDARD DIRECT CODE EDITOR CONTAINER */
          /* ========================================================== */
          <div className="flex-1 flex flex-col min-h-0 bg-white relative group">
            {/* Editor control headers */}
            <div className="bg-[#f9fafb] px-3.5 py-1.5 flex justify-between items-center text-[9px] uppercase font-mono tracking-widest border-b border-gray-100 text-gray-450 text-gray-400 shrink-0">
              <span>Editable Work Environment</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>UTF-8 TypeScript Ready</span>
              </div>
            </div>

            <div className="flex-1 relative min-h-0 p-3 overflow-y-auto bg-white">
              {/* PlainText Textarea Custom Code Editor */}
              <textarea
                value={files[activeFile]}
                onChange={(e) => onChangeFile(activeFile, e.target.value)}
                spellCheck="false"
                className="absolute inset-2 bg-[#fdfdfd] text-[11px] font-mono text-gray-800 p-4 border border-gray-100 rounded-xl outline-none focus:border-black/30 resize-none h-[calc(100%-16px)] w-[calc(100%-16px)] leading-relaxed select-text shadow-xs scrollbar-thin"
                placeholder={`Write standard pbiviz code for ${activeFile}...`}
              />
            </div>
          </div>
        )}

        {/* Informational Guidelines / Explanations panel (Right Rail) */}
        <div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-gray-100 p-4 shrink-0 flex flex-col justify-between text-xs overflow-y-auto">
          <div>
            {activeFile === "validation_report" ? (
              /* ========================================================== */
              /* VALIDATION INFO SUMMARY SIDEBAR */
              /* ========================================================== */
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-600 shrink-0" />
                  <h4 className="font-bold text-gray-700 uppercase tracking-widest text-[10px] font-mono">
                    Compliance Specs
                  </h4>
                </div>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Power BI Custom Visual API has rigorous binding conventions. A property mismount in typescript vs capabilities.json will lead to formatting card failures or visual loading crash on import.
                </p>

                <div className="border border-indigo-100 bg-[#fbfbfe] p-3 rounded-xl text-[10.5px] space-y-2.5 text-indigo-950 font-sans">
                  <div className="flex gap-1.5 items-center font-bold text-indigo-900">
                    <HelpCircle size={13} className="text-indigo-500 shrink-0" />
                    <span>Key Power BI Rules:</span>
                  </div>
                  <div className="space-y-1.5 text-indigo-900/80">
                    <p>
                      <strong>1. Matching Class Name:</strong> Your visual.ts must define the exact class listed under <code>visualClassName</code> in pbiviz.json.
                    </p>
                    <p>
                      <strong>2. No Missing Enumeration:</strong> Every formatting object defined in capabilities.json needs an explicit mapping inside <code>enumerateObjectInstances()</code> to render in desktop formatting pane.
                    </p>
                    <p>
                      <strong>3. Fill Formatting:</strong> Color values MUST be mapped as <code>{`{ solid: { color: val } }`}</code> rather than simple hex string literals.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 p-3 rounded-xl text-[10.5px] text-slate-500 space-y-1 font-sans">
                  <div className="font-bold text-slate-700 mb-0.5">Visual Grading Criteria:</div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span className="font-bold text-rose-600 font-mono">-20 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warnings:</span>
                    <span className="font-bold text-amber-600 font-mono">-5 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perfect Synchrony:</span>
                    <span className="font-bold text-emerald-600 font-mono">100% (A+)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================== */
              /* STANDARD FILE INFO SIDEBAR */
              /* ========================================================== */
              <>
                <div className="flex items-center gap-2 mb-3.5">
                  <Info size={14} className="text-gray-400 shrink-0" />
                  <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[10px] font-mono">
                    File Explanation
                  </h4>
                </div>
                <p className="text-gray-600 leading-relaxed font-sans mb-4 text-[11px]">
                  {fileDescriptions[activeFile as keyof VisualProjectFiles]}
                </p>

                {/* Educational guide list */}
                <div className="border border-gray-100 bg-[#f9fafb] p-3.5 rounded-xl text-[11px] space-y-2 text-gray-500 font-sans">
                  <div className="flex gap-2 text-gray-700 font-semibold mb-1">
                    <AlertCircle size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>Compilation Rules:</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-black font-bold">•</span>
                    <span>Do not rename files, powerbi-visuals-tools expects this directory format.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-black font-bold">•</span>
                    <span>The class name inside <code>visual.ts</code> must exactly match <code>visualClassName</code> in <code>pbiviz.json</code>.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-black font-bold">•</span>
                    <span>All imported D3 selections should use relative declarations.</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-450 text-gray-400 tracking-wider flex items-center justify-between">
            <span>API VERSION: <strong className="text-gray-900 font-mono">v5.3.0</strong></span>
            {activeFile === "validation_report" && (
              <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                <span>Healthy</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

