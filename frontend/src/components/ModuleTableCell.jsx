import { useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import './ModuleTable.css';

// eslint-disable-next-line react/prop-types
export default function ModuleTableCell({ id, children }) {
  const [show, setShow] = useState(false);
  const popoverHovered = useRef(false);
  const contentRef = useRef(null);
  return (
    <OverlayTrigger
      placement="auto"
      show={show}
      onToggle={(next) => {
        if (next) {
          const element = contentRef.current;
          setShow(
            Boolean(element && element.scrollWidth > element.clientWidth),
          );
        } else if (!popoverHovered.current) {
          setShow(false);
        }
      }}
      trigger={['hover', 'focus']}
      delay={{ show: 150, hide: 150 }}
      overlay={
        <Popover
          id={id}
          className="module-content-popover"
          onMouseEnter={() => {
            popoverHovered.current = true;
            setShow(true);
          }}
          onMouseLeave={() => {
            popoverHovered.current = false;
            setShow(false);
          }}
        >
          <Popover.Body>{children}</Popover.Body>
        </Popover>
      }
    >
      <span ref={contentRef} className="module-cell-content" tabIndex={0}>
        {children}
      </span>
    </OverlayTrigger>
  );
}
