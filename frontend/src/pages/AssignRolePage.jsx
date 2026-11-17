import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import AssignRoleLayer from '../components/AssignRoleLayer';

export default function AssignRolePage() {
  return (
    <MasterLayout>
      <ModulePageHeader title="Assign Role" />
      <AssignRoleLayer />
    </MasterLayout>
  );
}
