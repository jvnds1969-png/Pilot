// Zorgstart — export zorgplan (demo)
// Werkt met de huidige mock-structuur in case.html

function safeText(el, fallback = "") {
  return (el && (el.value ?? el.textContent ?? "").toString().trim()) || fallback;
}

function gatherZorgplan() {
  const patient = safeText(document.querySelector('#intake input[value]'), "Onbekende patiënt");
  const postcode = safeText(document.querySelector('#intake input[value="2000"]'), "—");
  const ontslag = safeText(document.querySelector('#intake input[value="Maandag"]'), "—");
  const crop = safeText(document.querySelector('#intake select'), "Onbekend");

  const bundel = safeText(document.querySelector('#zorgplan input[value]'), "Zorgbundel");
  const prioriteit = safeText(document.querySelector('#zorgplan select'), "Normaal");

  const zorgItems = Array.from(document.querySelectorAll('#zorgplan .bullets li'))
    .map(li => li.textContent.trim())
    .filter(Boolean);

  const matching = Array.from(document.querySelectorAll('#matching .mrow')).map(row => {
    const title = row.querySelector('b')?.textContent?.trim() || "Zorg";
    const meta = row.querySelector('.chip')?.textContent?.trim() || "";
    const tag = row.querySelector('.tag')?.textContent?.trim() || "";
    return { title, meta, tag };
  });

  const complexiteit =
    document.querySelector('.risk.orange, .risk.red, .risk.green')?.textContent?.trim() || "—";

  return {
    datum_export: new Date().toISOString(),
    patient,
    postcode,
    ontslagdatum: ontslag,
    crop_status: crop,
    ontslagcomplexiteit: complexiteit,
    zorgbundel: bundel,
    prioriteit,
    voorgestelde_zorg: zorgItems,
    matching
  };
}

function buildZorgplanHTML(data) {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  const zorgList = (data.voorgestelde_zorg || []).map(x => `<li>${esc(x)}</li>`).join("");
  const matchRows = (data.matching || []).map(m => `
    <tr>
      <td>
        <b>${esc(m.title)}</b>
        <div style="color:#5b6b7a;font-size:12px;margin-top:2px">${esc(m.meta)}</div>
      </td>
      <td style="text-align:right">${esc(m.tag)}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zorgplan — ${esc(data.patient)}</title>
<style>
  body{font-family:Arial,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; margin:28px; color:#0f253a;}
  .top{display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:18px;}
  .brand{font-weight:800; font-size:18px;}
  .meta{color:#5b6b7a; font-size:13px; line-height:1.5;}
  .badge{display:inline-block; padding:6px 10px; border-radius:999px; background:#eef6fb; border:1px solid #d6e2f0; font-size:12px; color:#165b72;}
  h1{font-size:22px; margin:6px 0 10px;}
  h2{font-size:14px; margin:18px 0 8px; text-transform:uppercase; letter-spacing:.08em; color:#165b72;}
  .card{border:1px solid #d6e2f0; border-radius:14px; padding:14px; background:#fff; margin:10px 0;}
  ul{margin:8px 0 0; padding-left:18px; line-height:1.55;}
  table{width:100%; border-collapse:collapse;}
  td{padding:10px 0; border-bottom:1px solid #eef3fb; vertical-align:top;}
  .small{font-size:12px; color:#5b6b7a;}
  .footer{margin-top:18px; color:#5b6b7a; font-size:12px;}
  @media print{
    body{margin:14mm;}
    .noprint{display:none;}
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <div class="brand">Zorgstart — Zorgplan</div>
      <div class="meta">
        <div><b>Patiënt:</b> ${esc(data.patient)}</div>
        <div><b>Postcode:</b> ${esc(data.postcode)} &nbsp; • &nbsp; <b>Ontslag:</b> ${esc(data.ontslagdatum)}</div>
        <div><b>CROP:</b> ${esc(data.crop_status)}</div>
      </div>
    </div>
    <div style="text-align:right">
      <div class="badge">Ontslagcomplexiteit: ${esc(data.ontslagcomplexiteit)}</div>
      <div class="small" style="margin-top:8px">Export: ${esc(new Date(data.datum_export).toLocaleString())}</div>
    </div>
  </div>

  <div class="card">
    <h1>${esc(data.zorgbundel)}</h1>
    <div class="meta"><b>Prioriteit:</b> ${esc(data.prioriteit)}</div>
  </div>

  <h2>Voorgesteld zorgplan</h2>
  <div class="card">
    <ul>${zorgList || "<li>—</li>"}</ul>
  </div>

  <h2>Matching & doorverwijzing</h2>
  <div class="card">
    <table>
      ${matchRows || `<tr><td><b>—</b></td><td style="text-align:right">—</td></tr>`}
    </table>
  </div>

  <div class="footer">
    <div><b>Opmerking:</b> Ondersteunend document. Beslissingen blijven bij het zorgteam.</div>
  </div>

  <div class="noprint" style="margin-top:16px">
    <button onclick="window.print()" style="padding:10px 12px;border-radius:10px;border:1px solid #d6e2f0;background:#f8fbff;cursor:pointer">
      Print / Bewaar als PDF
    </button>
  </div>
</body>
</html>`;
}

// ---- Export acties (globale functies voor onclick) ----
function exportZorgplanPDF() {
  const data = gatherZorgplan();
  const html = buildZorgplanHTML(data);

  const w = window.open("", "_blank");
  if (!w) {
    alert("Pop-up geblokkeerd. Sta pop-ups toe of gebruik Download HTML.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

function downloadZorgplanHTML() {
  const data = gatherZorgplan();
  const html = buildZorgplanHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "zorgplan.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function downloadZorgplanJSON() {
  const data = gatherZorgplan();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "zorgplan.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
