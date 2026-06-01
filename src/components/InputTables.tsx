/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VulnerabilityCategory } from '../types';
import { HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { downloadVulnerabilitiesCSV, getVulnerabilitiesMarkdown, copyTextToClipboard } from '../utils/sectionExport';
import { ExportDropdown } from './ExportDropdown';

interface InputTablesProps {
  categories: VulnerabilityCategory[];
  onChangeScore: (catId: string, secId: string, qId: string, score: number) => void;
  onChangeObservation: (catId: string, secId: string, qId: string, text: string) => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const InputTables: React.FC<InputTablesProps> = ({
  categories,
  onChangeScore,
  onChangeObservation,
  activeTab,
  setActiveTab
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySection = async (cat: VulnerabilityCategory) => {
    const markdown = getVulnerabilitiesMarkdown(cat);
    const success = await copyTextToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSection = (cat: VulnerabilityCategory) => {
    downloadVulnerabilitiesCSV(cat);
  };
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden" id="tablas-entrada-contenedor">
      {/* Tab Navigation header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800" id="titulo-tablas-entrada">
            1. Formulario Técnico de Cuestionarios (Entrada de Datos)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Califique el cumplimiento de cada ítem: <span className="font-semibold text-emerald-600">SÍ = 0.0</span> (Mejor preparado / no vulnerable), <span className="font-semibold text-amber-500">PARCIAL = 0.5</span>, <span className="font-semibold text-red-500">NO = 1.0</span> (Sin respuesta / más vulnerable).
          </p>
        </div>
        
        {/* Selector Tabs for 3 Categories */}
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-lg">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === cat.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
              }`}
              id={`tab-btn-${cat.id}`}
            >
              {cat.id === 'personas' ? '1. Personas' : cat.id === 'recursos' ? '2. Recursos' : '3. Sistemas y Proc.'}
            </button>
          ))}
        </div>
      </div>

      {categories.map(cat => {
        if (cat.id !== activeTab) return null;

        return (
          <div key={cat.id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6" id={`${cat.id}-section`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-slate-800 rounded-full" />
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{cat.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  elementId={`${cat.id}-section`}
                />
              </div>
            </div>

            <div className="space-y-12">
              {cat.sections.map(sec => {
                // Calculate average for this section
                const totalScore = sec.questions.reduce((sum, q) => sum + q.score, 0);
                const sectionAvg = sec.questions.length > 0 ? totalScore / sec.questions.length : 0;

                return (
                  <div key={sec.id} className="border border-slate-100 rounded-lg overflow-hidden" id={`sec-table-${sec.id}`}>
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-bold text-sm text-slate-700 tracking-tight uppercase">{sec.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">Promedio Seccional:</span>
                        <span className="px-2 py-1 bg-slate-800 text-white font-bold rounded-md">
                          {sectionAvg.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead>
                          <tr className="bg-slate-100/60 text-slate-700 font-semibold border-b border-slate-100">
                            <th className="py-3 px-4 w-1/2">Pregunta / Aspecto a Calificar</th>
                            <th className="py-3 px-4 text-center w-[180px]">Respuestas / Calificación</th>
                            <th className="py-3 px-4">Notas y Observaciones Específicas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sec.questions.map(q => {
                            return (
                              <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3.5 px-4 font-medium text-slate-700 leading-relaxed">
                                  {q.question}
                                </td>
                                
                                <td className="py-3.5 px-4">
                                  <div className="flex justify-center items-center gap-1.5">
                                    {[
                                      { value: 0, label: 'SÍ (0.0)', color: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 active-emerald' },
                                      { value: 0.5, label: 'PARC (0.5)', color: 'border-amber-200 text-amber-700 hover:bg-amber-50 active-amber' },
                                      { value: 1, label: 'NO (1.0)', color: 'border-red-200 text-red-700 hover:bg-red-50 active-red' }
                                    ].map(opt => {
                                      const isSelected = q.score === opt.value;
                                      return (
                                        <button
                                          key={opt.value}
                                          onClick={() => onChangeScore(cat.id, sec.id, q.id, opt.value)}
                                          className={`px-2 py-1.5 text-[10px] font-bold rounded-md border transition-all ${
                                            isSelected
                                              ? opt.value === 0
                                                ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm'
                                                : opt.value === 0.5
                                                  ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-sm'
                                                  : 'bg-red-500 border-red-500 text-white font-bold shadow-sm'
                                              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                          }`}
                                          style={{ minWidth: '46px' }}
                                          id={`btn-${q.id}-${opt.value}`}
                                        >
                                          {opt.label.split(' ')[0]}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <textarea
                                    value={q.observation}
                                    onChange={(e) => onChangeObservation(cat.id, sec.id, q.id, e.target.value)}
                                    placeholder="Ingrese observaciones sobre el estado..."
                                    className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:border-slate-400 focus:outline-none transition-all placeholder-slate-400 max-h-[80px]"
                                    rows={1}
                                    id={`obs-${q.id}`}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
