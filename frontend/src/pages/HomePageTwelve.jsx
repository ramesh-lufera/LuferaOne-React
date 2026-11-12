import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import DashBoardLayerTwelve from "../components/DashBoardLayerTwelve";

const HomePageTwelve = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Booking System' />

        {/* DashBoardLayerTwelve */}
        <DashBoardLayerTwelve />
      </MasterLayout>
    </>
  );
};

export default HomePageTwelve;
