#!/bin/bash
# ============================================================
# J.A.R.V.I.S — systemd Service Installer
# Installs Jarvis as a user-level systemd service
# that auto-starts on login/boot.
# ============================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║  J.A.R.V.I.S — Service Installer          ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Get absolute project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
USER_ID=$(id -u)
SERVICE_DIR="$HOME/.config/systemd/user"

echo -e "  Project: ${CYAN}$PROJECT_DIR${NC}"
echo -e "  User:    ${CYAN}$(whoami) (UID: $USER_ID)${NC}"
echo ""

# Create systemd user directory
mkdir -p "$SERVICE_DIR"

# Generate service file with actual paths
TEMPLATE="$SCRIPT_DIR/jarvis.service"
TARGET="$SERVICE_DIR/jarvis.service"

if [ ! -f "$TEMPLATE" ]; then
    echo -e "${RED}  ✗ Service template not found: $TEMPLATE${NC}"
    exit 1
fi

# Replace placeholders
sed -e "s|__PROJECT_DIR__|$PROJECT_DIR|g" \
    -e "s|__UID__|$USER_ID|g" \
    "$TEMPLATE" > "$TARGET"

echo -e "${GREEN}  ✓ Service file installed: $TARGET${NC}"

# Reload systemd
systemctl --user daemon-reload
echo -e "${GREEN}  ✓ systemd daemon reloaded${NC}"

# Enable service (auto-start on login)
systemctl --user enable jarvis.service
echo -e "${GREEN}  ✓ Service enabled (auto-start on login)${NC}"

# Start service
systemctl --user start jarvis.service
echo -e "${GREEN}  ✓ Service started${NC}"

# Enable lingering (keeps service running even when not logged in graphically)
sudo loginctl enable-linger $(whoami) 2>/dev/null || true

echo ""
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ J.A.R.V.I.S service installed!${NC}"
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo ""
echo -e "  Commands:"
echo -e "    ${CYAN}systemctl --user status jarvis.service${NC}   — Check status"
echo -e "    ${CYAN}systemctl --user restart jarvis.service${NC}  — Restart"
echo -e "    ${CYAN}systemctl --user stop jarvis.service${NC}     — Stop"
echo -e "    ${CYAN}journalctl --user -u jarvis.service -f${NC}  — View logs"
echo -e "    ${CYAN}systemctl --user disable jarvis.service${NC} — Disable auto-start"
echo ""
