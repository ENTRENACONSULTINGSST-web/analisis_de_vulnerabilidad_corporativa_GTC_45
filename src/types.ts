/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VulnerabilityItem {
  id: string;
  question: string;
  score: number; // 0 = SI (Vulnerable/Acción), 1 = NO (Menos vulnerable), 0.5 = PARCIAL
  // Wait, let's look at the images:
  // IN THE PROCESSES AND SYSTEMS: "SI = 0, NO = 1, PARCIAL = 0.5"
  // Wait, let's verify if SI = 0 means NO vulnerability, or SI = 0 means they HAVE the resource/system?
  // Yes! The formula says: SI = 0 (No vulnerability / they have it), NO = 1 (Vulnerable / they do not have it), PARCIAL = 0.5 (Partially vulnerable).
  // So a lower score means BETTER preparation/LESS vulnerability.
  // A higher score means WORSE preparation/MORE vulnerability.
  // This perfectly explains why "Total Personas = 1.1" yields Yellow/Medio (1.1 - 2.0).
  observation: string;
}

export interface VulnerabilitySection {
  id: string; // e.g., 'servicios'
  name: string; // e.g., '1. SERVICIOS PÚBLICOS'
  questions: VulnerabilityItem[];
}

export interface VulnerabilityCategory {
  id: string; // 'personas' | 'recursos' | 'sistemas'
  name: string; // 'EN LAS PERSONAS' | 'EN LOS RECURSOS' | 'EN LOS SISTEMAS Y PROCESOS'
  sections: VulnerabilitySection[];
}

export interface ThreatItem {
  id: string;
  name: string;
  category: 'NATURAL' | 'TECNOLÓGICO' | 'SOCIAL';
  origin: {
    externo: boolean;
    interno: boolean;
  };
  source: string;
  qualification: 'POSIBLE' | 'PROBABLE' | 'INMINENTE';
  observation: string;
}

