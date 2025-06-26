// server.mjs
import express from "express";
import fileUpload from "express-fileupload";
import parseTorrent from "parse-torrent";
import WebTorrent from "webtorrent";
import cors from "cors";
import fs from "fs";

const app = express();
const client = new WebTorrent();

app.use(cors());
app.use(fileUpload());

// Convert a .torrent file to magnet URI
function convertToMagnet(fileBuffer) {
  const parsed = parseTorrent(fileBuffer);
  return parseTorrent.toMagnetURI(parsed);
}

// Upload endpoint
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.torrent) {
      return res.status(400).send("No torrent file uploaded");
    }

    const file = req.files.torrent;
    const magnetURI = convertToMagnet(file.data);

    res.json({ magnetURI });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Failed to parse torrent file");
  }
});

// Stream endpoint
app.get("/stream", (req, res) => {
  const magnetURI = req.query.magnet;

  if (!magnetURI) {
    return res.status(400).send("Magnet link is required");
  }

  client.add(magnetURI, (torrent) => {
    const file = torrent.files.find(
      (f) => f.name.endsWith(".mp4") || f.name.endsWith(".mkv")
    );

    if (!file) {
      return res.status(404).send("No video file found in torrent");
    }

    res.writeHead(200, {
      "Content-Length": file.length,
      "Content-Type": "video/mp4",
    });

    const stream = file.createReadStream();
    stream.pipe(res);

    req.on("close", () => {
      torrent.destroy(); // cleanup
    });
  });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
