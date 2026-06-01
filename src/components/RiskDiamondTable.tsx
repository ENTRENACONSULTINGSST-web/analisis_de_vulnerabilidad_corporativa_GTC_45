/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThreatItem, getScoreInterpretationColor, getThreatColor } from '../types';
import { ShieldCheck, Info } from 'lucide-react';
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
  const [hoveredThreatId, setHoveredThreatId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

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

  const getColorBadgeClass = (col: string) => {
    switch (col) {
      case 'G': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold';
      case 'Y': return 'bg-amber-500/20 text-text-amber-400 border border-amber-500/30 font-bold';
      case 'R': return 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  // Find the currently active/hovered threat or default to the first one
  const activeThreat = threats.find(t => t.id === hoveredThreatId) || threats[0];

  const getDiagValues = () => {
    if (!activeThreat) {
      return {
        aVal: 'P-P',
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

    // Threat qualification -> A-P (Possible/Probable) or A-I (Inminente)
    const aVal = `A-${activeThreat.qualification === 'INMINENTE' ? 'I' : 'P'}`;
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

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-6" id="diamante-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800" id="titulo-diamante-riesgo">
            4. Consolidado e Interpretación del Nivel de Riesgo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            La matriz de riesgo interactiva une la calificación de la amenaza (superior) con los tres componentes de la vulnerabilidad corporativa (Personas: izquierda, Recursos: derecha, Sistemas: inferior) para calcular el nivel de riesgo unificado.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportDropdown
            elementId="diamante-section"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white font-bold h-10 text-center">
              <th className="px-4 py-2 border-b border-slate-700 text-left w-[25%]">AMENAZA</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[12%]">COLOR AMENAZA</th>
              <th className="px-3 py-2 text-center border-b border-slate-700 w-[33%]">VULNERABILIDAD (P, R, S)</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">DIAMANTE DE RIESGO</th>
              <th className="px-4 py-2 text-center border-b border-slate-700 w-[15%]">NIVEL RIESGO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['NATURAL', 'TECNOLÓGICO', 'SOCIAL'].map((category) => {
              const matchedThreats = threats.filter(t => t.category === category);
              if (matchedThreats.length === 0) return null;

              return (
                <React.Fragment key={category}>
                  {/* Categoría header */}
                  <tr className="bg-slate-100 font-bold text-slate-700">
                    <td colSpan={5} className="px-4 py-2 text-[10px] uppercase tracking-wide">
                      Clasificación de Riesgos: {category}
                    </td>
                  </tr>

                  {matchedThreats.map((threat) => {
                    const row = getRiskDetails(threat);

                    return (
                      <tr
                        key={threat.id}
                        className="hover:bg-slate-50 bg-white transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredThreatId(threat.id)}
                        onMouseLeave={() => setHoveredThreatId(null)}
                      >
                        {/* Threat Name */}
                        <td className="px-4 py-4 font-semibold text-slate-800 border-r border-slate-100">
                          {threat.name}
                        </td>

                        {/* Threat Danger Color Column */}
                        <td className="px-4 py-4 border-r border-slate-100 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={`w-3.5 h-3.5 rotate-45 border ${
                              row.amenazaColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                              row.amenazaColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                            }`} />
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{row.amenazaColor}</span>
                          </div>
                        </td>

                        {/* Vulnerability indicators columns */}
                        <td className="px-3 py-4 border-r border-slate-100">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {/* Personas */}
                            <div className="p-1 px-1.5 border border-slate-100/50 rounded bg-slate-50">
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Personas</div>
                              <div className="flex justify-center items-center gap-1">
                                <span className={`w-2.5 h-2.5 rotate-45 border ${
                                  row.personasColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                                  row.personasColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                                }`} />
                                <span className={`text-[9px] font-extrabold uppercase ${
                                  row.personasColor === 'green' ? 'text-emerald-700' :
                                  row.personasColor === 'yellow' ? 'text-amber-700' : 'text-red-700'
                                }`}>
                                  {row.personasColor === 'green' ? 'BAJO' : row.personasColor === 'yellow' ? 'MED' : 'ALTO'}
                                </span>
                              </div>
                            </div>

                            {/* Recursos */}
                            <div className="p-1 px-1.5 border border-slate-100/50 rounded bg-slate-50">
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Recursos</div>
                              <div className="flex justify-center items-center gap-1">
                                <span className={`w-2.5 h-2.5 rotate-45 border ${
                                  row.recursosColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                                  row.recursosColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                                }`} />
                                <span className={`text-[9px] font-extrabold uppercase ${
                                  row.recursosColor === 'green' ? 'text-emerald-700' :
                                  row.recursosColor === 'yellow' ? 'text-amber-700' : 'text-red-700'
                                }`}>
                                  {row.recursosColor === 'green' ? 'BAJO' : row.recursosColor === 'yellow' ? 'MED' : 'ALTO'}
                                </span>
                              </div>
                            </div>

                            {/* Sistemas */}
                            <div className="p-1 px-1.5 border border-slate-100/50 rounded bg-slate-50">
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sistemas</div>
                              <div className="flex justify-center items-center gap-1">
                                <span className={`w-2.5 h-2.5 rotate-45 border ${
                                  row.sistemasColor === 'green' ? 'bg-emerald-500 border-emerald-600' :
                                  row.sistemasColor === 'yellow' ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'
                                }`} />
                                <span className={`text-[9px] font-extrabold uppercase ${
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
                        <td className="px-4 py-4 border-r border-slate-100 text-center">
                          <div className="flex justify-center items-center">
                            <svg width="60" height="60" viewBox="0 0 80 80" className="drop-shadow-sm">
                              {/* 1. Top Diamond: Amenaza */}
                              <polygon
                                points="40,0 60,20 40,40 20,20"
                                fill={getFillColor(row.amenazaColor)}
                                stroke={getStrokeColor(row.amenazaColor)}
                                strokeWidth="2"
                                title={`Amenaza: ${threat.qualification}`}
                              />
                              <text x="40" y="23" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="extrabold" fill="white" textAnchor="middle" className="select-none">A</text>

                              {/* 2. Left Diamond: Personas */}
                              <polygon
                                points="20,20 40,40 20,60 0,40"
                                fill={getFillColor(row.personasColor)}
                                stroke={getStrokeColor(row.personasColor)}
                                strokeWidth="2"
                                title="Vulnerabilidad Personas"
                              />
                              <text x="20" y="43" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="extrabold" fill="white" textAnchor="middle" className="select-none">P</text>

                              {/* 3. Right Diamond: Recursos */}
                              <polygon
                                points="60,20 80,40 60,60 40,40"
                                fill={getFillColor(row.recursosColor)}
                                stroke={getStrokeColor(row.recursosColor)}
                                strokeWidth="2"
                                title="Vulnerabilidad Recursos"
                              />
                              <text x="60" y="43" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="extrabold" fill="white" textAnchor="middle" className="select-none">R</text>

                              {/* 4. Bottom Diamond: Sistemas y Procesos */}
                              <polygon
                                points="40,40 60,60 40,80 20,60"
                                fill={getFillColor(row.sistemasColor)}
                                stroke={getStrokeColor(row.sistemasColor)}
                                strokeWidth="2"
                                title="Vulnerabilidad Sistemas"
                              />
                              <text x="40" y="63" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="extrabold" fill="white" textAnchor="middle" className="select-none">S</text>
                            </svg>
                          </div>
                        </td>

                        {/* Calculated Risk Level text with colorful container styling */}
                        <td className="px-4 py-4 text-center">
                          <div className={`p-2 rounded-lg border font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            row.level === 'ALTO'
                              ? 'bg-red-50 border-red-200 text-red-700 font-extrabold shadow-sm'
                              : row.level === 'MEDIO'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold shadow-sm'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold shadow-sm'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              row.level === 'ALTO' ? 'bg-red-600 animate-pulse' : row.level === 'MEDIO' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <span>{row.level}</span>
                          </div>
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

      {/* Grid container combining general GTC-45 list guide and stylized monospaced diamond representation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="guia-y-esquema-de-diamante">
        {/* Left column: Text descriptions */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-100 p-5 rounded-xl flex gap-3" id="guia-interpretacion-diamante">
          <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Cálculo de Nivel de Riesgo (Metodología del Diamante):</p>
            <p className="leading-relaxed">
              Para cada fila, se evalúan los cuatro rombos constituyentes (<strong>A</strong>: Amenaza, <strong>P</strong>: Personas, <strong>R</strong>: Recursos, <strong>S</strong>: Sistemas y Procesos):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-500 leading-relaxed mt-2">
              <li><strong className="text-red-600">RIESGO ALTO (Rojo)</strong>: 3 o 4 rombos calificados en Rojo. Requiere intervención prioritaria o detención de operaciones en áreas extremas.</li>
              <li><strong className="text-amber-600">RIESGO MEDIO (Amarillo)</strong>: 1 o 2 rombos en Rojo, o 3 o 4 rombos en Amarillo. Requiere planes de mejora y mitigación estructurados.</li>
              <li><strong className="text-emerald-600">RIESGO BAJO (Verde)</strong>: 0 rombos en Rojo y máximo 2 rombos en Amarillo. Representa una organización preparada con planes preventivos activos.</li>
            </ul>
          </div>
        </div>

        {/* Right column: Beautiful Vector Interactive 4-Rombo Diagram */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-xl flex flex-col justify-between shadow-xl" id="grafico-section">
          <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-800/60 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                Definición Gráfica del Riesgo (FOP)
              </h4>
              <p className="text-[10px] text-slate-400">
                Pase el cursor por la tabla para mapear.
              </p>
            </div>
            <ExportDropdown
              elementId="grafico-section"
              align="right"
            />
          </div>

          <div className="flex flex-col items-center justify-center py-6 bg-slate-950/60 border border-slate-800/60 rounded-xl relative overflow-hidden min-h-[300px]">
            {/* Background subtle radial glow matching risk status */}
            <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-[0.04] ${
              diag.riskLevelColor === 'red' ? 'bg-red-600' :
              diag.riskLevelColor === 'yellow' ? 'bg-amber-500' :
              'bg-emerald-500'
            }`} style={{ filter: 'blur(40px)' }} />

            <div className="text-[10px] text-slate-400 absolute top-3 left-4 border-l-2 border-indigo-500 pl-2">
              Mapeado Activo: <span className="text-slate-200 font-extrabold">{diag.threatName}</span>
            </div>

            {/* The main SVG 4-Rombo Visual graphic container */}
            <div className="flex justify-center items-center w-full max-w-[240px] pt-4 select-none">
              <svg width="100%" height="100%" viewBox="0 0 240 250" className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                <defs>
                  {/* Glass-smooth linear gradients for high aesthetic quality */}
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
                  strokeWidth="2"
                  className="transition-all duration-300 hover:brightness-110 cursor-help"
                />
                <g className="pointer-events-none select-none">
                  <text x="120" y="52" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">A</text>
                  <text x="120" y="65" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="700" fill="#E2E8F0" textAnchor="middle" letterSpacing="1">AMENAZA</text>
                  <text x="120" y="80" fontFamily="monospace" fontSize="10" fontWeight="800" fill="#FFFFFF" textAnchor="middle">({diag.aVal})</text>
                </g>

                {/* 2. LEFT DIAMOND: PERSONAS */}
                <polygon
                  points="65,70 120,125 65,180 10,125"
                  fill={`url(#grad-${diag.pColorName})`}
                  stroke={diag.pColorName === 'green' ? '#047857' : diag.pColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:brightness-110 cursor-help"
                />
                <g className="pointer-events-none select-none">
                  <text x="65" y="108" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">P</text>
                  <text x="65" y="121" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="700" fill="#E2E8F0" textAnchor="middle" letterSpacing="1">PERSONAS</text>
                  <text x="65" y="136" fontFamily="monospace" fontSize="10" fontWeight="800" fill="#FFFFFF" textAnchor="middle">({diag.pVal})</text>
                </g>

                {/* 3. RIGHT DIAMOND: RECURSOS */}
                <polygon
                  points="175,70 230,125 175,180 120,125"
                  fill={`url(#grad-${diag.rColorName})`}
                  stroke={diag.rColorName === 'green' ? '#047857' : diag.rColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:brightness-110 cursor-help"
                />
                <g className="pointer-events-none select-none">
                  <text x="175" y="108" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">R</text>
                  <text x="175" y="121" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="700" fill="#E2E8F0" textAnchor="middle" letterSpacing="1">RECURSOS</text>
                  <text x="175" y="136" fontFamily="monospace" fontSize="10" fontWeight="800" fill="#FFFFFF" textAnchor="middle">({diag.rVal})</text>
                </g>

                {/* 4. BOTTOM DIAMOND: SISTEMAS */}
                <polygon
                  points="120,125 175,180 120,235 65,180"
                  fill={`url(#grad-${diag.sColorName})`}
                  stroke={diag.sColorName === 'green' ? '#047857' : diag.sColorName === 'yellow' ? '#B45309' : '#B91C1C'}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:brightness-110 cursor-help"
                />
                <g className="pointer-events-none select-none">
                  <text x="120" y="163" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">S</text>
                  <text x="120" y="176" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="700" fill="#E2E8F0" textAnchor="middle" letterSpacing="1">SISTEMAS</text>
                  <text x="120" y="191" fontFamily="monospace" fontSize="10" fontWeight="800" fill="#FFFFFF" textAnchor="middle">({diag.sVal})</text>
                </g>

                {/* 5. CENTER INTERACTIVE DIODE CIRCLE: ESTIMADOR DE RIESGO */}
                <circle
                  cx="120"
                  cy="125"
                  r="34"
                  fill={`url(#grad-${diag.riskLevelColor})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="transition-all duration-300 filter drop-shadow-md cursor-pointer hover:scale-105"
                />
                <g className="pointer-events-none select-none">
                  <text x="120" y="117" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="800" fill="#FFFFFF" textAnchor="middle" opacity="0.9" letterSpacing="0.5">RIESGO</text>
                  <text x="120" y="133" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">{diag.riskLevel}</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2.5 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-600 inline-block" /> Verde (Bajo)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-600 inline-block" /> Amarillo (Medio)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 border border-red-600 inline-block" /> Rojo (Alto)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
