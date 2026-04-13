#!/bin/bash
# ============================================================
# J.A.R.V.I.S — Stop All Services
# ============================================================

CYAN='\033[0;36m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${RED}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║  J.A.R.V.I.S — Shutting down...           ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Kill saved PIDs
for pidfile in .backend.pid .frontend.pid .mobile.pid; do
    if [ -f "$pidfile" ]; then
        PID=$(cat "$pidfile")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null
            echo -e "  Stopped PID $PID (${pidfile})"
        fi
        rm -f "$pidfile"
    fi
done

# Kill any remaining processes
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "vite.*5174" 2>/dev/null || true

echo ""
echo -e "${GREEN}  ✓ J.A.R.V.I.S offline. Goodbye, sir.${NC}"
echo ""
