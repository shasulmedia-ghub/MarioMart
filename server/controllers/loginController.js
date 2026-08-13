const bcrypt = require("bcrypt");

const userDB = require("../../database/userQueries");
const { success, error } = require("../utils/apiResponse");
// const { generateToken } = require("../utils/jwt");

const login = async (req, res, next) => {
    try {
        const {
            email,
            password,
        } = req.body;

  /* =====================
        Validation
    ===================== */


        if (!email || !password) {
            return error(
                res,
                "Email and Password are required.",
                400
            );
        }

    /* =====================
        Find User
    ===================== */

        const user =
            await userDB.getUserByEmail(email);

        if (!user) {
            return error(
                res,
                "Invalid Email or Password",
                401
            );

        }

        /* =====================
           Compare Password
        ===================== */

        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!validPassword) {
            return error(
                res,
                "Invalid Email or Password",
                401
            );
        }

        /* =====================
           update last login 
        ===================== */

        await userDB.updateLastLogin(user.id);


        /* =====================
           Remove Password Hash
        ===================== */

        // delete user.password_hash;
        // const token = generateToken(user);
        // return success(
        //     res,
        //     "Login Successful",
        //     {
        //         user,
        //         token
        //     }
        // );
    }

    catch (err) {
        next(err);
    }
};

module.exports = login;