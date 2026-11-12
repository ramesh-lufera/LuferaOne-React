import BookingStatisticsOne from "./child/BookingStatisticsOne";
import CheckInCheckout from "./child/CheckInCheckout";
import CountryStatusTwo from "./child/CountryStatusTwo";
import EarningStatisticsOne from "./child/EarningStatisticsOne";
import SemiCircleGauge from "./child/SemiCircleGauge";
import SpendOverview from "./child/SpendOverview";
import TransactionHistoryOne from "./child/TransactionHistoryOne";
import TravelSliderOne from "./child/TravelSliderOne";
import UnitCountNine from "./child/UnitCountNine";

const DashBoardLayerTwelve = () => {
  return (
    <>
      <div className='mb-24'>
        <div className='row gy-4'>
          {/* UnitCountNine */}
          <UnitCountNine />

          {/* SemiCircleGauge */}
          <SemiCircleGauge />

          {/* BookingStatisticsOne */}
          <BookingStatisticsOne />
        </div>
      </div>

      <div className='row g-4'>
        <div className='col-xl-8'>
          <div className='d-flex flex-column gap-24'>
            {/* TravelSliderOne */}
            <TravelSliderOne />

            {/* EarningStatisticsOne */}
            <EarningStatisticsOne />

            {/* TransactionHistoryOne */}
            <TransactionHistoryOne />
          </div>
        </div>
        <div className="col-xl-4">
          <div className="d-flex flex-column gap-24">
            {/* CountryStatusTwo */}
            <CountryStatusTwo />

            {/* CheckInCheckout */}
            <CheckInCheckout />

            {/* SpendOverview */}
            <SpendOverview />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashBoardLayerTwelve;
