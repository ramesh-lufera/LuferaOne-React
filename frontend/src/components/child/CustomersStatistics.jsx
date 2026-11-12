import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const CustomersStatistics = () => {
    let { CustomersStatisticsSeries, CustomersStatisticsOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-lg-6">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-20">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Customers Statistics</h6>
                        <div className="">
                            <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                                <option>Yearly</option>
                                <option>Monthly</option>
                                <option>Weekly</option>
                                <option>Today</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 position-relative">
                        <div
                            id="donutChart"
                            className="flex-grow-1 apexcharts-tooltip-z-none title-style circle-none min-h-236-px"
                        >
                            <ReactApexChart options={CustomersStatisticsOptions} series={CustomersStatisticsSeries} type="donut" height={270} />
                        </div>
                        <h6 className="position-absolute bottom-0 start-50 translate-middle-x mb-40">
                            40.5k
                        </h6>
                    </div>
                    <ul className="d-flex flex-wrap align-items-center justify-content-center mt-56 gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-8-px h-8-px bg-primary-600" />
                            <span className="text-secondary-light text-sm fw-semibold">
                                Male:
                                <span className="text-primary-light fw-bold">20,000</span>
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-8-px h-8-px bg-warning-600" />
                            <span className="text-secondary-light text-sm fw-semibold">
                                Female:
                                <span className="text-primary-light fw-bold"> 25,000</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    );
};

export default CustomersStatistics;