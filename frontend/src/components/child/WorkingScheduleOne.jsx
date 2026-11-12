
const WorkingScheduleOne = () => {
    return (
        <div className="col-xxl-4">
            <div className="card h-100 radius-8 border-0">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                    <h6 className="text-lg fw-semibold mb-0">Working Schedule</h6>
                    <div className="">
                        <select className="form-select form-select-sm w-auto bg-base border text-secondary-light radius-8">
                            <option>Jan 2025</option>
                            <option>Feb 2025</option>
                            <option>March 2025</option>
                            <option>April 2025</option>
                            <option>May 2025</option>
                            <option>June 2025</option>
                            <option>July 2025</option>
                            <option>Aug 2025</option>
                            <option>Sep 2025</option>
                            <option>Oct 2025</option>
                            <option>Nov 2025</option>
                            <option>Dec 2025</option>
                        </select>
                    </div>
                </div>
                <div className="card-body p-24">
                    <div className="d-flex align-items-center gap-16 justify-content-between flex-wrap">
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Fr</span>
                            <h6 className="text-md mb-0">21</h6>
                        </div>
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Sa</span>
                            <h6 className="text-md mb-0">22</h6>
                        </div>
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Su</span>
                            <h6 className="text-md mb-0">23</h6>
                        </div>
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Mo</span>
                            <h6 className="text-md mb-0">24</h6>
                        </div>
                        <div className="week-item text-center bg-purple rounded-pill py-12 px-16">
                            <span className="text-sm text-white fw-medium">Tu</span>
                            <h6 className="text-md mb-0 text-white">25</h6>
                        </div>
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">We</span>
                            <h6 className="text-md mb-0">26</h6>
                        </div>
                        <div className="week-item text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Th</span>
                            <h6 className="text-md mb-0">27</h6>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Fr</span>
                            <h6 className="text-md mb-0">28</h6>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Sa</span>
                            <h6 className="text-md mb-0">29</h6>
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-neutral-400 fw-medium">Su</span>
                            <h6 className="text-md mb-0">30</h6>
                        </div>
                    </div>
                    <div className="mt-24 d-flex flex-column gap-20">
                        <div className="d-flex align-items-center justify-content-between gap-1 ps-10 border-inline-start border-start-width-3-px border-purple">
                            <div className="">
                                <div className="d-flex align-items-center gap-1">
                                    <h6 className="text-lg mb-0">10:20 - 11:00</h6>
                                    <span className="text-xs text-secondary-light fw-medium">AM</span>
                                </div>
                                <p className="text-sm text-secondary-light fw-medium mb-1">
                                    UI UX Dashboard Project Meeting
                                </p>
                                <p className="text-xs text-neutral-400 fw-medium mb-0">
                                    Lead by <span className="text-success-600">Jane Cooper</span>{" "}
                                </p>
                            </div>
                            <div className="">
                                <a
                                    href="#"
                                    className="btn btn-neutral-200 text-sm text-primary-light py-6 px-16"
                                >
                                    View{" "}
                                </a>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-1 ps-10 border-inline-start border-start-width-3-px border-warning-600">
                            <div className="">
                                <div className="d-flex align-items-center gap-1">
                                    <h6 className="text-lg mb-0">10:20 - 11:00</h6>
                                    <span className="text-xs text-secondary-light fw-medium">AM</span>
                                </div>
                                <p className="text-sm text-secondary-light fw-medium mb-1">
                                    UI UX Dashboard Project Meeting
                                </p>
                                <p className="text-xs text-neutral-400 fw-medium mb-0">
                                    Lead by <span className="text-success-600">Jane Cooper</span>{" "}
                                </p>
                            </div>
                            <div className="">
                                <a
                                    href="#"
                                    className="btn btn-neutral-200 text-sm text-primary-light py-6 px-16"
                                >
                                    View{" "}
                                </a>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between gap-1 ps-10 border-inline-start border-start-width-3-px border-info-600">
                            <div className="">
                                <div className="d-flex align-items-center gap-1">
                                    <h6 className="text-lg mb-0">10:20 - 11:00</h6>
                                    <span className="text-xs text-secondary-light fw-medium">AM</span>
                                </div>
                                <p className="text-sm text-secondary-light fw-medium mb-1">
                                    UI UX Dashboard Project Meeting
                                </p>
                                <p className="text-xs text-neutral-400 fw-medium mb-0">
                                    Lead by <span className="text-success-600">Jane Cooper</span>{" "}
                                </p>
                            </div>
                            <div className="">
                                <a
                                    href="#"
                                    className="btn btn-neutral-200 text-sm text-primary-light py-6 px-16"
                                >
                                    View{" "}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default WorkingScheduleOne;