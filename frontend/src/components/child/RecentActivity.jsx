import { Icon } from "@iconify/react/dist/iconify.js";

const RecentActivity = () => {
    return (
        <div className="col-xxl-12">
            <div className="card h-100">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Recent Activity</h6>
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
                        <table className="table bordered-table mb-0 rounded-0 border-0">
                            <thead>
                                <tr>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Users
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Transaction ID
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Amount
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Payment{" "}
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Date
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0 text-center">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/users/user1.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0">Cameron Williamson</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>9562415412263</td>
                                    <td>$29.00</td>
                                    <td>Bank</td>
                                    <td>24 Jun 2024</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-32 py-4 rounded-pill fw-medium text-sm">
                                            Paid
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/users/user2.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0">Jenny Wilson</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    jennywilson@mail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>8745963214785</td>
                                    <td>$120.50</td>
                                    <td>PayPal</td>
                                    <td>05 Jul 2024</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-32 py-4 rounded-pill fw-medium text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/users/user3.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0">Courtney Henry</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    courtneyh@mail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>6321457896521</td>
                                    <td>$75.99</td>
                                    <td>Credit Card</td>
                                    <td>18 Jul 2024</td>
                                    <td className="text-center">
                                        <span className="bg-danger-focus text-danger-main px-32 py-4 rounded-pill fw-medium text-sm">
                                            Failed
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/users/user4.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0">Darrell Steward</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    darrells@mail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>4578963258741</td>
                                    <td>$210.00</td>
                                    <td>Stripe</td>
                                    <td>30 Jul 2024</td>
                                    <td className="text-center">
                                        <span className="bg-info-focus text-info-main px-32 py-4 rounded-pill fw-medium text-sm">
                                            In Progress
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/users/user5.png"
                                                alt="Image"
                                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="text-md mb-0">Kathryn Murphy</h6>
                                                <span className="text-sm text-secondary-light fw-medium">
                                                    kathrynm@mail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>7896541239874</td>
                                    <td>$340.75</td>
                                    <td>Bank Transfer</td>
                                    <td>12 Aug 2024</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-32 py-4 rounded-pill fw-medium text-sm">
                                            Paid
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

export default RecentActivity;