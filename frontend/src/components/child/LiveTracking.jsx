import { Icon } from "@iconify/react/dist/iconify.js";

const LiveTracking = () => {
    return (
        <div className="col-xxxl-3">
            <div className="shadow-7 p-0 radius-12 bg-base overflow-hidden h-100">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-12 px-20">
                    <h6 className="mb-0 fw-semibold text-lg">Live Tracking</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body pt-0 ps-20 pb-20 pe-20">
                    <div className="">
                        <div className="">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d117254.51552865302!2d90.79898285652153!3d23.308370214969766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1spalazzo%20pants!5e0!3m2!1sen!2sbd!4v1761979641389!5m2!1sen!2sbd"
                                height={185}
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-100 radius-12 overflow-hidden filter-grayscale-1"
                            />
                        </div>
                        <div className="d-flex align-items-center my-20 gap-8 justify-content-between">
                            <div>
                                <p className="fw-medium text-secondary-light mb-2">Tracking ID</p>
                                <h6 className="mb-0 fw-semibold text-xl">#TR0152</h6>
                            </div>
                            <span className="bg-primary-50 text-primary-600 px-16 py-2 radius-2 fw-medium text-sm">
                                On the way
                            </span>
                        </div>
                        <div className="left-line-dotted position-relative d-flex flex-column gap-12">
                            <div className="left-line__circle d-flex align-items-center ps-16 position-relative justify-content-between gap-16">
                                <div className="">
                                    <span className="fw-semibold text-primary-light text-sm d-block">
                                        Checking
                                    </span>
                                    <span className="fw-normal text-secondary-light text-sm d-block">
                                        5/15/2025
                                    </span>
                                </div>
                                <span className="fw-normal text-secondary-light text-sm">
                                    18:43 PM
                                </span>
                            </div>
                            <div className="left-line__circle d-flex align-items-center ps-16 position-relative justify-content-between gap-16">
                                <div className="">
                                    <span className="fw-semibold text-primary-light text-sm d-block">
                                        In transit
                                    </span>
                                    <span className="fw-normal text-secondary-light text-sm d-block">
                                        5/16/2025
                                    </span>
                                </div>
                                <span className="fw-normal text-secondary-light text-sm">
                                    09:15 AM
                                </span>
                            </div>
                            <div className="left-line__circle incomplete-circle d-flex align-items-center ps-16 position-relative justify-content-between gap-16">
                                <div className="">
                                    <span className="fw-semibold text-primary-light text-sm d-block">
                                        Delivered
                                    </span>
                                    <span className="fw-normal text-secondary-light text-sm d-block">
                                        5/19/2025
                                    </span>
                                </div>
                                <span className="fw-normal text-secondary-light text-sm">
                                    12:15 PM
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 mb-16 bg-neutral-100 p-10 radius-6 d-flex align-items-center justify-content-between gap-8">
                            <div className="d-flex align-items-center gap-12">
                                <span className="w-40-px h-40-px radius-4 overflow-hidden rounded-circle">
                                    <img
                                        src="assets/images/users/user1.png"
                                        alt="Image"
                                        className="w-40-px h-40-px rounded-circle flex-shrink-0 overflow-hidden"
                                    />
                                </span>
                                <div className="">
                                    <span className="d-block text-primary-light fw-medium line-height-1">
                                        Joko Wiroso
                                    </span>
                                    <span className="d-block text-secondary-light text-sm">
                                        Courier
                                    </span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-8">
                                <button
                                    type="button"
                                    className="w-32-px h-32-px bg-base dark-bg-neutral-200 text-secondary-light text-lg radius-8 bg-hover-primary-600 text-hover-white d-flex justify-content-center align-items-center"
                                >
                                    <i className="ri-message-3-line" />
                                </button>
                                <button
                                    type="button"
                                    className="w-32-px h-32-px bg-base dark-bg-neutral-200 text-secondary-light text-lg radius-8 bg-hover-primary-600 text-hover-white d-flex justify-content-center align-items-center"
                                >
                                    <i className="ri-phone-line" />
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary-600 w-100 radius-6 py-10"
                        >
                            Track
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default LiveTracking;