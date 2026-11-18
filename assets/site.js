(() => {
  // Waitlist storage: a private Google Form owned by the founders. Each field maps to one entry id.
  const FORM = "https://docs.google.com/forms/d/e/1FAIpQLScLl2p1eQtDN6ABq2GCghfBfIN64JWRQ8a6cpSia-Xoj2YOMQ/formResponse";
  const ENTRY = { email: "entry.86999459", company: "entry.927487711", role: "entry.1571711619", country: "entry.49648867", lang: "entry.2002865028" };

  // English lives in the HTML (the default). Spanish is here, keyed by data-t.
  const ES = {
    "ai": "IA",
    "nav.how": "Cómo funciona",
    "nav.rules": "Qué revisa",
    "nav.privacy": "Privacidad",
    "nav.cta": "Lista de espera",
    "hero.eyebrow": "Importaciones China → Chile",
    "h1a": "Revisión",
    "h1b": "de documentos",
    "h1c": "de importación",
    "cta3": "Ver un embarque",
    "land.h": "Revisado antes de que llegue el embarque",
    "mq.importers": "Importadores",
    "mq.brokers": "Agentes de aduanas",
    "mq.trading": "Oficinas de trading",
    "mq.sourcing": "Oficinas de compras",
    "prod.h": "Resultados de un embarque",
    "prod.sub": "Lo que necesita su decisión aparece primero.",
    "priv.state": "Los documentos no salen de su computador.",
    "priv.d1": "Despa funciona en su Mac, con un modelo de IA que corre en el mismo computador.",
    "foot.top": "Volver arriba",
    "lede": "Despa compara la factura, la lista de empaque, el conocimiento de embarque y el certificado de origen de cada embarque, entre sí y con sus reglas. Después escribe a cada proveedor lo que tiene que corregir.",
    "lede2": "Funciona en su Mac. Los documentos no salen de su computador.",
    "cta": "Unirme a la lista de espera",
    "cta2": "Ver un valor en su página",
    "fig1.cap": "Embarque de ejemplo BST-24117, con datos inventados",
    "app.profile": "Perfil: Andes Juguetes SpA",
    "app.docs": "Documentos",
    "doc.invoice": "Factura comercial",
    "p2": "2 páginas",
    "doc.packing": "Lista de empaque",
    "doc.bl": "Conocimiento de embarque",
    "p1": "1 página",
    "doc.formf": "Certificado de origen",
    "app.check": "Revisar",
    "v.blocked": "BLOQUEADO",
    "v.counts": "Bloqueantes: 1 · Por corregir: 2 · Menores: 1 · Por revisar a mano: 2",
    "g.decide": "Necesita su decisión",
    "r6": "Descripción de las mercancías",
    "sev.block": "Bloqueante",
    "fail": "INCORRECTO",
    "r6.note": "Falta: KITES",
    "pass": "CORRECTO",
    "r4": "Peso bruto",
    "sev.fix": "Por corregir",
    "r4.note": "Difiere de 8,655.000 KGS",
    "r1": "Nombre y dirección del consignatario",
    "sev.minor": "Menor",
    "r1.note": "Falta: OF. 1204",
    "r7": "Mercancías en el conocimiento de embarque",
    "hand": "REVISAR A MANO",
    "r7.note": "No nombra: KITES",
    "r9": "Puerto de embarque",
    "nf": "NO ENCONTRADO",
    "r9.none": "No se encontró en este documento.",
    "g.passed": "5 reglas correctas",
    "cost.h": "Lo que cuesta un error",
    "cost.rate": "Arancel de importación",
    "cost.without": "Arancel general, sin un Formulario F válido",
    "cost.with": "Con el Formulario F del TLC Chile–China, salvo la lista de exclusiones",
    "cost.per": "Un contenedor de 20 pies con US$ 50.000 en mercancía (CIF)",
    "cost.gap": "Pagado de más",
    "cost.src": "Un contenedor de 20 pies, US$ 50.000 en mercancía (promedio UNCTAD, redondeado hacia abajo).",
    "cost.sr": "Sin un Formulario F válido, un contenedor de 20 pies con US$ 50.000 en mercancía paga US$ 3.570 más: US$ 3.000 de arancel y US$ 570 de IVA.",
    "cost.stamp.ok": "0% arancel",
    "cost.stamp.bad": "Error",
    "cost.c1": "Sin TLC",
    "cost.c2": "Con TLC",
    "cost.duty": "Arancel",
    "cost.vat": "IVA 19%",
    "cost.total": "Total",
    "cost.note": "Si la descripción o el código SA del Formulario F no coincide con la factura, la aduana puede negar la preferencia. Despa compara el Formulario F con la factura antes de que el embarque llegue.",
    "how.h": "Cómo funciona",
    "s1.t": "Suba los documentos",
    "s1.d": "Arrastre los archivos de un embarque: PDF, Excel, Word o escaneados. Un embarque puede tener varias facturas y listas de empaque.",
    "s2.t": "Despa los compara",
    "s2.d": "Cada valor se compara entre documentos, con las reglas de su empresa y con las del TLC Chile–China. Lo que necesita su decisión aparece primero.",
    "s3.t": "Pida la corrección",
    "s3.d": "Un mensaje por proveedor, en chino, español o inglés, con cada valor que hay que cambiar y los documentos que tiene que volver a enviar.",
    "page.h": "Cada valor con su página",
    "page.sub": "Elija un documento para ver de dónde salió el valor.",
    "page.ai": "Cuando un valor lo leyó el modelo de IA en un escaneo, queda marcado así para que lo compare con la página.",
    "msg.h": "Mensaje al proveedor",
    "m1.t": "En el idioma del proveedor",
    "m1.d": "Chino, español o inglés. Cada valor va con el documento donde está y el valor correcto.",
    "m2.t": "Versiones",
    "m2.d": "Cuando llega un documento corregido, Despa lo compara con el anterior y cierra lo que quedó resuelto.",
    "m3.t": "Historial por proveedor",
    "m3.d": "Recuerda los errores que repite cada proveedor.",
    "msg.copy": "Copiar",
    "rules.h": "Qué revisa",
    "rules.sub": "Cada importador define sus reglas en una pantalla, sin código.",
    "rules.c1": "Regla",
    "rules.c2": "Qué compara",
    "ru1.t": "Consignatario",
    "ru1.d": "Nombre y dirección, con el texto que exige su empresa, en todos los documentos.",
    "ru2.t": "Embarcador y parte a notificar",
    "ru2.d": "Que sean los mismos en la factura, la lista de empaque y el conocimiento de embarque.",
    "ru3.t": "Número de factura",
    "ru3.d": "El mismo número en cada documento que lo cita.",
    "ru4.t": "Peso bruto",
    "ru4.d": "El total de la lista de empaque contra la factura y el conocimiento de embarque.",
    "ru5.t": "Mercancías",
    "ru5.d": "La descripción de cada mercancía en todos los documentos, incluido el Formulario F.",
    "ru6.t": "Puertos y términos",
    "ru6.d": "Puerto de embarque, términos de comercio y flete en el conocimiento de embarque.",
    "ru7.t": "Monto en palabras",
    "ru7.d": "Que el total escrito en palabras sea el total de la factura.",
    "ru8.t": "Formulario F",
    "ru8.d": "Emisor, códigos SA contra la factura, validez y criterio de origen del TLC Chile–China.",
    "priv.h": "Dónde quedan sus documentos",
    "priv.mac": "Su Mac",
    "priv.i1": "Documentos del embarque",
    "priv.i2": "Modelo de IA local",
    "priv.i3": "Resultados y mensajes",
    "priv.big": "Despa funciona en su Mac, con un modelo de IA que corre en el mismo computador. Los documentos no salen de su computador.",
    "priv.d": "Los escaneos también se leen ahí. Lo que el modelo leyó queda marcado, para que usted decida cuánto revisar a mano.",
    "wait.h": "Lista de espera",
    "wait.d": "Para importadores, agentes de aduanas y oficinas de trading o compras. Le escribimos cuando haya un lugar para su empresa.",
    "w.email": "Correo",
    "w.company": "Empresa",
    "w.role": "Rol",
    "w.role.pick": "Elija uno",
    "w.role.importer": "Importador",
    "w.role.broker": "Agente de aduanas",
    "w.role.trading": "Oficina de trading o compras",
    "w.role.other": "Otro",
    "w.country": "País",
    "w.submit": "Unirme",
    "w.ok": "LISTO",
    "w.thanks": "Le escribimos cuando haya un lugar para su empresa.",
    "msg.copied": "Copiado"
  };
  const BT_ES = { src: "build-time.json", heading: "Tiempo de construcción", "label-working": "Tiempo de trabajo", "label-wall": "De inicio a fin", "label-agent": "Tiempo de agentes" };
  const FORM_MSG = {
    es: { missing: "Complete todos los campos.", email: "Revise el correo.", failed: "No se pudo enviar. Intente de nuevo en un minuto." },
    en: { missing: "Fill in every field.", email: "Check the email address.", failed: "It did not go through. Try again in a minute." },
  };
  // Money in the cost ledger: Chile writes 2.014, English writes 2,014.
  const fmtMoney = (n, l) => "US$ " + n.toLocaleString(l === "en" ? "en-US" : "es-CL");

  const EN = {};
  document.querySelectorAll("[data-t]").forEach((el) => { if (!(el.dataset.t in EN)) EN[el.dataset.t] = el.textContent; });
  EN["msg.copied"] = "Copied";
  const btEl = document.querySelector("build-time");
  const BT_EN = {};
  if (btEl) for (const k of Object.keys(BT_ES)) BT_EN[k] = btEl.getAttribute(k);

  const TITLE = { en: document.title, es: "Despa · Revisión de documentos de importación" };
  const status = document.getElementById("w-status");
  let lang = "en";
  const t = (k) => (lang === "en" ? EN : ES)[k];

  function setLang(next) {
    lang = next;
    const dict = next === "en" ? EN : ES;
    document.documentElement.lang = next;
    document.title = TITLE[next];
    document.querySelectorAll("[data-t]").forEach((el) => { if (dict[el.dataset.t] != null) el.textContent = dict[el.dataset.t]; });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === next)));
    document.querySelectorAll(".ledger td[data-n]").forEach((td) => { td.textContent = fmtMoney(Number(td.dataset.n), next); });
    if (btEl) {
      const bt = next === "en" ? BT_EN : BT_ES;
      for (const [k, v] of Object.entries(bt)) btEl.setAttribute(k, v);
      if (btEl.connectedCallback && btEl.shadowRoot) btEl.connectedCallback();
    }
    try { localStorage.setItem("despa-lang", next); } catch {}
    const u = new URL(location.href);
    if (next === "es") u.searchParams.set("lang", "es"); else u.searchParams.delete("lang");
    history.replaceState(null, "", u);
    status.textContent = "";
    window.dispatchEvent(new CustomEvent("despa:lang", { detail: next }));
    requestAnimationFrame(onScroll);
  }

  // Scroll-linked pieces that do not need WebGL: header, the two marquee rows, the cards settling in.
  const top = document.getElementById("top");
  const intro = document.querySelector(".intro");
  const rows = [...document.querySelectorAll(".mq-row")];
  const cards = [...document.querySelectorAll(".card")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  cards.forEach((c) => c.style.setProperty("--tilt", c.dataset.tilt || "1"));
  // Section 01 is one picture. 50 tiles of US$1,000 are a container's goods. A Form F stamp lands on it, turns red,
  // and red blocks fall beside it: three of US$1,000 (duty) and a thin one of US$570 (VAT). Scroll is the clock.
  const costSec = document.querySelector(".cost");
  const cv = document.getElementById("cost-cv");
  const cx = cv.getContext("2d");
  const moneyEl = costSec.querySelector(".money");
  const numWrap = costSec.querySelector(".cost-num");
  const wide = matchMedia("(min-width: 1001px) and (min-height: 480px)");
  const c01 = (v) => Math.min(1, Math.max(0, v));
  const sm = (v) => { v = c01(v); return v * v * (3 - 2 * v); };
  const seg = (q, a, b) => c01((q - a) / (b - a));
  const rootCs = getComputedStyle(document.documentElement);
  const cssv = (n) => rootCs.getPropertyValue(n).trim();
  const lab = (k) => costSec.querySelector(`[data-t="${k}"]`).textContent;
  const FALLS = [[0.44, 0.11, 1000], [0.55, 0.11, 1000], [0.66, 0.11, 1000], [0.80, 0.10, 570]];
  const MONO = '"Geist Mono", ui-monospace, Menlo, monospace';

  function drawCost(q) {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pw = Math.round(r.width * dpr), ph = Math.round(r.height * dpr);
    if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    const u = r.width / 15.5, H = r.height, ground = H - 0.4 * u;
    const ink = cssv("--ink"), red = cssv("--red"), green = cssv("--green"), line = cssv("--line"), accent = cssv("--accent");
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, r.width, H);

    // every fall: position 0..1 with gravity, then a bounce; and a shake when it lands
    let shake = 0, money = 0;
    const falls = FALLS.map(([a, d, val]) => {
      const s = seg(q, a, a + d);
      const f = s < 0.7 ? (s / 0.7) ** 2 : 1;
      const b = s < 0.7 ? 0 : (s - 0.7) / 0.3;
      const up = s < 0.7 ? 0 : Math.sin(b * Math.PI) * (1 - b) * 0.35 * u;
      if (s >= 0.7 && s < 1) shake += Math.sin(b * Math.PI * 7) * (1 - b) * 0.07 * u;
      money += val * Math.min(1, s / 0.7);
      return { s, f, up, val };
    });
    cx.save();
    cx.translate(0, shake);

    // ground
    cx.fillStyle = line; cx.fillRect(0, ground + 0.12 * u, r.width, 2);

    // the container's goods: frame, 50 tiles, value
    const dim = 1 - 0.42 * sm(seg(q, 0.40, 0.50));
    const gridA = sm(seg(q, 0.02, 0.10));
    cx.globalAlpha = gridA;
    cx.strokeStyle = accent; cx.lineWidth = Math.max(2, 0.07 * u);
    cx.beginPath(); cx.roundRect(0.1 * u, ground - 5 * u - 0.1 * u, 10.2 * u, 5.2 * u, 0.12 * u); cx.stroke();
    cx.globalAlpha = 1;
    cx.fillStyle = ink;
    for (let i = 0; i < 50; i++) {
      const a = sm(seg(q, 0.02 + i * 0.0034, 0.07 + i * 0.0034));
      if (a <= 0) continue;
      const col = i % 10, row = Math.floor(i / 10);
      const sz = 0.92 * u * (0.5 + 0.5 * a);
      const cxp = 0.2 * u + col * u + 0.5 * u, cyp = ground - row * u - 0.5 * u;
      cx.globalAlpha = a * dim;
      cx.fillRect(cxp - sz / 2, cyp - sz / 2, sz, sz);
    }
    cx.globalAlpha = gridA * dim;
    cx.font = `500 ${Math.max(11, 0.5 * u)}px ${MONO}`; cx.textAlign = "right"; cx.textBaseline = "alphabetic";
    cx.fillText(fmtMoney(50000, lang), 10.3 * u, 1.45 * u);

    // the Form F stamp: lands green, flips, turns red
    const ap = sm(seg(q, 0.16, 0.24)), fl = seg(q, 0.34, 0.42);
    if (ap > 0) {
      const bad = fl >= 0.5;
      const sx = fl > 0 && fl < 1 ? Math.abs(Math.cos(fl * Math.PI)) : 1;
      const wob = Math.sin(seg(q, 0.42, 0.52) * Math.PI * 5) * (1 - seg(q, 0.42, 0.52)) * 0.07;
      const col = bad ? red : green;
      cx.save();
      cx.globalAlpha = ap;
      cx.translate(0.2 * u + 2.4 * u, 0.3 * u + 0.75 * u);
      cx.rotate(-0.06 + wob);
      const k = 1 + (1 - ap) * 0.5;
      cx.scale(Math.max(0.02, sx) * k, k);
      cx.fillStyle = col; cx.globalAlpha = ap * 0.1; cx.beginPath(); cx.roundRect(-2.3 * u, -0.75 * u, 4.6 * u, 1.5 * u, 0.14 * u); cx.fill();
      cx.globalAlpha = ap; cx.strokeStyle = col; cx.lineWidth = Math.max(2, 0.09 * u); cx.stroke();
      cx.fillStyle = col; cx.textAlign = "center";
      cx.font = `600 ${0.5 * u}px ${MONO}`; cx.fillText("FORM F", 0, -0.04 * u);
      cx.font = `500 ${0.34 * u}px ${MONO}`; cx.fillText(lab(bad ? "cost.stamp.bad" : "cost.stamp.ok").toUpperCase(), 0, 0.46 * u);
      cx.restore();
    }
    cx.globalAlpha = 1;

    // the stack: three US$1,000 blocks of duty, then the US$570 of VAT
    const sx0 = 11.7 * u;
    falls.forEach((f, k) => {
      if (f.s <= 0) return;
      const slab = k === 3, th = slab ? 0.57 * u : 0.92 * u;
      const top = slab ? ground - 3 * u - 0.57 * u : ground - (k + 1) * u + 0.04 * u;
      const y0 = -(th + 0.6 * u);
      cx.fillStyle = red;
      cx.fillRect(sx0, y0 + (top - y0) * f.f - f.up, 0.92 * u, th);
    });

    // names, at the end
    const la = sm(seg(q, 0.88, 0.95));
    if (la > 0) {
      cx.globalAlpha = la; cx.textAlign = "left";
      const fn = Math.max(9, 0.27 * u), fv = Math.max(10, 0.32 * u);
      [[ground - 1.5 * u, "cost.duty", 3000], [ground - 3.285 * u, "cost.vat", 570]].forEach(([yc, key, val]) => {
        cx.fillStyle = line; cx.fillRect(sx0 + 1.05 * u, yc, 0.3 * u, 2);
        cx.fillStyle = cssv("--ink-2"); cx.font = `500 ${fn}px ${MONO}`; cx.fillText(lab(key).toUpperCase(), sx0 + 1.5 * u, yc - 0.08 * u);
        cx.fillStyle = red; cx.font = `500 ${fv}px ${MONO}`; cx.fillText(fmtMoney(val, lang), sx0 + 1.5 * u, yc + 0.32 * u);
      });
    }
    cx.restore();

    moneyEl.textContent = fmtMoney(Math.round(money), lang);
    numWrap.style.setProperty("--n", sm(seg(q, 0.42, 0.5)).toFixed(3));
    return money;
  }

  function costTick(y, vh) {
    const pin = wide.matches && !still;
    costSec.classList.toggle("pin", pin);
    let q = 1;
    if (!still) {
      if (pin) {
        const top = costSec.getBoundingClientRect().top + y;
        q = c01((y - top) / Math.max(1, costSec.offsetHeight - vh));
      } else {
        q = c01((vh * 0.9 - cv.getBoundingClientRect().top) / (vh * 0.8));
      }
    }
    drawCost(q);
  }
  document.fonts.ready.then(() => requestAnimationFrame(onScroll));
  let ticking = false;
  function onScroll() {
    ticking = false;
    costTick(scrollY, innerHeight);
    const y = scrollY, vh = innerHeight;
    top.classList.toggle("solid", y > intro.offsetHeight - 80);
    if (!still) {
      for (const r of rows) {
        const third = r.scrollWidth / 3;
        const off = (y * 0.35) % third;
        r.style.transform = `translate3d(${r.dataset.dir === "1" ? off - third : -off}px,0,0)`;
      }
      for (const c of cards) {
        const t = c.getBoundingClientRect().top / vh;
        c.style.setProperty("--in", Math.min(1, Math.max(0, (t - 0.5) / 0.5)).toFixed(3));
      }
    }
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);

  // Every value has its page: picking a document shows that page with the value outlined.
  const tabs = [...document.querySelectorAll(".src-row")];
  function showDoc(id, focus) {
    tabs.forEach((b) => { const on = b.dataset.doc === id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    document.querySelectorAll(".paper[data-page]").forEach((p) => { p.hidden = p.dataset.page !== id; });
  }
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => showDoc(b.dataset.doc));
    b.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      showDoc(tabs[(i + d + tabs.length) % tabs.length].dataset.doc, true);
    });
  });
  showDoc("pl");

  // Supplier message in three languages (the sample shipment's two fixes).
  const MSG = {
    zh: { greet: "您好！", intro: "我们核对了 BST-24117 这票货的单据。请修改以下内容。", a: "装箱单 · 毛重", b: "原产地证 · 货物描述", resend: "请发给我们以下单据：", c1: "装箱单（修改后）", c2: "原产地证（修改后）", close: "谢谢！" },
    es: { greet: "Estimados:", intro: "Revisamos los documentos del embarque BST-24117. Por favor corrijan estos puntos.", a: "Lista de empaque · Peso bruto", b: "Certificado de origen · Descripción de las mercancías", resend: "Por favor envíennos estos documentos:", c1: "Lista de empaque (corregida)", c2: "Certificado de origen (corregido)", close: "Muchas gracias." },
    en: { greet: "Hello,", intro: "We checked the documents of shipment BST-24117. Please correct these points.", a: "Packing list · Gross weight", b: "Certificate of origin · Description of goods", resend: "Please send us these documents:", c1: "Packing list (corrected)", c2: "Certificate of origin (corrected)", close: "Thank you." },
  };
  const FIX = { a: ["10,866.000 KGS", "8,655.000 KGS"], b: ["PLUSH TOYS / WOODEN PUZZLES", "PLUSH TOYS / WOODEN PUZZLES / KITES"] };
  const msgEl = document.getElementById("msg");
  const val = (p) => `<span class="v">${p[0]}</span> → <span class="v">${p[1]}</span>`;
  let msgLang = "zh";
  function setMsg(k) {
    msgLang = k;
    const m = MSG[k];
    msgEl.lang = k;
    msgEl.innerHTML = `<p>${m.greet}</p><p>${m.intro}</p><dl><dt>${m.a}</dt><dd>${val(FIX.a)}</dd><dt>${m.b}</dt><dd>${val(FIX.b)}</dd></dl><p>${m.resend}</p><ul><li>${m.c1}</li><li>${m.c2}</li></ul><p>${m.close}</p>`;
    document.querySelectorAll("[data-msg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.msg === k)));
  }
  document.querySelectorAll("[data-msg]").forEach((b) => b.addEventListener("click", () => setMsg(b.dataset.msg)));
  setMsg("zh");
  const copyBtn = document.getElementById("copy");
  copyBtn.addEventListener("click", async () => {
    const m = MSG[msgLang];
    const text = [m.greet, "", m.intro, "", `${m.a}: ${FIX.a[0]} → ${FIX.a[1]}`, `${m.b}: ${FIX.b[0]} → ${FIX.b[1]}`, "", m.resend, `- ${m.c1}`, `- ${m.c2}`, "", m.close].join("\n");
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = t("msg.copied"); setTimeout(() => { copyBtn.textContent = t("msg.copy"); }, 1600); } catch {}
  });

  // Waitlist
  const form = document.getElementById("waitlist");
  const done = document.getElementById("w-done");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const m = FORM_MSG[lang];
    const fields = ["email", "company", "role", "country"];
    let bad = null;
    for (const f of fields) {
      const el = form.elements[f];
      const empty = !el.value.trim();
      el.setAttribute("aria-invalid", String(empty));
      if (empty && !bad) bad = [el, m.missing];
    }
    const em = form.elements.email;
    if (!bad && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { em.setAttribute("aria-invalid", "true"); bad = [em, m.email]; }
    if (bad) { status.textContent = bad[1]; bad[0].focus(); return; }
    const body = new URLSearchParams();
    for (const f of fields) body.append(ENTRY[f], form.elements[f].value.trim());
    body.append(ENTRY.lang, lang);
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; status.textContent = "";
    try {
      await fetch(FORM, { method: "POST", mode: "no-cors", body });
      form.hidden = true; done.hidden = false;
    } catch {
      status.textContent = m.failed; btn.disabled = false;
    }
  });

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  let start = new URLSearchParams(location.search).get("lang");
  if (!start) { try { start = localStorage.getItem("despa-lang"); } catch {} }
  if (start === "es") setLang("es");
  onScroll();
})();
