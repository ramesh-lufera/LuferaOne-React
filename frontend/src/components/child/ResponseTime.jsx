import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const ResponseTime = () => {
    let { ResponseTimeSeries, ResponseTimeOptions } = useReactApexChart();
    return (
        <div className="col-lg-4">
            <div className="shadow-7 p-0 radius-12 bg-base overflow-hidden">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-12 px-20 border-bottom border-neutral-200">
                    <h6 className="mb-0 fw-bold text-lg">Response Time</h6>
                    <div className="">
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-20">
                    <div className="shadow-7 p-24 radius-12 bg-base h-100">
                        <div className="text-center">
                            <div className="position-relative">
                                <div
                                    id="semiCircleGaugeTwo"
                                    className="big-semi-circle-gauge d-flex justify-content-center"
                                >
                                    <ReactApexChart
                                        options={ResponseTimeOptions}
                                        series={ResponseTimeSeries}
                                        type="radialBar"
                                        height={300}
                                        width={400}
                                    />
                                </div>
                                <span className="w-90-px h-90-px rounded-circle bg-neutral-50 d-flex justify-content-center align-items-center position-absolute start-50 translate-middle-x top-50">
                                    <img
                                        src="assets/images/homeThirteen/icon/time-icon.svg"
                                        alt="Icon"
                                    />
                                </span>
                            </div>
                            <h3 className="mt-40 mb-0">454h</h3>
                            <span className="text-neutral-800 mt-4">1 hrs : 22 mins</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ResponseTime;