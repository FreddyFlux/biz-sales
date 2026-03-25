"""
call_recorder.py
================
Run this on your Windows machine whenever you're working.
It listens on port 5050 for start/stop signals from the biz-sales dashboard,
records system audio via ffmpeg, then POSTs the file to your n8n webhook.

Requirements:
    pip install flask flask-cors requests

ffmpeg must be installed and on PATH:
    winget install ffmpeg

To find your audio device name, run:
    ffmpeg -list_devices true -f dshow -i dummy
Look for a "Stereo Mix" or loopback device.

Usage:
    python call_recorder.py
"""

import os
import threading
import subprocess
import requests
import tempfile
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# ─── CONFIG ───────────────────────────────────────────────────────────────────

# Your n8n webhook URL
N8N_AUDIO_WEBHOOK = "https://n8n.digidevs.no/webhook/call-audio"

# Port this local server listens on
LOCAL_PORT = 5050

# Allowed origins (Vercel prod + local dev)
ALLOWED_ORIGINS = ["https://biz-sales.vercel.app", "http://localhost:3000"]

# Audio bitrate — mono voice is fine at 64kbps
AUDIO_BITRATE = "64k"

# ffmpeg WASAPI loopback device name
# Run: ffmpeg -list_devices true -f dshow -i dummy
# Look for e.g. "Stereo Mix (Realtek High Definition Audio)"
AUDIO_DEVICE = "Microphone Array (2- Intel® Smart Sound Technology for Digital Microphones)"

# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS)

recording_process: subprocess.Popen | None = None
recording_file: str | None = None
recording_lock = threading.Lock()


def get_temp_path() -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join(tempfile.gettempdir(), f"call_{ts}.mp3")


@app.route("/start", methods=["POST"])
def start_recording():
    global recording_process, recording_file

    with recording_lock:
        if recording_process is not None:
            return jsonify({"status": "error", "message": "Already recording"}), 400

        recording_file = get_temp_path()

        cmd = [
            "ffmpeg",
            "-y",
            "-f", "dshow",
            "-i", f"audio={AUDIO_DEVICE}",
            "-ac", "1",           # mono
            "-ar", "16000",       # 16kHz — enough for voice
            "-b:a", AUDIO_BITRATE,
            recording_file,
        ]

        recording_process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        print(f"[recorder] Started → {recording_file}")
        return jsonify({"status": "recording", "file": recording_file})

@app.route("/stop", methods=["POST"])
def stop_recording():
    global recording_process, recording_file

    with recording_lock:
        if recording_process is None:
            return jsonify({"status": "error", "message": "Not recording"}), 400

        try:
            recording_process.stdin.write(b"q")
            recording_process.stdin.flush()
            recording_process.wait(timeout=5)
        except Exception:
            recording_process.kill()

        file_to_send = recording_file
        recording_process = None
        recording_file = None

    data = request.get_json(silent=True) or {}
    print(f'[recorder] Stop body received: {data}')
    contact_id   = data.get("contactId", "")
    contact_name = data.get("contactName", "")
    company_id   = data.get("companyId", "")
    company_name = data.get("companyName", "")

    print(f"[recorder] Stopped → {contact_name} @ {company_name} (ids: {contact_id}, {company_id})")

    threading.Thread(
        target=send_to_n8n,
        args=(file_to_send, contact_id, contact_name, company_id, company_name),
        daemon=True
    ).start()

    return jsonify({"status": "stopped", "sending": True})

def send_to_n8n(file_path: str, contact_id: str, contact_name: str, company_id: str, company_name: str):
    try:
        import base64
        with open(file_path, 'rb') as f:
            audio_base64 = base64.b64encode(f.read()).decode('utf-8')

        payload = {
            'audioBase64': audio_base64,
            'mimeType': 'audio/mpeg',
            'contactId': contact_id,
            'contactName': contact_name,
            'companyId': company_id,
            'companyName': company_name,
        }

        response = requests.post(
            N8N_AUDIO_WEBHOOK,
            json=payload,
            timeout=60,
        )
        print(f'[recorder] n8n responded: {response.status_code}')
    except Exception as e:
        print(f'[recorder] Failed to send to n8n: {e}')
    finally:
        try:
            os.remove(file_path)
            print(f'[recorder] Deleted local file: {file_path}')
        except Exception:
            pass

if __name__ == "__main__":
    print(f"[recorder] Listening on http://localhost:{LOCAL_PORT}")
    print(f"[recorder] CORS allowed origins: {ALLOWED_ORIGINS}")
    print(f"[recorder] n8n webhook: {N8N_AUDIO_WEBHOOK}")
    print(f"[recorder] Audio device: {AUDIO_DEVICE}")
    print(f"[recorder] Waiting for start/stop from biz-sales dashboard...")
    app.run(host="0.0.0.0", port=LOCAL_PORT, debug=False)