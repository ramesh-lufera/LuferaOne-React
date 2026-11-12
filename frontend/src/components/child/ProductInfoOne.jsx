
const ProductInfoOne = () => {
    return (
        <div className="card h-100 rounded-4 overflow-hidden">
            <div className="card-body p-20">
                <div className="row g-3">
                    <div className="col-xl-3 col-sm-6">
                        <div className="px-24 py-16 rounded-3 border border-neutral-200 sales-card-gradient-bg-1">
                            <div className="d-flex justify-content-between align-items-center gap-12">
                                <div className="flex-grow-1">
                                    <div className="">
                                        <h6 className="fw-semibold mb-0">240</h6>
                                        <span className="text-secondary-light mt-1">Total Product</span>
                                    </div>
                                </div>
                                <span className="bg-primary w-48-px h-48-px text-2xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                    <i className="ri-inbox-2-fill" />
                                </span>
                            </div>
                            <p className="text-sm mb-0 mt-20">
                                <span className="bg-base shadow-10 px-8 py-2 rounded-2 fw-medium text-success-main text-sm d-inline-flex align-items-center gap-1 me-6">
                                    <i className="ri-arrow-right-up-line" />
                                    95%
                                </span>
                                Last month 10
                            </p>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6">
                        <div className="px-24 py-16 rounded-3 border border-neutral-200 sales-card-gradient-bg-2">
                            <div className="d-flex justify-content-between align-items-center gap-12">
                                <div className="flex-grow-1">
                                    <div className="">
                                        <h6 className="fw-semibold mb-0">350</h6>
                                        <span className="text-secondary-light mt-1">Total User</span>
                                    </div>
                                </div>
                                <span className="bg-warning-600 w-48-px h-48-px text-2xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                    <i className="ri-group-3-fill" />
                                </span>
                            </div>
                            <p className="text-sm mb-0 mt-20">
                                <span className="bg-base shadow-10 px-8 py-2 rounded-2 fw-medium text-success-main text-sm d-inline-flex align-items-center gap-1 me-6">
                                    <i className="ri-arrow-right-up-line" />
                                    95%
                                </span>
                                Last month 102
                            </p>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6">
                        <div className="px-24 py-16 rounded-3 border border-neutral-200 sales-card-gradient-bg-1">
                            <div className="d-flex justify-content-between align-items-center gap-12">
                                <div className="flex-grow-1">
                                    <div className="">
                                        <h6 className="fw-semibold mb-0">$10,750</h6>
                                        <span className="text-secondary-light mt-1">Total Sales</span>
                                    </div>
                                </div>
                                <span className="bg-purple w-48-px h-48-px text-2xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                    <i className="ri-discount-percent-line" />
                                </span>
                            </div>
                            <p className="text-sm mb-0 mt-20">
                                <span className="bg-base shadow-10 px-8 py-2 rounded-2 fw-medium text-success-main text-sm d-inline-flex align-items-center gap-1 me-6">
                                    <i className="ri-arrow-right-up-line" />
                                    95%
                                </span>
                                Last month $1,600.00
                            </p>
                        </div>
                    </div>
                    <div className="col-xl-3 col-sm-6">
                        <div className="px-24 py-16 rounded-3 border border-neutral-200 sales-card-gradient-bg-1">
                            <div className="d-flex justify-content-between align-items-center gap-12">
                                <div className="flex-grow-1">
                                    <div className="">
                                        <h6 className="fw-semibold mb-0">$8,000</h6>
                                        <span className="text-secondary-light mt-1">Total Revenue</span>
                                    </div>
                                </div>
                                <span className="bg-info w-48-px h-48-px text-2xxl rounded-circle d-flex justify-content-center align-items-center text-white">
                                    <i className="ri-money-dollar-circle-line" />
                                </span>
                            </div>
                            <p className="text-sm mb-0 mt-20">
                                <span className="bg-base shadow-10 px-8 py-2 rounded-2 fw-medium text-success-main text-sm d-inline-flex align-items-center gap-1 me-6">
                                    <i className="ri-arrow-right-up-line" />
                                    95%
                                </span>
                                Last month $1,600.00
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ProductInfoOne;