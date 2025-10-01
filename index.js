#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalMediaServer {
  constructor() {
    this.server = new Server({ name: 'local-media', version: '0.1.0' }, { capabilities: { tools: {} } });
    this.setupTools();
    process.on('SIGINT', async () => { await this.server.close(); process.exit(0); });
  }

  setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        { name: 'generate_image', description: 'Return a local PNG image.', inputSchema: { type: 'object', properties: {}, required: [] } },
        { name: 'generate_music', description: 'Return a local WAV audio file.', inputSchema: { type: 'object', properties: {}, required: [] } }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      switch (req.params.name) {
        case 'generate_image':
          // Call the function with the type 'image'
          return this.readFileAsMediaBlock(path.join(__dirname, 'output', 'generated.png'), 'image/png', 'image');

        case 'generate_music':
          // Call the function with the type 'audio'
          return this.readFileAsMediaBlock(path.join(__dirname, 'output', 'generated.wav'), 'audio/wav', 'audio');

        default:
          throw new Error(`Unknown tool: ${req.params.name}`);
      }
    });
  }

  // Renamed to be more generic
  readFileAsMediaBlock(filePath, mimeType, blockType) {
    if (!fs.existsSync(filePath)) throw new Error(`${filePath} not found`);
    const data = fs.readFileSync(filePath).toString('base64');
    
    // The 'type' is now passed in as an argument to handle different media
    return { content: [{ type: blockType, mimeType, data }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new LocalMediaServer();
server.run().catch(console.error);