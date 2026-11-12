import CountryStatusSix from "./child/CountryStatusSix";
import LiveTracking from "./child/LiveTracking";
import RecentOrdersThree from "./child/RecentOrdersThree";
import ShipmentSuccess from "./child/ShipmentSuccess";
import ThisMonthOrders from "./child/ThisMonthOrders";
import TopShippingMethods from "./child/TopShippingMethods";
import TotalShipments from "./child/TotalShipments";




const DashBoardLayerTwenty = () => {
    return (
        <>
            <div className="mt-4">
                <div className="row gy-4">
                    {/* TotalShipments */}
                    <TotalShipments />

                    {/* LiveTracking */}
                    <LiveTracking />

                    {/* ShipmentSuccess */}
                    <ShipmentSuccess />

                    {/* TopShippingMethods */}
                    <TopShippingMethods />

                    {/* ThisMonthOrders */}
                    <ThisMonthOrders />

                    {/* CountryStatusSix */}
                    <CountryStatusSix />

                    {/* RecentOrdersThree */}
                    <RecentOrdersThree />

                </div>
            </div>

        </>
    );
};

export default DashBoardLayerTwenty;