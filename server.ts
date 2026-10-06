import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { analyzeEngineeringHeuristics } from './src/utils/engineeringRuleEngine.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Requirement Analysis endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { rawText, category, manualForm, files } = req.body;

    const trimmedRawText = (rawText || '').trim();
    const hasManualData =
      manualForm &&
      Object.values(manualForm).some((v) => typeof v === 'string' && v.trim().length > 0);
    const hasFiles = Array.isArray(files) && files.length > 0;

    if (!trimmedRawText && !hasManualData && !hasFiles) {
      res.status(400).json({
        error: 'Please provide client requirements via message, manual form, or uploaded files.',
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'Server Gemini API key is missing. Please configure GEMINI_API_KEY.',
      });
      return;
    }

    // Build parts for multimodal prompt
    const parts: any[] = [];

    // Document text extraction or inline file attachment
    let extractedDocumentTexts = '';
    if (hasFiles) {
      for (const file of files) {
        if (!file.base64) continue;
        const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');

        // If image or audio, pass directly as inlineData to Gemini
        if (
          file.type.startsWith('image/') ||
          file.type.startsWith('audio/') ||
          file.type === 'application/pdf'
        ) {
          parts.push({
            inlineData: {
              mimeType: file.type,
              data: cleanBase64,
            },
          });
        } else {
          // Attempt plain text extraction for text-based files
          try {
            const decoded = Buffer.from(cleanBase64, 'base64').toString('utf-8');
            // Check if looks like valid text
            if (/^[\x20-\x7E\s\r\n\t.,;:()\-_{}\[\]]*$/.test(decoded.slice(0, 500))) {
              extractedDocumentTexts += `\n\n--- Document Content from ${file.name} ---\n${decoded.slice(0, 15000)}\n`;
            }
          } catch {
            // ignore binary decode errors
          }
        }
      }
    }

    let manualFormSummary = '';
    if (hasManualData) {
      manualFormSummary = '\n\nCLIENT MANUAL FORM DATA PROVIDED:\n' + JSON.stringify(manualForm, null, 2);
    }

    const promptText = `
ANALYSE THE FOLLOWING CLIENT ENGINEERING REQUIREMENT:

ENGINEERING CATEGORY SELECTED: ${category || 'Auto Detect'}

CLIENT MESSAGE / REQUIREMENT:
"""
${trimmedRawText || 'No direct text pasted. Please examine uploaded documents, images, audio, or manual form fields.'}
"""
${manualFormSummary}
${extractedDocumentTexts ? `\nEXTRACTED FILE ATTACHMENTS:\n${extractedDocumentTexts}` : ''}

INSTRUCTIONS:
1. Carefully analyse all provided inputs.
2. Under "confirmedRequirements", include ONLY facts explicitly stated by the client. Segregate into electrical, electronics, mechanical, softwareControl, installation, commercial, timeline.
3. Under "missingInformation", identify critical engineering parameters needed for technical quotation and sizing, with priority (HIGH, MEDIUM, LOW) and why it matters.
4. Under "clientQuestions", formulate polite, clear, practical questions that can be sent to the client. Non-technical where possible.
5. Under "scopeOfWork", list tasks separated into Design, Engineering, Procurement, Fabrication, Programming, Installation, Testing, Commissioning, Documentation. Mark each strictly as "CONFIRMED" or "OPTIONAL / NEEDS CONFIRMATION".
6. Under "preliminaryBOQ", list preliminary bill of materials. DO NOT invent ratings. Use "TBD" when specifications are unconfirmed.
7. Under "risks", identify engineering risks (e.g. unknown motor starting current, unknown IP rating, voltage drop, thermal dissipation, duty cycle). Classify as LOW, MEDIUM, or HIGH with recommended mitigation.
8. Under "conflicts", identify any contradictions or mismatch (e.g. inverter sizing vs motor rating, single phase supply with 3-phase machinery). If none, return an empty array.
9. Under "assumptions", list all working assumptions and what happens if the assumption is wrong.
10. Under "feasibility", assign one of: "Potentially feasible", "Needs further information", "Potential technical concern", along with engineering summary and notes.
11. Under "completeness", calculate realistic percentages (0-100) and rating label ("Very incomplete", "Incomplete", "Partially complete", "Mostly complete", "Ready for detailed quotation").
12. Under "recommendedNextAction", give the single most critical immediate step (e.g. "Request missing supply voltage and motor FLA before quotation").
`;

    parts.push({ text: promptText });

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let parsedResult = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: `You are a Senior Engineering Requirement Analyser assistant for electrical, electronics, mechanical, automation, and consulting engineers.
Your role is to rigorously parse unstructured client briefs into precision engineering requirement structures.

CRITICAL ENGINEERING SAFETY & ACCURACY RULES:
- The AI MUST NOT invent technical specifications that the client did not provide.
- Clearly distinguish between:
  1. Client-provided information
  2. AI inference
  3. Engineering assumption
  4. Missing information
- If information is missing, explicitly mark it as MISSING.
- If information is uncertain, mark it as NEEDS CONFIRMATION.
- Preliminary calculations or scopes are NEVER final engineering designs or safety certifications.
- Flag safety-critical issues for qualified engineer review.
- Do not provide unsafe instructions for live electrical work. Encourage isolation and verification.
- Return ONLY a valid JSON object matching the requested schema. No markdown formatting outside of JSON.`,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                projectSummary: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    industry: { type: Type.STRING },
                    clientObjective: { type: Type.STRING },
                    overallSummary: { type: Type.STRING },
                  },
                  required: ['title', 'category', 'industry', 'clientObjective', 'overallSummary'],
                },
                completeness: {
                  type: Type.OBJECT,
                  properties: {
                    overallPercentage: { type: Type.NUMBER },
                    ratingLabel: {
                      type: Type.STRING,
                      enum: [
                        'Very incomplete',
                        'Incomplete',
                        'Partially complete',
                        'Mostly complete',
                        'Ready for detailed quotation',
                      ],
                    },
                    categories: {
                      type: Type.OBJECT,
                      properties: {
                        technical: { type: Type.NUMBER },
                        electrical: { type: Type.NUMBER },
                        mechanical: { type: Type.NUMBER },
                        controlAutomation: { type: Type.NUMBER },
                        installation: { type: Type.NUMBER },
                        commercial: { type: Type.NUMBER },
                        timeline: { type: Type.NUMBER },
                      },
                      required: [
                        'technical',
                        'electrical',
                        'mechanical',
                        'controlAutomation',
                        'installation',
                        'commercial',
                        'timeline',
                      ],
                    },
                  },
                  required: ['overallPercentage', 'ratingLabel', 'categories'],
                },
                confirmedRequirements: {
                  type: Type.OBJECT,
                  properties: {
                    electrical: { type: Type.ARRAY, items: { type: Type.STRING } },
                    electronics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    mechanical: { type: Type.ARRAY, items: { type: Type.STRING } },
                    softwareControl: { type: Type.ARRAY, items: { type: Type.STRING } },
                    installation: { type: Type.ARRAY, items: { type: Type.STRING } },
                    commercial: { type: Type.ARRAY, items: { type: Type.STRING } },
                    timeline: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: [
                    'electrical',
                    'electronics',
                    'mechanical',
                    'softwareControl',
                    'installation',
                    'commercial',
                    'timeline',
                  ],
                },
                missingInformation: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      whyItMatters: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
                      category: { type: Type.STRING },
                    },
                    required: ['item', 'whyItMatters', 'priority'],
                  },
                },
                clientQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      category: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                    },
                    required: ['question'],
                  },
                },
                scopeOfWork: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: {
                        type: Type.STRING,
                        enum: [
                          'Design',
                          'Engineering',
                          'Procurement',
                          'Fabrication',
                          'Programming',
                          'Installation',
                          'Testing',
                          'Commissioning',
                          'Documentation',
                        ],
                      },
                      description: { type: Type.STRING },
                      status: {
                        type: Type.STRING,
                        enum: ['CONFIRMED', 'OPTIONAL / NEEDS CONFIRMATION'],
                      },
                    },
                    required: ['category', 'description', 'status'],
                  },
                },
                preliminaryBOQ: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING },
                      description: { type: Type.STRING },
                      specification: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      basis: { type: Type.STRING },
                      confidence: {
                        type: Type.STRING,
                        enum: ['High', 'Medium', 'Low', 'TBD'],
                      },
                    },
                    required: ['item', 'description', 'specification', 'quantity', 'basis', 'confidence'],
                  },
                },
                risks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      risk: { type: Type.STRING },
                      whyItMatters: { type: Type.STRING },
                      level: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                      mitigation: { type: Type.STRING },
                    },
                    required: ['risk', 'whyItMatters', 'level', 'mitigation'],
                  },
                },
                conflicts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      conflict: { type: Type.STRING },
                      whyProblem: { type: Type.STRING },
                      requiredResolution: { type: Type.STRING },
                    },
                    required: ['conflict', 'whyProblem', 'requiredResolution'],
                  },
                },
                assumptions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      assumption: { type: Type.STRING },
                      basis: { type: Type.STRING },
                      riskIfWrong: { type: Type.STRING },
                    },
                    required: ['assumption', 'basis', 'riskIfWrong'],
                  },
                },
                feasibility: {
                  type: Type.OBJECT,
                  properties: {
                    status: {
                      type: Type.STRING,
                      enum: [
                        'Potentially feasible',
                        'Needs further information',
                        'Potential technical concern',
                      ],
                    },
                    summary: { type: Type.STRING },
                    engineeringReviewNotes: { type: Type.STRING },
                  },
                  required: ['status', 'summary', 'engineeringReviewNotes'],
                },
                recommendedNextAction: { type: Type.STRING },
              },
              required: [
                'projectSummary',
                'completeness',
                'confirmedRequirements',
                'missingInformation',
                'clientQuestions',
                'scopeOfWork',
                'preliminaryBOQ',
                'risks',
                'conflicts',
                'assumptions',
                'feasibility',
                'recommendedNextAction',
              ],
            },
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout waiting for ${modelName}`)), 8000)
        );

        const response: any = await Promise.race([apiPromise, timeoutPromise]);

        const responseText = response.text || '';
        try {
          parsedResult = JSON.parse(responseText);
        } catch {
          const cleaned = responseText
            .replace(/^```json\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          parsedResult = JSON.parse(cleaned);
        }

        if (parsedResult) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} call failed, trying next option:`, err.message || err);
      }
    }

    if (!parsedResult) {
      console.log('AI models temporarily unavailable, falling back to engineering heuristics engine');
      parsedResult = analyzeEngineeringHeuristics(trimmedRawText, category, manualForm);
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error('Error during requirement analysis:', error);
    try {
      const fallbackResult = analyzeEngineeringHeuristics(
        (req.body.rawText || '').trim(),
        req.body.category,
        req.body.manualForm
      );
      res.json(fallbackResult);
    } catch {
      res.status(500).json({
        error: error.message || 'Analysis could not be completed.',
        details: error.toString(),
      });
    }
  }
});

// Start dev or production server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Engineering Requirement Analyser server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
