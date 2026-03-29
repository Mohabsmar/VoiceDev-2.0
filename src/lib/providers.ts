// ============================================================================
// VoiceDev 2.0 - Provider Registry & Built-in Tools
// ============================================================================

import type { ProviderInfo } from './types';

// ---------------------------------------------------------------------------
// 20 Providers – 154 Models Total
// ---------------------------------------------------------------------------

export const PROVIDERS: ProviderInfo[] = [
  // ── 1. OpenAI ────────────────────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI',
    color: '#10a37f',
    baseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization',
    envKey: 'OPENAI_API_KEY',
    features: ['Chat', 'Vision', 'TTS', 'STT', 'Embeddings', 'Image Gen', 'Code'],
    website: 'https://openai.com',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gpt-4', name: 'GPT-4', category: 'LLM', contextWindow: 8192, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2023', pricing: 'Paid' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'LLM', contextWindow: 16385, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2023', pricing: 'Paid' },
      { id: 'o1', name: 'o1', category: 'Reasoning', contextWindow: 200000, features: ['Chat', 'Reasoning', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'o1-mini', name: 'o1 Mini', category: 'Reasoning', contextWindow: 128000, features: ['Chat', 'Reasoning', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'o3-mini', name: 'o3 Mini', category: 'Reasoning', contextWindow: 200000, features: ['Chat', 'Reasoning', 'Code', 'Function Calling'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'dall-e-3', name: 'DALL·E 3', category: 'Image', contextWindow: 4096, features: ['Image Gen', 'Editing'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'tts-1', name: 'TTS-1', category: 'TTS', contextWindow: 4096, features: ['TTS', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'tts-1-hd', name: 'TTS-1 HD', category: 'TTS', contextWindow: 4096, features: ['TTS', 'HD'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'whisper-1', name: 'Whisper', category: 'ASR', contextWindow: 0, features: ['ASR', 'Transcription'], releaseDate: '2023', pricing: 'Paid' },
      { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', category: 'Embedding', contextWindow: 8191, features: ['Embeddings'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', category: 'Embedding', contextWindow: 8191, features: ['Embeddings'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 2. Anthropic ─────────────────────────────────────────────────────────
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#d4a574',
    baseUrl: 'https://api.anthropic.com/v1',
    authHeader: 'x-api-key',
    envKey: 'ANTHROPIC_API_KEY',
    features: ['Chat', 'Vision', 'Code', 'Analysis', 'Long Context'],
    website: 'https://anthropic.com',
    models: [
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling', 'Code', 'Agentic'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling', 'Code', 'Agentic'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Analysis'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 3. Google AI ─────────────────────────────────────────────────────────
  {
    id: 'google',
    name: 'Google AI',
    color: '#ea4335',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authHeader: 'x-goog-api-key',
    envKey: 'GOOGLE_API_KEY',
    features: ['Chat', 'Vision', 'Code', 'Multimodal', 'Image Gen'],
    website: 'https://ai.google',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', category: 'LLM', contextWindow: 1000000, features: ['Chat', 'Vision', 'Code', 'Streaming', 'Function Calling', 'Reasoning'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', category: 'LLM', contextWindow: 1000000, features: ['Chat', 'Vision', 'Code', 'Streaming', 'Function Calling'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', category: 'LLM', contextWindow: 1000000, features: ['Chat', 'Vision', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'LLM', contextWindow: 2000000, features: ['Chat', 'Vision', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'LLM', contextWindow: 1000000, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gemini-ultra', name: 'Gemini Ultra', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Vision', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'gemini-nano', name: 'Gemini Nano', category: 'LLM', contextWindow: 32000, features: ['Chat', 'On-Device', 'Streaming'], releaseDate: '2024', pricing: 'Free' },
      { id: 'imagen-3', name: 'Imagen 3', category: 'Image', contextWindow: 4096, features: ['Image Gen', 'Editing'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 4. DeepSeek ──────────────────────────────────────────────────────────
  {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#4d6bfe',
    baseUrl: 'https://api.deepseek.com/v1',
    authHeader: 'Authorization',
    envKey: 'DEEPSEEK_API_KEY',
    features: ['Chat', 'Code', 'Reasoning', 'Math'],
    website: 'https://deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)', category: 'Reasoning', contextWindow: 128000, features: ['Chat', 'Reasoning', 'Code', 'Math'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Code', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'deepseek-math', name: 'DeepSeek Math', category: 'Reasoning', contextWindow: 32000, features: ['Chat', 'Reasoning', 'Math'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'deepseek-v2', name: 'DeepSeek V2', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 5. xAI ───────────────────────────────────────────────────────────────
  {
    id: 'xai',
    name: 'xAI',
    color: '#1a1a2e',
    baseUrl: 'https://api.x.ai/v1',
    authHeader: 'Authorization',
    envKey: 'XAI_API_KEY',
    features: ['Chat', 'Vision', 'Image Gen', 'Code'],
    website: 'https://x.ai',
    models: [
      { id: 'grok-3', name: 'Grok 3', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'grok-2', name: 'Grok 2', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'grok-2-vision', name: 'Grok 2 Vision', category: 'Vision', contextWindow: 32768, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'aurora', name: 'Aurora', category: 'Image', contextWindow: 4096, features: ['Image Gen'], releaseDate: '2025', pricing: 'Paid' },
      { id: 'grok-beta', name: 'Grok Beta', category: 'LLM', contextWindow: 32768, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 6. Z.ai (GLM) ───────────────────────────────────────────────────────
  {
    id: 'zai',
    name: 'Z.ai (GLM)',
    color: '#3366ff',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    authHeader: 'Authorization',
    envKey: 'ZAI_API_KEY',
    features: ['Chat', 'Vision', 'Code', 'Embeddings'],
    website: 'https://open.bigmodel.cn',
    models: [
      { id: 'glm-4-plus', name: 'GLM-4 Plus', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'glm-4v-plus', name: 'GLM-4V Plus', category: 'Vision', contextWindow: 8192, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 7. Moonshot AI ───────────────────────────────────────────────────────
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    color: '#6c5ce7',
    baseUrl: 'https://api.moonshot.cn/v1',
    authHeader: 'Authorization',
    envKey: 'MOONSHOT_API_KEY',
    features: ['Chat', 'Long Context', 'Vision'],
    website: 'https://moonshot.cn',
    models: [
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Long Context'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', category: 'LLM', contextWindow: 8192, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'kimi-vision', name: 'Kimi Vision', category: 'Vision', contextWindow: 128000, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2025', pricing: 'Paid' },
    ],
  },

  // ── 8. MiniMax ───────────────────────────────────────────────────────────
  {
    id: 'minimax',
    name: 'MiniMax',
    color: '#ff6b35',
    baseUrl: 'https://api.minimax.chat/v1',
    authHeader: 'Authorization',
    envKey: 'MINIMAX_API_KEY',
    features: ['Chat', 'TTS', 'Voice'],
    website: 'https://minimax.chat',
    models: [
      { id: 'abab-6.5s', name: 'abab 6.5s', category: 'LLM', contextWindow: 245760, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'abab-6.5', name: 'abab 6.5', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'abab-5.5s', name: 'abab 5.5s', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'speech-01', name: 'Speech-01', category: 'TTS', contextWindow: 4096, features: ['TTS', 'Voice Clone'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 9. Groq ──────────────────────────────────────────────────────────────
  {
    id: 'groq',
    name: 'Groq',
    color: '#f55036',
    baseUrl: 'https://api.groq.com/openai/v1',
    authHeader: 'Authorization',
    envKey: 'GROQ_API_KEY',
    features: ['Chat', 'Ultra-Low Latency', 'Code'],
    website: 'https://groq.com',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', category: 'LLM', contextWindow: 32768, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', category: 'LLM', contextWindow: 8192, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'whisper-large-v3', name: 'Whisper Large V3', category: 'ASR', contextWindow: 0, features: ['ASR', 'Transcription'], releaseDate: '2024', pricing: 'Freemium' },
    ],
  },

  // ── 10. Mistral AI ───────────────────────────────────────────────────────
  {
    id: 'mistral',
    name: 'Mistral AI',
    color: '#ff7000',
    baseUrl: 'https://api.mistral.ai/v1',
    authHeader: 'Authorization',
    envKey: 'MISTRAL_API_KEY',
    features: ['Chat', 'Code', 'Vision', 'Embeddings'],
    website: 'https://mistral.ai',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'mistral-small-latest', name: 'Mistral Small', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'codestral-latest', name: 'Codestral', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Code', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'pixtral-large-latest', name: 'Pixtral Large', category: 'Vision', contextWindow: 128000, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'mistral-embed', name: 'Mistral Embed', category: 'Embedding', contextWindow: 8192, features: ['Embeddings'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 11. Cohere ───────────────────────────────────────────────────────────
  {
    id: 'cohere',
    name: 'Cohere',
    color: '#39d353',
    baseUrl: 'https://api.cohere.ai/v2',
    authHeader: 'Authorization',
    envKey: 'COHERE_API_KEY',
    features: ['Chat', 'Embeddings', 'RAG', 'Enterprise'],
    website: 'https://cohere.com',
    models: [
      { id: 'command-r-plus', name: 'Command R+', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'RAG', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'command-r', name: 'Command R', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'RAG'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'command-light', name: 'Command Light', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'embed-english-v3.0', name: 'Embed English v3', category: 'Embedding', contextWindow: 512, features: ['Embeddings'], releaseDate: '2024', pricing: 'Freemium' },
    ],
  },

  // ── 12. Together AI ──────────────────────────────────────────────────────
  {
    id: 'together',
    name: 'Together AI',
    color: '#3b82f6',
    baseUrl: 'https://api.together.xyz/v1',
    authHeader: 'Authorization',
    envKey: 'TOGETHER_API_KEY',
    features: ['Chat', 'Code', 'Image Gen', 'Open Source'],
    website: 'https://together.ai',
    models: [
      { id: 'meta-llama-3.3-70b', name: 'Llama 3.3 70B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'stabilityai-stable-diffusion-xl', name: 'Stable Diffusion XL', category: 'Image', contextWindow: 4096, features: ['Image Gen'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'codellama-34b', name: 'CodeLlama 34B', category: 'LLM', contextWindow: 16384, features: ['Chat', 'Code', 'Streaming'], releaseDate: '2024', pricing: 'Freemium' },
    ],
  },

  // ── 13. OpenRouter ───────────────────────────────────────────────────────
  {
    id: 'openrouter',
    name: 'OpenRouter',
    color: '#7c3aed',
    baseUrl: 'https://openrouter.ai/api/v1',
    authHeader: 'Authorization',
    envKey: 'OPENROUTER_API_KEY',
    features: ['Multi-Provider', 'Chat', 'Vision', 'Code'],
    website: 'https://openrouter.ai',
    models: [
      { id: 'openrouter-auto', name: 'Auto (Best Available)', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Auto-Routing'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'anthropic-claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Vision', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'google-gemini-pro', name: 'Gemini Pro', category: 'LLM', contextWindow: 32000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'meta-llama-3.1-405b', name: 'Llama 3.1 405B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'mistral-large', name: 'Mistral Large', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 14. Perplexity ───────────────────────────────────────────────────────
  {
    id: 'perplexity',
    name: 'Perplexity',
    color: '#22d3ee',
    baseUrl: 'https://api.perplexity.ai',
    authHeader: 'Authorization',
    envKey: 'PERPLEXITY_API_KEY',
    features: ['Search', 'Chat', 'Citations', 'RAG'],
    website: 'https://perplexity.ai',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', category: 'LLM', contextWindow: 200000, features: ['Chat', 'Streaming', 'Search', 'Citations'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'sonar', name: 'Sonar', category: 'LLM', contextWindow: 127000, features: ['Chat', 'Streaming', 'Search', 'Citations'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning', category: 'Reasoning', contextWindow: 127000, features: ['Chat', 'Streaming', 'Search', 'Reasoning'], releaseDate: '2025', pricing: 'Paid' },
    ],
  },

  // ── 15. Fireworks AI ─────────────────────────────────────────────────────
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    color: '#ef4444',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    authHeader: 'Authorization',
    envKey: 'FIREWORKS_API_KEY',
    features: ['Chat', 'Code', 'Fast Inference', 'Open Source'],
    website: 'https://fireworks.ai',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', category: 'LLM', contextWindow: 65536, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'firefunction-v2', name: 'FireFunction V2', category: 'LLM', contextWindow: 32768, features: ['Chat', 'Streaming', 'Function Calling'], releaseDate: '2024', pricing: 'Freemium' },
    ],
  },

  // ── 16. SiliconFlow ──────────────────────────────────────────────────────
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    color: '#7c3aed',
    baseUrl: 'https://api.siliconflow.cn/v1',
    authHeader: 'Authorization',
    envKey: 'SILICONFLOW_API_KEY',
    features: ['Chat', 'Image Gen', 'Open Source', 'Chinese'],
    website: 'https://siliconflow.cn',
    models: [
      { id: 'deepseek-ai-deepseek-v3', name: 'DeepSeek V3', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'qwen-qwen-2.5-72b', name: 'Qwen 2.5 72B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'stabilityai-stable-diffusion-3', name: 'Stable Diffusion 3', category: 'Image', contextWindow: 4096, features: ['Image Gen'], releaseDate: '2024', pricing: 'Freemium' },
    ],
  },

  // ── 17. AI21 Labs ────────────────────────────────────────────────────────
  {
    id: 'ai21',
    name: 'AI21 Labs',
    color: '#f97316',
    baseUrl: 'https://api.ai21.com/studio/v1',
    authHeader: 'Authorization',
    envKey: 'AI21_API_KEY',
    features: ['Chat', 'Enterprise', 'Long Context'],
    website: 'https://ai21.com',
    models: [
      { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', category: 'LLM', contextWindow: 256000, features: ['Chat', 'Streaming', 'Function Calling', 'Long Context'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', category: 'LLM', contextWindow: 256000, features: ['Chat', 'Streaming', 'Long Context'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 18. ElevenLabs ───────────────────────────────────────────────────────
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    color: '#374151',
    baseUrl: 'https://api.elevenlabs.io/v1',
    authHeader: 'xi-api-key',
    envKey: 'ELEVENLABS_API_KEY',
    features: ['TTS', 'Voice Clone', 'STT', 'Sound Effects'],
    website: 'https://elevenlabs.io',
    models: [
      { id: 'eleven-multilingual-v2', name: 'Eleven Multilingual V2', category: 'TTS', contextWindow: 4096, features: ['TTS', 'Multilingual', 'Voice Clone'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'eleven-turbo-v2', name: 'Eleven Turbo V2', category: 'TTS', contextWindow: 4096, features: ['TTS', 'Low Latency', 'Voice Clone'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual V1', category: 'TTS', contextWindow: 4096, features: ['TTS'], releaseDate: '2023', pricing: 'Freemium' },
      { id: 'whisper-stt', name: 'Whisper STT', category: 'ASR', contextWindow: 0, features: ['ASR', 'Transcription'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 19. Alibaba Qwen ─────────────────────────────────────────────────────
  {
    id: 'qwen',
    name: 'Alibaba Qwen',
    color: '#6d28d9',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    authHeader: 'Authorization',
    envKey: 'QWEN_API_KEY',
    features: ['Chat', 'Vision', 'Code', 'Chinese', 'Multimodal'],
    website: 'https://qwenlm.github.io',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Function Calling', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'qwen-plus', name: 'Qwen Plus', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'qwen-turbo', name: 'Qwen Turbo', category: 'LLM', contextWindow: 128000, features: ['Chat', 'Streaming'], releaseDate: '2024', pricing: 'Freemium' },
      { id: 'qwen-vl-max', name: 'Qwen VL Max', category: 'Vision', contextWindow: 32768, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'qwen-vl-plus', name: 'Qwen VL Plus', category: 'Vision', contextWindow: 8192, features: ['Chat', 'Vision', 'Streaming'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },

  // ── 20. Replicate ────────────────────────────────────────────────────────
  {
    id: 'replicate',
    name: 'Replicate',
    color: '#2563eb',
    baseUrl: 'https://api.replicate.com/v1',
    authHeader: 'Authorization',
    envKey: 'REPLICATE_API_TOKEN',
    features: ['Image Gen', 'Code', 'Open Source Models', 'ML Hosting'],
    website: 'https://replicate.com',
    models: [
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', category: 'LLM', contextWindow: 131072, features: ['Chat', 'Streaming', 'Code'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'stability-sdxl', name: 'Stable Diffusion XL', category: 'Image', contextWindow: 4096, features: ['Image Gen'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'black-forest-labs-flux-schnell', name: 'FLUX Schnell', category: 'Image', contextWindow: 4096, features: ['Image Gen', 'Fast'], releaseDate: '2024', pricing: 'Paid' },
      { id: 'controlnet', name: 'ControlNet', category: 'Image', contextWindow: 4096, features: ['Image Gen', 'Control'], releaseDate: '2024', pricing: 'Paid' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Marketplace Sources
// ---------------------------------------------------------------------------

export const MARKETPLACE_SOURCES = [
  'Smithery',
  'ClawHub',
  'HuggingFace',
  'npm',
  'PyPI',
  'VoiceDev Built-in',
] as const;

// ---------------------------------------------------------------------------
// Built-in Tools (42 tools)
// ---------------------------------------------------------------------------

export const BUILTIN_TOOLS = [
  // File System (10)
  { id: 'read-file', name: 'Read File', description: 'Read contents of a file from disk', category: 'File System', icon: 'FileText' },
  { id: 'write-file', name: 'Write File', description: 'Write content to a file on disk', category: 'File System', icon: 'FileEdit' },
  { id: 'delete-file', name: 'Delete File', description: 'Delete a file from disk', category: 'File System', icon: 'Trash2' },
  { id: 'copy-file', name: 'Copy File', description: 'Copy a file to a new location', category: 'File System', icon: 'Copy' },
  { id: 'move-file', name: 'Move File', description: 'Move or rename a file', category: 'File System', icon: 'FolderInput' },
  { id: 'rename-file', name: 'Rename File', description: 'Rename a file in place', category: 'File System', icon: 'PenLine' },
  { id: 'search-files', name: 'Search Files', description: 'Search for files matching a pattern', category: 'File System', icon: 'Search' },
  { id: 'hash-file', name: 'Hash File', description: 'Compute hash of a file (MD5, SHA256)', category: 'File System', icon: 'Hash' },
  { id: 'watch-file', name: 'Watch File', description: 'Monitor file changes in real-time', category: 'File System', icon: 'Eye' },
  { id: 'backup-file', name: 'Backup File', description: 'Create a backup copy of a file', category: 'File System', icon: 'Shield' },

  // System (6)
  { id: 'shell-exec', name: 'Shell Execute', description: 'Run a shell command and return output', category: 'System', icon: 'Terminal' },
  { id: 'python-exec', name: 'Python Execute', description: 'Execute Python code in an isolated runtime', category: 'System', icon: 'Code' },
  { id: 'node-exec', name: 'Node Execute', description: 'Execute JavaScript/Node.js code', category: 'System', icon: 'Braces' },
  { id: 'env-get', name: 'Get Environment Variable', description: 'Read an environment variable value', category: 'System', icon: 'Key' },
  { id: 'env-list', name: 'List Environment Variables', description: 'List all available environment variables', category: 'System', icon: 'List' },
  { id: 'process-list', name: 'List Processes', description: 'List running system processes', category: 'System', icon: 'Activity' },

  // Network (4)
  { id: 'http-get', name: 'HTTP GET', description: 'Send an HTTP GET request', category: 'Network', icon: 'Globe' },
  { id: 'http-post', name: 'HTTP POST', description: 'Send an HTTP POST request with body', category: 'Network', icon: 'Send' },
  { id: 'web-scrape', name: 'Web Scrape', description: 'Extract content from a web page', category: 'Network', icon: 'Scissors' },
  { id: 'webhook-fire', name: 'Fire Webhook', description: 'Trigger a webhook endpoint', category: 'Network', icon: 'Zap' },

  // Data (4)
  { id: 'json-parse', name: 'JSON Parse', description: 'Parse and validate JSON data', category: 'Data', icon: 'Braces' },
  { id: 'json-query', name: 'JSON Query', description: 'Query JSON data with a path expression', category: 'Data', icon: 'Filter' },
  { id: 'regex-match', name: 'Regex Match', description: 'Match patterns using regular expressions', category: 'Data', icon: 'Regex' },
  { id: 'data-validate', name: 'Data Validate', description: 'Validate data against a schema', category: 'Data', icon: 'CheckCircle' },

  // Git (4)
  { id: 'git-status', name: 'Git Status', description: 'Show git working tree status', category: 'Git', icon: 'GitBranch' },
  { id: 'git-commit', name: 'Git Commit', description: 'Stage and commit changes', category: 'Git', icon: 'GitCommit' },
  { id: 'git-push', name: 'Git Push', description: 'Push commits to remote', category: 'Git', icon: 'GitPush' },
  { id: 'git-diff', name: 'Git Diff', description: 'Show changes between commits or working tree', category: 'Git', icon: 'GitCompare' },

  // Security (3)
  { id: 'crypto-hash', name: 'Crypto Hash', description: 'Generate cryptographic hashes', category: 'Security', icon: 'Lock' },
  { id: 'token-generate', name: 'Token Generate', description: 'Generate secure random tokens', category: 'Security', icon: 'KeyRound' },
  { id: 'permission-check', name: 'Permission Check', description: 'Check file/directory permissions', category: 'Security', icon: 'ShieldCheck' },

  // Database (2)
  { id: 'sql-query', name: 'SQL Query', description: 'Execute SQL queries against a database', category: 'Database', icon: 'Database' },
  { id: 'redis-get', name: 'Redis Get', description: 'Get/set values in Redis', category: 'Database', icon: 'HardDrive' },

  // AI (4)
  { id: 'ai-embed', name: 'AI Embed', description: 'Generate text embeddings', category: 'AI', icon: 'Brain' },
  { id: 'ai-summarize', name: 'AI Summarize', description: 'Summarize long text using AI', category: 'AI', icon: 'FileText' },
  { id: 'ai-classify', name: 'AI Classify', description: 'Classify text into categories', category: 'AI', icon: 'Tags' },
  { id: 'ai-generate', name: 'AI Generate', description: 'Generate text, code, or content with AI', category: 'AI', icon: 'Sparkles' },

  // Voice (2)
  { id: 'tts-speak', name: 'TTS Speak', description: 'Convert text to speech', category: 'Voice', icon: 'Volume2' },
  { id: 'asr-listen', name: 'ASR Listen', description: 'Convert speech to text (transcription)', category: 'Voice', icon: 'Mic' },

  // Browser (3)
  { id: 'browser-navigate', name: 'Browser Navigate', description: 'Navigate to a URL in headless browser', category: 'Browser', icon: 'Monitor' },
  { id: 'browser-click', name: 'Browser Click', description: 'Click an element on a web page', category: 'Browser', icon: 'Pointer' },
  { id: 'browser-screenshot', name: 'Browser Screenshot', description: 'Take a screenshot of a web page', category: 'Browser', icon: 'Camera' },
] as const;

// ---------------------------------------------------------------------------
// Built-in Skills (10 skills)
// ---------------------------------------------------------------------------

export const BUILTIN_SKILLS = [
  // Development (5)
  { id: 'code-review', name: 'Code Review', description: 'Automated code review with best practices and suggestions', category: 'Development', icon: 'SearchCode' },
  { id: 'debugging', name: 'Debugging', description: 'Intelligent debugging assistant for identifying and fixing bugs', category: 'Development', icon: 'Bug' },
  { id: 'refactoring', name: 'Refactoring', description: 'Code refactoring suggestions and automated transformations', category: 'Development', icon: 'RefreshCw' },
  { id: 'testing', name: 'Testing', description: 'Generate unit tests, integration tests, and test cases', category: 'Development', icon: 'TestTube' },
  { id: 'deployment', name: 'Deployment', description: 'Deployment automation and CI/CD pipeline management', category: 'Development', icon: 'Rocket' },

  // Data (2)
  { id: 'data-analysis', name: 'Data Analysis', description: 'Analyze datasets, generate statistics and insights', category: 'Data', icon: 'BarChart3' },
  { id: 'visualization', name: 'Visualization', description: 'Create charts, graphs, and visual data representations', category: 'Data', icon: 'PieChart' },
  { id: 'etl-pipeline', name: 'ETL Pipeline', description: 'Extract, transform, and load data pipelines', category: 'Data', icon: 'Workflow' },

  // Research (2)
  { id: 'web-research', name: 'Web Research', description: 'Conduct web research and compile findings', category: 'Research', icon: 'BookOpen' },
  { id: 'paper-analysis', name: 'Paper Analysis', description: 'Analyze academic papers and research documents', category: 'Research', icon: 'GraduationCap' },

  // Automation (2)
  { id: 'workflow-builder', name: 'Workflow Builder', description: 'Build and automate multi-step workflows', category: 'Automation', icon: 'Cog' },
  { id: 'scheduler', name: 'Scheduler', description: 'Schedule and manage recurring tasks', category: 'Automation', icon: 'Clock' },
] as const;

// ---------------------------------------------------------------------------
// Helper: get all models as a flat array
// ---------------------------------------------------------------------------

export function getAllModels() {
  return PROVIDERS.flatMap((p) => p.models.map((m) => ({ ...m, providerId: p.id, providerName: p.name, providerColor: p.color })));
}

// ---------------------------------------------------------------------------
// Helper: get models by category
// ---------------------------------------------------------------------------

export function getModelsByCategory(category: string) {
  return getAllModels().filter((m) => m.category === category);
}

// ---------------------------------------------------------------------------
// Helper: get provider by id
// ---------------------------------------------------------------------------

export function getProviderById(id: string) {
  return PROVIDERS.find((p) => p.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Helper: count total models
// ---------------------------------------------------------------------------

export function getTotalModelCount() {
  return PROVIDERS.reduce((sum, p) => sum + p.models.length, 0);
}
