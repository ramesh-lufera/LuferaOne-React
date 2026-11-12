
const CheckInCheckout = () => {
    return (
        <div className="card radius-12 border-0">
            <div className="card-body py-48 px-16 d-flex align-items-center justify-content-center gap-100-px">
                <div className="text-center">
                    <div className="position-relative d-inline-block">
                        <svg
                            className="radial-progress max-w-120-px"
                            data-percentage={70}
                            viewBox="0 0 80 80"
                        >
                            <circle
                                className="incomplete stroke-8-px opacity-02 stroke-green"
                                cx={40}
                                cy={40}
                                r={35}
                            ></circle>
                            <circle style={{ strokeDashoffset: "65.9734px" }}
                                className=" complete stroke-8-px stroke-green"
                                cx={40}
                                cy={40}
                                r={35}
                            ></circle>
                            <text
                                className="percentage fill-black"
                                x="50%"
                                y="57%"
                                transform="matrix(0, 1, -1, 0, 80, 0)"
                            ></text>
                        </svg>
                        <span className="w-56-px h-56-px rounded-circle bg-neutral-200 text-success-600 d-flex justify-content-center align-items-center position-absolute start-50 top-50 translate-middle">
                            <i className="ri-contract-left-fill w-24-px h-24-px bg-success-600 text-md text-white d-flex justify-content-center align-items-center rounded-circle" />
                        </span>
                    </div>
                    <div className="mt-24">
                        <h5 className="mb-1">70%</h5>
                        <span className="text-secondary-light">Check In</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="position-relative d-inline-block">
                        <svg
                            className="radial-progress max-w-120-px"
                            data-percentage={30}
                            viewBox="0 0 80 80"
                        >
                            <circle
                                className="incomplete stroke-8-px opacity-02 stroke-warning"
                                cx={40}
                                cy={40}
                                r={35}
                            ></circle>
                            <circle style={{ strokeDashoffset: "153.938px" }}
                                className=" complete stroke-8-px stroke-warning"
                                cx={40}
                                cy={40}
                                r={35}
                            ></circle>
                            <text
                                className="percentage fill-black"
                                x="50%"
                                y="57%"
                                transform="matrix(0, 1, -1, 0, 80, 0)"
                            ></text>
                        </svg>
                        <span className="w-56-px h-56-px rounded-circle bg-neutral-200 text-warning-600 d-flex justify-content-center align-items-center position-absolute start-50 top-50 translate-middle">
                            <i className="ri-contract-right-fill w-24-px h-24-px bg-warning-600 text-md text-white d-flex justify-content-center align-items-center rounded-circle" />
                        </span>
                    </div>
                    <div className="mt-24">
                        <h5 className="mb-1">30%</h5>
                        <span className="text-secondary-light">Check Out</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CheckInCheckout;