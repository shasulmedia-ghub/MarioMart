import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import "../App.css";
import mmlogo from "../assets/mm_logo/mariomart_logo.jpg";

  const imgStyle = {
  height: "50px",
  width: "75px",
  borderRadius: "0%",
  margin: "10px",
};

function Footer() {
  const year = new Date().getFullYear();

  return (
    // <footer className="bg-dark text-light mt-5">
    <footer className="mario-footer">

      {/* Main Footer */}
      <div className="container py-5">

        <div className="row">

          {/* Company */}
            <div className="col-lg-4 col-md-6 mb-4">


            <h3 className="mario-brand">
            {/* < className="fw-bold text-warning"> */}
                        <img src={mmlogo} alt="MM_Logo" style={imgStyle} />
                        MarioMart
            </h3>

            <p className="mario-footer-credits">
            {/* <p className="mt-3 text-secondary"> */}
              MarioMart is your trusted online destination for apparel
              merchandise and accessories.
            </p>

            <div className="d-flex gap-3 fs-4 mt-4">

              <a
                href="https://facebook.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebook />
              </a>

              <a
                href="https://instagram.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>

              <a
                href="https://linkedin.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://youtube.com"
                className="text-light"
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
              </a>

            </div>

          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">

            {/* <h5 className="text-warning mb-3"> */}
            <h5 className="mario-footer-credits">
              Quick Links
            </h5>

            <ul className="list-unstyled">

              <li className="mario-footer-credits">
              {/* <li className="mb-2"> */}
                <Link
                  to="/"
                  className="text-decoration-none text-secondary"
                >
                  Home
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/pages/login"
                  className="text-decoration-none text-secondary"
                >
                  Login
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/pages/register"
                  className="text-decoration-none text-secondary"
                >
                  Register
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/pages/dashboard"
                  className="text-decoration-none text-secondary"
                >
                  Dashboard
                </Link>
              </li>

            </ul>

          </div>

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6 mb-4">

            <h5 className="text-warning mb-3">
              Customer Service
            </h5>

            <ul className="list-unstyled text-secondary">

              <li className="mb-2">
                Help Centre
              </li>

              <li className="mb-2">
                Shipping Information
              </li>

              <li className="mb-2">
                Return Policy
              </li>

              <li className="mb-2">
                Privacy Policy
              </li>

              <li className="mb-2">
                Terms & Conditions
              </li>

            </ul>

          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6 mb-4">

            <h5 className="text-warning mb-3">
              Contact Us
            </h5>

            <p className="text-secondary">
              <FaMapMarkerAlt className="me-2" />
              Singapore
            </p>

            <p className="text-secondary">
              <FaPhoneAlt className="me-2" />
              +65 6123 4567
            </p>

            <p className="text-secondary">
              <FaEnvelope className="me-2" />
              support@mariomart.com
            </p>

          </div>

        </div>

      </div>

      {/* Bottom Footer */}
      <div
        className="text-center py-3"
        style={{
          backgroundColor: "#111",
          borderTop: "1px solid #444",
        }}
      >

        <small className="text-secondary">
          © {year} MarioMart. All Rights Reserved.
          <br />
          Capstone Project by Shahul, Johnny and YingTong
        </small>

      </div>

    </footer>
  );
}

export default Footer;