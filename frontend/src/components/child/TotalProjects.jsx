
const TotalProjects = () => {
    return (
        <>
            <div className="col-xxl-3 col-sm-6">
                <div className="bg-base p-16 radius-8 position-relative overflow-hidden">
                    <span className="blur-gradient blur-gradient-1 position-absolute end-0 top-50" />
                    <div className="d-flex align-items-center justify-content-between gap-1">
                        <div className="">
                            <span className="text-secondary-light text-sm fw-medium">
                                Total Projects
                            </span>
                            <h6 className="text-2xl mb-0">320</h6>
                        </div>
                        <span className="w-40-px h-40-px radius-8 bg-danger-600 text-white d-flex justify-content-center align-items-center text-xxl">
                            <i className="ri-file-text-fill" />
                        </span>
                    </div>
                    <a
                        href="#"
                        className="btn btn-success-100 text-success-600 text-sm py-1 px-16 mt-10"
                    >
                        View More
                    </a>
                </div>
            </div>
            <div className="col-xxl-3 col-sm-6">
                <div className="bg-base p-16 radius-8 position-relative overflow-hidden">
                    <span className="blur-gradient blur-gradient-2 position-absolute end-0 top-50" />
                    <div className="d-flex align-items-center justify-content-between gap-1">
                        <div className="">
                            <span className="text-secondary-light text-sm fw-medium">
                                Total Clients
                            </span>
                            <h6 className="text-2xl mb-0">547</h6>
                        </div>
                        <span className="w-40-px h-40-px radius-8 bg-success-600 text-white d-flex justify-content-center align-items-center text-xxl">
                            <i className="ri-user-2-fill" />
                        </span>
                    </div>
                    <a
                        href="#"
                        className="btn btn-success-100 text-success-600 text-sm py-1 px-16 mt-10"
                    >
                        View More
                    </a>
                </div>
            </div>
            <div className="col-xxl-3 col-sm-6">
                <div className="bg-base p-16 radius-8 position-relative overflow-hidden">
                    <span className="blur-gradient blur-gradient-3 position-absolute end-0 top-50" />
                    <div className="d-flex align-items-center justify-content-between gap-1">
                        <div className="">
                            <span className="text-secondary-light text-sm fw-medium">
                                Team Members
                            </span>
                            <h6 className="text-2xl mb-0">356</h6>
                        </div>
                        <span className="w-40-px h-40-px radius-8 bg-warning-600 text-white d-flex justify-content-center align-items-center text-xxl">
                            <i className="ri-group-fill" />
                        </span>
                    </div>
                    <a
                        href="#"
                        className="btn btn-success-100 text-success-600 text-sm py-1 px-16 mt-10"
                    >
                        View More
                    </a>
                </div>
            </div>
            <div className="col-xxl-3 col-sm-6">
                <div className="bg-base p-16 radius-8 position-relative overflow-hidden">
                    <span className="blur-gradient blur-gradient-4 position-absolute end-0 top-50" />
                    <div className="d-flex align-items-center justify-content-between gap-1">
                        <div className="">
                            <span className="text-secondary-light text-sm fw-medium">
                                Finished Projects
                            </span>
                            <h6 className="text-2xl mb-0">435</h6>
                        </div>
                        <span className="w-40-px h-40-px radius-8 bg-info-600 text-white d-flex justify-content-center align-items-center text-xxl">
                            <i className="ri-file-list-3-fill" />
                        </span>
                    </div>
                    <a
                        href="#"
                        className="btn btn-success-100 text-success-600 text-sm py-1 px-16 mt-10"
                    >
                        View More
                    </a>
                </div>
            </div>
        </>


    );
};

export default TotalProjects;