import { NextResponse } from 'next/server';

/**
 * Serverless CORS Proxy for AI Providers
 * 
 * Handles forwarding requests to provider APIs with proper CORS headers.
 * Never logs or persists API keys - they are passed via x-provider-key header.
 */

export async function POST(request, { params }) {
  // Safe params handling for Next.js App Router
  const { provider } = await Promise.resolve(params);
  
  // Extract provider key from header (never log this)
  const providerKey = request.headers.get('x-provider-key');
  
  if (!providerKey) {
    return NextResponse.json(
      { error: 'Missing x-provider-key header' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    let response;
    
    switch (provider) {
      case 'nvidia':
        response = await handleNvidiaRequest(providerKey, body);
        break;
      case 'kie':
        response = await handleKieRequest(providerKey, body);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`[Proxy/${provider}] Error:`, error.message);
    return NextResponse.json(
      { error: error.message || 'Proxy request failed' },
      { status: 500 }
    );
  }
}

/**
 * NVIDIA NIM Handler
 * 
 * Supports image generation models (FLUX, SD3) and chat completions.
 * Converts base64 responses to data URIs for immediate client consumption.
 */
async function handleNvidiaRequest(apiKey, body) {
  const { model, ...payload } = body;
  
  if (!model) {
    throw new Error('Model parameter is required');
  }
  
  const url = `https://ai.api.nvidia.com/v1/genai/${model}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Error: ${response.status} - ${errorText.slice(0, 500)}`);
  }
  
  const data = await response.json();
  
  // Handle image generation responses (base64 → data URI)
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const base64Image = data.images[0];
    // NVIDIA returns base64 without prefix
    const dataUri = `data:image/png;base64,${base64Image}`;
    return {
      status: 'completed',
      url: dataUri,
      raw: data,
    };
  }
  
  // Handle chat completions
  if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    const content = data.choices[0].message?.content || '';
    return {
      status: 'completed',
      content,
      raw: data,
    };
  }
  
  // Fallback for other response formats
  return {
    status: 'completed',
    url: data.url || data.output_url || data.result_url || null,
    raw: data,
  };
}

/**
 * Kie.ai Handler
 * 
 * Forwards requests to Kie.ai endpoints.
 * Returns normalized response with status (pending/completed) and taskId for polling.
 */
async function handleKieRequest(apiKey, body) {
  const { action = 'createTask', taskId, ...payload } = body;
  const BASE_URL = 'https://api.kie.ai';
  
  let url, method, requestBody;
  
  switch (action) {
    case 'createTask':
      url = `${BASE_URL}/api/v1/jobs/createTask`;
      method = 'POST';
      requestBody = payload;
      break;
    case 'pollStatus':
      if (!taskId) {
        throw new Error('taskId required for pollStatus action');
      }
      url = `${BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`;
      method = 'GET';
      requestBody = null;
      break;
    case 'veoGenerate':
      url = `${BASE_URL}/api/v1/veo/generate`;
      method = 'POST';
      requestBody = payload;
      break;
    case 'veoPoll':
      if (!taskId) {
        throw new Error('taskId required for veoPoll action');
      }
      url = `${BASE_URL}/api/v1/veo/record-info?taskId=${encodeURIComponent(taskId)}`;
      method = 'GET';
      requestBody = null;
      break;
    default:
      throw new Error(`Unknown Kie action: ${action}`);
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  
  const fetchOptions = {
    method,
    headers,
  };
  
  if (requestBody) {
    fetchOptions.body = JSON.stringify(requestBody);
  }
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kie API Error: ${response.status} - ${errorText.slice(0, 500)}`);
  }
  
  const data = await response.json();
  
  // Normalize Kie responses
  if (action === 'createTask' || action === 'veoGenerate') {
    const taskId = data.data?.taskId;
    if (taskId) {
      return {
        status: 'pending',
        taskId,
        raw: data,
      };
    }
    return {
      status: 'completed',
      url: extractKieResultUrl(data),
      raw: data,
    };
  }
  
  if (action === 'pollStatus' || action === 'veoPoll') {
    const state = (data.data?.state || '').toLowerCase();
    const successFlag = data.data?.successFlag;
    
    // VEO polling uses successFlag
    if (successFlag !== undefined) {
      if (successFlag === 1) {
        const videoUrl = data.data?.response?.resultUrls?.[0] || null;
        return {
          status: 'completed',
          url: videoUrl,
          raw: data,
        };
      }
      if (successFlag === 2 || successFlag === 3) {
        throw new Error(`Generation failed: ${data.data?.errorMessage || 'Unknown error'}`);
      }
      return { status: 'pending', raw: data };
    }
    
    // Standard Kie polling uses state
    if (state === 'success') {
      return {
        status: 'completed',
        url: extractKieResultUrl(data),
        raw: data,
      };
    }
    if (state === 'fail' || state === 'error') {
      throw new Error(`Generation failed: ${data.data?.failMsg || 'Unknown error'}`);
    }
    return { status: 'pending', raw: data };
  }
  
  return { status: 'completed', raw: data };
}

function extractKieResultUrl(data) {
  const d = data.data || data;
  if (Array.isArray(d.resultUrls) && d.resultUrls.length) return d.resultUrls[0];
  if (d.response?.resultUrls?.length) return d.response.resultUrls[0];
  return d.url || null;
}