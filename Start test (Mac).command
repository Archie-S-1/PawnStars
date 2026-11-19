#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Node.js is not installed on this Mac yet."
  echo "  Your browser will open the Node.js website. Download the LTS version,"
  echo "  install it, then double-click this file again."
  echo ""
  open "https://nodejs.org/"
  read -p "  Press Enter to close this window."
  exit 1
fi
(sleep 2; open "http://localhost:3000/test.html") &
node server.js
