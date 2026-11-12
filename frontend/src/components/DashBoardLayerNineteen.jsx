import EarningsOverviewOne from "./child/EarningsOverviewOne";
import ExploreInner from "./child/ExploreInner";
import PropertyList from "./child/PropertyList";
import RecentSale from "./child/RecentSale";
import ResentRent from "./child/ResentRent";
import SocialSource from "./child/SocialSource";
import StatisticsInner from "./child/StatisticsInner";
import TotalPropertyOne from "./child/TotalPropertyOne";
import TotalRevenue from "./child/TotalRevenue";
import TransactionHistoryTwo from "./child/TransactionHistoryTwo";



const DashBoardLayerNineteen = () => {
    return (
        <>

            <div className="row gy-4 mt-4">
                {/* ExploreInner */}
                <ExploreInner />

                {/* TotalPropertyOne */}
                <TotalPropertyOne />

                {/* StatisticsInner */}
                <StatisticsInner />

                {/* TotalRevenue */}
                <TotalRevenue />

                {/* SocialSource */}
                <SocialSource />

                {/* ResentRent */}
                <ResentRent />

                {/* RecentSale */}
                <RecentSale />

                {/* TransactionHistoryTwo */}
                <TransactionHistoryTwo />

                {/* EarningsOverviewOne */}
                <EarningsOverviewOne />

                {/* PropertyList */}
                <PropertyList />
            </div>
        </>
    );
};

export default DashBoardLayerNineteen;