// Default values populated directly from the images for a "Generic" assessment.
export const DEFAULT_VULNERABILITY_DATA: VulnerabilityCategory[] = [
  {
    id: 'personas',
    name: 'EN LAS PERSONAS',
    sections: [
      {
        id: 'organizacion',
        name: '1. Organización',
        questions: [
          {
            id: 'p_org_1',
            question: '¿Existe una política general en Seguridad y Salud en el Trabajo donde se indica la prevención y preparación para afrontar una emergencia?',
            score: 0,
            observation: 'Está contenida en el sistema de gestión y seguridad en el trabajo.'
          },
          {
            id: 'p_org_2',
            question: '¿Existe comité de emergencias y tiene funciones asignadas?',
            score: 1,
            observation: ''
          },
          {
            id: 'p_org_3',
            question: '¿La Empresa participa y promueve activamente a sus trabajadores el programa de preparación para emergencias?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_org_4',
            question: '¿Existe brigada de emergencias?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_org_5',
            question: '¿Existen coordinadores de evacuación por área?',
            score: 0,
            observation: ''
          }
        ]
      },
      {
        id: 'capacitacion',
        name: '2. Capacitación',
        questions: [
          {
            id: 'p_cap_1',
            question: '¿Se cuenta con un programa de capacitación en prevención y control de emergencias?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_cap_2',
            question: '¿Se encuentran capacitados para emergencias con incendio por baterías de litio?',
            score: 1,
            observation: 'Se recomienda capacitarse en la atención de incendios con este producto.'
          },
          {
            id: 'p_cap_3',
            question: '¿Se cuenta con un programa de capacitación en primeros auxilios?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_cap_4',
            question: '¿Los miembros del comité, la brigada y los coordinadores de evacuación se encuentran capacitados?',
            score: 0,
            observation: 'Capacitación realizada con ARL Colmena 2023.'
          },
          {
            id: 'p_cap_5',
            question: '¿Las personas han recibido capacitación general en temas básicos de emergencias y en general saben protegerse?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_cap_6',
            question: '¿Se ha divulgado la información sobre emergencias a los visitantes, contratistas y clientes?',
            score: 1,
            observation: 'Se debe socializar al menos con el personal visitante temas de ruta de evacuación y puntos de encuentro.'
          },
          {
            id: 'p_cap_7',
            question: '¿Está divulgado el plan de emergencias y evacuación?',
            score: 0,
            observation: ''
          },
          {
            id: 'p_cap_8',
            question: '¿Se cuenta con manuales, folletos como material de divulgación en temas de prevención y control de emergencias?',
            score: 1,
            observation: 'Se debe realizar manuales visibles en las pantallas de computadores.'
          }
        ]
      },
      {
        id: 'dotacion',
        name: '3. Dotación',
        questions: [
          {
            id: 'p_dot_1',
            question: '¿Existe dotación personal (distintivos) para el personal de la brigada, coordinadores de evacuación y comité de emergencias?',
            score: 1,
            observation: 'Tiene brazaletes, pitos y linternas.'
          },
          {
            id: 'p_dot_2',
            question: '¿El personal de la brigada cuenta con equipos de protección personal e implementos para atender cada emergencia?',
            score: 0,
            observation: 'No usan cascos. Los brigadistas de administración no usan guantes de nylon, ni calzado con puntera de seguridad.'
          }
        ]
      }
    ]
  },
  {
    id: 'recursos',
    name: 'EN LOS RECURSOS',
    sections: [
      {
        id: 'materiales',
        name: '1. MATERIALES',
        questions: [
          {
            id: 'r_mat_1',
            question: '¿Se cuenta con extintores portátiles suficientes?',
            score: 0,
            observation: 'Total extintores 26, multipropósito 5 CO2.'
          },
          {
            id: 'r_mat_2',
            question: '¿Se cuenta con camillas, inmovilizadores y equipos para transporte de lesionados suficientes y adecuados?',
            score: 0.5,
            observation: '1 férula espinal larga, no se cuenta con inmovilizadores cervicales y de extremidades.'
          },
          {
            id: 'r_mat_3',
            question: '¿Se cuenta con botiquines suficiente y adecuadamente dotados?',
            score: 0,
            observation: 'Botiquín tipo A según Res 705 de 2007.'
          }
        ]
      },
      {
        id: 'edificaciones',
        name: '2. EDIFICACIONES',
        questions: [
          {
            id: 'r_edi_1',
            question: '¿El tipo de construcción es sismo resistente?',
            score: 1,
            observation: 'NSR-10'
          },
          {
            id: 'r_edi_2',
            question: '¿Tiene protección física como barreras, diques, puertas y muros cortafuego?',
            score: 1,
            observation: 'NSR-10'
          },
          {
            id: 'r_edi_3',
            question: '¿Las escaleras de emergencias se encuentran en buen estado y poseen doble pasamanos?',
            score: 0,
            observation: 'Se tiene una sola escalera interna. No tiene la edificación escaleras de evacuación externa.'
          },
          {
            id: 'r_edi_4',
            question: '¿Existe más de una salida y se han diseñado rutas principales y alternas de evacuación?',
            score: 0.5,
            observation: 'Es una edificación con una salida peatonal y una salida de vehículos.'
          },
          {
            id: 'r_edi_5',
            question: '¿Están señalizadas vías de evacuación y equipos contra incendio?',
            score: 0,
            observation: 'Existe una adecuada señalización.'
          }
        ]
      },
      {
        id: 'equipos',
        name: '3. EQUIPOS',
        questions: [
          {
            id: 'r_equ_1',
            question: '¿Se cuenta con algún sistema de Alerta y Alarma?',
            score: 1,
            observation: 'Se usan pitos. Se recomienda la compra de pitos bajo norma NSR10 K.3.2.5. Y usar la baliza y parlante de la alarma de seguridad.'
          },
          {
            id: 'r_equ_2',
            question: '¿Se cuenta con sistemas automáticos de detección de emergencias?',
            score: 0.5,
            observation: 'Se cuenta con 95 detectores. Recomienda que los detectores de humo estén conectados a un sistema de monitoreo general NSR10 J.4.2.'
          },
          {
            id: 'r_equ_3',
            question: '¿Se cuenta con sistemas automáticos de control del fuego?',
            score: 1,
            observation: 'No hay aspersores.'
          },
          {
            id: 'r_equ_4',
            question: '¿Se cuenta con paneles de control del sistema de alarma?',
            score: 1,
            observation: 'No hay pulsadores de alarma de incendio.'
          },
          {
            id: 'r_equ_5',
            question: '¿Se cuenta con circuito cerrado de televisión?',
            score: 0,
            observation: ''
          },
          {
            id: 'r_equ_6',
            question: '¿Se cuenta con un sistema de comunicaciones alterno?',
            score: 0,
            observation: 'Radio comunicadores enlazados con la portería del Parque Industrial Guadalajara.'
          },
          {
            id: 'r_equ_7',
            question: '¿Se cuenta con una red hidráulica contra incendio dotada de bombas, siamesas y gabinetes?',
            score: 1,
            observation: 'Los gabinetes contra incendios nunca han funcionado, se encuentra en proceso de habilitación.'
          },
          {
            id: 'r_equ_8',
            question: '¿Existen hidrantes públicos y/o privados?',
            score: 1,
            observation: 'No hay hidrantes públicos y/o privados.'
          },
          {
            id: 'r_equ_9',
            question: '¿Los gabinetes contra incendio están dotados con manguera, pitón, llave y extintor?',
            score: 0,
            observation: 'No están en servicio.'
          },
          {
            id: 'r_equ_10',
            question: '¿Se cuenta con vehículos propios de la empresa que permitan un transporte masivo en caso de emergencia?',
            score: 0,
            observation: '3 vehículos tipo furgón.'
          },
          {
            id: 'r_equ_11',
            question: '¿Se cuenta con programa de mantenimiento preventivo para los equipos de emergencia?',
            score: 0,
            observation: 'Inspecciones de Copasst y Brigada.'
          }
        ]
      }
    ]
  },
  {
    id: 'sistemas',
    name: 'EN LOS SISTEMAS Y PROCESOS',
    sections: [
      {
        id: 'servicios',
        name: '1. SERVICIOS PÚBLICOS',
        questions: [
          {
            id: 's_ser_1',
            question: '¿Se cuenta con buen suministro de energía?',
            score: 0,
            observation: ''
          },
          {
            id: 's_ser_2',
            question: '¿Se cuenta con buen suministro de gas?',
            score: 0,
            observation: ''
          },
          {
            id: 's_ser_3',
            question: '¿Se cuenta con buen suministro de agua?',
            score: 0,
            observation: ''
          },
          {
            id: 's_ser_4',
            question: '¿Se cuenta con buen sistema de alcantarillado?',
            score: 0,
            observation: ''
          },
          {
            id: 's_ser_5',
            question: '¿Se cuenta con un buen programa de recolección de basuras?',
            score: 0,
            observation: ''
          },
          {
            id: 's_ser_6',
            question: '¿Se cuenta con buen servicio de radio comunicaciones?',
            score: 0,
            observation: 'Radiocomunicaciones con la portería del Parque Industrial Guadalajara.'
          }
        ]
      },
      {
        id: 'alternos',
        name: '2. SISTEMAS ALTERNOS',
        questions: [
          {
            id: 's_alt_1',
            question: '¿Se cuenta con tanques de reserva de agua?',
            score: 0,
            observation: ''
          },
          {
            id: 's_alt_2',
            question: '¿Se cuenta con un generador eléctrico de emergencia?',
            score: 0,
            observation: 'Sin embargo, está en la zona de alimentación de los trabajadores.'
          },
          {
            id: 's_alt_3',
            question: '¿Se cuenta con un sistema de iluminación de emergencia?',
            score: 1,
            observation: 'Se recomienda dotar a la empresa de lámparas de emergencia. NSR-10 K3.2.4.3'
          },
          {
            id: 's_alt_4',
            question: '¿Se cuenta con un buen sistema de vigilancia física?',
            score: 0,
            observation: ''
          },
          {
            id: 's_alt_5',
            question: '¿Se cuenta con un sistema de comunicación diferente al público?',
            score: 0,
            observation: 'Radio Comunicadores Portátiles.'
          }
        ]
      },
      {
        id: 'recuperacion',
        name: '3. RECUPERACION',
        questions: [
          {
            id: 's_rec_1',
            question: '¿Se cuenta con algún sistema de seguro para los empleados?',
            score: 0.5,
            observation: 'Con la ARL.'
          },
          {
            id: 's_rec_2',
            question: '¿Se cuenta asegurada la edificación en caso de terremoto, incendio, atentados terroristas etc.?',
            score: 0.5,
            observation: ''
          },
          {
            id: 's_rec_3',
            question: '¿Se cuenta con un sistema alterno para asegurar la información medio magnético y con alguna Cía. aseguradora?',
            score: 1,
            observation: 'No se posee información.'
          },
          {
            id: 's_rec_4',
            question: '¿Se encuentran asegurados los equipos y todos los bienes en general?',
            score: 1,
            observation: ''
          },
          {
            id: 's_rec_5',
            question: '¿Existe un protocolo con asignación de funciones para la recuperación en caso de emergencia?',
            score: 1,
            observation: 'Se cuenta con un solo rack de sistema de almacenamiento informático.'
          }
        ]
      }
    ]
  }
];

