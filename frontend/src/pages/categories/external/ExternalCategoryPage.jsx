import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useCompanyBranding from '../../../helper/useCompanyBranding';
import { CategoryDetails } from '../CategoryPage';
import './ExternalCategoryPage.css';

const supportEmail = 'info@luferatech.com';
const companyWebsite = 'https://luferatech.com';

export default function ExternalCategoryPage() {
  const { images, contact } = useCompanyBranding({ includeContact: true });
  const [showContact, setShowContact] = useState(false);
  const [emailOpened, setEmailOpened] = useState(false);
  const logoUrl = images?.logo_url;
  const phone = contact?.phone_number
    ? [contact.phone_country_code, contact.phone_number].filter(Boolean).join(' ')
    : '';
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

  function submitContact(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const body = [
      `Name: ${fields.get('name')}`,
      `Phone: ${fields.get('phone')}`,
      `Email: ${fields.get('email')}`,
      '',
      fields.get('message'),
    ].join('\n');
    window.location.href = `mailto:${supportEmail}?subject=Category%20enquiry&body=${encodeURIComponent(body)}`;
    setEmailOpened(true);
  }

  return (
    <div className="category-external">
      <header className="category-external-brand">
        {logoUrl && <img src={logoUrl} alt="Lufera Infotech" className="category-external-logo" />}
        <address className="category-external-contacts">
          {phone && <a href={phoneHref}><i className="ri-phone-fill" aria-hidden="true" /> {phone}</a>}
          <a href={`mailto:${supportEmail}`}><i className="ri-mail-line" aria-hidden="true" /> {supportEmail}</a>
        </address>
      </header>
      <main>
        <CategoryDetails external>
          <section className="category-detail-panel category-external-help">
            <h2>Need Help?</h2>
            <button type="button" aria-haspopup="dialog" onClick={() => {
              setEmailOpened(false);
              setShowContact(true);
            }}>Contact Us</button>
          </section>
        </CategoryDetails>
      </main>
      <footer className="category-external-footer">
        <p>© {new Date().getFullYear()} Lufera Infotech. All Rights Reserved.</p>
        <nav aria-label="Footer">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-condition">Terms and Conditions</Link>
          <span>Made by <a href={companyWebsite}>Lufera Infotech</a></span>
        </nav>
      </footer>
      <Modal
        show={showContact}
        onHide={() => setShowContact(false)}
        centered
        scrollable
        dialogClassName="category-contact-dialog"
        aria-labelledby="category-contact-title"
      >
        <Modal.Body className="category-contact-body">
          <div className="category-contact-info">
            <section>
              <h3>Call Us</h3>
              {phone ? <a href={phoneHref}>{phone}</a> : <p>Phone unavailable</p>}
            </section>
            <section>
              <h3>Location</h3>
              <p>{contact?.address || 'Location unavailable'}</p>
            </section>
            <section>
              <h3>Business Hours</h3>
              <p>Mon - Fri: 10am - 6pm</p>
            </section>
          </div>
          <div className="category-contact-form-panel">
            <div className="category-contact-header">
              <h2 id="category-contact-title">Contact Us</h2>
              <button type="button" className="category-contact-close" aria-label="Close" onClick={() => setShowContact(false)}>×</button>
            </div>
            <form className="category-contact-form" onSubmit={submitContact}>
              <input name="name" type="text" aria-label="Name" placeholder="Enter your name" autoComplete="name" maxLength={120} required />
              <input name="phone" type="tel" aria-label="Phone number" placeholder="Enter your phone number" autoComplete="tel" maxLength={32} required />
              <input name="email" type="email" aria-label="Email address" placeholder="Enter your email address" autoComplete="email" maxLength={254} required />
              <textarea name="message" aria-label="Message" placeholder="Enter your message" rows={5} maxLength={2000} required />
              <button type="submit" className="category-contact-submit">Submit</button>
              {emailOpened && <p role="status">Send the draft from your email app.</p>}
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
