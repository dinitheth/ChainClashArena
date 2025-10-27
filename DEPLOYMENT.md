# Chain Clash - Deployment Guide

This guide covers deploying the Chain Clash frontend to Netlify or Vercel for demonstration purposes.

## Important Notes

⚠️ **The frontend can be deployed as a standalone demo**, but to connect to a live Linera blockchain:
- You need to deploy the Rust smart contracts to a Linera network (local or testnet)
- Set the GraphQL endpoint environment variable to point to your deployed application

The deployed frontend will show the beautiful game UI with demo data until connected to a real Linera network.

---

## Option 1: Deploy to Netlify

### Quick Deploy (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect the settings from `netlify.toml`
   - Click "Deploy site"

3. **Configure Environment Variables** (Optional)
   - Go to Site settings → Environment variables
   - Add `VITE_GRAPHQL_ENDPOINT` if connecting to a deployed Linera app
   - Example: `https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>`

### Manual Configuration

If not using `netlify.toml`:

**Build settings:**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Node version: 18

### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
netlify deploy --prod

# Or deploy with specific settings
cd frontend
netlify deploy --prod --dir=dist
```

---

## Option 2: Deploy to Vercel

### Quick Deploy (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect settings from `vercel.json`
   - Click "Deploy"

3. **Configure Environment Variables** (Optional)
   - Go to Project Settings → Environment Variables
   - Add `VITE_GRAPHQL_ENDPOINT` for production
   - Example: `https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>`

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod

# Or with environment variables
vercel --prod -e VITE_GRAPHQL_ENDPOINT=https://your-linera-endpoint
```

---

## Environment Variables

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory (use `.env.example` as template):

```bash
# For demo/development (default)
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql

# For deployed Linera application
VITE_GRAPHQL_ENDPOINT=https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>

# For backend proxy
VITE_BACKEND_PROXY_URL=http://localhost:3001
```

### Production Environment Variables

On Netlify or Vercel, set these in the dashboard:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `VITE_GRAPHQL_ENDPOINT` | `https://testnet-conway.linera.net/chains/e476.../applications/e476...` | GraphQL endpoint for deployed Linera app |
| `VITE_BACKEND_PROXY_URL` | `https://your-backend-proxy.com` | Backend proxy API URL (if using) |

---

## Connecting to Linera Network

### Local Development

```bash
# 1. Start local Linera network
linera net up --with-faucet

# 2. Deploy contracts
linera publish-and-create ...

# 3. Start Linera service
linera service --port 8080

# 4. Update frontend/.env
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>

# 5. Run frontend
cd frontend
npm run dev
```

### Testnet Deployment

```bash
# 1. Initialize testnet wallet
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# 2. Deploy contracts to testnet
linera publish-and-create ...

# 3. Get your application URL
# Example: https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>

# 4. Set environment variable on Netlify/Vercel
VITE_GRAPHQL_ENDPOINT=https://testnet-conway.linera.net/chains/<CHAIN_ID>/applications/<APP_ID>

# 5. Redeploy frontend
```

---

## Deployment Checklist

### Pre-deployment

- [ ] Code is pushed to GitHub
- [ ] All dependencies are in `package.json`
- [ ] Build command works locally: `cd frontend && npm run build`
- [ ] Environment variables are documented

### Post-deployment

- [ ] Site loads successfully
- [ ] UI renders the game board
- [ ] No console errors in browser DevTools
- [ ] All assets load correctly (CSS, images)
- [ ] Responsive design works on mobile

### Optional: Connect to Linera

- [ ] Linera contracts deployed (local or testnet)
- [ ] GraphQL endpoint URL obtained
- [ ] Environment variable set on hosting platform
- [ ] Frontend redeployed with new config
- [ ] GraphQL queries work from browser

---

## Custom Domain Setup

### On Netlify

1. Go to Domain settings → Add custom domain
2. Follow DNS configuration instructions
3. Enable HTTPS (automatic with Let's Encrypt)

### On Vercel

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. HTTPS is automatically enabled

---

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails during deployment

**Solutions**:
1. Check Node.js version (should be 18+)
2. Clear cache and retry:
   - Netlify: Deploys → Trigger deploy → Clear cache and deploy
   - Vercel: Deployments → ... → Redeploy
3. Check build logs for specific errors

### Environment Variables Not Working

**Issue**: GraphQL endpoint not connecting

**Solutions**:
1. Ensure variable name starts with `VITE_` prefix
2. Redeploy after adding environment variables
3. Check variable is set in production environment (not just preview)
4. Use `console.log(import.meta.env.VITE_GRAPHQL_ENDPOINT)` to debug

### 404 Errors on Routes

**Issue**: Page not found on refresh

**Solutions**:
- Netlify: Ensure `netlify.toml` has redirects configured (already done)
- Vercel: Ensure `vercel.json` has rewrites configured (already done)

### GraphQL Connection Errors

**Issue**: Cannot connect to Linera network

**Solutions**:
1. Verify Linera service is running
2. Check CORS settings on Linera service
3. Ensure GraphQL endpoint URL is correct
4. Test endpoint with curl or GraphQL playground

---

## Demo Deployment (No Blockchain)

For a quick demo without Linera network:

1. Deploy frontend as-is (no environment variables needed)
2. The UI will display the beautiful game interface with demo data
3. Use this for showcasing the UI/UX design
4. Share the link for visual demonstration

**Demo Features**:
- ✅ Beautiful game board
- ✅ Unit visualization
- ✅ Player stats display
- ✅ Action controls
- ✅ Responsive design
- ❌ Live blockchain integration (requires Linera network)

---

## Production Deployment (With Blockchain)

For full production with live blockchain:

1. Deploy Rust contracts to Linera testnet/mainnet
2. Set `VITE_GRAPHQL_ENDPOINT` environment variable
3. Optionally deploy backend proxy server
4. Set `VITE_BACKEND_PROXY_URL` if using proxy
5. Enable real-time features

**Production Features**:
- ✅ All demo features
- ✅ Live blockchain state
- ✅ Real game logic
- ✅ Cross-chain messaging
- ✅ Persistent games
- ✅ Real-time updates

---

## Additional Resources

- **Netlify Documentation**: https://docs.netlify.com
- **Vercel Documentation**: https://vercel.com/docs
- **Linera Documentation**: https://linera.dev
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode

---

## Support

For deployment issues:
1. Check build logs in Netlify/Vercel dashboard
2. Review browser console for runtime errors
3. Verify environment variables are set correctly
4. Ensure Linera network is accessible (if connecting)

For Linera-specific issues:
- Review `IMPLEMENTATION_NOTES.md`
- Check Linera documentation
- Verify contract deployment was successful
