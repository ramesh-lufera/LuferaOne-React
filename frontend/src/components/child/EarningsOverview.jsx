import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const EarningsOverview = () => {
    let { EarningsOverviewSeries,
        EarningsOverviewOptions } = useReactApexChart();
    return (
        <div className="col-lg-4">
            <div className="bg-base radius-12 py-20 px-24 shadow-9 h-100 mb-20">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                    <h6 className="mb-0 fw-bold text-lg">Earnings Overview</h6>
                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Today</option>
                    </select>
                </div>
                <ul className="d-flex flex-wrap align-items-center justify-content-center mt-24 gap-3">
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-8-px h-8-px rounded-circle bg-primary-600" />
                        <span className="text-secondary-light text-sm fw-medium d-inline-flex align-items-center gap-1">
                            Income:
                            <span className="text-primary-light text-xl fw-bold">$26,201</span>
                        </span>
                        <div className="d-flex align-items-center gap-1 fw-semibold text-success-600">
                            <span className="">10%</span>
                            <i className="ri-arrow-up-s-fill" />
                        </div>
                    </li>
                </ul>
                <div className="mt-24">
                    <div id="revenueChart" className="apexcharts-tooltip-style-1" >
                        <ReactApexChart
                            options={EarningsOverviewOptions}
                            series={EarningsOverviewSeries}
                            type="area"
                            height={200}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default EarningsOverview;