import "reflect-metadata";
import express from "express";
import cors from "cors";
import routes from "./src/router/router.js";
import db from "./src/config/index.js";
import "./src/config/dependencyConfig.js";
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use("/api", routes);

const server = app.listen(PORT, async () => {
  try {
    await db.connectDB();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  await db.closeConn();
  server.close(() => {
    console.log("Server and DB connection closed");
    process.exit(0);
  });
});
