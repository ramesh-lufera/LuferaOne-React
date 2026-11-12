import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TasksOverview = () => {
    let { TeamMembersOneSeries,
        TeamMembersOneOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-sm-6">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Tasks Overview </h6>
                    <div className="">
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-32 mt-20">
                    <div className="position-relative text-center">
                        <div
                            id="taskOverviewChart"
                            className="margin-16-minus y-value-left apexcharts-tooltip-z-none"
                        >
                            <ReactApexChart
                                options={TeamMembersOneOptions}
                                series={TeamMembersOneSeries}
                                type="donut"
                                height={270}
                                width="100%"
                            />
                        </div>
                        <div className="text-center position-absolute top-50 start-50 translate-middle">
                            <span className="text-secondary-light">Total Tasks</span>
                            <h6 className="mb-0 mt-1">46</h6>
                        </div>
                    </div>
                </div>
                <ul className="d-flex flex-wrap align-items-center justify-content-center pb-24 mt-24 gap-28">
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-12-px rounded-circle bg-warning-main" />
                        <span className="text-secondary-light text-sm fw-medium">Pending</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-12-px rounded-circle bg-info-main" />
                        <span className="text-secondary-light text-sm fw-medium">
                            In Progress
                        </span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-12-px rounded-circle bg-purple" />
                        <span className="text-secondary-light text-sm fw-medium">
                            Completed
                        </span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                        <span className="w-12-px h-12-px rounded-circle bg-danger" />
                        <span className="text-secondary-light text-sm fw-medium">
                            Cancelled
                        </span>
                    </li>
                </ul>
            </div>
        </div>

    );
};

export default TasksOverview;