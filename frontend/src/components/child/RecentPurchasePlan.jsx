import { Icon } from "@iconify/react/dist/iconify.js";

const RecentPurchasePlan = () => {
    return (
        <div className="col-xxl-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Recent Purchase Plan</h6>
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
                                        User
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Amount
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        StartDate
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        End Date
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Duration
                                    </th>
                                    <th scope="col" className="rounded-0 text-center">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img5.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Dianne Russell</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$29.00</td>
                                    <td className="text-secondary-light">Jan 10, 2025</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">1 Month</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img4.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Cody Fisher</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$$99.00</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">April 10, 2025</td>
                                    <td className="text-secondary-light">3 Month</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Standard
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img3.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Ronald Richards</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$499.00</td>
                                    <td className="text-secondary-light">Jan 10, 2025</td>
                                    <td className="text-secondary-light">Jan 10, 2026</td>
                                    <td className="text-secondary-light">1 Year</td>
                                    <td className="text-center">
                                        <span className="bg-info-focus text-info-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Premium{" "}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img2.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">Albert Flores</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$29.00</td>
                                    <td className="text-secondary-light">Jan 10, 2025</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">1 Month</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img1.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">
                                                Cameron Williamson
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$99.00</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">April 10, 2025</td>
                                    <td className="text-secondary-light">3 Month</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Standard
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img7.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">John Doe</span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$99.00</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">April 10, 2025</td>
                                    <td className="text-secondary-light">3 Month</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/user-grid/user-grid-img8.png"
                                                    alt="Avatar"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="text-secondary-light">John Robiul </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">$99.00</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">April 10, 2025</td>
                                    <td className="text-secondary-light">3 Month</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
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

export default RecentPurchasePlan;