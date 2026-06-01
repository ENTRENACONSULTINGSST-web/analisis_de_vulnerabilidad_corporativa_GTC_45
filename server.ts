/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload size limits
  app.use(express.json({ limit: '10mb' }));

  // API endpoints
  app.post("/api/analyze", async (req, res) => {
    try {
      const { vulnerabilitySummary, threats } = req.body;

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
        // Safe rule-based fallback when no api key is configured
        return res.json({
          report: `### Informe Técnico de Análisis de Riesgos y Vulnerabilidades (Metodología Diamante de Riesgo GTC-45 / FOP)

*Nota: Reporte generado de manera local debido a que la API Key de Gemini no se encuentra activa en Secrets.*

---

#### 1. Diagnóstico de Vulnerabilidades por Componente

*   **EN LAS PERSONAS**: Calificación de **${vulnerabilitySummary.personas.score.toFixed(2)} (${vulnerabilitySummary.personas.interpretation.toUpperCase()})**
    *   *Hallazgo*: Existe una debilidad importante debido a la ausencia reportada de capacitaciones críticas, carencias en la conformación oficial de la brigada y coordinadores de evacuación.
*   **EN LOS RECURSOS**: Calificación de **${vulnerabilitySummary.recursos.score.toFixed(2)} (${vulnerabilitySummary.recursos.interpretation.toUpperCase()})**
    *   *Hallazgo*: Se detecta que escaleras críticas internas no tienen doble baranda o salida externa de emergencias. El sistema de alerta/alarma depende de instrumentos básicos (pitos) y los gabinetes e hidrantes presentan problemas de inoperatividad/mantenimiento.
*   **EN LOS SISTEMAS Y PROCESOS**: Calificación de **${vulnerabilitySummary.sistemas.score.toFixed(2)} (${vulnerabilitySummary.sistemas.interpretation.toUpperCase()})**
    *   *Hallazgo*: Aunque existe un adecuado suministro de servicios básicos, hay debilidades en los protocolos de recuperación de datos informáticos (un solo rack de almacenamiento de información magnética) y asignación de planes de contingencia para la continuidad.

---

#### 2. Evaluación de Amenazas Críticas

De las amenazas detalladas en el análisis, las clasificadas como **PROBABLE** e **INMINENTE** requieren acciones de control inmediatas:
${threats
  .filter((t: any) => t.qualification !== 'POSIBLE')
  .map((t: any) => `*   **${t.name}** (${t.category}): Calificación **${t.qualification}**. Fuente identificada: *${t.source}*`)
  .join('\n')}

---

#### 3. Plan de Acción Priorizado

##### A. Acciones Inmediatas (Corto Plazo - < 30 días)
1.  **Personas**: Oficializar el nombramiento e instauración de la **Brigada de Emergencias** y los Coordinadores de Evacuación correspondientes por todas las áreas activas.
2.  **Sistemas**: Adquirir lámparas autónomas de iluminación de emergencia e instalarlas en pasillos de evacuación y zonas operativas según requerimientos técnicos.
3.  **Recursos**: Coordinar con la administración de copropiedad la habilitación, prueba de presión y puesta a punto de la red hidráulica contra incendios y sus correspondientes gabinetes auxiliares.

##### B. Acciones Preventivas (Mediano Plazo - 3 a 6 meses)
1.  **Capacitación**: Programar un taller intensivo sobre el manejo y actuación segura ante fuegos originados en **baterías de litio**, en articulación con la aseguradora de riesgos (ARL).
2.  **Infraestructura**: Adecuar escaleras internas colocando doble pasamanos continuo y evaluar la factibilidad técnica de estructurar una ruta externa de escape secundaria para la edificación.
3.  **Tecnología**: Configurar un sistema alterno de respaldo redundante en la nube para asegurar la información magnética clave de la empresa en caso de destrucción física del servidor local.

##### C. Simulacros y Continuidad (Largo Plazo - de carácter permanente)
1.  **Planificación**: Diseñar un cronograma anual de simulacros prácticos integrando amenazas del entorno como sismos e incendios.
2.  **Divulgación**: Imprimir y desplegar mapas de evacuación simplificados visibles, con infografías de autoprotección para contratistas y visitantes externos.`
        });
      }

      // If key is present, let's execute the actual GenAI call
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptString = `Eres un consultor experto en Seguridad y Salud en el Trabajo (SST), gestión de riesgos industriales y planes de contingencia corporativos. 
Estamos realizando un análisis estricto de vulnerabilidad y amenazas para una organización con base en la metodología del Diamante de Riesgo (GTC-45 / FOP).

Analiza técnicamente la siguiente matriz de datos recolectados para generar un plan de acción formal y un diagnóstico de vulnerabilidad estratégico:

1. RESUMEN DE COMPONENTES DE VULNERABILIDAD:
- Componente Personas (Organización, Capacitación, Dotación): Promedio total = ${vulnerabilitySummary.personas.score.toFixed(2)} (${vulnerabilitySummary.personas.interpretation})
- Componente Recursos (Materiales, Edificaciones, Equipos): Promedio total = ${vulnerabilitySummary.recursos.score.toFixed(2)} (${vulnerabilitySummary.recursos.interpretation})
- Componente Sistemas y Procesos (Servicios públicos, Sistemas alternos, Recuperación): Promedio total = ${vulnerabilitySummary.sistemas.score.toFixed(2)} (${vulnerabilitySummary.sistemas.interpretation})

2. MATRIZ DETALLADA DE AMENAZAS EVALUADAS:
${JSON.stringify(threats, null, 2)}

Por favor escribe un reporte ejecutivo profesional y estructurado en Markdown que contenga las siguientes secciones redactadas de forma constructiva, directa, sumamente profesional, con un tono neutral y genérico (evita usar o inventar marcas comerciales concretas, sé genérico para que sirva a cualquier empresa):
- **Diagnóstico Situacional del Nivel de Riesgo**: Analiza cómo interactúan los altos niveles de vulnerabilidad encontrados con las amenazas identificadas como PROBABLES o INMINENTES de acuerdo al Diamante de Riesgo GTC-45.
- **Vulnerabilidades Más Críticas Encontradas**: Enumera los factores de mayor gravedad a corregir según los cuestionarios diligenciados (especialmente donde hay puntuaciones altas de vulnerabilidad).
- **Estrategia Integral de Mitigación y Supervención (Corto, Mediano y Largo Plazo)**: Brinda soluciones realistas y normativas en Seguridad y Salud en el Trabajo (SST) para mejorar la preparación de las Personas, la confiabilidad de los Recursos y la robustez de los Sistemas y Procesos.
- **Acciones específicas para Litio o Materiales Críticos**: Si se listan baterías de litio, indica medidas de almacenamiento, contención y supresión de fuegos químicas.
- **Conclusión General**: Mensaje ejecutivo enfatizando que la gestión del riesgo de desastres es una inversión en la resiliencia y resguardo humano y operacional de las organizaciones.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: promptString,
      });

      res.json({ report: response.text || "No se pudo generar texto del modelo." });
    } catch (error: any) {
      console.error("Gemini server analysis error:", error);
      res.status(500).json({ error: error.message || "Error interno al invocar a Gemini AI" });
    }
  });

  // Serve static assets or run Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
