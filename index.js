import express from "express"
import cors from "cors"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import { exec } from "child_process"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

const app = express()

// File type and size validation
const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/quicktime']  // Add more allowed types if needed
const maxFileSize = 1073741824;  // 1 GB

// multer middleware with validation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use environment variable for the upload path
        cb(null, process.env.UPLOAD_DIR || './uploads')  // Fallback to './uploads' if not set
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    // Validate file type
    if (!allowedVideoTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only .mp4, .avi, .mkv, and .mov are allowed."), false)
    }
    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,  // File type validation
    limits: { fileSize: maxFileSize }  // File size validation
})

// CORS configuration from .env
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8000',  // Default to localhost:8000
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file serving for uploaded files
app.use("/uploads", express.static(process.env.UPLOAD_DIR || './uploads'))

app.get("/", (req, res) => {
    res.json({ message: "Hello" })
})

// Upload endpoint
app.post("/upload", upload.single('file'), (req, res) => {
    console.log('File uploaded')

    const lessonId = uuidv4()
    const videoPath = req.file.path
    const outputPath = path.join(process.env.UPLOAD_DIR || './uploads', 'courses', lessonId)
    const hlsPath = path.join(outputPath, 'index.m3u8')

    console.log({ hlsPath })

    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
    }

    // ffmpeg command for converting video to HLS format
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    // Execute the ffmpeg command
    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
            return res.status(500).json({ message: "Error converting video", error: error.message })
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)

        // Generate the URL for the converted video
        const videoUrl = `http://localhost:${process.env.PORT || 8000}/uploads/courses/${lessonId}/index.m3u8`

        // Respond with the video URL
        res.json({
            message: "Video converted to HLS format",
            videoUrl: videoUrl,
            lessonId: lessonId
        })
    })
})

// Error handling middleware for Multer validation errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer specific errors
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        // General errors (e.g., file type or size)
        return res.status(400).json({ message: err.message });
    }
    next();
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`App listening on port ${process.env.PORT || 8000}`)
})
