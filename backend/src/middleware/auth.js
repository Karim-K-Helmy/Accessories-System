import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-password");

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}
