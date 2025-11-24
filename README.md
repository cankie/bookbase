# 📚 BookBase — Farcaster Mini App + Frame (Base)

**No-code friendly**: deploy on Vercel, paste your contract address, and you’re live.

## Deploy on Vercel
1. Sign in at https://vercel.com → New Project → Import repo (or upload this folder).
2. Env Vars:
   - `NEXT_PUBLIC_BASE_URL` = `https://<your-domain>`
   - (optional) `NEXT_PUBLIC_WALLETCONNECT_ID` = your WalletConnect ID
3. Deploy. Your Frame URL: `https://<your-domain>/api/frames`

## Local
```bash
npm i
npm run dev
```

## Contract (optional)
```bash
npm run compile
# copy .env.example -> .env and fill PRIVATE_KEY
npm run deploy:base-sepolia
```
Paste the address into the app UI.

MIT
