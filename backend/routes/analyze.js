import express from "express";
import multer from "multer";
import fs from "fs";
import { extractTextFromPDF } from "../utils/extractText.js";
import { analyzeResume } from "../utils/analyzeWithAI.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const text = await extractTextFromPDF(filePath);
    const analysis = await analyzeResume(text);

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resume analysis failed"
    });
  }
});

export default router;
