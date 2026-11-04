# TAVRO STUDIO® — Hostinger Production Deployment Guide

This guide provides end-to-end instructions for deploying the **TAVRO Studio** agency website and private administration portal on **Hostinger**.

---

## 1. Architecture Overview
- **Runtime**: Native Node.js (Version 18.x, 20.x, or 22.x).
- **Dependencies**: **Zero third-party npm dependencies required!** The server is built entirely with Node.js standard libraries (`http`, `fs`, `path`, `crypto`, `url`).
- **Data Persistence**: JSON file storage inside the `/data` directory (`projects.json`, `services.json`, `inquiries.json`).
- **Admin Portal**: Integrated at `/admin` protected by server-side SHA/crypto token authentication.

---

## 2. Option A: Deploying on Hostinger Web / Cloud Hosting (hPanel)

If you have Hostinger Web Hosting or Cloud Hosting with the **Node.js** selector in hPanel:

### Step 1: Upload Files
1. In Hostinger **hPanel**, go to **File Manager** (or connect via SFTP/Git).
2. Navigate to your domain's folder (e.g., `public_html` or an application subfolder).
3. Upload all files from the `Tavro-Studio-Portfolio` directory:
   ```text
   ├── admin.html
   ├── favicon.ico
   ├── index.html
   ├── server.js
   ├── css/
   │   ├── admin.css
   │   └── style.css
   ├── data/
   │   ├── inquiries.json
   │   ├── projects.json
   │   └── services.json
   └── js/
       ├── admin.js
       └── main.js
   ```

### Step 2: Configure Node.js in hPanel
1. In hPanel, navigate to **Websites** → **Manage** → search for **Node.js**.
2. Click **Create Application** (or **Configure**):
   - **Node.js version**: Select `20.x` or `18.x`
   - **Application mode**: `Production`
   - **Application root**: `public_html` (or your chosen path)
   - **Application startup file**: `server.js`
3. In **Environment Variables**, add:
   - `ADMIN_PASSWORD`: Your secret master password for `/admin` (e.g. `YourSecurePass2026!`)
   - `PORT`: (Hostinger assigns this automatically, or leave blank)
4. Click **Create** or **Start**.

### Step 3: Verify the Deployment
- Visit your website domain: `https://your-domain.com/` (loads public agency website)
- Visit the Admin Portal: `https://your-domain.com/admin` (master key authentication)

---

## 3. Option B: Deploying on Hostinger VPS (Ubuntu / Debian)

If you are using a Hostinger VPS (KVM), this setup provides full control, automatic restarts via PM2, and reverse proxying through Nginx.

### Step 1: Connect to your VPS
```bash
ssh root@YOUR_HOSTINGER_SERVER_IP
```

### Step 2: Install Node.js & PM2
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git

# Install PM2 process manager
sudo npm install -g pm2
```

### Step 3: Clone or Upload Files
```bash
# Create directory for TAVRO Studio
mkdir -p /var/www/tavrostudio
cd /var/www/tavrostudio

# Clone your repository or upload files here
# Ensure permissions
sudo chown -R www-data:www-data /var/www/tavrostudio
sudo chmod -R 775 /var/www/tavrostudio/data
```

### Step 4: Start the Server with PM2
```bash
cd /var/www/tavrostudio

# Start with custom admin password
ADMIN_PASSWORD="YourSecurePassword2026" PORT=8000 pm2 start server.js --name "tavro-studio"

# Enable auto-start on VPS reboot
pm2 startup
pm2 save
```

### Step 5: Configure Nginx Reverse Proxy
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/tavrostudio
```

Paste the following block:
```nginx
server {
    listen 80;
    server_name tavrostudio.in www.tavrostudio.in;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/tavrostudio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Install Free SSL Certificate (Let's Encrypt)
Once your domain `tavrostudio.in` is pointed to your VPS IP:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tavrostudio.in -d www.tavrostudio.in
```

---

## 4. Connecting Domain: `tavrostudio.in` (When Purchased)

1. **Purchased on Hostinger**:
   - In hPanel, go to **Domains** → select `tavrostudio.in` → connect it directly to your hosting account or VPS.
2. **Purchased on another registrar (e.g. GoDaddy, Namecheap)**:
   - Add these **DNS A Records** in your domain DNS manager:
     - Host: `@` → Points to: `YOUR_HOSTINGER_SERVER_IP`
     - Host: `www` → Points to: `YOUR_HOSTINGER_SERVER_IP`
   - Wait 10–30 minutes for DNS propagation worldwide.

---

## 5. Security & Maintenance Checklist
- **Change Default Admin Password**: Set `ADMIN_PASSWORD` in environment variables.
- **Inquiry Backups**: Inquiries are stored in `/data/inquiries.json`. Make periodic backups or view them directly through `/admin`.
- **Live Flagship Showcase**: When ready to add new client websites, either edit `data/projects.json` or use the Admin Portal (`/admin` → **Add New Project**).

