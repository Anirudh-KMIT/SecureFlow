import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "local_dev_secret";  // SAME AS authController

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
