import React from "react";
import { Sparkles, Palette, HelpCircle, FileSpreadsheet, LayoutGrid, Type, Rows, Settings, Eye, Search } from "lucide-react";
import { PowerBIVisualSettings, VisualTemplateType } from "../types";

interface PowerBIFormatPaneProps {
  currentSettings: PowerBIVisualSettings;
  activeTemplate: VisualTemplateType;
  setSettingsMap: React.Dispatch<React.SetStateAction<Record<VisualTemplateType, PowerBIVisualSettings>>>;
  openFxConfig: (property: string, label: string) => void;
  formatSubTab: "visual" | "general";
  setFormatSubTab: (tab: "visual" | "general") => void;
  formatSearchQuery: string;
  setFormatSearchQuery: (query: string) => void;
  expandedSections: Record<string, boolean>;
  setExpandedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setActiveTab: (tab: string) => void;
}

export const PowerBIFormatPane: React.FC<PowerBIFormatPaneProps> = ({
  currentSettings,
  activeTemplate,
  setSettingsMap,
  openFxConfig,
  formatSubTab,
  setFormatSubTab,
  formatSearchQuery,
  setFormatSearchQuery,
  expandedSections,
  setExpandedSections,
  setActiveTab,
}) => {
  // Helper to update settings
  const updateSetting = <K extends keyof PowerBIVisualSettings>(key: K, value: PowerBIVisualSettings[K]) => {
    setSettingsMap((prev) => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [key]: value,
      },
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const matchesSearch = (text: string) => {
    if (!formatSearchQuery) return true;
    return text.toLowerCase().includes(formatSearchQuery.toLowerCase());
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans select-none">
      {/* Power BI Styled Formatting Pane Header */}
      <div className="border-b border-slate-200 pb-3 mb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visualizations</h3>
            <p className="text-[11px] text-slate-500 font-semibold">Format visual</p>
          </div>
          
          {/* Power BI tab switcher icons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("fields")}
              className="p-1.5 rounded hover:bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Build visual (Fields)"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("format")}
              className="p-1.5 rounded bg-white text-[#007a5c] font-bold shadow-3xs cursor-pointer"
              title="Format visual (Active Paintbrush)"
            >
              <Palette size={13} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className="p-1.5 rounded hover:bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Conditional formatting rules"
            >
              <Sparkles size={13} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-2.5">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search size={11} />
          </span>
          <input
            type="text"
            value={formatSearchQuery}
            onChange={(e) => setFormatSearchQuery(e.target.value)}
            placeholder="Search formatting (e.g. padding, grid, scale)"
            className="w-full pl-7 pr-7 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-[#007a5c] focus:ring-1 focus:ring-[#007a5c]/10 outline-none text-slate-700 font-semibold transition-all"
          />
          {formatSearchQuery && (
            <button
              onClick={() => setFormatSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sub-tabs for Power BI: Visual and General */}
        <div className="flex gap-4 border-b border-slate-150 mt-3 pb-0">
          <button
            type="button"
            onClick={() => setFormatSubTab("visual")}
            className={`pb-1.5 text-xs font-bold relative cursor-pointer transition-colors ${
              formatSubTab === "visual"
                ? "text-[#007a5c] font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Visual
            {formatSubTab === "visual" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#007a5c] rounded-t-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setFormatSubTab("general")}
            className={`pb-1.5 text-xs font-bold relative cursor-pointer transition-colors ${
              formatSubTab === "general"
                ? "text-[#007a5c] font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            General
            {formatSubTab === "general" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#007a5c] rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Accordion list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 pb-8 max-h-[500px]">
        {formatSubTab === "visual" ? (
          // ================== VISUAL TAB ==================
          <div className="space-y-2">
            
            {/* 1. License Information */}
            {matchesSearch("license profitbase matrix v5.3 status pro licensed validation") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("license")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.license || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">License Information</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded border border-emerald-150">PRO</span>
                </div>
                {(expandedSections.license || formatSearchQuery) && (
                  <div className="p-2.5 space-y-2 text-[10.5px] text-slate-600 bg-white">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Visual Engine:</span>
                      <span className="font-bold text-slate-800">Profitbase Matrix Custom Visual v5.3</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Enterprise Status:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-0.5">✔ Active Validated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Support Expiry:</span>
                      <span className="font-semibold text-slate-700">2028-12-31</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Download as Excel */}
            {matchesSearch("download as excel export genuine xlsx spreadsheet toolbar button") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("download")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.download || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Download as Excel</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("enableDownloadAsExcel", !currentSettings.enableDownloadAsExcel);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.enableDownloadAsExcel !== false ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.enableDownloadAsExcel !== false ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.download || formatSearchQuery) && (
                  <div className="p-2.5 bg-white text-[10.5px] text-slate-500 leading-relaxed">
                    Provides a standard, native Excel XLSX export capability. When active, a green <span className="font-semibold text-emerald-600">Export to Excel</span> spreadsheet button renders in the visual sandbox top bar.
                  </div>
                )}
              </div>
            )}

            {/* 3. Commenting */}
            {matchesSearch("commenting notes commentary column inline financial annotations") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("commenting")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.commenting || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Commenting</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("showCommentary", !currentSettings.showCommentary);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.showCommentary ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.showCommentary ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.commenting || formatSearchQuery) && (
                  <div className="p-2.5 bg-white text-[10.5px] text-slate-500 leading-relaxed">
                    Appends an interactive "Commentary" text column to the right side of the matrix. Clicking cell icons opens popups that write to persistence so financial annotations appear inline.
                  </div>
                )}
              </div>
            )}

            {/* 4. Sort By */}
            {matchesSearch("sort by ordering sorting column click headers interactive ranking") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("sort")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.sort || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Sort by</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("enableSorting", !currentSettings.enableSorting);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.enableSorting ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.enableSorting ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.sort || formatSearchQuery) && (
                  <div className="p-2.5 bg-white text-[10.5px] text-slate-500 leading-relaxed">
                    Adds sort triggers to column headers. Clicking column titles sorts nested categories ascending/descending within their hierarchy bounds.
                  </div>
                )}
              </div>
            )}

            {/* 5. Search Row */}
            {matchesSearch("search filter text account query visual row input") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("search")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.search || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Search</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("enableVisualSearch", !currentSettings.enableVisualSearch);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.enableVisualSearch ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.enableVisualSearch ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.search || formatSearchQuery) && (
                  <div className="p-2.5 bg-white text-[10.5px] text-slate-500 leading-relaxed">
                    Displays an interactive text search bar immediately above the table grid, dynamically filtering row classifications.
                  </div>
                )}
              </div>
            )}

            {/* 6. Group Button */}
            {matchesSearch("group button expand collapse all chevrons header toggles") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("group")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.group || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Group button</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("showGroupExpand", !currentSettings.showGroupExpand);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.showGroupExpand !== false ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.showGroupExpand !== false ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.group || formatSearchQuery) && (
                  <div className="p-2.5 bg-white text-[10.5px] text-slate-500 leading-relaxed">
                    Configures the visual headers with an easy, bulk Expand/Collapse multi-level accordion control button group.
                  </div>
                )}
              </div>
            )}

            {/* 7. Grid */}
            {matchesSearch("grid cell gridlines gridline color row padding height padding mode value density row height") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("grid")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.grid || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Grid</span>
                  </div>
                </div>
                {(expandedSections.grid || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3 text-[10.5px] text-slate-600">
                    {/* Toggle gridlines */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Show Cell Gridlines</span>
                      <input
                        type="checkbox"
                        checked={currentSettings.showGridLines !== false}
                        onChange={(e) => updateSetting("showGridLines", e.target.checked)}
                        className="rounded border-slate-300 text-[#007a5c] focus:ring-[#007a5c] w-3.5 h-3.5"
                      />
                    </div>

                    {/* Gridlines color picker */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Gridline Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.gridLineColor || "#e2e8f0"}
                          onChange={(e) => updateSetting("gridLineColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.gridLineColor || "#E2E8F0"}</span>
                      </div>
                    </div>

                    {/* Row Padding Selection */}
                    <div className="space-y-1">
                      <span className="font-medium block">Row Padding Matrix Density</span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                        {(["compact", "cozy", "spacious"] as const).map((pad) => (
                          <button
                            key={pad}
                            type="button"
                            onClick={() => updateSetting("rowPadding", pad)}
                            className={`py-0.5 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                              currentSettings.rowPadding === pad
                                ? "bg-white text-slate-900 shadow-3xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {pad === "compact" ? "Dense" : pad === "cozy" ? "Cozy" : "Luxe"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row Height Options */}
                    <div className="space-y-1">
                      <span className="font-medium block">Row Height Mode</span>
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                        {(["auto", "fixed"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateSetting("rowHeightMode", mode)}
                            className={`py-0.5 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                              currentSettings.rowHeightMode === mode
                                ? "bg-white text-slate-900 shadow-3xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {mode === "auto" ? "Auto-Fit" : "Fixed (px)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentSettings.rowHeightMode === "fixed" && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500">Height (px)</span>
                        <input
                          type="number"
                          min="10"
                          max="120"
                          value={currentSettings.rowHeightValue || 36}
                          onChange={(e) => {
                            const val = Math.max(10, parseInt(e.target.value, 10) || 10);
                            updateSetting("rowHeightValue", val);
                          }}
                          className="w-16 text-right bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-bold text-slate-700 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 8. Column Headers */}
            {matchesSearch("column headers bg color text color header background header styling") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("columnHeaders")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.columnHeaders || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Column headers</span>
                  </div>
                </div>
                {(expandedSections.columnHeaders || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-2.5 text-[10.5px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Background Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.headerBgColor || "#f8fafc"}
                          onChange={(e) => updateSetting("headerBgColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.headerBgColor || "#F8FAFC"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Text Color</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.headerTextColor || "#1e293b"}
                          onChange={(e) => updateSetting("headerTextColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.headerTextColor || "#1E293B"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 9. Column Expansion */}
            {matchesSearch("column expansion caret expand collapse parent child highlight bg color text styling") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("columnExpansion")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.columnExpansion || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Column expansion</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("enableColumnExpansion", !currentSettings.enableColumnExpansion);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.enableColumnExpansion !== false ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.enableColumnExpansion !== false ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.columnExpansion || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3.5 text-[10.5px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Highlight Expanded Levels</span>
                      <input
                        type="checkbox"
                        checked={currentSettings.enableExpandedHighlight || false}
                        onChange={(e) => updateSetting("enableExpandedHighlight", e.target.checked)}
                        className="rounded border-slate-300 text-[#007a5c] focus:ring-[#007a5c] w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>

                    {currentSettings.enableExpandedHighlight && (
                      <div className="space-y-2 border-t pt-2 border-slate-100">
                        <span className="font-bold text-[9px] uppercase tracking-wider text-[#007a5c] block">Expanded Category Colors</span>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Parent Background</span>
                          <input
                            type="color"
                            value={currentSettings.expandedParentBgColor || "#f8fafc"}
                            onChange={(e) => updateSetting("expandedParentBgColor", e.target.value)}
                            className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Parent Text</span>
                          <input
                            type="color"
                            value={currentSettings.expandedParentTextColor || "#0f172a"}
                            onChange={(e) => updateSetting("expandedParentTextColor", e.target.value)}
                            className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Child Background</span>
                          <input
                            type="color"
                            value={currentSettings.expandedChildBgColor || "#ffffff"}
                            onChange={(e) => updateSetting("expandedChildBgColor", e.target.value)}
                            className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Child Text</span>
                          <input
                            type="color"
                            value={currentSettings.expandedChildTextColor || "#475569"}
                            onChange={(e) => updateSetting("expandedChildTextColor", e.target.value)}
                            className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 10. Column Styles */}
            {matchesSearch("column styles column widths auto fit column width value pixels") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("columnStyles")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.columnStyles || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Column styles</span>
                  </div>
                </div>
                {(expandedSections.columnStyles || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3.5 text-[10.5px] text-slate-600">
                    <div className="space-y-1">
                      <span className="font-medium block">Column Width Mode</span>
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                        {(["auto", "fixed"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => updateSetting("columnWidthMode", mode)}
                            className={`py-0.5 rounded text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                              currentSettings.columnWidthMode === mode
                                ? "bg-white text-slate-900 shadow-3xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {mode === "auto" ? "Auto-Fit" : "Fixed Width"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentSettings.columnWidthMode === "fixed" && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500">Fixed Width (px)</span>
                        <input
                          type="number"
                          min="40"
                          max="400"
                          value={currentSettings.columnWidthValue || 120}
                          onChange={(e) => {
                            const val = Math.max(40, parseInt(e.target.value, 10) || 40);
                            updateSetting("columnWidthValue", val);
                          }}
                          className="w-16 text-right bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-bold text-slate-700 outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // ================== GENERAL TAB ==================
          <div className="space-y-2">
            
            {/* 1. Title */}
            {matchesSearch("title reporting show title title background title text color header") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("title")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.title || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Title</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSetting("showTitle", !currentSettings.showTitle);
                    }}
                    className={`relative inline-flex h-4 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none ${
                      currentSettings.showTitle ? "bg-[#007a5c]" : "bg-slate-300"
                    }`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-xs ${
                      currentSettings.showTitle ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {(expandedSections.title || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3 text-[10.5px] text-slate-600">
                    <div className="space-y-1">
                      <span className="font-medium block">Title Text Content</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={currentSettings.titleText || ""}
                          onChange={(e) => updateSetting("titleText", e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10.5px] outline-none font-medium focus:border-[#007a5c]"
                          placeholder="Financial Reporting Matrix"
                        />
                        <button
                          type="button"
                          onClick={() => openFxConfig("titleText", "Dynamic Title Text")}
                          className="px-1.5 rounded border border-slate-200 hover:border-indigo-600 bg-slate-50 text-indigo-600 font-bold hover:bg-slate-100 transition-colors"
                          title="DAX Formatting (fx)"
                        >
                          fx
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Background Color</span>
                        <button onClick={() => openFxConfig("titleBgColor", "Title Background Override")} className="text-indigo-600 text-[9px] font-bold font-mono hover:underline">(fx)</button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.titleBgColor || "#f1f5f9"}
                          onChange={(e) => updateSetting("titleBgColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.titleBgColor || "#F1F5F9"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Text Color</span>
                        <button onClick={() => openFxConfig("titleTextColor", "Title Text Override")} className="text-indigo-600 text-[9px] font-bold font-mono hover:underline">(fx)</button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.titleTextColor || "#1e293b"}
                          onChange={(e) => updateSetting("titleTextColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.titleTextColor || "#1E293B"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Canvas / Background */}
            {matchesSearch("canvas background theme palette light dark slate sepia font family font size accent border color") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("canvas")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.canvas || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Canvas / Background</span>
                  </div>
                </div>
                {(expandedSections.canvas || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3.5 text-[10.5px] text-slate-600">
                    <div className="space-y-1">
                      <span className="font-medium block">Theme Palette</span>
                      <div className="grid grid-cols-4 gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                        {(["light", "dark", "slate", "sepia"] as const).map((theme) => (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => updateSetting("selectedTheme", theme)}
                            className={`py-0.5 rounded text-[9.5px] font-bold uppercase cursor-pointer transition-all ${
                              currentSettings.selectedTheme === theme
                                ? "bg-white text-slate-900 shadow-3xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-medium block">Typeface Family</span>
                      <select
                        value={currentSettings.fontFamily || "sans"}
                        onChange={(e) => updateSetting("fontFamily", e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-750 font-medium focus:border-[#007a5c]"
                      >
                        <option value="sans">Inter (Sans-serif)</option>
                        <option value="display">Space Jakarta (Display)</option>
                        <option value="mono">JetBrains Mono (Technical)</option>
                        <option value="serif">Georgia (Classic Serif)</option>
                        <option value="segoe">Segoe Condensed (Legacy BI)</option>
                        <option value="aptos">Aptos (Modern Office)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-medium">
                        <span>Core Font Size</span>
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1 rounded">{currentSettings.fontSize || 11}px</span>
                      </div>
                      <input
                        type="range"
                        min="9"
                        max="16"
                        step="1"
                        value={currentSettings.fontSize || 11}
                        onChange={(e) => updateSetting("fontSize", parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-slate-100 rounded accent-[#007a5c] cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Active Category Accent</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.accentColor || "#0f172a"}
                          onChange={(e) => updateSetting("accentColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.accentColor || "#0F172A"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Outer Board Border</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={currentSettings.borderColor || "#e2e8f0"}
                          onChange={(e) => updateSetting("borderColor", e.target.value)}
                          className="w-5 h-5 border-0 p-0 rounded bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[9px] uppercase text-slate-400">{currentSettings.borderColor || "#E2E8F0"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Scale Units */}
            {matchesSearch("scale units thousands millions whole number scaling units financial reports") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("scaleUnits")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.scaleUnits || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Scale units</span>
                  </div>
                </div>
                {(expandedSections.scaleUnits || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-1.5 text-[10.5px] text-slate-600">
                    <span className="font-medium block">Scaling Division Formatter</span>
                    <select
                      value={currentSettings.formatStyle || "whole"}
                      onChange={(e) => updateSetting("formatStyle", e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-750 font-medium focus:border-[#007a5c]"
                    >
                      <option value="whole">Whole Numbers (Default)</option>
                      <option value="thousand">Thousands (Scaled to K)</option>
                      <option value="million">Millions (Scaled to M)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 4. Header Icons & Tooltips */}
            {matchesSearch("header icons tooltips show hover details empty leaf expand caret") && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-3xs">
                <div
                  onClick={() => toggleSection("headerIcons")}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 select-none bg-slate-50/25 font-semibold text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[8px]">{expandedSections.headerIcons || formatSearchQuery ? "▼" : "▶"}</span>
                    <span className="text-slate-700">Header Icons & Tooltips</span>
                  </div>
                </div>
                {(expandedSections.headerIcons || formatSearchQuery) && (
                  <div className="p-2.5 bg-white space-y-3 text-[10.5px] text-slate-600 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Show Tooltips on Hover</span>
                      <input
                        type="checkbox"
                        checked={currentSettings.showTooltip !== false}
                        onChange={(e) => updateSetting("showTooltip", e.target.checked)}
                        className="rounded border-slate-300 text-[#007a5c] focus:ring-[#007a5c] w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Auto-Hide Leaf Expand Bullet</span>
                      <input
                        type="checkbox"
                        checked={currentSettings.hideEmptyExpand || false}
                        onChange={(e) => updateSetting("hideEmptyExpand", e.target.checked)}
                        className="rounded border-slate-300 text-[#007a5c] focus:ring-[#007a5c] w-3.5 h-3.5 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
