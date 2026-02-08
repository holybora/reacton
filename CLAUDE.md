# Claude Code Project Configuration

## MCP Servers

This project uses [Figma Developer MCP](https://www.npmjs.com/package/figma-developer-mcp) to give Claude Code access to Figma design files. Config is in `.mcp.json`.

### Setup: Figma Personal Access Token

1. Go to Figma account settings: https://www.figma.com/settings
2. Scroll to "Personal access tokens" and generate a new token
3. Export it in your shell profile (`~/.zshrc` or `~/.bashrc`):

   ```bash
   export FIGMA_API_KEY="your-figma-personal-access-token"
   ```

4. Restart your terminal or `source ~/.zshrc`

Never commit your Figma API key. The `.mcp.json` references the env var only.

### Verifying

Run `/mcp` in Claude Code — `figma-developer-mcp` should show as connected.
