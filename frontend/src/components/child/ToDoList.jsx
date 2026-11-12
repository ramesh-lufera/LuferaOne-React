import { Icon } from "@iconify/react/dist/iconify.js";

const ToDoList = () => {
    return (
        <div className="col-lg-8">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">To Do List</h6>
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
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                    id="selectAll"
                                                />
                                            </div>
                                            ID
                                        </div>
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Task Name
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Assigned To
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Due Date
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Priority
                                    </th>
                                    <th scope="col" className="rounded-0">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                />
                                            </div>
                                            26531
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Mobile app Development</td>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center">
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img1.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img2.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img3.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img4.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <label
                                                className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px d-inline-flex justify-content-center align-items-center bg-primary-600 text-white"
                                                htmlFor="uploadImage"
                                            >
                                                <i className="ri-add-fill" />
                                                <input type="file" id="uploadImage" hidden />
                                            </label>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">High</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                />
                                            </div>
                                            26531
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Product design</td>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center">
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img1.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img2.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img3.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">Low</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Standard
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                />
                                            </div>
                                            26531
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">UI/UX Design</td>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center">
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img1.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img2.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">Medium</td>
                                    <td className="text-center">
                                        <span className="bg-info-focus text-info-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Premium{" "}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                />
                                            </div>
                                            26531
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Website ui design</td>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center">
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img1.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img2.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8 ms--10px">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img3.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">High</td>
                                    <td className="text-center">
                                        <span className="bg-success-focus text-success-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Basic
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border border-neutral-300 input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                />
                                            </div>
                                            26531
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">PHP Project </td>
                                    <td className="text-secondary-light">
                                        <div className="d-flex align-items-center">
                                            <span className="w-36-px h-36-px border border-white rounded-circle shadow-8">
                                                <img
                                                    src="assets/images/homeThirteen/todo-list-img1.png"
                                                    alt="Image"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-secondary-light">Feb 10, 2025</td>
                                    <td className="text-secondary-light">Low</td>
                                    <td className="text-center">
                                        <span className="bg-warning-focus text-warning-main px-16 py-2 radius-4 fw-medium text-sm">
                                            Standard
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

export default ToDoList;