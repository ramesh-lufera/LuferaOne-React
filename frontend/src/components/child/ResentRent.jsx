import { Icon } from "@iconify/react/dist/iconify.js";

const ResentRent = () => {
    return (
        <div className="col-xxl-4 col-lg-6">
            <div className="card h-100 rounded-4 overflow-hidden border-0">
                <div className="card-header">
                    <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between">
                        <h6 className="mb-2 fw-bold text-lg mb-0">Resent Rent Property</h6>
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
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <h6 className="fw-medium mb-0 text-md">Property</h6>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <h6 className="fw-medium mb-0 text-md">Amount</h6>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <div className="">
                                <img
                                    src="assets/images/home-nineteen/property-img1.png"
                                    alt="Property Image One"
                                    className="w-40-px h-40-px rounded-2"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Happy Lagoon Farm</h6>
                                <p className="text-primary-light text-sm mb-0">
                                    09 Arnulfo Crossing, Botsford
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="text-secondary-light text-md fw-medium">$5,000</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <div className="">
                                <img
                                    src="assets/images/home-nineteen/property-img2.png"
                                    alt="Property Image Two"
                                    className="w-40-px h-40-px rounded-2"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Bright Forest Camp</h6>
                                <p className="text-primary-light text-sm mb-0">
                                    4 Novella Block, Eichmannview
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="text-secondary-light text-md fw-medium">$4,000</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <div className="">
                                <img
                                    src="assets/images/home-nineteen/property-img3.png"
                                    alt="Property Image Three"
                                    className="w-40-px h-40-px rounded-2"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Tranquil Hut</h6>
                                <p className="text-primary-light text-sm mb-0">
                                    0 / 77 Purdy Crescent, West
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="text-secondary-light text-md fw-medium">$3,500</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <div className="">
                                <img
                                    src="assets/images/home-nineteen/property-img4.png"
                                    alt="Property Image Four"
                                    className="w-40-px h-40-px rounded-2"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Vintage Offices</h6>
                                <p className="text-primary-light text-sm mb-0">
                                    208 Olson Boulevard, Toyburgh
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="text-secondary-light text-md fw-medium">$2,800</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-3 py-12 px-16 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-12">
                            <div className="">
                                <img
                                    src="assets/images/home-nineteen/property-img5.png"
                                    alt="Property Image Five"
                                    className="w-40-px h-40-px rounded-2"
                                />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="text-md mb-0 fw-medium">Relaxed Lodge</h6>
                                <p className="text-primary-light text-sm mb-0">
                                    Suite 756 031 Ines Riverway,
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-8">
                            <span className="text-secondary-light text-md fw-medium">$1,750</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ResentRent;