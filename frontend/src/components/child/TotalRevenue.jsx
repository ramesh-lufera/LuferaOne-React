import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TotalRevenue = () => {
    let { TotalRevenueSeries,
        TotalRevenueOptions } = useReactApexChart();
    return (
        <div className="col-lg-7">
            <div className="card h-100 rounded-4 overflow-hidden border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Total Revenue</h6>
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>This Month</option>
                            <option>This Week</option>
                            <option>This Year</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <ul className="d-flex flex-wrap align-items-center justify-content-center gap-40">
                        <li className="d-flex align-items-center gap-1">
                            <div className="d-flex align-items-center gap-2">
                                <span className="w-8-px h-12-px rounded-pill bg-primary-600" />
                                <span className="text-secondary-light text-sm fw-semibold">
                                    Income{" "}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-8">
                                <h6 className="mb-0">$26,201</h6>
                                <span className="text-success-600 d-flex align-items-center gap-1 text-sm fw-bolder">
                                    10%
                                    <i className="ri-arrow-up-s-fill d-flex" />
                                </span>
                            </div>
                        </li>
                        <li className="d-flex align-items-center gap-1">
                            <div className="d-flex align-items-center gap-2">
                                <span className="w-8-px h-12-px rounded-pill bg-warning-600" />
                                <span className="text-secondary-light text-sm fw-semibold">
                                    Expenses{" "}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-8">
                                <h6 className="mb-0">$18,120</h6>
                                <span className="text-danger-600 d-flex align-items-center gap-1 text-sm fw-bolder">
                                    10%
                                    <i className="ri-arrow-down-s-fill d-flex" />
                                </span>
                            </div>
                        </li>
                    </ul>
                    <div className="mt-40">
                        <div id="balanceStatistics" >
                            <ReactApexChart options={TotalRevenueOptions} series={TotalRevenueSeries} type="bar" height={250} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TotalRevenue;