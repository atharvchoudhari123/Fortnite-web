import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp"
};

const server = http.createServer((req, res) => {

    let requestPath = decodeURIComponent(
        req.url.split("?")[0]
    );

    if (requestPath === "/") {
        requestPath = "/index.html";
    }

    const filePath = path.join(
        __dirname,
        requestPath
    );

    // Prevent requests from escaping the project directory.
    const normalizedPath = path.normalize(filePath);

    if (!normalizedPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(normalizedPath, (error, data) => {

        if (error) {

            res.writeHead(
                error.code === "ENOENT" ? 404 : 500,
                {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                }
            );

            res.end(
                error.code === "ENOENT"
                    ? "404 - File not found"
                    : "500 - Server error"
            );

            return;
        }

        const extension =
            path.extname(normalizedPath).toLowerCase();

        res.writeHead(
            200,
            {
                "Content-Type":
                    MIME_TYPES[extension] ||
                    "application/octet-stream"
            }
        );

        res.end(data);
    });
});

server.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("       BATTLE ISLAND SERVER      ");
    console.log("=================================");
    console.log("");
    console.log(`Running at: http://localhost:${PORT}`);
    console.log("");
});