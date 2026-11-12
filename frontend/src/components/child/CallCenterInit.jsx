
const CallCenterInit = () => {
    return (
        <div className="bg-base radius-12 shadow-7 overflow-x-auto">
            <div className="d-flex min-w-max-content stats-card-wrapper">
                <div className="d-grid grid-cols-3 flex-grow-1">
                    <div className="hover-gradient text-center py-24 px-16">
                        <span className="">
                            <img
                                src="assets/images/home-sixteen/icon/phone-icon1.png"
                                alt="Icon"
                            />
                        </span>
                        <h6 className="text-xl mt-12">Incoming Calls</h6>
                        <p className="text-secondary-light">Last 7 days</p>
                        <h5 className="mt-12">526</h5>
                        <p className="text-secondary-light mt-16">Vs 497 prev. 7 days</p>
                    </div>
                    <div className="hover-gradient text-center py-24 px-16">
                        <span className="">
                            <img
                                src="assets/images/home-sixteen/icon/phone-icon2.png"
                                alt="Icon"
                            />
                        </span>
                        <h6 className="text-xl mt-12">Answered Calls</h6>
                        <p className="text-secondary-light">Last 7 days</p>
                        <h5 className="mt-12">526</h5>
                        <p className="text-secondary-light mt-16">Vs 497 prev. 7 days</p>
                    </div>
                    <div className="hover-gradient text-center py-24 px-16">
                        <span className="">
                            <img
                                src="assets/images/home-sixteen/icon/phone-icon3.png"
                                alt="Icon"
                            />
                        </span>
                        <h6 className="text-xl mt-12">Abandoned Calls</h6>
                        <p className="text-secondary-light">Last 7 days</p>
                        <h5 className="mt-12">526</h5>
                        <p className="text-secondary-light mt-16">Vs 497 prev. 7 days</p>
                    </div>
                </div>
                <div className="py-24 d-xxl-block d-none">
                    <span className="w-2-px h-100 bg-neutral-200" />
                </div>
                <div className="d-flex align-items-center gap-50-px pe-90-px">
                    <div className="position-relative">
                        <svg
                            className="radial-progress"
                            data-percentage={90}
                            viewBox="0 0 80 80"
                        >
                            <circle className="incomplete" cx={40} cy={40} r={35} />
                            <circle className="complete" cx={40} cy={40} r={35} style={{ strokeDashoffset: "21.9911px" }} />
                            <text
                                className="percentage"
                                x="50%"
                                y="57%"
                                transform="matrix(0, 1, -1, 0, 80, 0)"
                            />
                        </svg>
                        <div className="text-center position-absolute top-50 start-50 translate-middle">
                            <span className="fw-semibold text-primary-light">Service Level</span>
                            <h3 className="mb-0">85.7</h3>
                            <span className="text-secondary-light mt-12 mb-0">Target: 90%</span>
                        </div>
                    </div>
                    <div className="">
                        <h6 className="text-xl">Average CSAT</h6>
                        <span className="fw-medium text-secondary-light">All time</span>
                        <div className="mt-12 d-flex align-items-start gap-10">
                            <h4 className="mb-0">4.7</h4>
                            <span className="text-white bg-success-600 text-sm px-10 rounded-pill">
                                of 5
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CallCenterInit;