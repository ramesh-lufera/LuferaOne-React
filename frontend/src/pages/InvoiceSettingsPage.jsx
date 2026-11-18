import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import InvoiceSettingsLayer from '../components/InvoiceSettingsLayer';

export default function InvoiceSettingsPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Invoice Settings" />
      <InvoiceSettingsLayer />
    </MasterLayout>
  );
}
