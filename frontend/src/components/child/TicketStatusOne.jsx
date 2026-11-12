import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TicketStatusOne = () => {
    let { TicketStatusOneSeries, TicketStatusOneOptions } = useReactApexChart();
    return (
        <div className="col-lg-4">
            <div className="shadow-7 p-0 radius-12 bg-base overflow-hidden h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-12 px-20 border-bottom border-neutral-200">
                    <h6 className="mb-0 fw-bold text-lg">Ticket Status</h6>
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
                    <div
                        id="multipleSeriesChart"
                        className="apexcharts-tooltip-z-none square-marker check-marker series-gap-24 d-flex justify-content-center"
                    >
                        <ReactApexChart
                            options={TicketStatusOneOptions}
                            series={TicketStatusOneSeries}
                            type="polarArea"
                            height={264}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-3 text-sm justify-content-center">
                        <span className="text-secondary-light fw-medium">
                            Pending: <span className="fw-semibold text-warning-600">32</span>{" "}
                        </span>
                        <span className="text-secondary-light fw-medium">
                            Hold: <span className="fw-semibold text-purple">10</span>{" "}
                        </span>
                        <span className="text-secondary-light fw-medium">
                            Complete: <span className="fw-semibold text-success-600">25</span>{" "}
                        </span>
                        <span className="text-secondary-light fw-medium">
                            Cancelled: <span className="fw-semibold text-danger-600">28</span>{" "}
                        </span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TicketStatusOne;