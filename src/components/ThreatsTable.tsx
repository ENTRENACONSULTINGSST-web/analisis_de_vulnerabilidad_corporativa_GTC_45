/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThreatItem } from '../types';
import { Plus, Trash2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { ExportDropdown } from './ExportDropdown';
import { AutoResizeTextarea } from './AutoResizeTextarea';

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
  // Collapsible state for adding a threat (collapsed by default: "no incluir si no tiene desarrollo o información")
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // States for the threat registration form
  const [newThreatName, setNewThreatName] = useState('');
  const [newThreatCategory, setNewThreatCategory] = useState<'NATURAL' | 'TECNOLÓGICO' | 'SOCIAL'>('TECNOLÓGICO');
  const [newThreatSource, setNewThreatSource] = useState('');
  const [newThreatExterno, setNewThreatExterno] = useState(true);
  const [newThreatInterno, setNewThreatInterno] = useState(false);
  const [newThreatQual, setNewThreatQual] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');

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
    setNewThreatQual('MEDIO');
    
    // Auto-collapse after submission
    setShowAddForm(false);
  };

  // Helper to render a specific threat table section
  const renderCategoryCard = (
    category: 'NATURAL' | 'TECNOLÓGICO' | 'SOCIAL',
    sectionNumber: string,
    titleText: string,
    descriptionText: string,
    elementId: string
  ) => {
    const matchedThreats = threats.filter(t => t.category === category);
    
    return (
      <div 
        className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-4" 
        id={elementId}
        key={category}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span className="text-indigo-600">{sectionNumber}</span>
              <span>{titleText}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {descriptionText}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ExportDropdown
              elementId={elementId}
              buttonText="Copiar Sección"
            />
          </div>
        </div>

        {matchedThreats.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            No hay amenazas registradas en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold h-9">
                  <th className="px-4 py-2 border-b border-slate-700 w-[22%]">Amenaza / Peligro</th>
                  <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">Origen Espacial</th>
                  <th className="px-4 py-2 border-b border-slate-700 w-[42%]">Fuente Descriptiva de la Amenaza</th>
                  <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">Calificación</th>
                  <th className="px-4 py-2 text-center border-b border-slate-700 w-[6%]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {matchedThreats.map((threat) => {
                  const blockDefaultText = [
                    'Movimientos sísmicos', 'Inundaciones', 'Incendios', 'Explosiones', 
                    'Fallas estructurales', 'Ausencia del fluido eléctrico', 'Accidentes Viales', 
                    'Trabajo en Alturas', 'Terrorismo', 'De orden público', 'Asaltos y hurtos'
                  ].includes(threat.name);

                  return (
                    <tr key={threat.id} className="hover:bg-slate-50/45 transition-colors bg-white">
                      {/* Threat Name */}
                      <td className="px-4 py-3 font-semibold text-slate-700 leading-snug">
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
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              id={`chk-ext-${threat.id}`}
                            />
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">Ext</span>
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
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              id={`chk-int-${threat.id}`}
                            />
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">Int</span>
                          </label>
                        </div>
                      </td>

                      {/* Source Description */}
                      <td className="px-4 py-3">
                        <AutoResizeTextarea
                          value={threat.source}
                          onChange={(e) => onChangeThreat(threat.id, 'source', e.target.value)}
                          placeholder="Describa brevemente la procedencia del riesgo..."
                          className="text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:border-slate-400 focus:outline-none placeholder-slate-400 bg-white"
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
                              threat.qualification === 'BAJO'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : threat.qualification === 'MEDIO'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                            id={`sel-qual-${threat.id}`}
                          >
                            <option value="BAJO">BAJO</option>
                            <option value="MEDIO">MEDIO</option>
                            <option value="ALTO">ALTO</option>
                          </select>

                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-2.5 h-2.5 rotate-45 border ${
                              threat.qualification === 'BAJO' ? 'bg-emerald-500 border-emerald-600' :
                              threat.qualification === 'MEDIO' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                            }`} />
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{threat.qualification}</span>
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
                          <span className="text-[10px] text-slate-400 select-none font-medium">Fijo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="seccion-amenazas-contenedor-general">
      {/* Overarching professional Header Title container */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight" id="titulo-identificacion-amenazas">
            3. Identificación y Calificación de Amenazas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Determine el origen espacial (In Situ / Externo), la causa de la amenaza y califique el peligro según la guía técnica GTC-45.
          </p>
        </div>
        
        {/* Leyenda de calificaciones */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] font-bold">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">Peligro:</span>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rotate-45 border border-emerald-600" />
              <span className="text-emerald-700">BAJO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rotate-45 border border-amber-600" />
              <span className="text-amber-700">MEDIO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rotate-45 border border-red-600" />
              <span className="text-red-700">ALTO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render 3 fragmented sections to allow segment-level export with higher quality */}
      {renderCategoryCard(
        'NATURAL',
        '3.1',
        'Amenazas de Origen Natural',
        'Peligros derivados de fenómenos meteorológicos, geofísicos o hidrológicos (Sismos, inundaciones, etc.).',
        'amenazas-natural-section'
      )}

      {renderCategoryCard(
        'TECNOLÓGICO',
        '3.2',
        'Amenazas de Origen Tecnológico',
        'Peligros asociados a procesos industriales, almacenamiento, cortocircuitos, fallas asociadas a la infraestructura u operación.',
        'amenazas-tecnologico-section'
      )}

      {renderCategoryCard(
        'SOCIAL',
        '3.3',
        'Amenazas de Origen Social',
        'Peligros desencadenados por conductas de orden público, asaltos, hurtos o perturbación civil.',
        'amenazas-social-section'
      )}

      {/* Collapsible Threat addition form: "no incluir si no tiene desarrollo o información" */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-5">
        {!showAddForm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              ¿Desea agregar algún peligro que no figure en los listados predeterminados anteriores?
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
              id="toggle-add-threat-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Amenaza Personalizada</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddNewThreat} className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 space-y-4" id="form-agregar-amenaza">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>Agregar Nueva Amenaza Personalizada</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewThreatName('');
                  setNewThreatSource('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                id="close-add-threat-btn"
              >
                Cerrar Formulario
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nombre Peligro / Amenaza</label>
                <input
                  type="text"
                  placeholder="Ej: Caídas desde estanterías fijas, Derrame químico..."
                  value={newThreatName}
                  onChange={(e) => setNewThreatName(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                  required
                  id="new-threat-name"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Categoría General</label>
                <select
                  value={newThreatCategory}
                  onChange={(e) => setNewThreatCategory(e.target.value as any)}
                  className="w-full text-xs px-2 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                  id="new-threat-cat"
                >
                  <option value="NATURAL">NATURAL</option>
                  <option value="TECNOLÓGICO">TECNOLÓGICO</option>
                  <option value="SOCIAL">SOCIAL</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Calificación</label>
                <select
                  value={newThreatQual}
                  onChange={(e) => setNewThreatQual(e.target.value as any)}
                  className="w-full text-xs px-2 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                  id="new-threat-qual"
                >
                  <option value="BAJO">BAJO</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="ALTO">ALTO</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <div className="flex gap-4 mb-2.5 pl-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newThreatExterno}
                      onChange={(e) => setNewThreatExterno(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      id="new-threat-ext"
                    />
                    <span className="text-xs text-slate-600 font-bold uppercase">Ext</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newThreatInterno}
                      onChange={(e) => setNewThreatInterno(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      id="new-threat-int"
                    />
                    <span className="text-xs text-slate-600 font-bold uppercase">Int</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Fuente Específica / Localización del Peligro</label>
                <input
                  type="text"
                  placeholder="Detalle de la procedencia del riesgo..."
                  value={newThreatSource}
                  onChange={(e) => setNewThreatSource(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-slate-400"
                  id="new-threat-src"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  id="btn-add-submit"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Registrar</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
