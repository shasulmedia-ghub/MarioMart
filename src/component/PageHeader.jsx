import { Link } from "react-router-dom";

function PageHeader({
    title,
    subtitle,
}) {

    return (
        <div
            className="py-5 text-white"
            style={{
                background:
                    "linear-gradient(90deg,#E52521,#FFB000)",
            }}
        >
            <div className="container">
                <h1 className="fw-bold">
                    {title}
                </h1>

                {subtitle && (
                    <h3 className="mb-0">
                        {subtitle}
                    </h3>

                )}

                <small>
                    <Link
                        to="/"
                        className="text-white text-decoration-none"
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