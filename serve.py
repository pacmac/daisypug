#!/usr/bin/env python3
"""Simple server to preview DaisyPug showcase pages."""

import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "examples")

os.chdir(DIR)
handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({".html": "text/html; charset=utf-8"})

with http.server.HTTPServer(("0.0.0.0", PORT), handler) as httpd:
    print(f"Serving examples at http://0.0.0.0:{PORT}/")
    print(f"  showcase.html       (from Pug)")
    print(f"  showcase-yaml.html  (from YAML)")
    print(f"Press Ctrl+C to stop.")
    httpd.serve_forever()
