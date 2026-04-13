# 🤖 J.A.R.V.I.S — Just A Really Very Intelligent System

> A voice-activated, offline-first AI desktop assistant for Zorin OS / Linux.  
> Runs as a real background service on your machine — no browser required.

![Platform](https://img.shields.io/badge/platform-Zorin%20OS%20%2F%20Ubuntu-green.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ What Is This?

Jarvis is a **local Linux desktop assistant** that:
- 🎤 **Always listens** for the wake word "Jarvis"
- 🧠 **Processes commands offline** — no cloud, no API keys
- 🖥️ **Controls your desktop** — apps, volume, brightness, Wi-Fi, screenshots, etc.
- 🔊 **Speaks back** with voice confirmation using Piper TTS
- 🚀 **Auto-starts on boot** via systemd
- 📱 **Optional web HUD & mobile remote** for visual control

This is not a web app. It's a real tool that runs in the background on your Linux machine.

---

## 🚀 Quick Start

### Prerequisites
- **Zorin OS 17** / Ubuntu 22.04+
- **Python 3.10+**
- A microphone (for voice features)

### 1. Install

```bash
cd jarvis
chmod +x install.sh
./install.sh
```

### 2. Run (Choose Your Mode)

**Background voice service (recommended):**
```bash
python3 services/jarvis_service.py
```
Say "Jarvis" and give a command. It runs until you stop it.

**Text-only mode (no microphone needed):**
```bash
python3 services/jarvis_service.py --no-voice
```

**CLI tool (single commands):**
```bash
python3 services/jarvis_cli.py "what time is it"
python3 services/jarvis_cli.py "show system stats"
python3 services/jarvis_cli.py --interactive
```

**Self-test:**
```bash
python3 services/jarvis_service.py --test
```

### 3. Auto-Start on Boot

```bash
./services/install_service.sh
```

This installs a systemd user service. Manage it with:
```bash
systemctl --user status jarvis.service     # Check status
systemctl --user restart jarvis.service    # Restart
systemctl --user stop jarvis.service       # Stop
journalctl --user -u jarvis.service -f     # View logs
```

### 4. Optional: Web HUD Dashboard

```bash
./start.sh
# Desktop HUD: http://localhost:5173
# Mobile Remote: http://<your-ip>:5174
```

---

## 🎤 Voice Commands

| Command | What It Does |
|:--------|:-------------|
| "Jarvis, open Firefox" | Launches Firefox |
| "Jarvis, close Chrome" | Closes Chrome |
| "Jarvis, open VS Code and Spotify" | Multi-step: opens both |
| "Jarvis, set volume to 50" | Sets system volume |
| "Jarvis, mute" / "unmute" | Mutes/unmutes audio |
| "Jarvis, lower brightness to 40 percent" | Adjusts brightness |
| "Jarvis, turn off Bluetooth" | Disables Bluetooth |
| "Jarvis, turn on Wi-Fi" | Enables Wi-Fi |
| "Jarvis, what time is it" | Tells current time and date |
| "Jarvis, what is my battery" | Reads battery percentage |
| "Jarvis, show system stats" | CPU, RAM, disk, temperature |
| "Jarvis, take a screenshot" | Captures the screen |
| "Jarvis, search Downloads for PDFs" | Searches files |
| "Jarvis, play music" / "next track" | Controls media playback |
| "Jarvis, create a note saying buy groceries" | Saves a text note |
| "Jarvis, list notes" | Shows saved notes |
| "Jarvis, remind me to call mom in 30 minutes" | Sets a reminder |
| "Jarvis, empty trash" | Empties trash (with confirmation) |
| "Jarvis, lock screen" | Locks the computer |
| "Jarvis, shutdown" | Shuts down (with confirmation) |
| "Jarvis, help" | Lists all available commands |

---

## 📦 Tech Stack

| Component | Technology |
|:----------|:-----------|
| **Voice recognition** | Faster-Whisper (offline, local) |
| **Wake word** | OpenWakeWord |
| **Text-to-speech** | Piper TTS / espeak-ng |
| **Command parser** | Custom regex NLP engine |
| **Desktop control** | Python + subprocess + psutil |
| **Database** | SQLite (command history, reminders) |
| **Background service** | Python daemon + systemd |
| **System tray** | GTK AppIndicator3 |
| **Web HUD** (optional) | React + Vite + TailwindCSS v4 |
| **Mobile remote** (optional) | React PWA |

---

## 📁 Project Structure

```
jarvis/
├── services/                 # ⭐ Background service (core)
│   ├── jarvis_service.py     # Main daemon — voice loop + commands
│   ├── jarvis_cli.py         # CLI tool for terminal commands
│   ├── jarvis.service        # systemd unit file
│   └── install_service.sh    # Auto-start installer
├── voice_engine/             # Voice pipeline
│   ├── engine.py             # Voice orchestrator
│   ├── wake_word.py          # OpenWakeWord "Jarvis" detector
│   ├── speech_to_text.py     # Faster-Whisper transcription
│   └── text_to_speech.py     # Piper TTS + espeak-ng fallback
├── desktop_agent/            # Linux automation modules
│   ├── agent.py              # Central command router
│   ├── system_control.py     # Volume, brightness, Wi-Fi, BT, stats
│   ├── app_control.py        # Open/close applications
│   ├── power_control.py      # Shutdown, restart, sleep, lock
│   ├── file_search.py        # File search with patterns
│   ├── media_control.py      # Media playback via playerctl
│   ├── screenshot.py         # Screenshot capture
│   ├── clipboard.py          # Clipboard management
│   ├── notifications.py      # Desktop notifications
│   ├── notes_manager.py      # Create and read notes
│   └── reminder_manager.py   # Persistent reminders with timer
├── backend/                  # FastAPI (optional, for web HUD)
│   ├── core/                 # Command parser, executor, context
│   ├── api/                  # REST routes + WebSocket
│   └── main.py               # Web server entry point
├── tray_app/                 # System tray indicator
│   └── tray.py               # GTK tray with status + controls
├── config/
│   ├── settings.yaml         # All configuration
│   ├── commands.yaml         # App aliases + custom commands
│   └── sounds/activate.wav   # Wake word chime
├── frontend/                 # React HUD (optional)
├── mobile_dashboard/         # React PWA (optional)
├── database/                 # SQLite storage
├── logs/                     # Service logs + command history
├── install.sh                # One-click installer
├── start.sh                  # Start web HUD + backend
└── stop.sh                   # Stop all services
```

---

## ⚙️ Configuration

Edit `config/settings.yaml`:

```yaml
voice:
  stt_model: "small"          # tiny (fast) → medium (accurate)
  wake_word_threshold: 0.5    # Lower = more sensitive
  silence_duration: 1.5       # Seconds of silence to stop recording

service:
  chime_on_wake: true         # Play sound when wake word detected
  notification_feedback: true # Desktop notification for responses
  tray_enabled: true          # Show system tray icon

notes:
  directory: "~/Documents/JarvisNotes"

reminders:
  check_interval: 30          # Check for due reminders every 30s
```

---

## 🛡️ Security

- **100% local** — no data leaves your machine
- **No cloud APIs** required for core features
- **Dangerous commands** (shutdown, empty trash) require confirmation
- **Reminders** stored in local SQLite
- **Notes** saved as plain text files you own

---

## 🔮 Roadmap

- [ ] Voice confirmation for dangerous commands
- [ ] Ollama/OpenAI integration for natural language queries
- [ ] Calendar and weather integration
- [ ] Desktop automation routines (Good Morning, Focus Mode)
- [ ] Spotify/Discord API control
- [ ] File transfer from phone to PC
- [ ] Custom wake word training

---

## 📄 License

MIT — build whatever you want.

---

*"At your service, sir."* 🤖
