
const ExploreInner = () => {
    return (
        <div className="col-xxl-7">
            <div
                className="bg-img rounded-3 overflow-hidden d-flex align-items-end justify-content-between flex-sm-nowrap flex-wrap"
                style={{
                    backgroundImage: 'url("assets/images/home-nineteen/home-card-bg.png")'
                }}
            >
                <div className="py-40 ps-36 pe-20">
                    <h6 className="text-white mb-28 text-capitalize">
                        Enjoy your first home sale
                    </h6>
                    <a
                        href="#"
                        className="btn btn-warning text-sm btn-sm px-24 py-12 radius-8 d-inline-flex align-items-center gap-2"
                    >
                        Explore Now
                    </a>
                </div>
                <div className="pe-36">
                    <img src="assets/images/home-nineteen/home-png.png" alt="Home Image" />
                </div>
            </div>
        </div>

    );
};

export default ExploreInner;