export const DEFAULT_THREATS_DATA: ThreatItem[] = [
  {
    id: 't_1',
    name: 'Movimientos sísmicos',
    category: 'NATURAL',
    origin: { externo: true, interno: false },
    source: 'Situaciones de sismo presentadas en la ciudad.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_2',
    name: 'Inundaciones',
    category: 'NATURAL',
    origin: { externo: true, interno: false },
    source: 'Inundaciones presentadas con anterioridad en la Bodega.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_3',
    name: 'Incendios',
    category: 'TECNOLÓGICO',
    origin: { externo: true, interno: true },
    source: 'Por almacenamiento de mercancía con batería de litio UN3481. Corto circuito en red eléctrica, equipos de cómputo, electrodomésticos, mobiliario, almacenamiento de papelería incendios en locales vecinos.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_4',
    name: 'Explosiones',
    category: 'TECNOLÓGICO',
    origin: { externo: true, interno: true },
    source: 'Almacenamiento de mercancía con batería de litio UN3481.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_5',
    name: 'Fallas estructurales',
    category: 'TECNOLÓGICO',
    origin: { externo: false, interno: true },
    source: 'Debilitamiento de estructura física en la oficina, caída de techos. Daño de las estanterías industriales pesadas, con pasillos peatonales de 4 niveles.',
    qualification: 'POSIBLE',
    observation: ''
  },
  {
    id: 't_6',
    name: 'Ausencia del fluido eléctrico',
    category: 'TECNOLÓGICO',
    origin: { externo: true, interno: true },
    source: 'Corte en el suministro de energía por reparación o daños.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_7',
    name: 'Accidentes Viales',
    category: 'TECNOLÓGICO',
    origin: { externo: true, interno: true },
    source: 'Ingresan vehículos para cargue y descargue de mercancía.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_8',
    name: 'Trabajo en Alturas',
    category: 'TECNOLÓGICO',
    origin: { externo: false, interno: true },
    source: 'No se desarrollan trabajos de alto riesgo en alturas, sí se almacena mercancía en estanterías industriales de cuatro niveles sin ayuda de elevadores o montacargas.',
    qualification: 'PROBABLE',
    observation: ''
  },
  {
    id: 't_9',
    name: 'Terrorismo',
    category: 'SOCIAL',
    origin: { externo: true, interno: false },
    source: 'Situación socio política del país.',
    qualification: 'POSIBLE',
    observation: ''
  },
  {
    id: 't_10',
    name: 'De orden público',
    category: 'SOCIAL',
    origin: { externo: true, interno: false },
    source: 'Situación socio política del país.',
    qualification: 'POSIBLE',
    observation: ''
  },
  {
    id: 't_11',
    name: 'Asaltos y hurtos',
    category: 'SOCIAL',
    origin: { externo: true, interno: true },
    source: 'Situación socio política del país.',
    qualification: 'POSIBLE',
    observation: ''
  }
];

export function getScoreInterpretationColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 0.0 && score <= 1.0) return 'green';
  if (score > 1.0 && score <= 2.0) return 'yellow';
  return 'red';
}

export function getThreatColor(qualification: 'POSIBLE' | 'PROBABLE' | 'INMINENTE' | 'BAJO' | 'MEDIO' | 'ALTO' | string): 'green' | 'yellow' | 'red' {
  const check = String(qualification).toUpperCase();
  if (check === 'POSIBLE' || check === 'BAJO') return 'green';
  if (check === 'PROBABLE' || check === 'MEDIO') return 'yellow';
  return 'red'; // INMINENTE or ALTO
}
