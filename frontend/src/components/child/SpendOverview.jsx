
const SpendOverview = () => {
    return (
        <div className="card radius-12 border-0">
            <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between py-12 px-20 border-bottom border-neutral-200">
                <h6 className="mb-2 fw-bold text-lg">Spend Overview</h6>
                <div className="">
                    <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Today</option>
                    </select>
                </div>
            </div>
            <div className="card-body">
                <div className="d-flex flex-column gap-20">
                    <div className="d-flex align-items-center justify-content-between gap-10">
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center bg-blue-light-two">
                                <img
                                    src="assets/images/home-twelve/icons/spen-icon1.png"
                                    alt="Icon"
                                />
                            </span>
                            <div className="">
                                <h6 className="text-sm mb-2">Flights</h6>
                                <span className="text-xs text-secondary-light">$70,570</span>
                            </div>
                        </div>
                        <div className="">
                            <span className="text-primary-light text-sm d-block text-end">
                                <svg
                                    className="radial-progress w-44-px"
                                    data-percentage={20}
                                    viewBox="0 0 80 80"
                                >
                                    <circle
                                        className="incomplete stroke-8-px opacity-02 stroke-blue"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <circle style={{ strokeDashoffset: "142.942px" }}
                                        className="complete stroke-8-px stroke-blue"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    ></circle>
                                    <text
                                        className="percentage fill-black"
                                        x="50%"
                                        y="57%"
                                        transform="matrix(0, 1, -1, 0, 80, 0)"
                                    >
                                        20
                                    </text>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-10">
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center bg-red-light-two">
                                <img
                                    src="assets/images/home-twelve/icons/spen-icon2.png"
                                    alt="Icon"
                                />
                            </span>
                            <div className="">
                                <h6 className="text-sm mb-2">Hotels</h6>
                                <span className="text-xs text-secondary-light">$85,570</span>
                            </div>
                        </div>
                        <div className="">
                            <span className="text-primary-light text-sm d-block text-end">
                                <svg
                                    className="radial-progress w-44-px"
                                    data-percentage={35}
                                    viewBox="0 0 80 80"
                                >
                                    <circle
                                        className="incomplete stroke-8-px opacity-02 stroke-red"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <circle style={{ strokeDashoffset: "175.929px" }}
                                        className="complete stroke-8-px stroke-red"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    ></circle>
                                    <text
                                        className="percentage fill-black"
                                        x="50%"
                                        y="57%"
                                        transform="matrix(0, 1, -1, 0, 80, 0)"
                                    >
                                        35
                                    </text>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-10">
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center bg-red-light-two">
                                <img
                                    src="assets/images/home-twelve/icons/spen-icon2.png"
                                    alt="Icon"
                                />
                            </span>
                            <div className="">
                                <h6 className="text-sm mb-2">Trains</h6>
                                <span className="text-xs text-secondary-light">$15,000</span>
                            </div>
                        </div>
                        <div className="">
                            <span className="text-primary-light text-sm d-block text-end">
                                <svg
                                    className="radial-progress w-44-px"
                                    data-percentage={45}
                                    viewBox="0 0 80 80"
                                >
                                    <circle
                                        className="incomplete stroke-8-px opacity-02 stroke-warning"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <circle style={{ strokeDashoffset: "120.929px" }}
                                        className="complete stroke-8-px stroke-warning"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <text
                                        className="percentage fill-black"
                                        x="50%"
                                        y="57%"
                                        transform="matrix(0, 1, -1, 0, 80, 0)"
                                    >
                                        45
                                    </text>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between gap-10">
                        <div className="d-flex align-items-center gap-12">
                            <span className="w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center bg-green-light-two">
                                <img
                                    src="assets/images/home-twelve/icons/spen-icon4.png"
                                    alt="Icon"
                                />
                            </span>
                            <div className="">
                                <h6 className="text-sm mb-2">Cars</h6>
                                <span className="text-xs text-secondary-light">$90,000</span>
                            </div>
                        </div>
                        <div className="">
                            <span className="text-primary-light text-sm d-block text-end">
                                <svg
                                    className="radial-progress w-44-px"
                                    data-percentage={65}
                                    viewBox="0 0 80 80"
                                >
                                    <circle
                                        className="incomplete stroke-8-px opacity-02 stroke-green"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <circle style={{ strokeDashoffset: "76.969px" }}
                                        className="complete stroke-8-px stroke-green"
                                        cx={40}
                                        cy={40}
                                        r={35}
                                    />
                                    <text
                                        className="percentage fill-black"
                                        x="50%"
                                        y="57%"
                                        transform="matrix(0, 1, -1, 0, 80, 0)"
                                    >
                                        65
                                    </text>
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default SpendOverview;