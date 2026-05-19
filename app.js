/* ── RELATOS LATAM — APP.JS ───────────────────────────────── */

// ── DATOS ───────────────────────────────────────────────────
const CANALES = {
  traicion: {
    nombre: 'Traición y Venganza',
    temas: [
      'el mejor empleado traicionado por su mentor para salvarlo de algo peor',
      'el testigo perfecto que preparó su venganza en silencio durante dos años',
      'la herencia que destruyó a una familia y el secreto que la causó',
      'el socio que planeó el robo antes de conocer a su víctima',
      'la persona que fingió ser víctima para conseguir un testigo externo',
    ]
  },
  crimen: {
    nombre: 'Misterios y Crimen Real',
    temas: [
      'el pueblo que eligió olvidar colectivamente lo que pasó una noche en mil novecientos ochenta y siete',
      'el caso que se resolvió dos veces y las dos veces fue un inocente el condenado',
      'el psicólogo forense que desapareció dejando evidencia de inocentes presos',
      'la ciudad construida con dinero que no podía existir oficialmente',
      'la desaparición que nadie investigó porque todos en el pueblo sabían la respuesta',
    ]
  },
  gaming: {
    nombre: 'Historias del Mundo Gamer',
    temas: [
      'el jugador fantasma que dominó rankings globales durante cuatro años sin que nadie supiera quién era',
      'el desarrollador que saboteó su propio juego para proteger a los usuarios de algo que el estudio había insertado',
      'el torneo de dos millones de dólares que nunca se realizó y nadie denunció formalmente',
      'el equipo que ganó todo durante tres años con un jugador que en realidad no existía como tal',
      'el estudio que insertó algo en el código sin que sus propios desarrolladores lo supieran',
    ]
  }
};

const TONOS = {
  thriller:   'thriller psicológico oscuro. Frases cortas. Pausas que pesan. Cada detalle aparentemente menor es una pista que el espectador no va a reconocer hasta el giro.',
  documental: 'documental sobrio y frío. Sin adornos. Los hechos solos generan el horror.',
  suspense:   'suspense creciente. Cada párrafo termina con una pregunta sin responder que obliga a seguir escuchando.',
  emocional:  'emocional e íntimo. El dolor de los personajes se siente físicamente en cada línea.'
};

// ── ESTADO ──────────────────────────────────────────────────
let canalActual = 'traicion';
let apiKey = '';

// ── INIT ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('rl_anthropic_key');
  if (savedKey) {
    apiKey = savedKey;
    showApp();
  }
});

// ── API KEY ─────────────────────────────────────────────────
function saveKey() {
  const input = document.getElementById('api-key-input');
  const key   = input.value.trim();
  const err   = document.getElementById('api-error');

  if (!key.startsWith('sk-ant')) {
    err.textContent = 'La API key debe empezar con sk-ant-api...';
    return;
  }

  localStorage.setItem('rl_anthropic_key', key);
  apiKey = key;
  err.textContent = '';
  showApp();
}

function showApp() {
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
}

function logout() {
  localStorage.removeItem('rl_anthropic_key');
  apiKey = '';
  document.getElementById('setup-screen').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('api-key-input').value = '';
}

