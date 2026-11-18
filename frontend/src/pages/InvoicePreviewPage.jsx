import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import InvoicePreviewLayer from '../components/InvoicePreviewLayer';

export default function InvoicePreviewPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Invoice Details" />
      <InvoicePreviewLayer />
    </MasterLayout>
  );
}
