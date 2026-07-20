import User from "../models/User.js";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateInitialAdminCredentials({ email, password }) {
  if (!email) {
    throw new Error(
      "ADMIN_EMAIL is required in backend/.env because no admin account exists yet."
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("ADMIN_EMAIL in backend/.env is not a valid email address.");
  }

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is required in backend/.env because no admin account exists yet."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD in backend/.env must contain at least 8 characters.");
  }
}

/**
 * Creates the first admin automatically from environment variables.
 *
 * Important:
 * - Runs safely on every backend start.
 * - Creates an account only when there is no admin in MongoDB.
 * - Never resets or overwrites an existing admin password.
 */
export async function ensureInitialAdmin() {
  const existingAdmin = await User.findOne({ role: "admin" }).select("_id email").lean();

  if (existingAdmin) {
    console.log(`Admin account ready: ${existingAdmin.email}`);
    return { created: false, admin: existingAdmin };
  }

  const name = String(process.env.ADMIN_NAME || "Store Admin").trim() || "Store Admin";
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || "");

  validateInitialAdminCredentials({ email, password });

  const emailOwner = await User.findOne({ email });
  if (emailOwner) {
    emailOwner.name = name;
    emailOwner.role = "admin";
    emailOwner.password = password;
    await emailOwner.save();

    console.log(`Existing user promoted to initial admin: ${email}`);
    return { created: true, admin: emailOwner };
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "admin"
  });

  console.log(`Initial admin created automatically: ${email}`);
  return { created: true, admin };
}
