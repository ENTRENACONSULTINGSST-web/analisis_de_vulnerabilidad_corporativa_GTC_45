/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VulnerabilityCategory, ThreatItem } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generic helper to download content as a file from the client browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clean CSV builder that handles quotation and commas correctly
 */
export function buildCSV(headers: string[], rows: string[][]): string {
  const escapeField = (field: string) => {
    const stringified = (field || '').trim().replace(/"/g, '""');
    if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
      return `"${stringified}"`;
    }
    return stringified;
  };

  const csvRows = [
    headers.map(escapeField).join(','),
    ...rows.map(row => row.map(escapeField).join(','))
  ];

  // Include the UTF-8 BOM to ensure Excel opens Latin accents (á, é, í, ó, ú, ñ) correctly
  return '\ufeff' + csvRows.join('\n');
}

/**
 * Copy a string of text to the target clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * 1. Exports Cuestionarios/Vulnerability Category as CSV
 */
export function downloadVulnerabilitiesCSV(category: VulnerabilityCategory) {
  const headers = ['Sección', 'Pregunta', 'Calificación', 'Equivalente Numérico', 'Notas y Observaciones'];
  const rows: string[][] = [];

  category.sections.forEach(sec => {
    sec.questions.forEach(q => {
      const scoreLabel = q.score === 0 ? 'SÍ' : q.score === 0.5 ? 'PARCIAL' : 'NO';
      rows.push([
        sec.name,
        q.question,
        scoreLabel,
        q.score.toFixed(1),
        q.observation || 'Sin observaciones'
      ]);
    });
  });

  const csvString = buildCSV(headers, rows);
  const sanitizedFilename = `Cuestionario_Vulnerabilidad_${category.id}_${new Date().toISOString().substring(0, 10)}.csv`;
  downloadFile(csvString, sanitizedFilename, 'text/csv;charset=utf-8;');
}

/**
 * 2. Generates Markdown text for a Vulnerability Category
 */
export function getVulnerabilitiesMarkdown(category: VulnerabilityCategory): string {
  let md = `## REPORTE DE VULNERABILIDAD - ${category.name.toUpperCase()}\n`;
  md += `Fecha de generación: ${new Date().toLocaleDateString()}\n`;
  md += `Metodología: Diamante de Riesgos (GTC-45)\n\n`;

  category.sections.forEach(sec => {
    // Section subheader
    const totalScore = sec.questions.reduce((sum, q) => sum + q.score, 0);
    const avg = sec.questions.length > 0 ? totalScore / sec.questions.length : 0;
    md += `### ${sec.name.toUpperCase()}\n`;
    md += `* **Promedio seccional:** ${avg.toFixed(2)}\n\n`;
    md += `| Pregunta / Punto de Calificación | Calificación | Notas / Comentarios |\n`;
    md += `| :--- | :---: | :--- |\n`;

    sec.questions.forEach(q => {
      const scoreLabel = q.score === 0 ? 'SÍ (0.0)' : q.score === 0.5 ? 'PARCIAL (0.5)' : 'NO (1.0)';
      md += `| ${q.question} | **${scoreLabel}** | ${q.observation || 'Sin comentarios'} |\n`;
    });
    md += `\n`;
  });

  return md;
}

/**
 * 3. Exports Consolidado values as CSV
 */
