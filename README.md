# Coaching MCP Server: Spike

A one-day spike: an MCP (Model Context Protocol) server that exposes the low-risk capabilities of a coaching product to enterprise AI platforms (Microsoft Copilot, ChatGPT Enterprise, Claude Desktop), plus a decision memo on what to expose, what to defer and why.

Written April 2026 for a client and republished in anonymized form in October 2026. The backend is a stub.

**See [FINDINGS.md](./FINDINGS.md) for the decision memo.**

> **About the domain data:** the phases, cues, themes and principles in `src/coaching-data.ts` are invented placeholder content to illustrate the MCP structure. They are not any real coaching product's methodology.

## Quick Start

```bash
npm ci
npm run build
```

### stdio transport (Claude Desktop / Claude Code / MCP Inspector)

```bash
npm run start:stdio
```

### Streamable HTTP transport (serverless / remote)

```bash
npm run start:http
# Server at http://127.0.0.1:3000/mcp
# Health check at http://127.0.0.1:3000/health
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/stdio.js
# Opens http://localhost:6274
```

## What's Exposed

| Type | Name | Description |
|------|------|-------------|
| Tool | `single-turn-advice` | Coaching response to a work question (structured output) |
| Tool | `book-session` | Book a coaching session (ai/human/hybrid) (structured output) |
| Resource | `coaching://model` | Coaching model overview |
| Resource | `coaching://themes` | 5 placeholder coaching themes |
| Resource template | `coaching://themes/{themeId}` | Detail for one theme |
| Resource | `coaching://cues` | 3 placeholder cue types |
| Resource | `coaching://phases` | 4 placeholder conversation phases |
| Prompt | `coaching-question` | Structured coaching question template |

Both tools declare an `outputSchema` and return `structuredContent`; the server sets an `instructions` string for clients.

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "coaching-mcp-spike": {
      "command": "node",
      "args": ["<path-to-spike>/dist/stdio.js"]
    }
  }
}
```

## Stack

- TypeScript + `@modelcontextprotocol/sdk` v1.29.0
- Zod schema validation
- stdio + Streamable HTTP (stateless) transports
- Stub backend (in production this would call the coaching service's own HTTP API)

## Limits

- The backend is a stub that returns canned responses.
- It was tested at the protocol level only (stdio and HTTP via curl). It was never connected to Copilot Studio or ChatGPT.
- It has no authentication, rate limiting or input hardening.
- It targets the MCP spec and SDK as they were in April 2026 (see the note at the top of FINDINGS.md).
