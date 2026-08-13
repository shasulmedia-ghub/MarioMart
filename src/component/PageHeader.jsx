import { Link } from "react-router-dom";

function PageHeader({
    title,
    subtitle,
}) {

    return (
        <div
            className="mario-header py-4 text-white"
            style={{
                background:
                    "linear-gradient(90deg,#E52521,#FFB000)",
            }}
        >
            <div className="container"
            
            >
                <h1 className="mario-brand fw-bold fs-2">
                    {title}
                </h1>

                {subtitle && (
                    <h3 className="mario-nav-link fs-5 mb-0 fw-bold">
                        {subtitle}
                    </h3>

                )}

                <small className="mario-nav-link" >
                    <Link
                        to="/"
                        className="mario-nav-link text-white text-decoration-none"
                    >
                        Home
                    </Link>

                    {" / "}
                    {title}
                </small>

            </div>
        </div>

    );

}

export default PageHeader;