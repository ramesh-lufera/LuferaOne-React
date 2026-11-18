import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import InvoiceEditLayer from '../components/InvoiceEditLayer';

export default function InvoiceEditPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Edit Invoice" />
      <InvoiceEditLayer />
    </MasterLayout>
  );
}
