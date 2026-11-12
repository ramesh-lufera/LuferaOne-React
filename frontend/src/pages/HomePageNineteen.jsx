import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerNineteen from "../components/DashBoardLayerNineteen";

const HomePageNineteen = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Real Estate' />

        {/* DashBoardLayerNineteen */}
        <DashBoardLayerNineteen />
      </MasterLayout>
    </>
  );
};

export default HomePageNineteen;
