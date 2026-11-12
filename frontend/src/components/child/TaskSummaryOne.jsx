import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TaskSummaryOne = () => {

    let { TaskSummaryOneSeries, TaskSummaryOneOptions } = useReactApexChart();
    return (
        <div className="col-lg-8">
            <div className="shadow-7 p-20 radius-12 bg-base z-1 gradient-bg-chart position-relative h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-3">
                    <h6 className="mb-2 fw-bold text-lg">Task Summary</h6>
                </div>
                <div className="row gy-4">
                    <div className="col-xxxl-3 col-sm-6">
                        <div className="radius-12 overflow-hidden p-20 position-relative z-1 bg-gradient-custom-1">
                            <img
                                src="assets/images/homeThirteen/shape/moon-shape-border.png"
                                alt="Shape"
                                className="position-absolute start-0 bottom-0 mb-10 z-n1"
                            />
                            <span className="d-block text-base mb-24">New Resolved</span>
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <h5 className="text-base">2.5k</h5>
                                <span className="opacity-25">
                                    <img
                                        src="assets/images/homeThirteen/icon/task-summary-icon1.svg"
                                        alt="Icon"
                                        className=""
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxxl-3 col-sm-6">
                        <div className="radius-12 overflow-hidden p-20 position-relative z-1 bg-gradient-custom-2">
                            <img
                                src="assets/images/homeThirteen/shape/moon-shape-border.png"
                                alt="Shape"
                                className="position-absolute start-0 bottom-0 mb-10 z-n1"
                            />
                            <span className="d-block text-base mb-24">Tickets In Progress</span>
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <h5 className="text-base">2.5k</h5>
                                <span className="opacity-25">
                                    <img
                                        src="assets/images/homeThirteen/icon/task-summary-icon2.svg"
                                        alt="Icon"
                                        className=""
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxxl-3 col-sm-6">
                        <div className="radius-12 overflow-hidden p-20 position-relative z-1 bg-gradient-custom-3">
                            <img
                                src="assets/images/homeThirteen/shape/moon-shape-border.png"
                                alt="Shape"
                                className="position-absolute start-0 bottom-0 mb-10 z-n1"
                            />
                            <span className="d-block text-base mb-24">Tickets Due</span>
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <h5 className="text-base">2.5k</h5>
                                <span className="opacity-25">
                                    <img
                                        src="assets/images/homeThirteen/icon/task-summary-icon3.svg"
                                        alt="Icon"
                                        className=""
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxxl-3 col-sm-6">
                        <div className="radius-12 overflow-hidden p-20 position-relative z-1 bg-gradient-custom-4">
                            <img
                                src="assets/images/homeThirteen/shape/moon-shape-border.png"
                                alt="Shape"
                                className="position-absolute start-0 bottom-0 mb-10 z-n1"
                            />
                            <span className="d-block text-base mb-24">Tickets Resolved</span>
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <h5 className="text-base">2.5k</h5>
                                <span className="opacity-25">
                                    <img
                                        src="assets/images/homeThirteen/icon/task-summary-icon4.svg"
                                        alt="Icon"
                                        className=""
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-20 d-flex align-items-center justify-content-between gap-4 flex-wrap">
                    <div className="">
                        <span className="text-secondary-light">On Time Completion Rate</span>
                        <div className="d-flex align-items-center gap-3 mt-8">
                            <h5 className="mb-0">98%</h5>
                            <div className="d-flex align-items-center gap-1 text-success-600 fw-semibold">
                                <span className="line-height-1 d-flex">
                                    <i className="ri-arrow-right-up-line" />
                                </span>
                                <span className="">2.73%</span>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div id="enrollmentChart" className="apexcharts-tooltip-style-1" >
                            <ReactApexChart height={86}
                                width={466} type="area" options={TaskSummaryOneOptions} series={TaskSummaryOneSeries} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TaskSummaryOne;