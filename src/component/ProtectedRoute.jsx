import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

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

        : <Navigate to="/login" replace />;

}

export default ProtectedRoute;