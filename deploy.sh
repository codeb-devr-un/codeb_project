#!/bin/bash
set -e

# Configuration
SERVER="root@141.164.60.51"
APP_NAME="workb-cms"
PORT=3200
REMOTE_DIR="/var/www/workb-cms"

echo "🚀 Starting deployment to $SERVER..."

# Create remote directory
echo "📁 Creating remote directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Sync code to server (excluding node_modules and .next)
echo "📤 Syncing code to server..."
rsync -avz --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.env.local' \
  ./ $SERVER:$REMOTE_DIR/

# Create production .env file
echo "📝 Creating production .env file..."
cat > /tmp/.env.production << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCDh_fwXU_6BTJWmAHh49THWSdW_cvCbCM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-cms-b0d78.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://project-cms-b0d78-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-cms-b0d78
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-cms-b0d78.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=739720693388
NEXT_PUBLIC_FIREBASE_APP_ID=1:739720693388:web:a462b9bde3480cf9075da9
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-30XDCMLF4F

# Production URLs
NEXT_PUBLIC_SOCKET_URL=https://workb.net
NEXT_PUBLIC_WORKFLOW_API_URL=https://workb.net

# Seed Data Configuration
SEED_ADMIN_EMAIL=admin@codeb.com
SEED_ADMIN_PASSWORD=admin123!
EOF

scp /tmp/.env.production $SERVER:$REMOTE_DIR/.env
rm /tmp/.env.production

# Build and run on server
echo "🔧 Building and deploying on server..."
ssh $SERVER << 'ENDSSH'
set -e
cd /var/www/workb-cms

echo "🏗️  Building container image..."
podman build -t workb-cms:latest .

echo "🛑 Stopping existing container..."
podman stop workb-cms 2>/dev/null || true
podman rm workb-cms 2>/dev/null || true

echo "▶️  Starting new container..."
podman run -d \
  --name workb-cms \
  --restart=always \
  -p 3200:3000 \
  --env-file /var/www/workb-cms/.env \
  workb-cms:latest

echo "⏳ Waiting for container to start..."
sleep 5

if podman ps | grep -q workb-cms; then
  echo "✅ Container is running!"
  podman logs --tail 30 workb-cms
else
  echo "❌ Container failed to start!"
  podman logs workb-cms
  exit 1
fi
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Application running on port $PORT"
