import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

function Navbar() {

  // Change this to true after login
  const isLoggedIn = false;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm sticky-top">
      <div className="container">

        {/* Logo */}
        <Link className="section-title" to="/">
          🍄 Welcome to MarioMart
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">

          {/* Left Menu */}
          <ul className="navbar-nav me-auto">

            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/"
              >
                Home
              </NavLink>
            </li>

            {isLoggedIn && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/dashboard"
                >
                  Dashboard
                </NavLink>
              </li>
            )}

          </ul>

          {/* Right Menu */}
          <ul className="navbar-nav align-items-center">

            {isLoggedIn ? (
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
                    className="nav-link dropdown-toggle"
                    href="#!"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <FaUserCircle size={24} /> My Account
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end">

                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/dashboard"
                      >
                        Dashboard
                      </NavLink>
                    </li>

                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/profile"
                      >
                        Profile
                      </NavLink>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <NavLink
                        className="dropdown-item text-danger"
                        to="/logout"
                      >
                        Logout
                      </NavLink>
                    </li>

                  </ul>

                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/login"
                  >
                    Login
                  </NavLink>
                </li>

                <li className="nav-item ms-2">
                  <NavLink
                    className="btn btn-warning text-dark fw-bold px-4"
                    to="/register"
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