export function downloadConsolidadoCSV(categories: VulnerabilityCategory[], summary: any) {
  const headers = ['Componente Técnico', 'Sub-Área', 'Calificación Parcial', 'Puntaje Consolidado', 'Interpretación GTC-45'];
  const rows: string[][] = [];

  const getSubAvg = (catIdx: number, secIdx: number): string => {
    const questions = categories[catIdx]?.sections[secIdx]?.questions || [];
    if (questions.length === 0) return '0.00';
    return (questions.reduce((sum, q) => sum + q.score, 0) / questions.length).toFixed(2);
  };

  // Personas
  rows.push(['EN LAS PERSONAS', 'Organización', getSubAvg(0, 0), '', '']);
  rows.push(['EN LAS PERSONAS', 'Capacitación', getSubAvg(0, 1), '', '']);
  rows.push(['EN LAS PERSONAS', 'Dotación', getSubAvg(0, 2), '', '']);
  rows.push(['EN LAS PERSONAS', 'MONITOREO CONSOLIDADO', '', summary.personas.score.toFixed(2), summary.personas.interpretation]);

  // Recursos
  rows.push(['EN LOS RECURSOS', 'Materiales', getSubAvg(1, 0), '', '']);
  rows.push(['EN LOS RECURSOS', 'Edificación', getSubAvg(1, 1), '', '']);
  rows.push(['EN LOS RECURSOS', 'Equipos', getSubAvg(1, 2), '', '']);
  rows.push(['EN LOS RECURSOS', 'MONITOREO CONSOLIDADO', '', summary.recursos.score.toFixed(2), summary.recursos.interpretation]);

  // Sistemas
  rows.push(['EN LOS SISTEMAS Y PROCESOS', 'Servicios Públicos', getSubAvg(2, 0), '', '']);
  rows.push(['EN LOS SISTEMAS Y PROCESOS', 'Sistemas Alternos', getSubAvg(2, 1), '', '']);
  rows.push(['EN LOS SISTEMAS Y PROCESOS', 'Recuperación', getSubAvg(2, 2), '', '']);
  rows.push(['EN LOS SISTEMAS Y PROCESOS', 'MONITOREO CONSOLIDADO', '', summary.sistemas.score.toFixed(2), summary.sistemas.interpretation]);

  const csvString = buildCSV(headers, rows);
  downloadFile(csvString, `Consolidado_Vulnerabilidades_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 4. Generates Markdown of the Consolidated table
 */
export function getConsolidadoMarkdown(categories: VulnerabilityCategory[], summary: any): string {
  const getSubAvg = (catIdx: number, secIdx: number): number => {
    const qList = categories[catIdx]?.sections[secIdx]?.questions || [];
    return qList.length > 0 ? qList.reduce((sum, q) => sum + q.score, 0) / qList.length : 0;
  };

  let md = `## CONSOLIDADO GENERAL DE VULNERABILIDADES (GTC-45)\n`;
  md += `Fecha de diagnóstico: ${new Date().toLocaleDateString()}\n\n`;

  md += `### 1. EN LAS PERSONAS\n`;
  md += `* Organización: **${getSubAvg(0, 0).toFixed(2)}**\n`;
  md += `* Capacitación: **${getSubAvg(0, 1).toFixed(2)}**\n`;
  md += `* Dotación: **${getSubAvg(0, 2).toFixed(2)}**\n`;
  md += `* **PUNTUACIÓN TOTAL PERSONAS:** **${summary.personas.score.toFixed(2)}** (${summary.personas.interpretation})\n\n`;

  md += `### 2. EN LOS RECURSOS\n`;
  md += `* Materiales: **${getSubAvg(1, 0).toFixed(2)}**\n`;
  md += `* Edificación: **${getSubAvg(1, 1).toFixed(2)}**\n`;
  md += `* Equipos: **${getSubAvg(1, 2).toFixed(2)}**\n`;
  md += `* **PUNTUACIÓN TOTAL RECURSOS:** **${summary.recursos.score.toFixed(2)}** (${summary.recursos.interpretation})\n\n`;

  md += `### 3. EN LOS SISTEMAS Y PROCESOS\n`;
  md += `* Servicios Públicos: **${getSubAvg(2, 0).toFixed(2)}**\n`;
  md += `* Sistemas Alternos: **${getSubAvg(2, 1).toFixed(2)}**\n`;
  md += `* Recuperación: **${getSubAvg(2, 2).toFixed(2)}**\n`;
  md += `* **PUNTUACIÓN TOTAL SISTEMAS:** **${summary.sistemas.score.toFixed(2)}** (${summary.sistemas.interpretation})\n\n`;

  md += `### INTERPRETACIÓN GENERAL:\n`;
  md += `* **Personas:** Estado ${summary.personas.interpretation}\n`;
  md += `* **Recursos:** Estado ${summary.recursos.interpretation}\n`;
  md += `* **Sistemas/Procesos:** Estado ${summary.sistemas.interpretation}\n`;

  return md;
}

/**
 * 5. Exports Threats to CSV
 */
export function downloadThreatsCSV(threats: ThreatItem[]) {
  const headers = ['Categoría', 'Amenaza / Peligro', 'Origen Externo', 'Origen Interno', 'Fuente / Detalle de la Amenaza', 'Calificación (GTC-45)'];
  const rows: string[][] = [];

  threats.forEach(t => {
    rows.push([
      t.category,
      t.name,
      t.origin.externo ? 'SÍ' : 'NO',
      t.origin.interno ? 'SÍ' : 'NO',
      t.source,
      t.qualification
    ]);
  });

  const csvString = buildCSV(headers, rows);
  downloadFile(csvString, `Identificacion_Amenazas_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 6. Generates Markdown of Threats Identification
 */
export function getThreatsMarkdown(threats: ThreatItem[]): string {
  let md = `## IDENTIFICACIÓN Y CALIFICACIÓN DE AMENAZAS Y PELIGROS\n`;
  md += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

  const categories = ['NATURAL', 'TECNOLÓGICO', 'SOCIAL'] as const;
  categories.forEach(cat => {
    const list = threats.filter(t => t.category === cat);
    if (list.length === 0) return;

    md += `### AMENAZAS DE ORIGEN: ${cat}\n`;
    md += `| Amenaza | Origen Espacial | Fuente / Causa Registrada | Calificación GTC-45 |\n`;
    md += `| :--- | :---: | :--- | :---: |\n`;

    list.forEach(t => {
      const originText = [t.origin.externo ? 'Ext.' : '', t.origin.interno ? 'Int.' : ''].filter(Boolean).join('/');
      md += `| ${t.name} | ${originText} | ${t.source} | **${t.qualification}** |\n`;
    });
    md += `\n`;
  });

  return md;
}

/**
 * 7. Exports consolidated risk levels row by row as CSV
 */
export function downloadRiskMatrixCSV(
  threats: ThreatItem[],
  getRiskDetails: (t: ThreatItem) => {
    personasColor: 'green' | 'yellow' | 'red';
    recursosColor: 'green' | 'yellow' | 'red';
    sistemasColor: 'green' | 'yellow' | 'red';
    amenazaColor: 'green' | 'yellow' | 'red';
    level: 'BAJO' | 'MEDIO' | 'ALTO';
  }
) {
  const headers = ['Amenaza', 'Calificación Amenaza', 'Vulnerabilidad Personas', 'Vulnerabilidad Recursos', 'Vulnerabilidad Sistemas', 'Nivel de Riesgo Consolidado'];
  const rows: string[][] = [];

  threats.forEach(t => {
    const row = getRiskDetails(t);
    rows.push([
      t.name,
      t.qualification,
      row.personasColor.toUpperCase() === 'GREEN' ? 'BAJO (Verde)' : row.personasColor.toUpperCase() === 'YELLOW' ? 'MEDIO (Amarillo)' : 'ALTO (Rojo)',
      row.recursosColor.toUpperCase() === 'GREEN' ? 'BAJO (Verde)' : row.recursosColor.toUpperCase() === 'YELLOW' ? 'MEDIO (Amarillo)' : 'ALTO (Rojo)',
      row.sistemasColor.toUpperCase() === 'GREEN' ? 'BAJO (Verde)' : row.sistemasColor.toUpperCase() === 'YELLOW' ? 'MEDIO (Amarillo)' : 'ALTO (Rojo)',
      row.level
    ]);
  });

  const csvString = buildCSV(headers, rows);
  downloadFile(csvString, `Matriz_Consolidada_Nivel_Riesgo_${new Date().toISOString().substring(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * 8. Generates beautiful textual mapping display of Risk Diamonds Row By Row
 */
export function getRiskMatrixMarkdown(
  threats: ThreatItem[],
  getRiskDetails: (t: ThreatItem) => {
    personasColor: 'green' | 'yellow' | 'red';
    recursosColor: 'green' | 'yellow' | 'red';
    sistemasColor: 'green' | 'yellow' | 'red';
    amenazaColor: 'green' | 'yellow' | 'red';
    level: 'BAJO' | 'MEDIO' | 'ALTO';
    levelColor: 'green' | 'yellow' | 'red';
  }
): string {
  let md = `## MATRIZ DE DIAMANTES DE RIESGO DE EMERGENCIAS\n`;
  md += `Metodología: Mapeo de 4 rombos de autogestión SST (GTC-45)\n`;
  md += `Fecha de emisión: ${new Date().toLocaleDateString()}\n\n`;

  md += `| Amenaza Eval | Rombos (A, P, R, S) | Nivel Riesgo |\n`;
  md += `| :--- | :--- | :---: |\n`;

  threats.forEach(t => {
    const row = getRiskDetails(t);
    const aIcon = row.amenazaColor === 'green' ? '🟢' : row.amenazaColor === 'yellow' ? '🟡' : '🔴';
    const pIcon = row.personasColor === 'green' ? '🟢' : row.personasColor === 'yellow' ? '🟡' : '🔴';
    const rIcon = row.recursosColor === 'green' ? '🟢' : row.recursosColor === 'yellow' ? '🟡' : '🔴';
    const sIcon = row.sistemasColor === 'green' ? '🟢' : row.sistemasColor === 'yellow' ? '🟡' : '🔴';

    md += `| **${t.name}** | Amenaza: ${aIcon} / Personas: ${pIcon} / Recursos: ${rIcon} / Sistemas: ${sIcon} | **${row.level}** |\n`;
  });

  md += `\nLeyenda: 🔴 Alto/Crítico, 🟡 Medio/Parcial, 🟢 Bajo/Preparado.\n`;
  return md;
}

/**
 * Uses a single-pixel canvas context to convert any CSS color string matching modern color space functions
 * (like oklch, oklab, lab, lch) to their equivalent safe sRGB representation.
 * When html2canvas parses values from window.getComputedStyle, returning raw oklch results in exceptions;
 * intercepting and translating them to rgb(...) or rgba(...) ensures 100% bug-free rendering.
 */
/**
 * Helper to safely parse numbers or percentages, extracting fallbacks from CSS variables if nested.
 */
function parseValueWithFallback(str: string | undefined, defaultValue: number): number {
  if (!str) return defaultValue;
  let cleaned = str.trim();

  // If it is a CSS variable like var(--name, fallback), extract the fallback
  if (cleaned.startsWith('var(')) {
    const fallbackMatch = /,\s*([^)]+)\s*\)$/.exec(cleaned);
    if (fallbackMatch) {
      cleaned = fallbackMatch[1].trim();
    } else {
      return defaultValue;
    }
  }

  let val = 0;
  if (cleaned.endsWith('%')) {
    val = parseFloat(cleaned) / 100;
  } else {
    val = parseFloat(cleaned);
  }

  return isNaN(val) ? defaultValue : val;
}

/**
 * Converts an individual oklch color string like oklch(0.627 0.265 303.9) or oklch(...) 
 * directly to a standard sRGB rgb() or rgba() color string using the official Oklab spec formulas.
 */
function parseOklchToRgb(oklchStr: string): string {
  // Regex matches oklch(L C H) or oklch(L C H / A) supporting optional commas/slashes and custom variables
  const match = /oklch\(\s*([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+(?:deg|rad|grad|turn)?|var\([^)]+\))(?:\s*(?:\/|[\s,]+)\s*([0-9.-]+%?|var\([^)]+\)))?\s*\)/i.exec(oklchStr);
  if (!match) return 'rgb(255, 255, 255)';

  const l = parseValueWithFallback(match[1], 0.5);
  const c = parseValueWithFallback(match[2], 0.1);
  const hStr = match[3] || '0';
  let h = 0;

  if (hStr.includes('var(')) {
    h = parseValueWithFallback(hStr, 0);
  } else if (hStr.endsWith('deg')) {
    h = parseFloat(hStr);
  } else if (hStr.endsWith('rad')) {
    h = parseFloat(hStr) * (180 / Math.PI);
  } else if (hStr.endsWith('grad')) {
    h = parseFloat(hStr) * 0.9;
  } else if (hStr.endsWith('turn')) {
    h = parseFloat(hStr) * 360;
  } else {
    h = parseFloat(hStr);
  }
  if (isNaN(h)) h = 0;

  const alpha = parseValueWithFallback(match[4], 1);

  // Conversion: OKLCH -> Oklab (L, a, b)
  const hRad = h * (Math.PI / 180);
  const lab_a = c * Math.cos(hRad);
  const lab_b = c * Math.sin(hRad);

  // Oklab -> LMS color space
  const l_lms = l + 0.3963377774 * lab_a + 0.2158017574 * lab_b;
  const m_lms = l - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
  const s_lms = l - 0.0894841775 * lab_a - 1.2914855480 * lab_b;

  // Convert to non-linear LMS
  const l_non_lin = l_lms * l_lms * l_lms;
  const m_non_lin = m_lms * m_lms * m_lms;
  const s_non_lin = s_lms * s_lms * s_lms;

  // LMS -> Linear sRGB
  const r_lin = 4.0767416621 * l_non_lin - 3.3077115913 * m_non_lin + 0.2309699292 * s_non_lin;
  const g_lin = -1.2684380046 * l_non_lin + 2.6097574011 * m_non_lin - 0.3413193965 * s_non_lin;
  const b_lin = -0.0041960863 * l_non_lin - 0.7034186147 * m_non_lin + 1.7076170114 * s_non_lin;

  // Gamma correction function to transform linear sRGB to sRGB
  const gammaCorr = (val: number) => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const rgb_r = Math.round(Math.max(0, Math.min(1, gammaCorr(r_lin))) * 255);
  const rgb_g = Math.round(Math.max(0, Math.min(1, gammaCorr(g_lin))) * 255);
  const rgb_b = Math.round(Math.max(0, Math.min(1, gammaCorr(b_lin))) * 255);

  if (alpha === 1) {
    return `rgb(${rgb_r}, ${rgb_g}, ${rgb_b})`;
  } else {
    return `rgba(${rgb_r}, ${rgb_g}, ${rgb_b}, ${alpha.toFixed(3)})`;
  }
}

