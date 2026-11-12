
const MyTasks = () => {
    return (
        <div className="col-xxl-4 col-sm-6">
            <div className="card h-100">
                <div className="card-body p-24">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between mb-20">
                        <h6 className="mb-2 fw-bold text-lg">My Tasks</h6>
                        <div className="">
                            <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                                <option>All Tasks</option>
                                <option>Pending</option>
                                <option>Completed</option>
                                <option>In Progress</option>
                                <option>Canceled</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table mb-0 border-neutral-50">
                            <thead>
                                <tr>
                                    <th scope="col" className="border-neutral-50">
                                        Project Name
                                    </th>
                                    <th scope="col" className="border-neutral-50">
                                        Deadline
                                    </th>
                                    <th scope="col" className="border-neutral-50">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-neutral-50">Web Development</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-50">UX/UI Design</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-50">React Development</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-purple-light text-purple px-16 py-2 radius-4 fw-medium text-sm">
                                            InProgress
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-50">Django Development</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-50">Web Development</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-danger-focus text-danger-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Cancelled
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-neutral-50">Web Design</td>
                                    <td className="border-neutral-50">10 Jan 2025</td>
                                    <td className="border-neutral-50 text-center">
                                        <span className="bg-purple-light text-purple px-16 py-2 radius-4 fw-medium text-sm">
                                            InProgress
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

export default MyTasks;