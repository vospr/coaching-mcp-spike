/**
 * Coaching MCP Server (spike) — stdio transport
 *
 * Use this for local testing with Claude Desktop, Claude Code, or MCP Inspector.
 * Launch: npx tsx src/stdio.ts
 * Inspect: npx @modelcontextprotocol/inspector node dist/stdio.js
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createCoachingMcpServer } from './server.js';

async function main() {
  const server = createCoachingMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Coaching MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
