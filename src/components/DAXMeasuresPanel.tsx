import React, { useState } from "react";
import { DAXMeasure, PowerBIVisualSettings } from "../types";
import { Plus, Trash2, Calculator, Info, HelpCircle } from "lucide-react";

interface DAXMeasuresPanelProps {
  settings: PowerBIVisualSettings;
  onChange: (measures: DAXMeasure[]) => void;
}

export function parseDaxInput(input: string): { name?: string; formula: string } {
  const trimmed = (input || "").trim();
  // Match pattern: Name = ... or [Name] = ... or 'Name' = ...
  // where Name is alphanumeric/spaces, and there's no parenthesis before the '='
  const eqIdx = trimmed.indexOf("=");
  const parenIdx = trimmed.indexOf("(");
  
  if (eqIdx !== -1 && (parenIdx === -1 || eqIdx < parenIdx)) {
    const left = trimmed.substring(0, eqIdx).trim();
    const right = trimmed.substring(eqIdx + 1).trim();
    
    // Clean left side name: remove quotes or brackets
    const name = left.replace(/^['"\[]|['"\]]$/g, "").trim();
    if (name && right) {
      return { name, formula: right };
    }
  }
  return { formula: trimmed };
}

export const DAXMeasuresPanel: React.FC<DAXMeasuresPanelProps> = ({ settings, onChange }) => {
  const measures = settings.daxMeasures || [];
  const [newMeasureName, setNewMeasureName] = useState("");
  const [templateType, setTemplateType] = useState<"avg" | "sum" | "custom">("avg");
  const [customFormula, setCustomFormula] = useState("([Actual] + [Budget]) / 2");
  const [error, setError] = useState<string | null>(null);

  const getFormulaForType = (type: "avg" | "sum" | "custom", typedVal?: string) => {
    if (type === "avg") return "AVERAGE([Actual], [Budget])";
    if (type === "sum") return "[Actual] + [Budget]";
    return typedVal || customFormula;
  };

  const handleTemplateChange = (type: "avg" | "sum" | "custom") => {
    setTemplateType(type);
    if (type === "avg") {
      setCustomFormula("AVERAGE([Actual], [Budget])");
    } else if (type === "sum") {
      setCustomFormula("[Actual] + [Budget]");
    } else {
      setCustomFormula("([Actual] * 1.15) - [Budget]");
    }
  };

  const handleAddMeasure = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const inputFormula = getFormulaForType(templateType).trim();
    if (templateType === "custom" && !inputFormula) {
      setError("Please specify a calculation formula expression.");
      return;
    }

    const parsed = parseDaxInput(inputFormula);
    const finalFormula = parsed.formula.trim();
    const finalName = (newMeasureName.trim() || parsed.name || "").trim();

    if (!finalName) {
      setError("Please provide a name for the DAX measure (either in the Title field or as 'Name = Formula').");
      return;
    }

    if (measures.some(m => m.name.toLowerCase() === finalName.toLowerCase())) {
      setError(`A column or measure named "${finalName}" already exists.`);
      return;
    }

    // Basic formula check for references
    if (templateType === "custom") {
      const allowedKeywords = [
        "[Actual]", "[Budget]", "[Sales]", "[Variance]", "[Profit]", "[VariancePct]",
        "[Account Code]", "[AccountCode]", "[Code]", "[Account]", "[Category]", "[Name]",
        "[Description]", "[Account Name]", "[AccountName]"
      ];
      const hasKeyword = allowedKeywords.some(keyword => 
        finalFormula.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        setError("Custom formulas must reference a table column or attribute (e.g., [Actual], [Budget], or [Account Code]).");
        return;
      }
    }

    const newMeasure: DAXMeasure = {
      id: "dax-" + Date.now(),
      name: finalName,
      formula: finalFormula,
      expressionType: templateType
    };

    onChange([...measures, newMeasure]);
    setNewMeasureName("");
    setTemplateType("avg");
    setCustomFormula("AVERAGE([Actual], [Budget])");
  };

  const handleDeleteMeasure = (id: string) => {
    onChange(measures.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Introduction Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700/50 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="text-[#f2c811]" size={16} />
          <span className="font-bold text-xs uppercase tracking-wider font-mono">Simulated DAX Measures</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
          Create live computed business metrics using standard DAX formulas. Added measures automatically attach as active interactive columns in the financial matrix table reporting canvas.
        </p>
      </div>

      {/* Current Active Columns / Measures List */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-xs">
        <span className="font-bold text-gray-800 flex items-center gap-1 text-[11px]">
          <span>Active DAX Calculated Columns</span>
          <span className="bg-slate-100 text-slate-750 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
            {measures.length} COLUMNS
          </span>
        </span>

        {measures.length === 0 ? (
          <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-150 text-gray-400">
            <p className="font-medium text-[11px]">No custom DAX measures added yet.</p>
            <p className="text-[10px] text-gray-400 mt-1">Use the builder below to add calculations.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
            {measures.map((m) => (
              <div 
                key={m.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                id={`dax-item-${m.id}`}
              >
                <div className="space-y-1 pr-2 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 truncate block">
                      {m.name}
                    </span>
                    <span className={`text-[8px] px-1 py-0.2 rounded-md uppercase font-bold font-mono ${
                      m.expressionType === "avg" 
                        ? "bg-amber-100 text-amber-800" 
                        : m.expressionType === "sum"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {m.expressionType}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 font-medium truncate py-0.5 bg-slate-100/50 rounded px-1.5 w-fit border border-slate-150/50">
                    {m.formula}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMeasure(m.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-1 focus:outline-none"
                  title="Remove DAX calculated column"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder Form Card */}
      <form onSubmit={handleAddMeasure} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3.5 shadow-xs">
        <span className="font-bold text-gray-800 block text-[11px]">Create Calculated Columns</span>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] rounded-lg font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Measure Name */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-gray-405 text-gray-400 font-mono">Column Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Total Revenue Cost, Average, etc."
            value={newMeasureName}
            onChange={(e) => setNewMeasureName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 focus:border-black rounded-lg px-3 py-2 outline-none font-sans text-gray-800 font-medium text-xs transition-all"
          />
        </div>

        {/* Templates Select segment */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-gray-405 text-gray-400 font-mono">Predefined DAX Formula</label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-150/70">
            <button
              type="button"
              onClick={() => handleTemplateChange("avg")}
              className={`py-1.5 rounded-md transition-all cursor-pointer font-bold text-[10px] ${
                templateType === "avg" ? "bg-white text-slate-800 shadow-xs border border-gray-200/50 font-bold" : "text-gray-400 hover:text-gray-700 font-medium"
              }`}
            >
              Average Sum
            </button>
            <button
              type="button"
              onClick={() => handleTemplateChange("sum")}
              className={`py-1.5 rounded-md transition-all cursor-pointer font-bold text-[10px] ${
                templateType === "sum" ? "bg-white text-slate-800 shadow-xs border border-gray-200/50 font-bold" : "text-gray-400 hover:text-gray-700 font-medium"
              }`}
            >
              Sum Total
            </button>
            <button
              type="button"
              onClick={() => handleTemplateChange("custom")}
              className={`py-1.5 rounded-md transition-all cursor-pointer font-bold text-[10px] ${
                templateType === "custom" ? "bg-white text-slate-800 shadow-xs border border-gray-200/50 font-bold" : "text-gray-400 hover:text-gray-700 font-medium"
              }`}
            >
              Custom DAX
            </button>
          </div>
        </div>

        {/* Formula Input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-gray-405 text-gray-400 font-mono">DAX Expression Editor</label>
          <div className="relative">
            <textarea
              readOnly={templateType !== "custom"}
              value={templateType === "custom" ? customFormula : getFormulaForType(templateType)}
              onChange={(e) => setCustomFormula(e.target.value)}
              placeholder="e.g. ([Actual] + [Budget]) / 2"
              className={`w-full font-mono text-[10px] border rounded-lg px-3 py-2 outline-none h-16 transition-all ${
                templateType === "custom" 
                  ? "bg-slate-950 text-slate-205 text-slate-100 border-indigo-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500" 
                  : "bg-gray-50 border-gray-150 text-gray-400 select-none cursor-not-allowed"
              }`}
            />
            {templateType === "custom" && (
              <span className="absolute bottom-1 right-2 font-mono text-[8px] bg-indigo-500 text-white px-1 rounded uppercase tracking-wider font-extrabold shadow-sm select-none animate-pulse">
                Custom Edit Mode
              </span>
            )}
          </div>
          <div className="text-[10px] leading-relaxed text-gray-400 space-y-1 bg-yellow-50/50 border border-yellow-100 p-2.5 rounded-lg flex items-start gap-1.5">
            <Info size={13} className="text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <span>DAX columns evaluate formula expressions dynamically matching standard accounts. Reference either <strong>[Actual]</strong> or <strong>[Budget]</strong> as your numeric metrics input.</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-slate-900 border border-slate-955 text-white hover:bg-slate-950 transition-all font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          id="dax-add-btn"
        >
          <Plus size={13} />
          <span>Add Calculated Column</span>
        </button>
      </form>
    </div>
  );
};
