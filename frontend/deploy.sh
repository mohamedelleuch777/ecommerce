#!/bin/bash

# Define Variables
SERVER="root@ssh.xilyor.com"
PORT="49234"
REMOTE_DIR="/var/www/la3rousa.com/"
BUILD_DIR="dist"
SSHPASS="J71Hs5pg3CSe34FnAi"

# 📢 Start Deployment Message
echo "🚀 Starting deployment to $SERVER ..."

# 📦 Sync the build directory using rsync over SSH with a password
echo "📦 Syncing contents of $BUILD_DIR to $REMOTE_DIR ..."

sshpass -p "$SSHPASS" rsync -avz --delete -e "ssh -p $PORT" "$BUILD_DIR/" "$SERVER:$REMOTE_DIR"

# ✅ Check if rsync succeeded
if [ $? -eq 0 ]; then
  echo "✅ Successfully deployed $BUILD_DIR to $SERVER!"
else
  echo "❌ Deployment failed during rsync. Aborting!"
  exit 1
fi

# 🎉 Deployment Completed
echo "🎉 Deployment completed successfully! Your React app is live."
