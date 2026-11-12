import { Icon } from "@iconify/react/dist/iconify.js";

const TransactionHistory = () => {
    return (
        <div className="col-xxl-4">
            <div className="card h-100 rounded-4 overflow-hidden border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Transaction History</h6>
                        <a
                            href="#"
                            className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                        >
                            View All
                            <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                        </a>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table mb-0 rounded-0 border-0">
                            <thead>
                                <tr>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Customer
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0">
                                        Task
                                    </th>
                                    <th scope="col" className="bg-transparent rounded-0 text-center">
                                        Progress
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img1.png"
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
                                    <td>15</td>
                                    <td className="text-center">
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-valuenow={30}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-purple rounded-pill"
                                                        style={{ width: "30%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img2.png"
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
                                    <td>27</td>
                                    <td className="text-center">
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-valuenow={60}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-yellow rounded-pill"
                                                        style={{ width: "60%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img3.png"
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
                                    <td>42</td>
                                    <td className="text-center">
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-valuenow={80}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-primary rounded-pill"
                                                        style={{ width: "80%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img4.png"
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
                                    <td>8</td>
                                    <td className="text-center">
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-valuenow={20}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-success rounded-pill"
                                                        style={{ width: "20%" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src="assets/images/user-grid/user-grid-img5.png"
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
                                    <td>33</td>
                                    <td className="text-center">
                                        <div className="max-w-112 mx-auto">
                                            <div className="w-100">
                                                <div
                                                    className="progress progress-sm rounded-pill"
                                                    role="progressbar"
                                                    aria-valuenow={50}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                >
                                                    <div
                                                        className="progress-bar bg-danger rounded-pill"
                                                        style={{ width: "50%" }}
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

export default TransactionHistory;