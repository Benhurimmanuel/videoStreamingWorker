import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { UPLOAD_DIR } from "../config.js";

const allowedVideoTypes = [
    'video/mp4', 'video/avi', 'video/mkv', 'video/quicktime'
];
const maxFileSize = 1073741824; // 1 GB

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, UPLOAD_DIR),
    filename: (_, file, cb) =>
        cb(null, `file-${uuidv4()}${path.extname(file.originalname)}`)
});

const fileFilter = (_, file, cb) => {
    if (!allowedVideoTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only .mp4, .avi, .mkv, and .mov are allowed."), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize },
});

export default upload;
