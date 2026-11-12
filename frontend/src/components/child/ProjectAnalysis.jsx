import ReactApexChart from "react-apexcharts";
import useReactApexChart from "../../hook/useReactApexChart";

const ProjectAnalysis = () => {
    let { ProjectAnalysisSeries,
        ProjectAnalysisOptions } = useReactApexChart();
    return (
        <div className="col-xxl-4 col-sm-6">
            <div className="card h-100 radius-8 border-0">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Project Analysis</h6>
                    <div className="">
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Yearly</option>
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>Today</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-24">
                    <ul className="d-flex flex-wrap align-items-center justify-content-center">
                        <li className="d-flex align-items-center gap-2 me-28">
                            <span className="w-12-px h-12-px rounded-circle bg-success-main" />
                            <span className="text-secondary-light text-sm fw-medium">
                                Revenue
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2 me-28">
                            <span className="w-12-px h-12-px rounded-circle bg-warning-main" />
                            <span className="text-secondary-light text-sm fw-medium">
                                Expenses
                            </span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                            <span className="w-12-px h-12-px rounded-circle bg-purple" />
                            <span className="text-secondary-light text-sm fw-medium">
                                Budgets
                            </span>
                        </li>
                    </ul>
                    <div className="mt-40">
                        <div id="projectAnalysisChart" className="margin-16-minus" >
                            <ReactApexChart options={ProjectAnalysisOptions} series={ProjectAnalysisSeries} type="bar" height={350} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProjectAnalysis;