const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path"); // Import the path module

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Serve the video file
app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // Get video stats (about 61MB)
  const videoPath = "output.mp4";
  const videoSize = fs.statSync("output.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // Create a video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.get("/download", (req, res) => {
  const videoFilePath = path.join(__dirname, "output.mp4");
  res.download(videoFilePath, "output.mp4", (err) => {
    if (err) {
      res.status(500).send("Error downloading the video.");
    }
  });
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

// Serve the subtitles file
// app.get("/subtitles.vtt", function (req, res) {
//   // Read and serve the subtitles file
//   fs.readFile(__dirname + "/subtitles.vtt", (err, data) => {
//     if (err) {
//       res.status(500).send("Error reading subtitles");
//     } else {
//       res.header("Content-Type", "text/vtt");
//       res.send(data);
//     }
//   });
// });
