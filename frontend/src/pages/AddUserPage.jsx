import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import AddUserLayer from '../components/AddUserLayer';

export default function AddUserPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Add User" />
      <AddUserLayer />
    </MasterLayout>
  );
}
