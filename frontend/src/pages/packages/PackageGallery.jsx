/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';

export default function PackageGallery({ name, cover, gallery = [] }) {
  const images = [cover, ...gallery.slice(0, 3)].filter(Boolean);
  const [selected, setSelected] = useState(0);
  const [show, setShow] = useState(false);
  const touchStart = useRef(null);
  const count = images.length;
  const move = (step) => setSelected((index) => (index + step + count) % count);

  useEffect(() => {
    if (!show || count < 2) return;
    function handleKey(event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const step = event.key === 'ArrowLeft' ? -1 : 1;
        setSelected((index) => (index + step + count) % count);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, count]);

  if (!count) return null;
  return <div className={`package-gallery${count < 2 ? ' package-gallery-single' : ''}`}>
    {count > 1 && <div className="package-thumbnails" aria-label="Package image previews">
      {images.map((url, index) => {
        const imageIndex = index;
        return <button key={url} type="button" className="package-thumbnail" aria-label={`Show preview image ${index + 1}`} aria-pressed={selected === imageIndex} onClick={() => setSelected(imageIndex)}>
          <img src={url} alt="" />
        </button>;
      })}
    </div>}
    <button type="button" className="package-main-image" aria-label={`Enlarge ${name} image`} aria-haspopup="dialog" onClick={() => setShow(true)}>
      <img src={images[selected]} alt={`${name} — image ${selected + 1}`} />
      <span className="package-zoom-icon" aria-hidden="true"><i className="ri-zoom-in-line" /></span>
    </button>
    <Modal show={show} onHide={() => setShow(false)} centered size="xl" dialogClassName="package-lightbox" contentClassName="package-lightbox-content" aria-labelledby="package-lightbox-title">
      <Modal.Header closeButton>
        <Modal.Title as="h2" id="package-lightbox-title">{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="package-lightbox-stage" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
          if (touchStart.current !== null && count > 1) {
            const distance = touchStart.current - event.changedTouches[0].clientX;
            if (Math.abs(distance) > 50) move(distance > 0 ? 1 : -1);
          }
          touchStart.current = null;
        }}>
          <img src={images[selected]} alt={`${name} — enlarged image ${selected + 1}`} />
          {count > 1 && <>
            <button type="button" className="package-lightbox-prev" aria-label="Previous image" onClick={() => move(-1)}>‹</button>
            <button type="button" className="package-lightbox-next" aria-label="Next image" onClick={() => move(1)}>›</button>
          </>}
        </div>
        <p className="package-lightbox-count" role="status">{selected + 1} / {count}</p>
        {count > 1 && <div className="package-lightbox-thumbnails">{images.map((url, index) => <button type="button" key={url} aria-label={`View gallery image ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={url} alt="" /></button>)}</div>}
      </Modal.Body>
    </Modal>
  </div>;
}