// ── CANAL ───────────────────────────────────────────────────
function setCanal(el) {
  canalActual = el.dataset.canal;
  document.querySelectorAll('.canal-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

// ── NÚMEROS EN LETRAS ────────────────────────────────────────
function fixNumbers(text) {
  const map = {
    '2013':'dos mil trece','2014':'dos mil catorce','2015':'dos mil quince',
    '2016':'dos mil dieciséis','2017':'dos mil diecisiete','2018':'dos mil dieciocho',
    '2019':'dos mil diecinueve','2020':'dos mil veinte','2021':'dos mil veintiuno',
    '2022':'dos mil veintidós','2023':'dos mil veintitrés','2024':'dos mil veinticuatro',
    '2025':'dos mil veinticinco','2026':'dos mil veintiséis',
    '1987':'mil novecientos ochenta y siete','1995':'mil novecientos noventa y cinco',
    '2010':'dos mil diez','2011':'dos mil once','2012':'dos mil doce',
  };

  let t = text;
  for (const [num, word] of Object.entries(map)) {
    t = t.replace(new RegExp(`\\b${num}\\b`, 'g'), word);
  }

  // números con punto de miles
  t = t.replace(/(\d{1,3})\.(\d{3})/g, (_, a, b) => {
    const n = parseInt(a + b);
    const nums = {
      83400:'ochenta y tres mil cuatrocientos',
      51000:'cincuenta y un mil',
      220000:'doscientos veinte mil',
      180000:'ciento ochenta mil',
      40000:'cuarenta mil',
      32000:'treinta y dos mil',
      4500:'cuatro mil quinientos',
      4200:'cuatro mil doscientos',
      2000000:'dos millones',
      1000000:'un millón',
      500000:'quinientos mil',
      100000:'cien mil',
      50000:'cincuenta mil',
      10000:'diez mil',
      5000:'cinco mil',
      1000:'mil',
    };
    return nums[n] || `${a}.${b}`;
  });

  return t;
}

// ── SPLIT EN BLOQUES ─────────────────────────────────────────
function splitBlocks(text, max = 440) {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const blocks = [];
  let current = '';

  for (const p of paragraphs) {
    const candidate = current ? current + ' ' + p : p;
    if (candidate.length <= max) {
      current = candidate;
    } else {
      if (current) blocks.push(current);
      if (p.length > max) {
        const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
        let sub = '';
        for (const s of sentences) {
          const sc = sub ? sub + ' ' + s : s;
          if (sc.length <= max) { sub = sc; }
          else { if (sub) blocks.push(sub); sub = s.length <= max ? s : s.substring(0, max); }
        }
        current = sub;
      } else {
        current = p;
      }
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

// ── BUILD PROMPT ─────────────────────────────────────────────
function buildPrompt() {
  const c    = CANALES[canalActual];
  const tema = document.getElementById('tema').value.trim()
             || c.temas[Math.floor(Math.random() * c.temas.length)];
  const tono = TONOS[document.getElementById('tono').value];

  return {
    tema,
    prompt: `Sos un guionista de élite especializado en contenido viral oscuro y psicológico para YouTube y TikTok en español latino. Tu trabajo es crear historias IMPOSIBLES de dejar de ver.

REGLAS ABSOLUTAS:

1. PLOT TWIST REAL EN DOS O TRES CAPAS. Capa uno: algo que parece ser el final. Capa dos: el giro que destruye todo lo anterior. Capa tres (opcional): un último dato ambiguo. El tipo de giro que hace que la gente diga "tuve que escucharlo dos veces".

2. PREMISA ORIGINAL. La situación de partida tiene que ser algo que el espectador no haya procesado antes. Una combinación inesperada. Un ángulo que nadie tomó.

3. PISTAS SEMBRADAS. Desde el comienzo hay detalles que parecen irrelevantes pero que el espectador va a querer re-escuchar cuando llegue el giro. Eso genera rewatch y el algoritmo lo premia.

4. PERSONAJES CONTRADICTORIOS. El villano tiene una razón que casi tiene sentido. El héroe tiene una falla real. Las personas reales son contradictorias.

5. FRASES CORTAS SEPARADAS POR PUNTO. No por coma. Una idea por oración. Crítico para que la voz IA suene natural.

6. SIN SALTOS DE LÍNEA DOBLES dentro de un mismo bloque narrativo.

7. TODOS LOS NÚMEROS EN LETRAS. Jamás usar dígitos ni puntos de miles. Ochenta y tres mil cuatrocientos dólares. Dos mil quince. Sin excepción.

8. GANCHO EN LOS PRIMEROS CINCO SEGUNDOS. La primera oración es el hecho más perturbador de toda la historia. Sin contexto previo. Directo al centro del misterio.

9. FINAL PERTURBADOR O AMBIGUO. Sin moraleja. Sin cierre limpio.

10. DISCLAIMER OBLIGATORIO. Primera oración del guión largo: "Esta historia es una obra de ficción creada con inteligencia artificial. Los nombres, personajes y eventos son completamente inventados."

CANAL: "${c.nombre}"
TEMA BASE: "${tema}"
TONO: ${tono}

ESTRATEGIA DE PUBLICACIÓN:
El guión largo 16:9 va a YouTube (CPM alto). El guión short 9:16 se sube exactamente igual a TikTok Y a YouTube Shorts — un solo archivo, dos plataformas, máximo alcance.

Respondé EXACTAMENTE con estas secciones, sin texto extra:

[TITULO_YT]
Máximo sesenta caracteres. Genera paranoia, urgencia o incredulidad. El tipo de título que hace parar el scroll y pensar "qué es esto".

[DESCRIPCION_YT]
Doscientas cincuenta palabras. Primer párrafo: revelar apenas lo suficiente para que sea imposible no hacer clic. Segundo: contexto sin spoilers. Tercero: pregunta sobre el plot twist para los comentarios. Cerrar con palabras clave. Incluir al inicio: "Ficción generada con IA."

[GUION_LARGO]
Aproximadamente mil cuatrocientas palabras. Solo texto narrativo puro, sin corchetes ni instrucciones. Estructura: disclaimer, gancho brutal, contexto con pistas sembradas, desarrollo en tres capas de tensión creciente, clímax con primer golpe, giro real que destruye todo, resolución perturbadora o ambigua, llamada a la acción con pregunta sobre el twist.

[TITULO_SHORT]
Máximo cuarenta caracteres. Miedo, incredulidad o curiosidad extrema. Incluir "(Ficción IA)" al final. Mismo título para TikTok y YouTube Shorts.

[GUION_SHORT]
Exactamente ciento setenta palabras para sesenta y cinco segundos. Solo texto narrativo puro. Primera oración: el hecho más perturbador sin contexto. Desarrollo en sprint hacia el giro. El twist golpea, silencio con punto y aparte, último dato que reencuadra todo. Cierre: pregunta más "Historia completa en YouTube". Este guión se sube igual a TikTok y YouTube Shorts.

[DESCRIPCION_SHORT]
Cincuenta palabras para usar igual en TikTok y YouTube Shorts. Incluir "(Ficción IA)" al inicio y "Historia completa en YouTube" al final.

[HASHTAGS]
Veinte hashtags en español. Un hashtag por línea. Sin comas. Mezclar masivos, nicho específico y uno que invite al debate.`
  };
}

// ── GENERAR ──────────────────────────────────────────────────
async function generar() {
  const btn     = document.getElementById('gen-btn');
  const spinner = document.getElementById('spinner');
  const label   = document.getElementById('gen-label');
  const content = document.getElementById('main-content');

  btn.disabled = true;
  spinner.classList.remove('hidden');
  label.textContent = 'Generando...';

  // Progress bar
  content.innerHTML = `
    <div class="progress-wrap" id="prog">
      <div class="progress-fill" id="prog-fill"></div>
    </div>
  `;

  let pct = 8;
  const tick = setInterval(() => {
    pct = Math.min(pct + 1.8, 82);
    const el = document.getElementById('prog-fill');
    if (el) el.style.width = pct + '%';
  }, 400);

  const { prompt, tema } = buildPrompt();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearInterval(tick);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Error ${res.status}`);
    }

    const data = await res.json();
    const text = fixNumbers(data.content?.map(i => i.text || '').join('\n') || '');

    const progEl = document.getElementById('prog-fill');
    if (progEl) progEl.style.width = '100%';
    await new Promise(r => setTimeout(r, 300));

    renderOutput(text, tema);

  } catch (e) {
    clearInterval(tick);
    renderFallback(prompt, tema, e.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add('hidden');
    label.textContent = 'Generar contenido';
  }
}

// ── RENDER OUTPUT ────────────────────────────────────────────
function renderOutput(text, tema) {
  const content = document.getElementById('main-content');
  content.innerHTML = '';

  // Meta chips
  const chips = document.createElement('div');
  chips.className = 'meta-chips';
  chips.innerHTML = `
    <span class="chip r">Canal: ${CANALES[canalActual].nombre}</span>
    <span class="chip">Tema: ${tema}</span>
    <span class="chip g">YT largo + TikTok + YT Shorts ✓</span>
    <span class="chip g">Bloques ≤440 car ✓</span>
  `;
  content.appendChild(chips);

  const grid = document.createElement('div');
  grid.className = 'output-grid';

  const SECCIONES = [
    { tag: 'TITULO_YT',          label: 'Título YouTube largo (16:9)',              color: '#ef4444', tipo: 'text' },
    { tag: 'DESCRIPCION_YT',     label: 'Descripción YouTube largo',                color: '#ef4444', tipo: 'text' },
    { tag: 'GUION_LARGO',        label: 'Guión YouTube largo — bloques para CapCut',color: '#22c55e', tipo: 'capcut' },
    { tag: 'TITULO_SHORT',       label: 'Título Short — TikTok + YouTube Shorts',   color: '#3b82f6', tipo: 'text' },
    { tag: 'GUION_SHORT',        label: 'Guión Short 9:16 — TikTok + YT Shorts',   color: '#3b82f6', tipo: 'capcut' },
    { tag: 'DESCRIPCION_SHORT',  label: 'Descripción corta — TikTok + YT Shorts',  color: '#8b5cf6', tipo: 'text' },
    { tag: 'HASHTAGS',           label: 'Hashtags SEO',                             color: '#f59e0b', tipo: 'hashtags' },
  ];

  for (const [idx, sec] of SECCIONES.entries()) {
    const rx = new RegExp(`\\[${sec.tag}\\]([\\s\\S]*?)(?=\\[(?:${SECCIONES.map(s=>s.tag).join('|')})\\]|$)`);
    const m  = text.match(rx);
    if (!m || !m[1].trim()) continue;
    const body = m[1].trim();

    const block = document.createElement('div');
    block.className = 'out-block';
    block.style.animationDelay = (idx * 0.06) + 's';

    if (sec.tipo === 'capcut') {
      const bloques = splitBlocks(body);
      block.innerHTML = `
        <div class="out-head">
          <div class="out-tag">
            <div class="tag-dot" style="background:${sec.color}"></div>
            ${sec.label}
          </div>
          <div class="out-actions">
            <span class="bloque-count">${bloques.length} bloques</span>
          </div>
        </div>
      `;
      const cc = document.createElement('div');
      cc.className = 'capcut-container';
      cc.innerHTML = `<div class="capcut-header">Copiá cada bloque → CapCut → Texto → Agregar texto → Texto a voz → Wise Man → Generar</div>`;

      const list = document.createElement('div');
      list.className = 'bloque-list';

      bloques.forEach((b, i) => {
        const ok = b.length <= 440;
        const div = document.createElement('div');
        div.className = 'bloque' + (ok ? ' ok' : '');
        div.innerHTML = `
          <div class="bloque-head">
            <div class="bloque-num">
              <span class="bloque-badge">${i + 1}</span>
              Bloque ${i + 1} de ${bloques.length}
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="bloque-chars">${b.length} car ${ok ? '✓' : '⚠'}</span>
              <button class="copy-btn" data-text="${encodeURIComponent(b)}">Copiar</button>
            </div>
          </div>
          <div class="bloque-body">${esc(b)}</div>
          <div class="bloque-note">→ Texto → Agregar texto → pegá → Texto a voz → Wise Man → Generar</div>
        `;
        list.appendChild(div);
      });

      cc.appendChild(list);

      const copyAll = document.createElement('button');
      copyAll.className = 'copy-all-btn';
      copyAll.textContent = 'Copiar guión completo';
      copyAll.addEventListener('click', () => doCopy(copyAll, body));
      cc.appendChild(copyAll);

      block.appendChild(cc);

    } else if (sec.tipo === 'hashtags') {
      block.innerHTML = `
        <div class="out-head">
          <div class="out-tag">
            <div class="tag-dot" style="background:${sec.color}"></div>
            ${sec.label}
          </div>
          <button class="copy-btn" data-text="${encodeURIComponent(body)}">Copiar todos</button>
        </div>
      `;
      const hw = document.createElement('div');
      hw.className = 'hashtag-wrap';
      body.split('\n').forEach(h => {
        const ht = h.trim();
        if (!ht) return;
        const s = document.createElement('span');
        s.className = 'hashtag';
        s.textContent = ht.startsWith('#') ? ht : '#' + ht;
        s.addEventListener('click', () => {
          navigator.clipboard.writeText(s.textContent);
          s.style.borderColor = 'var(--blue)';
          setTimeout(() => s.style.borderColor = '', 1000);
        });
        hw.appendChild(s);
      });
      block.appendChild(hw);

    } else {
      block.innerHTML = `
        <div class="out-head">
          <div class="out-tag">
            <div class="tag-dot" style="background:${sec.color}"></div>
            ${sec.label}
          </div>
          <button class="copy-btn" data-text="${encodeURIComponent(body)}">Copiar</button>
        </div>
        <div class="out-body">${esc(body)}</div>
      `;
    }

    grid.appendChild(block);
  }

  // Fallback si no parseó nada
  if (!grid.children.length) {
    renderFallback('', tema, 'No se pudo parsear la respuesta');
    return;
  }

  content.appendChild(grid);

  // Activar copy buttons
  content.querySelectorAll('.copy-btn[data-text]').forEach(btn => {
    btn.addEventListener('click', () => {
      doCopy(btn, decodeURIComponent(btn.dataset.text));
    });
  });
}

// ── RENDER FALLBACK ──────────────────────────────────────────
function renderFallback(prompt, tema, errorMsg) {
  const content = document.getElementById('main-content');
  content.innerHTML = '';

  if (errorMsg) {
    const errEl = document.createElement('div');
    errEl.className = 'error-box';
    errEl.textContent = `Error: ${errorMsg}. Verificá tu API Key o tu conexión.`;
    content.appendChild(errEl);
  }

  const chips = document.createElement('div');
  chips.className = 'meta-chips';
  chips.innerHTML = `<span class="chip r">Modo: copiar prompt manualmente</span>`;
  content.appendChild(chips);

  if (prompt) {
    const fb = document.createElement('div');
    fb.className = 'fallback-box out-block';
    fb.innerHTML = `
      <div class="out-head">
        <div class="out-tag">
          <div class="tag-dot" style="background:var(--gold)"></div>
          Prompt completo — pegalo en Claude.ai
        </div>
        <button class="copy-btn" id="cp-prompt">Copiar prompt</button>
      </div>
      <div class="fallback-body">${esc(prompt)}</div>
    `;
    content.appendChild(fb);
    document.getElementById('cp-prompt').addEventListener('click', function() {
      doCopy(this, prompt);
    });
  }
}

// ── UTILS ────────────────────────────────────────────────────
function doCopy(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('ok'); }, 2000);
  });
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Enter en el input de API key
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('api-key-input');
  if (input) {
    input.addEventListener('keydown', e => { if (e.key === 'Enter') saveKey(); });
  }
});
