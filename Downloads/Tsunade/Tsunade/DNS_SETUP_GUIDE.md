# DNS Setup Guide

## LP Assistant Healthcare Platform - Domain Configuration

This guide helps you configure your domain's DNS settings for the LP Assistant Healthcare Platform deployment.

## 📋 Prerequisites

- A registered domain name
- Access to your domain registrar's DNS management panel
- Your server's public IP address (for self-hosted) or cloud platform URLs

## 🌐 DNS Configuration Options

### Option 1: Self-Hosted Server

If you're hosting on your own server or VPS:

#### Required DNS Records

```
# A Records (IPv4)
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600

# AAAA Records (IPv6) - Optional
Type: AAAA
Name: @
Value: YOUR_SERVER_IPV6
TTL: 3600

Type: AAAA
Name: www
Value: YOUR_SERVER_IPV6
TTL: 3600

# CNAME Records for subdomains
Type: CNAME
Name: api
Value: yourdomain.com
TTL: 3600

Type: CNAME
Name: monitoring
Value: yourdomain.com
TTL: 3600
```

### Option 2: Cloud Platform Deployment

#### Railway
```
# CNAME Record
Type: CNAME
Name: @
Value: your-app.railway.app
TTL: 3600

Type: CNAME
Name: www
Value: your-app.railway.app
TTL: 3600
```

#### DigitalOcean App Platform
```
# CNAME Record
Type: CNAME
Name: @
Value: your-app.ondigitalocean.app
TTL: 3600

Type: CNAME
Name: www
Value: your-app.ondigitalocean.app
TTL: 3600
```

#### AWS (with CloudFront)
```
# CNAME Record
Type: CNAME
Name: @
Value: your-distribution.cloudfront.net
TTL: 3600

Type: CNAME
Name: www
Value: your-distribution.cloudfront.net
TTL: 3600
```

#### Google Cloud Run
```
# CNAME Record
Type: CNAME
Name: @
Value: ghs.googlehosted.com
TTL: 3600

Type: CNAME
Name: www
Value: ghs.googlehosted.com
TTL: 3600
```

## 🔧 DNS Provider Specific Instructions

### Cloudflare

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain

2. **Add DNS Records**
   - Click "DNS" tab
   - Click "Add record"
   - Add the required records from above
   - Set Proxy status to "Proxied" for enhanced security

3. **SSL/TLS Settings**
   - Go to SSL/TLS tab
   - Set encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

4. **Page Rules (Optional)**
   ```
   Rule: http://*yourdomain.com/*
   Setting: Always Use HTTPS
   ```

### GoDaddy

1. **Access DNS Management**
   - Login to GoDaddy account
   - Go to "My Products"
   - Click "DNS" next to your domain

2. **Add Records**
   - Click "Add" button
   - Select record type and add values
   - Save changes

### Namecheap

1. **Access Advanced DNS**
   - Login to Namecheap account
   - Go to Domain List
   - Click "Manage" next to your domain
   - Go to "Advanced DNS" tab

2. **Add Host Records**
   - Click "Add New Record"
   - Select type and add values
   - Save all changes

### AWS Route 53

1. **Create Hosted Zone**
   ```bash
   aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)
   ```

2. **Add Records**
   ```bash
   # Create A record
   aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch file://change-batch.json
   ```

3. **Example change-batch.json**
   ```json
   {
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "yourdomain.com",
           "Type": "A",
           "TTL": 300,
           "ResourceRecords": [
             {
               "Value": "YOUR_SERVER_IP"
             }
           ]
         }
       }
     ]
   }
   ```

## 🔍 DNS Verification

### Using Command Line Tools

```bash
# Check A record
nslookup yourdomain.com

# Check CNAME record
nslookup www.yourdomain.com

# Check all DNS records
dig yourdomain.com ANY

# Check from specific DNS server
nslookup yourdomain.com 8.8.8.8
```

### Using Online Tools

- **DNS Checker**: https://dnschecker.org
- **What's My DNS**: https://whatsmydns.net
- **DNS Lookup**: https://mxtoolbox.com/DNSLookup.aspx

## ⚡ Performance Optimization

### CDN Configuration

