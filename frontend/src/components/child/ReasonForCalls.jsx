import useReactApexChart from "../../hook/useReactApexChart";
import ReactApexChart from "react-apexcharts";
const ReasonForCalls = () => {
    let { ReasonForCallsSeries,
        ReasonForCallsOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4">
            <div className="card h-100">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Reason for calls</h6>
                </div>
                <div className="card-body p-0">
                    <div className="position-relative">
                        <div id="statisticBarChart" className="text-style ps-24" >
                            <ReactApexChart options={ReasonForCallsOptions} series={ReasonForCallsSeries} type="bar" height={360} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ReasonForCalls;