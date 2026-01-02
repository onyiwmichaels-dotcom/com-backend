import express from "express";

const router = express.Router();

const ADMIN_PIN = process.env.ADMIN_PIN || "WalterPIN2025";

// --- ADMIN LOGIN ---
router.post("/login", (req, res) => {
  const { pin } = req.body;

  if (!pin) return res.status(400).json({ error: "PIN is required" });

  if (pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Invalid PIN" });
  }

  return res.json({ success: true, message: "Login successful" });
});

export default router;
