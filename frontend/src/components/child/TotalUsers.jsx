import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TotalUsers = () => {
    let { totalUsersChartSeries, totalUsersChartOptions, totalOrderChartSeries, totalOrderChartOptions, upDownBarchartSeries,
        upDownBarchartOptions, orderValueSeries, orderValueOptions } = useReactApexChart();
    return (
        <div className="col-xxl-6">
            <div className="card h-100 rounded-4 overflow-hidden">
                <div className="card-body p-20">
                    <div className="row g-3">
                        <div className="col-sm-6">
                            <div className="px-16 py-12 rounded-3 border border-neutral-200 sass-card-gradient-bg-1">
                                <div className="d-flex align-items-center gap-12">
                                    <span className="bg-primary w-48-px h-48-px text-xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                        <i className="ri-user-add-fill" />
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-semibold mb-0">750</h6>
                                            <span className="bg-success-100 text-success-600 fw-semibold border border-success-300 rounded-pill px-4 text-sm">
                                                +200
                                            </span>
                                        </div>
                                        <span className="text-secondary-light mt-1">Total Users</span>
                                    </div>
                                </div>
                                <div className="mt-16">
                                    <div id="total-users-chart" >
                                        <ReactApexChart
                                            options={totalUsersChartOptions}
                                            series={totalUsersChartSeries}
                                            type="area"
                                            height={64}
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="px-16 py-12 rounded-3 border border-neutral-200 sass-card-gradient-bg-2">
                                <div className="d-flex align-items-center gap-12">
                                    <span className="bg-yellow w-48-px h-48-px text-xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                        <i className="ri-discount-percent-line" />
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-semibold mb-0">240</h6>
                                            <span className="bg-danger-100 text-danger-600 fw-semibold border border-danger-300 rounded-pill px-4 text-sm">
                                                -200
                                            </span>
                                        </div>
                                        <span className="text-secondary-light mt-1">Total Orders</span>
                                    </div>
                                </div>
                                <div className="mt-16">
                                    <div id="total-order-chart" >
                                        <ReactApexChart
                                            options={totalOrderChartOptions}
                                            series={totalOrderChartSeries}
                                            type="area"
                                            height={64}
                                            width="100%"
                                        /> </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="px-16 py-12 rounded-3 border border-neutral-200 sass-card-gradient-bg-3">
                                <div className="d-flex align-items-center gap-12">
                                    <span className="bg-purple w-48-px h-48-px text-xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                        <i className="ri-question-answer-line" />
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-semibold mb-0">47.5%</h6>
                                            <span className="bg-success-100 text-success-600 fw-semibold border border-success-300 rounded-pill px-4 text-sm">
                                                +3.6%
                                            </span>
                                        </div>
                                        <span className="text-secondary-light mt-1">
                                            Conversion Rate
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-16">
                                    <div id="upDownBarchart" >
                                        <ReactApexChart
                                            options={upDownBarchartOptions}
                                            series={upDownBarchartSeries}
                                            type="bar"
                                            height={64}
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="px-16 py-12 rounded-3 border border-neutral-200 sass-card-gradient-bg-4">
                                <div className="d-flex align-items-center gap-12">
                                    <span className="bg-success-500 w-48-px h-48-px text-xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                        <i className="ri-user-add-fill" />
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-semibold mb-0">$2.7M</h6>
                                            <span className="bg-success-100 text-success-600 fw-semibold border border-success-300 rounded-pill px-4 text-sm">
                                                +3.6%
                                            </span>
                                        </div>
                                        <span className="text-secondary-light mt-1">Order Value</span>
                                    </div>
                                </div>
                                <div className="mt-16 pb-20">
                                    <div id="orderValue" className="margin-16-minus" >
                                        <ReactApexChart
                                            options={orderValueOptions}
                                            series={orderValueSeries}
                                            type="bar"
                                            height={74}
                                            width="100%"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TotalUsers;