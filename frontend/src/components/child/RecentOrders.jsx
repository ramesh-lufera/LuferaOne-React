import { Icon } from "@iconify/react/dist/iconify.js";

const RecentOrders = () => {
    return (
        <div className="col-xxl-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Recent Orders</h6>
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
                                        Users
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Invoice
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Items
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Qty
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Amount
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
                                            <span className="text-primary-light fw-semibold">
                                                Dianne Russell
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">Jan 10, 2025</td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">1 Month</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 rounded-pill fw-medium text-sm">
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
                                            <span className="text-primary-light fw-semibold">
                                                Cody Fisher
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">iPhone 14 max</td>
                                    <td className="text-secondary-light">1</td>
                                    <td className="text-secondary-light">$5,000.00</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 rounded-pill fw-medium text-sm">
                                            Paid
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
                                            <span className="text-primary-light fw-semibold">
                                                Ronald Richards
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">Laptop HPH </td>
                                    <td className="text-secondary-light">3</td>
                                    <td className="text-secondary-light">$1,000.00</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 rounded-pill fw-medium text-sm">
                                            Pending
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
                                            <span className="text-primary-light fw-semibold">
                                                Albert Flores
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">Smart Watch </td>
                                    <td className="text-secondary-light">7</td>
                                    <td className="text-secondary-light">$700.00</td>
                                    <td className="text-center">
                                        <span className="bg-primary-50 text-primary-600 px-16 py-2 rounded-pill fw-medium text-sm">
                                            Shipped
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
                                            <span className="text-primary-light fw-semibold">
                                                Cameron Williamson
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">Nike Air Shoe</td>
                                    <td className="text-secondary-light">3</td>
                                    <td className="text-secondary-light">$3,000.00</td>
                                    <td className="text-center">
                                        <span className="bg-danger-focus text-danger-main px-16 py-2 rounded-pill fw-medium text-sm">
                                            Cancel
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
                                            <span className="text-primary-light fw-semibold">
                                                John Doe
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">#6352148</td>
                                    <td className="text-secondary-light">New Headphone</td>
                                    <td className="text-secondary-light">5</td>
                                    <td className="text-secondary-light">$4,000.00</td>
                                    <td className="text-center">
                                        <span className="bg-danger-focus text-danger-main px-16 py-2 rounded-pill fw-medium text-sm">
                                            Cancel
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

export default RecentOrders;