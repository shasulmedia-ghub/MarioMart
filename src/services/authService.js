import api from "./api";
import API from "../constants/api";

const login = async ({ email, password }) => {
    try {
        console.log("Login request:", {
            email,
            password,
        });

        console.log(
            "API BASE URL:",
            import.meta.env.VITE_API_URL
        );

        console.log(
            "API LOGIN PATH:",
            API.AUTH.LOGIN
        );

        const response = await api.post(
            API.AUTH.LOGIN,
            {
                email,
                password,
            }
        );

        console.log(
            "Login response:",
            response.data
        );

        return response.data;

    } catch (error) {
        console.error(
            "Login API error:",
            error
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "Server response:",
            error.response?.data
        );

        throw error;
    }
};

const register = async ({
    name,
    email,
    password,
}) => {
    try {
        const response = await api.post(
            API.AUTH.REGISTER,
            {
                name,
                email,
                password,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Register API error:",
            error
        );

        throw error;
    }
};

const getProfile = async () => {
    try {
        const response = await api.get(
            API.AUTH.PROFILE
        );

        return response.data;

    } catch (error) {
        console.error(
            "Profile API error:",
            error
        );

        throw error;
    }
};

const authService = {
    login,
    register,
    getProfile,
};

export default authService;