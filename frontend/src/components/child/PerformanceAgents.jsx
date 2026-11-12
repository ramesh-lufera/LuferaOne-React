import { Icon } from "@iconify/react/dist/iconify.js";

const PerformanceAgents = () => {

    return (
        <div className="col-lg-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Performance of Agents</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table table-py-8 mb-0 rounded-0 border-0">
                            <thead>
                                <tr>
                                    <th scope="col" className="rounded-0">
                                        Agent Name
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        ID Number
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Total Tickets
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Open Tickets
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Resolved Ticket
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Satisfaction Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user1.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Dianne Russell</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">26531</td>
                                    <td className="text-secondary-light">300</td>
                                    <td className="text-secondary-light">250</td>
                                    <td className="text-secondary-light">50</td>
                                    <td>
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-label="Success example"
                                                    aria-valuenow={25}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-red rounded-pill"
                                                        style={{ width: "30%" }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-8 text-black text-sm fw-medium">30%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user2.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Wade Warren</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">26531</td>
                                    <td className="text-secondary-light">300</td>
                                    <td className="text-secondary-light">250</td>
                                    <td className="text-secondary-light">50</td>
                                    <td>
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-label="Success example"
                                                    aria-valuenow={25}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-warning rounded-pill"
                                                        style={{ width: "50%" }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-8 text-black text-sm fw-medium">50%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user3.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Albert Flores</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">26531</td>
                                    <td className="text-secondary-light">300</td>
                                    <td className="text-secondary-light">250</td>
                                    <td className="text-secondary-light">50</td>
                                    <td>
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-label="Success example"
                                                    aria-valuenow={25}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-info-main rounded-pill"
                                                        style={{ width: "60%" }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-8 text-black text-sm fw-medium">60%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user4.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Bessie Cooper</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">26531</td>
                                    <td className="text-secondary-light">300</td>
                                    <td className="text-secondary-light">250</td>
                                    <td className="text-secondary-light">50</td>
                                    <td>
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-label="Success example"
                                                    aria-valuenow={25}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-success-main rounded-pill"
                                                        style={{ width: "80%" }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-8 text-black text-sm fw-medium">80%</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user1.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Arlene McCoy</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">26531</td>
                                    <td className="text-secondary-light">300</td>
                                    <td className="text-secondary-light">250</td>
                                    <td className="text-secondary-light">50</td>
                                    <td>
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-label="Success example"
                                                    aria-valuenow={25}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-red rounded-pill"
                                                        style={{ width: "75%" }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-8 text-black text-sm fw-medium">75%</span>
                                        </div>
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

export default PerformanceAgents;