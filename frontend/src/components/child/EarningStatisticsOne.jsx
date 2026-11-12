import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";
const EarningStatisticsOne = () => {
    let { EarningStatisticsOneSeries, EarningStatisticsOneOptions } = useReactApexChart();
    return (
        <div className="card h-100">
            <div className="card-header pb-0 border-0">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                    <h6 className="mb-2 fw-bold text-lg mb-0">Earning Statistic</h6>
                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Today</option>
                    </select>
                </div>
            </div>
            <div className="card-body p-24">
                <ul className="d-flex flex-wrap align-items-center justify-content-center mb-3 gap-3">
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-8-px rounded-pill bg-primary-600" />
                        <span className="text-secondary-light text-sm fw-semibold">
                            Income
                            <span className="text-primary-light fw-bold text-xl ms-1">
                                $26,201
                            </span>
                        </span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                        <span className="text-secondary-light text-sm fw-semibold">
                            Expense
                            <span className="text-primary-light fw-bold text-xl ms-1">
                                {" "}
                                $3,120
                            </span>
                        </span>
                    </li>
                </ul>
                <div id="enrollmentChart" className="apexcharts-tooltip-style-1" >
                    <ReactApexChart
                        options={EarningStatisticsOneOptions}
                        series={EarningStatisticsOneSeries}
                        type="area"
                        height={200}
                        width="100%"
                    />
                </div>
            </div>
        </div>

    );
};

export default EarningStatisticsOne;