import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const UserTraffic = () => {
    let { UserTrafficSeries,
        UserTrafficOptions } = useReactApexChart();
    return (
        <div className="col-xxl-8">
            <div className="card h-100 rounded-4 overflow-hidden border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">User Traffic</h6>
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-24">
                    <ul className="d-flex flex-wrap align-items-center justify-content-center gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-purple" />
                            <span className="text-secondary-light text-sm fw-semibold line-height-1">
                                Total Users:
                                <span className="text-primary-light fw-bold text-xl ms-1">
                                    10.5k
                                </span>
                            </span>
                        </li>
                    </ul>
                    <div id="chart-timeline" >
                        <ReactApexChart
                            options={UserTrafficOptions}
                            series={UserTrafficSeries}
                            type="area"
                            height={350}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default UserTraffic;