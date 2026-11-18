import { Link, useSearchParams } from 'react-router-dom';
import InvoiceFormLayer from './InvoiceFormLayer';
export default function InvoiceEditLayer() {
  const [params] = useSearchParams();
  const id = params.get('id');
  if (!/^[1-9][0-9]*$/.test(id || ''))
    return (
      <div className="alert alert-danger" role="alert">
        Select an invoice from the <Link to="/invoice-list">Invoice List</Link>.
      </div>
    );
  return <InvoiceFormLayer key={id} invoiceId={id} />;
}
