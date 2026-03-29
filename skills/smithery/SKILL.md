---
name: smithery
description: |
  Smithery MCP Registry - Install, manage, and use MCP (Model Context Protocol) servers and skills from the Smithery registry. Use this skill when the user wants to: install MCP servers, search for MCP tools, connect to external services (GitHub, Slack, Discord, databases, APIs), discover new AI tools and skills, manage MCP connections, or add skills to their agent. Smithery provides access to 100K+ AI tools and thousands of MCP servers. Trigger when user mentions: "install MCP", "add MCP server", "smithery", "MCP registry", "install tools", "add skills", "connect to [service]", "MCP tools", or asks about available integrations.
---

# Smithery MCP Registry Skill

Smithery is a comprehensive registry and CLI tool for discovering, installing, and managing MCP (Model Context Protocol) servers and AI skills. It provides access to over 100,000 AI tools and thousands of MCP servers from a unified command-line interface.

## When to Use This Skill

Use this skill when the user:
- Wants to install or add MCP servers
- Searches for new tools or skills
- Wants to discover integrations for external services
- Asks to connect to services like GitHub, Slack, Discord, Notion, databases, etc.
- Needs to manage MCP connections
- Wants to add skills to their agent
- Mentions "MCP" in the context of installing or using tools

## CLI Installation

The Smithery CLI is available as an npm package and can be run directly with npx:

```bash
npx @smithery/cli [command]
```

No global installation required - npx handles everything.

## Core Commands

### MCP Server Management

#### Search for MCP Servers

```bash
# Search the Smithery registry for MCP servers
npx @smithery/cli mcp search <term>

# Examples:
npx @smithery/cli mcp search slack
npx @smithery/cli mcp search "web search"
npx @smithery/cli mcp search github --json
npx @smithery/cli mcp search database --verified
npx @smithery/cli mcp search "" --limit 20  # Browse all
```

Options:
- `--verified` - Only show verified servers
- `--namespace <ns>` - Filter by namespace
- `--limit <number>` - Max results per page (default: 10)
- `--page <number>` - Page number
- `--json` - Output as JSON

#### Add/Install MCP Servers

```bash
# Add an MCP server connection
npx @smithery/cli mcp add <server>

# Examples:
npx @smithery/cli mcp add https://server.smithery.ai/exa
npx @smithery/cli mcp add anthropic/exa --client claude
npx @smithery/cli mcp add https://server.smithery.ai/github --id github --name "GitHub MCP"

# Install directly to a specific AI client
npx @smithery/cli mcp add <server> --client <client-name>
```

Available clients: `claude-code`, `vscode`, `vscode-insiders`, `gemini-cli`, `codex`, `cursor`, `claude`, `witsy`, `enconvo`, `roocode`, `boltai`, `amazon-bedrock`, `amazonq`, `tome`, `librechat`, `windsurf`, `cline`, `opencode`, `goose`

Options:
- `--id <id>` - Custom connection ID
- `--name <name>` - Human-readable name
- `--client <name>` - Install directly to AI client config
- `--config <json>` - Configuration data as JSON
- `--force` - Create even if connection exists

#### List Connections

```bash
# List all your MCP server connections
npx @smithery/cli mcp list
```

#### Get Connection Details

```bash
# Get details of a specific connection
npx @smithery/cli mcp get <id>
```

#### Remove Connections

```bash
# Remove one or more connections
npx @smithery/cli mcp remove <id1> [id2] ...
```

### Tool Operations

#### Find Tools

```bash
# Search tools by name or intent from a connection
npx @smithery/cli tool find <connection> [query]

# Example:
npx @smithery/cli tool find exa search
```

#### List Tools

```bash
# Browse all tools from a connection
npx @smithery/cli tool list <connection>

# Example:
npx @smithery/cli tool list github
```

#### Get Tool Schema

```bash
# Get input/output schema for a tool
npx @smithery/cli tool get <connection> <tool>

# Example:
npx @smithery/cli tool get github create_issue
```

#### Call a Tool

```bash
# Call a tool with arguments
npx @smithery/cli tool call <connection> <tool> [args]

# Example:
npx @smithery/cli tool call exa search '{"query": "AI news"}'
```

### Skill Management

#### Search for Skills

