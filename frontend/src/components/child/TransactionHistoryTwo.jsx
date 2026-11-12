import { Icon } from "@iconify/react/dist/iconify.js";

const TransactionHistoryTwo = () => {
    return (
        <div className="col-xxl-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Transaction History</h6>
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
                                        Transaction ID
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Amount
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Payment{" "}
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Date
                                    </th>
                                    <th scope="col" className="rounded-0 text-center">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user1.png"
                                                    alt="Image"
                                                    className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                                />
                                            </span>
                                            <div className="">
                                                <span className="d-block text-secondary-light fw-medium line-height-1">
                                                    Cameron Williamson
                                                </span>
                                                <span className="d-block text-secondary-light text-sm">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        9562415412263
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        $29.00
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        Bank
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        24 Jun 2024
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-center">
                                        <div className="max-w-100-px mx-auto">
                                            <span className="bg-success-focus text-success-main px-16 py-2 rounded-pill fw-medium text-sm w-100">
                                                Paid
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user2.png"
                                                    alt="Image"
                                                    className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                                />
                                            </span>
                                            <div className="">
                                                <span className="d-block text-secondary-light fw-medium line-height-1">
                                                    Esther Howard
                                                </span>
                                                <span className="d-block text-secondary-light text-sm">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        9562415412263
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        $29.00
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        PayPal
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        24 Jun 2024
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-center">
                                        <div className="max-w-100-px mx-auto">
                                            <span className="bg-warning-focus text-warning-main px-16 py-2 rounded-pill fw-medium text-sm w-100">
                                                Pending
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user3.png"
                                                    alt="Image"
                                                    className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                                />
                                            </span>
                                            <div className="">
                                                <span className="d-block text-secondary-light fw-medium line-height-1">
                                                    Jane Cooper
                                                </span>
                                                <span className="d-block text-secondary-light text-sm">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        9562415412263
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        $29.00
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        Bank
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        24 Jun 2024
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-center">
                                        <div className="max-w-100-px mx-auto">
                                            <span className="bg-success-focus text-success-main px-16 py-2 rounded-pill fw-medium text-sm w-100">
                                                Paid
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user4.png"
                                                    alt="Image"
                                                    className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                                />
                                            </span>
                                            <div className="">
                                                <span className="d-block text-secondary-light fw-medium line-height-1">
                                                    Floyd Miles
                                                </span>
                                                <span className="d-block text-secondary-light text-sm">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        9562415412263
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        $29.00
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        PayPal
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        24 Jun 2024
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-center">
                                        <div className="max-w-100-px mx-auto">
                                            <span className="bg-danger-focus text-danger-main px-16 py-2 rounded-pill fw-medium text-sm w-100">
                                                Canceled
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        <div className="d-flex align-items-center gap-12">
                                            <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                                <img
                                                    src="assets/images/users/user5.png"
                                                    alt="Image"
                                                    className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                                />
                                            </span>
                                            <div className="">
                                                <span className="d-block text-secondary-light fw-medium line-height-1">
                                                    Bessie Cooper
                                                </span>
                                                <span className="d-block text-secondary-light text-sm">
                                                    osgoodwy@gmail.com
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        9562415412263
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        $29.00
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        Bank
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-secondary-light">
                                        24 Jun 2024
                                    </td>
                                    <td className="border-bottom border-neutral-200 text-center">
                                        <div className="max-w-100-px mx-auto">
                                            <span className="bg-danger-focus text-danger-main px-16 py-2 rounded-pill fw-medium text-sm w-100">
                                                Canceled
                                            </span>
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

export default TransactionHistoryTwo;