import CountryStatusFour from "./child/CountryStatusFour";
import DailyEarnings from "./child/DailyEarnings";
import RecentActivity from "./child/RecentActivity";
import TotalUsers from "./child/TotalUsers";
import TransactionHistory from "./child/TransactionHistory";
import UpgradeYourPlanTwo from "./child/UpgradeYourPlanTwo";
import UserTraffic from "./child/UserTraffic";




const DashBoardLayerSeventeen = () => {
    return (
        <>
            <div className="row gy-4">
                {/* TotalUsers */}
                <TotalUsers />

                {/* DailyEarnings */}
                <DailyEarnings />

                {/* UserTraffic */}
                <UserTraffic />

                {/* TransactionHistory */}
                <TransactionHistory />

                {/* RecentActivity */}
                <RecentActivity />

                {/* UpgradeYourPlanTwo */}
                <UpgradeYourPlanTwo />

                {/* CountryStatusFour */}
                <CountryStatusFour />


            </div>

        </>
    );
};

export default DashBoardLayerSeventeen;