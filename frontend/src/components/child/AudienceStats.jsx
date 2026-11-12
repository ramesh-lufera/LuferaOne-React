import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const AudienceStats = () => {
    let { AudienceStatsSeries, AudienceStatsOptions } = useReactApexChart();
    return (
        <div className="col-xxl-8 col-lg-7">
            <div className="bg-base radius-12 py-20 px-24 shadow-9 h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                    <h6 className="mb-0 fw-bold text-lg">Audience Stats</h6>
                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Today</option>
                    </select>
                </div>
                <ul className="d-flex flex-wrap align-items-center justify-content-center mt-18 gap-3">
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-10-px h-6-px rounded-pill bg-primary-600" />
                        <span className="text-secondary-light text-sm fw-medium d-inline-flex align-items-center gap-1">
                            Total Audience:
                            <span className="text-primary-light text-xl fw-bold">26,201</span>
                        </span>
                    </li>
                </ul>
                <div className="mt-24">
                    <div id="paymentStatusChart">
                        <ReactApexChart
                            options={AudienceStatsOptions}
                            series={AudienceStatsSeries}
                            type="bar"
                            height={300}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AudienceStats;