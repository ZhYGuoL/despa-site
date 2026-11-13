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
    "h1": "Revisión de documentos de importación",
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
    "cost.h": "Lo que cuesta un certificado de origen con errores",
    "cost.without": "Arancel general, sin un Formulario F válido",
    "cost.with": "Con el Formulario F del TLC Chile–China, salvo la lista de exclusiones",
    "cost.per": "Por cada US$ 10.000 de valor CIF",
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
  }

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
})();
