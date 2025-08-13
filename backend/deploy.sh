#!/bin/bash

# E-commerce API Deployment Script
# 
# SECURITY NOTE: For production use, consider using SSH keys instead of passwords
# and storing sensitive configuration in environment variables or a secure vault.
#
# Define Variables
SERVER="root@ssh.xilyor.com"
PORT="49234"
REMOTE_DIR="/var/www/api.la3rousa.com/"
SERVICE_NAME="ecommerce-api.service"

# Files to deploy (adjust based on your build process)
FILES=("server.js" "package.json" "routes/" "models/" "middleware/")

# 🔑 Prompt for SSH password securely
read -s -p "🔑 Enter SSH password: " SSHPASS
echo ""  # Move to a new line after password input

# 🛠 Ask user if they want to send the .env file
read -p "📢 Do you want to include the .env file in the deployment? (yes/no): " SEND_ENV

# If user says yes, add .env to the files list
if [[ "$SEND_ENV" == "yes" || "$SEND_ENV" == "y" ]]; then
  FILES+=(".env")
  echo "✅ .env file will be included in the deployment."
else
  echo "🚫 Skipping .env file."
fi

# 📢 Start Deployment Message
echo "🚀 Starting deployment to $SERVER ..."

# Loop through each file/directory and copy it
for FILE in "${FILES[@]}"; do
  echo "📤 Copying $FILE to the server..."
  
  # Use scp with recursion for directories
  if [ -d "$FILE" ]; then
    sshpass -p "$SSHPASS" scp -r -P "$PORT" "$FILE" "$SERVER:$REMOTE_DIR"
  else
    sshpass -p "$SSHPASS" scp -P "$PORT" "$FILE" "$SERVER:$REMOTE_DIR"
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
sshpass -p "$SSHPASS" ssh -p "$PORT" "$SERVER" "cd $REMOTE_DIR && npm install --production"

if [ $? -eq 0 ]; then
  echo "✅ Dependencies installed successfully!"
else
  echo "⚠️  Warning: Failed to install dependencies. Service restart may fail."
fi

# 🔄 Restart the remote service
echo "🔄 Restarting the remote service $SERVER -> $SERVICE_NAME ..."
sshpass -p "$SSHPASS" ssh -p "$PORT" "$SERVER" "sudo systemctl restart $SERVICE_NAME"

# Check if service restart was successful
if [ $? -eq 0 ]; then
  echo "✅ Successfully restarted $SERVICE_NAME!"
  
  # Check service status
  echo "🔍 Checking service status..."
  sshpass -p "$SSHPASS" ssh -p "$PORT" "$SERVER" "sudo systemctl status $SERVICE_NAME --no-pager -l"
else
  echo "❌ Error: Failed to restart $SERVICE_NAME!"
  echo "🔍 Checking service logs for troubleshooting..."
  sshpass -p "$SSHPASS" ssh -p "$PORT" "$SERVER" "sudo journalctl -u $SERVICE_NAME --no-pager -l -n 10"
  exit 1
fi

# 🎉 Deployment Successful
echo "🎉 Deployment completed successfully! Your files are now on the server."
