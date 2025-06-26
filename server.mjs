// server.mjs
import express from "express";
import WebTorrent from "webtorrent";
import cors from "cors";

const app = express();
const client = new WebTorrent();

app.use(cors());

app.get("/stream", (req, res) => {
  const magnetURI = req.query.magnet;

  if (!magnetURI) {
    return res.status(400).send("Magnet link is required");
  }

  client.add(magnetURI, (torrent) => {
    const file = torrent.files.find(
      (f) => f.name.endsWith(".mp4") || f.name.endsWith(".mkv")
    );

    res.writeHead(200, {
      "Content-Length": file.length,
      "Content-Type": "video/mp4",
    });

    const stream = file.createReadStream();
    stream.pipe(res);

    req.on("close", () => {
      torrent.destroy(); // Cleanup
    });
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
