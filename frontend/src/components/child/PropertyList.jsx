import { Icon } from "@iconify/react/dist/iconify.js";

const PropertyList = () => {
    return (
        <div className="col-12">
            <div className="shadow-7 radius-12 bg-base h-100 overflow-hidden">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Property List</h6>
                    <a
                        href="#"
                        className="text-primary-600 hover-text-primary d-flex align-items-center gap-1"
                    >
                        View All
                        <Icon icon="solar:alt-arrow-right-linear" className="icon" />
                    </a>
                </div>
                <div className="card-body p-20">
                    <div className="row g-3">
                        <div className="col-xxl-3 col-sm-6">
                            <div className="bg-base rounded-3 overflow-hidden border border-neutral-200">
                                <figure className="position-relative mb-0">
                                    <img
                                        src="assets/images/home-nineteen/property-list-img1.png"
                                        alt="Property List Image One"
                                        className="w-100"
                                    />
                                    <span className="bg-danger-600 text-white rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute top-0 start-0 mt-20 ms-20">
                                        <img
                                            src="assets/images/home-nineteen/icons/featured-icon.png"
                                            alt="Feature Icon"
                                        />
                                        Featured
                                    </span>
                                    <span className="bg-white text-static-black rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute bottom-0 start-0 mb-20 ms-20 fw-semibold">
                                        $4,600
                                    </span>
                                </figure>
                                <div className="p-20">
                                    <h6 className="text-md mb-4">House on the Hollywood</h6>
                                    <span className="text-secondary-light text-sm">
                                        374 Johnson Ave
                                    </span>
                                    <div className="d-flex align-items-center justify-content-between gap-8 mt-16 flex-wrap">
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon1.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">6 Beds</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon2.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">2 Baths</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon3.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">200 sqft</span>
                                        </div>
                                    </div>
                                    <div className="my-16 border-bottom border-neutral-200 w-100" />
                                    <div className="d-flex align-items-center justify-content-between gap-16 flex-sm-nowrap flex-wrap">
                                        <span className="text-primary-light text-sm">For Sale</span>
                                        <div className="d-flex align-items-center gap-24">
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon1.png"
                                                    alt="Link Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon2.png"
                                                    alt="Wishlist Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon3.png"
                                                    alt="Export Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="bg-base rounded-3 overflow-hidden border border-neutral-200">
                                <figure className="position-relative mb-0">
                                    <img
                                        src="assets/images/home-nineteen/property-list-img2.png"
                                        alt="Property List Image Two"
                                        className="w-100"
                                    />
                                    <span className="bg-danger-600 text-white rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute top-0 start-0 mt-20 ms-20">
                                        <img
                                            src="assets/images/home-nineteen/icons/featured-icon.png"
                                            alt="Feature Icon"
                                        />
                                        Featured
                                    </span>
                                    <span className="bg-white text-static-black rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute bottom-0 start-0 mb-20 ms-20 fw-semibold">
                                        $5,800
                                    </span>
                                </figure>
                                <div className="p-20">
                                    <h6 className="text-md mb-4">Comfortable Villa Green</h6>
                                    <span className="text-secondary-light text-sm">
                                        178 Broadway, Brooklyn
                                    </span>
                                    <div className="d-flex align-items-center justify-content-between gap-8 mt-16 flex-wrap">
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon1.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">6 Beds</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon2.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">3 Baths</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon3.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">600 sqft</span>
                                        </div>
                                    </div>
                                    <div className="my-16 border-bottom border-neutral-200 w-100" />
                                    <div className="d-flex align-items-center justify-content-between gap-16 flex-sm-nowrap flex-wrap">
                                        <span className="text-primary-light text-sm">For Sale</span>
                                        <div className="d-flex align-items-center gap-24">
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon1.png"
                                                    alt="Link Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon2.png"
                                                    alt="Wishlist Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon3.png"
                                                    alt="Export Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="bg-base rounded-3 overflow-hidden border border-neutral-200">
                                <figure className="position-relative mb-0">
                                    <img
                                        src="assets/images/home-nineteen/property-list-img3.png"
                                        alt="Property List Image One"
                                        className="w-100"
                                    />
                                    <span className="bg-danger-600 text-white rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute top-0 start-0 mt-20 ms-20">
                                        <img
                                            src="assets/images/home-nineteen/icons/featured-icon.png"
                                            alt="Feature Icon"
                                        />
                                        Featured
                                    </span>
                                    <span className="bg-white text-static-black rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute bottom-0 start-0 mb-20 ms-20 fw-semibold">
                                        $4,500
                                    </span>
                                </figure>
                                <div className="p-20">
                                    <h6 className="text-md mb-4">Quality House For Sale</h6>
                                    <span className="text-secondary-light text-sm">
                                        873 Bedford Ave
                                    </span>
                                    <div className="d-flex align-items-center justify-content-between gap-8 mt-16 flex-wrap">
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon1.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">10 Beds</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon2.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">2 Baths</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon3.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">400 sqft</span>
                                        </div>
                                    </div>
                                    <div className="my-16 border-bottom border-neutral-200 w-100" />
                                    <div className="d-flex align-items-center justify-content-between gap-16 flex-sm-nowrap flex-wrap">
                                        <span className="text-primary-light text-sm">For Sale</span>
                                        <div className="d-flex align-items-center gap-24">
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon1.png"
                                                    alt="Link Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon2.png"
                                                    alt="Wishlist Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon3.png"
                                                    alt="Export Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="bg-base rounded-3 overflow-hidden border border-neutral-200">
                                <figure className="position-relative mb-0">
                                    <img
                                        src="assets/images/home-nineteen/property-list-img4.png"
                                        alt="Property List Image One"
                                        className="w-100"
                                    />
                                    <span className="bg-danger-600 text-white rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute top-0 start-0 mt-20 ms-20">
                                        <img
                                            src="assets/images/home-nineteen/icons/featured-icon.png"
                                            alt="Feature Icon"
                                        />
                                        Featured
                                    </span>
                                    <span className="bg-white text-static-black rounded d-inline-flex align-items-center gap-8 text-uppercase px-16 py-6 text-sm position-absolute bottom-0 start-0 mb-20 ms-20 fw-semibold">
                                        $5,500
                                    </span>
                                </figure>
                                <div className="p-20">
                                    <h6 className="text-md mb-4">Diamond Family Home</h6>
                                    <span className="text-secondary-light text-sm">
                                        254 S 2nd St, Brooklyn
                                    </span>
                                    <div className="d-flex align-items-center justify-content-between gap-8 mt-16 flex-wrap">
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon1.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">4 Beds</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon2.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">2 Baths</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-8">
                                            <span className="text-primary-light d-flex">
                                                <img
                                                    src="assets/images/home-nineteen/icons/amenities-icon3.png"
                                                    alt="Bed Icon"
                                                    className="dark-img-white"
                                                />
                                            </span>
                                            <span className="text-primary-light text-sm">300 sqft</span>
                                        </div>
                                    </div>
                                    <div className="my-16 border-bottom border-neutral-200 w-100" />
                                    <div className="d-flex align-items-center justify-content-between gap-16 flex-sm-nowrap flex-wrap">
                                        <span className="text-primary-light text-sm">For Sale</span>
                                        <div className="d-flex align-items-center gap-24">
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon1.png"
                                                    alt="Link Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon2.png"
                                                    alt="Wishlist Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                            <button
                                                type="button"
                                                className="cursor-pointer d-flex hover-scale-16"
                                            >
                                                <img
                                                    src="assets/images/home-nineteen/icons/link-icon3.png"
                                                    alt="Export Button"
                                                    className="dark-img-white"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PropertyList;