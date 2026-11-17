import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import RoleAccessLayer from '../components/RoleAccessLayer';

export default function RoleAccessPage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Roles & Permissions" />
      <RoleAccessLayer />
    </MasterLayout>
  );
}
