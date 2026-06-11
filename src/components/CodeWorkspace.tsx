import React, { useState } from "react";
import { VisualProjectFiles } from "../types";
import { Folder, FileCode, Copy, Check, RotateCcw, AlertCircle, Info, Edit, ArrowRight } from "lucide-react";

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
  const [activeFile, setActiveFile] = useState<keyof VisualProjectFiles>("src/visual.ts");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileDescriptions: Record<keyof VisualProjectFiles, string> = {
    "src/visual.ts": "This is the primary visual entry point. Power BI compiles this class, maps construction options (options.element) and executes update() sequentially whenever data values, filters, size parameters or visual formatting settings change.",
    "capabilities.json": "Defines what input buckets (e.g. Category, Values) appear in the metadata field well, maps how Power BI structures values categorical layouts, and declares setting formatting properties.",
    "style/visual.less": "Hosts standard CSS or LESS styling directives mapped exclusively for styling visual nodes. This is automatically bundled into the compiled Power BI package.",
    "pbiviz.json": "The main packaging manifest declaring model parameters, UUID identifiers, major Visual API guidelines, styling points, directories, and package schemas.",
    "package.json": "Declares powerbi-visuals-api libraries, d3-selection requirements, and other typescript compilables loaded for building the visual package.",
    "tsconfig.json": "Standard TypeScript configurations ensuring the package correctly parses es2015 outputs for seamless cross-browser compatibility inside Power BI."
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs list (custom horizontal slider with custom icons) */}
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
      </div>

      {/* Main interactive files viewport splitter */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Code editor view container */}
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

        {/* Informational Guidelines / Explanations panel */}
        <div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-gray-100 p-4 shrink-0 flex flex-col justify-between text-xs overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <Info size={14} className="text-gray-450 text-gray-400 shrink-0" />
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[10px] font-mono">
                File Explanation
              </h4>
            </div>
            <p className="text-gray-600 leading-relaxed font-sans mb-4 text-[11px]">
              {fileDescriptions[activeFile]}
            </p>

            {/* Educational guide list */}
            <div className="border border-gray-100 bg-[#f9fafb] p-3.5 rounded-xl text-[11px] space-y-2 text-gray-500 font-sans">
              <div className="flex gap-2 text-gray-750 text-gray-700 font-semibold mb-1">
                <AlertCircle size={13} className="text-gray-450 text-gray-400 shrink-0 mt-0.5" />
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
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400 tracking-wider">
            <span>CURRENT API VERSION: <strong className="text-gray-900 font-mono">v5.3.0</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
