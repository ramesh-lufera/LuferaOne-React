import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ActivityLogLayer from '../components/ActivityLogLayer';

export default function ActivityLogPage() {
  return <MasterLayout>
    <Breadcrumb title='Activity Log' />
    <ActivityLogLayer />
  </MasterLayout>;
}
