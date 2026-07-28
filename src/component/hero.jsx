import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaTruck,
  FaLock,
  FaGift,
} from "react-icons/fa";
import "../App.css";
import mmlogo from "../assets/mm_logo/mariomart_logo.jpg";

const imgStyle = {
  height: "50px",
  width: "75px",
  borderRadius: "0%",
  margin: "10px"
};

function Hero() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg,#E52521,#FF7B00)",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="container">

          <div className="row align-items-center">

            {/* Left Side */}
            <div className="col-lg-6 text-white">

              <span className="badge bg-warning text-dark fs-6 mb-3">
            <img src={mmlogo} alt="MM_Logo" style={imgStyle} />
                Welcome to MarioMart
              </span>

              <h1
                className="display-3 fw-bold mb-4"
                style={{ lineHeight: "1.2" }}
              >
                Your Favourite
                <br />
                Gaming Store
              </h1>

              <p
                className="lead mb-4"
                style={{ maxWidth: "550px" }}
              >
                Discover authentic Mario collectibles,
                gaming accessories, toys, apparel,
                and exclusive merchandise with fast delivery
                across Singapore.
              </p>

              <div className="d-flex flex-wrap gap-3">

                <Link
                  to="/register"
                  className="btn btn-warning btn-lg fw-bold px-5"
                >
                  Start Shopping
                </Link>

                <Link
                  to="/pages/login"
                  className="btn btn-outline-light btn-lg px-5"
                >
                  Login
                </Link>

              </div>

            </div>

            {/* Right Side */}
            <div className="col-lg-6 text-center mt-5 mt-lg-0">

              <img
                src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80"
                alt="Mario Products"
                className="img-fluid rounded-4 shadow-lg"
                style={{
                  maxHeight: "500px",
                  objectFit: "cover",
                }}
              />

            </div>

          </div>

        </div>
      </section>

      {/* Feature Section */}

      <section className="py-5 bg-light">

        <div className="container">

          <div className="row g-4">

            <div className="col-md-3">

              <div className="card border-0 shadow h-100 text-center p-4">

                <FaShoppingBag
                  className="text-danger mx-auto mb-3"
                  size={45}
                />

                <h5 className="fw-bold">
                  Premium Products
                </h5>

                <p className="text-muted">
                  Official Mario merchandise and accessories.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow h-100 text-center p-4">

                <FaTruck
                  className="text-primary mx-auto mb-3"
                  size={45}
                />

                <h5 className="fw-bold">
                  Fast Delivery
                </h5>

                <p className="text-muted">
                  Islandwide shipping with secure packaging.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow h-100 text-center p-4">

                <FaLock
                  className="text-success mx-auto mb-3"
                  size={45}
                />

                <h5 className="fw-bold">
                  Secure Payment
                </h5>

                <p className="text-muted">
                  Protected checkout powered by encrypted payment gateways.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="card border-0 shadow h-100 text-center p-4">

                <FaGift
                  className="text-warning mx-auto mb-3"
                  size={45}
                />

                <h5 className="fw-bold">
                  Exclusive Rewards
                </h5>

                <p className="text-muted">
                  Earn loyalty points every time you shop.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

export default Hero;