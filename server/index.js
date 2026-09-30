import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { analyzeAgreementServer } from './parser.js';
import { SAMPLE_AGREEMENTS } from '../src/data/sampleAgreements.js';

// Conditional dynamic imports for pdf and word
let pdfParse = null;
let mammoth = null;

try {
  pdfParse = (await import('pdf-parse')).default;
} catch (e) {
  console.warn("pdf-parse fallback active");
}

try {
  mammoth = (await import('mammoth')).default;
} catch (e) {
  console.warn("mammoth fallback active");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Persistent database file setup
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadHistoryFromFile() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Could not read history file:", err.message);
  }
  return [];
}

function saveHistoryToFile(historyList) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyList, null, 2), 'utf-8');
  } catch (err) {
    console.warn("Could not save history file:", err.message);
  }
}

// In-memory + persistent cache
let analysisHistory = loadHistoryFromFile();

// Seed initial history if empty
if (analysisHistory.length === 0) {
  const seedSample = SAMPLE_AGREEMENTS[0];
  const initialAudit = analyzeAgreementServer(seedSample.content);
  analysisHistory.push({
    id: `audit-${Date.now()}-seed`,
    title: seedSample.name,
    timestamp: new Date().toISOString(),
    clausesCount: initialAudit.clauses.length,
    fairnessScore: initialAudit.healthScore.score,
    status: initialAudit.healthScore.status,
    highRisks: initialAudit.healthScore.highCount,
    fullData: initialAudit
  });
  saveHistoryToFile(analysisHistory);
}

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

/**
 * 1. Health & Server Metrics
 */
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "ok",
    version: "2.5.0",
    service: "Tenant Agreement Explainer Backend API",
    engine: "Express Neural-Rule Engine v2.5",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      pdfExtraction: !!pdfParse,
      wordExtraction: !!mammoth,
      aiLiveIntegration: true,
      persistentDatabase: true
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10,
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024)
    }
  });
});

/**
 * 2. Get Pre-Configured Sample Agreements
 */
app.get('/api/samples', (req, res) => {
  res.json({
    success: true,
    samples: SAMPLE_AGREEMENTS
  });
});

/**
 * 3. File Upload & Text Extraction
 */
app.post('/api/upload', upload.single('agreementFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please attach a .pdf, .docx, or .txt file." });
    }

    const { originalname, buffer, mimetype } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let extractedText = "";

    if (ext === 'txt' || mimetype === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    } else if (ext === 'pdf' || mimetype === 'application/pdf') {
      if (pdfParse) {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text;
      } else {
        return res.status(500).json({ error: "PDF parser is initializing. Please try again or use text paste." });
      }
    } else if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (mammoth) {
        const parsed = await mammoth.extractRawText({ buffer });
        extractedText = parsed.value;
      } else {
        return res.status(500).json({ error: "DOCX parser is initializing. Please try again or use text paste." });
      }
    } else {
      return res.status(400).json({ error: "Unsupported file format. Please upload .pdf, .docx, or .txt." });
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ error: "Could not extract sufficient text from the uploaded document." });
    }

    const words = extractedText.trim().split(/\s+/).length;
    const lines = extractedText.trim().split('\n').length;

    res.json({
      success: true,
      fileName: originalname,
      wordCount: words,
      lineCount: lines,
      text: extractedText
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Failed to process document upload." });
  }
});

/**
 * 4. Main Contract Analysis
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, options, title } = req.body;

    if (!text || text.trim().length < 30) {
      return res.status(400).json({ error: "Agreement text is too short. Please provide at least 30 characters." });
    }

    // Server-side parsing & risk classification
    const analysis = analyzeAgreementServer(text, options);

    // Save full audit to persistent history
    const auditRecord = {
      id: `audit-${Date.now()}`,
      title: title || (text.slice(0, 45).split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim() || "Rental Agreement"),
      timestamp: analysis.analyzedAt,
      clausesCount: analysis.clauses.length,
      fairnessScore: analysis.healthScore.score,
      status: analysis.healthScore.status,
      highRisks: analysis.healthScore.highCount,
      fullData: analysis
    };

    analysisHistory.unshift(auditRecord);

    if (analysisHistory.length > 25) {
      analysisHistory.pop();
    }

    saveHistoryToFile(analysisHistory);

    res.json({
      success: true,
      data: analysis,
      recordId: auditRecord.id
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze agreement." });
  }
});

/**
 * 5. Persistent Audit History Endpoints
 */
app.get('/api/history', (req, res) => {
  // Return summary list for fast drawer rendering
  const summaries = analysisHistory.map(h => ({
    id: h.id,
    title: h.title,
    timestamp: h.timestamp,
    clausesCount: h.clausesCount,
    fairnessScore: h.fairnessScore,
    status: h.status,
    highRisks: h.highRisks
  }));

  res.json({
    success: true,
    history: summaries,
    totalRecords: analysisHistory.length
  });
});

app.get('/api/history/:id', (req, res) => {
  const item = analysisHistory.find(h => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Audit record not found." });
  }
  res.json({
    success: true,
    data: item.fullData
  });
});

app.delete('/api/history/:id', (req, res) => {
  const initialLen = analysisHistory.length;
  analysisHistory = analysisHistory.filter(h => h.id !== req.params.id);
  saveHistoryToFile(analysisHistory);

  res.json({
    success: true,
    deleted: initialLen !== analysisHistory.length,
    remaining: analysisHistory.length
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Tenant Agreement Explainer API Server running at http://127.0.0.1:${PORT}`);
  console.log(`   Health check endpoint: http://127.0.0.1:${PORT}/api/health`);
  console.log(`   Persistent history stored in: ${HISTORY_FILE}`);
});
