import React, { useState } from "react";
import { PowerBIDataConfig, PowerBIDataRow } from "../types";
import { Plus, Trash2, Database, Table, Code, Info, ArrowRight } from "lucide-react";

interface DataPanelProps {
  dataConfig: PowerBIDataConfig;
  onChange: (newConfig: PowerBIDataConfig) => void;
  showSecondary: boolean;
}

export const PowerBIDataPanel: React.FC<DataPanelProps> = ({
  dataConfig,
  onChange,
  showSecondary
}) => {
  const [activeTab, setActiveTab] = useState<"table" | "dataview">("table");

  const handleRowChange = (index: number, field: keyof PowerBIDataRow, value: string | number) => {
    const updatedRows = [...dataConfig.rows];
    if (field === "category") {
      updatedRows[index] = { ...updatedRows[index], category: String(value) };
    } else {
      updatedRows[index] = { ...updatedRows[index], [field]: Number(value) || 0 };
    }
    onChange({ ...dataConfig, rows: updatedRows });
  };

  const handleAddRow = () => {
    const defaultCategories = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F"];
    const nextLabel = defaultCategories[dataConfig.rows.length] || `Item ${dataConfig.rows.length + 1}`;
    const newRow: PowerBIDataRow = {
      category: nextLabel,
      value: Math.floor(Math.random() * 50) + 15,
      secondaryValue: Math.floor(Math.random() * 40) + 40,
    };
    onChange({ ...dataConfig, rows: [...dataConfig.rows, newRow] });
  };

  const handleDeleteRow = (index: number) => {
    if (dataConfig.rows.length <= 1) return; // keep at least 1
    const updatedRows = dataConfig.rows.filter((_, idx) => idx !== index);
    onChange({ ...dataConfig, rows: updatedRows });
  };

  // Generate simulated Power BI DataView structure for live JSON tree inspection
  const getDataViewJSON = () => {
    const categoriesMapped = dataConfig.rows.map(r => r.category);
    const valuesMapped = dataConfig.rows.map(r => r.value);
    const secondaryMapped = dataConfig.rows.map(r => r.secondaryValue || 0);

    const valuesNode: any[] = [
      {
        source: {
          displayName: dataConfig.measureRole,
          queryName: `Query.${dataConfig.measureRole}`,
          type: { numeric: true }
        },
        values: valuesMapped
      }
    ];

    if (showSecondary) {
      valuesNode.push({
        source: {
          displayName: dataConfig.secondaryMeasureRole || "Target Measure",
          queryName: `Query.${dataConfig.secondaryMeasureRole || "TargetMeasure"}`,
          type: { numeric: true }
        },
        values: secondaryMapped
      });
    }

    const mockDataView = {
      metadata: {
        columns: [
          {
            displayName: dataConfig.categoryRole,
            queryName: `Query.${dataConfig.categoryRole}`,
            roles: { category: true }
          },
          {
            displayName: dataConfig.measureRole,
            queryName: `Query.${dataConfig.measureRole}`,
            roles: { measure: true }
          }
        ]
      },
      categorical: {
        categories: [
          {
            source: {
              displayName: dataConfig.categoryRole,
              queryName: `Query.${dataConfig.categoryRole}`,
              type: { string: true }
            },
            values: categoriesMapped
          }
        ],
        values: valuesNode
      }
    };

    return JSON.stringify([mockDataView], null, 2);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.01)] flex flex-col h-full [id='pbi-data-pane']">
      {/* Panel header tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-gray-800" />
          <h3 className="font-semibold text-[10px] text-gray-400 uppercase tracking-widest font-mono">
            Power BI Report Data
          </h3>
        </div>
        <div className="flex bg-gray-100 p-0.5 rounded text-xs font-medium">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${
              activeTab === "table"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-gray-900"
            }`}
          >
            <Table size={12} />
            <span>Mock Dataset</span>
          </button>
          <button
            onClick={() => setActiveTab("dataview")}
            className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${
              activeTab === "dataview"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-gray-900"
            }`}
          >
            <Code size={12} />
            <span>options.dataViews</span>
          </button>
        </div>
      </div>

      {/* Primary content areas */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-white">
        {activeTab === "table" ? (
          <div className="space-y-4 flex flex-col flex-1">
            {/* Field configuration names */}
            <div className="grid grid-cols-2 gap-3 bg-[#f9fafb] p-3 rounded-xl border border-gray-100 text-xs shadow-inner">
              <div>
                <label className="block text-[9px] font-bold text-gray-450 text-gray-400 uppercase tracking-wider">Category Role</label>
                <div className="mt-1 font-mono text-gray-800 bg-white border border-gray-100 px-2 py-1 rounded text-[11px] font-semibold">
                  {dataConfig.categoryRole}
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-450 text-gray-400 uppercase tracking-wider">Measure Role</label>
                <div className="mt-1 font-mono text-gray-800 bg-white border border-gray-100 px-2 py-1 rounded text-[11px] font-semibold">
                  {dataConfig.measureRole}
                  {showSecondary && <span className="text-[10px] text-gray-500 ml-1.5"> (+ Target)</span>}
                </div>
              </div>
            </div>

            {/* Practical instructions helper link */}
            <div className="text-gray-500 text-[11px] leading-relaxed flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Info size={14} className="text-gray-450 text-gray-400 shrink-0 mt-0.5" />
              <span>
                Edit the items below to see how the dashboard updates. For <strong>Gauge</strong> template types, the secondary value represents target measures.
              </span>
            </div>

            {/* Tabular Form */}
            <div className="flex-1 overflow-x-auto min-h-[140px] max-h-[350px] border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[9.5px] uppercase tracking-wider font-sans select-none">
                    <th className="py-2.5 px-3 w-1/2">Category Value</th>
                    <th className="py-2.5 px-3 w-1/4 text-right">Row Measure</th>
                    {showSecondary && <th className="py-2.5 px-3 w-1/4 text-right">Target Measure</th>}
                    <th className="py-2.5 px-3 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataConfig.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.category}
                          onChange={(e) => handleRowChange(idx, "category", e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100/65 focus:bg-white border border-slate-200/40 focus:border-indigo-400 rounded-lg px-2.5 py-1.5 outline-none text-slate-800 font-sans font-semibold text-xs transition-all"
                          placeholder="Category label"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={row.value}
                          onChange={(e) => handleRowChange(idx, "value", e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100/65 focus:bg-white border border-slate-200/40 focus:border-indigo-400 rounded-lg px-2 py-1.5 text-right outline-none text-slate-800 font-mono text-xs transition-all"
                          placeholder="92"
                        />
                      </td>
                      {showSecondary && (
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.secondaryValue || 0}
                            onChange={(e) => handleRowChange(idx, "secondaryValue", e.target.value)}
                            className="w-full bg-slate-50 hover:bg-slate-100/65 focus:bg-white border border-slate-200/40 focus:border-indigo-400 rounded-lg px-2 py-1.5 text-right outline-none text-slate-800 font-mono text-xs transition-all"
                            placeholder="100"
                          />
                        </td>
                      )}
                      <td className="p-1.5 text-center">
                        <button
                          onClick={() => handleDeleteRow(idx)}
                          disabled={dataConfig.rows.length <= 1}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 p-1.5 rounded-lg transition-all cursor-pointer"
                          title="Delete aggregate row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleAddRow}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border border-dashed border-gray-200 text-gray-800 hover:text-black hover:bg-gray-50 text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Data Attribute Row</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 h-full font-mono text-xs">
            <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg leading-relaxed mb-3 flex gap-2">
              <Info size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <span>
                Below is the raw mapped Power BI data model. It represents the exact object passed into the custom visual class's <code>update(options: VisualUpdateOptions)</code> function.
              </span>
            </div>
            <pre className="flex-1 bg-gray-50 text-gray-700 p-4 rounded-xl overflow-auto select-all max-h-[350px] leading-relaxed border border-gray-100 scrollbar-thin">
              <code>{getDataViewJSON()}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
