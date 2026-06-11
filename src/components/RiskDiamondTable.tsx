/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThreatItem, getScoreInterpretationColor, getThreatColor } from '../types';
import { ShieldCheck, Info, Sparkles, Sliders, LayoutGrid, CheckCircle2, RotateCcw } from 'lucide-react';
import { downloadRiskMatrixCSV, getRiskMatrixMarkdown, copyTextToClipboard } from '../utils/sectionExport';
import { ExportDropdown } from './ExportDropdown';

interface RiskDiamondTableProps {
  threats: ThreatItem[];
  vulnerabilitySummary: {
    personas: { score: number; color: 'green' | 'yellow' | 'red' };
    recursos: { score: number; color: 'green' | 'yellow' | 'red' };
    sistemas: { score: number; color: 'green' | 'yellow' | 'red' };
  };
  getRiskDetails: (threat: ThreatItem) => {
    personasColor: 'green' | 'yellow' | 'red';
    recursosColor: 'green' | 'yellow' | 'red';
    sistemasColor: 'green' | 'yellow' | 'red';
    amenazaColor: 'green' | 'yellow' | 'red';
    level: 'BAJO' | 'MEDIO' | 'ALTO';
    levelColor: 'green' | 'yellow' | 'red';
  };
}

export const RiskDiamondTable: React.FC<RiskDiamondTableProps> = ({
  threats,
  vulnerabilitySummary,
  getRiskDetails
}) => {
  // Advanced Interactive states
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
  const [hoveredThreatId, setHoveredThreatId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // New customization states requested: Sizing options and Fragmented exports
  const [density, setDensity] = useState<'standard' | 'compact'>('compact'); // Default to compact as per user pain point
  const [viewMode, setViewMode] = useState<'fragmented' | 'unified'>('fragmented'); // Default to fragmented for easy A4 copy/paste

  const handleCopyRiskMatrix = async () => {
    const md = getRiskMatrixMarkdown(threats, getRiskDetails);
    const success = await copyTextToClipboard(md);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadRiskMatrix = () => {
    downloadRiskMatrixCSV(threats, getRiskDetails);
  };

  // Color hex translation for SVGs
  const getFillColor = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green': return '#10B981'; // Tailwind Emerald 500
      case 'yellow': return '#F59E0B'; // Tailwind Amber 500
      case 'red': return '#EF4444'; // Tailwind Red 500
    }
  };

  const getStrokeColor = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green': return '#047857'; // Tailwind Emerald 700
      case 'yellow': return '#B45309'; // Tailwind Amber 700
      case 'red': return '#B91C1C'; // Tailwind Red 700
    }
  };

  // Safe fallback resolver for active / selected row
  const activeThreatId = hoveredThreatId || selectedThreatId || (threats && threats.length > 0 ? threats[0].id : null);
  const activeThreat = threats.find(t => t.id === activeThreatId) || threats[0];

  const getDiagValues = () => {
    if (!activeThreat) {
      return {
        aVal: 'A-B',
        aCol: 'G',
        aColorName: 'green' as const,
        pVal: 'P-B',
        pCol: 'G',
        pColorName: 'green' as const,
        rVal: 'R-B',
        rCol: 'G',
        rColorName: 'green' as const,
        sVal: 'S-B',
        sCol: 'G',
        sColorName: 'green' as const,
        riskLevel: 'BAJO' as const,
        riskLevelColor: 'green' as const,
        threatName: 'Sin Amenazas'
      };
    }

    const details = getRiskDetails(activeThreat);

    // Threat qualification -> A-B (Bajo), A-M (Medio), A-A (Alto)
    const aVal = `A-${activeThreat.qualification === 'ALTO' ? 'A' : activeThreat.qualification === 'MEDIO' ? 'M' : 'B'}`;
    const aCol = details.amenazaColor === 'green' ? 'G' : details.amenazaColor === 'yellow' ? 'Y' : 'R';
    const aColorName = details.amenazaColor;

    // Personas -> P-B (Bajo), P-M (Medio), P-A (Alto)
    const pVal = `P-${details.personasColor === 'green' ? 'B' : details.personasColor === 'yellow' ? 'M' : 'A'}`;
    const pCol = details.personasColor === 'green' ? 'G' : details.personasColor === 'yellow' ? 'Y' : 'R';
    const pColorName = details.personasColor;

    // Recursos -> R-B, R-M, R-A
    const rVal = `R-${details.recursosColor === 'green' ? 'B' : details.recursosColor === 'yellow' ? 'M' : 'A'}`;
    const rCol = details.recursosColor === 'green' ? 'G' : details.recursosColor === 'yellow' ? 'Y' : 'R';
    const rColorName = details.recursosColor;

    // Sistemas -> S-B, S-M, S-A
    const sVal = `S-${details.sistemasColor === 'green' ? 'B' : details.sistemasColor === 'yellow' ? 'M' : 'A'}`;
    const sCol = details.sistemasColor === 'green' ? 'G' : details.sistemasColor === 'yellow' ? 'Y' : 'R';
    const sColorName = details.sistemasColor;

    return {
      aVal,
      aCol,
      aColorName,
      pVal,
      pCol,
      pColorName,
      rVal,
      rCol,
      rColorName,
      sVal,
      sCol,
      sColorName,
      riskLevel: details.level,
      riskLevelColor: details.levelColor,
      threatName: activeThreat.name
    };
  };

  const diag = getDiagValues();

  // Custom typography and padding classes based on elected Density
  const textClass = density === 'compact' ? 'text-[11px]' : 'text-xs';
  const headerTextClass = density === 'compact' ? 'text-[10px] uppercase font-black' : 'text-xs font-black';
  const paddingClass = density === 'compact' ? 'px-2 py-1.5' : 'px-4 py-3.5';
  const miniSvgSize = density === 'compact' ? '46' : '60';

  // Helper method: renders the table headers
  const renderTableHeader = () => (
    <thead>
      <tr className="bg-slate-800 text-white font-bold h-9 text-center">
        <th className={`${paddingClass} ${headerTextClass} text-left w-[25%]`}>AMENAZA</th>
        <th className={`${paddingClass} ${headerTextClass} text-center w-[12%]`}>COLOR AMENAZA</th>
        <th className={`${paddingClass} ${headerTextClass} text-center w-[33%]`}>VULNERABILIDAD (P, R, S)</th>
        <th className={`${paddingClass} ${headerTextClass} text-center w-[15%]`}>DIAMANTE DE RIESGO</th>
        <th className={`${paddingClass} ${headerTextClass} text-center w-[15%]`}>NIVEL RIESGO</th>
      </tr>
    </thead>
  );

  // Helper method: renders table rows for threats
  const renderThreatRows = (matchedThreats: ThreatItem[]) => {
    return matchedThreats.map((threat) => {
      const row = getRiskDetails(threat);
      const isActive = threat.id === activeThreatId;

      return (
        <tr
          key={threat.id}
          onClick={() => setSelectedThreatId(threat.id)}
          onMouseEnter={() => setHoveredThreatId(threat.id)}
          onMouseLeave={() => setHoveredThreatId(null)}
          className={`transition-colors cursor-pointer border-b border-slate-100 ${
            isActive 
              ? 'bg-indigo-50/70 hover:bg-indigo-50 font-medium border-l-4 border-l-indigo-600' 
              : 'hover:bg-slate-50 bg-white'
          }`}
          title="Haga clic para fijar en el canvas de análisis"
        >
          {/* Threat Name & Origin Sub-badges */}
          <td className={`${paddingClass} border-r border-slate-100`}>
            <div className={`font-bold text-slate-800 leading-tight ${textClass}`}>
              {threat.name}
            </div>
            <div className="flex gap-1 mt-1 text-[8px] uppercase font-bold tracking-wider text-slate-400">
              {threat.origin.externo && (
                <span className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded">Ext</span>
              )}
              {threat.origin.interno && (
                <span className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded">Int</span>
              )}
            </div>
          </td>

          {/* Threat Danger Color Column */}
          <td className={`${paddingClass} border-r border-slate-100 text-center`}>
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className={`rotate-45 border ${
                density === 'compact' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
              } ${
                row.amenazaColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                row.amenazaColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
              }`} />
              <span className="text-[8px] text-slate-400 font-extrabold uppercase leading-none mt-1">{row.amenazaColor}</span>
            </div>
          </td>

          {/* Vulnerability indicators columns */}
          <td className={`${paddingClass} border-r border-slate-100`}>
            <div className="grid grid-cols-3 gap-1 text-center">
              {/* Personas */}
              <div className="p-0.5 rounded bg-slate-50 border border-slate-100">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Personas</div>
                <div className="flex justify-center items-center gap-0.5 mt-0.5">
                  <span className={`w-2 h-2 rotate-45 border ${
                    row.personasColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    row.personasColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[8.5px] font-black uppercase ${
                    row.personasColor === 'green' ? 'text-emerald-700' :
                    row.personasColor === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {row.personasColor === 'green' ? 'BAJO' : row.personasColor === 'yellow' ? 'MED' : 'ALTO'}
                  </span>
                </div>
              </div>

              {/* Recursos */}
              <div className="p-0.5 rounded bg-slate-50 border border-slate-100">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Recursos</div>
                <div className="flex justify-center items-center gap-0.5 mt-0.5">
                  <span className={`w-2 h-2 rotate-45 border ${
                    row.recursosColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    row.recursosColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[8.5px] font-black uppercase ${
                    row.recursosColor === 'green' ? 'text-emerald-700' :
                    row.recursosColor === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {row.recursosColor === 'green' ? 'BAJO' : row.recursosColor === 'yellow' ? 'MED' : 'ALTO'}
                  </span>
                </div>
              </div>

              {/* Sistemas */}
              <div className="p-0.5 rounded bg-slate-50 border border-slate-100">
                <div className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Sistemas</div>
                <div className="flex justify-center items-center gap-0.5 mt-0.5">
                  <span className={`w-2 h-2 rotate-45 border ${
                    row.sistemasColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                    row.sistemasColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                  }`} />
                  <span className={`text-[8.5px] font-black uppercase ${
                    row.sistemasColor === 'green' ? 'text-emerald-700' :
                    row.sistemasColor === 'yellow' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {row.sistemasColor === 'green' ? 'BAJO' : row.sistemasColor === 'yellow' ? 'MED' : 'ALTO'}
                  </span>
                </div>
              </div>
            </div>
          </td>

          {/* Interactive Risk Diamond SVG */}
          <td className={`${paddingClass} border-r border-slate-100 text-center`}>
            <div className="flex justify-center items-center">
              <svg width={miniSvgSize} height={miniSvgSize} viewBox="0 0 80 80" className="drop-shadow-sm">
                {/* 1. Top Diamond: Amenaza */}
                <polygon
                  points="40,0 60,20 40,40 20,20"
                  fill={getFillColor(row.amenazaColor)}
                  stroke={getStrokeColor(row.amenazaColor)}
                  strokeWidth="2"
                />
                <text x="40" y="23" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" className="select-none">A</text>

                {/* 2. Left Diamond: Personas */}
                <polygon
                  points="20,20 40,40 20,60 0,40"
                  fill={getFillColor(row.personasColor)}
                  stroke={getStrokeColor(row.personasColor)}
                  strokeWidth="2"
                />
                <text x="20" y="43" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" className="select-none">P</text>

                {/* 3. Right Diamond: Recursos */}
                <polygon
                  points="60,20 80,40 60,60 40,40"
                  fill={getFillColor(row.recursosColor)}
                  stroke={getStrokeColor(row.recursosColor)}
                  strokeWidth="2"
                />
                <text x="60" y="43" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" className="select-none">R</text>

                {/* 4. Bottom Diamond: Sistemas y Procesos */}
                <polygon
                  points="40,40 60,60 40,80 20,60"
                  fill={getFillColor(row.sistemasColor)}
                  stroke={getStrokeColor(row.sistemasColor)}
                  strokeWidth="2"
                />
                <text x="40" y="63" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" className="select-none">S</text>
              </svg>
            </div>
          </td>

          {/* Calculated Risk Level text is colored appropriately */}
          <td className={paddingClass}>
            <div className={`p-1.5 rounded border font-black text-center text-[10px] tracking-wider flex items-center justify-center gap-1 leading-none ${
              row.level === 'ALTO'
                ? 'bg-red-50 border-red-200 text-red-700'
                : row.level === 'MEDIO'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                row.level === 'ALTO' ? 'bg-red-600 animate-pulse' : row.level === 'MEDIO' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span>{row.level}</span>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-6" id="seccion-diamante-raiz">
      
      {/* 1. Header Control Block introducing customized density and export fragmentation options */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2" id="titulo-diamante-riesgo">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span>4. Consolidado e Interpretación del Nivel de Riesgo (GTC-45)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure la visualización y exportación óptima para copiar directamente a su informe final en formato Word o PDF (A4).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyRiskMatrix}
              className="px-3 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              id="btn-copiar-md-matrix"
            >
              {copied ? '✓ Copiado' : 'Copiar Tabla como Markdown'}
            </button>
            <button
              onClick={handleDownloadRiskMatrix}
              className="px-3 py-1.8 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              id="btn-descargar-csv-matrix"
            >
              Descargar CSV
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: Density & Fragmentation */}
        <div className="pt-3 border-t border-slate-100/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
          
          {/* A. Copy Fragmentation Mode */}
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Separación para Exportar:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('fragmented')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                  viewMode === 'fragmented' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-ctrl-mode-fragmented"
              >
                Por Categoría (Fácil A4)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                  viewMode === 'unified' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-ctrl-mode-unified"
              >
                Tabla Unificada
              </button>
            </div>
          </div>

          {/* B. Width and padding bounds */}
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500">Medida de Celdas (A4 Fit):</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-100">
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                  density === 'compact' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-ctrl-density-compact"
                title="Súper denso y comprimido con fuentes adaptables para pegar en márgenes estrechos A4 sin deformar las celdas."
              >
                A4 Ultra-Fit (Compacto)
              </button>
              <button
                type="button"
                onClick={() => setDensity('standard')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                  density === 'standard' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="btn-ctrl-density-standard"
              >
                Espaciado Estándar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-columns flow: Left Tables, Right Visualizer Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="diamante-panel-flujo">
        
        {/* LEFT COLUMN: THE RISK TABLES */}
        <div className="lg:col-span-7 space-y-6">
          {viewMode === 'fragmented' ? (
            /* FRAGMENTED VIEW MODE: Renders 3 separate manageable cards that guarantees 100% compliance with standard Word page-breaks! */
            <div className="space-y-6" id="diamante-fragmentado-contenedor">
              {['NATURAL', 'TECNOLÓGICO', 'SOCIAL'].map((category) => {
                const matched = threats.filter(t => t.category === category);
                if (matched.length === 0) return null;

                const cardId = `sub-diamante-${category.toLowerCase()}-card`;
                const titleHeading = category === 'NATURAL' ? '4.1 Diamante de Riesgo: Origen Natural' :
                                     category === 'TECNOLÓGICO' ? '4.2 Diamante de Riesgo: Origen Tecnológico' :
                                     '4.3 Diamante de Riesgo: Origen Social';

                return (
                  <div 
                    key={category} 
                    id={cardId} 
                    className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {titleHeading}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Matriz GTC-45 comprimida para pegado directo en Word (A4 {density === 'compact' ? 'Compacto' : 'Estandar'}).
                        </p>
                      </div>
                      <ExportDropdown
                        elementId={cardId}
                        buttonText="Copiar Gráfico"
                      />
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse bg-white">
                        {renderTableHeader()}
                        <tbody>
                          {renderThreatRows(matched)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* UNIFIED VIEW MODE: Renders one single full-length consolidated master table */
            <div 
              id="diamante-unified-section-card" 
              className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    4. Consolidado Diamante de Riesgo Completo
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Planilla integrada de todas las categorías de riesgo (SST Autogestión).
                  </p>
                </div>
                <ExportDropdown
                  elementId="diamante-unified-section-card"
                  buttonText="Copiar Consolidado"
                />
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs border-collapse bg-white">
                  {renderTableHeader()}
                  <tbody className="divide-y divide-slate-100">
                    {['NATURAL', 'TECNOLÓGICO', 'SOCIAL'].map((category) => {
                      const matched = threats.filter(t => t.category === category);
                      if (matched.length === 0) return null;

                      return (
                        <React.Fragment key={category}>
                          <tr className="bg-slate-50/80 font-black text-slate-600 border-y border-slate-100">
                            <td colSpan={5} className="px-3 py-1.5 text-[9px] uppercase tracking-wider">
                              Grupo: Peligros de Origen {category}
                            </td>
                          </tr>
                          {renderThreatRows(matched)}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GTC-45 Static Methodology Guide block */}
          <div className="bg-slate-50 border border-slate-100/70 p-4 rounded-xl flex gap-3" id="guia-interpretacion-diamante">
            <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-extrabold text-slate-800">Cálculo de Nivel de Riesgo (Metodología del Diamante):</p>
              <p className="leading-relaxed">
                Para cada fila se evalúan 4 rombos de factores (<strong>A</strong>: Amenaza, <strong>P</strong>: Personas, <strong>R</strong>: Recursos, <strong>S</strong>: Sistemas):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 mt-1 text-[11px]">
                <li><strong className="text-red-600">RIESGO ALTO (Rojo)</strong>: 3 o 4 rombos calificados en Rojo. Intervención prioritaria con planes inmediatos de control.</li>
                <li><strong className="text-amber-600">RIESGO MEDIO (Amarillo)</strong>: 1 o 2 rombos en Rojo, o 3 o 4 rombos en Amarillo. Requiere mejoras organizacionales.</li>
                <li><strong className="text-emerald-700">RIESGO BAJO (Verde)</strong>: 0 rombos en Rojo y máximo 2 rombos en Amarillo. Organización preparada.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-STYLISH GLASSMORPHIC GRAPHIC CANVAS INTERACTIVE BOARD */}
        <div className="lg:col-span-5">
          <div 
            className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-xl flex flex-col justify-between shadow-xl sticky top-20" 
            id="grafico-section"
          >
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-3.5 bg-indigo-500 rounded-full inline-block" />
                  Visualizador Avanzado GTC-45
                </h4>
                <p className="text-[10px] text-slate-400">
                  Análisis gráfico automatizado del peligro activo.
                </p>
              </div>
              <ExportDropdown
                elementId="grafico-section"
                align="right"
                buttonText="Copiar Canvas"
              />
            </div>

            {/* Canvas Body container */}
            <div className="flex flex-col items-center justify-center py-5 bg-slate-950/70 border border-slate-800/80 rounded-xl relative overflow-hidden min-h-[300px]">
              
              {/* Radial glow representing general risk level color */}
              <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-[0.05] ${
                diag.riskLevelColor === 'red' ? 'bg-red-600' :
                diag.riskLevelColor === 'yellow' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} style={{ filter: 'blur(35px)' }} />

              <div className="text-[10px] text-slate-400 absolute top-3 left-4 border-l-2 border-indigo-500 pl-2">
                Peligro Activo: <span className="text-slate-100 font-black">{diag.threatName}</span>
              </div>

              {/* The main dynamic high-resolution vector diamond */}
              <div className="flex justify-center items-center w-full max-w-[210px] pt-4 select-none">
                <svg width="100%" height="100%" viewBox="0 0 240 250" className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)]">
                  <defs>
                    <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="grad-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F87171" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>

                  {/* 1. TOP DIAMOND: AMENAZA */}
                  <polygon
                    points="120,15 175,70 120,125 65,70"
                    fill={`url(#grad-${diag.aColorName})`}
                    stroke={diag.aColorName === 'green' ? '#047857' : diag.aColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                    strokeWidth="2.5"
                    className="transition-all duration-300 hover:brightness-110"
                  />
                  <g className="pointer-events-none select-none">
                    <text x="120" y="52" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle">A</text>
                    <text x="120" y="65" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#E2E8F0" textAnchor="middle" letterSpacing="0.8">AMENAZA</text>
                    <text x="120" y="80" fontFamily="monospace" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">({diag.aVal})</text>
                  </g>

                  {/* 2. LEFT DIAMOND: PERSONAS */}
                  <polygon
                    points="65,70 120,125 65,180 10,125"
                    fill={`url(#grad-${diag.pColorName})`}
                    stroke={diag.pColorName === 'green' ? '#047857' : diag.pColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                    strokeWidth="2.5"
                    className="transition-all duration-300 hover:brightness-110"
                  />
                  <g className="pointer-events-none select-none">
                    <text x="65" y="108" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle">P</text>
                    <text x="65" y="121" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#E2E8F0" textAnchor="middle" letterSpacing="0.8">PERSONAS</text>
                    <text x="65" y="136" fontFamily="monospace" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">({diag.pVal})</text>
                  </g>

                  {/* 3. RIGHT DIAMOND: RECURSOS */}
                  <polygon
                    points="175,70 230,125 175,180 120,125"
                    fill={`url(#grad-${diag.rColorName})`}
                    stroke={diag.rColorName === 'green' ? '#047857' : diag.rColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                    strokeWidth="2.5"
                    className="transition-all duration-300 hover:brightness-110"
                  />
                  <g className="pointer-events-none select-none">
                    <text x="175" y="108" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle">R</text>
                    <text x="175" y="121" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#E2E8F0" textAnchor="middle" letterSpacing="0.8">RECURSOS</text>
                    <text x="175" y="136" fontFamily="monospace" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">({diag.rVal})</text>
                  </g>

                  {/* 4. BOTTOM DIAMOND: SISTEMAS */}
                  <polygon
                    points="120,125 175,180 120,235 65,180"
                    fill={`url(#grad-${diag.sColorName})`}
                    stroke={diag.sColorName === 'green' ? '#047857' : diag.sColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                    strokeWidth="2.5"
                    className="transition-all duration-300 hover:brightness-110"
                  />
                  <g className="pointer-events-none select-none">
                    <text x="120" y="163" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle">S</text>
                    <text x="120" y="176" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#E2E8F0" textAnchor="middle" letterSpacing="0.8">SISTEMAS</text>
                    <text x="120" y="191" fontFamily="monospace" fontSize="10" fontWeight="900" fill="#FFFFFF" textAnchor="middle">({diag.sVal})</text>
                  </g>

                  {/* 5. CENTER ESTIMATION BADGE */}
                  <circle
                    cx="120"
                    cy="125"
                    r="34"
                    fill={`url(#grad-${diag.riskLevelColor})`}
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="transition-all duration-300 filter drop-shadow-md"
                  />
                  <g className="pointer-events-none select-none">
                    <text x="120" y="117" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="900" fill="#FFFFFF" textAnchor="middle" opacity="0.9" letterSpacing="0.5">RIESGO</text>
                    <text x="120" y="133" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">{diag.riskLevel}</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Quick component details showing metrics */}
            <div className="mt-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
              <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Desglose Analítico por Elemento
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase leading-none">Amenaza</span>
                    <span className="font-black text-slate-200 mt-1 block">{activeThreat ? activeThreat.qualification : 'N/A'}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    diag.aColorName === 'red' ? 'bg-red-500' : diag.aColorName === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase leading-none">Personas</span>
                    <span className="font-black text-slate-200 mt-1 block">Prom. {vulnerabilitySummary.personas.score.toFixed(2)}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    diag.pColorName === 'red' ? 'bg-red-500' : diag.pColorName === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase leading-none">Recursos</span>
                    <span className="font-black text-slate-200 mt-1 block">Prom. {vulnerabilitySummary.recursos.score.toFixed(2)}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    diag.rColorName === 'red' ? 'bg-red-500' : diag.rColorName === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase leading-none">Sistemas</span>
                    <span className="font-black text-slate-200 mt-1 block">Prom. {vulnerabilitySummary.sistemas.score.toFixed(2)}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    diag.sColorName === 'red' ? 'bg-red-500' : diag.sColorName === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>
              </div>

              {/* Live dynamic SST response guidance */}
              <div className="p-3 rounded-lg bg-slate-900/90 border-l-4 border-l-indigo-500 text-[11px] leading-relaxed text-slate-300">
                <span className="font-black text-white text-xs block mb-1">Guía Metodológica de Acción (SST):</span>
                {diag.riskLevel === 'ALTO' ? (
                  <span>
                    🔴 <strong>RIESGO ALTO (Plan de Choque):</strong> Se requiere detener inmediatamente las actividades de alto riesgo asociadas. Implemente alarmas sonoras NSR-10, rutas protegidas y capacite a toda la brigada de emergencias en la supresión de fuegos químicos o sismos de inmediato.
                  </span>
                ) : diag.riskLevel === 'MEDIO' ? (
                  <span>
                    🟡 <strong>RIESGO MEDIO (Control Administrativo):</strong> Se programarán auditorías correctoras. Complete la dotación faltante del botiquín tipo A, instale lámparas LED autónomas en las rutas y proceda a certificar la red hidráulica.
                  </span>
                ) : (
                  <span>
                    🟢 <strong>RIESGO BAJO (Mejora Continua):</strong> Mantenga los controles existentes del SG-SST. Se recomienda realizar simulacros de evacuación anuales coordinados y mantener el registro en almacenamiento para fiscalización legal.
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800/80 pt-2.5 mt-4">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Verde (Bajo)</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Amarillo (Medio)</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Rojo (Alto)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
