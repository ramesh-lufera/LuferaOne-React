import { Icon } from "@iconify/react/dist/iconify.js";

const RecentlyPlayed = () => {
    return (
        <div className="col-lg-8">
            <div className="bg-base radius-12 py-20 px-24 shadow-9 h-100 mb-24">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between border-bottom mb-24 pb-16">
                    <h6 className="mb-0 fw-bold text-lg">Recently Played</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="mt-20">
                    <div className="row gy-4">
                        <div className="col-lg-3 col-sm-6">
                            <div className="">
                                <div className="radius-8 overflow-hidden position-relative">
                                    <img
                                        src="assets/images/home-fourteen/podcast-img1.png"
                                        alt="Thumb"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                    <a
                                        href="#"
                                        className="w-28-px h-24-px text-white bg-white bg-opacity-50 d-flex justify-content-center align-items-center position-absolute start-0 bottom-0 ms-10 mb-10 radius-6 hover-bg-white hover-text-primary text-sm"
                                    >
                                        <i className="ri-play-large-fill" />
                                    </a>
                                </div>
                                <div className="mt-12">
                                    <h6 className="text-md mb-0">Talk show </h6>
                                    <span className="text-sm text-secondary-light">
                                        Esther Howard
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="">
                                <div className="radius-8 overflow-hidden position-relative">
                                    <img
                                        src="assets/images/home-fourteen/podcast-img2.png"
                                        alt="Thumb"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                    <a
                                        href="#"
                                        className="w-28-px h-24-px text-white bg-white bg-opacity-50 d-flex justify-content-center align-items-center position-absolute start-0 bottom-0 ms-10 mb-10 radius-6 hover-bg-white hover-text-primary text-sm"
                                    >
                                        <i className="ri-play-large-fill" />
                                    </a>
                                </div>
                                <div className="mt-12">
                                    <h6 className="text-md mb-0">Change Life Style </h6>
                                    <span className="text-sm text-secondary-light">
                                        Cameron Williamson
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="">
                                <div className="radius-8 overflow-hidden position-relative">
                                    <img
                                        src="assets/images/home-fourteen/podcast-img3.png"
                                        alt="Thumb"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                    <a
                                        href="#"
                                        className="w-28-px h-24-px text-white bg-white bg-opacity-50 d-flex justify-content-center align-items-center position-absolute start-0 bottom-0 ms-10 mb-10 radius-6 hover-bg-white hover-text-primary text-sm"
                                    >
                                        <i className="ri-play-large-fill" />
                                    </a>
                                </div>
                                <div className="mt-12">
                                    <h6 className="text-md mb-0">Neon Lights</h6>
                                    <span className="text-sm text-secondary-light">
                                        Leslie Alexander
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="">
                                <div className="radius-8 overflow-hidden position-relative">
                                    <img
                                        src="assets/images/home-fourteen/podcast-img4.png"
                                        alt="Thumb"
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                    <a
                                        href="#"
                                        className="w-28-px h-24-px text-white bg-white bg-opacity-50 d-flex justify-content-center align-items-center position-absolute start-0 bottom-0 ms-10 mb-10 radius-6 hover-bg-white hover-text-primary text-sm"
                                    >
                                        <i className="ri-play-large-fill" />
                                    </a>
                                </div>
                                <div className="mt-12">
                                    <h6 className="text-md mb-0">Product Design</h6>
                                    <span className="text-sm text-secondary-light">
                                        Bessie Cooper
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default RecentlyPlayed;