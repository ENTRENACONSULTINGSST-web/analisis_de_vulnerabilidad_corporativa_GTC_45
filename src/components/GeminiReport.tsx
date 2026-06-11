/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, FileDown, RefreshCw, AlertCircle, Edit3, Save } from 'lucide-react';
import { VulnerabilityCategory, ThreatItem } from '../types';
import { exportToWord } from '../utils/wordExport';

interface GeminiReportProps {
  categories: VulnerabilityCategory[];
  vulnerabilitySummary: {
    personas: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
    recursos: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
    sistemas: { score: number; color: 'green' | 'yellow' | 'red'; interpretation: string };
  };
  threats: ThreatItem[];
  getRiskDetails: (threat: ThreatItem) => {
    personasColor: 'green' | 'yellow' | 'red';
    recursosColor: 'green' | 'yellow' | 'red';
    sistemasColor: 'green' | 'yellow' | 'red';
    amenazaColor: 'green' | 'yellow' | 'red';
    level: 'BAJO' | 'MEDIO' | 'ALTO';
    levelColor: 'green' | 'yellow' | 'red';
  };
}

function generateClientReport(
  summary: {
    personas: { score: number; interpretation: string };
    recursos: { score: number; interpretation: string };
    sistemas: { score: number; interpretation: string };
  },
  activeThreats: ThreatItem[]
): string {
  const pScore = summary.personas.score;
  const pInterp = summary.personas.interpretation;
  const rScore = summary.recursos.score;
  const rInterp = summary.recursos.interpretation;
  const sScore = summary.sistemas.score;
  const sInterp = summary.sistemas.interpretation;

  const filteredThreats = activeThreats.filter((t: any) => t.qualification !== 'BAJO');

  return `### Informe Técnico de Análisis de Riesgos y Vulnerabilidades (Metodología Diamante de Riesgo GTC-45)

*Nota: Reporte generado de manera local debido a que la aplicación está operando en modalidad estática (GitHub Pages).*

---

#### 1. Diagnóstico de Vulnerabilidades por Componente

*   **EN LAS PERSONAS**: Calificación de **${pScore.toFixed(2)} (${pInterp.toUpperCase()})**
    *   *Hallazgo*: Se requiere consolidar el nivel de capacitación preventiva y formalizar la conformación de coordinadores de evacuación.
*   **EN LOS RECURSOS**: Calificación de **${rScore.toFixed(2)} (${rInterp.toUpperCase()})**
    *   *Hallazgo*: Se detectan oportunidades de mejora en la operatividad de gabinetes/hidrantes y la adición de doble pasamanos continuo en escaleras.
*   **EN LOS SISTEMAS Y PROCESOS**: Calificación de **${sScore.toFixed(2)} (${sInterp.toUpperCase()})**
    *   *Hallazgo*: Es recomendable robustecer los sistemas alternos de almacenamiento magnético de datos y planes generales de continuidad operativa.

---

#### 2. Evaluación de Amenazas Críticas

Se han mapeado las siguientes fuentes de riesgo calificadas como Medias o Altas con prioridad de atención en el Plan de Emergencias:
${filteredThreats.length > 0
  ? filteredThreats.map((t: any) => `*   **${t.name}** (${t.category}): Calificación **${t.qualification}**. Fuente: *${t.source || 'Registro interno'}*`).join('\n')
  : '*   *No se registraron amenazas calificadas como Medias o Altas en la matriz de análisis actual.*'
}

---

#### 3. Plan de Acción de Mitigación y Contingencia

##### A. Acciones Inmediatas (Corto Plazo - < 30 días)
1.  **Organización**: Oficializar los nombramientos de los integrantes de la **Brigada de Emergencias** y capacitar según sus correspondientes funciones.
2.  **Sistemas**: Dotar de lámparas autónomas de emergencia los tramos de evacuación y salidas del complejo.
3.  **Recursos**: Coordinar con el área de mantenimiento preventivo pruebas operativas de presión en redes y sistemas portátiles de extinción.

##### B. Acciones Preventivas (Mediano Plazo - 3 a 6 meses)
1.  **Capacitaciones**: Implementar talleres prácticos de manejo de conatos de incendio y rescate, con apoyo de la ARL correspondientes.
2.  **Infraestructura**: Corregir barandas en flujos peatonales elevados y mantener demarcaciones de seguridad legibles.
3.  **Resguardo Logístico**: Desarrollar un protocolo sistematizado de copias de seguridad de datos esenciales empresariales de forma remota.

##### C. Simulacros y Continuidad (Largo Plazo - Actividad Permanente)
1.  **Simulacros**: Programar anualmente un ejercicio práctico de simulacro de evacuación, midiendo tiempos e idoneidad de la respuesta.
2.  **Señalización**: Disponer planos técnicos con rutas de escape y puntos seguros de congregación en zonas de alta concurrencia.`;
}

