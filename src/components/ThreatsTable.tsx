/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThreatItem, getThreatColor } from '../types';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { downloadThreatsCSV, getThreatsMarkdown, copyTextToClipboard } from '../utils/sectionExport';
import { ExportDropdown } from './ExportDropdown';

interface ThreatsTableProps {
  threats: ThreatItem[];
  onChangeThreat: (id: string, field: string, value: any) => void;
  onAddThreat: (threat: Omit<ThreatItem, 'id'>) => void;
  onDeleteThreat: (id: string) => void;
}

export const ThreatsTable: React.FC<ThreatsTableProps> = ({
  threats,
  onChangeThreat,
  onAddThreat,
  onDeleteThreat
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyThreats = async () => {
    const md = getThreatsMarkdown(threats);
    const success = await copyTextToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadThreats = () => {
    downloadThreatsCSV(threats);
  };

  const [newThreatName, setNewThreatName] = useState('');
  const [newThreatCategory, setNewThreatCategory] = useState<'NATURAL' | 'TECNOLÓGICO' | 'SOCIAL'>('TECNOLÓGICO');
  const [newThreatSource, setNewThreatSource] = useState('');
  const [newThreatExterno, setNewThreatExterno] = useState(true);
  const [newThreatInterno, setNewThreatInterno] = useState(false);
  const [newThreatQual, setNewThreatQual] = useState<'POSIBLE' | 'PROBABLE' | 'INMINENTE'>('PROBABLE');

  const handleAddNewThreat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreatName.trim()) return;

    onAddThreat({
      name: newThreatName,
      category: newThreatCategory,
      origin: { externo: newThreatExterno, interno: newThreatInterno },
      source: newThreatSource || 'Fuente registrada por el usuario.',
      qualification: newThreatQual,
      observation: ''
    });

    setNewThreatName('');
    setNewThreatSource('');
    setNewThreatExterno(true);
    setNewThreatInterno(false);
    setNewThreatQual('PROBABLE');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-6" id="amenazas-section">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800" id="titulo-identificacion-amenazas">
              3. Identificación y Calificación de Amenazas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Determine el origen espacial, la causa específica de la amenaza y califique el peligro como <span className="text-emerald-600 font-bold">POSIBLE</span>, <span className="text-amber-500 font-bold">PROBABLE</span> o <span className="text-red-500 font-bold">INMINENTE</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ExportDropdown
              elementId="amenazas-section"
            />
          </div>
        </div>

        {/* Small legend of classifications header */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leyenda de Calificación de Peligros:</span>
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1">
              <span className="w-2 md:w-2.5 h-2 md:h-2.5 bg-emerald-500 rotate-45 border border-emerald-600" />
              <span className="text-emerald-700">POSIBLE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 md:w-2.5 h-2 md:h-2.5 bg-amber-500 rotate-45 border border-amber-600" />
              <span className="text-amber-700">PROBABLE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 md:w-2.5 h-2 md:h-2.5 bg-red-500 rotate-45 border border-red-600" />
              <span className="text-red-700">INMINENTE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat List Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white font-bold h-10">
              <th className="px-4 py-2 border-b border-slate-700 w-[20%]">Amenaza / Peligro</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">Origen Espacial</th>
              <th className="px-4 py-2 border-b border-slate-700 w-[40%]">Fuente Descriptiva de la Amenaza</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">Calificación</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[10%]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['NATURAL', 'TECNOLÓGICO', 'SOCIAL'].map((category) => {
              const matchedThreats = threats.filter(t => t.category === category);
              if (matchedThreats.length === 0) return null;

              return (
                <React.Fragment key={category}>
                  {/* Category Section Row heading */}
                  <tr className="bg-slate-100 font-bold text-slate-700">
                    <td colSpan={5} className="px-4 py-2 uppercase tracking-wide text-[10px]">
                      Amenaza Tipo: {category}
                    </td>
                  </tr>

                  {matchedThreats.map((threat) => {
                    const blockDefaultText = ['Movimientos sísmicos', 'Inundaciones', 'Incendios', 'Explosiones', 'Fallas estructurales', 'Ausencia del fluido eléctrico', 'Accidentes Viales', 'Trabajo en Alturas', 'Terrorismo', 'De orden público', 'Asaltos y hurtos'].includes(threat.name);

                    return (
                      <tr key={threat.id} className="hover:bg-slate-50/40 transition-colors bg-white">
                        {/* Threat Name */}
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {threat.name}
                        </td>

                        {/* Origin selection (Externo / Interno) */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex justify-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={threat.origin.externo}
                                onChange={(e) =>
                                  onChangeThreat(threat.id, 'origin', {
                                    ...threat.origin,
                                    externo: e.target.checked
                                  })
                                }
                                className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-3.5 w-3.5"
                                id={`chk-ext-${threat.id}`}
                              />
                              <span className="text-[10px] text-slate-500 font-medium">Ext.</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={threat.origin.interno}
                                onChange={(e) =>
                                  onChangeThreat(threat.id, 'origin', {
                                    ...threat.origin,
                                    interno: e.target.checked
                                  })
                                }
                                className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-3.5 w-3.5"
                                id={`chk-int-${threat.id}`}
                              />
                              <span className="text-[10px] text-slate-500 font-medium">Int.</span>
                            </label>
                          </div>
                        </td>

                        {/* Source Description */}
                        <td className="px-4 py-3">
                          <textarea
                            value={threat.source}
                            onChange={(e) => onChangeThreat(threat.id, 'source', e.target.value)}
                            placeholder="Describa brevemente la procedencia del riesgo..."
                            className="w-full text-xs px-2 py-1 border border-slate-200 rounded focus:border-slate-400 focus:outline-none transition-all resize-y min-h-[50px] leading-snug"
                            id={`src-text-${threat.id}`}
                          />
                        </td>

                        {/* Qualification select */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <select
                              value={threat.qualification}
                              onChange={(e) => onChangeThreat(threat.id, 'qualification', e.target.value)}
                              className={`text-[10px] font-bold py-1 px-1.5 rounded border focus:outline-none transition-all text-center max-w-[110px] w-full cursor-pointer ${
                                threat.qualification === 'POSIBLE'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : threat.qualification === 'PROBABLE'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                              }`}
                              id={`sel-qual-${threat.id}`}
                            >
                              <option value="POSIBLE">POSIBLE</option>
                              <option value="PROBABLE">PROBABLE</option>
                              <option value="INMINENTE">INMINENTE</option>
                            </select>

                            <div className="flex items-center gap-1 mt-1">
                              <span className={`w-2.5 h-2.5 rotate-45 border ${
                                threat.qualification === 'POSIBLE' ? 'bg-emerald-500 border-emerald-600' :
                                threat.qualification === 'PROBABLE' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                              }`} />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{threat.qualification}</span>
                            </div>
                          </div>
                        </td>

                        {/* Delete actions (for custom, user-added threats) */}
                        <td className="px-4 py-3 text-center">
                          {!blockDefaultText ? (
                            <button
                              onClick={() => onDeleteThreat(threat.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md transition-all self-center"
                              title="Eliminar amenaza personalizada"
                              id={`del-btn-${threat.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 select-none">Fijo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form inline to Add new Amenaza/Threat */}
      <form onSubmit={handleAddNewThreat} className="bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all rounded-lg p-4 space-y-4" id="form-agregar-amenaza">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <ShieldAlert className="w-4 h-4 text-slate-800" />
          <span>Agregar Nueva Amenaza Personalizada</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre Peligro / Amenaza</label>
            <input
              type="text"
              placeholder="Ej: Caída de estanterías, Incendios forestales..."
              value={newThreatName}
              onChange={(e) => setNewThreatName(e.target.value)}
              className="w-full text-xs px-2.5 py-1.8 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400"
              required
              id="new-threat-name"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Categoría General</label>
            <select
              value={newThreatCategory}
              onChange={(e) => setNewThreatCategory(e.target.value as any)}
              className="w-full text-xs px-2 py-1.8 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400"
              id="new-threat-cat"
            >
              <option value="TECNOLÓGICO">TECNOLÓGICO</option>
              <option value="NATURAL">NATURAL</option>
              <option value="SOCIAL">SOCIAL</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Calificación Inicial</label>
            <select
              value={newThreatQual}
              onChange={(e) => setNewThreatQual(e.target.value as any)}
              className="w-full text-xs px-2 py-1.8 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400"
              id="new-threat-qual"
            >
              <option value="POSIBLE">POSIBLE</option>
              <option value="PROBABLE">PROBABLE</option>
              <option value="INMINENTE">INMINENTE</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newThreatExterno}
                  onChange={(e) => setNewThreatExterno(e.target.checked)}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  id="new-threat-ext"
                />
                <span className="text-[11px] text-slate-600 font-medium">Ext.</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newThreatInterno}
                  onChange={(e) => setNewThreatInterno(e.target.checked)}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  id="new-threat-int"
                />
                <span className="text-[11px] text-slate-600 font-medium">Int.</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fuente Específica / Localización del Peligro</label>
            <input
              type="text"
              placeholder="Describa la procedencia del riesgo..."
              value={newThreatSource}
              onChange={(e) => setNewThreatSource(e.target.value)}
              className="w-full text-xs px-2.5 py-1.8 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400"
              id="new-threat-src"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-1.8 bg-slate-800 hover:bg-slate-950 text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
              id="btn-add-submit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Amenaza</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
