import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const PendingVsSolvedTickets = () => {

    let { PendingVsSolvedTicketsSeries, PendingVsSolvedTicketsOptions } = useReactApexChart();

    return (
        <div className="col-lg-8">
            <div className="shadow-7 p-0 radius-12 bg-base h-100 overflow-hidden">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-12 px-20 border-bottom border-neutral-200">
                    <h6 className="mb-0 fw-bold text-lg">Pending Vs Solved Tickets</h6>
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
                    <ul className="d-flex flex-wrap align-items-center justify-content-center my-3 gap-3">
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-warning-600" />
                            <div className="d-flex align-items-center gap-1">
                                <span className="text-secondary-light text-sm fw-semibold">
                                    Pending:{" "}
                                </span>
                                <h6 className="text-primary-light fw-bold">505</h6>
                            </div>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-8-px rounded-pill bg-success-600" />
                            <div className="d-flex align-items-center gap-1">
                                <span className="text-secondary-light text-sm fw-semibold">
                                    Solved:
                                </span>
                                <h6 className="text-primary-light fw-bold"> 700</h6>
                            </div>
                        </li>
                    </ul>
                    <div id="pendingSolvedTicket" className="apexcharts-tooltip-style-1" >
                        <ReactApexChart
                            options={PendingVsSolvedTicketsOptions}
                            series={PendingVsSolvedTicketsSeries}
                            type="area"
                            height={200}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PendingVsSolvedTickets;