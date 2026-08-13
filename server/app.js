const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* --------------------------
   CORS
-------------------------- */

// app.use(cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
// }));

/* --------------------------
   Middleware / body-parser
-------------------------- */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

/* --------------------------
   Routes / API Routes
-------------------------- */

app.use("/api/users", authRoutes);

/* --------------------------
   Health Check
-------------------------- */

app.get("/", (req, res) => {
    res.json({
        success: true,
        application: "MarioMart API",
        version: "1.0.0",
        status: "Running",
    });

});

/* --------------------------
   404
-------------------------- */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Not Found",
        path: req.originalUrl,
    });

});

app.use(errorHandler);

module.exports = app;