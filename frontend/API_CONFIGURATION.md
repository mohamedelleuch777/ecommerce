# API Configuration

This project uses centralized API configuration with environment variable support.

## Configuration Files

- `src/config/api.js` - Main configuration file that handles environment variables
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `.env.example` - Template for environment variables

## Environment Variables

### `VITE_API_BASE_URL`
The base URL for the API endpoints.

- **Development**: `http://localhost:5000/api`
- **Production**: Update to your production API URL

## Usage

The configuration is automatically imported by:
- `src/services/api.js` - General API service
- `src/contexts/AuthProvider.jsx` - Authentication service

## Build Commands

- `npm run build` - Standard build (uses default environment)
- `npm run build:dev` - Build with development environment
- `npm run build:prod` - Build with production environment

## Setting Up

1. Copy `.env.example` to `.env.local` for local overrides
2. Update `VITE_API_BASE_URL` in `.env.production` for production deployment
3. The application will automatically use the appropriate environment based on build mode

## Environment Variable Priority

Vite loads environment variables in this order:
1. `.env.[mode].local` (highest priority)
2. `.env.local`
3. `.env.[mode]`
4. `.env` (lowest priority)

Variables prefixed with `VITE_` are exposed to the browser and can be used in the application code.