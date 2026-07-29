import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import ROUTES from "../constants/routes";

function ProtectedRoute({ children }) {

    const {
        isAuthenticated,
        loading,
    } = useAuth();

  if (loading) {
    return (
        <LoadingSpinner
            message="Authenticating..."
        />

    );
}

    return isAuthenticated
        ? children
        : <Navigate to={ROUTES.LOGIN} replace />;

}

export default ProtectedRoute;