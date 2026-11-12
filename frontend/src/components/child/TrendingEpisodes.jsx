
const TrendingEpisodes = () => {
    return (
        <div className="col-xxl-4 col-md-6">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Trending Episodes</h6>
                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Today</option>
                    </select>
                </div>
                <div className="card-body p-20 d-flex flex-column gap-12">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/home-fourteen/trending-img1.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Product Design</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Esther Howand
                                </span>
                            </div>
                        </div>
                        <div className="text-end d-flex gap-1 justify-content-end flex-column">
                            <span className="">
                                Durations:{" "}
                                <span className="fw-semibold text-primary-light">30:05 mins</span>{" "}
                            </span>
                            <span className="">
                                Views: <span className="fw-semibold text-primary-light">512k</span>{" "}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/home-fourteen/trending-img2.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">How to Change Your Life</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Esther Howand
                                </span>
                            </div>
                        </div>
                        <div className="text-end d-flex gap-1 justify-content-end flex-column">
                            <span className="">
                                Durations:{" "}
                                <span className="fw-semibold text-primary-light">30:05 mins</span>{" "}
                            </span>
                            <span className="">
                                Views: <span className="fw-semibold text-primary-light">512k</span>{" "}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/home-fourteen/trending-img3.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Logo Design</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Esther Howand
                                </span>
                            </div>
                        </div>
                        <div className="text-end d-flex gap-1 justify-content-end flex-column">
                            <span className="">
                                Durations:{" "}
                                <span className="fw-semibold text-primary-light">30:05 mins</span>{" "}
                            </span>
                            <span className="">
                                Views: <span className="fw-semibold text-primary-light">512k</span>{" "}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/home-fourteen/trending-img3.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Good Health</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Esther Howand
                                </span>
                            </div>
                        </div>
                        <div className="text-end d-flex gap-1 justify-content-end flex-column">
                            <span className="">
                                Durations:{" "}
                                <span className="fw-semibold text-primary-light">30:05 mins</span>{" "}
                            </span>
                            <span className="">
                                Views: <span className="fw-semibold text-primary-light">512k</span>{" "}
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center">
                            <img
                                src="assets/images/home-fourteen/trending-img4.png"
                                alt="Image"
                                className="w-40-px h-40-px rounded-circle flex-shrink-0 me-12 overflow-hidden"
                            />
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Episodes Name</h6>
                                <span className="text-sm text-secondary-light fw-medium">
                                    Esther Howand
                                </span>
                            </div>
                        </div>
                        <div className="text-end d-flex gap-1 justify-content-end flex-column">
                            <span className="">
                                Durations:{" "}
                                <span className="fw-semibold text-primary-light">30:05 mins</span>{" "}
                            </span>
                            <span className="">
                                Views: <span className="fw-semibold text-primary-light">512k</span>{" "}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default TrendingEpisodes;