/**
 * Converts an individual oklab color string directly to a standard sRGB rgb() or rgba() color string.
 */
function parseOklabToRgb(oklabStr: string): string {
  const match = /oklab\(\s*([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))(?:\s*(\s*\/|\s*,)\s*([0-9.-]+%?|var\([^)]+\)))?\s*\)/i.exec(oklabStr);
  const testMatch = /oklab\(\s*([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))(?:\s*(?:\/|[\s,]+)\s*([0-9.-]+%?|var\([^)]+\)))?\s*\)/i.exec(oklabStr);
  const activeMatch = testMatch || match;
  if (!activeMatch) return 'rgb(255, 255, 255)';

  const l = parseValueWithFallback(activeMatch[1], 0.5);
  const lab_a = parseValueWithFallback(activeMatch[2], 0.0);
  const lab_b = parseValueWithFallback(activeMatch[3], 0.0);
  const alpha = parseValueWithFallback(activeMatch[4], 1);

  // Oklab -> LMS color space
  const l_lms = l + 0.3963377774 * lab_a + 0.2158017574 * lab_b;
  const m_lms = l - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
  const s_lms = l - 0.0894841775 * lab_a - 1.2914855480 * lab_b;

  // Convert to non-linear LMS
  const l_non_lin = l_lms * l_lms * l_lms;
  const m_non_lin = m_lms * m_lms * m_lms;
  const s_non_lin = s_lms * s_lms * s_lms;

  // LMS -> Linear sRGB
  const r_lin = 4.0767416621 * l_non_lin - 3.3077115913 * m_non_lin + 0.2309699292 * s_non_lin;
  const g_lin = -1.2684380046 * l_non_lin + 2.6097574011 * m_non_lin - 0.3413193965 * s_non_lin;
  const b_lin = -0.0041960863 * l_non_lin - 0.7034186147 * m_non_lin + 1.7076170114 * s_non_lin;

  // Gamma correction function to transform linear sRGB to sRGB
  const gammaCorr = (val: number) => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const rgb_r = Math.round(Math.max(0, Math.min(1, gammaCorr(r_lin))) * 255);
  const rgb_g = Math.round(Math.max(0, Math.min(1, gammaCorr(g_lin))) * 255);
  const rgb_b = Math.round(Math.max(0, Math.min(1, gammaCorr(b_lin))) * 255);

  if (alpha === 1) {
    return `rgb(${rgb_r}, ${rgb_g}, ${rgb_b})`;
  } else {
    return `rgba(${rgb_r}, ${rgb_g}, ${rgb_b}, ${alpha.toFixed(3)})`;
  }
}

