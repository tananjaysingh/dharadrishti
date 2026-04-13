#!/bin/bash
# ============================================================
# J.A.R.V.I.S — Start All Services
# ============================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${CYAN}"
echo "  ╔════════════════════════════════════════════╗"
echo "  ║  J.A.R.V.I.S — Starting Systems...        ║"
echo "  ╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Kill any existing instances
pkill -f "uvicorn backend.main:app" 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "vite.*5174" 2>/dev/null || true

# Activate Python venv (or use system Python)
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${GREEN}  ✓ Using virtual environment${NC}"
else
    echo -e "${YELLOW}  ⚠ No venv found — using system Python${NC}"
    echo -e "${YELLOW}    (Run ./install.sh for a full setup)${NC}"
fi

# Create logs directory
mkdir -p logs

# Start FastAPI backend
echo -e "${CYAN}  Starting backend server on port 8400...${NC}"
cd "$SCRIPT_DIR"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8400 --reload \
    --reload-dir backend --reload-dir desktop_agent \
    > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 2

# Start frontend dev server
echo -e "${CYAN}  Starting frontend on port 5173...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Start mobile dashboard
echo -e "${CYAN}  Starting mobile dashboard on port 5174...${NC}"
cd "$SCRIPT_DIR/mobile_dashboard"
npm run dev -- --port 5174 > ../logs/mobile.log 2>&1 &
MOBILE_PID=$!
echo -e "${GREEN}  ✓ Mobile dashboard started (PID: $MOBILE_PID)${NC}"

cd "$SCRIPT_DIR"

# Save PIDs
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
echo "$MOBILE_PID" > .mobile.pid

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ J.A.R.V.I.S is online!${NC}"
echo -e "${GREEN}  ════════════════════════════════════════════${NC}"
echo ""
echo -e "  🖥️  Desktop HUD:    ${CYAN}http://localhost:5173${NC}"
echo -e "  📱 Mobile Remote:   ${CYAN}http://${LOCAL_IP}:5174${NC}"
echo -e "  🔌 API:             ${CYAN}http://localhost:8400/api/health${NC}"
echo -e "  📡 WebSocket:       ${CYAN}ws://localhost:8400/ws${NC}"
echo ""
echo -e "  To stop: ${CYAN}./stop.sh${NC}"
echo ""
