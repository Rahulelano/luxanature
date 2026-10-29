import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { loadUser } from "./lib/util.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import orderRoutes, { razorpayWebhook } from "./routes/orders.js";
import adminRoutes, { UPLOAD_DIR } from "./routes/admin.js";
import { seedIfEmpty } from "./seed.js";

for (const k of ["MONGODB_URI", "JWT_SECRET", "SMTP_USER", "SMTP_PASS"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k} in .env`);
    process.exit(1);
  }
}

const app = express();
app.set("trust proxy", 1);

// Webhook needs the raw body for signature checking, so it goes before express.json().
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(loadUser);

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", catalogRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// In production the same server also serves the built frontend.
const dist = path.resolve(process.cwd(), "dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || (err.code === "LIMIT_FILE_SIZE" ? 400 : err.name === "CastError" ? 400 : 500);
  if (status >= 500) console.error(err);
  const message =
    err.code === "LIMIT_FILE_SIZE"
      ? "Image must be under 5 MB"
      : err.code === 11000
        ? "That name/slug already exists"
        : status >= 500
          ? "Something went wrong"
          : err.message;
  res.status(err.code === 11000 ? 400 : status).json({ error: message });
});

const PORT = Number(process.env.PORT) || 5331;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
