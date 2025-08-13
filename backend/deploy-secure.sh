#!/bin/bash

# E-commerce API Secure Deployment Script
# This version uses SSH keys for authentication instead of passwords

# Define Variables (can be overridden by environment variables)
SERVER="${DEPLOY_SERVER:-root@ssh.xilyor.com}"
PORT="${DEPLOY_PORT:-49234}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/var/www/api.la3rousa.com/}"
SERVICE_NAME="${DEPLOY_SERVICE_NAME:-ecommerce-api.service}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

# Files to deploy
FILES=("server.js" "package.json" "routes/" "models/" "middleware/")

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "❌ Error: SSH key not found at $SSH_KEY"
  echo "Please generate SSH keys or specify the correct path using SSH_KEY environment variable"
  exit 1
fi

# 🛠 Ask user if they want to send the .env file
read -p "📢 Do you want to include the .env file in the deployment? (yes/no): " SEND_ENV

if [[ "$SEND_ENV" == "yes" || "$SEND_ENV" == "y" ]]; then
  FILES+=(".env")
  echo "✅ .env file will be included in the deployment."
else
  echo "🚫 Skipping .env file."
fi

# 📢 Start Deployment Message
echo "🚀 Starting secure deployment to $SERVER ..."

# Loop through each file/directory and copy it
for FILE in "${FILES[@]}"; do
  echo "📤 Copying $FILE to the server..."
  
  # Use scp with SSH key authentication
  if [ -d "$FILE" ]; then
    scp -r -P "$PORT" -i "$SSH_KEY" "$FILE" "$SERVER:$REMOTE_DIR"
  else
    scp -P "$PORT" -i "$SSH_KEY" "$FILE" "$SERVER:$REMOTE_DIR"
  fi
  
  # Check if SCP was successful
  if [ $? -eq 0 ]; then
    echo "✅ Successfully copied $FILE!"
  else
    echo "❌ Error: Failed to copy $FILE. Aborting deployment!"
    exit 1
  fi
done

# 📦 Install dependencies on remote server
echo "📦 Installing dependencies on remote server..."
ssh -p "$PORT" -i "$SSH_KEY" "$SERVER" "cd $REMOTE_DIR && npm install --production"

if [ $? -eq 0 ]; then
  echo "✅ Dependencies installed successfully!"
else
  echo "⚠️  Warning: Failed to install dependencies. Service restart may fail."
fi

# 🔄 Restart the remote service
echo "🔄 Restarting the remote service $SERVER -> $SERVICE_NAME ..."
ssh -p "$PORT" -i "$SSH_KEY" "$SERVER" "sudo systemctl restart $SERVICE_NAME"

# Check if service restart was successful
if [ $? -eq 0 ]; then
  echo "✅ Successfully restarted $SERVICE_NAME!"
  
  # Check service status
  echo "🔍 Checking service status..."
  ssh -p "$PORT" -i "$SSH_KEY" "$SERVER" "sudo systemctl status $SERVICE_NAME --no-pager -l"
else
  echo "❌ Error: Failed to restart $SERVICE_NAME!"
  echo "🔍 Checking service logs for troubleshooting..."
  ssh -p "$PORT" -i "$SSH_KEY" "$SERVER" "sudo journalctl -u $SERVICE_NAME --no-pager -l -n 10"
  exit 1
fi

# 🎉 Deployment Successful
echo "🎉 Secure deployment completed successfully! Your files are now on the server."