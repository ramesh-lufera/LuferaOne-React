
const UsersInfo = () => {
    return (
        <div className="col-xxl-4 col-lg-5">
            <div className="row gy-4">
                <div className="col-lg-12 col-md-6">
                    <div className="bg-base radius-12 py-20 px-24 shadow-9">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="">
                                <span className="text-secondary-light mb-8">Total Users</span>
                                <div className="d-flex align-items-center gap-12">
                                    <h6 className="mb-0">17,500</h6>
                                    <div className="d-flex align-items-center gap-1 fw-semibold text-success-600">
                                        <span className="">+2.5%</span>
                                        <i className="ri-arrow-up-line" />
                                    </div>
                                </div>
                            </div>
                            <span className="w-60-px h-60-px bg-primary-600 text-white rounded-circle d-flex justify-content-center align-items-center text-2xl primary-shadow">
                                <i className="ri-group-fill" />
                            </span>
                        </div>
                        <div className="mt-32 d-flex align-items-center justify-content-between gap-12 flex-wrap">
                            <div className="py-8 px-12 radius-6 gradient-bg-light-one border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">
                                    Active User:
                                </span>
                                <h6 className="mb-0 text-xl">3,500</h6>
                            </div>
                            <div className="py-8 px-12 radius-6 gradient-bg-light-two border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">
                                    New Sign ups:
                                </span>
                                <h6 className="mb-0 text-xl">5,700</h6>
                            </div>
                            <div className="py-8 px-12 radius-6 gradient-bg-light-three border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">
                                    Subscribed:
                                </span>
                                <h6 className="mb-0 text-xl">8,000</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-12 col-md-6">
                    <div className="bg-base radius-12 py-20 px-24 shadow-9">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="">
                                <span className="text-secondary-light mb-8">Total Podcasts</span>
                                <div className="d-flex align-items-center gap-12">
                                    <h6 className="mb-0">450</h6>
                                    <div className="d-flex align-items-center gap-1 fw-semibold text-success-600">
                                        <span className="">+2.5%</span>
                                        <i className="ri-arrow-up-line" />
                                    </div>
                                </div>
                            </div>
                            <span className="w-60-px h-60-px bg-warning-600 text-white rounded-circle d-flex justify-content-center align-items-center text-2xl warning-shadow">
                                <i className="ri-mic-fill" />
                            </span>
                        </div>
                        <div className="mt-32 d-flex align-items-center justify-content-between gap-12 flex-wrap">
                            <div className="py-8 px-12 radius-6 gradient-bg-light-four border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">Trending:</span>
                                <h6 className="mb-0 text-xl">60</h6>
                            </div>
                            <div className="py-8 px-12 radius-6 gradient-bg-light-five border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">
                                    Free Podcasts:
                                </span>
                                <h6 className="mb-0 text-xl">240</h6>
                            </div>
                            <div className="py-8 px-12 radius-6 gradient-bg-light-six border br-white flex-grow-1">
                                <span className="text-secondary-light mb-8 text-sm">Premium:</span>
                                <h6 className="mb-0 text-xl">150</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default UsersInfo;