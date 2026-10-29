import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/index.js";

export const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/* ---------------------------------- Auth ----------------------------------- */
const COOKIE = "luxa_token";

export function setAuthCookie(res, user) {
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE);
}

export const loadUser = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id);
      if (user && !user.blocked) req.user = user;
    } catch {
      /* invalid / expired token → treated as logged out */
    }
  }
  next();
});

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in"));
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in"));
  if (req.user.role !== "admin") return next(new HttpError(403, "Admin only"));
  next();
}

export const isAdminEmail = (email) =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

/* ---------------------------------- Mail ----------------------------------- */
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, fromName = "Luxa Naturals" }) {
  return getTransporter().sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export function mailLayout(businessName, inner) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e8e1cc;border-radius:12px;overflow:hidden">
    <div style="background:#1f3320;color:#D4AF37;padding:18px 24px;font-size:20px;font-weight:bold">${businessName}</div>
    <div style="padding:24px;color:#1C1C1C;font-size:14px;line-height:1.6">${inner}</div>
    <div style="background:#F5F2E8;padding:12px 24px;font-size:11px;color:#777">© ${new Date().getFullYear()} ${businessName}</div>
  </div>`;
}
