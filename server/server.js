require("dotenv").config();

const app = require("../backend");

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🍄 MarioMart API");
  console.log(`🚀 http://localhost:${PORT}`);
  console.log("=================================");
});