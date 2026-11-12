import ReactApexChart from "react-apexcharts";
import { Icon } from "@iconify/react/dist/iconify.js";
import useReactApexChart from "../../hook/useReactApexChart";

const TotalShipments = () => {
    let { salesFigureChartSeries,
        salesFigureChartOptions } = useReactApexChart();
    return (
        <div className="col-xxxl-9">
            <div className="row g-3">
                <div className="col-lg-3 col-sm-6">
                    <div className="card shadow-none border radius-12 bg-gradient-start-1 h-100">
                        <div className="card-body p-16">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-8">
                                <div>
                                    <p className="fw-medium text-secondary-light mb-1 text-sm">
                                        Total Shipments
                                    </p>
                                    <h6 className="mb-0">5,750</h6>
                                </div>
                                <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">

                                    <Icon icon='gridicons:multiple-users' className="text-white text-2xl mb-0" />
                                </div>
                            </div>
                            <p className="fw-medium text-sm text-secondary-light mt-12 mb-0 d-flex align-items-center gap-2">
                                <span className="d-inline-flex align-items-center gap-1 border border-success-600 px-8 rounded-pill text-success-main">
                                    <Icon icon="bxs:up-arrow" className="text-xs" />

                                    1.8%
                                </span>
                                vs Last month
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6">
                    <div className="card shadow-none border radius-12 bg-gradient-start-2 h-100">
                        <div className="card-body p-16">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-8">
                                <div>
                                    <p className="fw-medium text-secondary-light mb-1 text-sm">
                                        Total Order
                                    </p>
                                    <h6 className="mb-0">17,300</h6>
                                </div>
                                <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                                    <Icon
                                        icon="fa-solid:award"
                                        className="text-white text-2xl mb-0"
                                    />
                                </div>
                            </div>
                            <p className="fw-medium text-sm text-secondary-light mt-12 mb-0 d-flex align-items-center gap-2">
                                <span className="d-inline-flex align-items-center gap-1 border border-success-600 px-8 rounded-pill text-success-main">
                                    <Icon icon="bxs:up-arrow" className="text-xs" /> 1.8%
                                </span>
                                vs Last month
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6">
                    <div className="card shadow-none border radius-12 bg-gradient-start-3 h-100">
                        <div className="card-body p-16">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-8">
                                <div>
                                    <p className="fw-medium text-secondary-light mb-1 text-sm">
                                        Revenue
                                    </p>
                                    <h6 className="mb-0">$50,375</h6>
                                </div>
                                <div className="w-50-px h-50-px bg-primary-600 rounded-circle d-flex justify-content-center align-items-center">
                                    <Icon
                                        icon="fluent:people-20-filled"
                                        className="text-white text-2xl mb-0"
                                    />
                                </div>
                            </div>
                            <p className="fw-medium text-sm text-secondary-light mt-12 mb-0 d-flex align-items-center gap-2">
                                <span className="d-inline-flex align-items-center gap-1 border border-danger-600 px-8 rounded-pill text-danger-main">
                                    <Icon icon="bxs:down-arrow" className="text-xs" /> 1.8%
                                </span>
                                vs Last month
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-sm-6">
                    <div className="card shadow-none border radius-12 bg-gradient-start-4 h-100">
                        <div className="card-body p-16">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-8">
                                <div>
                                    <p className="fw-medium text-secondary-light mb-1 text-sm">
                                        Delivered
                                    </p>
                                    <h6 className="mb-0">725</h6>
                                </div>
                                <div className="w-50-px h-50-px bg-success-main rounded-circle d-flex justify-content-center align-items-center">
                                    <Icon
                                        icon="solar:wallet-bold"
                                        className="text-white text-2xl mb-0"
                                    />
                                </div>
                            </div>
                            <p className="fw-medium text-sm text-secondary-light mt-12 mb-0 d-flex align-items-center gap-2">
                                <span className="d-inline-flex align-items-center gap-1 border border-success-600 px-8 rounded-pill text-success-main">
                                    <Icon icon="bxs:up-arrow" className="text-xs" /> 1.8%
                                </span>
                                vs Last month
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card rounded-4 overflow-hidden border-0 mt-24">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Sales Figure</h6>
                    </div>
                </div>
                <div className="card-body p-24">
                    <ul className="d-flex flex-wrap align-items-center justify-content-center gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                            <span className="text-secondary-light text-sm fw-semibold line-height-1">
                                Car Box
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-primary-600" />
                            <span className="text-secondary-light text-sm fw-semibold line-height-1">
                                Truck Cargo
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-info" />
                            <span className="text-secondary-light text-sm fw-semibold line-height-1">
                                Ship Cargo
                            </span>
                        </li>
                    </ul>
                    <div id="salesFigureChart" className="barChart" >
                        <ReactApexChart
                            options={salesFigureChartOptions}
                            series={salesFigureChartSeries}
                            type="bar"
                            height={350}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TotalShipments;