"""Serve this project's own directory and open its preview in the default browser."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
PORT = 8173
URL = f"http://127.0.0.1:{PORT}/index.html"

def main():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    except OSError as error:
        print(f"Onizleme baslatilamadi: {error}")
        print(f"{PORT} portunu kullanan onceki onizlemeyi kapatip yeniden deneyin.")
        return 1
    print(f"Proje klasoru: {ROOT}")
    print(f"Onizleme: {URL}")
    print("Durdurmak icin Ctrl+C basin veya bu pencereyi kapatin.")
    if "--no-browser" not in sys.argv:
        webbrowser.open(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
