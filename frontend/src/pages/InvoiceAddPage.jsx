import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import InvoiceAddLayer from '../components/InvoiceAddLayer';

export default function InvoiceAddPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Create Invoice" />
      <InvoiceAddLayer />
    </MasterLayout>
  );
}
