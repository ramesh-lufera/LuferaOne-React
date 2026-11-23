/* eslint-disable react/prop-types */
import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, DotsThreeVertical } from '@phosphor-icons/react';

export default function SheetColumnHeader({ header, index, disabled, dragDisabled, expanded, onOptions, width, onResizePreview, onResizeEnd, onResizeCancel }) {
  const resizeRef = useRef(null);
  const clamp = (value) => Math.max(120, Math.min(1200, Math.round(value)));
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `column-${index}`, disabled: disabled || dragDisabled || index === 0 });
  return <th ref={setNodeRef} scope="col" style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 3 : undefined, opacity: isDragging ? 0.7 : undefined }}>
    {index > 0 && <button type="button" className="sheet-column-drag" aria-label={`Move column ${index + 1}: ${header}`} title="Drag to reorder; press Space and use arrow keys to move" disabled={disabled || dragDisabled} {...attributes} {...listeners}><DotsSixVertical size={16} aria-hidden="true" /></button>}
    <span className="sheet-column-title">{header}</span><button type="button" className="sheet-column-options" aria-label={`Column ${index + 1} options`} aria-haspopup="menu" aria-expanded={expanded} disabled={disabled} onClick={onOptions}><DotsThreeVertical size={18} aria-hidden="true" /></button>
    <button type="button" className="sheet-column-resize" aria-label={`Resize column ${index + 1}: ${header}`} title="Drag to resize; use arrow keys for fine adjustments" disabled={disabled}
      onPointerDown={(event) => { if (event.button !== 0) return; event.preventDefault(); event.stopPropagation(); resizeRef.current = { x: event.clientX, width }; event.currentTarget.setPointerCapture(event.pointerId); onResizePreview(width); }}
      onPointerMove={(event) => { if (resizeRef.current) onResizePreview(clamp(resizeRef.current.width + event.clientX - resizeRef.current.x)); }}
      onPointerUp={(event) => { if (!resizeRef.current) return; const next = clamp(resizeRef.current.width + event.clientX - resizeRef.current.x); resizeRef.current = null; event.currentTarget.releasePointerCapture(event.pointerId); onResizeEnd(next); }}
      onPointerCancel={() => { resizeRef.current = null; onResizeCancel(); }}
      onLostPointerCapture={() => { if (resizeRef.current) { resizeRef.current = null; onResizeCancel(); } }}
      onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); onResizeEnd(clamp(width + (event.key === 'ArrowRight' ? 10 : -10))); } }} />
  </th>;
}