/**
 * Converts standard CIE lab() to sRGB rgb() or rgba() color string.
 */
function parseLabToRgb(labStr: string): string {
  const match = /lab\(\s*([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))(?:\s*(?:\/|[\s,]+)\s*([0-9.-]+%?|var\([^)]+\)))?\s*\)/i.exec(labStr);
  if (!match) return 'rgb(255, 255, 255)';

  let l = parseValueWithFallback(match[1], 50);
  if (match[1]?.endsWith('%')) {
    l = parseFloat(match[1]);
  }
  const a = parseValueWithFallback(match[2], 0);
  const b = parseValueWithFallback(match[3], 0);
  const alpha = parseValueWithFallback(match[4], 1);

  // lab to xyz (CIE D65 white point: X=0.95047, Y=1.00000, Z=1.08883)
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const finv = (t: number) => {
    return t > 6/29 ? t * t * t : (t - 16/116) * 3 * (6/29) * (6/29);
  };

  x = 0.95047 * finv(x);
  y = 1.00000 * finv(y);
  z = 1.08883 * finv(z);

  // xyz to linear srgb
  let r_lin = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g_lin = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b_lin = x * 0.0557 + y * -0.2040 + z * 1.0570;

  const gammaCorr = (val: number) => {
    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const rgb_r = Math.round(Math.max(0, Math.min(1, gammaCorr(r_lin))) * 255);
  const rgb_g = Math.round(Math.max(0, Math.min(1, gammaCorr(g_lin))) * 255);
  const rgb_b = Math.round(Math.max(0, Math.min(1, gammaCorr(b_lin))) * 255);

  if (alpha === 1) {
    return `rgb(${rgb_r}, ${rgb_g}, ${rgb_b})`;
  } else {
    return `rgba(${rgb_r}, ${rgb_g}, ${rgb_b}, ${alpha.toFixed(3)})`;
  }
}

