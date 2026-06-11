/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  id,
  ...props 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = `${textarea.scrollHeight}px`;
      if (textarea.style.height !== newHeight) {
        textarea.style.height = newHeight;
      }
    }
  };

  useLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  // Manejar cambios de ventana/responsive
  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }
        adjustHeight();
      }}
      placeholder={placeholder}
      className={className?.replace('transition-all', '') || ''}
      style={{ overflow: 'hidden', resize: 'none' }}
      rows={1}
      id={id}
      {...props}
    />
  );
};
