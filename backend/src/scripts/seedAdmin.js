import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { ensureInitialAdmin } from "../services/ensureInitialAdmin.js";

async function seedAdmin() {
  await connectDatabase();
  const result = await ensureInitialAdmin();

  if (!result.created) {
    console.log("No changes made. An admin account already exists.");
  }
}

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
