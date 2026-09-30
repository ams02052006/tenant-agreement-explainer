/**
 * Frontend Service to interact with the Express Backend API
 * Automatically falls back to client-side engine if backend is unreachable
 */
import { parseAgreement } from '../utils/agreementParser';

export async function checkBackendHealth() {
  try {
    const startTime = performance.now();
    const res = await fetch('/api/health');
    const latency = Math.round(performance.now() - startTime);
    if (!res.ok) throw new Error("Backend not responding");
    const data = await res.json();
    return { ...data, latencyMs: latency };
  } catch (err) {
    return { status: "offline", error: err.message, latencyMs: null };
  }
}

export async function analyzeAgreementAPI(text, options = {}, title = "") {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, options, title })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return {
          ...data.data,
          recordId: data.recordId,
          source: "backend-express"
        };
      }
    }
    throw new Error("Backend response error, using client fallback");
  } catch (err) {
    console.warn("Backend unavailable or error, using client-side fallback:", err.message);
    const clientResult = parseAgreement(text);
    return {
      ...clientResult,
      source: "client-local"
    };
  }
}

export async function uploadAgreementFileAPI(file) {
  try {
    const formData = new FormData();
    formData.append('agreementFile', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "File upload failed on server");
    }

    return await res.json();
  } catch (err) {
    console.warn("Server file upload failed, fallback to client reader:", err);
    throw err;
  }
}

export async function fetchHistoryAPI() {
  try {
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error("Could not load history");
    const data = await res.json();
    return data.history || [];
  } catch (err) {
    console.warn("History API offline:", err.message);
    return [];
  }
}

export async function fetchAuditByIdAPI(id) {
  try {
    const res = await fetch(`/api/history/${id}`);
    if (!res.ok) throw new Error("Could not fetch audit details");
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("Fetch audit error:", err);
    throw err;
  }
}

export async function deleteAuditAPI(id) {
  try {
    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Could not delete audit");
    return await res.json();
  } catch (err) {
    console.warn("Delete audit error:", err);
    throw err;
  }
}
