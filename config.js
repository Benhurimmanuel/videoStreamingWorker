import dotenv from "dotenv";
dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:8000';
const PORT = process.env.PORT || 8000;

export { UPLOAD_DIR, ALLOWED_ORIGIN, PORT };
