/* eslint-disable react/prop-types */
import { Overlay, Popover } from 'react-bootstrap';
import { ArrowUp, ArrowDown, Scissors, Copy, Clipboard, Trash, Paperclip, ChatCircle, Bell, Lock, LockOpen, Printer } from '@phosphor-icons/react';

export default function SheetRowMenu({ target, rowNumber, locked, canInsert, canCut, canPaste, onAction, onClose }) {
  const items = [
    { label: 'Insert Above', icon: ArrowUp, disabled: !canInsert },
    { label: 'Insert Below', icon: ArrowDown, disabled: !canInsert },
    { label: 'Cut Row', icon: Scissors, divider: true, disabled: locked || !canCut },
    { label: 'Copy Row', icon: Copy },
    { label: 'Paste Row', icon: Clipboard, disabled: !canPaste },
    { label: 'Delete Row', icon: Trash, disabled: locked },
    { label: 'Attachments', icon: Paperclip, divider: true },
    { label: 'Comments', icon: ChatCircle },
    { label: 'Reminder', icon: Bell, disabled: locked },
    { label: locked ? 'Unlock' : 'Lock', icon: locked ? LockOpen : Lock, divider: true },
    { label: 'Print', icon: Printer },
  ];
  function navigate(event) {
    const buttons = [...event.currentTarget.querySelectorAll('button:not(:disabled)')];
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); onClose(); target?.focus(); return; }
    let next;
    if (event.key === 'ArrowDown') next = buttons[(index + 1) % buttons.length];
    if (event.key === 'ArrowUp') next = buttons[(index - 1 + buttons.length) % buttons.length];
    if (event.key === 'Home') next = buttons[0];
    if (event.key === 'End') next = buttons[buttons.length - 1];
    if (next) { event.preventDefault(); next.focus(); }
    if (event.key === 'Tab') onClose();
  }
  return <Overlay show target={target} placement="right-start" flip rootClose onHide={onClose} transition={false} popperConfig={{ strategy: 'fixed' }}>
    <Popover id="sheet-row-menu" className="sheet-row-menu">
      <div role="menu" aria-label={`Task row ${rowNumber} options`} onKeyDown={navigate}>
        {items.map(({ label, icon: ItemIcon, divider, disabled }, index) => <div key={label} className={divider ? 'sheet-row-menu-divider' : undefined}>
          <button role="menuitem" type="button" disabled={disabled} autoFocus={index === items.findIndex((item) => !item.disabled)} onClick={() => { onClose(); target?.focus(); onAction(label); }}><ItemIcon size={20} aria-hidden="true" /><span>{label}</span></button>
        </div>)}
      </div>
    </Popover>
  </Overlay>;
}