/**
 * Converts standard CIE lch() to sRGB rgb() or rgba() color string.
 */
function parseLchToRgb(lchStr: string): string {
  const match = /lch\(\s*([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+%?|var\([^)]+\))\s+(?:[\s,]*)([0-9.-]+(?:deg|rad|grad|turn)?|var\([^)]+\))(?:\s*(?:\/|[\s,]+)\s*([0-9.-]+%?|var\([^)]+\)))?\s*\)/i.exec(lchStr);
  if (!match) return 'rgb(255, 255, 255)';

  const l = parseValueWithFallback(match[1], 50);
  const c = parseValueWithFallback(match[2], 0);
  const hStr = match[3] || '0';
  let h = 0;

  if (hStr.includes('var(')) {
    h = parseValueWithFallback(hStr, 0);
  } else if (hStr.endsWith('deg')) {
    h = parseFloat(hStr);
  } else if (hStr.endsWith('rad')) {
    h = parseFloat(hStr) * (180 / Math.PI);
  } else if (hStr.endsWith('grad')) {
    h = parseFloat(hStr) * 0.9;
  } else if (hStr.endsWith('turn')) {
    h = parseFloat(hStr) * 360;
  } else {
    h = parseFloat(hStr);
  }
  if (isNaN(h)) h = 0;

  const alpha = parseValueWithFallback(match[4], 1);

  const hRad = h * (Math.PI / 180);
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const labString = `lab(${l} ${a} ${b} / ${alpha})`;
  return parseLabToRgb(labString);
}

