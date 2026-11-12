import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const OverallCallsVolume = () => {
    let { OverallCallsVolumeSeries,
        OverallCallsVolumeOptions } = useReactApexChart();
    return (
        <div className="col-xxl-8">
            <div className="card h-100 radius-8 border-0">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Overall Calls Volume</h6>
                    <div className="">
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-24">
                    <ul className="d-flex flex-wrap align-items-center justify-content-center my-3 gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-primary-600" />
                            <span className="text-secondary-light text-sm">
                                Incoming Calls
                                <span className="text-primary-light text-xl fw-bold line-height-1 ms-4">
                                    15.5k
                                </span>
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                            <span className="text-secondary-light text-sm">
                                Answered Calls
                                <span className="text-primary-light text-xl fw-bold line-height-1 ms-4">
                                    20.5k
                                </span>
                            </span>
                        </li>
                    </ul>
                    <div id="averageEarningChart" className="apexcharts-tooltip-style-1" >
                        <ReactApexChart
                            options={OverallCallsVolumeOptions}
                            series={OverallCallsVolumeSeries}
                            type="area"
                            height={270}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default OverallCallsVolume;