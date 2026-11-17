import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import UsersListLayer from '../components/UsersListLayer';

export default function UsersListPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Users List" />
      <UsersListLayer />
    </MasterLayout>
  );
}