/**
 * Uses a mathematical converter to replace any CSS OKLCH, OKLAB, LAB, or LCH color strings matching modern 
 * color space functions to their equivalent safe sRGB representation.
 * Intercepting and translating them to rgb(...) or rgba(...) ensures 100% bug-free rendering in html2canvas.
 */
function convertCssColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  
  // Return early if no modern colors are present
  if (!/(oklch|oklab|lab|lch)/i.test(colorStr)) {
    return colorStr;
  }

  let result = '';
  let i = 0;
  const len = colorStr.length;
  const regex = /(oklch|oklab|lab|lch)\(/gi;
  let match;

  while ((match = regex.exec(colorStr)) !== null) {
    const startIndex = match.index;
    const name = match[1].toLowerCase();
    
    // Append content leading up to this matched function
    result += colorStr.substring(i, startIndex);
    
    let openParens = 1;
    let j = regex.lastIndex; // Position after the matched '('
    
    // Balanced parenthesis matching
    while (j < len && openParens > 0) {
      if (colorStr[j] === '(') {
        openParens++;
      } else if (colorStr[j] === ')') {
        openParens--;
      }
      j++;
    }

    if (openParens === 0) {
      // Sliced the entire group: oklab(...) or similar
      const fullColorExpr = colorStr.substring(startIndex, j);
      let converted = 'rgb(255, 255, 255)';
      try {
        if (name === 'oklch') {
          converted = parseOklchToRgb(fullColorExpr);
        } else if (name === 'oklab') {
          converted = parseOklabToRgb(fullColorExpr);
        } else if (name === 'lab') {
          converted = parseLabToRgb(fullColorExpr);
        } else if (name === 'lch') {
          converted = parseLchToRgb(fullColorExpr);
        }
      } catch (err) {
        console.warn(`Falla al convertir ${name} individual:`, fullColorExpr, err);
      }
      
      result += converted;
      i = j;
      regex.lastIndex = j;
    } else {
      // If parentheses did not close properly, fallback to original signature slice
      result += colorStr.substring(startIndex, regex.lastIndex);
      i = regex.lastIndex;
    }
  }

  result += colorStr.substring(i);
  return result;
}

/**
 * Runs an asynchronous function while temporarily overriding CSSStyleDeclaration prototype
 * getters and getPropertyValue to translate modern OKLCH/LAB colors to RGB format.
 * This guarantees html2canvas never encounters un-parseable color values in style rules or computed styles.
 */
async function runOklchSafeAsync<T>(fn: () => Promise<T>): Promise<T> {
  const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;
  const descriptors = Object.getOwnPropertyDescriptors(CSSStyleDeclaration.prototype);
  const restoredGetters: Array<{ prop: string; desc: PropertyDescriptor }> = [];

  // Override getPropertyValue
  CSSStyleDeclaration.prototype.getPropertyValue = function (prop: string) {
    const val = originalGetPropertyValue.call(this, prop);
    if (typeof val === 'string' && /(oklch|oklab|lab|lch)/i.test(val)) {
      return convertCssColorToRgb(val);
    }
    return val;
  };

  // Override color-related getters dynamically to prevent html2canvas color parsing crashes
  for (const [prop, desc] of Object.entries(descriptors)) {
    if (desc && typeof desc.get === 'function') {
      const originalGetter = desc.get;
      restoredGetters.push({ prop, desc });
      try {
        Object.defineProperty(CSSStyleDeclaration.prototype, prop, {
          ...desc,
          get: function () {
            const val = originalGetter.call(this);
            if (typeof val === 'string' && /(oklch|oklab|lab|lch)/i.test(val)) {
              return convertCssColorToRgb(val);
            }
            return val;
          }
        });
      } catch (e) {
        // Some properties are read-only or non-configurable, ignore them
      }
    }
  }

  try {
    return await fn();
  } finally {
    // Restore original getPropertyValue
    CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;

    // Restore original getters
    for (const { prop, desc } of restoredGetters) {
      try {
        Object.defineProperty(CSSStyleDeclaration.prototype, prop, desc);
      } catch (e) {
        // Ignore errors during restoration
      }
    }
  }
}

