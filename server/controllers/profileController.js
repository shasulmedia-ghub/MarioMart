const userDB = require("../../database/userQueries");
const { verifyToken } = require("../utils/jwt");
const { success, error } = require("../utils/apiResponse");

const getProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return error(res, "Access Denied: No Token Provided", 401);
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return error(res, "Invalid Token", 401);
        }

        const user = await userDB.getUserById(decoded.id);
        if (!user) {
            return error(res, "User not found", 404);
        }

        return success(res, "Profile Retrieved Successfully", user);
    } catch (err) {
        next(err);
    }
};

module.exports = getProfile;
