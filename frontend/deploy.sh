#!/bin/bash

# Define Variables
SERVER="root@ssh.xilyor.com"
PORT="49234"
REMOTE_DIR="/var/www/la3rousa.com/"
BUILD_DIR="dist"
SSHPASS="J71Hs5pg3CSe34FnAi"


# 🛠 Ask user if they want to build
read -p "📢 Do you want to build the app? (yes/no): " SEND_ENV

# If user says yes, then build the app
if [[ "$SEND_ENV" == "yes" || "$SEND_ENV" == "y" ]]; then
  echo "✅ Building the app..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed. Aborting deployment!"
    exit 1
  else
    echo "✅ Build completed successfully!"
  fi
else
  echo "🚫 Skipping build step."
fi

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
