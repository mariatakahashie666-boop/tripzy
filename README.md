# Tripzy - Travel Document Automation Platform

A GitHub Spark application that automates travel document processing by scanning passports and flight tickets to identify and pre-fill required travel documents.

🌐 **Live Demo**: [https://mariatakahashie666-boop.github.io/tripzy/](https://mariatakahashie666-boop.github.io/tripzy/)

## 🌟 About This Application

Tripzy is a travel document automation platform built on GitHub Spark that helps travelers:
- Scan and extract data from passports and flight tickets
- Automatically identify required travel documents based on nationality, origin, and destination
- Pre-fill government forms with extracted information
- Track document completion and submission

See [PRD.md](./PRD.md) for detailed product requirements and features.

## 🚀 GitHub Spark Integration

This repository is configured as a GitHub Spark application with the following setup:

### Spark Configuration Files
- `spark.meta.json` - Spark metadata configuration (templateVersion: 1, dbType: kv)
- `runtime.config.json` - Runtime app configuration
- `.spark-initial-sha` - Initial commit tracking

### Spark Runtime Features
The application uses `@github/spark` package which provides:
- **LLM Integration**: Access to language models via `window.spark.llm`
- **Key-Value Storage**: Persistent storage via `window.spark.kv`
- **User Management**: User authentication via `window.spark.user`

### Vite Plugins
The application includes Spark-specific Vite plugins in `vite.config.ts`:
- `sparkPlugin()` - Core Spark runtime functionality
- `vitePhosphorIconProxyPlugin()` - Icon optimization for better performance

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs the application on http://localhost:5000

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Manual Deployment
The deployment is handled by GitHub Actions workflow (`.github/workflows/deploy.yml`). The workflow:
1. Builds the application with the correct base path for GitHub Pages
2. Uploads the build artifacts
3. Deploys to GitHub Pages

To trigger a manual deployment, go to the Actions tab in GitHub and run the "Deploy to GitHub Pages" workflow.

### GitHub Pages Configuration
The repository must have GitHub Pages enabled:
1. Go to Settings → Pages
2. Set Source to "GitHub Actions"
3. The site will be available at: `https://mariatakahashie666-boop.github.io/tripzy/`

## 📦 Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with Radix UI components
- **GitHub Spark**: Runtime integration for LLM and storage
- **AI**: GPT-4o vision for document scanning
- **UI Components**: shadcn/ui component library

## 📁 Project Structure

```
tripzy/
├── src/
│   ├── components/      # React components
│   ├── lib/            # Utility functions and services
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── styles/         # CSS and theme files
├── spark.meta.json     # Spark metadata
├── runtime.config.json # Spark runtime configuration
└── vite.config.ts      # Vite with Spark plugins
```

## 🔧 Spark Integration Details

The Spark runtime is initialized in `src/main.tsx`:
```typescript
import "@github/spark/spark"
```

This import adds the `window.spark` global object with utilities for:
- Making LLM API calls
- Storing/retrieving data in key-value storage
- Accessing authenticated user information

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
