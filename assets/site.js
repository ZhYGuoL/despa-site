(() => {
  // Waitlist storage: a private Google Form owned by the founders. Each field maps to one entry id.
  const FORM = "https://docs.google.com/forms/d/e/1FAIpQLScLl2p1eQtDN6ABq2GCghfBfIN64JWRQ8a6cpSia-Xoj2YOMQ/formResponse";
  const ENTRY = { email: "entry.86999459", company: "entry.927487711", role: "entry.1571711619", country: "entry.49648867", lang: "entry.2002865028" };

  const EN = {
    "h1": "Import document checks",
    "lede": "Despa compares a shipment's documents with each other and with your rules, and writes each supplier what they need to fix.",
    "lede2": "It runs on your Mac. Your documents never leave your computer.",
    "cta": "Join the waitlist",
    "compare.h": "Across documents",
    "compare.rule": "Consignee name and address",
    "fail": "FAIL",
    "doc.invoice": "Commercial invoice",
    "doc.packing": "Packing list",
    "doc.bl": "Bill of lading",
    "doc.formf": "Certificate of origin (Form F)",
    "message.h": "Message to the supplier",
    "what.h": "What it does",
    "f1.t": "Shipment documents",
    "f1.d": "Invoice, packing list, bill of lading and certificate of origin, as PDF, Excel, Word or scans.",
    "f2.t": "Your rules",
    "f2.d": "Consignee, ports, price terms, freight on the BL. Each importer sets them on one screen, with no code.",
    "f3.t": "Chile–China FTA",
    "f3.d": "Checks the Form F: issuer, HS codes against the invoice, validity and origin criterion.",
    "f4.t": "One message per supplier",
    "f4.d": "In Chinese, Spanish or English, listing the corrected documents they need to send.",
    "f5.t": "Versions",
    "f5.d": "When a corrected document arrives, it is compared with the one before and fixed items close.",
    "f6.t": "Supplier history",
    "f6.d": "Remembers the errors each supplier repeats.",
    "f7.t": "Every value has its page",
    "f7.d": "One click opens the page of the document the value came from.",
    "wait.h": "Waitlist",
    "w.email": "Email",
    "w.company": "Company",
    "w.role": "Role",
    "w.role.pick": "Pick one",
    "w.role.importer": "Importer",
    "w.role.broker": "Customs broker",
    "w.role.trading": "Trading or sourcing office",
    "w.role.other": "Other",
    "w.country": "Country",
    "w.submit": "Join",
    "w.ok": "DONE",
    "w.thanks": "We will write to you when there is a spot for your company.",
  };
  const BT_EN = { src: "build-time.en.json", heading: "Build time", "label-working": "Working time", "label-wall": "Start to finish", "label-agent": "Agent time" };
  const MSG_EN = { missing: "Fill in every field.", email: "Check the email address.", failed: "It did not go through. Try again in a minute." };
  const MSG_ES = { missing: "Completa todos los campos.", email: "Revisa el correo.", failed: "No se pudo enviar. Intenta de nuevo en un minuto." };

  const ES = {};
  document.querySelectorAll("[data-t]").forEach((el) => { ES[el.dataset.t] = el.textContent; });
  const btEl = document.querySelector("build-time");
  const BT_ES = {};
  for (const k of Object.keys(BT_EN)) BT_ES[k] = btEl.getAttribute(k);

  const TITLE = { es: document.title, en: "Despa · Import document checks" };
  let lang = "es";

  function setLang(next) {
    lang = next;
    const dict = next === "en" ? EN : ES;
    document.documentElement.lang = next;
    document.title = TITLE[next];
    document.querySelectorAll("[data-t]").forEach((el) => { if (dict[el.dataset.t] != null) el.textContent = dict[el.dataset.t]; });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === next)));
    const bt = next === "en" ? BT_EN : BT_ES;
    for (const [k, v] of Object.entries(bt)) btEl.setAttribute(k, v);
    if (btEl.connectedCallback && btEl.shadowRoot) btEl.connectedCallback();
    try { localStorage.setItem("despa-lang", next); } catch {}
    const u = new URL(location.href);
    if (next === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
    history.replaceState(null, "", u);
    status.textContent = "";
  }

  // supplier message in three languages
  const MSG = {
    zh: { greet: "您好！", intro: "我们核对了这票货的单据。请修改以下内容。", inv: "商业发票 · 收货人", pl: "装箱单 · 收货人", resend: "请发给我们以下单据：", c1: "商业发票（修改后）", c2: "装箱单（修改后）", close: "谢谢！" },
    es: { greet: "Estimados:", intro: "Revisamos los documentos de este embarque. Por favor corrijan estos puntos.", inv: "Factura comercial · Consignatario", pl: "Lista de empaque · Consignatario", resend: "Por favor envíennos estos documentos:", c1: "Factura comercial (versión corregida)", c2: "Lista de empaque (versión corregida)", close: "Muchas gracias." },
    en: { greet: "Hello,", intro: "We checked the documents of this shipment. Please correct these points.", inv: "Commercial invoice · Consignee", pl: "Packing list · Consignee", resend: "Please send us these documents:", c1: "Commercial invoice (corrected)", c2: "Packing list (corrected)", close: "Thank you." },
  };
  const msgEl = document.getElementById("msg");
  const val = (a, b) => `<span class="v">${a}</span> → <span class="v">${b}</span>`;
  function setMsg(k) {
    const m = MSG[k];
    msgEl.lang = k;
    msgEl.innerHTML = `<p>${m.greet}</p><p>${m.intro}</p><dl><dt>${m.inv}</dt><dd>${val("MANZANA 3 GALPON", "MANZANA 3 GALPON 4")}</dd><dt>${m.pl}</dt><dd>${val("MANZANA 3 GALPON", "MANZANA 3 GALPON 4")}</dd></dl><p>${m.resend}</p><ul><li>${m.c1}</li><li>${m.c2}</li></ul><p>${m.close}</p>`;
    document.querySelectorAll("[data-msg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.msg === k)));
  }
  document.querySelectorAll("[data-msg]").forEach((b) => b.addEventListener("click", () => setMsg(b.dataset.msg)));

  // waitlist
  const form = document.getElementById("waitlist");
  const status = document.getElementById("w-status");
  const done = document.getElementById("w-done");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const t = lang === "en" ? MSG_EN : MSG_ES;
    const fields = ["email", "company", "role", "country"];
    let bad = null;
    for (const f of fields) {
      const el = form.elements[f];
      const empty = !el.value.trim();
      el.setAttribute("aria-invalid", String(empty));
      if (empty && !bad) bad = [el, t.missing];
    }
    const em = form.elements.email;
    if (!bad && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { em.setAttribute("aria-invalid", "true"); bad = [em, t.email]; }
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
      status.textContent = t.failed; btn.disabled = false;
    }
  });

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  let start = new URLSearchParams(location.search).get("lang");
  if (!start) { try { start = localStorage.getItem("despa-lang"); } catch {} }
  if (start === "en") setLang("en");
})();
