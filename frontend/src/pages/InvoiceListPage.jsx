import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import InvoiceListLayer from '../components/InvoiceListLayer';

export default function InvoiceListPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Invoice List" />
      <InvoiceListLayer />
    </MasterLayout>
  );
}