```bash
# Search for skills in the Smithery registry
npx @smithery/cli skill search <query>

# Examples:
npx @smithery/cli skill search "web scraping"
npx @smithery/cli skill search github --limit 20
```

Options:
- `--limit <number>` - Max results (default: 10)
- `--page <number>` - Page number
- `--namespace <namespace>` - Filter by namespace
- `-i, --interactive` - Interactive mode

#### View Skill Documentation

```bash
# View a skill's documentation without installing
npx @smithery/cli skill view <identifier>

# Example:
npx @smithery/cli skill view smithery-ai/cli
```

#### Install/Add Skills

```bash
# Add a skill to your agent
npx @smithery/cli skill add <skill>

# Examples:
npx @smithery/cli skill add smithery-ai/cli
npx @smithery/cli skill add <skill> --agent claude-code
npx @smithery/cli skill add <skill> --global  # Install globally
```

Options:
- `-a, --agent <name>` - Target agent (claude-code, cursor, codex, windsurf, cline, ...)
- `-g, --global` - Install globally instead of project-level

#### List Available Agents

```bash
# List available agents for skill installation
npx @smithery/cli skill agents
```

### Authentication

```bash
# Authentication commands
npx @smithery/cli auth --help
```

## Common Workflows

### Installing an MCP Server for GitHub Integration

```bash
# Step 1: Search for GitHub MCP servers
npx @smithery/cli mcp search github

# Step 2: Add the GitHub MCP server
npx @smithery/cli mcp add <selected-server> --name "GitHub Integration"

# Step 3: List available tools
npx @smithery/cli tool list github

# Step 4: Use the tools
npx @smithery/cli tool call github create_repo '{"name": "my-new-repo"}'
```

### Installing a Skill

```bash
# Step 1: Search for relevant skills
npx @smithery/cli skill search "data analysis"

# Step 2: View the skill details
npx @smithery/cli skill view <skill-identifier>

# Step 3: Install the skill
npx @smithery/cli skill add <skill-identifier> --agent claude-code
```

### Web Search with Exa MCP

```bash
# Add Exa web search MCP
npx @smithery/cli mcp add https://server.smithery.ai/exa --id exa

# Search the web
npx @smithery/cli tool call exa web_search_exa '{"query": "latest AI news"}'
```

## Popular MCP Servers

Here are some commonly used MCP servers available on Smithery:

| Server | Description | Use Case |
|--------|-------------|----------|
| `exa` | Web search and crawling | Web search, content discovery |
| `github` | GitHub integration | Repo management, issues, PRs |
| `slack` | Slack integration | Messaging, channels |
| `notion` | Notion integration | Notes, databases |
| `postgres` | PostgreSQL database | Database operations |
| `filesystem` | File system operations | File management |
| `brave-search` | Brave search engine | Web search |
| `puppeteer` | Browser automation | Web scraping, screenshots |

## JSON Output

For programmatic use, add `--json` flag:

```bash
npx @smithery/cli mcp search slack --json
npx @smithery/cli mcp list --json
npx @smithery/cli tool list github --json
```

## Tips and Best Practices

1. **Use `--json` for parsing**: When integrating with scripts, use JSON output for reliable parsing.

2. **Verify servers**: Use `--verified` flag to find officially verified servers for better reliability.

3. **Custom IDs**: Use `--id` to give connections memorable names for easier reference.

4. **Check tool schemas**: Use `tool get` before calling a tool to understand required parameters.

5. **Client-specific installs**: Use `--client` to install directly to your AI client's configuration.

6. **Global vs project**: Use `--global` for skills you want available across all projects.

## Troubleshooting

### Connection Issues

```bash
# Check your connections
npx @smithery/cli mcp list

# Get detailed connection info
npx @smithery/cli mcp get <connection-id>
```

### Tool Call Failures

```bash
# Verify tool exists and check schema
npx @smithery/cli tool get <connection> <tool-name>

# Check if connection is active
npx @smithery/cli mcp get <connection>
```

### Authentication Issues

```bash
# Check authentication status
npx @smithery/cli auth status
```

## Related Resources

- Smithery Website: https://smithery.ai
- Smithery CLI GitHub: https://github.com/smithery-ai/cli
- Smithery Documentation: https://smithery.ai/docs
- MCP Specification: https://modelcontextprotocol.io
