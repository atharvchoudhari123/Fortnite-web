import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",

    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",

    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",

    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",

    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf"
};


// ============================================================
// SECURITY
// ============================================================

function getSafePath(urlPath) {

    let decoded;

    try {
        decoded =
            decodeURIComponent(urlPath);
    } catch {
        return null;
    }

    const cleanPath =
        decoded.split("?")[0];

    const relativePath =
        cleanPath === "/"
            ? "index.html"
            : cleanPath.replace(
                /^\/+/,
                ""
            );

    const fullPath =
        path.resolve(
            __dirname,
            relativePath
        );

    const root =
        path.resolve(
            __dirname
        );


    if (
        fullPath !== root &&
        !fullPath.startsWith(
            root + path.sep
        )
    ) {
        return null;
    }

    return fullPath;
}


// ============================================================
// CACHE POLICY
// ============================================================

function getCacheHeader(
    filePath
) {

    if (
        filePath.includes(
            `${path.sep}assets${path.sep}`
        )
    ) {

        return "public, max-age=31536000, immutable";
    }

    return "no-cache";
}


// ============================================================
// SERVE FILE
// ============================================================

function serveFile(
    req,
    res,
    filePath
) {

    fs.stat(
        filePath,
        (statError, stats) => {

            if (statError) {

                res.writeHead(
                    statError.code === "ENOENT"
                        ? 404
                        : 500,
                    {
                        "Content-Type":
                            "text/plain; charset=utf-8"
                    }
                );

                res.end(
                    statError.code === "ENOENT"
                        ? "404 - File not found"
                        : "500 - Server error"
                );

                return;
            }


            if (
                stats.isDirectory()
            ) {

                res.writeHead(
                    403,
                    {
                        "Content-Type":
                            "text/plain; charset=utf-8"
                    }
                );

                res.end(
                    "Directory listing disabled."
                );

                return;
            }


            const extension =
                path.extname(
                    filePath
                ).toLowerCase();


            const contentType =
                MIME_TYPES[
                    extension
                ] ||
                "application/octet-stream";


            res.writeHead(
                200,
                {
                    "Content-Type":
                        contentType,

                    "Cache-Control":
                        getCacheHeader(
                            filePath
                        ),

                    "X-Content-Type-Options":
                        "nosniff"
                }
            );


            const stream =
                createReadStream(
                    filePath
                );


            stream.on(
                "error",
                error => {

                    console.error(
                        "File stream error:",
                        error
                    );

                    if (
                        !res.headersSent
                    ) {

                        res.writeHead(
                            500
                        );
                    }

                    res.end();
                }
            );


            stream.pipe(res);
        }
    );
}


// ============================================================
// SERVER
// ============================================================

const server =
    http.createServer(
        (req, res) => {

            if (
                req.method !== "GET" &&
                req.method !== "HEAD"
            ) {

                res.writeHead(
                    405,
                    {
                        "Allow":
                            "GET, HEAD"
                    }
                );

                res.end(
                    "Method Not Allowed"
                );

                return;
            }


            const filePath =
                getSafePath(
                    req.url || "/"
                );


            if (!filePath) {

                res.writeHead(
                    403,
                    {
                        "Content-Type":
                            "text/plain; charset=utf-8"
                    }
                );

                res.end(
                    "Forbidden"
                );

                return;
            }


            if (
                req.method === "HEAD"
            ) {

                fs.stat(
                    filePath,
                    (error, stats) => {

                        if (
                            error ||
                            !stats.isFile()
                        ) {

                            res.writeHead(
                                404
                            );

                            res.end();

                            return;
                        }


                        const extension =
                            path.extname(
                                filePath
                            ).toLowerCase();


                        res.writeHead(
                            200,
                            {
                                "Content-Type":
                                    MIME_TYPES[
                                        extension
                                    ] ||
                                    "application/octet-stream",

                                "Cache-Control":
                                    getCacheHeader(
                                        filePath
                                    )
                            }
                        );

                        res.end();
                    }
                );

                return;
            }


            serveFile(
                req,
                res,
                filePath
            );
        }
    );


// ============================================================
// START
// ============================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            "          BATTLE ISLAND SERVER"
        );
        console.log(
            "========================================"
        );
        console.log("");
        console.log(
            `Local:   http://localhost:${PORT}`
        );
        console.log(
            `Port:    ${PORT}`
        );
        console.log(
            "Assets:  /assets/"
        );
        console.log("");
        console.log(
            "Press Ctrl+C to stop."
        );
        console.log("");
    }
);


// ============================================================
// CLEAN SHUTDOWN
// ============================================================

function shutdown() {

    console.log(
        "\nStopping server..."
    );

    server.close(
        () => {
            process.exit(0);
        }
    );
}


process.on(
    "SIGINT",
    shutdown
);

process.on(
    "SIGTERM",
    shutdown
);
