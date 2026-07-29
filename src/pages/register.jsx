import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Layout from "../component/Layout";
import PageHeader from "../component/PageHeader";
import ROUTES from "../constants/routes";

function Register() {

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthday: "",
    address: "",
    marketing: false,
    terms: false,
  });

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log(formData);

    // Later:
    // authService.register(formData)

  };

  const passwordStrength = () => {
    const password = formData.password;

    if (password.length < 6)
      return {
        text: "Weak",
        color: "danger",
      };

    if (
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      password.length >= 8
    )
      return {
        text: "Strong",
        color: "success",
      };

    return {
      text: "Medium",
      color: "warning",
    };
  };

  const strength = passwordStrength();

  return (
    <Layout>

      <div
        className="container py-5"
        style={{ minHeight: "80vh" }}
      >
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">

                {/* <h2 className="text-center fw-bold text-danger mb-4">
                  Create Your MarioMart Account
                </h2> */}

                <PageHeader
                title="Create Account"
                subtitle="Join MarioMart today." />
                <br />

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        First Name
                      </label>

                      <input
                        type="text"
                        name="firstName"
                        className="form-control"
                        required
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Last Name
                      </label>

                      <input
                        type="text"
                        name="lastName"
                        className="form-control"
                        required
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row">

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Password
                      </label>

                      <div className="input-group">

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-control"
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

                      <small className={`text-${strength.color}`}>
                        Password Strength: {strength.text}
                      </small>

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        required
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Gender
                      </label>

                      <select
                        name="gender"
                        className="form-select"
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Gender
                        </option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer not to say</option>
                      </select>

                    </div>

                    <div className="col-md-6 mb-3">

                      <label className="form-label">
                        Date of Birth
                      </label>

                      <input
                        type="date"
                        name="birthday"
                        className="form-control"
                        required
                        onChange={handleChange}
                      />
                    </div>

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Address
                    </label>

                    <textarea
                      rows="3"
                      name="address"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-check mb-2">

                    <input
                      type="checkbox"
                      name="marketing"
                      className="form-check-input"
                      onChange={handleChange}
                    />

                    <label className="form-check-label">
                      Receive promotional emails and exclusive offers.
                    </label>

                  </div>

                  <div className="form-check mb-4">

                    <input
                      type="checkbox"
                      name="terms"
                      className="form-check-input"
                      required
                      onChange={handleChange}
                    />

                    <label className="form-check-label">
                      I agree to the Terms & Conditions.
                    </label>
                  </div>

                  <button
                    className="btn btn-danger w-100 btn-lg fw-bold"
                  >
                    Create Account
                  </button>
                </form>

                <div className="text-center mt-4">
                  Already have an account?

                  <Link
                    to={ROUTES.LOGIN}
                    className="ms-2 fw-bold text-decoration-none"
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