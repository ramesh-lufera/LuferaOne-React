import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerFourteen from "../components/DashBoardLayerFourteen";

const HomePageFourteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Podcast' />

        {/* DashBoardLayerFourteen */}
        <DashBoardLayerFourteen />
      </MasterLayout>
    </>
  );
};

export default HomePageFourteen;
