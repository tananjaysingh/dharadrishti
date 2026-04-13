#!/bin/bash
# ============================================================
# J.A.R.V.I.S — Installation Script for Zorin OS / Ubuntu
# ============================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔════════════════════════════════════════════════════════════╗"
echo "  ║                                                            ║"
echo "  ║   J.A.R.V.I.S — Installation Script                       ║"
echo "  ║   Just A Really Very Intelligent System                    ║"
echo "  ║                                                            ║"
echo "  ║   Zorin OS / Ubuntu Desktop Assistant                      ║"
echo "  ║                                                            ║"
echo "  ╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ── 1. System Dependencies ──
echo -e "${CYAN}[1/8] Installing system dependencies...${NC}"
sudo apt update -qq
sudo apt install -y -qq \
    python3 python3-pip python3-venv python3-dev \
    portaudio19-dev \
    espeak-ng \
    playerctl \
    wmctrl \
    xdotool \
    xclip \
    brightnessctl \
    gnome-screenshot \
    libnotify-bin \
    ffmpeg \
    sqlite3 \
    curl \
    jq \
    alsa-utils \
    2>/dev/null

echo -e "${GREEN}  ✓ System dependencies installed${NC}"

# ── 2. System Tray Dependencies ──
echo -e "${CYAN}[2/8] Installing system tray support...${NC}"
sudo apt install -y -qq \
    python3-gi \
    gir1.2-appindicator3-0.1 \
    gir1.2-gtk-3.0 \
    2>/dev/null || echo -e "${YELLOW}  ⚠ Tray dependencies not available (will use fallback)${NC}"

echo -e "${GREEN}  ✓ System tray support configured${NC}"

# ── 3. Python Virtual Environment ──
echo -e "${CYAN}[3/8] Setting up Python virtual environment...${NC}"
python3 -m venv --system-site-packages venv
source venv/bin/activate
pip install --upgrade pip -q

echo -e "${GREEN}  ✓ Python virtual environment ready${NC}"

# ── 4. Python Dependencies (Core) ──
echo -e "${CYAN}[4/8] Installing Python core packages...${NC}"
pip install -q \
    fastapi \
    uvicorn \
    pyyaml \
    psutil \
    pydantic \
    sqlalchemy \
    python-jose[cryptography] \
    qrcode \
    pillow \
    numpy

echo -e "${GREEN}  ✓ Core Python packages installed${NC}"

# ── 5. Voice Engine Dependencies ──
echo -e "${CYAN}[5/8] Installing voice engine packages...${NC}"
echo -e "${YELLOW}  This may take a few minutes (downloading AI models)...${NC}"
pip install -q \
    pyaudio \
    openwakeword \
    faster-whisper \
    2>/dev/null || echo -e "${YELLOW}  ⚠ Some voice packages failed (voice may use fallback)${NC}"

# Try piper-tts (may not be available on all platforms)
pip install piper-tts 2>/dev/null || echo -e "${YELLOW}  ⚠ Piper TTS not available (will use espeak-ng)${NC}"

echo -e "${GREEN}  ✓ Voice engine packages installed${NC}"

# ── 6. Frontend Dependencies ──
echo -e "${CYAN}[6/8] Installing frontend (optional HUD)...${NC}"
if command -v npm &> /dev/null; then
    cd frontend && npm install --prefer-offline 2>/dev/null && cd ..
    cd mobile_dashboard && npm install --prefer-offline 2>/dev/null && cd ..
    echo -e "${GREEN}  ✓ Frontend installed${NC}"
else
    echo -e "${YELLOW}  ⚠ Node.js not found — HUD dashboard skipped (core works without it)${NC}"
fi

# ── 7. Directory Setup ──
echo -e "${CYAN}[7/8] Setting up directories and database...${NC}"
mkdir -p database logs config/sounds
mkdir -p ~/Documents/JarvisNotes
mkdir -p ~/Pictures/Screenshots

# Init database
if [ -f "database/schema.sql" ]; then
    sqlite3 database/jarvis.db < database/schema.sql 2>/dev/null || true
fi

# Make scripts executable
chmod +x install.sh start.sh stop.sh
chmod +x services/install_service.sh
chmod +x services/jarvis_service.py
chmod +x services/jarvis_cli.py

echo -e "${GREEN}  ✓ Directories and database ready${NC}"

# ── 8. Generate activation chime ──
echo -e "${CYAN}[8/8] Generating activation sounds...${NC}"
python3 -c "
import struct, math, wave, os
chime_path = 'config/sounds/activate.wav'
if not os.path.exists(chime_path):
    sr, dur, freq = 22050, 0.25, 880
    samples = int(sr * dur)
    data = []
    for i in range(samples):
        t = i / sr
        fade = max(0, 1 - (t / dur) * 2)
        val = int(32767 * math.sin(2 * math.pi * freq * t) * fade * 0.5)
        data.append(struct.pack('<h', val))
    with wave.open(chime_path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(b''.join(data))
    print('  Chime generated')
else:
    print('  Chime already exists')
" 2>/dev/null || true

echo -e "${GREEN}  ✓ Sounds ready${NC}"

# ── Summary ──
echo ""
echo -e "${GREEN}  ════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  J.A.R.V.I.S installation complete!${NC}"
echo -e "${GREEN}  ════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Quick Start:${NC}"
echo ""
echo -e "  1. Run as background service (voice-activated):"
echo -e "     ${CYAN}python3 services/jarvis_service.py${NC}"
echo ""
echo -e "  2. Run in text-only mode (no microphone needed):"
echo -e "     ${CYAN}python3 services/jarvis_service.py --no-voice${NC}"
echo ""
echo -e "  3. Use the CLI tool:"
echo -e "     ${CYAN}python3 services/jarvis_cli.py \"what time is it\"${NC}"
echo -e "     ${CYAN}python3 services/jarvis_cli.py --interactive${NC}"
echo ""
echo -e "  4. Install as auto-start service:"
echo -e "     ${CYAN}./services/install_service.sh${NC}"
echo ""
echo -e "  5. Start with web HUD (optional):"
echo -e "     ${CYAN}./start.sh${NC}"
echo ""
echo -e "  ${YELLOW}Note: First voice command may take ~30s while AI models load.${NC}"
echo ""
