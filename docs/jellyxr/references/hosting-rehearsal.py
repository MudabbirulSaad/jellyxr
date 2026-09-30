"""Loopback-only static-package rehearsal. Not a production server or API proxy."""
import hashlib
import json
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

old, new, state, log = map(Path, sys.argv[1:])
roots = {"old": old, "new": new}
entries = {name: {row["path"][4:]: row for row in json.loads((root / "manifest.json").read_text())["files"]
                  if row["path"].startswith("web/")} for name, root in roots.items()}

def hashed(path):
    return bool(re.search(r"\.[a-f0-9]{16,64}\.", path))

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_HEAD(self):
        self.respond(False)

    def do_GET(self):
        self.respond(True)

    def respond(self, body):
        pathname = unquote(urlsplit(self.path).path)
        config = json.loads(state.read_text())
        active = config["active"]
        selected = active
        data = b""
        headers = {"Cache-Control": "no-store"}
        status = 404
        key = ""
        if pathname == "/xr":
            status, headers["Location"] = 308, "/xr/"
        elif pathname.startswith("/xr/"):
            key = pathname[4:] or "index.html"
            if "\\" in key or ":" in key or any(part in ("..", ".", "") for part in key.split("/")):
                status = 400
            else:
                if key not in entries[active] and config["retain"] and hashed(key):
                    selected = "new" if active == "old" else "old"
                if key in entries[selected]:
                    data = (roots[selected] / "web" / key).read_bytes()
                    digest = hashlib.sha256(data).hexdigest()
                    if digest != entries[selected][key]["sha256"]:
                        raise RuntimeError("Payload mutated during rehearsal")
                    status = 200
                    headers["Content-Type"] = mimetypes.guess_type(key)[0] or "application/octet-stream"
                    headers["Cache-Control"] = "public, max-age=31536000, immutable" if hashed(key) else "no-cache"
                    headers["ETag"] = '"' + digest + '"'
                    if self.headers.get("If-None-Match") == headers["ETag"]:
                        status, data = 304, b""
        self.send_response(status)
        for name, value in headers.items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        with log.open("a", encoding="utf-8") as target:
            target.write(json.dumps({"path": pathname, "status": status, "active": active, "served": selected,
                                     "etag": headers.get("ETag"), "conditional": bool(self.headers.get("If-None-Match")),
                                     "user_agent": self.headers.get("User-Agent", "")}) + "\n")
        if body and data:
            self.wfile.write(data)

ThreadingHTTPServer(("127.0.0.1", 8131), Handler).serve_forever()
