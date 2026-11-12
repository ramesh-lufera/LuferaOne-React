import ReactApexChart from "react-apexcharts";

import useReactApexChart from "../../hook/useReactApexChart";

const AgentAvgEarnings = () => {
    let { AgentAvgEarningsSeries,
        AgentAvgEarningsOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4">
            <div className="card h-100 radius-8 border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Agent Avg. Earnings</h6>
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-24">
                    <div className="d-inline-flex align-items-center gap-12">
                        <span className="bg-success-100 w-48-px h-48-px text-xxl rounded-circle d-flex justify-content-center align-items-center text-secondary-light">
                            <img
                                src="assets/images/home-sixteen/icon/dollar-bag.png"
                                alt="Icon"
                            />
                        </span>
                        <div>
                            <h6 className="fw-semibold mb-0">$50,000</h6>
                            <span className="text-secondary-light mt-1">Total Earning</span>
                        </div>
                    </div>
                    <div id="barChart" className="barChart" >
                        <ReactApexChart
                            options={AgentAvgEarningsOptions}
                            series={AgentAvgEarningsSeries}
                            type="bar"
                            height={310}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AgentAvgEarnings;