export const GeminiReport: React.FC<GeminiReportProps> = ({
  categories,
  vulnerabilitySummary,
  threats,
  getRiskDetails
}) => {
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vulnerabilitySummary,
          threats
        })
      });

      if (!response.ok) {
        throw new Error('Falla de red en servidor de consulta.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReportText(data.report || 'No se obtuvo reporte del servidor.');
    } catch (err: any) {
      console.warn("Utilizando motor offline de reporte local:", err);
      const localReport = generateClientReport(vulnerabilitySummary, threats);
      setReportText(localReport);
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    exportToWord(categories, vulnerabilitySummary, threats, getRiskDetails, reportText);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 sm:p-6 space-y-6" id="contenedor-reporte-consultor">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2" id="titulo-reporte-consultor">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>5. Informe Ejecutivo & Recomendaciones de Mitigación</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Genere recomendaciones estratégicas de Seguridad y Salud en el Trabajo basadas en los cuestionarios y descárguelo como documento oficial de Word.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {reportText && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              title="Permite editar las recomendaciones de forma manual"
              id="btn-edit-report"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Vista Previa' : 'Editar Informe'}</span>
            </button>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="px-3 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            id="btn-generate-report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{reportText ? 'Regenerar Informe' : 'Generar Informe con IA'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700 text-xs lines-relaxed" id="alerta-error-reporte">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Error de Generación:</p>
            <p>{error}</p>
            <p className="text-slate-500 mt-1">Nota: Puede proceder a descargar el archivo de Word consolidado que incluye las tablas rellenadas e indicadores de todos modos.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl" id="cargando-informe">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700">Analizando matrices de vulnerabilidad...</p>
            <p className="text-[10px] text-slate-400 mt-1">Nuestra IA consultora está estructurando prioridades para la organización.</p>
          </div>
        </div>
      ) : reportText ? (
        <div className="space-y-4" id="seccion-visualizador-informe">
          {isEditing ? (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500 leading-snug">Editor de Minuta Técnica SST</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full h-[400px] p-4 text-xs font-mono border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-medium leading-relaxed bg-slate-50"
                id="area-editor-informe"
              />
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl max-h-[500px] overflow-y-auto text-xs text-slate-700 leading-relaxed space-y-4 font-sans markdown-content" id="reporte-renderizado">
              {reportText.split('\n').map((line, idx) => {
                const str = line.trim();
                if (!str) return <div key={idx} className="h-2" />;
                
                if (str.startsWith('###')) {
                  return <h3 key={idx} className="text-sm font-bold text-slate-800 mt-4 border-b border-slate-200/50 pb-1 uppercase">{str.substring(4)}</h3>;
                }
                if (str.startsWith('####')) {
                  return <h4 key={idx} className="text-xs font-bold text-slate-700 mt-3">{str.substring(5)}</h4>;
                }
                if (str.startsWith('##')) {
                  return <h2 key={idx} className="text-base font-bold text-slate-900 mt-6 border-b border-slate-200 pb-1">{str.substring(3)}</h2>;
                }
                if (str.startsWith('#')) {
                  return <h1 key={idx} className="text-lg font-bold text-slate-900 mt-8 border-b-2 border-slate-300 pb-1">{str.substring(2)}</h1>;
                }
                if (str.startsWith('*') || str.startsWith('-')) {
                  return (
                    <li key={idx} className="ml-4 list-disc pl-1 py-0.5 text-slate-600">
                      {str.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '$1')}
                    </li>
                  );
                }
                
                // Simple inline bold replacement simulation
                const parts = str.split('**');
                return (
                  <p key={idx} className="text-slate-600 tracking-normal text-justify leading-relaxed">
                    {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-slate-800">{p}</strong> : p)}
                  </p>
                );
              })}
            </div>
          )}

          {/* Word Downloader Footer Action */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={triggerDownload}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 tracking-wide cursor-pointer transition-all shadow-sm"
              id="btn-download-word"
            >
              <FileDown className="w-4 h-4" />
              <span>DESCARGAR COMPLETO EN WORD (.DOC)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-slate-50 border border-dashed border-slate-100 rounded-xl" id="informe-vacio">
          <AlertCircle className="w-7 h-7 text-slate-300" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500">¿Desea generar el plan de recomendaciones?</p>
            <p className="text-[10px] text-slate-400 mt-1">Analice sus puntajes con inteligencia artificial para estructurar las tareas priorizadas.</p>
          </div>
          <button
            onClick={generateReport}
            className="mt-2 px-3 py-1.8 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            id="btn-generate-initial"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar Diagnóstico Inicial</span>
          </button>
        </div>
      )}
    </div>
  );
};
