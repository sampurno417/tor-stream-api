// torrentToMagnet.js
import fs from "fs";
import parseTorrent from "parse-torrent";

/**
 * Convert a .torrent file into a magnet URI
 * @param {string} filePath - Path to the .torrent file
 * @returns {Promise<string>} - Magnet URI string
 */
export async function convertTorrentToMagnet(filePath) {
  const torrentBuffer = fs.readFileSync(filePath);
  const parsed = parseTorrent(torrentBuffer);
  return parseTorrent.toMagnetURI(parsed);
}
