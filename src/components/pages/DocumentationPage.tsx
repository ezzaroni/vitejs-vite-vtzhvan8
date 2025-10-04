import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MarkdownViewer } from "@/components/ui/MarkdownViewer";
import { ApplicationDiagram } from "@/components/ui/ApplicationDiagram";
import {
  BookOpen,
  FileText,
  Presentation,
  Download,
  ExternalLink,
  Layers,
  Zap,
  Target,
  TrendingUp,
  Users,
  Code,
  Palette,
  Shield,
  Rocket,
  GitBranch
} from "lucide-react";

const DocumentationPage = () => {
  const [activeDoc, setActiveDoc] = useState("overview");

  const documentationSections = [
    {
      id: "overview",
      title: "Getting Started",
      icon: <BookOpen className="w-4 h-4" />,
      description: "Introduction to HiBeats platform",
      content: `
# Getting Started with HiBeats

## What is HiBeats?

HiBeats is a fully functional Web3 music platform that combines Suno AI music generation with comprehensive NFT marketplace functionality. Built on Somnia Testnet (Chain ID: 50312), it enables creators to transform text prompts into professional music NFTs.

## Platform Overview

### 🎵 Music Creation Workflow
1. **Connect Wallet** - RainbowKit integration with multi-wallet support
2. **Generate Music** - Suno AI V3.5/V4/V4.5 models (2 tracks per generation)
3. **Auto-NFT Minting** - Automatic ERC-721 token creation with IPFS metadata
4. **Marketplace Listing** - Optional immediate marketplace availability

### 🏗️ Technical Implementation
- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Somnia Testnet with 14 smart contracts
- **AI Integration**: Real Suno API integration (api.sunoapi.org)
- **Storage**: IPFS via Pinata for metadata and assets
- **State Management**: React Context + TanStack Query + SWR

### 💰 Economic Model
- **STT Token**: Native Somnia token for gas and transactions
- **BEATS Token**: Platform utility token for rewards and governance
- **Daily Limits**: 3 free generations per user per day
- **Creator Revenue**: 90%+ revenue share on sales
- **Automatic Royalties**: 0-10% creator-defined royalties on resales

### 🎯 User Types
- **Creators**: Generate and monetize AI music
- **Collectors**: Discover and invest in music NFTs
- **Community**: Social features with follow/like systems
      `
    },
    {
      id: "architecture",
      title: "Platform Architecture",
      icon: <GitBranch className="w-4 h-4" />,
      description: "System architecture and components",
      content: `
# Platform Architecture

## Smart Contract Ecosystem

HiBeats deploys 14 interconnected smart contracts on Somnia Testnet:

### Core Infrastructure

| Contract | Address | Purpose |
|----------|---------|----------|
| 🏭 **HiBeatsFactory** | \`0xbC79e69d0993AFAF74657e9578425339fF94c9CD\` | Music generation orchestration |
| 🎵 **HiBeatsNFT** | \`0x429294B8e46b07AdE397A0478baEA87F168F9E32\` | ERC-721 music NFT minting |
| 🎶 **HiBeatsToken** | \`0x665641f2b9614027b4fF55E1d562aD3f97F26784\` | BEATS utility token |
| 🏪 **Marketplace** | \`0xC4d82fe72A690b0DDC0e53C91Efa9fa4485d1D60\` | Basic trading platform |
| 🏪 **MarketplaceAdvanced** | \`0xC4d82fe72A690b0DDC0e53C91Efa9fa4485d1D60\` | Enhanced trading features |

### Social & Economic Layer

| Contract | Address | Purpose |
|----------|---------|----------|
| 👤 **Profile** | \`0x1259D20501c2574C36d7A80c45B9bD4CbE152c6B\` | User identity management |
| 👤 **ProfileEnhanced** | \`0x1259D20501c2574C36d7A80c45B9bD4CbE152c6B\` | Advanced profile features |
| 💸 **Royalties** | \`0xa110b05952c4E504285d38Bd38cA8b6F0F8c0cE8\` | Automatic revenue distribution |
| 🎧 **Playlist** | \`0x7bbd3dfe64164b11aa11DFD209A4F16B797e14d4\` | Music collection management |
| 💎 **Staking** | \`0x4d6e22739B70531338e0e79e4938E927a200779B\` | Token yield farming |
| 🔍 **Discovery** | \`0xC648F2f6F8C1F1D6F5aDF3A03c934d0f7013C693\` | Content recommendation |
| 📊 **Analytics** | \`0x61272668C7dF68F9c6B60C6d0edd9cB650e9fd88\` | Platform metrics tracking |
| 🤝 **InteractionManager** | \`0xA96A4b990C400666bEf50aCE2348382D664cE7de\` | Social features coordinator |
| 🗳️ **Governance** | \`0xD571586eba34033FB1134DF6BB982cB61625e174\` | DAO governance system |

## Technology Stack

### Frontend Architecture
- **React 18.3.1** with TypeScript for type safety
- **Vite** build tool for fast development and optimized production builds
- **TailwindCSS** + **Shadcn/UI** for consistent, accessible UI components
- **Framer Motion** for smooth animations and transitions

### Web3 Integration
- **Wagmi 2.16.8** for Ethereum contract interactions
- **RainbowKit** for wallet connection and management
- **Viem** for typed contract interactions and better performance
- **SIWE (Sign-In With Ethereum)** for secure authentication

### State Management
- **React Context** for global application state
- **TanStack Query** for server state management and caching
- **SWR** for data fetching with built-in caching
- **Custom Hooks** for feature-specific logic (60+ specialized hooks)

### Blockchain Infrastructure
- **Network**: Somnia Testnet (Chain ID: 50312)
- **RPC**: https://dream-rpc.somnia.network
- **Explorer**: https://shannon-explorer.somnia.network
- **Native Token**: STT (Somnia Test Token)

### External Services
- **Suno AI API**: https://api.sunoapi.org for music generation
- **Pinata IPFS**: Decentralized storage for metadata and assets
- **Multiple Authentication**: API Key, Secret Key, and JWT methods
      `
    },
    {
      id: "features",
      title: "Feature Guide",
      icon: <Zap className="w-4 h-4" />,
      description: "Detailed feature documentation",
      content: `
# Feature Guide

## 🎵 AI Music Generation

### Real Implementation Details

**Suno AI Integration**: Direct API integration with Suno's production service
- **API Endpoint**: https://api.sunoapi.org/api/v1/generate
- **Models Available**: V3.5 (basic), V4 (standard), V4.5 (premium)
- **Generation Output**: 2 tracks per request (45-90 seconds each)
- **Daily Limits**: 3 free generations per user (tracked via smart contract)

### Generation Process

1. **Wallet Connection** → RainbowKit multi-wallet support
2. **Prompt Input** → Text description of desired music
3. **Mode Selection**:
   - **Simple Mode**: Basic generation with genre selection
   - **Advanced Mode**: Custom lyrics, vocal gender, instrumental options
4. **Blockchain Transaction** → Smart contract records generation request
5. **AI Processing** → Suno AI generates 2 music tracks
6. **Automatic NFT Minting** → Each track becomes an ERC-721 NFT
7. **IPFS Storage** → Metadata and assets stored on IPFS via Pinata

### Generation Parameters

\`\`\`typescript
interface MusicGenerationParams {
  prompt: string;              // Text description
  genre: string;               // Music genre
  instrumental: boolean;       // Vocal vs instrumental
  mode: 'Simple' | 'Advanced'; // Generation mode
}
\`\`\`

## 🏪 NFT Marketplace

### Marketplace Architecture

**Dual Marketplace System**:
- **Basic Marketplace**: Simple buy/sell functionality
- **Advanced Marketplace**: Auctions, offers, enhanced features

### Trading Features

**Fixed Price Sales**:
- List NFTs with STT or BEATS token pricing
- Instant purchase mechanism
- Automatic royalty distribution to creators

**Auction System**:
- Time-based English auctions
- Reserve price options
- Automatic bid extension (anti-snipe)
- Auto-settlement when auction ends

**Offer System**:
- Make offers on any NFT
- Expiration time settings
- Counter-offer functionality

### Royalty System

**Creator Royalties**: 0-10% automatic distribution on resales
**Revenue Split**: 90%+ to creator, platform takes minimal fee
**Multi-Token Support**: STT and BEATS token payments

## 💰 Token Economy Implementation

### BEATS Token Mechanics

**Contract Address**: Environment-based deployment
**Token Standard**: ERC-20 with additional features
**Total Supply**: Configurable via governance

### Real Earning Mechanisms

| Activity | Implementation | Reward Amount |
|----------|----------------|---------------|
| **Music Generation** | Smart contract automatic reward | 10 BEATS per generation |
| **Daily Login** | Daily login contract tracking | 1 BEATS per day |
| **Listening Time** | Analytics contract integration | 0.001 BEATS per minute |
| **Social Interactions** | Social contract events | Variable rewards |
| **Staking** | Dedicated staking contract | 12-18% APY |

### Token Utility

**Platform Functions**:
- Unlimited generation purchases
- Marketplace fee discounts
- Governance voting rights
- Premium feature access

## 👥 Social Features

### Profile System

**User Profiles**: Complete CRUD operations via smart contracts
**Profile Data Structure**:
\`\`\`typescript
interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage: string;
  website: string;
  isVerified: boolean;
  followerCount: bigint;
  followingCount: bigint;
  totalEarnings: bigint;
}
\`\`\`

### Social Interactions

**Follow System**: Blockchain-based follow/unfollow
**Creator Analytics**: Real-time statistics tracking
**Community Features**: Like, share, comment functionality
**Discovery Engine**: Algorithm-based content recommendation

## 🎧 Music Player

### Audio Player Implementation

**HTML5 Audio Integration**: Native web audio playback
**Playlist Management**: Create, edit, delete playlists
**Playback Features**:
- Play, pause, skip, previous
- Volume control
- Progress tracking
- Cross-fade support

**State Management**: Global music player context
**NFT Integration**: Direct playback of owned NFTs
**Streaming Optimization**: Efficient audio loading and caching
      `
    },
    {
      id: "api",
      title: "API Documentation",
      icon: <Layers className="w-4 h-4" />,
      description: "Developer API and integration guide",
      content: `
# API Documentation

## Smart Contract Integration

### HiBeats Factory Contract

The Factory contract orchestrates the entire music generation workflow:

\`\`\`solidity
// Request music generation (implemented)
function requestMusicGeneration(
    string memory prompt,
    string memory genre,
    uint8 instrumental,     // 0 = vocal, 1 = instrumental
    uint8 mode,            // 0 = simple, 1 = advanced
    string memory taskId   // Unique task identifier
) external payable;

// Get user's generation requests
function getUserRequests(address user)
    external view returns (GenerationRequest[] memory);

// Check daily generation quota
function getDailyGenerationsLeft(address user)
    external view returns (uint256);

// Get generation fees
function generationFee() external view returns (uint256);
function advancedGenerationFee() external view returns (uint256);
\`\`\`

### HiBeats NFT Contract

ERC-721 implementation with music-specific metadata:

\`\`\`solidity
// Mint music NFT (auto-called after AI generation)
function directMint(
    address to,
    string memory metadataURI,
    string memory aiTrackId,
    string memory taskId,
    string memory genre,
    uint256 duration,
    string memory modelUsed,
    bool isRemixable,
    uint256 royaltyRate,
    string memory prompt,
    string memory tags,
    uint256 aiCreatedAt
) external returns (uint256);

// Get complete track information
function getTrackInfo(uint256 tokenId)
    external view returns (TrackInfo memory);

// Enhanced track data
struct TrackInfo {
    string sunoId;
    string genre;
    uint256 duration;
    address creator;
    uint256 createdAt;
    string modelUsed;
    bool isRemixable;
    uint256 royaltyRate;
}
\`\`\`

### Marketplace Contracts

**Basic Marketplace**:
\`\`\`solidity
// List NFT for sale
function listNFT(uint256 tokenId, uint256 price, bool acceptsBeats) external;

// Purchase NFT
function purchaseNFT(uint256 tokenId) external payable;

// Create auction
function createAuction(uint256 tokenId, uint256 startPrice, uint256 duration) external;
\`\`\`

**Advanced Marketplace**:
\`\`\`solidity
// Enhanced listing with categories and tags
function createListing(
    uint256 tokenId,
    uint256 price,
    bool isBeatsToken,
    uint256 duration,
    string memory category,
    string[] memory tags
) external;

// Make offer on any NFT
function makeOffer(
    uint256 tokenId,
    uint256 amount,
    bool isBeatsToken,
    uint256 expirationTime,
    string memory message
) external;
\`\`\`

## External API Integration

### Suno AI Service

Real API integration with production Suno service:

\`\`\`typescript
// Service configuration
const SUNO_BASE_URL = "https://api.sunoapi.org";

// Generation request
POST /api/v1/generate
{
  "prompt": "Energetic rock song about coding",
  "style": "rock",
  "title": "Code Warriors",
  "instrumental": false,
  "model": "V4",
  "callBackUrl": "https://app.hibeats.com/api/suno-callback"
}

// Response structure
interface SunoGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    status: "processing" | "complete" | "failed";
  };
}

// Task status polling
GET /api/v1/generate/record-info?taskId={taskId}
\`\`\`

### IPFS/Pinata Integration

Decentralized storage for NFT metadata and assets:

\`\`\`typescript
// Upload metadata to IPFS
const metadata = {
  name: "AI Generated Track #123",
  description: "Electronic music created with Suno AI",
  image: "ipfs://QmHash...",
  audio_url: "ipfs://QmAudioHash...",
  attributes: [
    { trait_type: "Genre", value: "Electronic" },
    { trait_type: "Duration", value: "3:24" },
    { trait_type: "Model", value: "V4" }
  ]
};

// Pinata API
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
Headers: {
  "pinata_api_key": "your_api_key",
  "pinata_secret_api_key": "your_secret_key"
}
\`\`\`

## React Hook Integration

### Music Generation Hook

\`\`\`typescript
import { useGeneratedMusicContext } from '@/hooks/useGeneratedMusicContext';

const MusicCreator = () => {
  const {
    generateMusic,
    isGenerating,
    currentTaskId,
    generationFee,
    dailyGenerationsLeft,
    forceRefreshAllData
  } = useGeneratedMusicContext();

  const handleGenerate = async () => {
    try {
      const request: SunoGenerateRequest = {
        prompt: "Chill lo-fi beats for studying",
        style: "lo-fi",
        instrumental: true,
        model: "V4"
      };

      const result = await generateMusic(request);
      console.log('Generation started:', result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div>
      <p>Generations left today: {dailyGenerationsLeft.toString()}</p>
      <button
        onClick={handleGenerate}
        disabled={isGenerating || dailyGenerationsLeft === 0n}
      >
        {isGenerating ? 'Generating...' : 'Generate Music'}
      </button>
    </div>
  );
};
\`\`\`

### Marketplace Integration

\`\`\`typescript
import { useEnhancedMarketplace } from '@/hooks/useEnhancedMarketplace';

const MarketplaceComponent = () => {
  const {
    listings,
    auctions,
    offers,
    createListing,
    makeOffer,
    purchaseNFT
  } = useEnhancedMarketplace();

  const handlePurchase = async (tokenId: bigint) => {
    try {
      await purchaseNFT(tokenId);
      toast.success('NFT purchased successfully!');
    } catch (error) {
      toast.error('Purchase failed');
    }
  };

  return (
    <div>
      {listings.map(listing => (
        <div key={listing.tokenId.toString()}>
          <h3>{listing.title}</h3>
          <p>Price: {listing.price.toString()} STT</p>
          <button onClick={() => handlePurchase(listing.tokenId)}>
            Buy Now
          </button>
        </div>
      ))}
    </div>
  );
};
\`\`\`

## Environment Configuration

Required environment variables for full functionality:

\`\`\`bash
# Blockchain Configuration
VITE_CHAIN_ID=50312
VITE_RPC_URL=https://dream-rpc.somnia.network
VITE_EXPLORER_URL=https://shannon-explorer.somnia.network

# Contract Addresses (Somnia Testnet - Latest Deployment)
VITE_HIBEATS_FACTORY_ADDRESS=0xbC79e69d0993AFAF74657e9578425339fF94c9CD
VITE_HIBEATS_NFT_ADDRESS=0x429294B8e46b07AdE397A0478baEA87F168F9E32
VITE_HIBEATS_TOKEN_ADDRESS=0x665641f2b9614027b4fF55E1d562aD3f97F26784
VITE_HIBEATS_PROFILE_ADDRESS=0x1259D20501c2574C36d7A80c45B9bD4CbE152c6B
VITE_HIBEATS_MARKETPLACE_ADVANCED_ADDRESS=0xC4d82fe72A690b0DDC0e53C91Efa9fa4485d1D60
VITE_HIBEATS_ROYALTIES_ADDRESS=0xa110b05952c4E504285d38Bd38cA8b6F0F8c0cE8
VITE_HIBEATS_PLAYLIST_ADDRESS=0x7bbd3dfe64164b11aa11DFD209A4F16B797e14d4
VITE_HIBEATS_STAKING_ADDRESS=0x4d6e22739B70531338e0e79e4938E927a200779B
VITE_HIBEATS_DISCOVERY_ADDRESS=0xC648F2f6F8C1F1D6F5aDF3A03c934d0f7013C693
VITE_HIBEATS_ANALYTICS_ADDRESS=0x61272668C7dF68F9c6B60C6d0edd9cB650e9fd88
VITE_HIBEATS_INTERACTION_MANAGER_ADDRESS=0xA96A4b990C400666bEf50aCE2348382D664cE7de
VITE_HIBEATS_GOVERNANCE_ADDRESS=0xD571586eba34033FB1134DF6BB982cB61625e174

# External Services
VITE_SUNO_API_KEY=your_suno_api_key
VITE_PINATA_API_KEY=your_pinata_key
VITE_PINATA_API_SECRET=your_pinata_secret
VITE_PINATA_API_JWT=your_pinata_jwt

# Wallet Integration
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
\`\`\`
      `
    },
    {
      id: "studycase",
      title: "Study Case",
      icon: <Target className="w-4 h-4" />,
      description: "Problem analysis and solutions",
      content: `
# Study Case: Music Industry Revolution

## Problem Statement

### Current Music Industry Challenges

#### Creator Monetization Crisis
- 78% of independent artists earn less than $1,000 annually
- Streaming platforms pay $0.003-$0.005 per stream
- Artists need 1M+ streams to earn $3,000-$5,000
- Traditional labels take 70-90% of revenue

#### High Production Barriers
- Studio recording costs $500-$5,000 per track
- Professional equipment requires $10,000+ investment
- Technical skills need years of training
- Time investment: weeks to months per track

#### Digital Ownership Issues
- No true ownership in streaming model
- DRM-protected downloads with limited rights
- No resale value for digital purchases
- Platform dependency risks

## HiBeats Solution

### AI-Democratized Creation
- Text-to-music generation in minutes
- Professional quality output guaranteed
- 99.9% cost reduction from traditional production
- No technical skills required

### Blockchain Ownership
- Immutable NFT certificates
- Transferable and tradeable assets
- Permanent IPFS storage
- Verifiable authenticity and provenance

### Fair Creator Economics
- 90-95% revenue share (vs 5-15% traditional)
- Automatic royalty distribution
- Direct fan monetization
- Multiple earning streams

## Market Opportunity

### Addressable Market
- Global music industry: $26.2B
- Independent artist segment: $8.2B (undermonetized)
- Music NFT market: $393M (45% YoY growth)
- Target: 500M independent musicians worldwide

### Impact Potential
- 10x revenue increase for creators
- True digital ownership for fans
- Democratized music production
- Fair and transparent ecosystem

## Success Metrics

### Key Performance Indicators
- Monthly active creators
- Music generation volume
- NFT marketplace transactions
- Creator earnings distribution
- Community engagement metrics

### Growth Targets
- Year 1: 25,000 active users
- Monthly revenue: $150K target
- Creator earnings: $120K monthly distribution
- Platform sustainability and growth
      `
    }
  ];

  const quickLinks = [
    {
      title: "Platform Documentation",
      description: "Complete technical documentation",
      icon: <FileText className="w-5 h-5" />,
      action: () => window.open('/HIBEATS_COMPREHENSIVE_DOCUMENTATION.md', '_blank')
    },
    {
      title: "Study Case Analysis",
      description: "Problem statement and solution analysis",
      icon: <Target className="w-5 h-5" />,
      action: () => window.open('/HACKATHON_STUDY_CASE.md', '_blank')
    },
    {
      title: "Presentation Guide",
      description: "Platform presentation materials",
      icon: <Presentation className="w-5 h-5" />,
      action: () => window.open('/HACKATHON_PRESENTATION_GUIDE.md', '_blank')
    }
  ];

  const stats = [
    { label: "Smart Contracts", value: "12", icon: <Shield className="w-4 h-4 text-primary" /> },
    { label: "Music Genres", value: "100+", icon: <Palette className="w-4 h-4 text-blue-400" /> },
    { label: "AI Models", value: "3", icon: <Zap className="w-4 h-4 text-purple-400" /> },
    { label: "Creator Revenue", value: "90%+", icon: <TrendingUp className="w-4 h-4 text-green-400" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-primary/5 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">Documentation</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Complete guide to HiBeats platform.
            Learn how to create, trade, and monetize music using AI and blockchain technology.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-4 text-center border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                {stat.icon}
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-300">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickLinks.map((link, index) => (
            <GlassCard key={index} className="p-6 hover:bg-white/10 transition-all cursor-pointer group border-primary/20 hover:border-primary/40">
              <div onClick={link.action} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{link.title}</h3>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {link.description}
                </p>
                <div className="flex items-center gap-2 text-primary text-sm">
                  <span>View Documentation</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Documentation Tabs */}
        <GlassCard className="p-6 border-primary/20">
          <Tabs value={activeDoc} onValueChange={setActiveDoc} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6 bg-black/40">
              {documentationSections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  {section.icon}
                  <span className="hidden md:inline">{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {documentationSections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    {section.icon}
                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">{section.description}</Badge>
                  </div>

                  <Separator className="bg-primary/20" />

                  {section.id === "architecture" ? (
                    <div className="space-y-6">
                      <ApplicationDiagram />
                      <ScrollArea className="h-[400px] w-full">
                        <div className="px-2">
                          <MarkdownViewer content={section.content} />
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] w-full">
                      <div className="px-2">
                        <MarkdownViewer content={section.content} />
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </GlassCard>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://github.com/hibeats-platform/hibeats', '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              View Source Code
            </Button>
            <Button
              onClick={() => window.open('https://hibeats.fun', '_blank')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Try Platform
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: September 27, 2024 | Version 1.0 |
            <span className="text-purple-400 ml-1">Built with ❤️ by HiBeats Team</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;