# 📋 Copy-Paste GitHub Secrets Setup

## 🔐 GitHub Repository Secrets - Ready to Copy & Paste

Go to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

### ✅ Railway Token (Already Provided)
```
Name: RAILWAY_TOKEN
Value: thoria=181c843c-29d4-4297-af37-2d72080adc88
```

### 🔑 Database & Cache URLs

#### MongoDB URI
```
Name: MONGODB_URI
Value: mongodb://localhost:27017
```
**Note:** Replace with your actual MongoDB Atlas connection string if using cloud MongoDB

#### Redis URL
```
Name: REDIS_URL
Value: redis://localhost:6379/0
```
**Note:** Replace with your actual Redis cloud URL if using cloud Redis

### 🔐 Security Keys

#### JWT Secret Key (From your .env.production)
```
Name: SECRET_KEY
Value: @d0B$1$jMI5$9Wy&BINb7afAx4eNG6WQTnpaxGNB9wu27BiN^WZkX3QjeX^rxOfL
```

#### OpenAI API Key (From your .env file)
```
Name: OPENAI_API_KEY
Value: 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
```

### 🔐 OAuth Keys (Optional - Currently Placeholder Values)

#### Google OAuth Client ID
```
Name: GOOGLE_OAUTH_CLIENT_ID
Value: your-google-oauth-client-id
```
**Note:** Replace with your actual Google OAuth Client ID from Google Cloud Console

#### Google OAuth Client Secret
```
Name: GOOGLE_OAUTH_CLIENT_SECRET
Value: your-google-oauth-client-secret
```
**Note:** Replace with your actual Google OAuth Client Secret from Google Cloud Console

### 📢 Slack Notifications (Optional)

#### Slack Webhook URL
```
Name: SLACK_WEBHOOK
Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```
**Note:** Replace with your actual Slack webhook URL if you want deployment notifications

## 🚀 Quick Setup Steps

1. **Copy each secret above** (Name and Value)
2. **Go to GitHub**: https://github.com/MalayThoria/Deadpool/settings/secrets/actions
3. **Click "New repository secret"**
4. **Paste the Name and Value** for each secret
5. **Click "Add secret"**
6. **Repeat for all secrets**

## ⚠️ Important Notes

### Production-Ready Values:
- ✅ **RAILWAY_TOKEN**: Ready to use
- ✅ **SECRET_KEY**: Production-ready JWT secret
- ✅ **OPENAI_API_KEY**: Your actual API key

### Values You May Need to Update:
- 🔄 **MONGODB_URI**: Update if using MongoDB Atlas
- 🔄 **REDIS_URL**: Update if using cloud Redis (Redis Cloud, AWS ElastiCache, etc.)
- 🔄 **GOOGLE_OAUTH_CLIENT_ID**: Replace with real Google OAuth credentials
- 🔄 **GOOGLE_OAUTH_CLIENT_SECRET**: Replace with real Google OAuth credentials

### Optional Values:
- 📢 **SLACK_WEBHOOK**: Only if you want Slack notifications

## 🔗 Getting Cloud Database URLs

### MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Redis Cloud (Recommended)
1. Go to https://redis.com/try-free
2. Create a database
3. Get connection string: `redis://username:password@host:port`

### Google OAuth Setup
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-railway-app.railway.app/auth/google/callback`
   - `http://localhost:3000/auth/google/callback`

## ✅ Verification Checklist

After adding all secrets, you should have:
- [ ] RAILWAY_TOKEN
- [ ] MONGODB_URI
- [ ] REDIS_URL
- [ ] SECRET_KEY
- [ ] OPENAI_API_KEY
- [ ] GOOGLE_OAUTH_CLIENT_ID (optional)
- [ ] GOOGLE_OAUTH_CLIENT_SECRET (optional)
- [ ] SLACK_WEBHOOK (optional)

## 🚀 Next Steps

1. **Add all secrets to GitHub**
2. **Push any change to master branch** to trigger deployment
3. **Monitor deployment** in GitHub Actions tab
4. **Get Railway URL** from deployment logs
5. **Update Vercel frontend** with Railway backend URL

---

**Ready to deploy!** 🎉 All values are extracted from your actual configuration files.