import { Icon } from "@iconify/react/dist/iconify.js";

const TeamMembersOne = () => {
    return (
        <div className="col-xxl-4 col-sm-6">
            <div className="card h-100">
                <div className="card-body p-24">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-20">
                        <h6 className="mb-2 fw-bold text-lg">Team Members</h6>
                        <a
                            href="#"
                            className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                        >
                            View All
                            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                        </a>
                    </div>
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table mb-0 border-neutral-100">
                            <thead>
                                <tr>
                                    <th scope="col" className="border-neutral-100">
                                        Customer
                                    </th>
                                    <th scope="col" className="border-neutral-100">
                                        Task
                                    </th>
                                    <th scope="col" className="border-neutral-100">
                                        Progress
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-neutral-100">
                                        <div className="d-flex align-items-center gap-12">
                                            <img
                                                src="assets/images/user-grid/user-grid-img5.png"
                                                alt="User"
                                                className="object-fit-cover rounded-circle w-40-px h-40-px radius-8 flex-shrink-0 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Kristin Watson</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    ulfaha@mail.ru
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-neutral-100">15</td>
                                    <td className="border-neutral-100">
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
                                                        className="progress-bar bg-purple rounded-start-pill"
                                                        style={{ width: "80%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-100">
                                        <div className="d-flex align-items-center gap-12">
                                            <img
                                                src="assets/images/user-grid/user-grid-img4.png"
                                                alt="User"
                                                className="object-fit-cover rounded-circle w-40-px h-40-px radius-8 flex-shrink-0 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Theresa Webb</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    joie@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-neutral-100">20</td>
                                    <td className="border-neutral-100">
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
                                                        className="progress-bar bg-warning-main rounded-start-pill"
                                                        style={{ width: "50%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-100">
                                        <div className="d-flex align-items-center gap-12">
                                            <img
                                                src="assets/images/user-grid/user-grid-img3.png"
                                                alt="User"
                                                className="object-fit-cover rounded-circle w-40-px h-40-px radius-8 flex-shrink-0 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Brooklyn Simmons</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    warn@mail.ru
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-neutral-100">24</td>
                                    <td className="border-neutral-100">
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
                                                        className="progress-bar bg-info-main rounded-start-pill"
                                                        style={{ width: "60%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-100">
                                        <div className="d-flex align-items-center gap-12">
                                            <img
                                                src="assets/images/user-grid/user-grid-img2.png"
                                                alt="User"
                                                className="object-fit-cover rounded-circle w-40-px h-40-px radius-8 flex-shrink-0 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Robert Fox</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    fellora@mail.ru
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-neutral-100">26</td>
                                    <td className="border-neutral-100">
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
                                                        className="progress-bar bg-success-main rounded-start-pill"
                                                        style={{ width: "92%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-100">
                                        <div className="d-flex align-items-center gap-12">
                                            <img
                                                src="assets/images/user-grid/user-grid-img1.png"
                                                alt="User"
                                                className="object-fit-cover rounded-circle w-40-px h-40-px radius-8 flex-shrink-0 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Jane Cooper</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    zitka@mail.ru
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-neutral-100">25</td>
                                    <td className="border-neutral-100">
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
                                                        className="progress-bar bg-red rounded-start-pill"
                                                        style={{ width: "25%" }}
                                                    />
                                                </div>
                                            </div>
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

export default TeamMembersOne;