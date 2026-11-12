import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerThirteen from "../components/DashBoardLayerThirteen";

const HomePageThirteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Help Desk' />

        {/* DashBoardLayerThirteen */}
        <DashBoardLayerThirteen />
      </MasterLayout>
    </>
  );
};

export default HomePageThirteen;
