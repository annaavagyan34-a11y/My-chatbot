import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow large image uploads (base64)
app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const EDU_AI_SYSTEM_INSTRUCTION = `Դու EduAI-ն ես՝ դպրոցականների համակողմանի, խելացի, բանիմաց և բարյացակամ AI ուսուցիչը (Կարգախոսը՝ «Քո խելացի ուսումնական օգնականը»)։

ՔՈ ԿԱՐԵՎՈՐԱԳՈՒՅՆ ԿԱՆՈՆՆԵՐԸ ԵՎ ՈՒՍՈՒՑՉԱԿԱՆ ՈՃԸ.
1. ԲՈԼՈՐ ԿՐԹԱԿԱՆ ԱՌԱՐԿԱՆԵՐԸ. Դու չունես ոչ մի սահմանափակում մեկ առարկայով։ Պատասխանում ես ՑԱՆԿԱՑԱԾ դպրոցական և կրթական հարցի՝
   - Մաթեմատիկա, Հանրահաշիվ, Երկրաչափություն
   - Հայոց պատմություն և Համաշխարհային պատմություն
   - Ֆիզիկա, Աստղագիտություն
   - Քիմիա
   - Կենսաբանություն, Բնագիտություն
   - Հայոց լեզու, Քերականություն, Գրականություն
   - Աշխարհագրություն
   - Ինֆորմատիկա և Ծրագրավորում
   - Օտար լեզուներ (Անգլերեն, Ռուսերեն, Ֆրանսերեն, Գերմաներեն)
   - Տրամաբանական հարցեր, վարժություններ և առաջադրանքներ։

2. ՊԱՏԱՍԽԱՆԻ ԼԵԶՈՒՆ. Բոլոր պատասխանները տուր բացառապես մաքուր, գեղեցիկ և գրագետ ՀԱՅԵՐԵՆՈՎ (արևելահայերեն)։

3. ԴՊՐՈՑԱԿԱՆԻՆ ՀԱՍԿԱՆԱԼԻ ԼԵԶՈՒ. Բացատրիր թեմաները պարզ, մատչելի, հետաքրքրաշարժ և ոգեշնչող լեզվով՝ ինչպես լավագույն, համբերատար ուսուցիչը։ Խուսափիր անտեղի չոր կամ անհասկանալի գիտական բառակույտերից։

4. ԽՆԴԻՐՆԵՐԻ ԼՈՒԾՈՒՄԸ՝ ՔԱՅԼ ԱՌ ՔԱՅԼ. Եթե հարցը խնդիր կամ վարժություն է (մաթեմատիկա, ֆիզիկա, քիմիա և այլն), լուծիր այն քայլ առ քայլ.
   - 📌 Ինչ է տրված և ինչ պետք է գտնել
   - 💡 Ինչ բանաձև կամ օրենք է պետք կիրառել
   - 🔢 Քայլ առ քայլ հաշվարկը և տրամաբանությունը
   - ✅ Վերջնական ստուգված պատասխանը
   - 🎯 Փոքրիկ խորհուրդ կամ ամրապնդող հարց աշակերտին։

5. ՊԱՏՄԱԿԱՆ ՀԱՐՑԵՐԻ ԴԵՊՔՈՒՄ. Եթե հարցը պատմական է, պարտադիր ներկայացրու հստակ փաստերը, գործիչներին, տարեթվերը, դեպքերի պատճառներն ու հետևանքները, ինչպես նաև պատմական նշանակությունը։

6. ԳԻՏԱԿԱՆ ՀԱՐՑԵՐԻ ԴԵՊՔՈՒՄ. Եթե հարցը բնագիտական/գիտական է (ֆիզիկա, քիմիա, կենսաբանություն), բացատրիր իրական կյանքի պարզ ու հետաքրքիր օրինակներով։

7. ՖՈՐՄԱՏԱՎՈՐՈՒՄ. Օգտագործիր Markdown ձևաչափ (հստակ վերնագրեր, կարևոր բառերի շեշտադրում **bold**-ով, բանաձևերը \`կոդի\` մեջ, ցանկեր)։

8. ԿՑՎԱԾ ՆԿԱՐՆԵՐԻ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ. Եթե աշակերտը կցել է նկար (խնդրագրքի էջ, տետրի լուսանկար, գծագիր, երկրաչափական պատկեր, ֆիզիկայի սխեմա կամ քիմիական բանաձև), ուշադիր ուսումնասիրիր նկարի տեքստը, թվերը, գծագրերը և տուր քայլ առ քայլ լուծում կամ մանրամասն բացատրություն։`;

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

// Helper to convert frontend messages to Gemini format (including images)
function formatGeminiContents(messages: any[]) {
  return messages.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    // Check if message has an attached image (base64 Data URL)
    if (m.image && typeof m.image === 'string' && m.image.startsWith('data:')) {
      const match = m.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    if (m.content && m.content.trim()) {
      parts.push({ text: m.content });
    } else if (parts.length > 0) {
      parts.push({ text: 'Խնդրում եմ ուշադիր նայիր այս նկարը և մանրամասն բացատրիր կամ լուծիր այն քայլ առ քայլ:' });
    }

    return { role, parts };
  });
}

// Helper to execute stream with candidate models
async function getGenerateContentStream(contents: any[], systemInstruction: string) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const stream = await ai.models.generateContentStream({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });
      return { stream, model };
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err?.status || err?.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  throw lastError;
}

// Health check / info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'EduAI API',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Streaming Chat Endpoint using Server-Sent Events (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages, subject } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Հաղորդագրությունների ցանկը դատարկ է:' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let customSubjectInstruction = EDU_AI_SYSTEM_INSTRUCTION;
    if (subject && subject !== 'all') {
      customSubjectInstruction += `\nԼրացուցիչ նշում. Օգտատերը որպես ընթացիկ առարկայական շեշտադրում նշել է «${subject}»-ը։ Պատասխանիր համապատասխան ոլորտի դպրոցական ծրագրի սկզբունքներով։ Սակայն միշտ պատասխանիր օգտատիրոջ կոնկրետ հարցին և նկարին։`;
    }

    const formattedContents = formatGeminiContents(messages);

    const { stream } = await getGenerateContentStream(formattedContents, customSubjectInstruction);

    for await (const chunk of stream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    const errorMsg = 'Խնդիր առաջացավ AI պատասխանը ստանալիս: Խնդրում ենք կրկին փորձել:';
    res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Non-streaming chat endpoint fallback
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, subject } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Հաղորդագրությունների ցանկը դատարկ է:' });
    return;
  }

  try {
    let customSubjectInstruction = EDU_AI_SYSTEM_INSTRUCTION;
    if (subject && subject !== 'all') {
      customSubjectInstruction += `\nԼրացուցիչ նշում. Օգտատերը որպես ընթացիկ առարկայական շեշտադրում նշել է «${subject}»-ը։`;
    }

    const formattedContents = formatGeminiContents(messages);

    let lastError: any = null;
    let resultText = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: formattedContents,
          config: { systemInstruction: customSubjectInstruction },
        });
        if (response.text) {
          resultText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!resultText && lastError) {
      throw lastError;
    }

    res.json({ text: resultText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error?.message || 'Չհաջողվեց կապ հաստատել EduAI սերվերի հետ։',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`EduAI Server running at http://localhost:${PORT}`);
  });
}

startServer();
