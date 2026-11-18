import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ViewProfileLayer from '../components/ViewProfileLayer';

const ViewProfilePage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <ModulePageHeader title="View Profile" />

        {/* ViewProfileLayer */}
        <ViewProfileLayer />
      </MasterLayout>
    </>
  );
};

export default ViewProfilePage;
