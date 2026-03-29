// ============================================================================
// VoiceDev 2.0 - AI Chat API Route
// Streaming proxy to multiple AI providers
// ============================================================================

import { NextRequest } from 'next/server';
import { getProviderById } from '@/lib/providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model: string;
  provider: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// ---------------------------------------------------------------------------
// Provider classification
// ---------------------------------------------------------------------------

const OPENAI_COMPATIBLE = [
  'openai', 'groq', 'together', 'openrouter', 'fireworks',
  'siliconflow', 'mistral', 'deepseek', 'perplexity', 'xai',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTimeoutController(ms = 60_000): AbortController {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl;
}

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Anthropic request builder
// ---------------------------------------------------------------------------

function buildAnthropicRequest(body: ChatRequestBody, providerUrl: string) {
  const { messages, model, apiKey, temperature, maxTokens, stream } = body;

  // Extract system messages
  const systemParts: string[] = [];
  const chatMessages: ChatMessage[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemParts.push(msg.content);
    } else {
      chatMessages.push(msg);
    }
  }

  const headers: Record<string, string> = {
    'x-api-key': apiKey || '',
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  };

  const payload: Record<string, unknown> = {
    model,
    messages: chatMessages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: maxTokens || 4096,
    stream: stream ?? true,
  };

  if (systemParts.length > 0) {
    payload.system = systemParts.join('\n\n');
  }
  if (temperature !== undefined) {
    payload.temperature = temperature;
  }

  return {
    url: `${providerUrl}/messages`,
    headers,
    body: payload,
  };
}

// ---------------------------------------------------------------------------
// Gemini / Google request builder
// ---------------------------------------------------------------------------

