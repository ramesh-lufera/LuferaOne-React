import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerSeventeen from "../components/DashBoardLayerSeventeen";

const HomePageSeventeen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='SaaS' />

        {/* DashBoardLayerSeventeen */}
        <DashBoardLayerSeventeen />
      </MasterLayout>
    </>
  );
};

export default HomePageSeventeen;
