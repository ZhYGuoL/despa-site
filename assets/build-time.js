// <build-time src="/build-time.json"></build-time>
// Renders the output of conductor/scripts/buildtime.py: total working time, start to finish,
// agent time, and one row per section on a shared timeline. No dependencies, no animation.
// Inherits the page's font and colour. Override with CSS on the element:
//   --bt-mono (numbers font), --bt-ink (bars), --bt-line (hairlines), --bt-muted (labels).
// Split form (data.form == "split", from scripts/brieftime.py): one row per feature with a bar of what
// its agent time went to (model, checks, other tools, waiting) and its tasks as expandable child rows.
// The split form draws as a timeline by default: features on one time axis (long idle stretches squeezed
// into a short marker), drag or scroll sideways, pinch or Cmd/Ctrl-scroll to zoom, click a feature to zoom
// to it and open its tasks, click a task for its numbers. view="list" on the element keeps the old list.
// Static pages can inline the data instead of src:
//   <build-time><script type="application/json">{...}</script></build-time>

(() => {
  const css = `
  :host { display: block; color: inherit; font: inherit;
    --mono: var(--bt-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace);
    --ink: var(--bt-ink, currentColor);
    --line: var(--bt-line, color-mix(in srgb, currentColor 12%, transparent));
    --muted: var(--bt-muted, color-mix(in srgb, currentColor 55%, transparent)); }
  .wrap { border-top: 1px solid var(--line); padding-top: 20px; } .wrap.bare { border-top: 0; padding-top: 0; }
  h2 { font-size: 1em; font-weight: 600; margin: 0 0 16px; }
  .stats { display: flex; flex-wrap: wrap; gap: 8px 40px; margin: 0 0 24px; }
  .stat dt { color: var(--muted); font-size: .8125em; margin-bottom: 2px; }
  .stat dd { margin: 0; font-family: var(--mono); font-size: 1.5em; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
  ol { list-style: none; margin: 0; padding: 0; }
  li, .row { display: grid; grid-template-columns: minmax(9em, 14em) 1fr 4.5em; align-items: center; gap: 16px;
    padding: 7px 0; border-bottom: 1px solid var(--line); font-size: .875em; }
  .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .track { position: relative; height: 8px; }
  .track::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--line); }
  .span { position: absolute; top: 0; bottom: 0; background: var(--ink); border-radius: 1px; min-width: 2px; }
  .t { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; }
  .axis { display: grid; grid-template-columns: minmax(9em, 14em) 1fr 4.5em; gap: 16px; margin-top: 8px; font-size: .875em; }
  .axis .ends { display: flex; justify-content: space-between; color: var(--muted); font-family: var(--mono); font-size: .857em; }
  .wrap.split .row { grid-template-columns: minmax(12em, 22em) 1fr 5em; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 0 0 12px; color: var(--muted); font-size: .8125em; }
  .legend i { display: inline-block; width: 10px; height: 8px; margin-right: 6px; vertical-align: 0; border-radius: 1px; }
  .bar { display: flex; height: 8px; gap: 1px; }
  .bar b { display: block; height: 100%; border-radius: 1px; min-width: 0; }
  .k-model { background: var(--ink); } .k-checks { background: color-mix(in srgb, var(--ink) 55%, transparent); }
  .k-tools { background: color-mix(in srgb, var(--ink) 28%, transparent); } .k-waiting { background: transparent; box-shadow: inset 0 0 0 1px var(--line); }
  details > summary { list-style: none; cursor: pointer; } details > summary::-webkit-details-marker { display: none; }
  .name .caret { display: inline-block; width: 1em; color: var(--muted); }
  details[open] .caret { transform: rotate(90deg); }
  .sub .row { font-size: .8125em; } .sub .name { padding-left: 1.5em; color: var(--muted); }
  .t small { display: block; color: var(--muted); font-size: .8em; }
  .tl .ttl { display: flex; align-items: baseline; gap: 12px; min-height: 22px; margin: 0 0 14px; }
  .tl .ttl b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tl .ttl .up { color: var(--muted); font-weight: 400; }
  .tl .ttl .when { color: var(--muted); font-family: var(--mono); font-size: .846em; white-space: nowrap; }
  .tl .ttl .x { margin-left: auto; }
  .tl .stats { margin-bottom: 18px; }
  .tl .stat dd.w { font-family: inherit; font-size: 1.15em; letter-spacing: 0; line-height: 1.75; }
  .tl .sbar { display: flex; height: 8px; gap: 1px; margin: 0 0 10px; }
  .tl .sbar b { display: block; height: 100%; border-radius: 1px; }
  .tl .slegend { display: flex; flex-wrap: wrap; gap: 6px 22px; color: var(--muted); font-size: .8125em; }
  .tl .slegend i { display: inline-block; width: 10px; height: 8px; margin-right: 6px; border-radius: 1px; }
  .tl .slegend span b { font-family: var(--mono); font-weight: 400; color: var(--ink); margin-left: 6px; }
  .tl .ctrl { display: flex; align-items: center; gap: 6px; margin: 24px 0 10px; }
  .tl .ctrl .grow { flex: 1; }
  .tl button.b { background: transparent; border: 1px solid color-mix(in srgb, currentColor 18%, transparent); border-radius: 6px;
    padding: 3px 10px; font: inherit; font-size: .923em; color: inherit; cursor: pointer; line-height: 1.5; }
  .tl button.b:hover { background: color-mix(in srgb, currentColor 5%, transparent); }
  .tl button.b:disabled { opacity: .4; cursor: default; background: transparent; }
  .tl button.b.ic { font-family: var(--mono); min-width: 2.2em; padding: 3px 6px; }
  .tl .chart { display: grid; grid-template-columns: minmax(10em, 17em) 1fr; border-top: 1px solid var(--line); outline: none; }
  .tl .labels { border-right: 1px solid var(--line); min-width: 0; }
  .tl .pane { overflow-x: auto; overflow-y: hidden; cursor: grab; min-width: 0; scrollbar-width: thin; }
  .tl .pane.drag { cursor: grabbing; user-select: none; }
  .tl .cv { position: relative; }
  .tl .hd, .tl .lh { height: 40px; position: relative; border-bottom: 1px solid var(--line); }
  .tl .bd { position: relative; }
  .tl .r { height: 32px; position: relative; border-bottom: 1px solid var(--line); cursor: pointer; }
  .tl .r.tk { height: 24px; border-bottom: 0; background: color-mix(in srgb, currentColor 2.5%, transparent); }
  .tl .r.tk.last { border-bottom: 1px solid var(--line); height: 25px; }
  .tl .labels .r { display: flex; align-items: center; gap: 6px; padding-right: 12px; font-size: .875em; }
  .tl .labels .r.tk { font-size: .8125em; padding-left: 1.6em; color: var(--muted); }
  .tl .labels .r:hover .nm { text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 3px; }
  .tl .labels .r.sel { font-weight: 600; } .tl .labels .r.tk.sel { color: var(--ink); font-weight: 500; }
  .tl .labels .r.dim { color: var(--muted); }
  .tl .caret { width: 1em; flex: none; color: var(--muted); text-align: center; }
  .tl .r[aria-expanded="true"] .caret { transform: rotate(90deg); }
  .tl .nm { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tl .tm { font-family: var(--mono); font-variant-numeric: tabular-nums; font-weight: 400; font-size: .923em; white-space: nowrap; }
  .tl .env { position: absolute; top: 50%; height: 1px; background: color-mix(in srgb, var(--ink) 30%, transparent); }
  .tl .fill { position: absolute; top: 11px; height: 10px; background: var(--ink); border-radius: 2px; }
  .tl .tb { position: absolute; top: 8px; height: 8px; background: var(--ink); border-radius: 2px; }
  .tl .tb.lead { background: transparent; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 45%, transparent); }
  .tl .tb.sel { box-shadow: 0 0 0 2px var(--bt-plate, #fff), 0 0 0 3px var(--ink); }
  .tl .tb.lead.sel { box-shadow: inset 0 0 0 1px var(--ink), 0 0 0 2px var(--bt-plate, #fff), 0 0 0 3px var(--ink); }
  .tl .r.dim .fill, .tl .r.dim .env, .tl .r.dim .tb { opacity: .25; }
  .tl .gap { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(135deg, var(--line) 0 1px, transparent 1px 6px); }
  .tl .gx { position: absolute; top: 0; height: 100%; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: .77em; color: var(--muted); background: var(--bt-plate, #fff); }
  .tl .mid { position: absolute; top: 0; bottom: 0; width: 1px; background: color-mix(in srgb, currentColor 14%, transparent); }
  .tl .hr { position: absolute; top: 0; bottom: 0; width: 1px; background: color-mix(in srgb, currentColor 5%, transparent); }
  .tl .dl, .tl .hl { position: absolute; white-space: nowrap; font-family: var(--mono); font-variant-numeric: tabular-nums; padding-left: 5px; }
  .tl .dl { top: 4px; font-size: .846em; }
  .tl .dl.pin { background: var(--bt-plate, #fff); padding-right: 8px; z-index: 1; } .tl .hl { top: 21px; font-size: .77em; color: var(--muted); }
  .tl .dl::before, .tl .hl::before { content: ""; position: absolute; left: 0; width: 1px; background: color-mix(in srgb, currentColor 14%, transparent); }
  .tl .dl::before { top: -4px; height: 40px; } .tl .hl::before { top: 6px; height: 13px; }
  @media (max-width: 560px) {
    .tl .chart { grid-template-columns: 9em 1fr; } .tl .labels .tm { display: none; }
    li { grid-template-columns: 1fr 4.5em; row-gap: 6px; }
    .track, .bar { grid-column: 1 / -1; grid-row: 2; }
    .axis { grid-template-columns: 1fr; } .axis > :first-child, .axis > :last-child { display: none; }
  }`;

  const hm = (m) => {
    m = Math.round(m);
    return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`;
  };
  const clock = (iso) => new Date(iso).toLocaleTimeString(document.documentElement.lang || [], { hour: "numeric", minute: "2-digit" });
  const day = (iso) => new Date(iso).toLocaleDateString(document.documentElement.lang || [], { month: "short", day: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  class BuildTime extends HTMLElement {
    async connectedCallback() {
      const root = this.shadowRoot || this.attachShadow({ mode: "open" });
      let data;
      try {
        const inline = this.querySelector('script[type="application/json"]');
        data = inline ? JSON.parse(inline.textContent) : await (await fetch(this.getAttribute("src") || "/build-time.json", { cache: "no-store" })).json();
      } catch { root.innerHTML = ""; return; }
      if (data.form === "split") {
        if (this.getAttribute("view") === "list") { root.innerHTML = `<style>${css}</style>` + this.split(data); return; }
        this.timeline(root, data); return;
      }
      const wall = Math.max(data.wallMinutes, 1);
      const rows = (data.sections || []).map((s) => `
        <li><span class="name" title="${esc(s.name)}">${esc(s.name)}</span>
          <span class="track" aria-hidden="true">${(s.spans || []).map(([a, b]) =>
            `<span class="span" style="left:${(a / wall) * 100}%;width:${((b - a) / wall) * 100}%"></span>`).join("")}</span>
          <span class="t">${hm(s.activeMinutes)}</span></li>`).join("");
      const sameDay = day(data.start) === day(data.end);
      root.innerHTML = `<style>${css}</style>
        <section class="wrap" aria-label="Build time">
          <h2>${esc(this.getAttribute("heading") || "Build time")}</h2>
          <dl class="stats">
            <div class="stat"><dt>${esc(this.getAttribute("label-working") || "Working time")}</dt><dd>${hm(data.activeMinutes)}</dd></div>
            <div class="stat"><dt>${esc(this.getAttribute("label-wall") || "Start to finish")}</dt><dd>${hm(data.wallMinutes)}</dd></div>
            <div class="stat"><dt>${esc(this.getAttribute("label-agent") || "Agent time")}</dt><dd>${hm(data.agentMinutes)}</dd></div>
          </dl>
          <ol>${rows}</ol>
          <div class="axis"><span></span>
            <span class="ends"><span>${day(data.start)} ${clock(data.start)}</span><span>${sameDay ? "" : day(data.end) + " "}${clock(data.end)}</span></span>
            <span></span></div>
        </section>`;
    }
    split(data) {
      const keys = [["model", "Model thinking"], ["checks", "Checks and tests"], ["tools", "Other tools"], ["waiting", "Waiting"]];
      const all = (data.sections || []);
      const max = Math.max(1, ...all.map((f) => keys.reduce((n, [k]) => n + (f.split[k] || 0), 0)));
      const bar = (sp, scale) => `<span class="bar" aria-hidden="true">${keys.map(([k]) =>
        `<b class="k-${k}" style="width:${((sp[k] || 0) / scale) * 100}%"></b>`).join("")}</span>`;
      const title = (sp) => keys.map(([k, l]) => `${l} ${hm(sp[k] || 0)}`).join(", ");
      const rows = all.map((f) => {
        const tmax = Math.max(1, ...(f.tasks || []).map((t) => keys.reduce((n, [k]) => n + (t.split[k] || 0), 0)));
        const kids = (f.tasks || []).map((t) => `<div class="row"><span class="name" title="${esc(t.name)}">${esc(t.name)}</span>
            <span title="${esc(title(t.split))}">${bar(t.split, tmax)}</span><span class="t">${hm(t.minutes)}</span></div>`).join("");
        return `<details><summary class="row"><span class="name" title="${esc(f.name)}"><span class="caret">›</span>${esc(f.name)}</span>
            <span title="${esc(title(f.split))}">${bar(f.split, max)}</span>
            <span class="t">${hm(f.activeMinutes)}<small>${day(f.start)}</small></span></summary><div class="sub">${kids}</div></details>`;
      }).join("");
      const sp = data.split || {};
      return `<section class="wrap split${this.getAttribute("heading") === "" ? " bare" : ""}" aria-label="Build time">
          ${this.getAttribute("heading") === "" ? "" : `<h2>${esc(this.getAttribute("heading") || "Build time")}</h2>`}
          <dl class="stats">
            <div class="stat"><dt>Working time</dt><dd>${hm(data.activeMinutes)}</dd></div>
            <div class="stat"><dt>Agent time</dt><dd>${hm(data.agentMinutes)}</dd></div>
            <div class="stat"><dt>Model thinking</dt><dd>${hm(sp.model || 0)}</dd></div>
            <div class="stat"><dt>Checks and tests</dt><dd>${hm(sp.checks || 0)}</dd></div>
          </dl>
          <div class="legend">${keys.map(([k, l]) => `<span><i class="k-${k}"></i>${l}</span>`).join("")}</div>
          <div>${rows}</div></section>`;
    }
    timeline(root, data) {
      const GAP = 120, GAPPX = 46, PAD = 14, MERGE = 10, ZMAX = 16, STEPS = [10, 15, 30, 60, 120, 180, 360, 720];
      const KEYS = [["model", "Model thinking"], ["checks", "Checks and tests"], ["tools", "Other tools"], ["waiting", "Waiting"]];
      const KIND = { "feature-builder": "Builder", "feature-builder-high": "Builder, high effort", "truth-reviewer": "Reviewer",
        "eval-runner": "Live eval", "note-fixer": "Note fixer", lead: "Lead", "doc-verifier": "Doc check", Explore: "Explorer", "general-purpose": "Helper" };
      const M = (iso) => Date.parse(iso) / 60000, D = (m) => new Date(m * 60000);
      const dayM = (m) => D(m).toLocaleDateString([], { month: "short", day: "numeric" });
      const clk = (m) => D(m).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const hr = (m) => D(m).getMinutes() ? clk(m) : D(m).toLocaleTimeString([], { hour: "numeric" });
      const lmod = (m) => { const d = D(m); return d.getHours() * 60 + d.getMinutes(); };
      const range = (a, b) => dayM(a) === dayM(b) ? `${dayM(a)}, ${clk(a)} to ${clk(b)}` : `${dayM(a)}, ${clk(a)} to ${dayM(b)}, ${clk(b)}`;
      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      const merge = (ivs, tol) => {
        const out = [];
        for (const v of ivs.filter((v) => v[1] >= v[0]).sort((p, q) => p[0] - q[0])) {
          const l = out[out.length - 1];
          if (l && v[0] - l[1] <= tol) l[1] = Math.max(l[1], v[1]); else out.push([v[0], v[1]]);
        }
        return out;
      };
      const feats = (data.sections || []).map((f) => {
        const a = M(f.start), b = M(f.end);
        const tasks = (f.tasks || []).map((t) => ({ ...t, a: M(t.start), b: M(t.start) + Math.max(0, t.minutes || 0) }))
          .sort((p, q) => p.a - q.a || q.b - p.b);
        // the feature's own bar stays inside its start and end (a lead session can open earlier, its task row shows that)
        const on = merge(tasks.map((t) => [Math.max(a, t.a), Math.min(b, t.b)]), MERGE);
        return { ...f, a, b, tasks, lo: a, hi: b, on: on.length ? on : [[a, b]] };
      }).sort((p, q) => p.lo - q.lo);
      if (!feats.length) { root.innerHTML = ""; return; }
      const segs = merge(feats.flatMap((f) => f.on.concat(f.tasks.map((t) => [t.a, t.b]))), GAP).map(([a, b]) => ({ a, b }));
      const activeLen = segs.reduce((n, s) => n + s.b - s.a, 0);
      const st = { k: 1, fit: true, sel: null, task: null };
      let gaps = [], W = 0;

      const bare = this.getAttribute("heading") === "";
      root.innerHTML = `<style>${css}</style><section class="wrap split tl${bare ? " bare" : ""}" aria-label="Build time">
        ${bare ? "" : `<h2>${esc(this.getAttribute("heading") || "Build time")}</h2>`}
        <div class="head"></div>
        <div class="ctrl"><button class="b" data-go="-1">‹ Earlier</button><button class="b" data-go="1">Later ›</button><span class="grow"></span>
          <button class="b ic" data-z="out" aria-label="Zoom out">−</button><button class="b ic" data-z="in" aria-label="Zoom in">+</button>
          <button class="b" data-z="fit">Fit all</button></div>
        <div class="chart" tabindex="0" aria-label="Timeline of features"><div class="labels"></div><div class="pane"><div class="cv"></div></div></div>
      </section>`;
      const $ = (q) => root.querySelector(q), head = $(".head"), labels = $(".labels"), pane = $(".pane"), cv = $(".cv");

      const layout = () => {
        let x = PAD; gaps = [];
        segs.forEach((s, i) => { s.x = x; x += (s.b - s.a) * st.k; if (i < segs.length - 1) { gaps.push({ a: s.b, b: segs[i + 1].a, x }); x += GAPPX; } });
        W = x + PAD;
      };
      const X = (t) => {
        if (t <= segs[0].a) return segs[0].x;
        for (let i = 0; i < segs.length; i++) {
          const s = segs[i], g = gaps[i];
          if (t <= s.b) return s.x + (t - s.a) * st.k;
          if (g && t < g.b) return g.x + ((t - g.a) / (g.b - g.a)) * GAPPX;
        }
        const s = segs[segs.length - 1]; return s.x + (s.b - s.a) * st.k;
      };
      const T = (x) => {
        for (let i = 0; i < segs.length; i++) {
          const s = segs[i], g = gaps[i];
          if (x <= s.x + (s.b - s.a) * st.k) return s.a + Math.max(0, x - s.x) / st.k;
          if (g && x < g.x + GAPPX) return g.a + ((x - g.x) / GAPPX) * (g.b - g.a);
        }
        return segs[segs.length - 1].b;
      };
      const paneW = () => pane.clientWidth || 700;
      const kFit = () => Math.max(0.005, (paneW() - 2 * PAD - (segs.length - 1) * GAPPX) / activeLen);
      const gapLabel = (m) => m >= 1440 ? `${Math.round(m / 1440)}d` : `${Math.round(m / 60)}h`;
      const splitBar = (sp) => {
        const tot = Math.max(1e-9, KEYS.reduce((n, [k]) => n + (sp[k] || 0), 0));
        return `<div class="sbar" aria-hidden="true">${KEYS.map(([k]) => `<b class="k-${k}" style="width:${((sp[k] || 0) / tot) * 100}%"></b>`).join("")}</div>
          <div class="slegend">${KEYS.map(([k, l]) => `<span><i class="k-${k}"></i>${l}<b>${hm(sp[k] || 0)}</b></span>`).join("")}</div>`;
      };
      const stat = (dt, dd, w) => `<div class="stat"><dt>${dt}</dt><dd${w ? ' class="w"' : ""}>${dd}</dd></div>`;

      const drawHead = () => {
        const f = st.sel != null ? feats[st.sel] : null, t = f && st.task != null ? f.tasks[st.task] : null;
        let title, when, stats, sp;
        if (t) {
          title = `<b><span class="up">${esc(f.name)} ›</span> ${esc(t.name)}</b>`; when = range(t.a, t.b);
          stats = stat("Time", hm(t.minutes)) + stat("Started", clk(t.a)) + stat("Kind", esc(KIND[t.type] || t.type), true); sp = t.split || {};
        } else if (f) {
          title = `<b>${esc(f.name)}</b>`; when = range(f.a, f.b);
          stats = stat("Working time", hm(f.activeMinutes)) + stat("Start to finish", hm(f.wallMinutes)) + stat("Agent time", hm(f.agentMinutes)) + stat("Tasks", f.tasks.length);
          sp = f.split || {};
        } else {
          title = `<b>All features</b>`; when = range(feats[0].lo, Math.max(...feats.map((f) => f.hi)));
          stats = stat("Working time", hm(data.activeMinutes)) + stat("Agent time", hm(data.agentMinutes)) + stat("Features", feats.length)
            + stat("Tasks", feats.reduce((n, f) => n + f.tasks.length, 0));
          sp = data.split || {};
        }
        head.innerHTML = `<div class="ttl">${title}<span class="when">${when}</span>${f ? `<button class="b x" data-back aria-label="Back to all features">${t ? "Back to feature" : "All features"}</button>` : ""}</div>
          <dl class="stats">${stats}</dl>${splitBar(sp)}`;
        root.querySelector('[data-go="-1"]').disabled = st.sel === 0;
        root.querySelector('[data-go="1"]').disabled = st.sel === feats.length - 1;
      };

      const drawChart = () => {
        layout();
        const rows = [];
        feats.forEach((f, i) => { rows.push({ f, i }); if (st.sel === i) f.tasks.forEach((t, j) => rows.push({ f, i, t, j, last: j === f.tasks.length - 1 })); });
        labels.innerHTML = `<div class="lh"></div>` + rows.map(({ f, i, t, j, last }) => t
          ? `<div class="r tk${last ? " last" : ""}${st.task === j ? " sel" : ""}" data-i="${i}" data-j="${j}"><span class="nm">${esc(t.name)}</span><span class="tm">${hm(t.minutes)}</span></div>`
          : `<div class="r f${st.sel === i ? " sel" : st.sel != null ? " dim" : ""}" data-i="${i}" role="button" aria-expanded="${st.sel === i}"><span class="caret">›</span><span class="nm">${esc(f.name)}</span><span class="tm">${hm(f.activeMinutes)}</span></div>`).join("");
        // axis: day labels, hour ticks, squeezed gaps
        const step = STEPS.find((s) => s * st.k >= 58);
        const days = [], hours = [], mids = [];
        segs.forEach((s) => {
          days.push({ x: X(s.a), t: s.a });
          for (let m = s.a + ((1440 - lmod(s.a)) % 1440); m <= s.b; m += 1440) { mids.push(X(m)); days.push({ x: X(m), t: m, mid: true }); }
          if (step) for (let m = s.a + ((step - (lmod(s.a) % step)) % step); m <= s.b; m += step) if (lmod(m) !== 0) hours.push({ x: X(m), t: m });
        });
        const thin = (list, gap) => { let last = -1e9; return list.sort((p, q) => p.x - q.x).filter((d) => d.x - last >= gap ? ((last = d.x), true) : false); };
        const clear = (x, w) => x + w <= W - PAD + 4 && !gaps.some((g) => x < g.x + GAPPX && x + w > g.x);
        let prevDay = "";
        const dayL = thin(days.filter((d, n, all) => !(d.mid === undefined && all.some((o) => o.mid && Math.abs(o.x - d.x) < 1))), 70)
          .filter((d) => { const k = dayM(d.t); if (k === prevDay || !clear(d.x, 52)) return false; prevDay = k; return true; });
        const hourL = thin(hours.filter((h) => clear(h.x, 44) && !dayL.some((d) => h.x >= d.x - 46 && h.x < d.x + 4)), 46);
        const lines = gaps.map((g) => `<span class="gap" style="left:${g.x}px;width:${GAPPX}px"></span>`).join("")
          + mids.map((x) => `<span class="mid" style="left:${x}px"></span>`).join("")
          + hours.map((h) => `<span class="hr" style="left:${h.x}px"></span>`).join("");
        const bars = rows.map(({ f, i, t, j, last }) => {
          if (t) {
            const a = X(t.a), w = Math.max(2, X(t.b) - a);
            return `<div class="r tk${last ? " last" : ""}${st.task != null && st.task !== j ? " dim" : ""}" data-i="${i}" data-j="${j}"><span class="tb${t.type === "lead" ? " lead" : ""}${st.task === j ? " sel" : ""}" style="left:${a}px;width:${w}px"></span></div>`;
          }
          const lo = X(f.lo);
          return `<div class="r f${st.sel != null && st.sel !== i ? " dim" : ""}" data-i="${i}"><span class="env" style="left:${lo}px;width:${Math.max(1, X(f.hi) - lo)}px"></span>${f.on.map(([a, b]) =>
            `<span class="fill" style="left:${X(a)}px;width:${Math.max(3, X(b) - X(a))}px"></span>`).join("")}</div>`;
        }).join("");
        cv.style.width = `${W}px`;
        cv.innerHTML = `<div class="hd">${gaps.map((g) => `<span class="gap" style="left:${g.x}px;width:${GAPPX}px"></span><span class="gx" style="left:${g.x + 4}px;width:${GAPPX - 8}px;height:18px;top:4px">${gapLabel(g.b - g.a)}</span>`).join("")}
            ${dayL.map((d) => `<span class="dl" data-x="${d.x}" style="left:${d.x}px">${dayM(d.t)}</span>`).join("")}<span class="dl pin" hidden></span>
            ${hourL.map((h) => `<span class="hl" style="left:${h.x}px">${hr(h.t)}</span>`).join("")}</div>
          <div class="bd">${lines}${bars}</div>`;
        root.querySelector('[data-z="fit"]').disabled = st.fit;
        dayL.xs = dayL.map((d) => d.x); pin.labels = dayL; pinDay();
      };
      // the day of the left edge stays in view while the axis scrolls
      const pin = { labels: [] };
      const pinDay = () => {
        const el = cv.querySelector(".dl.pin"); if (!el) return;
        const left = pane.scrollLeft, near = pin.labels.some((d) => d.x >= left - 2 && d.x < left + 80);
        el.hidden = near || left < 4;
        if (!el.hidden) { el.style.left = `${left}px`; el.textContent = dayM(T(left + PAD)); }
      };
      pane.addEventListener("scroll", pinDay, { passive: true });

      const zoomAt = (k, px) => {
        const t = T(pane.scrollLeft + px);
        st.k = clamp(k, kFit(), ZMAX); st.fit = st.k <= kFit() + 1e-9;
        drawChart(); pane.scrollLeft = X(t) - px;
      };
      const focus = (lo, hi) => {
        const w = paneW(), inside = segs.reduce((n, s) => n + Math.max(0, Math.min(hi, s.b) - Math.max(lo, s.a)), 0);
        const ng = gaps.filter((g) => g.a >= lo && g.b <= hi).length;
        st.k = clamp((w * 0.86 - ng * GAPPX) / Math.max(inside, 1), kFit(), ZMAX); st.fit = st.k <= kFit() + 1e-9;
        drawChart();
        const x0 = X(lo), x1 = X(hi); pane.scrollLeft = x0 - (w - (x1 - x0)) / 2;
      };
      const select = (i, j) => {
        if (j == null) {
          if (st.sel === i && st.task == null) { st.sel = null; drawHead(); drawChart(); return; }
          const again = st.sel === i; st.sel = i; st.task = null; drawHead();
          if (again) drawChart(); else focus(feats[i].lo, feats[i].hi);
        } else {
          st.task = st.task === j ? null : j; drawHead(); drawChart();
          const t = feats[i].tasks[j], a = X(t.a), b = X(t.b), w = paneW();
          if (a < pane.scrollLeft || b > pane.scrollLeft + w) pane.scrollLeft = (a + b) / 2 - w / 2;
        }
      };
      const go = (d) => select(st.sel == null ? (d > 0 ? 0 : feats.length - 1) : clamp(st.sel + d, 0, feats.length - 1));
      const back = () => { if (st.task != null) { st.task = null; drawHead(); drawChart(); } else if (st.sel != null) { st.sel = null; drawHead(); drawChart(); } };
      const pick = (el) => { const r = el.closest(".r[data-i]"); if (r) select(+r.dataset.i, r.dataset.j == null ? null : +r.dataset.j); };

      root.querySelector(".tl").addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.hasAttribute("data-back")) back();
        else if (b.dataset.go) go(+b.dataset.go);
        else if (b.dataset.z === "fit") { st.k = kFit(); st.fit = true; drawChart(); pane.scrollLeft = 0; }
        else if (b.dataset.z) zoomAt(st.k * (b.dataset.z === "in" ? 1.6 : 1 / 1.6), paneW() / 2);
      });
      labels.addEventListener("click", (e) => pick(e.target));
      let drag = null, moved = false;
      pane.addEventListener("pointerdown", (e) => { if (e.button === 0 && e.pointerType === "mouse") { drag = { x: e.clientX, s: pane.scrollLeft }; moved = false; } });
      pane.addEventListener("pointermove", (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!moved && Math.abs(dx) > 4) { moved = true; pane.classList.add("drag"); pane.setPointerCapture(e.pointerId); }
        if (moved) pane.scrollLeft = drag.s - dx;
      });
      const end = () => { drag = null; pane.classList.remove("drag"); };
      pane.addEventListener("pointerup", end); pane.addEventListener("pointercancel", end);
      pane.addEventListener("click", (e) => { if (moved) { moved = false; return; } pick(e.target); });
      pane.addEventListener("wheel", (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault(); zoomAt(st.k * Math.exp(-e.deltaY * 0.01), e.clientX - pane.getBoundingClientRect().left);
      }, { passive: false });
      $(".chart").addEventListener("keydown", (e) => {
        const k = { ArrowLeft: () => go(-1), ArrowRight: () => go(1), Escape: back, "+": () => zoomAt(st.k * 1.6, paneW() / 2), "=": () => zoomAt(st.k * 1.6, paneW() / 2),
          "-": () => zoomAt(st.k / 1.6, paneW() / 2), 0: () => { st.k = kFit(); st.fit = true; drawChart(); } }[e.key];
        if (k) { e.preventDefault(); k(); }
      });
      new ResizeObserver(() => { if (st.fit) { st.k = kFit(); drawChart(); } }).observe(pane);
      st.k = kFit(); drawHead(); drawChart();
    }
  }
  if (!customElements.get("build-time")) customElements.define("build-time", BuildTime);
})();
