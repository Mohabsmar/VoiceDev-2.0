---
name: super-z-capabilities
description: "Complete catalog of Super Z's skills, tools, and marketplaces. Use this skill when users ask about available capabilities, what Super Z can do, how to use specific features, or want to discover new tools and integrations. This is the master reference for all Super Z capabilities."
---

# Super Z Capabilities Catalog

Complete reference for all available skills, tools, and marketplaces in Super Z.

---

## Quick Navigation

| Category | Description |
|----------|-------------|
| [Core Tools](#core-tools) | Built-in tools for file operations, search, and task management |
| [AI & Media Skills](#ai--media-skills) | Image, video, audio, and LLM capabilities |
| [Document Skills](#document-skills) | Word, PDF, Excel, PowerPoint processing |
| [Development Skills](#development-skills) | Fullstack, frontend, backend development |
| [Research Skills](#research-skills) | Web search, academic research, finance data |
| [Productivity Skills](#productivity-skills) | Memory, self-improvement, automation |
| [Marketplaces](#marketplaces) | Where to find and install more skills/tools |
| [Subagents](#subagents) | Specialized AI agents for complex tasks |

---

## Core Tools

These are built-in tools always available without invoking skills:

### File Operations

| Tool | Description |
|------|-------------|
| **Read** | Read text files from the filesystem (supports offset/limit for large files) |
| **Write** | Create or overwrite files with new content |
| **Edit** | Perform string replacements in existing files |
| **MultiEdit** | Make multiple edits to a single file in one operation |
| **LS** | List files and directories in a given path |
| **Glob** | Fast file pattern matching (e.g., `**/*.ts`) |
| **Grep** | Search file contents using ripgrep with regex support |

### Task Management

| Tool | Description |
|------|-------------|
| **TodoWrite** | Create and manage a structured task list |
| **TodoRead** | Read current todo list state |
| **Task** | Launch specialized subagents for complex tasks |
| **Complete** | Mark a project as completed with summary |
| **Skill** | Invoke specialized skills for domain-specific tasks |

### Execution

| Tool | Description |
|------|-------------|
| **Bash** | Execute shell commands with timeout and persistent sessions |

---

## AI & Media Skills

### Image Generation

**Skill:** `image-generation`

Generate images from text descriptions using AI.

```bash
# CLI usage
z-ai-generate --prompt "A beautiful landscape" --output "./image.png"
z-ai-generate -p "A cute cat" -o "./cat.png" -s 1024x1024
```

**Supported sizes:**
- `1024x1024` (square)
- `768x1344` (portrait)
- `864x1152` (portrait)
- `1344x768` (landscape)
- `1152x864` (landscape)
- `1440x720` (wide)
- `720x1440` (tall)

**SDK Usage:**
```javascript
import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();
const response = await zai.images.generations.create({
  prompt: 'A cute cat playing in the garden',
  size: '1024x1024'
});
// Returns base64 encoded image
const imageBase64 = response.data[0].base64;
```

### Vision Language Model (VLM)

**Skill:** `VLM`

Analyze images and describe visual content. Supports image URLs and base64 encoded images for multimodal interactions.

**Use cases:**
- Image understanding and description
- Visual content analysis
- Image-based Q&A

### Nano Banana Pro Image

**Skill:** `nano-banana-pro-image`

Premium AI image generation using Google's Nano Banana Pro (Gemini 3 Pro Image / Imagen Pro).

**Features:**
- High-fidelity text rendering
- Complex multi-turn creation
- Up to 6 reference images
- Resolutions up to 4K
- 14+ aspect ratios
- Advanced reasoning ("Thinking" mode)

**Use for:** Professional images, infographics, menus, diagrams, marketing assets.

### Video Generation

**Skill:** `video-generation`

Generate videos from text prompts or images using AI.

**Features:**
- Text-to-video generation
- Image-to-video conversion
- Asynchronous task management
- Status polling and result retrieval

### Video Understanding

**Skill:** `video-understand`

Analyze video content, understand motion and temporal sequences, extract information from video frames.

**Supported formats:** MP4, AVI, MOV

### Text-to-Speech (TTS)

**Skill:** `TTS`

Convert text into natural-sounding speech.

**Features:**
- Multiple voices
- Adjustable speed
- Various audio formats
- Voice-enabled applications

### Automatic Speech Recognition (ASR)

**Skill:** `ASR`

Transcribe audio files to text (speech-to-text).

**Features:**
- Base64 encoded audio support
- Accurate transcriptions
- Voice input features

### Large Language Model (LLM)

**Skill:** `LLM`

Chat completions and conversational AI.

```javascript
import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();
const completion = await zai.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello, who are you?' }
  ]
});
console.log(completion.choices[0]?.message?.content);
```

### Wan Image/Video Generation & Editing

**Skill:** `wan-image-video-generation-editting`

Comprehensive image and video generation and editing with Wan series models.

**Capabilities:**
- Text-to-image
- Image editing with prompts
- Text-to-video
- Image-to-video
- Reference-to-video (image or video)

---

## Document Skills

### PDF Manipulation

**Skill:** `pdf`

Comprehensive PDF toolkit for creating, editing, and analyzing PDFs.

**Capabilities:**
- Extract text and tables
- Create new PDFs
- Merge/split documents
- Form filling
- PDF metadata handling

### Word Documents (DOCX)

**Skill:** `docx`

Create and edit professional Word documents.

**Features:**
- Document creation with formatting
- Tracked changes support
- Comments
- Text extraction
- Template management

### Spreadsheets (XLSX)

**Skill:** `xlsx`

Comprehensive spreadsheet creation, editing, and analysis.

**Features:**
- Create new spreadsheets with formulas
- Data analysis and visualization
- Format preservation
- Recalculate formulas
- Support for .xlsx, .xlsm, .csv, .tsv

### Presentations (PPTX)

**Skill:** `pptx`

Create and edit PowerPoint presentations.

**Features:**
- New presentation creation
- Slide layouts and formatting
- Speaker notes
- Export to various formats
- HTML to PPTX conversion

### Canva Integration

**Skill:** `canva-2`

MCP skill for Canva with 22 tools.

**Tools include:**
- upload-asset-from-url
- search-designs
- get-design / get-design-pages
- import-design-from-url
- merge-designs
- export-design
- create-folder
- comment-on-design
- generate-design
- list-brand-kits

---

## Development Skills

### Fullstack Web Development

**Skill:** `fullstack-dev`

Build complete web applications with modern stack.

**Stack:**
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM (SQLite)
- **Auth:** NextAuth.js v4
- **State:** Zustand + TanStack Query

**Features:**
- UI components
- API routes
- Database schemas
- WebSocket/Socket.io support
- Real-time applications

**Initialization:**
```bash
curl https://z-cdn.chatglm.cn/fullstack/init-fullstack_1773298087387.sh | bash
```

### Agent Browser

**Skill:** `agent-browser`

Fast Rust-based headless browser automation with Node.js fallback.

**Capabilities:**
- Navigate pages
- Click elements
- Type text
- Take snapshots
- Web scraping

### UI/UX Pro Max

**Skill:** `ui-ux-pro-max`

Professional UI/UX design guidance with extensive reference data.

**Includes:**
- Color systems
- Typography
- UI guidelines
- Chart design
- Landing page patterns
- React performance
- Multiple stack support (React, Vue, Svelte, Next.js, etc.)

### Visual Design Foundations

**Skill:** `visual-design-foundations`

Core design principles including typography, color systems, and spacing/iconography.

---

## Research Skills

### Web Search

**Skill:** `web-search`

Search the web for real-time information.

```javascript
import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();
const searchResult = await zai.functions.invoke("web_search", {
  query: "What is the capital of France?",
  num: 10
});
// Returns array of {url, name, snippet, host_name, rank, date, favicon}
```

### Web Reader

**Skill:** `web-reader`

Extract content from web pages.

**Features:**
- Automatic content extraction
- Title and HTML retrieval
- Publication time metadata

### Finance API

**Skill:** `finance`

Comprehensive financial data access.

**Capabilities:**
- Real-time quotes
- Historical data
- Market indices
- Currency/forex data
- Cryptocurrency
- Stock screening
- Financial ratios
- Technical indicators
- Company information
- Market news
- Insider trading data
- Options data

### AMiner Open Academic

**Skill:** `aminer-open-academic`

Access academic research and publications.

### Multi-Search Engine

**Skill:** `multi-search-engine`

Search across multiple international search engines.

---

## Productivity Skills

### Self-Improving Agent

**Skill:** `self-improving`

Self-reflection, self-criticism, self-learning, and self-organizing memory.

**Features:**
- Evaluates its own work
- Catches mistakes
- Improves permanently
- Learns from corrections
- Tiered memory (HOT/WARM/COLD)

**Use when:**
- Commands/tools/APIs fail
- User corrects you
- Knowledge is outdated
- Better approach discovered

### Elite Long-Term Memory

**Skill:** `elite-longterm-memory`

Ultimate AI agent memory system with:
- WAL protocol
- Vector search
- Git-notes
- Cloud backup
- Never lose context

### Proactive Agent Lite

**Skill:** `proactive-agent-lite`

Transform from passive task-follower to proactive partner.

**Features:**
- Memory architecture
- Reverse prompting
- Self-healing patterns
- Anticipates needs
- Continuous learning

### Skill Creator

**Skill:** `skill-creator`

Create, modify, and improve skills.

**Workflow:**
1. Define skill purpose
2. Write SKILL.md
3. Create test cases
4. Run evaluations
5. Iterate and improve

**Features:**
- Description optimization
- Benchmark testing
- Variance analysis
- Performance measurement

### Skill Vetter

**Skill:** `skill-vetter`

Security-first skill vetting before installation.

**Checks for:**
- Red flags (malware, data exfiltration)
- Permission scope
- Suspicious patterns
- Risk classification (LOW/MEDIUM/HIGH/EXTREME)

**Always use before installing skills from external sources.**

### Auto Target Tracker

**Skill:** `auto-target-tracker`

Automatically track and manage targets/goals.

---

## Creative Skills

### Blog Writer

**Skill:** `blog-writer`

Professional blog writing with style guide and examples.

### SEO Content Writer

**Skill:** `seo-content-writer`

SEO-optimized content creation with title formulas and content structure templates.

### Content Strategy

**Skill:** `content-strategy`

Strategic content planning and development.

### Storyboard Manager

**Skill:** `storyboard-manager`

Manage story structures and character development.

### Interview Designer

**Skill:** `interview-designer`

Design professional interview guides with templates.

---

## Specialized Skills

### Market Research Reports

**Skill:** `market-research-reports`

Generate professional market research reports with visuals.

### Dream Interpreter

**Skill:** `dream-interpreter`

Interpret dreams with questioning strategy and visual mapping.

### Mindfulness Meditation

**Skill:** `mindfulness-meditation`

Guided meditation and mindfulness exercises.

### Gift Evaluator

**Skill:** `gift-evaluator`

Evaluate and recommend gifts.

### Qingyan Research

**Skill:** `qingyan-research`

Research with HTML generation.

### Fortune Analysis

**Skill:** `get-fortune-analysis`

Fortune telling and analysis with lunar calendar support.

### Stock Analysis

**Skill:** `stock-analysis-skill`

Stock market analysis with watchlist, data fetching, and rumor scanning.

---

## Marketplaces

### Smithery

**Skill:** `smithery`

Install, manage, and use MCP servers and skills from the Smithery registry.

**Access:** 100K+ AI tools, thousands of MCP servers

**CLI Usage:**
```bash
# Search for MCP servers
npx @smithery/cli mcp search slack

# Add MCP server
npx @smithery/cli mcp add https://server.smithery.ai/exa

# Search for skills
npx @smithery/cli skill search "data analysis"

# Install skill
npx @smithery/cli skill add smithery-ai/cli
```

**Available clients:** claude-code, vscode, cursor, windsurf, cline, codex, gemini-cli, and more.

**Popular MCP servers:**
| Server | Use Case |
|--------|----------|
| exa | Web search and crawling |
| github | Repository management |
| slack | Messaging integration |
| notion | Notes and databases |
| postgres | Database operations |
| puppeteer | Browser automation |

### MCP Skill (Exa)

**Skill:** `mcp-skill`

Access Exa MCP at https://mcp.exa.ai/mcp

**Tools:**
- web_search_exa
- web_search_advanced_exa
- get_code_context_exa
- deep_search_exa
- crawling_exa
- company_research_exa
- linkedin_search_exa
- deep_researcher_start
- deep_researcher_check

### ClawdHub

External marketplace for skills.

**Install command:** `clawhub install <slug>`

**Related commands:**
- `clawhub star <slug>` - Star useful skills
- `clawhub sync` - Stay updated

---

## Subagents

Specialized AI agents launched via the Task tool:

### General Purpose Agent

**Type:** `general-purpose`

For researching complex questions, searching code, and multi-step tasks.

### Explore Agent

**Type:** `Explore`

Fast codebase exploration. Thoroughness levels: `quick`, `medium`, `very thorough`.

**Use for:**
- Find files by patterns
- Search code for keywords
- Answer codebase questions

### Plan Agent

**Type:** `Plan`

Software architect for designing implementation plans.

**Provides:**
- Step-by-step plans
- Critical file identification
- Architectural trade-offs

### Frontend Styling Expert

**Type:** `frontend-styling-expert`

CSS, styling frameworks, responsive design, UI/UX implementation.

**Use for:**
- Responsive navigation
- Button hover effects
- Centering solutions
- Animation optimization

### Full-Stack Developer

**Type:** `full-stack-developer`

Production-ready Next.js 15 web development.

**Excels at:**
- Complete websites
- Data visualization dashboards
- Blog/CMS systems
- Responsive web pages
- AI features integration
- Real-time collaborative apps

---

## Skill Structure

```
skill-name/
├── SKILL.md          # Required: Main skill definition
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/      # Executable code
    ├── references/   # Documentation
    └── assets/       # Templates, icons, fonts
```

---

## Loading System

Skills use three-level loading:

1. **Metadata** - Always in context (~100 words)
2. **SKILL.md body** - Loaded when skill triggers (<500 lines)
3. **Bundled resources** - As needed (unlimited)

---

## Best Practices

### Choosing the Right Tool

1. **Simple file read** → Use Read tool directly
2. **Pattern search** → Use Glob or Grep
3. **Complex multi-step** → Use Task with subagent
4. **Domain-specific** → Invoke appropriate Skill

### Skill Invocation

```javascript
Skill(command="skill-name")
```

Always invoke skills when the user's task matches the skill description.

### Parallel Operations

Launch multiple subagents in a single message when possible:
- Multiple file reads
- Parallel searches
- Concurrent development tasks

---

## Quick Reference by Task Type

| User Wants | Use |
|------------|-----|
| Generate image | `image-generation` or `nano-banana-pro-image` |
| Analyze image | `VLM` |
| Create video | `video-generation` |
| Analyze video | `video-understand` |
| Text to speech | `TTS` |
| Speech to text | `ASR` |
| Create PDF | `pdf` |
| Create Word doc | `docx` |
| Create spreadsheet | `xlsx` |
| Create presentation | `pptx` |
| Build website | `fullstack-dev` |
| Search web | `web-search` |
| Read webpage | `web-reader` |
| Financial data | `finance` |
| Install MCP/tools | `smithery` |
| Create new skill | `skill-creator` |
| Vet a skill | `skill-vetter` |
| AI chat | `LLM` |

---

*This catalog is automatically updated. For the latest capabilities, invoke this skill.*
