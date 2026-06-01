/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  VulnerabilityCategory,
  ThreatItem,
  DEFAULT_VULNERABILITY_DATA,
  DEFAULT_THREATS_DATA,
  getScoreInterpretationColor,
  getThreatColor
} from './types';
import { InputTables } from './components/InputTables';
import { ConsolidadoTable } from './components/ConsolidadoTable';
import { ThreatsTable } from './components/ThreatsTable';
import { RiskDiamondTable } from './components/RiskDiamondTable';
import { GeminiReport } from './components/GeminiReport';
import { ShieldAlert, BookOpen, BarChart3, Database, MessageSquare, Upload, Download } from 'lucide-react';

export default function App() {
  // 1. Core Reactive States loaded safely from Local Storage
  const [categories, setCategories] = useState<VulnerabilityCategory[]>(() => {
    try {
      const stored = localStorage.getItem('vulnerability_categories_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Local storage categories loading error:", e);
    }
    return DEFAULT_VULNERABILITY_DATA;
  });

  const [threats, setThreats] = useState<ThreatItem[]>(() => {
    try {
      const stored = localStorage.getItem('vulnerability_threats_data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Local storage threats loading error:", e);
    }
    return DEFAULT_THREATS_DATA;
  });

  // UI state for active sub-table inside the Input Forms
  const [activeInputTab, setActiveInputTab] = useState<string>('personas');

  // UI state for high-level sections navigation
  const [sectionFilter, setSectionFilter] = useState<'all' | 'inputs' | 'outputs' | 'report'>('all');

  // 2. Synchronize to Local Storage on change
  useEffect(() => {
    localStorage.setItem('vulnerability_categories_data', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vulnerability_threats_data', JSON.stringify(threats));
  }, [threats]);

  // 3. State update functions
  const handleChangeScore = (catId: string, secId: string, qId: string, newScore: number) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          sections: cat.sections.map(sec => {
            if (sec.id !== secId) return sec;
            return {
              ...sec,
              questions: sec.questions.map(q => {
                if (q.id !== qId) return q;
                return { ...q, score: newScore };
              })
            };
          })
        };
      })
    );
  };

  const handleChangeObservation = (catId: string, secId: string, qId: string, text: string) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id !== catId) return cat;
        return {
          ...cat,
          sections: cat.sections.map(sec => {
            if (sec.id !== secId) return sec;
            return {
              ...sec,
              questions: sec.questions.map(q => {
                if (q.id !== qId) return q;
                return { ...q, observation: text };
              })
            };
          })
        };
      })
    );
  };

  const handleChangeThreat = (id: string, field: string, value: any) => {
    setThreats(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        return { ...t, [field]: value };
      })
    );
  };

  const handleAddThreat = (newThreat: Omit<ThreatItem, 'id'>) => {
    const id = `t_user_${Date.now()}`;
    setThreats(prev => [...prev, { ...newThreat, id }]);
  };

  const handleDeleteThreat = (id: string) => {
    setThreats(prev => prev.filter(t => t.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm('¿Está seguro de restablecer todos los puntajes, comentarios y amenazas a sus valores predeterminados iniciales? Se perderán las modificaciones locales.')) {
      setCategories(DEFAULT_VULNERABILITY_DATA);
      setThreats(DEFAULT_THREATS_DATA);
      localStorage.removeItem('vulnerability_categories_data');
      localStorage.removeItem('vulnerability_threats_data');
    }
  };

  const handleExportWorkspace = () => {
    const backup = {
      version: '1',
      timestamp: new Date().toISOString(),
      categories,
      threats
    };
    const content = JSON.stringify(backup, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AV_Configuracion_Completa_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.threats)) {
          setCategories(parsed.categories);
          setThreats(parsed.threats);
          alert('¡Configuración completa cargada correctamente!');
        } else {
          alert('El archivo cargado no contiene un formato de configuración válido.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo de configuración. Asegúrese de que sea un archivo JSON válido exportado previamente.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Mathematical derivations of averages and root category aggregates
  const calculateCategoryTotal = (catId: string): number => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 0;
    
    // Sum of section averages
    return cat.sections.reduce((sum, sec) => {
      if (sec.questions.length === 0) return sum;
      const secAvg = sec.questions.reduce((qSum, q) => qSum + q.score, 0) / sec.questions.length;
      return sum + secAvg;
    }, 0);
  };

  const getInterpretationString = (score: number): string => {
    if (score >= 0.0 && score <= 1.0) return 'BAJO';
    if (score > 1.0 && score <= 2.0) return 'MEDIO';
    return 'ALTO';
  };

  const getVulnerabilitySummary = () => {
    const pScore = calculateCategoryTotal('personas');
    const rScore = calculateCategoryTotal('recursos');
    const sScore = calculateCategoryTotal('sistemas');

    return {
      personas: {
        score: pScore,
        color: getScoreInterpretationColor(pScore),
        interpretation: getInterpretationString(pScore)
      },
      recursos: {
        score: rScore,
        color: getScoreInterpretationColor(rScore),
        interpretation: getInterpretationString(rScore)
      },
      sistemas: {
        score: sScore,
        color: getScoreInterpretationColor(sScore),
        interpretation: getInterpretationString(sScore)
      }
    };
  };

  const vulnerabilitySummary = getVulnerabilitySummary();

  // 5. Matrix Risk Diamond levels resolution row by row
  const getRiskDetails = (threat: ThreatItem) => {
    const pColor = vulnerabilitySummary.personas.color;
    const rColor = vulnerabilitySummary.recursos.color;
    const sColor = vulnerabilitySummary.sistemas.color;
    const tColor = getThreatColor(threat.qualification);

    // Count Red segments and Yellow segments
    const colors = [pColor, rColor, sColor, tColor];
    const redCount = colors.filter(c => c === 'red').length;
    const yellowCount = colors.filter(c => c === 'yellow').length;

    let level: 'BAJO' | 'MEDIO' | 'ALTO' = 'BAJO';
    let levelColor: 'green' | 'yellow' | 'red' = 'green';

    if (redCount >= 3) {
      level = 'ALTO';
      levelColor = 'red';
    } else if ((redCount >= 1 && redCount <= 2) || yellowCount >= 3) {
      level = 'MEDIO';
      levelColor = 'yellow';
    } else {
      level = 'BAJO';
      levelColor = 'green';
    }

    return {
      personasColor: pColor,
      recursosColor: rColor,
      sistemasColor: sColor,
      amenazaColor: tColor,
      level,
      levelColor
    };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="applet-raiz">
      {/* Top Professional Generic Header Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 transition-all shadow-sm" id="barra-navegacion-principal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              AV
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
                Análisis de Vulnerabilidad Corporativa
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Metodología del Diamante de Riesgos (Norma Técnica GTC-45)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <label
              htmlFor="workspace-import-input"
              className="px-2.5 sm:px-3 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              id="btn-importar-config"
              title="Cargar un archivo JSON guardado de cuestionarios y amenazas"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Importar Copia</span>
              <span className="inline md:hidden">Importar</span>
            </label>
            <input
              type="file"
              id="workspace-import-input"
              accept=".json"
              onChange={handleImportWorkspace}
              className="hidden"
            />
            <button
              onClick={handleExportWorkspace}
              className="px-2.5 sm:px-3 py-1.8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              id="btn-exportar-config"
              title="Descargar toda la información configurada como una copia de seguridad JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Exportar Copia</span>
              <span className="inline md:hidden">Exportar</span>
            </button>
            <button
              onClick={handleResetData}
              className="px-2.5 sm:px-3 py-1.8 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              id="btn-restablecer-datos"
            >
              Restablecer
            </button>
          </div>
        </div>
      </header>

      {/* Control filter panel (Tab Rails) */}
      <div className="bg-slate-100/60 border-b border-slate-100 py-3" id="barra-filtros-secciones">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Ver Todo', icon: BookOpen },
              { id: 'inputs', label: '1. Cuestionarios (Entrada)', icon: Database },
              { id: 'outputs', label: '2. Matriz y Diamantes', icon: BarChart3 },
              { id: 'report', label: '3. Informe & Recomendaciones', icon: MessageSquare }
            ].map(sec => {
              const IconComp = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSectionFilter(sec.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    sectionFilter === sec.id
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  id={`filter-sec-btn-${sec.id}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 font-medium hidden md:block">
            Sincronizado con almacenamiento local automáticamente.
          </div>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* SECTION 1: Questionnaire inputs (Input Tables) */}
        {(sectionFilter === 'all' || sectionFilter === 'inputs') && (
          <section className="space-y-4" id="contenedor-seccion-formularios">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-slate-800 text-white font-extrabold text-xs rounded-full">1</span>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Diligenciamiento de Vulnerabilidades</h2>
            </div>
            <InputTables
              categories={categories}
              onChangeScore={handleChangeScore}
              onChangeObservation={handleChangeObservation}
              activeTab={activeInputTab}
              setActiveTab={setActiveInputTab}
            />
          </section>
        )}

        {/* SECTION 2: Dynamic Consolidated Outputs (Consolidado, Threat Analysis, Risk Diamond tables) */}
        {(sectionFilter === 'all' || sectionFilter === 'outputs') && (
          <section className="space-y-10" id="contenedor-seccion-resultados">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-slate-800 text-white font-extrabold text-xs rounded-full">2</span>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Resultados y Matriz de Riesgo</h2>
            </div>

            {/* A. Summary Aggregated values */}
            <ConsolidadoTable
              categories={categories}
              vulnerabilitySummary={vulnerabilitySummary}
            />

            {/* B. Threats Identification List */}
            <ThreatsTable
              threats={threats}
              onChangeThreat={handleChangeThreat}
              onAddThreat={handleAddThreat}
              onDeleteThreat={handleDeleteThreat}
            />

            {/* C. Risk Diamond Matrice Mapping */}
            <RiskDiamondTable
              threats={threats}
              vulnerabilitySummary={vulnerabilitySummary}
              getRiskDetails={getRiskDetails}
            />
          </section>
        )}

        {/* SECTION 3: Executive Advisor (Gemini integration & Word downlader) */}
        {(sectionFilter === 'all' || sectionFilter === 'report') && (
          <section className="space-y-4" id="contenedor-seccion-informe">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-slate-800 text-white font-extrabold text-xs rounded-full">3</span>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Consultoría de Acción SST</h2>
            </div>
            <GeminiReport
              categories={categories}
              vulnerabilitySummary={vulnerabilitySummary}
              threats={threats}
              getRiskDetails={getRiskDetails}
            />
          </section>
        )}

      </main>

      {/* Global generic footer info */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 bg-slate-50/10" id="pie-informacion">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500">Manual de Autogestión de Riesgos y Seguridad y Salud en el Trabajo</p>
          <p>La calificación se rige bajo los lineamientos del diamante de riesgos de la Guía Técnica Colombiana GTC-45.</p>
          <p className="pt-2 text-[10px] text-slate-300">© 2026 Auditor de Continuidad de Operaciones. Versión de uso libre y libre de elementos identificadores corporativos.</p>
        </div>
      </footer>
    </div>
  );
}
