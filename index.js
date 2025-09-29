import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { convertToHLS } from "./utils/videoConverter.js";
import { UPLOAD_DIR, ALLOWED_ORIGIN, PORT } from "./config.js";
import upload from "./middleware/uploads.js";

const app = express();

app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/", (req, res) => res.json({ message: "Hello" }));

app.post("/upload", upload.single('file'), (req, res) => {
    const lessonId = uuidv4();
    const videoPath = req.file.path;
    const coursePath = path.join(UPLOAD_DIR, 'courses', lessonId);
    const hlsIndex = path.join(coursePath, 'index.m3u8');

    if (!fs.existsSync(coursePath)) {
        fs.mkdirSync(coursePath, { recursive: true });
    }

    convertToHLS({ inputPath: videoPath, outputPath: coursePath, hlsPath: hlsIndex }, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error converting video", error: err.message });
        }
        const videoUrl = `http://localhost:${PORT}/uploads/courses/${lessonId}/index.m3u8`;
        res.json({ message: "Video converted to HLS format", videoUrl, lessonId });
    });
});

// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
