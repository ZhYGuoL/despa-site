(() => {
  // Waitlist storage: a private Google Form owned by the founders. Each field maps to one entry id.
  const FORM = "https://docs.google.com/forms/d/e/1FAIpQLScLl2p1eQtDN6ABq2GCghfBfIN64JWRQ8a6cpSia-Xoj2YOMQ/formResponse";
  const ENTRY = { email: "entry.86999459", company: "entry.927487711", role: "entry.1571711619", country: "entry.49648867", lang: "entry.2002865028" };

  // Spanish lives in the HTML. English is here, keyed by data-t.
  const EN = {
    "nav.how": "How it works", "nav.rules": "What it checks", "nav.privacy": "Privacy", "nav.cta": "Waitlist",
    "hero.eyebrow": "China → Chile imports",
    "h1": "Import document checks",
    "lede": "Despa compares the invoice, packing list, bill of lading and certificate of origin of every shipment, with each other and with your rules. Then it writes each supplier what they need to fix.",
    "lede2": "It runs on your Mac. Your documents never leave your computer.",
    "cta": "Join the waitlist", "cta2": "See a value on its page",
    "fig1.cap": "Sample shipment BST-24117, made-up data",
    "app.profile": "Profile: Andes Juguetes SpA", "app.docs": "Documents", "app.check": "Check",
    "doc.invoice": "Commercial invoice", "doc.packing": "Packing list", "doc.bl": "Bill of lading", "doc.formf": "Certificate of origin",
    "p1": "1 page", "p2": "2 pages",
    "v.blocked": "BLOCKED", "v.counts": "Blocking: 1 · To fix: 2 · Minor: 1 · Check by hand: 2",
    "g.decide": "Needs your decision", "g.passed": "5 rules passed",
    "r1": "Consignee name and address", "r4": "Gross weight", "r6": "Description of goods", "r7": "Goods on the bill of lading", "r9": "Port of loading",
    "sev.block": "Blocking", "sev.fix": "To fix", "sev.minor": "Minor",
    "fail": "FAIL", "pass": "PASS", "hand": "CHECK BY HAND", "nf": "NOT FOUND",
    "r6.note": "Missing: KITES", "r4.note": "Differs from 8,655.000 KGS", "r1.note": "Missing: OF. 1204", "r7.note": "Does not name: KITES", "r9.none": "Not found in this document.",
    "cost.h": "What a certificate of origin with errors costs",
    "cost.without": "General duty, without a valid Form F",
    "cost.with": "With the Chile–China FTA Form F, except the exclusion list",
    "cost.per": "Per US$10,000 of CIF value",
    "cost.c1": "No FTA", "cost.c2": "With FTA", "cost.duty": "Duty", "cost.vat": "VAT 19%", "cost.total": "Total",
    "cost.note": "If the description or HS code on the Form F does not match the invoice, customs can deny the preference. Despa compares the Form F with the invoice before the shipment arrives.",
    "how.h": "How it works",
    "s1.t": "Add the documents", "s1.d": "Drop in the files of one shipment: PDF, Excel, Word or scans. A shipment can have several invoices and packing lists.",
    "s2.t": "Despa compares them", "s2.d": "Every value is compared across documents, with your company's rules and with the Chile–China FTA. What needs your decision comes first.",
    "s3.t": "Ask for the fix", "s3.d": "One message per supplier, in Chinese, Spanish or English, with each value to change and the documents to send again.",
    "page.h": "Every value has its page", "page.sub": "Pick a document to see where the value came from.",
    "page.ai": "When the AI model read a value from a scan, it is marked like this so you can compare it with the page.",
    "msg.h": "Message to the supplier", "msg.copy": "Copy", "msg.copied": "Copied",
    "m1.t": "In the supplier's language", "m1.d": "Chinese, Spanish or English. Each value comes with the document it is on and the right value.",
    "m2.t": "Versions", "m2.d": "When a corrected document arrives, Despa compares it with the one before and closes what was fixed.",
    "m3.t": "Supplier history", "m3.d": "Remembers the errors each supplier repeats.",
    "rules.h": "What it checks", "rules.sub": "Each importer sets their rules on one screen, with no code.",
    "rules.c1": "Rule", "rules.c2": "What it compares",
    "ru1.t": "Consignee", "ru1.d": "Name and address, against the text your company requires, on every document.",
    "ru2.t": "Shipper and notify party", "ru2.d": "That they match on the invoice, packing list and bill of lading.",
    "ru3.t": "Invoice number", "ru3.d": "The same number on every document that cites it.",
    "ru4.t": "Gross weight", "ru4.d": "The packing list total against the invoice and the bill of lading.",
    "ru5.t": "Goods", "ru5.d": "The description of each item on every document, including the Form F.",
    "ru6.t": "Ports and terms", "ru6.d": "Port of loading, trade terms, and freight on the bill of lading.",
    "ru7.t": "Amount in words", "ru7.d": "That the total written in words is the invoice total.",
    "ru8.t": "Form F", "ru8.d": "Issuer, HS codes against the invoice, validity and origin criterion under the Chile–China FTA.",
    "priv.h": "Where your documents stay", "priv.mac": "Your Mac",
    "priv.i1": "Shipment documents", "priv.i2": "Local AI model", "priv.i3": "Results and messages",
    "priv.big": "Despa runs on your Mac, with an AI model that runs on the same computer. Your documents never leave your computer.",
    "priv.d": "Scans are read there too. Whatever the model read is marked, so you decide how much to check by hand.",
    "wait.h": "Waitlist", "wait.d": "For importers, customs brokers and trading or sourcing offices. We will write to you when there is a spot for your company.",
    "w.email": "Email", "w.company": "Company", "w.role": "Role", "w.role.pick": "Pick one",
    "w.role.importer": "Importer", "w.role.broker": "Customs broker", "w.role.trading": "Trading or sourcing office", "w.role.other": "Other",
    "w.country": "Country", "w.submit": "Join", "w.ok": "DONE", "w.thanks": "We will write to you when there is a spot for your company.",
  };
  const BT_EN = { src: "build-time.en.json", heading: "Build time", "label-working": "Working time", "label-wall": "Start to finish", "label-agent": "Agent time" };
  const FORM_MSG = {
    es: { missing: "Complete todos los campos.", email: "Revise el correo.", failed: "No se pudo enviar. Intente de nuevo en un minuto." },
    en: { missing: "Fill in every field.", email: "Check the email address.", failed: "It did not go through. Try again in a minute." },
  };
  // Money in the cost ledger: Chile writes 2.014, English writes 2,014.
  const fmtMoney = (n, l) => "US$ " + n.toLocaleString(l === "en" ? "en-US" : "es-CL");

  const ES = {};
  document.querySelectorAll("[data-t]").forEach((el) => { if (!(el.dataset.t in ES)) ES[el.dataset.t] = el.textContent; });
  ES["msg.copied"] = "Copiado";
  const btEl = document.querySelector("build-time");
  const BT_ES = {};
  if (btEl) for (const k of Object.keys(BT_EN)) BT_ES[k] = btEl.getAttribute(k);

  const TITLE = { es: document.title, en: "Despa · Import document checks" };
  const status = document.getElementById("w-status");
  let lang = "es";
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
    if (next === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
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
  if (start === "en") setLang("en");
})();
