#!/bin/bash

# Define Variables
SERVER="root@ssh.xilyor.com"
PORT="49234"
REMOTE_DIR="/var/www/api.la3rousa.com/"
FILES=("build/bundle.cjs" "package.json")
SSHPASS=J71Hs5pg3CSe34FnAi

# 🛠 Ask user if they want to send the .env file
read -p "📢 Do you want to include the .env file in the deployment? (yes/no): " SEND_ENV

# If user says yes, add .env to the files list
if [[ "$SEND_ENV" == "yes" || "$SEND_ENV" == "y" ]]; then
  FILES+=(".env")
  echo "✅ .env file will be included in the deployment."
else
  echo "🚫 Skipping .env file."
fi

# 🔑 Ask for SSH password once
# read -s -p "🔑 Enter SSH password: " SSHPASS
# echo ""  # Move to a new line after password input

# 📢 Start Deployment Message
echo "🚀 Starting deployment to $SERVER ..."

# Loop through each file and copy it
for FILE in "${FILES[@]}"; do
  echo "📤 Copying $FILE to the server..."
  
  # Use SSH password stored in variable
  sshpass -p "$SSHPASS" scp -P "$PORT" "$FILE" "$SERVER:$REMOTE_DIR"
  
  # Check if SCP was successful
  if [ $? -eq 0 ]; then
    echo "✅ Successfully copied $FILE!"
  else
    echo "❌ Error: Failed to copy $FILE. Aborting deployment!"
    exit 1
  fi
done

# 📢 Restarting the remote service Message
echo "🚀 Restarting the remote service $SERVER -> modaSync.service ..."
# restart the distant service
sshpass -p "$SSHPASS" ssh -p "$PORT" "$SERVER" "sudo systemctl restart modaSync.service"

# check the restart service returned value
if [ $? -eq 0 ]; then
  echo "✅ Successfully restarted the service!"
else
  echo "❌ Error: Failed to restart the service. Aborting deployment!"
  exit 1
fi

# 🎉 Deployment Successful
echo "🎉 Deployment completed successfully! Your files are now on the server."
