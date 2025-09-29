import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads"; // Import worker threads

const app = express();

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
app.use(cors({
    origin: ["http://localhost:8000"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({ message: "Hello" });
});

// POST route for video upload and conversion
app.post("/upload", upload.single('file'), (req, res) => {
    console.log('File uploaded');
    const lessonId = uuidv4();
    const videoPath = req.file.path;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Start the worker thread to handle ffmpeg
    const worker = new Worker(__filename, {
        workerData: {
            videoPath,
            outputPath,
            hlsPath
        }
    });

    worker.on('message', (message) => {
        console.log(message);
        const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;

        res.json({
            message: "Video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId
        });
    });

    worker.on('error', (error) => {
        console.error('Error in worker thread', error);
        res.status(500).json({ message: 'Error processing video' });
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});

// Worker thread logic (this will be executed in a separate thread)
if (!isMainThread) {
    const { videoPath, outputPath, hlsPath } = workerData;

    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            parentPort.postMessage({ error: `exec error: ${error}` });
            return;
        }
        parentPort.postMessage({ message: 'Video converted to HLS format' });
    });
}

app.listen(8000, () => {
    console.log("App listening on port 8000");
});
