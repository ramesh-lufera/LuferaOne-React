import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";
import { Icon } from "@iconify/react/dist/iconify.js";

const DailySales = () => {
    let { DailySalesSeries,
        DailySalesOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-lg-6">
            <div className="card h-100 radius-8 border">
                <div className="card-body p-24">
                    <h6 className="mb-12 fw-bold text-lg mb-0">Daily Sales</h6>
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-semibold mb-0">$27,200</h6>
                        <p className="text-sm mb-0">
                            <span className="bg-success-focus border border-success px-8 py-2 rounded-pill fw-semibold text-success-main text-sm d-inline-flex align-items-center gap-1">
                                10%
                                <Icon icon="iconamoon:arrow-up-2-fill" className="icon" />
                            </span>
                            Increases
                        </p>
                    </div>
                    <div id="recent-orders" className="mt-28" >
                        <ReactApexChart options={DailySalesOptions} series={DailySalesSeries} type="area" height={360} width="100%" />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default DailySales;