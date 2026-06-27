#!/bin/bash

# ─── Color codes ───────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "       Todo App - Local Setup Script"
echo "============================================"

# ─── Check Docker ──────────────────────────────────────────────
echo -e "\n${YELLOW}Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker is not installed. Please install Docker Desktop first.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# ─── Check Docker Compose ──────────────────────────────────────
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
  echo -e "${RED}✗ Docker Compose not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# ─── Check Node.js ─────────────────────────────────────────────
echo -e "\n${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js 20+.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# ─── Install frontend dependencies ─────────────────────────────
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend && npm ci && cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# ─── Start Docker Compose ──────────────────────────────────────
echo -e "\n${YELLOW}Starting all services with Docker Compose...${NC}"
docker compose up --build -d

echo ""
echo "============================================"
echo -e "${GREEN}Setup complete! Services running at:${NC}"
echo "  Frontend → http://localhost:3000"
echo "  Backend  → http://localhost:8080"
echo "  Database → localhost:5432"
echo "============================================"