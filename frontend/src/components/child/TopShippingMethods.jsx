import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TopShippingMethods = () => {
    let {
        TopShippingMethodsSeries,
        TopShippingMethodsOptions
    } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-lg-6">
            <div className="shadow-7 p-0 radius-12 bg-base overflow-hidden h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-16 px-20 border-bottom border-neutral-200">
                    <h6 className="mb-0 fw-semibold text-lg">Top Shipping Methods</h6>
                </div>
                <div className="card-body p-20 d-flex align-items-center flex-wrap">
                    <div
                        id="multipleSeriesChart"
                        className="apexcharts-tooltip-z-none square-marker check-marker series-gap-24 d-flex justify-content-center"
                    >
                        <ReactApexChart
                            options={TopShippingMethodsOptions}
                            series={TopShippingMethodsSeries}
                            type="polarArea"
                            height={250}
                        />
                    </div>
                    <div className="d-flex flex-column gap-8 justify-content-center">
                        <div className="d-flex align-items-center gap-8">
                            <span className="flex-shrink-0 w-8-px h-8-px radius-2 bg-success-600" />
                            <span className="text-secondary-light fw-normal text-md">
                                Air:
                                <span className="fw-semibold text-primary-light">22%</span>
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="flex-shrink-0 w-8-px h-8-px radius-2 bg-purple" />
                            <span className="text-secondary-light fw-normal text-md">
                                Road:
                                <span className="fw-semibold text-primary-light">10%</span>
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="flex-shrink-0 w-8-px h-8-px radius-2 bg-warning-600" />
                            <span className="text-secondary-light fw-normal text-md">
                                Sea:
                                <span className="fw-semibold text-primary-light">35%</span>
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="flex-shrink-0 w-8-px h-8-px radius-2 bg-danger-600" />
                            <span className="text-secondary-light fw-normal text-md">
                                Rail:
                                <span className="fw-semibold text-primary-light">28%</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TopShippingMethods;