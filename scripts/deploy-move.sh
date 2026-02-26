#!/bin/bash
set -e

MOVE_DIR="move/zeraphim_ascension"

echo "=== Building Move package ==="
one move build --path "$MOVE_DIR"

echo ""
echo "=== Running Move tests ==="
one move test --path "$MOVE_DIR"

echo ""
echo "=== Publishing to OneChain ==="
RESULT=$(one client publish --path "$MOVE_DIR" --gas-budget 100000000 --json)

PACKAGE_ID=$(echo "$RESULT" | grep -o '"packageId":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "=== Deployment Complete ==="
echo "PACKAGE_ID: $PACKAGE_ID"
echo ""
echo "Add this to your .env files:"
echo "  MOVE_PACKAGE_ID=$PACKAGE_ID"
echo "  NEXT_PUBLIC_PACKAGE_ADDRESS=$PACKAGE_ID"
