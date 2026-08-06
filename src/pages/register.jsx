 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Layout from "../component/Layout";
import PageHeader from "../component/PageHeader";
import ROUTES from "../constants/routes";
import authService from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        marketingOptIn: false,
        terms: false,
    });

    // --------------------------------------------------
    // HANDLE FORM CHANGES
    // --------------------------------------------------

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // --------------------------------------------------
    // HANDLE REGISTRATION
    // --------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // Password confirmation
        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        // Terms & Conditions
        if (!formData.terms) {
            setError(
                "Please agree to the Terms & Conditions."
            );
            return;
        }

        try {
            const userData = {
                firstName:
                    formData.firstName,

                lastName:
                    formData.lastName,

                email:
                    formData.email,

                password:
                    formData.password,

                dateOfBirth:
                    formData.dateOfBirth,

                gender:
                    formData.gender,

                address:
                    formData.address,

                marketingOptIn:
                    formData.marketingOptIn,
            };

            console.log(
                "Registration request:",
                userData
            );

            const response =
                await authService.register(
                    userData
                );

            console.log(
                "Registration successful:",
                response
            );

            alert(
                response?.message ||
                "Registration successful!"
            );

            navigate(
                ROUTES.LOGIN
            );

        } catch (err) {
            console.error(
                "Registration error:",
                err
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Registration failed";

            setError(message);
        }
    };

    // --------------------------------------------------
    // PASSWORD STRENGTH
    // --------------------------------------------------

    const passwordStrength = () => {
        const password =
            formData.password;

        if (password.length < 6) {
            return {
                text: "Weak",
                color: "danger",
            };
        }

        if (
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            password.length >= 8
        ) {
            return {
                text: "Strong",
                color: "success",
            };
        }

        return {
            text: "Medium",
            color: "warning",
        };
    };

    const strength =
        passwordStrength();

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <Layout>

            <div
                className="py-3"
                style={{
                    minHeight: "80vh",
                }}
            >

                <div className="row justify-content-center">

                    <div className="col-lg-6 col-md-7">

                        <div className="mario-form-card shadow-lg border-1 solid rounded-10">

                            <div className="card-body p-3">

                                <PageHeader
                                    title="Create Account"
                                    subtitle="Join MarioMart today."
                                />

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    {/* ERROR MESSAGE */}

                                    {error && (
                                        <div className="alert alert-danger text-center mb-3">
                                            {error}
                                        </div>
                                    )}

                                    {/* FIRST / LAST NAME */}

                                    <div className="row">

                                        <div className="col-md-6 mb-3">

                                            <label
                                                className="mario-form-label"
                                                htmlFor="firstName"
                                            >
                                                First Name
                                            </label>

                                            <input
                                                id="firstName"
                                                type="text"
                                                name="firstName"
                                                className="form-control"
                                                value={
                                                    formData.firstName
                                                }
                                                required
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label
                                                className="mario-form-label"
                                                htmlFor="lastName"
                                            >
                                                Last Name
                                            </label>

                                            <input
                                                id="lastName"
                                                type="text"
                                                name="lastName"
                                                className="form-control"
                                                value={
                                                    formData.lastName
                                                }
                                                required
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

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
                                            name="email"
                                            className="form-control"
                                            value={
                                                formData.email
                                            }
                                            required
                                            autoComplete="email"
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* PASSWORD */}

                                    <div className="row">

                                        <div className="col-md-6 mb-3">

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
                                                    name="password"
                                                    className="form-control"
                                                    value={
                                                        formData.password
                                                    }
                                                    required
                                                    autoComplete="new-password"
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (
                                                                previous
                                                            ) =>
                                                                !previous
                                                        )
                                                    }
                                                >

                                                    {showPassword ? (
                                                        <FaEyeSlash />
                                                    ) : (
                                                        <FaEye />
                                                    )}

                                                </button>

                                            </div>

                                            <small
                                                className={`text-${strength.color}`}
                                            >
                                                Password Strength:{" "}
                                                {strength.text}
                                            </small>

                                        </div>

                                        {/* CONFIRM PASSWORD */}

                                        <div className="col-md-6 mb-3">

                                            <label
                                                className="mario-form-label"
                                                htmlFor="confirmPassword"
                                            >
                                                Confirm Password
                                            </label>

                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                name="confirmPassword"
                                                className="form-control"
                                                value={
                                                    formData.confirmPassword
                                                }
                                                required
                                                autoComplete="new-password"
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* GENDER / DATE OF BIRTH */}

                                    <div className="row">

                                        <div className="col-md-6 mb-3">

                                            <label
                                                className="mario-form-label"
                                                htmlFor="gender"
                                            >
                                                Gender
                                            </label>

                                            <select
                                                id="gender"
                                                name="gender"
                                                className="form-select"
                                                value={
                                                    formData.gender
                                                }
                                                required
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="">
                                                    Select Gender
                                                </option>

                                                <option value="Male">
                                                    Male
                                                </option>

                                                <option value="Female">
                                                    Female
                                                </option>

                                                <option value="Prefer not to say">
                                                    Prefer not to say
                                                </option>

                                            </select>

                                        </div>

                                        <div className="col-md-6 mb-3">

                                            <label
                                                className="mario-form-label"
                                                htmlFor="dateOfBirth"
                                            >
                                                Date of Birth
                                            </label>

                                            <input
                                                id="dateOfBirth"
                                                type="date"
                                                name="dateOfBirth"
                                                className="form-control"
                                                value={
                                                    formData.dateOfBirth
                                                }
                                                required
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* ADDRESS */}

                                    <div className="mb-3">

                                        <label
                                            className="mario-form-label"
                                            htmlFor="address"
                                        >
                                            Address
                                        </label>

                                        <textarea
                                            id="address"
                                            rows="3"
                                            name="address"
                                            className="form-control"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                    {/* MARKETING */}

                                    <div className="form-check mb-2">

                                        <input
                                            id="marketingOptIn"
                                            type="checkbox"
                                            name="marketingOptIn"
                                            className="form-check-input"
                                            checked={
                                                formData.marketingOptIn
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <label
                                            className="mario-form-label"
                                            htmlFor="marketingOptIn"
                                        >
                                            Receive promotional emails
                                            and exclusive offers.
                                        </label>

                                    </div>

                                    {/* TERMS */}

                                    <div className="form-check mb-4">

                                        <input
                                            id="terms"
                                            type="checkbox"
                                            name="terms"
                                            className="form-check-input"
                                            checked={
                                                formData.terms
                                            }
                                            required
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <label
                                            className="mario-form-label"
                                            htmlFor="terms"
                                        >
                                            I agree to the Terms &
                                            Conditions.
                                        </label>

                                    </div>

                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        className="
                                            mario-form-label
                                            btn
                                            btn-danger
                                            w-100
                                            btn-lg
                                            fw-bold
                                        "
                                        style={{
                                            color: "white",
                                        }}
                                    >
                                        Create Account
                                    </button>

                                </form>

                                {/* LOGIN LINK */}

                                <div
                                    className="mario-form-label"
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "12px",
                                    }}
                                >

                                    Already have an account?

                                    <Link
                                        to={
                                            ROUTES.LOGIN
                                        }
                                        className="
                                            mario-form-label
                                            ms-2
                                            fw-bold
                                            text-decoration-none
                                        "
                                        style={{
                                            color: "red",
                                        }}
                                    >
                                        Login Here
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

export default Register;
