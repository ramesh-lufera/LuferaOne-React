import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const TicketPriorityOne = () => {
    let { TicketPriorityOneSeries, TicketPriorityOneOptions } = useReactApexChart();
    return (
        <div className="col-lg-4">
            <div className="shadow-7 p-20 radius-12 bg-base h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                    <h6 className="mb-2 fw-bold text-lg">Ticket Priority</h6>
                </div>
                <div className="position-relative">
                    <div id="statisticBarChart" className="text-style" >
                        <ReactApexChart
                            options={TicketPriorityOneOptions}
                            series={TicketPriorityOneSeries}
                            type="bar"
                            height={270}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TicketPriorityOne;