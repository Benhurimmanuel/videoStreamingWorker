# Video Upload and HLS Conversion API

This Express-based server application allows users to upload video files. Upon successful upload, the video is converted to HLS (HTTP Live Streaming) format using `ffmpeg`. The application then provides a URL for the HLS stream, which can be embedded for playback.

## Features

- **File Upload**: Supports video file uploads with validation.
- **Video Conversion**: Converts videos to HLS format using `ffmpeg`.
- **Video Streaming**: Provides a playable HLS stream via a `.m3u8` playlist and `.ts` video segments.
- **Static File Serving**: Serves the uploaded video files as static assets.

---

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [File Upload Validation](#file-upload-validation)
- [Production Setup](#production-setup)
- [To-Do](#to-do)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [ffmpeg](https://ffmpeg.org/download.html) (for video conversion)
- A code editor (e.g., [VS Code](https://code.visualstudio.com/))

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Benhurimmanuel/videoStreamingWorker.git
Install dependencies:

bash
Copy code
npm install
Set up environment variables:

Create a .env file in the root of your project and add the following configuration:

ini
Copy code
PORT=8000
UPLOAD_DIR=./uploads
ALLOWED_ORIGIN=http://localhost:8000
Run the application:

bash
Copy code
npm start
The server will start on port 8000 (or any port defined in the .env file).

API Endpoints
1. POST /upload
This endpoint allows you to upload a video file, which will then be converted to HLS format.

Request Body:

file: The video file to upload (multipart form-data).

Response:

json
Copy code
{
  "message": "Video converted to HLS format",
  "videoUrl": "http://localhost:8000/uploads/courses/{lessonId}/index.m3u8",
  "lessonId": "{lessonId}"
}
Error Responses:

400: Bad request (e.g., invalid file type or size).

500: Internal server error.

File Upload Validation
The server validates uploaded video files by checking the MIME type and extension. Only the following formats are allowed:

.mp4

.mov

.avi

.mkv

Additionally, the file size is limited to a maximum size of 1GB (configurable via the .env file).

Production Setup
To deploy this application in a production environment, consider the following:

1. Dockerize the Application
To easily deploy your app, you can create a Dockerfile:

dockerfile
Copy code
# Use the official Node.js runtime as a parent image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 8000

# Command to run the app
CMD ["npm", "start"]
2. Background Video Conversion
Consider using a background job queue to process video conversion tasks asynchronously (e.g., using Bull).

3. Log Management
Integrate a logging solution (e.g., Winston or Morgan) to provide structured logging in production.

4. Cloud Storage for Videos
In a production environment, you might want to store video files in cloud storage (e.g., Amazon S3, Google Cloud Storage) for better scalability and availability.

