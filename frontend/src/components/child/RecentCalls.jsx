import { Icon } from "@iconify/react/dist/iconify.js";

const RecentCalls = () => {
    return (
        <div className="col-xxl-8">
            <div className="card h-100">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Recent Calls</h6>
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
                        <table className="table bordered-table mb-0 rounded-0 border-0 sm-table">
                            <thead>
                                <tr>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Caller Name
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Type
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Duration
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Time
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img1.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Kristin Watson</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    219.555.0114
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-success-600">Inbound</span>
                                    </td>
                                    <td>5 mins</td>
                                    <td>10:30 PM</td>
                                    <td>
                                        {" "}
                                        <span className="bg-success-focus text-success-main px-10 py-4 radius-8 fw-medium text-sm">
                                            Resolved
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img2.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Theresa Webb</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    406.555.0120
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-success-600">Inbound</span>
                                    </td>
                                    <td>12 mins</td>
                                    <td>10:40 PM</td>
                                    <td>
                                        {" "}
                                        <span className="bg-lilac-100 text-lilac-600 px-10 py-4 radius-8 fw-medium text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img3.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Brooklyn Simmons</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    229.555.0109
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-warning-600">Outbound</span>
                                    </td>
                                    <td>15 mins</td>
                                    <td>11:30 PM</td>
                                    <td>
                                        {" "}
                                        <span className="bg-warning-focus text-warning-main px-10 py-4 radius-8 fw-medium text-sm">
                                            Dropped
                                        </span>{" "}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img4.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Robert Fox</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    262.555.0131
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-success-600">Inbound</span>
                                    </td>
                                    <td>17 mins</td>
                                    <td>09:15 AM</td>
                                    <td>
                                        {" "}
                                        <span className="bg-success-focus text-success-main px-10 py-4 radius-8 fw-medium text-sm">
                                            Resolved
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img5.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0 fw-medium">Jane Cooper</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    671.555.0110
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="fw-semibold text-success-600">Inbound</span>
                                    </td>
                                    <td>25 mins</td>
                                    <td>10:30 PM</td>
                                    <td>
                                        {" "}
                                        <span className="bg-lilac-focus text-lilac-main px-10 py-4 radius-8 fw-medium text-sm">
                                            Pending
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

export default RecentCalls;