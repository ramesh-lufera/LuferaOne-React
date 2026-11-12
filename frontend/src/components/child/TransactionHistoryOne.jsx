import { Icon } from "@iconify/react/dist/iconify.js";



const TransactionHistoryOne = () => {
    return (
        <div className="card radius-12 h-100">
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
                                    Place
                                </th>
                                <th scope="col" className="rounded-0">
                                    ID
                                </th>
                                <th scope="col" className="rounded-0">
                                    Duration
                                </th>
                                <th scope="col" className="rounded-0">
                                    Amount
                                </th>
                                <th scope="col" className="rounded-0">
                                    Date
                                </th>
                                <th scope="col" className="rounded-0">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-secondary-light">
                                    <div className="d-flex align-items-center gap-12">
                                        <span className="w-40-px h-40-px radius-4 overflow-hidden">
                                            <img
                                                src="assets/images/home-twelve/transaction-img1.png"
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </span>
                                        <span className="text-secondary-light">Grand Palace</span>
                                    </div>
                                </td>
                                <td className="text-secondary-light">#1250</td>
                                <td className="text-secondary-light">5 Days, 6 Nights</td>
                                <td className="text-secondary-light">$209.00</td>
                                <td className="text-secondary-light">21/09/2025</td>
                                <td>
                                    <span className="bg-success-focus text-success-main px-20 py-4 radius-4 fw-medium text-sm">
                                        Completed
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-secondary-light">
                                    <div className="d-flex align-items-center gap-12">
                                        <span className="w-40-px h-40-px radius-4 overflow-hidden">
                                            <img
                                                src="assets/images/home-twelve/transaction-img2.png"
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </span>
                                        <span className="text-secondary-light">Paris France</span>
                                    </div>
                                </td>
                                <td className="text-secondary-light">#6523</td>
                                <td className="text-secondary-light">2 Days, 3 Nights</td>
                                <td className="text-secondary-light">$$570.00</td>
                                <td className="text-secondary-light">21/09/2025</td>
                                <td>
                                    <span className="bg-warning-focus text-warning-main px-20 py-4 radius-4 fw-medium text-sm">
                                        Pending
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-secondary-light">
                                    <div className="d-flex align-items-center gap-12">
                                        <span className="w-40-px h-40-px radius-4 overflow-hidden">
                                            <img
                                                src="assets/images/home-twelve/transaction-img3.png"
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </span>
                                        <span className="text-secondary-light">Khaosan Road</span>
                                    </div>
                                </td>
                                <td className="text-secondary-light">#1250</td>
                                <td className="text-secondary-light">5 Days, 6 Nights</td>
                                <td className="text-secondary-light">$870.00</td>
                                <td className="text-secondary-light">21/09/2025</td>
                                <td>
                                    <span className="bg-success-focus text-success-main px-20 py-4 radius-4 fw-medium text-sm">
                                        Completed
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-secondary-light">
                                    <div className="d-flex align-items-center gap-12">
                                        <span className="w-40-px h-40-px radius-4 overflow-hidden">
                                            <img
                                                src="assets/images/home-twelve/transaction-img4.png"
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </span>
                                        <span className="text-secondary-light">Wat Phra Kaew</span>
                                    </div>
                                </td>
                                <td className="text-secondary-light">#6523</td>
                                <td className="text-secondary-light">2 Days, 3 Nights</td>
                                <td className="text-secondary-light">$450.00</td>
                                <td className="text-secondary-light">21/09/2025</td>
                                <td>
                                    <span className="bg-warning-focus text-warning-main px-20 py-4 radius-4 fw-medium text-sm">
                                        Pending
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-secondary-light">
                                    <div className="d-flex align-items-center gap-12">
                                        <span className="w-40-px h-40-px radius-4 overflow-hidden">
                                            <img
                                                src="assets/images/home-twelve/transaction-img5.png"
                                                alt="Avatar"
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </span>
                                        <span className="text-secondary-light">Wat Pho</span>
                                    </div>
                                </td>
                                <td className="text-secondary-light">#1250</td>
                                <td className="text-secondary-light">3 Days, 4 Nights</td>
                                <td className="text-secondary-light">$120.00</td>
                                <td className="text-secondary-light">21/09/2025</td>
                                <td>
                                    <span className="bg-success-focus text-success-main px-20 py-4 radius-4 fw-medium text-sm">
                                        Completed
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
};

export default TransactionHistoryOne;