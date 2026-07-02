# Weevean

![Weevean](public/weevean-readme.png)

Open-source team chat platform with AI-powered assistance, built for modern collaboration.

## What is Weevean?

Weevean is a self-hosted Slack alternative designed for teams who want control over their data without sacrificing modern features. Multi-tenant workspaces, AI assistance, real-time messaging, and developer-friendly tools make it ideal for technical and non-technical teams alike.

## Core Features

- OAuth-only authentication (GitHub, Google)
- Multi-tenant workspaces with channel organization
- Direct messaging and message threading
- AI-powered context assistant and smart summaries
- Rich markdown with code syntax highlighting
- Emoji reactions and workspace invites
- Self-hosted with full data control

## Tech Stack

Built with modern, production-ready technologies:

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Neon Postgres
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **AI**: Vercel AI SDK (multi-provider support)
- **Deploy**: Vercel or self-hosted

## Quick Start

```bash
# Clone and install
git clone https://github.com/emmaccen/weevean.git
cd weevean
pnpm install

# Configure environment variables
cp .env.example .env.local
# Add your credentials

# Run migrations and start
pnpm run db:migrate
pnpm run dev
```

Visit `http://localhost:3000`

## Deployment

### **Deploy to Diploi**

[![launch with diploi button](https://diploi.com/launch-big.svg)](https://diploi.com/launch/Emmaccen/weevean)

1. **Launch the project**

   Click the launch button above to create a new Diploi deployment.

2. **Add environment variables**

   In Diploi, open your deployment page and go to **Options > Next.js > Environment**. Add any required environment variables.

3. **Preview the deployment**

   Open the provided preview URL from your Diploi deployment page.

For more information, please visit [diploi.com](https://diploi.com/)

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and technical decisions
- [Requirements](docs/REQUIREMENTS.md) - Features and roadmap
- [Tech Stack](docs/TECHSTACK.md) - Technology choices and rationale
- [Contributing](docs/CONTRIBUTING.md) - Development guidelines
- [Landing Page Brief](docs/briefs/LANDING_PAGE_BRIEF.md) - Marketing page design spec

## Roadmap

**Current Version** (v0.1.0)

- Multi-tenant workspaces and channels
- Real-time messaging with threading
- AI assistant with conversation context
- Markdown and code highlighting
- Direct messaging

**Coming Soon**

- In-browser Python/JavaScript code execution
- AI code analysis and debugging assistance
- Advanced search with semantic understanding
- GitHub/GitLab integration
- Screen recording
- Voice/video calling

See [REQUIREMENTS.md](docs/REQUIREMENTS.md) for full roadmap.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for:

- Development setup
- Code standards and style guide
- Commit conventions
- PR process

## License

MIT License - see [LICENSE](/LICENSE)

Open source and free forever. Use it, modify it, deploy it anywhere.

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/emmaccen/weevean/issues)
- **Discussions**: [GitHub Discussions](https://github.com/emmaccen/weevean/discussions)
- **Slack Community**: [Slack Community #Weevean-community](https://magnamentes.slack.com/archives/C0A8SH12LUQ)

---

Built with Next.js, Neon, Tailwind CSS, and the Vercel AI SDK.
