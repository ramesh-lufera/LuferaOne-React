import { Icon } from "@iconify/react/dist/iconify.js";

const ProjectsStatusOne = () => {
    return (
        <div className="col-xxl-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Projects Status</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body p-24">
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" className="rounded-0">
                                        Project Name
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Clients
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Budget
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Duration
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Progress
                                    </th>
                                    <th scope="col" className="rounded-0 text-center">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-secondary-light"> UX/UI Design </td>
                                    <td className="text-secondary-light">Robert Fox</td>
                                    <td className="text-secondary-light">$24,000</td>
                                    <td className="text-secondary-light">24 Days</td>
                                    <td className="text-secondary-light">
                                        <span className="bg-success-focus text-success-main px-6 py-2 radius-4 fw-semibold text-sm d-inline-flex align-items-center gap-1">
                                            <i className="ri-arrow-right-up-line" />
                                            95%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-semibold text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light"> HTML Developer</td>
                                    <td className="text-secondary-light">Leslie Alexander</td>
                                    <td className="text-secondary-light">$32,700</td>
                                    <td className="text-secondary-light">16 Days</td>
                                    <td className="text-secondary-light">
                                        <span className="bg-danger-focus text-danger-main px-6 py-2 radius-4 fw-semibold text-sm d-inline-flex align-items-center gap-1">
                                            <i className="ri-arrow-left-down-line" />
                                            95%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-semibold text-sm">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">React Development</td>
                                    <td className="text-secondary-light">Devon Lane</td>
                                    <td className="text-secondary-light">$7,250</td>
                                    <td className="text-secondary-light">7 Days</td>
                                    <td className="text-secondary-light">
                                        <span className="bg-success-focus text-success-main px-6 py-2 radius-4 fw-semibold text-sm d-inline-flex align-items-center gap-1">
                                            <i className="ri-arrow-right-up-line" />
                                            95%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="bg-purple-light text-purple px-16 py-2 radius-4 fw-semibold text-sm">
                                            InProgress
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">Python Research</td>
                                    <td className="text-secondary-light">Savannah Nguyen</td>
                                    <td className="text-secondary-light">$24,500</td>
                                    <td className="text-secondary-light">3 Days</td>
                                    <td className="text-secondary-light">
                                        <span className="bg-success-focus text-success-main px-6 py-2 radius-4 fw-semibold text-sm d-inline-flex align-items-center gap-1">
                                            <i className="ri-arrow-right-up-line" />
                                            95%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-semibold text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">Laravel Project</td>
                                    <td className="text-secondary-light">Esther Howard</td>
                                    <td className="text-secondary-light">$30,000</td>
                                    <td className="text-secondary-light">5 Days</td>
                                    <td className="text-secondary-light">
                                        <span className="bg-success-focus text-success-main px-6 py-2 radius-4 fw-semibold text-sm d-inline-flex align-items-center gap-1">
                                            <i className="ri-arrow-right-up-line" />
                                            95%
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className="bg-danger-focus text-danger-main px-16 py-2 radius-4 fw-semibold text-sm">
                                            Cancelled
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProjectsStatusOne;