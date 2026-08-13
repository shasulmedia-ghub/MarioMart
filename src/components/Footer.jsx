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

//   const imgStyle = {
//   height: "50px",
//   width: "75px",
//   borderRadius: "0%",
//   margin: "10px",
// };

function Footer() {
  const year = new Date().getFullYear();

  return (
    // <footer className="bg-dark text-light mt-5">
    <footer className="mario-footer">

      {/* Main Footer */}
      <div className="container py-2">

        <div className="row">

          {/* Company */}
            <div className="col-lg-4 col-md-5 mb-4">

            <div className="mario-brand-logo">
              <img style={{width:"100px"}} src={mmlogo} alt="MM_Logo" />
             </div>


            <p className="mario-footer-credits"
               style={{ maxWidth: "100%" }} >
            {/* <p className="mario-footer-credits mt-3 text-secondary"> */}
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

          {/* Customer Service */}
          <div className="col-lg-3 col-md-6 mb-4">

            <h5 className="mario-footer-credits fs-6">
              Customer Service
            </h5>

            <ul className="list-unstyled text-secondary">

              <li className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
              >
                Help Centre
              </li>

          <li className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
              >
                Shipping Information
              </li>

          <li className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
              >
                Return Policy
              </li>

          <li className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
              >
                Privacy Policy
              </li>

          <li className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
              >
                Terms & Conditions
              </li>

            </ul>

          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6 mb-4">

            <h5 className="mario-footer-credits fs-6">
              Contact Us
            </h5>

            <p className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
            >
              <FaMapMarkerAlt className="me-2" />
              Singapore
            </p>

            <p className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
            >
              <FaPhoneAlt className="me-2" />
              +65 6123 4567
            </p>

            <p className="mario-footer-credits"
                   style={{ 
                    color: "Lightgray", 
                    textDecoration: "none", 
                    fontSize: "12px",
                    fontWeight: "normal"
                  }}
            >
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
          borderRadius: "20px",
          padding: "40px",
          marginLeft: "10px",
          marginRight: "10px"
        }}
      >

        <small className="mario-footer-credits fw-200">
          © {year} MarioMart. All Rights Reserved.
          <br />
          Capstone Project by Shahul, Johnny and YingTong
        </small>

      </div>

    </footer>
  );
}

export default Footer;