import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerEighteen from "../components/DashBoardLayerEighteen";

const HomePageEighteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Sales' />

        {/* DashBoardLayerEighteen */}
        <DashBoardLayerEighteen />
      </MasterLayout>
    </>
  );
};

export default HomePageEighteen;
