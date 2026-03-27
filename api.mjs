import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import multer from 'multer';
import { buildEquivalentsPromptContext, equivalents, FOOD_GROUPS } from './data/equivalents.js';
import { MEAL_PLAN, PIPELINE_ORDER, getNextMeal, DAILY_TOTALS, MEAL_LABELS } from './data/meal-plan.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static('.'));

// ─── Clients ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  { db: { schema: 'meditrack' } }
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer: keep files in memory for Whisper upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ─── Auth Middleware ───────────────────────────────────────────────────────────

const requireAuth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  res.json({ token: process.env.ADMIN_TOKEN });
});

// ─── Timezone helper ──────────────────────────────────────────────────────────

function todayMX() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());
}

// ─── Today's status & pipeline ────────────────────────────────────────────────

app.get('/api/today', requireAuth, async (req, res) => {
  try {
    const today = req.query.date || todayMX();

    const { data: logs, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('date', today)
      .order('logged_at', { ascending: true });

    if (error) throw error;

    const loggedMeals = [...new Set(logs.filter(l => l.meal_type !== 'colacion').map(l => l.meal_type))];
    const nextMeal    = getNextMeal(loggedMeals);

    // Consumed portions today (sum across all pipeline meals)
    const consumed = { leche: 0, carne: 0, fruta: 0, verdura: 0, cereales: 0, leguminosas: 0, grasas: 0 };
    for (const log of logs) {
      if (log.portions) {
        for (const [group, qty] of Object.entries(log.portions)) {
          if (consumed[group] !== undefined) consumed[group] += qty;
        }
      }
    }

    // Compliance per meal
    const mealSummary = PIPELINE_ORDER.map(meal => {
      const mealLogs = logs.filter(l => l.meal_type === meal);
      const logged   = mealLogs.length > 0;
      const portions = { leche: 0, carne: 0, fruta: 0, verdura: 0, cereales: 0, leguminosas: 0, grasas: 0 };
      for (const log of mealLogs) {
        if (log.portions) {
          for (const [g, q] of Object.entries(log.portions)) {
            if (portions[g] !== undefined) portions[g] += q;
          }
        }
      }
      return { meal, logged, portions, plan: MEAL_PLAN[meal] };
    });

    const colaciones = logs.filter(l => l.meal_type === 'colacion');

    res.json({ today, nextMeal, loggedMeals, mealSummary, consumed, dailyTotals: DAILY_TOTALS, colaciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Equivalents ──────────────────────────────────────────────────────────────

app.get('/api/equivalents', requireAuth, (req, res) => {
  res.json({ groups: FOOD_GROUPS, items: equivalents });
});

// ─── Meal Logs ────────────────────────────────────────────────────────────────

// GET all logs for a given date range
app.get('/api/logs', requireAuth, async (req, res) => {
  try {
    const { from, to, limit = 50 } = req.query;
    let query = supabase
      .from('meal_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(parseInt(limit));

    if (from) query = query.gte('date', from);
    if (to)   query = query.lte('date', to);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a confirmed meal log entry (after GPT analysis & user confirmation)
app.post('/api/logs', requireAuth, async (req, res) => {
  try {
    const { meal_type, portions, input_type, description, gpt_analysis, date } = req.body;

    if (!meal_type || !portions) {
      return res.status(400).json({ error: 'meal_type y portions son requeridos' });
    }

    // Pipeline enforcement: for desayuno/comida/cena, check sequence
    if (PIPELINE_ORDER.includes(meal_type)) {
      const today = date || todayMX();
      const { data: existing } = await supabase
        .from('meal_logs')
        .select('meal_type')
        .eq('date', today)
        .in('meal_type', PIPELINE_ORDER);

      const loggedTypes = [...new Set((existing || []).map(l => l.meal_type))];
      const expectedNext = getNextMeal(loggedTypes);

      if (expectedNext !== meal_type && expectedNext !== 'completed') {
        return res.status(422).json({
          error: `Debes registrar ${expectedNext} primero antes de registrar ${meal_type}.`,
          expectedNext,
        });
      }
    }

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        meal_type,
        portions,
        input_type: input_type || 'manual',
        description,
        gpt_analysis,
        date: date || todayMX(),
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a log entry
app.delete('/api/logs/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('meal_logs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH – update portions of a single log entry
app.patch('/api/logs/:id', requireAuth, async (req, res) => {
  try {
    const { portions } = req.body;
    if (!portions) return res.status(400).json({ error: 'portions requerido' });
    const { data, error } = await supabase
      .from('meal_logs')
      .update({ portions })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logs/correct – replace all logs for a meal+date with a single corrected entry
app.post('/api/logs/correct', requireAuth, async (req, res) => {
  try {
    const { date, meal_type, portions } = req.body;
    if (!date || !meal_type || !portions) {
      return res.status(400).json({ error: 'date, meal_type y portions son requeridos' });
    }

    // Delete all existing logs for this meal+date
    const { error: delErr } = await supabase
      .from('meal_logs')
      .delete()
      .eq('date', date)
      .eq('meal_type', meal_type);
    if (delErr) throw delErr;

    // Only insert if any portion > 0
    const hasAny = Object.values(portions).some(v => v > 0);
    if (!hasAny) return res.json({ ok: true, cleared: true });

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        meal_type,
        portions,
        input_type: 'manual',
        date,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GPT Food Analysis ────────────────────────────────────────────────────────

const EQUIVALENTS_CONTEXT = buildEquivalentsPromptContext();

const RECIPE_SYSTEM_PROMPT = `Eres un nutriólogo digital y chef mexicano experto en el sistema de equivalentes IMSS.
Propón TRES recetas mexicanas distintas y prácticas para el tiempo de comida indicado.
Cada receta debe usar EXACTAMENTE las porciones del plan de Héctor.

Plan de porciones por tiempo de comida:
${JSON.stringify(MEAL_PLAN, null, 2)}

Equivalentes disponibles (usa SOLO alimentos de esta lista):
${EQUIVALENTS_CONTEXT}

Reglas:
- Varía los ingredientes entre las 3 recetas (no repitas los mismos alimentos principales).
- Cada receta cubre EXACTAMENTE las porciones del plan para ese tiempo.
- Grupos con 0 porciones NO aparecen.
- Máximo 6 pasos por receta, lenguaje sencillo.
- Responde ÚNICAMENTE con JSON válido, sin markdown.

Estructura exacta:
{
  "meal_type": "desayuno|comida|cena",
  "recipes": [
    {
      "recipe_name": "Nombre de la receta",
      "servings": "descripción",
      "ingredients": [
        { "group": "grupo", "item": "nombre", "amount": "cantidad con unidad", "portions": 1 }
      ],
      "steps": ["Paso 1...", "Paso 2..."],
      "notes": "observación opcional"
    }
  ]
}`;

const ANALYSIS_SYSTEM_PROMPT = `Eres un nutriólogo digital experto en el sistema mexicano de equivalentes alimentarios (IMSS).
Tu tarea es analizar lo que comió el paciente y mapear cada alimento al grupo de intercambios correspondiente.

Tabla de equivalentes disponibles:
${EQUIVALENTS_CONTEXT}

Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones, con esta estructura exacta:
{
  "identified_foods": [
    { "food": "nombre del alimento", "group": "leche|carne|fruta|verdura|cereales|leguminosas|grasas", "portions": 1.0, "notes": "descripción opcional" }
  ],
  "portions_summary": {
    "leche": 0,
    "carne": 0,
    "fruta": 0,
    "verdura": 0,
    "cereales": 0,
    "leguminosas": 0,
    "grasas": 0
  },
  "confidence": "alta|media|baja",
  "notes": "observación general si aplica"
}`;

// Analyze a text description
app.post('/api/analyze/text', requireAuth, async (req, res) => {
  try {
    const { description, meal_type } = req.body;
    if (!description) return res.status(400).json({ error: 'description requerida' });

    const userPrompt = `El paciente comió en ${meal_type || 'una comida'}: "${description}"
Identifica los grupos de alimentos y las porciones (intercambios) según la tabla de equivalentes.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Analyze an image (base64)
app.post('/api/analyze/image', requireAuth, async (req, res) => {
  try {
    const { image_base64, image_type = 'image/jpeg', meal_type, extra_description } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'image_base64 requerido' });

    const userContent = [
      {
        type: 'text',
        text: `Analiza esta imagen de ${meal_type ? 'la comida "' + meal_type + '"' : 'una comida'}.
${extra_description ? 'Descripción adicional del paciente: "' + extra_description + '"' : ''}
Identifica todos los alimentos visibles y calcula sus porciones (intercambios) según la tabla de equivalentes.`,
      },
      {
        type: 'image_url',
        image_url: { url: `data:${image_type};base64,${image_base64}`, detail: 'high' },
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user',   content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Transcribe voice note + analyze
app.post('/api/analyze/voice', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo de audio requerido' });

    const meal_type        = req.body.meal_type;
    const extra_image_b64  = req.body.image_base64;

    // Step 1: Transcribe with Whisper
    const { Readable } = await import('stream');
    const audioFile = new File([req.file.buffer], req.file.originalname || 'audio.m4a', {
      type: req.file.mimetype || 'audio/m4a',
    });

    const transcription = await openai.audio.transcriptions.create({
      file:     audioFile,
      model:    'whisper-1',
      language: 'es',
    });

    const transcript = transcription.text;

    // Step 2: Analyze — with or without image
    let result;
    if (extra_image_b64) {
      // Combined: voice + image
      const userContent = [
        {
          type: 'text',
          text: `El paciente describió su comida: "${transcript}"
También adjuntó una foto. Analiza ambos para identificar los alimentos y calcular las porciones.
Comida: ${meal_type || 'no especificada'}.`,
        },
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${extra_image_b64}`, detail: 'high' },
        },
      ];
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user',   content: userContent },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
      });
      result = JSON.parse(response.choices[0].message.content);
    } else {
      // Voice only
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user',   content: `El paciente describió su comida (${meal_type || ''}): "${transcript}". Identifica los alimentos y porciones.` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });
      result = JSON.parse(response.choices[0].message.content);
    }

    res.json({ transcript, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Recipe Suggestion ────────────────────────────────────────────────────────

app.post('/api/suggest-recipe', requireAuth, async (req, res) => {
  try {
    const { meal_type } = req.body;
    const VALID = ['desayuno', 'comida', 'cena'];
    if (!meal_type || !VALID.includes(meal_type))
      return res.status(400).json({ error: `meal_type debe ser uno de: ${VALID.join(', ')}` });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        { role: 'user',   content: `Sugiere 3 recetas para ${MEAL_LABELS[meal_type]}. Porciones requeridas: ${JSON.stringify(MEAL_PLAN[meal_type])}.` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stats & Progress ─────────────────────────────────────────────────────────

// Daily compliance for a date range (for charts)
app.get('/api/stats/daily', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from y to son requeridos' });

    const { data: logs, error } = await supabase
      .from('meal_logs')
      .select('date, meal_type, portions')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (error) throw error;

    // Group by date
    const byDate = {};
    for (const log of logs) {
      if (!byDate[log.date]) byDate[log.date] = [];
      byDate[log.date].push(log);
    }

    const result = Object.entries(byDate).map(([date, dayLogs]) => {
      const consumed = { leche: 0, carne: 0, fruta: 0, verdura: 0, cereales: 0, leguminosas: 0, grasas: 0 };
      const mealsLogged = new Set();

      for (const log of dayLogs) {
        if (PIPELINE_ORDER.includes(log.meal_type)) mealsLogged.add(log.meal_type);
        if (log.portions) {
          for (const [g, q] of Object.entries(log.portions)) {
            if (consumed[g] !== undefined) consumed[g] += q;
          }
        }
      }

      // Compliance: % of target portions hit (capped at 100%)
      let totalTarget  = 0;
      let totalHit     = 0;
      for (const [group, target] of Object.entries(DAILY_TOTALS)) {
        totalTarget += target;
        totalHit    += Math.min(consumed[group], target);
      }
      const compliance = totalTarget > 0 ? Math.round((totalHit / totalTarget) * 100) : 0;
      const allMealsDone = PIPELINE_ORDER.every(m => mealsLogged.has(m));

      return { date, consumed, compliance, allMealsDone, mealsLogged: [...mealsLogged] };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Streak calculation
app.get('/api/stats/streak', requireAuth, async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('meal_logs')
      .select('date, meal_type')
      .in('meal_type', PIPELINE_ORDER)
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by date: check if all 3 pipeline meals are present
    const dateMap = {};
    for (const log of logs) {
      if (!dateMap[log.date]) dateMap[log.date] = new Set();
      dateMap[log.date].add(log.meal_type);
    }

    const completeDates = Object.entries(dateMap)
      .filter(([, meals]) => PIPELINE_ORDER.every(m => meals.has(m)))
      .map(([date]) => date)
      .sort()
      .reverse();

    // Current streak: count consecutive days ending today or yesterday
    let streak = 0;
    const todayStr  = todayMX();
    const yestStr   = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date(Date.now() - 86400000));

    // Allow streak if today is complete OR yesterday was the last complete day
    let cursor = completeDates[0] === todayStr || completeDates[0] === yestStr ? completeDates[0] : null;

    if (cursor) {
      for (const d of completeDates) {
        if (d === cursor) {
          streak++;
          const prev = new Date(cursor);
          prev.setDate(prev.getDate() - 1);
          cursor = prev.toISOString().split('T')[0];
        } else {
          break;
        }
      }
    }

    // Best streak ever
    let best = 0, current = 0, prevDate = null;
    for (const d of [...completeDates].reverse()) {
      if (!prevDate) {
        current = 1;
      } else {
        const diff = (new Date(d) - new Date(prevDate)) / 86400000;
        current = diff === 1 ? current + 1 : 1;
      }
      best = Math.max(best, current);
      prevDate = d;
    }

    const todayComplete = completeDates[0] === todayStr;

    res.json({
      currentStreak: streak,
      bestStreak:    best,
      totalCompleteDays: completeDates.length,
      todayComplete,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weekly summary (last 7 days)
app.get('/api/stats/week', requireAuth, async (req, res) => {
  try {
    const to   = todayMX();
    const from = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date(Date.now() - 6 * 86400000));

    // Reuse daily stats logic
    const fakeReq = { query: { from, to }, headers: req.headers };
    let dailyData;
    await new Promise((resolve) => {
      const fakeRes = {
        json: (d) => { dailyData = d; resolve(); },
        status: () => fakeRes,
      };
      // Call the handler directly
      supabase.from('meal_logs').select('date, meal_type, portions')
        .gte('date', from).lte('date', to).order('date', { ascending: true })
        .then(({ data: logs, error }) => {
          if (error) { dailyData = []; resolve(); return; }
          const byDate = {};
          for (const log of logs) {
            if (!byDate[log.date]) byDate[log.date] = [];
            byDate[log.date].push(log);
          }
          dailyData = Object.entries(byDate).map(([date, dayLogs]) => {
            const consumed = { leche: 0, carne: 0, fruta: 0, verdura: 0, cereales: 0, leguminosas: 0, grasas: 0 };
            const mealsLogged = new Set();
            for (const log of dayLogs) {
              if (PIPELINE_ORDER.includes(log.meal_type)) mealsLogged.add(log.meal_type);
              if (log.portions) {
                for (const [g, q] of Object.entries(log.portions)) {
                  if (consumed[g] !== undefined) consumed[g] += q;
                }
              }
            }
            let totalTarget = 0, totalHit = 0;
            for (const [group, target] of Object.entries(DAILY_TOTALS)) {
              totalTarget += target;
              totalHit    += Math.min(consumed[group], target);
            }
            const compliance  = totalTarget > 0 ? Math.round((totalHit / totalTarget) * 100) : 0;
            const allMealsDone = PIPELINE_ORDER.every(m => mealsLogged.has(m));
            return { date, consumed, compliance, allMealsDone };
          });
          resolve();
        });
    });

    const avgCompliance = dailyData.length
      ? Math.round(dailyData.reduce((s, d) => s + d.compliance, 0) / dailyData.length)
      : 0;
    const completeDays = dailyData.filter(d => d.allMealsDone).length;

    res.json({ from, to, days: dailyData, avgCompliance, completeDays, totalDays: dailyData.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Weight Log ───────────────────────────────────────────────────────────────

app.post('/api/weight', requireAuth, async (req, res) => {
  try {
    const { weight_kg, date } = req.body;
    if (!weight_kg) return res.status(400).json({ error: 'weight_kg requerido' });

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ weight_kg, date: date || todayMX() })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/weight', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'meditrack-api' }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`MediTrack API running on port ${PORT}`);
});
