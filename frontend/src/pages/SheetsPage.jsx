import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import SheetsLayer from '../components/SheetsLayer';

export default function SheetsPage() {
  return <MasterLayout><ModulePageHeader title="Saved Sheets" /><SheetsLayer /></MasterLayout>;
}
