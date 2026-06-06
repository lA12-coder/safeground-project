#!/usr/bin/env bash
set -euo pipefail

# ── SafeGround Azure Deployment Script ──
# Prerequisites: az CLI logged in, Node 22+, npm ci completed
#
# Usage:
#   chmod +x scripts/az-deploy.sh
#   ./scripts/az-deploy.sh <resource-group> <app-name>
#
# Example:
#   ./scripts/az-deploy.sh safeground-rg safeground-app

if [ $# -lt 2 ]; then
  echo "Usage: $0 <resource-group> <app-name>"
  exit 1
fi

RG="$1"
APP="$2"
DEPLOY_ZIP="/tmp/safeground-deploy.zip"

echo "🏗️  Building Next.js..."
npm run build

echo "📦 Creating deployment package..."
rm -f "$DEPLOY_ZIP"

# Azure App Service zip deploy expects the app at root.
# The standalone output nests under monorepo path — we adjust.
STANDALONE_SRC=".next/standalone/hackaton/safeground-project"
if [ -d "$STANDALONE_SRC" ]; then
  cp -r "$STANDALONE_SRC"/* .next/standalone/ 2>/dev/null || true
fi

zip -r "$DEPLOY_ZIP" \
  .next \
  package.json \
  package-lock.json \
  public \
  node_modules \
  next.config.mjs \
  -x "node_modules/.cache/**" \
  -x ".next/cache/**"

echo "🚀 Deploying to Azure App Service: $APP (rg: $RG)..."
az webapp deploy \
  --resource-group "$RG" \
  --name "$APP" \
  --src-path "$DEPLOY_ZIP" \
  --type zip \
  --async true

echo "✅ Deployment initiated. Monitor at:"
echo "   https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/$RG/providers/Microsoft.Web/sites/$APP/deployment"
echo ""
echo "   Live at: https://$APP.azurewebsites.net"

rm -f "$DEPLOY_ZIP"
