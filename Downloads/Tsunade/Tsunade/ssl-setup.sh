#!/bin/bash

# SSL Certificate Setup Script
# LP Assistant Healthcare Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to install Certbot
install_certbot() {
    print_status "Installing Certbot..."
    
    # Detect OS
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL/Fedora
        if command -v dnf >/dev/null 2>&1; then
            dnf install -y certbot python3-certbot-nginx
        else
            yum install -y certbot python3-certbot-nginx
        fi
    else
        print_error "Unsupported operating system"
        exit 1
    fi
    
    print_success "Certbot installed successfully"
}

# Function to setup SSL certificate
setup_ssl() {
    local domain=$1
    local email=$2
    
    print_status "Setting up SSL certificate for $domain..."
    
    # Stop nginx temporarily
    systemctl stop nginx || true
    
    # Generate certificate using standalone mode
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$email" \
        -d "$domain" \
        -d "www.$domain"
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate generated successfully"
    else
        print_error "Failed to generate SSL certificate"
        exit 1
    fi
    
    # Copy certificates to nginx directory
    mkdir -p /etc/nginx/ssl
    cp "/etc/letsencrypt/live/$domain/fullchain.pem" /etc/nginx/ssl/
    cp "/etc/letsencrypt/live/$domain/privkey.pem" /etc/nginx/ssl/
    cp "/etc/letsencrypt/live/$domain/chain.pem" /etc/nginx/ssl/
    
    # Set proper permissions
    chmod 644 /etc/nginx/ssl/fullchain.pem
    chmod 644 /etc/nginx/ssl/chain.pem
    chmod 600 /etc/nginx/ssl/privkey.pem
    chown root:root /etc/nginx/ssl/*
    
    print_success "SSL certificates copied to nginx directory"
}

# Function to setup auto-renewal
setup_auto_renewal() {
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

# Renew certificates
certbot renew --quiet --no-self-upgrade

# Reload nginx if renewal was successful
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "$(date): SSL certificates renewed successfully" >> /var/log/ssl-renewal.log
else
    echo "$(date): SSL certificate renewal failed" >> /var/log/ssl-renewal.log
fi
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    print_success "Auto-renewal setup completed"
    print_status "Certificates will be checked for renewal daily at 12:00 PM"
}

# Function to update nginx configuration
update_nginx_config() {
    local domain=$1
    
    print_status "Updating nginx configuration for $domain..."
    
    # Update domain in nginx config
    sed -i "s/yourdomain\.com/$domain/g" /etc/nginx/nginx.conf
    sed -i "s/yourdomain\.com/$domain/g" nginx/production.conf
    
    # Test nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
        print_success "Nginx configuration updated successfully"
        systemctl restart nginx
        print_success "Nginx restarted"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to verify SSL setup
verify_ssl() {
    local domain=$1
    
    print_status "Verifying SSL setup for $domain..."
    
    # Wait a moment for nginx to start
    sleep 5
    
    # Test HTTPS connection
    if curl -s -I "https://$domain" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
        print_success "HTTPS is working correctly"
    else
        print_warning "HTTPS test failed. Please check your configuration"
    fi
    
    # Test HTTP to HTTPS redirect
    if curl -s -I "http://$domain" | grep -q "301\|302"; then
        print_success "HTTP to HTTPS redirect is working"
    else
        print_warning "HTTP to HTTPS redirect may not be working"
    fi
    
    # Check SSL certificate
    print_status "SSL Certificate Information:"
    echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Check if ufw is available
    if command -v ufw >/dev/null 2>&1; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        print_success "UFW firewall configured"
    elif command -v firewall-cmd >/dev/null 2>&1; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "Firewalld configured"
    else
        print_warning "No supported firewall found. Please configure manually"
    fi
}

# Main function
main() {
    echo "======================================"
    echo "  SSL Certificate Setup"
    echo "  LP Assistant Healthcare Platform"
    echo "======================================"
    
    # Check if running as root
    check_root
    
    # Get domain and email
    if [ -z "$1" ]; then
        read -p "Enter your domain name (e.g., example.com): " DOMAIN
    else
        DOMAIN=$1
    fi
    
    if [ -z "$2" ]; then
        read -p "Enter your email address: " EMAIL
    else
        EMAIL=$2
    fi
    
    # Validate inputs
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_error "Domain and email are required"
        exit 1
    fi
    
    print_status "Setting up SSL for domain: $DOMAIN"
    print_status "Email: $EMAIL"
    
    # Install Certbot if not present
    if ! command -v certbot >/dev/null 2>&1; then
        install_certbot
    fi
    
    # Setup firewall
    setup_firewall
    
    # Setup SSL certificate
    setup_ssl "$DOMAIN" "$EMAIL"
    
    # Setup auto-renewal
    setup_auto_renewal
    
    # Update nginx configuration
    update_nginx_config "$DOMAIN"
    
    # Verify SSL setup
    verify_ssl "$DOMAIN"
    
    print_success "SSL setup completed successfully!"
    echo ""
    print_status "Your website is now accessible at:"
    echo "  - https://$DOMAIN"
    echo "  - https://www.$DOMAIN"
    echo ""
    print_status "Certificate will be automatically renewed every 60 days"
    print_status "Renewal logs are available at: /var/log/ssl-renewal.log"
}

# Run main function with command line arguments
main "$@"