import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";
import { Icon } from "@iconify/react/dist/iconify.js";

const UpgradeYourPlanTwo = () => {
    let { UpgradeYourPlanTwoSeries, UpgradeYourPlanTwoOptions } = useReactApexChart();
    return (
        <div className="col-xxl-6">
            <div className="row gy-4 h-100">
                <div className="col-md-4">
                    <div className="trail-bg h-100 text-center d-flex flex-column justify-content-between align-items-center p-16 radius-8">
                        <h6 className="text-white text-xl">Upgrade Your Plan</h6>
                        <div className="">
                            <p className="text-white">Your free trial expired in 7 days</p>
                            <a
                                href="#"
                                className="btn py-8 rounded-pill w-100 bg-gradient-blue-warning text-sm"
                            >
                                Upgrade Now
                            </a>
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card h-100 rounded-4 overflow-hidden border-0">
                        <div className="card-header">
                            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                                <h6 className="mb-2 fw-bold text-lg mb-0">Statistics</h6>
                                <a
                                    href="#"
                                    className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                                >
                                    View All
                                    <Icon
                                        icon="solar:alt-arrow-right-linear"
                                        className="icon"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="card-body d-flex align-items-center gap-20 flex-sm-nowrap flex-wrap">
                            <div className="d-flex flex-column gap-12">
                                <div className="d-flex align-items-center gap-12">
                                    <div className="">
                                        <span className="w-20-px h-20-px bg-primary-600 rounded-circle position-relative">
                                            <span className="w-10-px h-10-px bg-primary-100 rounded-circle position-absolute top-50 start-50 translate-middle" />
                                        </span>
                                    </div>
                                    <div className="">
                                        <h6 className="mb-0">172</h6>
                                        <p className="text-secondary-light text-sm">Total Visitors</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-12">
                                    <div className="">
                                        <span className="w-20-px h-20-px bg-warning-600 rounded-circle position-relative">
                                            <span className="w-10-px h-10-px bg-warning-100 rounded-circle position-absolute top-50 start-50 translate-middle" />
                                        </span>
                                    </div>
                                    <div className="">
                                        <h6 className="mb-0">300</h6>
                                        <p className="text-secondary-light text-sm">
                                            Total Page Views{" "}
                                        </p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-12">
                                    <div className="">
                                        <span className="w-20-px h-20-px bg-success rounded-circle position-relative">
                                            <span className="w-10-px h-10-px bg-green-light rounded-circle position-absolute top-50 start-50 translate-middle" />
                                        </span>
                                    </div>
                                    <div className="">
                                        <h6 className="mb-0">200</h6>
                                        <p className="text-secondary-light text-sm">Registrations</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-12">
                                    <div className="">
                                        <span className="w-20-px h-20-px bg-purple rounded-circle position-relative">
                                            <span className="w-10-px h-10-px bg-purple-30 rounded-circle position-absolute top-50 start-50 translate-middle" />
                                        </span>
                                    </div>
                                    <div className="">
                                        <h6 className="mb-0">500</h6>
                                        <p className="text-secondary-light text-sm">Registrations</p>
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div
                                    id="userOverviewDonutChart"
                                    className="apexcharts-tooltip-z-none"
                                >
                                    <ReactApexChart options={UpgradeYourPlanTwoOptions} series={UpgradeYourPlanTwoSeries} type="donut" height={270} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default UpgradeYourPlanTwo;