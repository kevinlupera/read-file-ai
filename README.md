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

# Set up environment variables
cp .env.example .env
# Add your GOOGLE_API_KEY to .env
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