#### Cloudflare (Recommended)
1. **Enable Cloudflare**
   - Add your domain to Cloudflare
   - Update nameservers at your registrar
   - Enable "Proxied" for main records

2. **Optimization Settings**
   - Auto Minify: CSS, JavaScript, HTML
   - Brotli Compression: Enabled
   - Rocket Loader: Enabled
   - Polish: Enabled

#### AWS CloudFront
1. **Create Distribution**
   ```bash
   aws cloudfront create-distribution --distribution-config file://distribution-config.json
   ```

2. **Configure Origin**
   - Origin Domain: your-alb.region.elb.amazonaws.com
   - Protocol: HTTPS Only
   - Caching: Optimized for web

### DNS Performance

```
# Recommended TTL values
A Records: 3600 (1 hour)
CNAME Records: 3600 (1 hour)
MX Records: 3600 (1 hour)
TXT Records: 300 (5 minutes)
```

## 🔒 Security Configuration

### DNS Security Records

```
# SPF Record (Email security)
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"

# DMARC Record (Email security)
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"

# DKIM Record (Email security)
Type: TXT
Name: default._domainkey
Value: "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"

# CAA Record (Certificate Authority Authorization)
Type: CAA
Name: @
Value: "0 issue \"letsencrypt.org\""
```

### DNSSEC (Optional)

Enable DNSSEC at your DNS provider for additional security:

1. **Cloudflare**: Automatically enabled
2. **Route 53**: Enable in hosted zone settings
3. **Other providers**: Check provider documentation

## 🚨 Troubleshooting

### Common Issues

1. **DNS Not Propagating**
   ```bash
   # Check propagation status
   dig yourdomain.com @8.8.8.8
   dig yourdomain.com @1.1.1.1
   
   # Clear local DNS cache
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```

2. **SSL Certificate Issues**
   ```bash
   # Check certificate
   openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
   
   # Check certificate expiry
   echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
   ```

3. **Wrong IP Resolution**
   - Check TTL values (lower for testing)
   - Verify records at DNS provider
   - Wait for full propagation (up to 48 hours)

### DNS Propagation Time

- **Typical propagation**: 1-4 hours
- **Maximum propagation**: 24-48 hours
- **Factors affecting speed**:
  - TTL values
  - DNS provider
  - Geographic location
  - ISP caching policies

## 📊 Monitoring DNS

### Automated Monitoring

```bash
# Create monitoring script
#!/bin/bash
# dns-monitor.sh

DOMAIN="yourdomain.com"
EXPECTED_IP="YOUR_SERVER_IP"

CURRENT_IP=$(dig +short $DOMAIN @8.8.8.8)

if [ "$CURRENT_IP" != "$EXPECTED_IP" ]; then
    echo "DNS mismatch detected for $DOMAIN"
    echo "Expected: $EXPECTED_IP"
    echo "Current: $CURRENT_IP"
    # Send alert (email, Slack, etc.)
fi
```

### Monitoring Services

- **Pingdom**: DNS monitoring and alerts
- **UptimeRobot**: Free DNS monitoring
- **StatusCake**: DNS and SSL monitoring
- **AWS Route 53 Health Checks**: Integrated monitoring

## 📝 DNS Configuration Checklist

- [ ] A record for root domain (@)
- [ ] A record for www subdomain
- [ ] CNAME records for api, monitoring subdomains
- [ ] MX records for email (if needed)
- [ ] TXT records for domain verification
- [ ] SPF record for email security
- [ ] DMARC record for email security
- [ ] CAA record for SSL security
- [ ] DNS propagation verified
- [ ] SSL certificate working
- [ ] HTTP to HTTPS redirect working
- [ ] All subdomains accessible
- [ ] Monitoring configured

## 🎯 Next Steps

After DNS configuration:

1. **Verify domain resolution**
2. **Run SSL setup script**
3. **Test application accessibility**
4. **Configure monitoring**
5. **Set up backup procedures**

---

**Note**: DNS changes can take up to 48 hours to fully propagate worldwide. Be patient and use online DNS checking tools to monitor propagation status.

For additional support, consult your DNS provider's documentation or contact their support team.