/**
 * Helper to generate html2canvas configuration that converts all modern OKLCH/LAB colors
 * to RGB format in the cloned document used for rendering. This prevents CSS parsing errors
 * and ensures modern CSS frameworks export cleanly with real-world styles.
 */
function getHtml2CanvasConfig(normalizedBgColor: string) {
  return {
    scale: 3,
    useCORS: true,
    allowTaint: false, // Must be false to enable canvas toBlob/toDataURL
    backgroundColor: normalizedBgColor,
    logging: false,
    onclone: (clonedDoc: Document) => {
      // 1. Process all stylesheets to make sure html2canvas's parser never sees oklch in text
      try {
        let combinedCss = '';

        // Extract rules from stylesheets (catching CORS issues)
        const sheetsArray = Array.from(clonedDoc.styleSheets);
        sheetsArray.forEach((sheet) => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach((rule) => {
              combinedCss += rule.cssText + '\n';
            });
          } catch (e) {
            // Standard fallback when rules are unreadable (e.g., cross-origin)
          }
        });

        // Supplement with literal textContent from all styles tags
        clonedDoc.querySelectorAll('style').forEach((styleTag) => {
          if (styleTag.textContent) {
            combinedCss += styleTag.textContent + '\n';
          }
        });

        // Convert any oklch color string inside structural styles to standard rgb/rgba
        const safeCss = convertCssColorToRgb(combinedCss);

        // Strip previous style sheets to keep HTML2Canvas focused only on our clean sheet
        clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
          node.parentNode?.removeChild(node);
        });

        // Insert clean consolidated style tag
        const styleSheetNode = clonedDoc.createElement('style');
        styleSheetNode.textContent = safeCss;
        clonedDoc.head.appendChild(styleSheetNode);
      } catch (err) {
        console.warn('Falla al normalizar hojas de estilo en el clon:', err);
      }

      // 2. Also map inline and computed styles on elements to avoid any in-line oklch values
      try {
        clonedDoc.querySelectorAll('*').forEach((node) => {
          const el = node as HTMLElement;
          const computed = window.getComputedStyle(node as Element);
          
          el.style.color = convertCssColorToRgb(computed.color);
          el.style.backgroundColor = convertCssColorToRgb(computed.backgroundColor);
          el.style.borderColor = convertCssColorToRgb(computed.borderColor);

          const extraProps = [
            'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
            'outlineColor', 'fill', 'stroke'
          ];
          extraProps.forEach((prop) => {
            const val = computed[prop as any];
            if (val) {
              el.style[prop as any] = convertCssColorToRgb(val);
            }
          });

          // Normalize any inline style attributes that might already be attached
          if (el.style) {
            for (let i = 0; i < el.style.length; i++) {
              const prop = el.style[i];
              const val = el.style.getPropertyValue(prop);
              if (val && /(oklch|oklab|lab|lch)/i.test(val)) {
                el.style.setProperty(prop, convertCssColorToRgb(val));
              }
            }
          }
        });
      } catch (err) {
        console.warn('Error al normalizar estilos de nodos individuales en el clon:', err);
      }

      // 3. Translate all textareas into custom wrapping divs to bypass html2canvas scroll/cut-off bugs
      try {
        clonedDoc.querySelectorAll('textarea').forEach((node) => {
          const textarea = node as HTMLTextAreaElement;
          const parent = textarea.parentNode;
          if (parent) {
            const div = clonedDoc.createElement('div');
            div.textContent = textarea.value || '';
            
            // Transfer classes and styles to match presentation
            div.className = textarea.className;
            div.setAttribute('style', textarea.getAttribute('style') || '');
            
            // Force wrapping, full height, and clean display
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordBreak = 'break-word';
            div.style.height = 'auto';
            div.style.minHeight = '32px';
            div.style.display = 'block';
            div.style.overflow = 'visible';
            
            // Swap nodes
            parent.replaceChild(div, textarea);
          }
        });
      } catch (err) {
        console.warn('Error translating textareas to divs in html2canvas clone:', err);
      }

      // 4. Convert all SVGs in the cloned document into inline images with serialized Data URLs.
      // This completely works around severity html2canvas bugs where vector layouts, nested polygons,
      // and text points are rendered mirrored, off-center, or inverted, by letting the browser's
      // native rendering engine generate a perfect flat image representation in the clone.
      try {
        clonedDoc.querySelectorAll('svg').forEach((svg) => {
          try {
            const width = svg.getAttribute('width') || String(svg.clientWidth || 240);
            const height = svg.getAttribute('height') || String(svg.clientHeight || 250);
            
            const serializer = new XMLSerializer();
            let svgStr = serializer.serializeToString(svg);
            
            // Ensure namespace is present
            if (!svgStr.includes('xmlns=')) {
              svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            
            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
            const img = clonedDoc.createElement('img');
            img.src = dataUrl;
            img.setAttribute('referrerpolicy', 'no-referrer');
            
            // Match dimensions and layouts
            img.style.width = width.includes('%') ? width : `${width}px`;
            img.style.height = height.includes('%') ? height : `${height}px`;
            img.style.display = 'block';
            img.style.margin = '0 auto';
            img.style.border = 'none';
            
            const originalClass = svg.className?.baseVal || svg.getAttribute('class') || '';
            if (originalClass) {
              img.className = originalClass;
            }
            
            if (svg.parentNode) {
              svg.parentNode.replaceChild(img, svg);
            }
          } catch (e) {
            console.warn('Error converting individual SVG to Image in clone:', e);
          }
        });
      } catch (err) {
        console.warn('General error converting SVGs to inline images in clone:', err);
      }
    }
  };
}

