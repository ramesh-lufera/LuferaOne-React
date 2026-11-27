/* eslint-disable react/prop-types */
import ExternalPageLayout from '../categories/external/ExternalPageLayout';
import './ExternalCatalogDetails.css';

export default function ExternalCatalogDetails({ item, kind }) {
  const subject = `${kind} enquiry: ${item.name}`;
  return <ExternalPageLayout enquirySubject={subject}>
    <article className="category-detail catalog-external-detail">
      <header className="category-external-hero">
        <img src={item.breadcrumb_image_url} alt="" />
        <h1>{item.name}</h1>
      </header>
      <section className="category-detail-panel category-detail-description-panel">
        <h2>Description</h2>
        <p className="category-detail-description">{item.description}</p>
      </section>
      <section className="category-detail-panel category-detail-features-panel">
        <h2>Features</h2>
        <div className="category-detail-features">
          {[['Inclusions', '✓', item.inclusions], ['Exclusions', '×', item.exclusions]].map(([label, mark, items]) => <ul key={label} aria-label={label}>
            {items.map((text, index) => <li key={index}><span className="category-detail-feature-mark" aria-hidden="true">{mark}</span><span>{text}</span></li>)}
          </ul>)}
        </div>
      </section>
    </article>
  </ExternalPageLayout>;
}
