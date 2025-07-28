# Read File AI - PDF Bank Statement Parser

A Cloudflare Workers application that uses Google Gemini AI to parse bank statements from PDF files and extract transaction data in a structured format.

## Features

- 📄 PDF file upload and processing
- 🤖 AI-powered bank statement parsing using Google Gemini
- 📊 Structured CSV output with transaction data
- ☁️ Deployed on Cloudflare Workers
- ⚡ Fast and serverless architecture

## Setup

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Cloudflare account
- Google AI API key

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables for development
cp .dev.vars.example .dev.vars
# Create .dev.vars file for local development
echo "GOOGLE_API_KEY=your_google_api_key_here" > .dev.vars

# For production, set environment variables in Cloudflare Dashboard
# or using wrangler secret command:
# wrangler secret put GOOGLE_API_KEY
```


### Development

```bash
# Start development server
pnpm run dev

# The app will be available at http://localhost:8787
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm run deploy
```

### Type Generation

For generating/synchronizing types based on your Worker configuration:

```bash
pnpm run cf-typegen
```

## API Endpoints

### GET /
Health check endpoint that returns "Hello Hono!"

### POST /upload
Upload and parse a PDF bank statement.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing a PDF file

**Response:**
```json
{
  "movements": [
    {
      "date": "2024-01-15",
      "description": "DEPOSIT",
      "amount": "1000.00",
      "type": "in"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "File must be a PDF"
}
```

## Environment Variables

### Development
Create a `.dev.vars` file in the project root for local development:

```bash
GOOGLE_API_KEY=your_google_api_key_here
```

### Production
For production deployment, set environment variables using one of these methods:

1. **Cloudflare Dashboard**: Go to Workers & Pages → Your Worker → Settings → Variables
2. **Wrangler CLI**: 
   ```bash
   wrangler secret put GOOGLE_API_KEY
   ```

### Required Variables
- `GOOGLE_API_KEY`: Your Google AI API key for Gemini access

## Architecture

The application uses:
- **Hono**: Fast web framework for Cloudflare Workers
- **Google Gemini AI**: For intelligent PDF parsing
- **Cloudflare Workers**: Serverless runtime environment

## Development Notes

When instantiating Hono, use the CloudflareBindings type:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## License

MIT
