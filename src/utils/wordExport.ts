/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VulnerabilityCategory, ThreatItem, getScoreInterpretationColor, getThreatColor } from '../types';

function getInterpretationText(score: number): string {
  if (score >= 0.0 && score <= 1.0) return 'BAJO (Preparado/Suficiente)';
  if (score > 1.0 && score <= 2.0) return 'MEDIO (Parcialmente Preparado)';
  return 'ALTO (Deficiente/Crítico)';
}

function getWordColorHex(color: 'green' | 'yellow' | 'red'): string {
  switch (color) {
    case 'green': return '#10B981'; // Tailwind Emerald 500
    case 'yellow': return '#F59E0B'; // Tailwind Amber 500
    case 'red': return '#EF4444'; // Tailwind Red 500
  }
}

function getIndicatorSymbol(color: 'green' | 'yellow' | 'red'): string {
  switch (color) {
    case 'green': return '◆ [Bajo]';
    case 'yellow': return '◆ [Medio]';
    case 'red': return '◆ [Alto]';
  }
}

export function exportToWord(
  categories: VulnerabilityCategory[],
  vulnerabilitySummary: any,
  threats: ThreatItem[],
  riskLevelRow: (threat: ThreatItem) => {
    personasColor: 'green' | 'yellow' | 'red';
    recursosColor: 'green' | 'yellow' | 'red';
    sistemasColor: 'green' | 'yellow' | 'red';
    amenazaColor: 'green' | 'yellow' | 'red';
    level: 'BAJO' | 'MEDIO' | 'ALTO';
    levelColor: 'green' | 'yellow' | 'red';
  },
  aiReportText: string
) {
  const dateStr = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build HTML table for input categories
  let inputTablesHtml = '';
  categories.forEach(cat => {
    inputTablesHtml += `
      <h2>${cat.name}</h2>
      <table class="m-table">
        <thead>
          <tr class="header-bg">
            <th style="width: 50%;">Pregunta / Punto a Calificar</th>
            <th style="width: 15%; text-align: center;">Calificación</th>
            <th style="width: 35%;">Observaciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    cat.sections.forEach(sec => {
      // Subheader row
      inputTablesHtml += `
        <tr class="subheader-bg">
          <td colspan="3" class="sub-title">${sec.name}</td>
        </tr>
      `;

      let sum = 0;
      sec.questions.forEach(q => {
        sum += q.score;
        const scoreText = q.score === 0 ? 'SI (0.0)' : q.score === 1 ? 'NO (1.0)' : 'PARCIAL (0.5)';
        inputTablesHtml += `
          <tr>
            <td>${q.question}</td>
            <td style="text-align: center; font-weight: bold;">${scoreText}</td>
            <td>${q.observation || 'Sin observaciones'}</td>
          </tr>
        `;
      });

      const avg = sec.questions.length > 0 ? sum / sec.questions.length : 0;
      inputTablesHtml += `
        <tr class="avg-bg">
          <td style="font-weight: bold; text-align: right;">${sec.name.replace(/^\d+\.\s*/, 'Promedio ')}:</td>
          <td style="text-align: center; font-weight: bold; background-color: #E2E8F0;">${avg.toFixed(2)}</td>
          <td></td>
        </tr>
      `;
    });

    inputTablesHtml += `
        </tbody>
      </table>
      <div style="margin-bottom: 25px;"></div>
    `;
  });

  // Build HTML for outputs
  // 1. Consolidado
  const cPersonas = vulnerabilitySummary.personas;
  const cRecursos = vulnerabilitySummary.recursos;
  const cSistemas = vulnerabilitySummary.sistemas;

  let consolidadoHtml = `
    <h2>CONSOLIDADO DE VULNERABILIDADES</h2>
    <table class="m-table" style="max-width: 600px;">
      <thead>
        <tr class="header-bg">
          <th style="width: 60%;">Componente Técnico</th>
          <th style="width: 20%; text-align: center;">Puntuación</th>
          <th style="width: 20%; text-align: center;">Interpretación</th>
        </tr>
      </thead>
      <tbody>
        <tr class="category-header"><td colspan="3">EN LAS PERSONAS</td></tr>
        <tr><td>Organización</td><td style="text-align: center;">${(categories[0].sections[0].questions.reduce((a, b) => a + b.score, 0) / categories[0].sections[0].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Capatitación</td><td style="text-align: center;">${(categories[0].sections[1].questions.reduce((a, b) => a + b.score, 0) / categories[0].sections[1].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Dotación</td><td style="text-align: center;">${(categories[0].sections[2].questions.reduce((a, b) => a + b.score, 0) / categories[0].sections[2].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr class="total-row">
          <td>TOTAL PERSONAS</td>
          <td style="text-align: center;">${cPersonas.score.toFixed(2)}</td>
          <td style="text-align: center; font-weight: bold; color: ${getWordColorHex(cPersonas.color)};">${getIndicatorSymbol(cPersonas.color)}</td>
        </tr>

        <tr class="category-header"><td colspan="3">EN LOS RECURSOS</td></tr>
        <tr><td>Materiales</td><td style="text-align: center;">${(categories[1].sections[0].questions.reduce((a, b) => a + b.score, 0) / categories[1].sections[0].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Edificación</td><td style="text-align: center;">${(categories[1].sections[1].questions.reduce((a, b) => a + b.score, 0) / categories[1].sections[1].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Equipos</td><td style="text-align: center;">${(categories[1].sections[2].questions.reduce((a, b) => a + b.score, 0) / categories[1].sections[2].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr class="total-row">
          <td>TOTAL RECURSOS</td>
          <td style="text-align: center;">${cRecursos.score.toFixed(2)}</td>
          <td style="text-align: center; font-weight: bold; color: ${getWordColorHex(cRecursos.color)};">${getIndicatorSymbol(cRecursos.color)}</td>
        </tr>

        <tr class="category-header"><td colspan="3">SISTEMAS Y PROCESOS</td></tr>
        <tr><td>Servicios Públicos</td><td style="text-align: center;">${(categories[2].sections[0].questions.reduce((a, b) => a + b.score, 0) / categories[2].sections[0].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Sistemas Alternos</td><td style="text-align: center;">${(categories[2].sections[1].questions.reduce((a, b) => a + b.score, 0) / categories[2].sections[1].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr><td>Recuperación</td><td style="text-align: center;">${(categories[2].sections[2].questions.reduce((a, b) => a + b.score, 0) / categories[2].sections[2].questions.length || 0).toFixed(2)}</td><td></td></tr>
        <tr class="total-row">
          <td>TOTAL SISTEMAS Y PROCESOS</td>
          <td style="text-align: center;">${cSistemas.score.toFixed(2)}</td>
          <td style="text-align: center; font-weight: bold; color: ${getWordColorHex(cSistemas.color)};">${getIndicatorSymbol(cSistemas.color)}</td>
        </tr>
      </tbody>
    </table>
  `;

  // 2. Identificación de Amenazas
  let amenazasHtml = `
    <h2>IDENTIFICACIÓN DE AMENAZAS Y CALIFICACIÓN</h2>
    <table class="m-table">
      <thead>
        <tr class="header-bg">
          <th style="width: 25%;">Amenaza / Peligro</th>
          <th style="width: 15%; text-align: center;">Origen</th>
          <th style="width: 35%;">Fuente de la Amenaza / Detalle</th>
          <th style="width: 15%; text-align: center;">Calificación</th>
          <th style="width: 10%; text-align: center;">Color</th>
        </tr>
      </thead>
      <tbody>
  `;

  let currentCat = '';
  threats.forEach(t => {
    if (t.category !== currentCat) {
      currentCat = t.category;
      amenazasHtml += `
        <tr class="subcategory-header">
          <td colspan="5" style="background-color: #F1F5F9; font-weight: bold;">Categoría: ${currentCat}</td>
        </tr>
      `;
    }

    const colorHex = getWordColorHex(getThreatColor(t.qualification));
    const originText = [t.origin.externo ? 'Externo' : '', t.origin.interno ? 'Interno' : ''].filter(Boolean).join(' / ');

    amenazasHtml += `
      <tr>
        <td style="font-weight: bold;">${t.name}</td>
        <td style="text-align: center;">${originText}</td>
        <td>${t.source}</td>
        <td style="text-align: center; font-weight: bold;">${t.qualification}</td>
        <td style="text-align: center; font-weight: bold; color: ${colorHex};">◆</td>
      </tr>
    `;
  });

  amenazasHtml += `
      </tbody>
    </table>
  `;

  // 3. Matriz de Nivel de Riesgo Consolidado (Diamantes)
  let matrizRiesgoHtml = `
    <h2>CONSOLIDADO NIVEL DE RIESGO - DETALLE METODOLÓGICO</h2>
    <p>El Nivel de Riesgo se calcula sumando el número de cuadrantes calificados en estado Crítico (Rojo) y Parcial (Amarillo) dentro de la metodología del Diamante de Riesgo:</p>
    <ul>
      <li><strong>RIESGO ALTO</strong>: 3 o 4 cuadrantes en Rojo.</li>
      <li><strong>RIESGO MEDIO</strong>: 1 o 2 cuadrantes en Rojo, o 3 o 4 cuadrantes en Amarillo.</li>
      <li><strong>RIESGO BAJO</strong>: 0 cuadrantes en Rojo y máximo 2 cuadrantes en Amarillo (el resto Verdes).</li>
    </ul>
    <table class="m-table">
      <thead>
        <tr class="header-bg">
          <th style="width: 25%;">Amenaza</th>
          <th style="width: 45%; text-align: center;">Asignación de Colores por Cuadrante (A, P, R, S)</th>
          <th style="width: 30%; text-align: center;">Nivel de Riesgo Resultante</th>
        </tr>
      </thead>
      <tbody>
  `;

  threats.forEach(t => {
    const row = riskLevelRow(t);
    const textAmenaza = `Amenaza: ${t.qualification} (${row.amenazaColor.toUpperCase()})`;
    const textPersonas = `Personas: ${getInterpretationText(vulnerabilitySummary.personas.score).split(' ')[0]} (${row.personasColor.toUpperCase()})`;
    const textRecursos = `Recursos: ${getInterpretationText(vulnerabilitySummary.recursos.score).split(' ')[0]} (${row.recursosColor.toUpperCase()})`;
    const textSistemas = `Sistemas: ${getInterpretationText(vulnerabilitySummary.sistemas.score).split(' ')[0]} (${row.sistemasColor.toUpperCase()})`;

    matrizRiesgoHtml += `
      <tr>
        <td style="font-weight: bold;">${t.name}</td>
        <td>
          <table style="width: 100%; border: none;">
            <tr style="border: none;">
              <td style="border: none; padding: 2px; color: ${getWordColorHex(row.amenazaColor)};">▲ ${textAmenaza}</td>
              <td style="border: none; padding: 2px; color: ${getWordColorHex(row.personasColor)};">◀ ${textPersonas}</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none; padding: 2px; color: ${getWordColorHex(row.recursosColor)};">▶ ${textRecursos}</td>
              <td style="border: none; padding: 2px; color: ${getWordColorHex(row.sistemasColor)};">▼ ${textSistemas}</td>
            </tr>
          </table>
        </td>
        <td style="text-align: center; vertical-align: middle; font-weight: bold; background-color: ${row.levelColor === 'red' ? '#FEE2E2' : row.levelColor === 'yellow' ? '#FEF3C7' : '#D1F2E5'}; color: ${getWordColorHex(row.levelColor)};">
          ${row.level}
        </td>
      </tr>
    `;
  });

  matrizRiesgoHtml += `
      </tbody>
    </table>
  `;

  // Convert AI report Markdown to HTML paragraphs dynamically
  let aiReportHtml = '';
  if (aiReportText) {
    const lines = aiReportText.split('\n');
    lines.forEach(line => {
      let lStr = line.trim();
      if (!lStr) return;
      if (lStr.startsWith('###')) {
        aiReportHtml += `<h3>${lStr.substring(4)}</h3>`;
      } else if (lStr.startsWith('####')) {
        aiReportHtml += `<h4>${lStr.substring(5)}</h4>`;
      } else if (lStr.startsWith('##')) {
        aiReportHtml += `<h2>${lStr.substring(3)}</h2>`;
      } else if (lStr.startsWith('#')) {
        aiReportHtml += `<h1>${lStr.substring(2)}</h1>`;
      } else if (lStr.startsWith('*') || lStr.startsWith('-')) {
        aiReportHtml += `<li>${lStr.substring(1).trim()}</li>`;
      } else {
        // Simple bold replacements inside line
        const boldRegex = /\*\*(.*?)\*\*/g;
        lStr = lStr.replace(boldRegex, '<strong>$1</strong>');
        aiReportHtml += `<p>${lStr}</p>`;
      }
    });
  } else {
    aiReportHtml = '<p>No se ha generado o adjuntado reporte consultivo.</p>';
  }

  // Construct final body
  const fullHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Análisis de Vulnerabilidad y Matriz de Riesgo</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #333333;
          margin: 40px;
        }
        h1 {
          font-size: 24pt;
          color: #0F172A;
          border-bottom: 2px solid #0F172A;
          padding-bottom: 10px;
          margin-top: 0;
        }
        h2 {
          font-size: 16pt;
          color: #1E293B;
          border-bottom: 1px solid #CBD5E1;
          padding-bottom: 5px;
          margin-top: 30px;
        }
        h3 {
          font-size: 13pt;
          color: #334155;
          margin-top: 20px;
        }
        h4 {
          font-size: 11.5pt;
          color: #475569;
          margin-top: 15px;
        }
        p {
          margin-bottom: 12px;
          text-align: justify;
        }
        li {
          margin-bottom: 6px;
        }
        .m-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 25px;
        }
        .m-table th, .m-table td {
          border: 1px solid #CBD5E1;
          padding: 8px 10px;
          font-size: 10pt;
        }
        .header-bg {
          background-color: #0F172A;
          color: #FFFFFF;
          font-weight: bold;
        }
        .subheader-bg {
          background-color: #F8FAFC;
          font-weight: bold;
        }
        .sub-title {
          font-size: 11pt;
          color: #1E293B;
          padding: 10px;
        }
        .avg-bg {
          background-color: #F1F5F9;
        }
        .category-header {
          background-color: #E2E8F0;
          font-weight: bold;
          font-size: 10.5pt;
        }
        .total-row {
          background-color: #F8FAFC;
          font-weight: bold;
        }
        .metadata-box {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="metadata-box">
        <h1 style="border: none; padding-bottom: 0px; margin-bottom: 5px; color: #0F172A;">INFORME EJECUTIVO TÉCNICO</h1>
        <p style="margin: 0; font-size: 12pt; font-weight: bold; color: #475569;">Plan de Emergencias y Continuidad de Negocio (Matriz de Riesgo GTC-45)</p>
        <p style="margin: 0; font-size: 10pt; color: #64748B;">Fecha de Generación: ${dateStr}</p>
        <p style="margin: 2px 0 0 0; font-size: 9.5pt; color: #64748B;">Generado de forma autónoma para fines de Prevención y SST</p>
      </div>

      <h2>1. INTRODUCCIÓN Y ALCANCE</h2>
      <p>El presente documento consolida el levantamiento analítico de vulnerabilidades internas y amenazas de origen natural, tecnológico u social críticas dentro de la organización. El proceso se rige bajo los principios de la Gestión Integral del Riesgo, aportando un diagnóstico objetivo con indicación de prioridades de mitigación.</p>

      ${consolidadoHtml}
      
      <br style="page-break-before: always;" />

      ${inputTablesHtml}

      <br style="page-break-before: always;" />

      ${amenazasHtml}

      <br style="page-break-before: always;" />

      ${matrizRiesgoHtml}

      <br style="page-break-before: always;" />

      <h2>REPORTE E INFORME CONSULTIVO DE CONTROL DE RIESGOS (AI ASSISTED)</h2>
      <div style="background-color: #FAFAFA; padding: 15px; border-left: 4px solid #0F172A;">
        ${aiReportHtml}
      </div>

      <div style="margin-top: 50px; border-top: 1px solid #CBD5E1; padding-top: 20px;">
        <p style="font-size: 9pt; text-align: center; color: #94A3B8;">Fin del Reporte Técnico de Autogestión SST. Creado en formato compatible con Microsoft Office Word.</p>
      </div>
    </body>
    </html>
  `;

  // Create a Blob containing the HTML with the MS Word XML format and download it
  const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Plan_Emergencias_Analisis_Vulnerabilidad_${new Date().toISOString().substring(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
