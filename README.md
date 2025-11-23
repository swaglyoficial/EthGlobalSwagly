# 🎨 Swagly - Web3 Digital Marketplace with ENS Integration

> A decentralized marketplace for digital creators powered by blockchain technology, gasless transactions, and ENS identity management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Scroll](https://img.shields.io/badge/Chain-Scroll-orange)](https://scroll.io/)
[![ENS](https://img.shields.io/badge/ENS-Integrated-blue)](https://ens.domains/)

## 🚀 Overview

Swagly is a next-generation Web3 marketplace that enables digital creators to monetize their content through blockchain technology. Built on Scroll (Ethereum L2), Swagly provides a seamless user experience with gasless transactions via account abstraction and decentralized identity through ENS (Ethereum Name Service) subdomain integration.

### 🎯 Key Features

- **🎨 Digital Asset Marketplace**: Buy and sell digital products (images, designs, templates) as NFTs
- **⛽ Gasless Transactions**: Users never pay gas fees thanks to Biconomy Paymaster integration
- **🔐 Smart Wallet Integration**: ERC-4337 account abstraction with Nexus smart wallets
- **💳 Multi-Payment Support**: Pay with ETH and other Tokens
- **🎁 Creator Rewards**: Direct creator support through transparent blockchain payments
- **📱 Social Login**: Connect via email, Google, Discord, or traditional Web3 wallets
- **🖼️ IPFS Storage**: Decentralized storage for digital assets via Vercel Blob

## 🏗️ Technical Architecture

### Blockchain Stack

- **Chain**: You can choose your own chain
- **Smart Wallets**: Nexus (ERC-4337) via Thirdweb
- **Gas Sponsorship**: Transferme and permit (Thirdweb)
- **Storage**: IPFS/Storacha Filecoin

### Frontend Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Web3**: Thirdweb SDK v5
- **State Management**: React Hooks + Context

### Backend Stack

- **Database**: Storacha Filecoin
- **ORM**: Prisma
- **Authentication**: Thirdweb Connect
- **API**: Next.js API Routes
- **File Upload**: Storacha Filecoin

## 💡 How It Works

### For Buyers

1. **Connect Wallet**: Use email, social login, or Web3 wallet
3. **Browse Marketplace**: Explore digital products from creators
4. **Purchase Without Gas**: Buy products with zero transaction fees (sponsored by Swagly)
5. **Instant Download**: Access your purchased digital assets immediately
6. **Claim token**: Do activities and win tokens.

### For Creators

1. **Upload Products**: Upload images, designs, or digital templates
2. **Set Pricing**: Price in ETH or stablecoins
3. **Get Paid Instantly**: Receive payments directly to your wallet
4. **Track Sales**: Monitor your product performance

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Storacha Filecoin
- Thirdweb API keys
- Smart contract functionalities in Thirdweb

### Installation

```bash
# Clone the repository
git clone https://github.com/swaglyoficial/EthGlobalSwagly
cd EthGlobalSwagly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Environment Variables

```env
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.xwwpcdmeknaffijnsktc:daniellagart426@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.xwwpcdmeknaffijnsktc:daniellagart426@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=ba7a96650ddbf17991e91a37adc04faf
THIRDWEB_SECRET_KEY=w2eFsou5nA2a0Bnkce1p-vf2lyr_iDXtKUUvdMUNp6KdRR8452ipc29Bs3CtWESrdlTyQVrrTmpdjQrbOK-80A
# Creator Wallet (for receiving tokens from purchases)
CREATOR_WALLET_ADDRESS=0x645AC03F1db27080A11d3f3a01030c455c7021bD
NEXT_PUBLIC_CREATOR_WALLET_ADDRESS=0x645AC03F1db27080A11d3f3a01030c455c7021bD
CREATOR_WALLET_PRIVATE_KEY=8382d8938c0c3559781b57804c9c67343b6e0e5b483e5fc8478d36fdf8e7f767
# App URL
# Desarrollo: http://localhost:3000
# Producción: https://swaglyoficial-production.up.railway.app/
NEXT_PUBLIC_APP_URL=https://swaglyoficial-production.up.railway.app/

#EtherscanApi
ETHERSCAN_API="https://api.etherscan.io/v2/api?chainid=534352&action=balance&apikey=K4D78JQRMVXRBIJEICIT9SY12IXD1QJ8Q6"

NEXT_PUBLIC_ATTESTATIONS_CONTRACT_ADDRESS=0xA9fdE7d55Fbc7fD94e361A63860E650521000595
NEXT_PUBLIC_ATTESTATIONS_CHAIN_ID=534351
ATTESTOR_WALLET_PRIVATE_KEY=8382d8938c0c3559781b57804c9c67343b6e0e5b483e5fc8478d36fdf8e7f767
ATTESTOR_WALLET_ADDRESS=0x645ac03f1db27080a11d3f3a01030c455c7021bd

# Storacha (IPFS Backup) Configuration
STORACHA_DID=did:key:z6MkjAc9WFcFtj15dRgxELRnFbWF8sfJyuZ1Awd5tVtzQ48h
STORACHA_PRIVATE_KEY=MgCbW[DZoPnzcZOpGgSX0X35BRweXrymugzjtRTnTJ3xuqTyO0BRgZKTTH6sW/cyhTdHIBd6RuC9MU+ubUwLByHyrEPrLI=
# STORACHA_PROOF= (Opcional - se genera después de crear un espacio en Storacha)
NEXT_PUBLIC_APP_ID='app_c82bd1c6a23664f9b82d94745ad15077' # APP ID from the developer portal
SECRET_KEY='api_a2V5Xzg2ZmQwODNlOGZjYjJhNzdjNWRmZWE3ZjNjOTk0N2NjOnNrX2VkMzhjZDU5YTZmYjI1MjQyMTEzOWU0MmE3OGI5ZTM5NjBmYTNiNjhmOWRhNGUwZ'

## 📁 Project Structure

```
swagly/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── ens/          # ENS subdomain endpoints
│   │   │   └── user/         # User management
│   │   ├── profile/          # User profile page
│   │   └── marketplace/      # Product listings
│   ├── components/            # React components
│   │   ├── ens-*.tsx         # ENS-related components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── config/               # Configuration files
├── Storacha/                    # Database schema
├── docs/                      # Documentation
└── public/                    # Static assets
```

## 🔐 Security Features

- **Non-custodial**: Users maintain full control of their assets
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All user inputs sanitized and validated
- **HTTPS Only**: All communications encrypted in transit

### Gasless Product Purchase

```typescript
// User buys a product without paying gas
const tx = await purchaseProduct(productId, {
  paymentToken: USDC_ADDRESS,
  usePaymaster: true  // Biconomy sponsors gas
});
```

## 📊 Database Schema

```prisma && json structure for Storacha
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  email         String?
  products      Product[]
  purchases     Purchase[]
}

model Product {
  id          String    @id @default(cuid())
  title       String
  description String
  price       String    // Wei amount
  imageUrl    String    // IPFS/Blob URL
  creatorId   String
  creator     User      @relation(fields: [creatorId])
}
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup

1. Configure all environment variables in Vercel dashboard
2. Set up Supabase PostgreSQL database
3. Configure custom domain (optional)
4. Enable Vercel Blob storage

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📈 Roadmap

- [ ] Progresive Web App

## 📞 Contact & Links

- **Website**: [Production](https://swaglyoficial-production.up.railway.app/)
- **Twitter**: [@swaglyoficial](https://x.com/swaglypassport)

## 🙏 Acknowledgments

- **Chain** - L2 infrastructure
- **Thirdweb** - Smart wallet SDK
- **Thirdweb** - Gas sponsorship
- **Vercel** - Deployment platform
- **Storacha Filecoin** - Database infrastructure

Example transactions

Tienda: https://scrollscan.com/tx/0xe9009dfee447347e7a67de1c5fd96c4b3261417cabf4469c0b3ce388161a6ead
Claim Tokens: https://scrollscan.com/address/0xb1Ba6FfC5b45df4e8c58D4b2C7Ab809b7D1aa8E1 #This a contract in mainnet.

---

Built with ❤️ by the Swagly team | **Making Web3 accessible to everyone**
