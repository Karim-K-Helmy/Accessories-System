import User from "../models/User.js";
import { signToken } from "../utils/token.js";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function login(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "اكتب البريد الإلكتروني وكلمة المرور." });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
  }

  res.json({
    token: signToken(user._id.toString()),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function changePassword(req, res) {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "اكتب كلمة المرور الحالية وكلمة المرور الجديدة."
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف."
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "حساب الإدارة غير موجود." });
  }

  const currentPasswordIsCorrect = await user.comparePassword(currentPassword);
  if (!currentPasswordIsCorrect) {
    return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة." });
  }

  const passwordIsUnchanged = await user.comparePassword(newPassword);
  if (passwordIsUnchanged) {
    return res.status(400).json({
      message: "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية."
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    message: "تم تغيير كلمة المرور بنجاح.",
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}
