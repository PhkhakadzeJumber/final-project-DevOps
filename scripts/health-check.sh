#!/bin/bash

# ─── Color codes ───────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ─── URLs ──────────────────────────────────────────────────────
FRONTEND_URL="https://final-project-dev-ops.vercel.app"
BACKEND_URL="https://final-project-devops-production.up.railway.app"

echo "============================================"
echo "       Todo App - Health Check"
echo "============================================"

check_service() {
  local name=$1
  local url=$2

  echo -e "\nChecking ${name}..."
  STATUS=$(curl -o /dev/null -s -w "%{http_code}" --max-time 10 "$url")

  if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 400 ]; then
    echo -e "${GREEN}✓ ${name} is UP (HTTP $STATUS)${NC} → $url"
  else
    echo -e "${RED}✗ ${name} is DOWN (HTTP $STATUS)${NC} → $url"
    EXIT_CODE=1
  fi
}

EXIT_CODE=0

check_service "Frontend (Vercel)"   "$FRONTEND_URL"
check_service "Backend (Railway)"   "$BACKEND_URL/api/todos"

echo ""
echo "============================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All services are healthy!${NC}"
else
  echo -e "${RED}One or more services are down!${NC}"
fi
echo "============================================"

exit $EXIT_CODE