import { Link } from "react-router-dom";

function NotFound() {

    return (

        <div
            className="container text-center"
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >

            <div>

                <h1
                    className="display-1 fw-bold text-danger"
                >

                    404

                </h1>

                <h2>

                    Oops!

                </h2>

                <p className="text-muted">

                    The page you requested doesn't exist.

                </p>

                <Link
                    to="/"
                    className="btn btn-danger btn-lg"
                >

                    Back to Home

                </Link>

            </div>

        </div>

    );

}

export default NotFound;