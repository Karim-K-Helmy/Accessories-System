import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { ensureInitialAdmin } from "./services/ensureInitialAdmin.js";

const app = express();
const port = Number(process.env.PORT || 5000);

configureCloudinary();

const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");
  if (configuredOrigins.includes(normalizedOrigin)) return true;

  if (process.env.NODE_ENV !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
  }

  return false;
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mobile-accessories-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings", settingsRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  await ensureInitialAdmin();

  app.listen(port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
