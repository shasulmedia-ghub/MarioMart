/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import storage from "../utils/storage";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --------------------------------------------------
    // CHECK EXISTING LOGIN
    // --------------------------------------------------

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = storage.getToken();
                const storedUser = storage.getUser();

                console.log(
                    "Stored token:",
                    token
                );

                console.log(
                    "Stored user:",
                    storedUser
                );

                // No token means user is not logged in
                if (!token) {
                    setUser(null);
                    return;
                }

                // Restore stored user immediately
                if (storedUser) {
                    setUser(storedUser);
                }

                // Verify token with backend
                const response =
                    await authService.profile();

                console.log(
                    "Profile response:",
                    response
                );

                const updatedUser =
                    response?.data?.user ||
                    response?.user ||
                    response?.data;

                if (updatedUser) {
                    setUser(updatedUser);
                    storage.saveUser(updatedUser);
                }

            } catch (err) {
                console.error(
                    "Token verification failed:",
                    err
                );

                storage.clearAuth();
                setUser(null);

            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    const login = (userData, token) => {

        console.log(
            "AuthContext login()"
        );

        console.log(
            "User:",
            userData
        );

        console.log(
            "Token:",
            token
        );

        if (!token) {
            console.error(
                "Login failed: No authentication token received."
            );

            return false;
        }

        if (!userData) {
            console.error(
                "Login failed: No user data received."
            );

            return false;
        }

        // Save authentication information
        storage.saveToken(token);
        storage.saveUser(userData);

        // Update React authentication state
        setUser(userData);

        console.log(
            "Authentication state updated."
        );

        return true;
    };

    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    const logout = () => {
        console.log(
            "Logging out..."
        );

        storage.clearAuth();

        setUser(null);
    };

    // --------------------------------------------------
    // AUTHENTICATION STATUS
    // --------------------------------------------------

    const isAuthenticated =
        !!user;

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

// --------------------------------------------------
// USE AUTH HOOK
// --------------------------------------------------

export const useAuth = () =>
    useContext(AuthContext);

export default AuthContext;
