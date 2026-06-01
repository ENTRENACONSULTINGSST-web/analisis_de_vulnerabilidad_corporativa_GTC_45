/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DiamondProps {
  top: string;
  left: string;
  right: string;
  bottom: string;
}

/**
 * Helper to map semantic risk colors (green, yellow, red) to beautiful,
 * modern Tailwind hexadecimal colors, or return the color as-is if it's already a custom HEX/CSS color.
 */
const resolveColor = (color: string) => {
  const normalized = color.toLowerCase().trim();
  switch (normalized) {
    case 'green':
    case 'verde':
    case '#10b981':
    case '#00ff00':
    case 'g':
      return '#10B981'; // Tailwind Emerald 500
    case 'yellow':
    case 'amarillo':
    case '#f59e0b':
    case '#ffff00':
    case 'y':
      return '#F59E0B'; // Tailwind Amber 500
    case 'red':
    case 'rojo':
    case '#ef4444':
    case '#ff0000':
    case 'r':
      return '#EF4444'; // Tailwind Red 500
    default:
      return color;
  }
};

/**
 * Dynamic Risk Diamond component representing threat/vulnerability indicators
 * (Top: Amenaza, Left: Personas, Right: Recursos, Bottom: Sistemas/Socio-organizacional)
 */
export default function RiskDiamond({
  top,
  left,
  right,
  bottom,
}: DiamondProps) {
  const diamondStyle = (color: string) => {
    const bg = resolveColor(color);
    
    // Select border color based on the actual color intensity
    let borderColor = '#b59f00'; // Default requested border
    if (bg === '#10B981') borderColor = '#047857'; // Border Emerald 700
    if (bg === '#F59E0B') borderColor = '#b45309'; // Border Amber 700
    if (bg === '#EF4444') borderColor = '#b91c1c'; // Border Red 700

    return {
      width: "12px",
      height: "12px",
      backgroundColor: bg,
      border: `1.5px solid ${borderColor}`,
      transform: "rotate(45deg)",
      position: "absolute" as const,
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
    };
  };

  return (
    <div
      style={{
        position: "relative",
        width: "28px",
        height: "28px",
        margin: "0 auto",
      }}
      title={`Top (Amenaza): ${top} | Left (Personas): ${left} | Right (Recursos): ${right} | Bottom (Sistemas): ${bottom}`}
    >
      {/* Superior (Amenaza) */}
      <div
        style={{
          ...diamondStyle(top),
          top: "0px",
          left: "8px",
        }}
      />

      {/* Izquierdo (Personas) */}
      <div
        style={{
          ...diamondStyle(left),
          top: "8px",
          left: "0px",
        }}
      />

      {/* Derecho (Recursos) */}
      <div
        style={{
          ...diamondStyle(right),
          top: "8px",
          left: "16px",
        }}
      />

      {/* Inferior (Sistemas / Procesos) */}
      <div
        style={{
          ...diamondStyle(bottom),
          top: "16px",
          left: "8px",
        }}
      />
    </div>
  );
}
