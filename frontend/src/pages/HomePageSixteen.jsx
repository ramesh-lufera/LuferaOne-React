import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerSixteen from "../components/DashBoardLayerSixteen";

const HomePageSixteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Call Center' />

        {/* DashBoardLayerSixteen */}
        <DashBoardLayerSixteen />
      </MasterLayout>
    </>
  );
};

export default HomePageSixteen;
