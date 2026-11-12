import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const SalesFigure = () => {
    let { SalesFigureSeries,
        SalesFigureOptions } = useReactApexChart();
    return (
        <div className="col-xxl-8">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg">Sales Figure</h6>
                        <div className="">
                            <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                    </div>
                    <ul className="d-flex flex-wrap align-items-center justify-content-center my-3 gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                            <span className="text-secondary-light text-sm">
                                Answered Calls
                                <span className="text-primary-light text-xl fw-bold line-height-1 ms-4">
                                    $15.5k
                                </span>
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-success-600" />
                            <span className="text-secondary-light text-sm">
                                Sales
                                <span className="text-primary-light text-xl fw-bold line-height-1 ms-4">
                                    $20.5k
                                </span>
                            </span>
                        </li>
                    </ul>
                    <div id="averageEarningChart" className="apexcharts-tooltip-style-1" >
                        <ReactApexChart
                            options={SalesFigureOptions}
                            series={SalesFigureSeries}
                            type="area"
                            height={340}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SalesFigure;