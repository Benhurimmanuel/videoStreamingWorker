import { exec } from "child_process";


export function convertToHLS({ inputPath, outputPath, hlsPath }, callback) {
    const ffmpegPath = "C:\\ffmpeg\\bin\\ffmpeg.exe";

    const command = `"${ffmpegPath}" -i "${inputPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod ` +
        `-hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;

    exec(command, callback);
}
