import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Layout from "../component/Layout";

import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        // Temporary Login

        const demoUser = {

            id: 1,

            first_name: "Mario",

            last_name: "Customer",

            email: formData.email,

            role: "customer",

        };

        const fakeJWT = "demo-token";

        login(demoUser, fakeJWT);

        navigate("/pages/dashboard");

    };

    return (

        <>

            <Layout>

            <div
                className="container py-5"
                style={{ minHeight: "80vh" }}
            >

                <div className="row justify-content-center">

                    <div className="col-lg-5">

                        <div className="card shadow-lg border-0 rounded-4">

                            <div className="card-body p-5">

                                <h2 className="text-center text-danger fw-bold mb-4">

                                    Welcome Back

                                </h2>

                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Email Address

                                        </label>

                                        <input

                                            type="email"

                                            className="form-control"

                                            name="email"

                                            required

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div className="mb-3">

                                        <label className="form-label">

                                            Password

                                        </label>

                                        <div className="input-group">

                                            <input

                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }

                                                className="form-control"

                                                name="password"

                                                required

                                                onChange={handleChange}

                                            />

                                            <button

                                                type="button"

                                                className="btn btn-outline-secondary"

                                                onClick={() =>
                                                    setShowPassword(!showPassword)
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

                                    <div className="d-flex justify-content-between mb-4">

                                        <div className="form-check">

                                            <input

                                                className="form-check-input"

                                                type="checkbox"

                                            />

                                            <label className="form-check-label">

                                                Remember Me

                                            </label>

                                        </div>

                                        <Link
                                            to="#"
                                            className="text-decoration-none"
                                        >

                                            Forgot Password?

                                        </Link>

                                    </div>

                                    <button
                                        className="btn btn-danger btn-lg w-100"
                                    >

                                        Login

                                    </button>

                                </form>

                                <div className="text-center mt-4">

                                    Don't have an account?

                                    <Link
                                        to="/pages/register"
                                        className="fw-bold text-decoration-none ms-2"
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

        </>

    );

}

export default Login;