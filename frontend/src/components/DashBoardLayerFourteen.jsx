import AudienceStats from "./child/AudienceStats";
import CountryStatusThree from "./child/CountryStatusThree";
import EarningsOverview from "./child/EarningsOverview";
import RecentlyPlayed from "./child/RecentlyPlayed";
import RecentPurchasePlan from "./child/RecentPurchasePlan";
import TopCategories from "./child/TopCategories";
import TopPodcaster from "./child/TopPodcaster";
import TrendingEpisodes from "./child/TrendingEpisodes";
import UsersInfo from "./child/UsersInfo";


const DashBoardLayerFourteen = () => {
    return (
        <>
            <div className="row gy-4">
                {/* UsersInfo */}
                <UsersInfo />

                {/* AudienceStats */}
                <AudienceStats />

                {/* EarningsOverview */}
                <EarningsOverview />

                {/* RecentlyPlayed */}
                <RecentlyPlayed />

                {/* RecentPurchasePlan */}
                <RecentPurchasePlan />

                {/* CountryStatusThree */}
                <CountryStatusThree />

                {/* TrendingEpisodes */}
                <TrendingEpisodes />

                {/* TopCategories */}
                <TopCategories />

                {/* TopPodcaster */}
                <TopPodcaster />
            </div>
        </>
    );
};

export default DashBoardLayerFourteen;