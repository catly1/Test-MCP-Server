#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
// 1. Import fileURLToPath from the 'url' module
import { fileURLToPath } from 'url';

// 2. Define __dirname for ES modules
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
        { name: 'generate_image', description: 'Return local PNG as base64', inputSchema: { type: 'object', properties: {}, required: [] } },
        { name: 'generate_music', description: 'Return local MP3 as base64', inputSchema: { type: 'object', properties: {}, required: [] } }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      switch (req.params.name) {
        // 3. Use the new __dirname to create an absolute path
        case 'generate_image': return this.readFileBase64(path.join(__dirname, 'output', 'generated.png'), 'image/png');
        case 'generate_music': return this.readFileBase64(path.join(__dirname, 'output', 'generated.mp3'), 'audio/mpeg');
        default: throw new Error(`Unknown tool: ${req.params.name}`);
      }
    });
  }

  readFileBase64(filePath, mimeType) {
    // For debugging, you can add this line to see what path it's checking:
    // console.log(`Checking for file at: ${filePath}`); 
    if (!fs.existsSync(filePath)) throw new Error(`${filePath} not found`);
    const data = fs.readFileSync(filePath).toString('base64');
    return { content: [{ type: 'base64', mimeType, data }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new LocalMediaServer();
server.run().catch(console.error);