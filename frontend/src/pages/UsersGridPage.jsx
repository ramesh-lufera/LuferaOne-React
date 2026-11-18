import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import UsersGridLayer from '../components/UsersGridLayer';

const UsersGridPage = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <ModulePageHeader title="Users Grid" />

        {/* UsersGridLayer */}
        <UsersGridLayer />
      </MasterLayout>
    </>
  );
};

export default UsersGridPage;
