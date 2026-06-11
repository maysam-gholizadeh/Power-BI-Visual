import React, { useState } from "react";
import { VisualProjectFiles, VisualTemplateType } from "../types";
import { Sparkles, MessageCircle, Send, ArrowRight, Loader2, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";

interface CopilotPanelProps {
  files: VisualProjectFiles;
  templateType: VisualTemplateType;
  onApplyChanges: (explanation: string, updatedFiles: Partial<VisualProjectFiles>) => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  files,
  templateType,
  onApplyChanges
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const quickPrompts = [
    {
      label: "Cosmic Glow Theme",
      prompt: "Change the default primary fill and accent colors to high-contrast neon cyan and cosmic violet gradients, with a rounded border.",
    },
    {
      label: "Support Legend Labels",
      prompt: "Modify visual.ts to render a nice categorical legend text label at the top with a subtle background box container.",
    },
    {
      label: "Add Tooltip support",
      prompt: "Implement standard Power BI hover tooltips in visual.ts that display the category name and formatting measure outputs when hovering.",
    }
  ];

  const handleCopilotSubmit = async (customPrompt: string) => {
    if (!customPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: customPrompt,
          files,
          templateType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to make contact with AI assistant.");
      }

      setExplanation(data.explanation);
      onApplyChanges(data.explanation, data.files);
      setPrompt("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected communication error occurred. Check your server status and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full [id='pbi-copilot-panel']">
      {/* Panel Header */}
      <div className="bg-slate-550/5 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">
              AI Visual Copilot
            </h4>
            <span className="text-[10px] text-slate-400 font-sans">Power BI SDK Specialist</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Gemini-3.5 Active</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-4 flex-1">
          {/* Introductory Greetings */}
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-150 p-3.5 rounded-xl leading-relaxed">
            <p className="font-sans">
              Hi! I am your <strong>Power BI Custom Visual Copilot</strong>. Describe any modification you want to apply to your visual project, and I will refactor your <code>visual.ts</code>, <code>style/visual.less</code>, and <code>capabilities.json</code> dynamically.
            </p>
          </div>

          {/* Quick Presets Prompt Grid */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quick Refactor Actions</h5>
            <div className="grid grid-cols-1 gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopilotSubmit(p.prompt)}
                  disabled={loading}
                  className="text-left text-xs bg-slate-50 hover:bg-slate-100/80 hover:border-slate-350 border border-slate-200 rounded-xl p-2.5 transition-all outline-none disabled:opacity-40 select-none flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-0.5 max-w-[90%]">
                    <span className="font-semibold text-slate-800 font-sans block text-[11px] group-hover:text-indigo-600 transition-colors">{p.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{p.prompt}</span>
                  </div>
                  <ArrowRight size={12} className="text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <div className="space-y-1">
                <span className="font-semibold block">Copilot Refactor Failed</span>
                <span className="block leading-relaxed text-[11px] text-rose-600">{error}</span>
                <span className="block text-[10px] text-rose-500 leading-normal mt-1.5 opacity-80">
                  Ensure you have defined your <strong>GEMINI_API_KEY</strong> environment variables inside Google AI Studio's top Settings secrets menu.
                </span>
              </div>
            </div>
          )}

          {/* Success explanation details */}
          {explanation && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl space-y-1 animate-fade-in shadow-xs">
              <span className="font-semibold flex items-center gap-1 text-[11px] uppercase tracking-wider text-emerald-900 font-mono">
                <Sparkles size={11} className="text-emerald-500" />
                <span>Refactor Success</span>
              </span>
              <p className="leading-relaxed text-[11px] text-emerald-850 font-sans">{explanation}</p>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-550/20 focus-within:border-indigo-400 transition-all shadow-md bg-slate-50">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="E.g. Add a light orange threshold line or increase padding between element values..."
            className="w-full bg-transparent px-3.5 py-3 outline-none text-xs text-slate-800 resize-none h-16 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCopilotSubmit(prompt);
              }
            }}
          />
          <div className="px-3.5 py-2 border-t border-slate-200/50 bg-white flex justify-between items-center text-[10px] text-slate-400 font-sans">
            <span>Press Enter to send</span>
            <button
              onClick={() => handleCopilotSubmit(prompt)}
              disabled={loading || !prompt.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white font-semibold flex items-center gap-1.5 cursor-pointer select-none transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={11} className="animate-spin text-white" />
                  <span>Refactoring...</span>
                </>
              ) : (
                <>
                  <Send size={11} />
                  <span>Execute Refactor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
