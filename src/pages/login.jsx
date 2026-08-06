import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Layout from "../component/Layout";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";
import authService from "../services/authService";

import "../App.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // ----------------------------------------
    // HANDLE INPUT CHANGES
    // ----------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    // ----------------------------------------
    // HANDLE LOGIN
    // ----------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            console.log("Submitting login:", formData);

            // Send login request to API
            const response = await authService.login({
                email: formData.email,
                password: formData.password,
            });

            console.log("Login successful:", response);

            // ----------------------------------------
            // NORMALISE API RESPONSE
            // ----------------------------------------

            const loginData = response?.data || response;

            console.log("Login data:", loginData);

            // ----------------------------------------
            // GET USER
            // ----------------------------------------

            const user =
                loginData?.user ||
                loginData?.data?.user;

            // ----------------------------------------
            // GET TOKEN
            // ----------------------------------------

            const token =
                loginData?.token ||
                loginData?.accessToken ||
                loginData?.data?.token ||
                loginData?.data?.accessToken;

            console.log("Authenticated user:", user);
            console.log("Authentication token:", token);

            // ----------------------------------------
            // VALIDATE TOKEN
            // ----------------------------------------

            if (!token) {
                throw new Error(
                    "Login succeeded, but no authentication token was returned by the server."
                );
            }

            // ----------------------------------------
            // VALIDATE USER
            // ----------------------------------------

            if (!user) {
                throw new Error(
                    "Login succeeded, but no user information was returned by the server."
                );
            }

            // ----------------------------------------
            // SAVE AUTHENTICATION
            // ----------------------------------------

            login(user, token);

            console.log(
                "Authentication completed successfully."
            );

            // ----------------------------------------
            // REDIRECT
            // ----------------------------------------

            navigate(ROUTES.DASHBOARD);

        } catch (err) {
            console.error("Login error:", err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Login failed. Please check your email and password.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------
    // PAGE
    // ----------------------------------------

    return (
        <Layout>
            <div
                className="app-container py-4"
                style={{ minHeight: "50vh" }}
            >
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 col-sm-10">
                        <div className="mario-form-card shadow border rounded-4">
                            <div className="card-body p-4">

                                <h2
                                    className="mario-form-title text-danger fw-bold mb-4"
                                    style={{
                                        fontSize: "2rem",
                                        fontWeight: "800",
                                    }}
                                >
                                    Welcome Back
                                </h2>

                                {/* ERROR MESSAGE */}

                                {error && (
                                    <div
                                        className="alert alert-danger text-center mb-3"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* LOGIN FORM */}

                                <form onSubmit={handleSubmit}>

                                    {/* EMAIL */}

                                    <div className="mb-3">
                                        <label
                                            className="mario-form-label"
                                            htmlFor="email"
                                        >
                                            Email Address
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>

                                    {/* PASSWORD */}

                                    <div className="mb-3">
                                        <label
                                            className="mario-form-label"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>

                                        <div className="input-group">
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className="form-control"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showPassword ? (
                                                    <FaEyeSlash />
                                                ) : (
                                                    <FaEye />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* REMEMBER / FORGOT PASSWORD */}

                                    <div className="d-flex justify-content-between align-items-center mb-4">

                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="rememberMe"
                                            />

                                            <label
                                                className="mario-form-label"
                                                htmlFor="rememberMe"
                                            >
                                                Remember Me
                                            </label>
                                        </div>

                                        <Link
                                            to={ROUTES.FORGOT_PASSWORD}
                                            className="mario-form-label text-decoration-none"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    {/* LOGIN BUTTON */}

                                    <button
                                        type="submit"
                                        className="btn btn-danger btn-lg w-100 text-white fw-bold"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Logging in..."
                                            : "Login"}
                                    </button>

                                </form>

                                {/* REGISTER */}

                                <div className="mario-form-label text-center mt-4">
                                    Don't have an account?

                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="mario-form-label fw-bold text-decoration-none ms-2 text-danger"
                                    >
                                        Register
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Login;
