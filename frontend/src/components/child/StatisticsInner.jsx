import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const StatisticsInner = () => {
    let {
        StatisticsInnerSeries,
        StatisticsInnerOptions
    } = useReactApexChart();
    return (
        <div className="col-lg-5">
            <div className="card h-100 rounded-4 overflow-hidden border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Statistics</h6>
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>This Month</option>
                            <option>This Week</option>
                            <option>This Year</option>
                        </select>
                    </div>
                </div>
                <div className="card-body d-flex align-items-center flex-sm-nowrap flex-wrap py-40">
                    <div className="position-relative text-center">
                        <div
                            id="userOverviewDonutChart"
                            className="apexcharts-tooltip-z-none"
                        >
                            <ReactApexChart options={StatisticsInnerOptions} series={StatisticsInnerSeries} type="donut" height={240} />
                        </div>
                        <div className="text-center position-absolute top-50 start-50 translate-middle">
                            <h6 className="mb-0 mt-1">$,4578</h6>
                        </div>
                    </div>
                    <div className="d-grid grid-cols-2 gap-24">
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-10-px h-16-px bg-primary-600 rounded-pill position-relative"></span>
                            <div className="">
                                <p className="text-secondary-light text-sm mb-0">Online Sale</p>
                                <h6 className="mb-0 text-lg">$3,425</h6>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-10-px h-16-px bg-warning-600 rounded-pill position-relative"></span>
                            <div className="">
                                <p className="text-secondary-light text-sm mb-0">Offline Sale </p>
                                <h6 className="mb-0 text-lg">$3,120</h6>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-10-px h-16-px bg-success rounded-pill position-relative"></span>
                            <div className="">
                                <p className="text-secondary-light text-sm mb-0">Agent Sale</p>
                                <h6 className="mb-0 text-lg">$2,472</h6>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-10-px h-16-px bg-purple rounded-pill position-relative"></span>
                            <div className="">
                                <p className="text-secondary-light text-sm mb-0">Marketing Sale</p>
                                <h6 className="mb-0 text-lg">$5,120</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default StatisticsInner;