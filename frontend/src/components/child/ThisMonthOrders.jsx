import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const ThisMonthOrders = () => {
    let { ThisMonthOrdersSeries,
        ThisMonthOrdersOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-lg-6">
            <div className="shadow-7 p-0 radius-12 bg-base overflow-hidden h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-16 px-20 border-bottom border-neutral-200">
                    <h6 className="mb-0 fw-semibold text-lg">This Month Orders</h6>
                </div>
                <div className="card-body p-20">
                    <div id="monthOrderChart" >
                        <ReactApexChart
                            options={ThisMonthOrdersOptions}
                            series={ThisMonthOrdersSeries}
                            type="bar"
                            height={224}
                            width="100%"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ThisMonthOrders;