/**
 * 9. Exports any element by ID to PNG, JPEG or PDF
 */
export async function exportElementAs(
  elementId: string,
  filename: string,
  format: 'png' | 'jpeg' | 'pdf'
): Promise<boolean> {
  return runOklchSafeAsync(async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Error: No se encontró el elemento con ID "${elementId}".`);
      return false;
    }

    try {
      const computedBgColor = window.getComputedStyle(element).backgroundColor;
      const finalBgColor = (computedBgColor === 'rgba(0, 0, 0, 0)' || computedBgColor === 'transparent' || !computedBgColor)
        ? '#ffffff'
        : computedBgColor;

      const normalizedBgColor = /(oklch|oklab|lab|lch)/i.test(finalBgColor)
        ? convertCssColorToRgb(finalBgColor)
        : finalBgColor;

      const canvas = await html2canvas(element, getHtml2CanvasConfig(normalizedBgColor));

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        
        // Determine orientation based on aspect ratio
        const isLandscape = canvas.width > canvas.height;
        const pdf = new jsPDF({
          orientation: isLandscape ? 'l' : 'p',
          unit: 'mm',
          format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate scaled size keeping aspect ratio with some safe margin
        const margin = 10;
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        let width = maxWidth;
        let height = (canvas.height * width) / canvas.width;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = (canvas.width * height) / canvas.height;
        }
        
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        
        pdf.addImage(imgData, 'JPEG', x, y, width, height, undefined, 'FAST');
        pdf.save(`${filename}.pdf`);
      } else {
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const fileExtension = format === 'jpeg' ? 'jpg' : 'png';
        
        await new Promise<void>((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Error al generar el Blob de la imagen.');
              resolve();
              return;
            }
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${filename}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
              resolve();
            }, 200);
          }, mimeType, 0.95);
        });
      }
      return true;
    } catch (err) {
      console.error('Error al exportar la sección:', err);
      return false;
    }
  });
}

/**
 * 10. Generates an image blob and copies it directly to the user's clipboard.
 * This is incredibly convenient for pasting directly into Word, PowerPoint, emails, or chats without saving a file first.
 */
export async function copyElementImageToClipboard(
  elementId: string,
  setPreviewImage?: (dataUrl: string) => void
): Promise<boolean> {
  return runOklchSafeAsync(async () => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Error: No se encontró el elemento con ID "${elementId}".`);
      return false;
    }

    try {
      const computedBgColor = window.getComputedStyle(element).backgroundColor;
      const finalBgColor = (computedBgColor === 'rgba(0, 0, 0, 0)' || computedBgColor === 'transparent' || !computedBgColor)
        ? '#ffffff'
        : computedBgColor;

      const normalizedBgColor = /(oklch|oklab|lab|lch)/i.test(finalBgColor)
        ? convertCssColorToRgb(finalBgColor)
        : finalBgColor;

      const canvas = await html2canvas(element, getHtml2CanvasConfig(normalizedBgColor));

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error('No fue posible generar imagen'));
          }
        }, 'image/png');
      });

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        return true;
      } catch (err) {
        console.warn('La escritura directa al portapeles falló, activando fallback de vista previa:', err);
        const dataUrl = canvas.toDataURL('image/png');
        if (setPreviewImage) {
          setPreviewImage(dataUrl);
        }
        return false;
      }
    } catch (err) {
      console.error('Error en proceso de copiado:', err);
      return false;
    }
  });
}

