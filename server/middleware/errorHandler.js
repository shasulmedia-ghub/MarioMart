module.exports = (err, req, res, _next) => {

    console.error(err);

    return res.status(500).json({

        success: false,

        message: "Internal Server Error",

    });

};