import { Icon } from "@iconify/react/dist/iconify.js";

const BestAgents = () => {
    return (
        <div className="col-xxl-6">
            <div className="card h-100">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Best Agents This Week</h6>
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
                                    <th scope="col" className="bg-neutral-100 rounded-0">
                                        User
                                    </th>
                                    <th scope="col" className="bg-neutral-100 rounded-0">
                                        Calls
                                    </th>
                                    <th scope="col" className="bg-neutral-100 rounded-0">
                                        Avg. Duration
                                    </th>
                                    <th scope="col" className="bg-neutral-100 rounded-0">
                                        FCR
                                    </th>
                                    <th scope="col" className="bg-neutral-100 rounded-0">
                                        CSAT
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
                                                <h6 className="text-md mb-0 fw-medium">Dianne Russell</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>380</td>
                                    <td>8 mins 10 secs</td>
                                    <td>70%</td>
                                    <td>90%</td>
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
                                                <h6 className="text-md mb-0 fw-medium">Cody Fisher</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>65</td>
                                    <td>4 mins 16 secs</td>
                                    <td>80%</td>
                                    <td>85%</td>
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
                                                <h6 className="text-md mb-0 fw-medium">Ronald Richards</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>280</td>
                                    <td>5 mins 30 secs</td>
                                    <td>90%</td>
                                    <td>80%</td>
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
                                                <h6 className="text-md mb-0 fw-medium">Albert Flores</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>230 </td>
                                    <td>12 mins 45 secs</td>
                                    <td>95%</td>
                                    <td>75%</td>
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
                                                <h6 className="text-md mb-0 fw-medium">
                                                    Cameron Williamson
                                                </h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td>150</td>
                                    <td>3 mins 25 secs</td>
                                    <td>100%</td>
                                    <td>70%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default BestAgents;