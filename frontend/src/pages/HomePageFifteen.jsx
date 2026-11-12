import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerFifteen from "../components/DashBoardLayerFifteen";

const HomePageFifteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Project Management' />

        {/* DashBoardLayerFifteen */}
        <DashBoardLayerFifteen />
      </MasterLayout>
    </>
  );
};

export default HomePageFifteen;
