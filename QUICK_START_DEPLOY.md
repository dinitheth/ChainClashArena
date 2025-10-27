# 🚀 Quick Start: Deploy Frontend in 5 Minutes

This guide gets your Chain Clash frontend live on the internet in just a few steps!

## What You're Deploying

A beautiful, interactive game UI that demonstrates:
- ✅ Game board visualization
- ✅ Player stats and controls
- ✅ Unit deployment interface
- ✅ Professional design with Tailwind CSS
- ✅ Responsive layout for all devices

**Note**: The deployed frontend will show demo data until connected to a live Linera blockchain. Perfect for UI demonstrations!

---

## Option 1: Netlify (Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy
1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Settings are auto-detected from `netlify.toml` ✨
5. Click **"Deploy site"**

### Step 3: Done! 🎉
Your site will be live at: `https://your-site-name.netlify.app`

**That's it!** The frontend is now live on the internet.

---

## Option 2: Vercel (Also Easy)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy
1. Go to **https://vercel.com/new**
2. Click **"Import Project"**
3. Select your **GitHub repository**
4. Settings are auto-detected from `vercel.json` ✨
5. Click **"Deploy"**

### Step 3: Done! 🎉
Your site will be live at: `https://your-project.vercel.app`

---

## Optional: Connect to Linera Blockchain

If you have a deployed Linera application and want live blockchain integration:

### On Netlify:
1. Go to **Site settings** → **Environment variables**
2. Add: `VITE_GRAPHQL_ENDPOINT`
3. Value: `https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>`
4. **Redeploy** the site

### On Vercel:
1. Go to **Project Settings** → **Environment Variables**
2. Add: `VITE_GRAPHQL_ENDPOINT`
3. Value: `https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>`
4. **Redeploy** from Deployments tab

---

## What You Get

### Demo Mode (Default)
- Beautiful game interface
- Interactive board
- Sample game state
- Perfect for showcasing UI/UX

### Connected Mode (With Linera)
- Everything above, plus:
- Live blockchain state
- Real game logic
- Cross-chain messaging
- Persistent games

---

## Troubleshooting

**Build Failed?**
- Check that Node.js 18+ is specified (already in configs)
- Clear cache and retry deployment

**Site Loads But GraphQL Errors?**
- This is normal if not connected to Linera network
- Frontend shows demo data by default
- To connect: Add `VITE_GRAPHQL_ENDPOINT` environment variable

**Need Help?**
- See full guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Check Netlify/Vercel build logs
- Review browser console in DevTools

---

## URLs to Share

After deployment, you'll get URLs like:

**Netlify**: `https://chain-clash.netlify.app`
**Vercel**: `https://chain-clash.vercel.app`

Share these links to show off your Chain Clash UI!

---

## Next Steps

1. ✅ Deploy frontend (you're doing this now!)
2. 📱 Test on mobile devices
3. 🎨 Customize colors/design if desired
4. ⛓️ Deploy Linera contracts for full integration
5. 🌐 Add custom domain (optional)

---

**Total Time**: ~5 minutes from commit to live site! 🚀
