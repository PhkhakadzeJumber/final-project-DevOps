#!/bin/bash

# ─── Color codes ───────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "       Todo App - Rollback Script"
echo "============================================"

# ─── Check for Vercel token ────────────────────────────────────
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}Error: VERCEL_TOKEN environment variable is not set.${NC}"
  echo "Export it first: export VERCEL_TOKEN=your_token_here"
  exit 1
fi

echo -e "\n${YELLOW}Rolling back Frontend (Vercel)...${NC}"
if vercel rollback --token="$VERCEL_TOKEN" --yes; then
  echo -e "${GREEN}✓ Frontend rolled back successfully!${NC}"
else
  echo -e "${RED}✗ Frontend rollback failed!${NC}"
  exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}Rollback complete!${NC}"
echo "Check your app: https://final-project-dev-ops.vercel.app"
echo "============================================"