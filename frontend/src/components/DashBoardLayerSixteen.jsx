import AgentAvgEarnings from "./child/AgentAvgEarnings";
import BestAgents from "./child/BestAgents";
import CallCenterInit from "./child/CallCenterInit";
import OverallCallsVolume from "./child/OverallCallsVolume";
import ReasonForCalls from "./child/ReasonForCalls";
import RecentCalls from "./child/RecentCalls";
import SalesByCountriesOne from "./child/SalesByCountriesOne";




const DashBoardLayerSixteen = () => {
    return (
        <>

            {/* CallCenterInit */}
            <CallCenterInit />

            <div className="mt-24">
                <div className="row gy-4">

                    {/* AgentAvgEarnings */}
                    <AgentAvgEarnings />

                    {/* OverallCallsVolume */}
                    <OverallCallsVolume />

                    {/* SalesByCountriesOne */}
                    <SalesByCountriesOne />

                    {/* BestAgents */}
                    <BestAgents />

                    {/* RecentCalls */}
                    <RecentCalls />

                    {/* ReasonForCalls */}
                    <ReasonForCalls />

                </div>
            </div>

        </>
    );
};

export default DashBoardLayerSixteen;