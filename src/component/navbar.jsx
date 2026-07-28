import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

// Optional logo
// import Logo from "../assets/logo/mariomart-logo.png";

function Navbar() {

  const navigate = useNavigate();

  const {

    user,

    logout,

    isAuthenticated,

  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow sticky-top">

      <div className="container">

        {/* Logo */}

        <Link className="navbar-brand fw-bold fs-3" to="/">
          🍄 MarioMart
        </Link>

        {/*
        <Link className="navbar-brand" to="/">
            <img src={Logo} height="50" alt="MarioMart"/>
        </Link>
        */}

        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >

          <ul className="navbar-nav me-auto">

            <li className="nav-item">

              <NavLink
                className="nav-link"
                to="/"
              >
                Home
              </NavLink>

            </li>

            {isAuthenticated && (

              <li className="nav-item">

                <NavLink
                  className="nav-link"
                  to="/pages/dashboard"
                >
                  Dashboard
                </NavLink>

              </li>

            )}

          </ul>

          <ul className="navbar-nav align-items-center">

            {isAuthenticated ? (

              <>

                <li className="nav-item me-3">

                  <NavLink
                    className="nav-link"
                    to="/cart"
                  >
                    <FaShoppingCart size={20} />
                  </NavLink>

                </li>

                <li className="nav-item dropdown">

                  <a
                    href="#!"
                    className="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <FaUserCircle size={20} />

                    <span className="ms-2">

                      {user.first_name}

                    </span>

                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">

                    <li>

                      <NavLink
                        className="dropdown-item"
                        to="/pages/dashboard"
                      >
                        Dashboard
                      </NavLink>

                    </li>

                    <li>

                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>

                    </li>

                  </ul>

                </li>

              </>

            ) : (

              <>

                <li className="nav-item">

                  <NavLink
                    className="nav-link"
                    to="/pages/login"
                  >
                    Login
                  </NavLink>

                </li>

                <li className="nav-item ms-3">

                  <NavLink
                    className="btn btn-warning fw-bold px-4"
                    to="/pages/register"
                  >
                    Register
                  </NavLink>

                </li>

              </>

            )}

          </ul>

        </div>

      </div>

    </nav>

  );

}

export default Navbar;