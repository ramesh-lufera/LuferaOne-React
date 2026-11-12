import { Icon } from "@iconify/react/dist/iconify.js";

const TopPodcaster = () => {
    return (
        <div className="col-xxl-4 col-md-6">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Top Podcaster</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body p-20 d-flex flex-column gap-20">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/homeThirteen/podcaster-img1.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Digital Assets</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    UI Design
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="follow-btn bg-success-100 rounded px-16 py-6 text-success-600"
                        >
                            Follow
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/homeThirteen/podcaster-img2.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Side Project</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Business
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="follow-btn bg-success-100 rounded px-16 py-6 text-success-600"
                        >
                            Follow
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/homeThirteen/podcaster-img3.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Investment</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Lifestyle
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="follow-btn bg-success-100 rounded px-16 py-6 text-success-600"
                        >
                            Follow
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/homeThirteen/podcaster-img4.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Investment</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Lifestyle
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="follow-btn bg-success-100 rounded px-16 py-6 text-success-600"
                        >
                            Follow
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/homeThirteen/podcaster-img5.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Investment</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Lifestyle
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="follow-btn bg-success-100 rounded px-16 py-6 text-success-600"
                        >
                            Follow
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TopPodcaster;