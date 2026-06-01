/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, X, CheckSquare } from 'lucide-react';
import { copyElementImageToClipboard } from '../utils/sectionExport';

interface ExportDropdownProps {
  elementId: string;
  align?: 'left' | 'right';
  buttonText?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  elementId,
  align = 'right',
  buttonText = 'Copiar'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCopyImage = async () => {
    setIsProcessing(true);
    setPreviewImage(null);

    try {
      const success = await copyElementImageToClipboard(elementId, setPreviewImage);

      if (success) {
        setImageCopied(true);
        
        // Show user-friendly direct alert instruction
        alert('Sección copiada. Use Ctrl+V para pegar.');

        setTimeout(() => {
          setImageCopied(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al copiar la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="relative inline-block text-left"
    >
      <button
        type="button"
        onClick={handleCopyImage}
        disabled={isProcessing}
        className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        <Share2 className="w-4 h-4" />

        <span>
          {isProcessing
            ? 'Copiando...'
            : buttonText}
        </span>
      </button>

      {imageCopied && (
        <div className="absolute top-full mt-1 right-0 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded whitespace-nowrap z-50 shadow-md">
          ✓ Sección copiada. Use Ctrl+V para pegar.
        </div>
      )}

      {/* FALLBACK INSTRUCTION MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Instrucciones para Copiar y Pegar</h3>
              </div>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs leading-relaxed text-amber-900">
                <p className="font-bold mb-1">💡 Copia Manual Necesaria:</p>
                Debido a las restricciones de seguridad o permisos de portapapeles de este navegador/entorno, no pudimos escribir la imagen automáticamente. Sigue estos sencillos pasos para copiarla:
              </div>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 border border-slate-100 rounded-lg">
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">1</span>
                  <span>Haz <strong>clic derecho</strong> en la imagen que se muestra a continuación.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">2</span>
                  <span>Selecciona la opción <strong>"Copiar imagen"</strong> (o "Copy image").</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">3</span>
                  <span>¡Listo! Ahora ve a tu documento de Word, Excel o PowerPoint y presiona <strong>Ctrl + V</strong> (o Cmd + V en Mac) para pegarla directamente.</span>
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 p-2 flex justify-center max-h-[40vh] overflow-y-auto">
                <img 
                  referrerPolicy="no-referrer"
                  src={previewImage} 
                  alt="Vista previa de la sección" 
                  className="object-contain max-w-full shadow-sm bg-white rounded border border-slate-200"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
