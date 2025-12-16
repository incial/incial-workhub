#!/bin/bash

################################################################################
# Application Deployment Script
# This script helps deploy the Incial Backend application on EC2
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Default values
APP_DIR=~/incial-backend
GITHUB_REPO="https://github.com/Skywalker690/server.git"

echo "========================================"
echo "Incial Backend - Deployment Script"
echo "========================================"
echo ""

# Create application directory
print_header "Creating Application Directory"
mkdir -p $APP_DIR
cd $APP_DIR
print_success "Application directory created: $APP_DIR"
echo ""

# Setup PostgreSQL with Docker Compose
print_header "Setting up PostgreSQL Database"

if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
    print_info "Creating docker-compose.yml for PostgreSQL..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: incial-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: incialdb
      POSTGRES_USER: incial_user
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_HOST_AUTH_METHOD: scram-sha-256
      POSTGRES_INITDB_ARGS: --auth-host=scram-sha-256
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U incial_user -d incialdb"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
EOF
    print_success "docker-compose.yml created"
else
    print_info "docker-compose.yml already exists"
fi

# Create .env file for Docker Compose
if [ ! -f "$APP_DIR/.env" ]; then
    print_info "Creating .env file for database..."
    # Generate a random password
    RANDOM_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    cat > .env << EOF
# Database Password - Generated securely
DB_PASSWORD=$RANDOM_PASSWORD
EOF
    chmod 600 .env
    print_success ".env file created with secure random password"
    print_info "Database password: $RANDOM_PASSWORD"
    print_info "Saved in: $APP_DIR/.env"
else
    print_info ".env file already exists"
fi

echo ""

# Start PostgreSQL
print_info "Starting PostgreSQL container..."
docker-compose up -d postgres
sleep 5

if docker ps | grep -q incial-postgres; then
    print_success "PostgreSQL is running"
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

echo ""

# Create application environment file
print_header "Creating Application Configuration"

if [ ! -f "$APP_DIR/.env.production" ]; then
    print_info "Creating .env.production file..."
    cat > .env.production << 'EOF'
# Server Configuration
SERVER_PORT=8080

# Database Configuration (PostgreSQL running in Docker)
DB_URL=jdbc:postgresql://localhost:5432/incialdb
DB_USER=incial_user
DB_PASS=change_me_to_secure_password

# JWT Configuration (MUST be changed - minimum 64 characters)
JWT_SECRET=CHANGE_THIS_TO_A_VERY_LONG_SECURE_RANDOM_STRING_MINIMUM_64_CHARACTERS_REQUIRED

# Mail Configuration (Gmail SMTP)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF
    chmod 600 .env.production
    print_success ".env.production created"
    print_error "IMPORTANT: Edit .env.production and configure all values!"
    echo "           Run: nano $APP_DIR/.env.production"
else
    print_info ".env.production already exists"
fi

echo ""

# Create start script
print_header "Creating Start/Stop Scripts"

if [ ! -f "$APP_DIR/start-app.sh" ]; then
    print_info "Creating start-app.sh..."
    cat > start-app.sh << 'EOF'
#!/bin/bash

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Set Spring profile
export SPRING_PROFILES_ACTIVE=prod

# Create logs directory
mkdir -p logs

# Find JAR file (supports any version)
JAR_FILE=$(ls backend-*.jar 2>/dev/null | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "Error: No backend JAR file found!"
    echo "Please upload or build the JAR file first."
    exit 1
fi

echo "Starting application with JAR: $JAR_FILE"

# Start application
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -Djava.security.egd=file:/dev/./urandom \
     -jar $JAR_FILE \
     >> logs/application.log 2>&1 &

# Save PID
echo $! > app.pid

echo "Application started with PID: $(cat app.pid)"
echo "View logs: tail -f logs/application.log"
EOF
    chmod +x start-app.sh
    print_success "start-app.sh created"
else
    print_info "start-app.sh already exists"
fi

if [ ! -f "$APP_DIR/stop-app.sh" ]; then
    print_info "Creating stop-app.sh..."
    cat > stop-app.sh << 'EOF'
#!/bin/bash

if [ -f app.pid ]; then
    PID=$(cat app.pid)
    echo "Stopping application with PID: $PID"
    kill $PID 2>/dev/null || echo "Process not found or already stopped"
    rm -f app.pid
    echo "Application stopped"
else
    echo "No PID file found. Application may not be running."
fi
EOF
    chmod +x stop-app.sh
    print_success "stop-app.sh created"
else
    print_info "stop-app.sh already exists"
fi

echo ""

# Create backup script
if [ ! -f "$APP_DIR/backup-db.sh" ]; then
    print_info "Creating backup-db.sh..."
    cat > backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR=~/incial-backend/backups
mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/incialdb_$TIMESTAMP.sql"

echo "Starting database backup..."

# Backup database
docker exec incial-postgres pg_dump -U incial_user incialdb > $BACKUP_FILE

if [ $? -eq 0 ]; then
    # Compress backup
    gzip $BACKUP_FILE
    echo "Backup completed: ${BACKUP_FILE}.gz"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "Old backups cleaned (keeping last 7 days)"
else
    echo "Backup failed!"
    rm -f $BACKUP_FILE
    exit 1
fi
EOF
    chmod +x backup-db.sh
    print_success "backup-db.sh created"
else
    print_info "backup-db.sh already exists"
fi

echo ""

# Summary
print_header "Deployment Setup Complete!"
echo ""
print_success "Setup Summary:"
echo "  ✓ Application directory: $APP_DIR"
echo "  ✓ PostgreSQL database running"
echo "  ✓ Configuration files created"
echo "  ✓ Start/stop scripts created"
echo "  ✓ Backup script created"
echo ""

print_error "IMPORTANT NEXT STEPS:"
echo ""
echo "1. Configure environment variables:"
echo "   nano $APP_DIR/.env.production"
echo "   (Update DB_PASS, JWT_SECRET, MAIL credentials, etc.)"
echo ""
echo "2. Upload or build your application JAR:"
echo ""
echo "   Option A - Upload from local machine:"
echo "   scp -i your-key.pem target/backend-*.jar ubuntu@YOUR_IP:$APP_DIR/"
echo ""
echo "   Option B - Build on server:"
echo "   cd $APP_DIR"
echo "   git clone $GITHUB_REPO ."
echo "   docker build -t incial-backend:latest ."
echo ""
echo "3. Start the application:"
echo "   cd $APP_DIR"
echo "   ./start-app.sh"
echo ""
echo "4. Check application status:"
echo "   tail -f $APP_DIR/logs/application.log"
echo "   curl http://localhost:8080/actuator/health"
echo ""
print_info "For detailed instructions, see: docs/AWS-DEPLOYMENT-GUIDE.md"
echo ""