function buildGeminiRequest(body: ChatRequestBody, providerUrl: string, apiKey: string) {
  const { messages, model, temperature, maxTokens } = body;

  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages
    .filter(m => m.role === 'system')
    .map(m => m.content)
    .join('\n\n');

  const generationConfig: Record<string, unknown> = {};
  if (temperature !== undefined) generationConfig.temperature = temperature;
  if (maxTokens !== undefined) generationConfig.maxOutputTokens = maxTokens;

  const payload: Record<string, unknown> = { contents, generationConfig };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  return {
    url: `${providerUrl}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  };
}

// ---------------------------------------------------------------------------
// Cohere request builder
// ---------------------------------------------------------------------------

function buildCohereRequest(body: ChatRequestBody, providerUrl: string) {
  const { messages, model, apiKey, temperature, maxTokens, stream } = body;

  // Last message is the current user query
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // Everything before the last user message is chat_history
  const lastUserIdx = messages.map(m => m.role).lastIndexOf('user');
  const priorMessages = messages.slice(0, lastUserIdx);

  const chatHistory = priorMessages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'CHATBOT' as const : m.role === 'user' ? 'USER' as const : 'USER' as const,
      message: m.content,
    }));

  // Extract system messages as preamble
  const preamble = messages
    .filter(m => m.role === 'system')
    .map(m => m.content)
    .join('\n\n');

  const payload: Record<string, unknown> = {
    model,
    message: lastUserMessage,
    chat_history: chatHistory,
    stream: stream ?? true,
  };

  if (preamble) payload.preamble = preamble;
  if (temperature !== undefined) payload.temperature = temperature;
  if (maxTokens !== undefined) payload.max_tokens = maxTokens;

  return {
    url: `${providerUrl}/chat`,
    headers: {
      'Authorization': `Bearer ${apiKey || ''}`,
      'Content-Type': 'application/json',
    },
    body: payload,
  };
}

// ---------------------------------------------------------------------------
// OpenAI-compatible request builder (default)
// ---------------------------------------------------------------------------

function buildOpenAICompatibleRequest(body: ChatRequestBody, providerUrl: string, apiKey: string, providerId: string) {
  const { messages, model, temperature, maxTokens, stream } = body;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Special auth header handling per provider
  if (providerId === 'elevenlabs') {
    headers['xi-api-key'] = apiKey;
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const payload: Record<string, unknown> = {
    model,
    messages,
    stream: stream ?? true,
  };

  if (temperature !== undefined) payload.temperature = temperature;
  if (maxTokens !== undefined) payload.max_tokens = maxTokens;

  return {
    url: `${providerUrl}/chat/completions`,
    headers,
    body: payload,
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();

    const { provider: providerId, model, apiKey } = body;

    // Validate required fields
    if (!providerId) return errorResponse('Missing required field: provider', 400);
    if (!model) return errorResponse('Missing required field: model', 400);
    if (!body.messages || !Array.isArray(body.messages)) {
      return errorResponse('Missing required field: messages', 400);
    }

    // Look up provider config
    const provider = getProviderById(providerId);
    if (!provider) {
      return errorResponse(`Unknown provider: ${providerId}`, 400);
    }

    const key = apiKey || '';
    if (!key) {
      return errorResponse(`API key is required for ${provider.name}`, 401);
    }

    const providerUrl = provider.baseUrl;
    const doStream = body.stream ?? true;

    // ---- Route to the correct provider format ----

    if (providerId === 'anthropic') {
      return handleAnthropic(body, providerUrl, doStream);
    }

    if (providerId === 'google') {
      return handleGemini(body, providerUrl, key, doStream);
    }

    if (providerId === 'cohere') {
      return handleCohere(body, providerUrl, doStream);
    }

    // Default: OpenAI-compatible (covers openai, groq, together, openrouter,
    // fireworks, siliconflow, mistral, deepseek, perplexity, xai,
    // zai, moonshot, minimax, ai21, elevenlabs, qwen, replicate)
    return handleOpenAICompatible(body, providerUrl, key, providerId, doStream);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(message, 500);
  }
}

// ---------------------------------------------------------------------------
// Anthropic handler
// ---------------------------------------------------------------------------

async function handleAnthropic(
  body: ChatRequestBody,
  providerUrl: string,
  stream: boolean,
) {
  const { url, headers, body: payload } = buildAnthropicRequest(body, providerUrl);
  const controller = makeTimeoutController();

  if (stream) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return errorResponse(`Anthropic error (${response.status}): ${errText}`, response.status);
    }

    // Transform Anthropic SSE → OpenAI-compatible SSE format
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(ctrl) {
        const reader = response.body!.getReader();
        let buffer = '';
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const event = JSON.parse(data);
                if (event.type === 'content_block_delta' && event.delta?.text) {
                  fullContent += event.delta.text;
                  const sseChunk = `data: ${JSON.stringify({
                    id: 'anthropic-msg',
                    object: 'chat.completion.chunk',
                    choices: [{ index: 0, delta: { content: event.delta.text }, finish_reason: null }],
                    model: body.model,
                    provider: 'anthropic',
                  })}\n\n`;
                  ctrl.enqueue(encoder.encode(sseChunk));
                }
                if (event.type === 'message_stop') {
                  ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        } catch (err) {
          // Connection closed or aborted — don't error
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Non-streaming
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, stream: false }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return errorResponse(`Anthropic error (${response.status}): ${errText}`, response.status);
  }

  const data = await response.json();
  const content = data.content?.map((c: { text?: string }) => c.text || '').join('') || '';
  const usage = data.usage || {};

  return new Response(JSON.stringify({
    content,
    usage: {
      prompt_tokens: usage.input_tokens || 0,
      completion_tokens: usage.output_tokens || 0,
      total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
    },
    model: body.model,
    provider: 'anthropic',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Gemini / Google handler
// ---------------------------------------------------------------------------

async function handleGemini(
  body: ChatRequestBody,
  providerUrl: string,
  apiKey: string,
  stream: boolean,
) {
  const controller = makeTimeoutController();

  if (stream) {
    const { url, headers, body: payload } = buildGeminiRequest(body, providerUrl, apiKey);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return errorResponse(`Google error (${response.status}): ${errText}`, response.status);
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(ctrl) {
        const reader = response.body!.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const event = JSON.parse(data);
                const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const sseChunk = `data: ${JSON.stringify({
                    id: 'gemini-msg',
                    object: 'chat.completion.chunk',
                    choices: [{ index: 0, delta: { content: text }, finish_reason: null }],
                    model: body.model,
                    provider: 'google',
                  })}\n\n`;
                  ctrl.enqueue(encoder.encode(sseChunk));
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        } catch {
          // Connection closed
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Non-streaming
  const nonStreamUrl = `${providerUrl}/models/${body.model}:generateContent?key=${apiKey}`;
  const { body: payload } = buildGeminiRequest(body, providerUrl, apiKey);

  const response = await fetch(nonStreamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return errorResponse(`Google error (${response.status}): ${errText}`, response.status);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const meta = data.usageMetadata || {};

  return new Response(JSON.stringify({
    content,
    usage: {
      prompt_tokens: meta.promptTokenCount || 0,
      completion_tokens: meta.candidatesTokenCount || 0,
      total_tokens: meta.totalTokenCount || 0,
    },
    model: body.model,
    provider: 'google',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Cohere handler
// ---------------------------------------------------------------------------

async function handleCohere(
  body: ChatRequestBody,
  providerUrl: string,
  stream: boolean,
) {
  const { url, headers, body: payload } = buildCohereRequest(body, providerUrl);
  const controller = makeTimeoutController();

  if (stream) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return errorResponse(`Cohere error (${response.status}): ${errText}`, response.status);
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(ctrl) {
        const reader = response.body!.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();

              try {
                const event = JSON.parse(data);
                if (event.event_type === 'text-generation' && event.text) {
                  const sseChunk = `data: ${JSON.stringify({
                    id: 'cohere-msg',
                    object: 'chat.completion.chunk',
                    choices: [{ index: 0, delta: { content: event.text }, finish_reason: null }],
                    model: body.model,
                    provider: 'cohere',
                  })}\n\n`;
                  ctrl.enqueue(encoder.encode(sseChunk));
                }
                if (event.event_type === 'stream-end') {
                  ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        } catch {
          // Connection closed
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Non-streaming
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, stream: false }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return errorResponse(`Cohere error (${response.status}): ${errText}`, response.status);
  }

  const data = await response.json();
  const content = data.text || '';
  const meta = data.meta || {};
  const tokens = meta.billed_units || {};

  return new Response(JSON.stringify({
    content,
    usage: {
      prompt_tokens: tokens.input_tokens || 0,
      completion_tokens: tokens.output_tokens || 0,
      total_tokens: (tokens.input_tokens || 0) + (tokens.output_tokens || 0),
    },
    model: body.model,
    provider: 'cohere',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// OpenAI-compatible handler (default)
// ---------------------------------------------------------------------------

async function handleOpenAICompatible(
  body: ChatRequestBody,
  providerUrl: string,
  apiKey: string,
  providerId: string,
  stream: boolean,
) {
  const { url, headers, body: payload } = buildOpenAICompatibleRequest(body, providerUrl, apiKey, providerId);
  const controller = makeTimeoutController();

  if (stream) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return errorResponse(`${providerId} error (${response.status}): ${errText}`, response.status);
    }

    // Direct stream passthrough — most OpenAI-compatible providers emit the
    // same SSE format, so we just forward bytes.
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(ctrl) {
        const reader = response.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            ctrl.enqueue(value);
          }
        } catch {
          // Connection closed or aborted
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Non-streaming
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, stream: false }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    return errorResponse(`${providerId} error (${response.status}): ${errText}`, response.status);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const usage = data.usage || {};

  return new Response(JSON.stringify({
    content,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    },
    model: data.model || body.model,
    provider: providerId,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
