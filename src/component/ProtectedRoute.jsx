import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

    const {

        isAuthenticated,

        loading,

    } = useAuth();

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center vh-100"
            >

                <div className="spinner-border text-danger">

                </div>

            </div>

        );

    }

    return isAuthenticated

        ? children

        : <Navigate to="/login" replace />;

}

export default ProtectedRoute;