const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController");
const loginController = require("../controllers/loginController");
const profileController = require("../controllers/profileController");

/* ===========================
   Register
=========================== */
router.post(
    "/register",
    registerController
);

/* ===========================
   Login
=========================== */
router.post(
    "/login",
    loginController
);

/* ===========================
   Profile
=========================== */
router.get(
    "/profile",
    profileController
);

module.exports = router;