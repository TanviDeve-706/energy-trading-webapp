# Energy Trading Web Application

## Overview

This is a blockchain-based peer-to-peer (P2P) energy trading platform that enables prosumers (producers and consumers) to trade renewable energy directly with other users. The application combines React frontend, Express backend, PostgreSQL database, and Ethereum smart contracts to create a decentralized energy marketplace where users can buy and sell energy from renewable sources like solar, wind, and hydro power.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Shadcn/ui Components**: Consistent design system with Radix UI primitives and Tailwind CSS
- **TanStack Query**: Server state management for API calls and caching
- **Wouter Router**: Lightweight client-side routing for navigation
- **Responsive Design**: Mobile-first approach with Tailwind CSS for all screen sizes

### Backend Architecture  
- **Express.js Server**: RESTful API server handling authentication, energy offers, and transactions
- **TypeScript**: Full type safety across the backend with shared schema types
- **Session Management**: User authentication with local storage for session persistence
- **API Design**: Clean REST endpoints for users, energy offers, transactions, and energy generation data

### Database Layer
- **PostgreSQL with Neon**: Cloud-hosted PostgreSQL database for production scalability  
- **Drizzle ORM**: Type-safe database interactions with automatic migrations
- **Schema Design**: Normalized tables for users, energy offers, transactions, and generation data
- **Data Relationships**: Foreign key relationships ensuring referential integrity between users, offers, and transactions

### Blockchain Integration
- **Hardhat Development Environment**: Ethereum development framework for smart contract compilation and testing
- **Solidity Smart Contracts**: Custom energy trading contracts with OpenZeppelin security standards
- **Multi-Network Support**: Configured for local development (Hardhat), testnet (Sepolia), and mainnet deployment
- **MetaMask Integration**: Web3 wallet connection for blockchain transaction signing
- **Ethers.js**: Web3 library for interacting with Ethereum blockchain and smart contracts

### Authentication & Authorization
- **Username/Password Authentication**: Traditional login system with password-based authentication
- **Wallet Connection**: Optional MetaMask wallet linking for blockchain transactions  
- **User Types**: Support for both prosumers (sellers) and consumers (buyers)
- **Session Persistence**: Client-side session management with local storage

### Energy Management System
- **Real-time Simulation**: Mock energy generation data simulating solar, wind, and hydro power
- **Dynamic Pricing**: Market-based pricing simulation with time-of-day variations
- **Energy Tracking**: Generation, consumption, and trading history for each user
- **Offer Management**: Create, view, and manage energy sale offers with automatic status updates

## External Dependencies

### Blockchain Infrastructure
- **Ethereum Network**: Main blockchain platform for smart contract deployment
- **MetaMask Wallet**: Browser extension for Web3 wallet functionality and transaction signing
- **Hardhat Toolbox**: Complete Ethereum development environment with testing utilities
- **OpenZeppelin Contracts**: Security-audited smart contract libraries for safe blockchain development

### Database & Storage
- **Neon Database**: Serverless PostgreSQL platform providing scalable cloud database hosting
- **Drizzle Kit**: Database migration and schema management tools
- **Connection Pooling**: Optimized database connections for high-performance queries

### UI & Design System
- **Radix UI**: Headless component library providing accessible and customizable UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design and consistent styling
- **Lucide React**: Icon library providing comprehensive set of SVG icons
- **React Hook Form**: Form validation and state management with minimal re-renders

### Development Tools
- **Vite**: Modern build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking across frontend, backend, and shared code
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for seamless Replit deployment

### API & State Management
- **TanStack Query**: Server state management with caching, synchronization, and background updates
- **React Query DevTools**: Development tools for debugging API calls and cache state
- **Axios-style Fetch**: Custom API request wrapper with error handling and authentication