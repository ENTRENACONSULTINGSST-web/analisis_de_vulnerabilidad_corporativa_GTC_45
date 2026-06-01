/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VulnerabilityCategory, getScoreInterpretationColor } from '../types';
import { downloadConsolidadoCSV, getConsolidadoMarkdown, copyTextToClipboard } from '../utils/sectionExport';
import { ExportDropdown } from './ExportDropdown';

interface ConsolidadoTableProps {
  categories: VulnerabilityCategory[];
  vulnerabilitySummary: {
    personas: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
    recursos: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
    sistemas: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
  };
}

export const ConsolidadoTable: React.FC<ConsolidadoTableProps> = ({
  categories,
  vulnerabilitySummary
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyConsolidado = async () => {
    const md = getConsolidadoMarkdown(categories, vulnerabilitySummary);
    const success = await copyTextToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadConsolidado = () => {
    downloadConsolidadoCSV(categories, vulnerabilitySummary);
  };
  // Helper to calculate sections averages for drawing
  const getSecAvg = (catIndex: number, secIndex: number): number => {
    const questions = categories[catIndex]?.sections[secIndex]?.questions || [];
    if (questions.length === 0) return 0;
    return questions.reduce((sum, q) => sum + q.score, 0) / questions.length;
  };

  const cPersonas = vulnerabilitySummary.personas;
  const cRecursos = vulnerabilitySummary.recursos;
  const cSistemas = vulnerabilitySummary.sistemas;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-6" id="consolidado-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800" id="titulo-resumen-consolidado">
            2. Consolidado General de Puntuaciones
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Puntajes agregados para clasificar el nivel de vulnerabilidad sectorial. Un menor valor denota una mejor estrategia de prevención y mitigación.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportDropdown
            elementId="consolidado-section"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Consolidado Table */}
        <div className="lg:col-span-2 overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white font-bold h-10">
                <th className="px-4 py-2 border-b border-slate-700 w-2/3">CONSOLIDADO POR COMPONENTES</th>
                <th className="px-4 py-2 text-center border-b border-slate-700 w-1/3">CALIFICACIÓN (PROMEDIOS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* EN LAS PERSONAS */}
              <tr className="bg-slate-100 font-bold text-slate-700">
                <td colSpan={2} className="px-4 py-2 text-xs uppercase letter-spacing-wider">EN LAS PERSONAS</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Organización</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(0, 0).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Capacitación</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(0, 1).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Dotación</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(0, 2).toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-800">TOTAL PERSONAS</td>
                <td className="px-4 py-3 text-center font-mono text-slate-900 bg-slate-100/60 font-extrabold pr-2 text-sm">
                  {cPersonas.score.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-white font-medium">
                <td className="px-4 py-3 italic text-slate-500">INTERPRETACIÓN DE VULNERABILIDAD</td>
                <td className="px-4 py-3 flex justify-center items-center gap-2">
                  <span className={`w-3.5 h-3.5 rotate-45 border inline-block ${
                    cPersonas.color === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    cPersonas.color === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    cPersonas.color === 'green' ? 'text-emerald-700' :
                    cPersonas.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {cPersonas.interpretation}
                  </span>
                </td>
              </tr>

              {/* EN LOS RECURSOS */}
              <tr className="bg-slate-100 font-bold text-slate-700">
                <td colSpan={2} className="px-4 py-2 text-xs uppercase letter-spacing-wider">EN LOS RECURSOS</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Materiales</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(1, 0).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Edificación</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(1, 1).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Equipos</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(1, 2).toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-800">TOTAL RECURSOS</td>
                <td className="px-4 py-3 text-center font-mono text-slate-900 bg-slate-100/60 font-extrabold pr-2 text-sm">
                  {cRecursos.score.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-white font-medium">
                <td className="px-4 py-3 italic text-slate-500">INTERPRETACIÓN DE VULNERABILIDAD</td>
                <td className="px-4 py-3 flex justify-center items-center gap-2">
                  <span className={`w-3.5 h-3.5 rotate-45 border inline-block ${
                    cRecursos.color === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    cRecursos.color === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    cRecursos.color === 'green' ? 'text-emerald-700' :
                    cRecursos.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {cRecursos.interpretation}
                  </span>
                </td>
              </tr>

              {/* EN LOS SISTEMAS Y PROCESOS */}
              <tr className="bg-slate-100 font-bold text-slate-700">
                <td colSpan={2} className="px-4 py-2 text-xs uppercase letter-spacing-wider">SISTEMAS Y PROCESOS</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Servicios Públicos</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(2, 0).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Sistemas Alternos</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(2, 1).toFixed(2)}</td>
              </tr>
              <tr className="text-slate-600 bg-white">
                <td className="px-4 py-2.5">Recuperación</td>
                <td className="px-4 py-2.5 text-center font-mono font-semibold">{getSecAvg(2, 2).toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-800">TOTAL SISTEMAS Y PROCESOS</td>
                <td className="px-4 py-3 text-center font-mono text-slate-900 bg-slate-100/60 font-extrabold pr-2 text-sm">
                  {cSistemas.score.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-white font-medium">
                <td className="px-4 py-3 italic text-slate-500">INTERPRETACIÓN DE VULNERABILIDAD</td>
                <td className="px-4 py-3 flex justify-center items-center gap-2">
                  <span className={`w-3.5 h-3.5 rotate-45 border inline-block ${
                    cSistemas.color === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    cSistemas.color === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    cSistemas.color === 'green' ? 'text-emerald-700' :
                    cSistemas.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {cSistemas.interpretation}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic Legend / Interpretation details box */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between" id="leyenda-rangos-vulnerabilidad">
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Leyenda de Rangos y Significado
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              La calificación de cada uno de los tres componentes consolidados se divide en los siguientes intervalos normalizados de vulnerabilidades (basados en metodología GTC-45 / FOP):
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                <span className="w-4.5 h-4.5 bg-emerald-500 rotate-45 border border-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-emerald-800">0.0 - 1.0 (Vulnerabilidad BAJA)</div>
                  <div className="text-[10px] text-slate-500">Seguridad óptima y con planes de contingencia operativos.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                <span className="w-4.5 h-4.5 bg-amber-500 rotate-45 border border-amber-600 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-amber-800">1.1 - 2.0 (Vulnerabilidad MEDIA)</div>
                  <div className="text-[10px] text-slate-500">Preparación parcial, requiere implementar acciones correctivas.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                <span className="w-4.5 h-4.5 bg-red-500 rotate-45 border border-red-600 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-red-800">2.1 - 3.0 (Vulnerabilidad ALTA)</div>
                  <div className="text-[10px] text-slate-500">Estado crítico. Ausencia notoria de recursos, capacitación y sistemas.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50 text-[10px] text-slate-400">
            *Las calificaciones consolidadas son sumas de los promedios parciales calculados para cada sub-bloque.
          </div>
        </div>
      </div>
    </div>
  );
};
