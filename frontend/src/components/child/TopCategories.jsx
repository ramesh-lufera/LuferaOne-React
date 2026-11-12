import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";
import { Icon } from "@iconify/react/dist/iconify.js";

const TopCategories = () => {
    let { TopCategoriesSeries,
        TopCategoriesOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-md-6">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Top 5 Categories </h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body p-32 mt-20 d-flex align-items-center justify-content-between gap-24">
                    <div className="">
                        <div
                            id="userOverviewDonutChart"
                            className="margin-16-minus y-value-left apexcharts-tooltip-z-none"
                        >
                            <ReactApexChart
                                options={TopCategoriesOptions}
                                series={TopCategoriesSeries}
                                type="donut"
                                height={270}
                            />
                        </div>
                    </div>
                    <ul className="d-flex flex-column gap-12">
                        <li>
                            <span className="text-lg">
                                UI/UX Design:{" "}
                                <span className="text-success-600 fw-semibold">50%</span>{" "}
                            </span>
                        </li>
                        <li>
                            <span className="text-lg">
                                Entertainment: <span className="text-purple fw-semibold">30%</span>{" "}
                            </span>
                        </li>
                        <li>
                            <span className="text-lg">
                                Lifestyle: <span className="text-danger-600 fw-semibold">87%</span>{" "}
                            </span>
                        </li>
                        <li>
                            <span className="text-lg">
                                Business: <span className="text-primary-600 fw-semibold">87%</span>{" "}
                            </span>
                        </li>
                        <li>
                            <span className="text-lg">
                                Health: <span className="text-warning-600 fw-semibold">40%</span>{" "}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    );
};

export default TopCategories;