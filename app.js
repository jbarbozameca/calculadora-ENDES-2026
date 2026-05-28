/* ============================================================
   app.js  -  Lógica de la Calculadora ENDES Perú
   Dr. Joshuan J. Barboza · Universidad Señor de Sipán
   ============================================================ */

const NIVEL_LABEL = {
  nino: "👶 Niños <5 años",
  mujer: "♀ Mujeres edad fértil",
  adulto_salud: "🧍 Adultos · salud",
  hogar: "🏠 Hogar"
};

const PALETTE = ["#003366","#c8102e","#0891b2","#65a30d","#a16207",
                 "#7c3aed","#db2777","#0d9488","#ea580c","#475569"];

// ---------- Helpers de formato ----------
const fmt = {
  pct: v => v == null ? "—" : (100 * v).toFixed(1) + "%",
  num: v => v == null ? "—" : Number(v).toLocaleString("es-PE"),
  dec: (v, d = 2) => v == null ? "—" : Number(v).toFixed(d),
  ci: (lo, hi, isPct = true) => {
    if (lo == null || hi == null) return "—";
    const a = isPct ? (lo * 100).toFixed(1) : lo.toFixed(2);
    const b = isPct ? (hi * 100).toFixed(1) : hi.toFixed(2);
    return `${a} – ${b}`;
  },
  est: (val, lo, hi, isPct = true, d = 2) => {
    if (val == null) return "—";
    const v = isPct ? (val * 100).toFixed(1) : Number(val).toFixed(d);
    if (lo == null || hi == null) return v;
    const a = isPct ? (lo * 100).toFixed(1) : Number(lo).toFixed(d);
    const b = isPct ? (hi * 100).toFixed(1) : Number(hi).toFixed(d);
    return `${v} (${a}–${b})`;
  },
  pval: p => {
    if (p == null) return "—";
    if (p < 0.001) return "<0.001";
    if (p < 0.01) return p.toFixed(3);
    return p.toFixed(2);
  }
};

// ---------- Initialization ----------
const App = {};
window.ENDESApp = App;

App.init = () => {
  try {
    const E = window.ENDES;
    if (!E) {
      const msg = "⚠️ data.js no se cargó. Verifica que index.html, data.js y app.js estén en la misma carpeta.";
      console.error(msg);
      document.body.insertAdjacentHTML("afterbegin",
        '<div style="padding:1rem;background:#fee;color:#900;font-family:sans-serif;">' + msg + '</div>');
      return;
    }
    App.fillSelectors(E);
    App.bindTabs();
    App.bindButtons();
    // runUni puede fallar si Plotly no carga - capturamos
    try { App.runUni(); }
    catch (e) { console.warn("runUni inicial falló (probablemente CDN bloqueado):", e); }
    const dv = document.getElementById("data-version");
    if (dv) dv.textContent = E.VERSION;
    const ds = document.getElementById("data-status");
    if (ds) ds.textContent = E.DATA_SOURCE;
    console.log("✓ Calculadora ENDES inicializada · v" + E.VERSION +
                " · " + E.OUTCOMES.length + " outcomes · " +
                E.MAIN_VARS.length + " variables principales");
  } catch (e) {
    console.error("Error fatal en init:", e);
    document.body.insertAdjacentHTML("afterbegin",
      '<div style="padding:1rem;background:#fee;color:#900;font-family:sans-serif;">' +
      '⚠️ Error al iniciar: ' + e.message + '<br>Abre la Consola del navegador (Cmd+Opt+C en Safari) para ver detalles.</div>');
  }
};

// ---------- Selectores ----------
App.fillOutcomeSelect = (selectEl, opts = {}) => {
  selectEl.innerHTML = "";
  const data = window.ENDES.OUTCOMES;
  const groups = {};
  data.forEach(o => {
    if (opts.tipo && o.tipo !== opts.tipo) return;
    if (!groups[o.nivel]) groups[o.nivel] = [];
    groups[o.nivel].push(o);
  });
  Object.keys(groups).forEach(nivel => {
    const og = document.createElement("optgroup");
    og.label = NIVEL_LABEL[nivel] || nivel;
    groups[nivel].forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = `${o.etiqueta} · ${o.anio_min}–${o.anio_max}`;
      opt.dataset.tipo = o.tipo;
      opt.dataset.nivel = o.nivel;
      og.appendChild(opt);
    });
    selectEl.appendChild(og);
  });
};

App.fillYearSelect = (selectEl, withPool = true) => {
  selectEl.innerHTML = "";
  if (withPool) {
    const opt = document.createElement("option");
    opt.value = "pool"; opt.textContent = "Todos los años (pool)";
    selectEl.appendChild(opt);
  }
  window.ENDES.YEARS.slice().reverse().forEach(y => {
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = y;
    selectEl.appendChild(opt);
  });
};

App.fillCovariateSelect = (selectEl, includeRegion = false) => {
  // versión legacy - solo confusores
  selectEl.innerHTML = "";
  window.ENDES.COVARIATES.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id; opt.textContent = c.etiqueta;
    selectEl.appendChild(opt);
  });
};

// NUEVO: carga todas las variables principales agrupadas por dominio
// para los dropdowns de bivariado y multivariado.
App.fillMainVarSelect = (selectEl) => {
  selectEl.innerHTML = "";
  const groups = {};
  window.ENDES.MAIN_VARS.forEach(v => {
    if (!groups[v.dominio]) groups[v.dominio] = [];
    groups[v.dominio].push(v);
  });
  // orden de dominios sugerido
  const dominio_order = [
    "Sociodemográfico","Reproductivo","Acceso a salud","Hogar",
    "Comportamental","Conocimientos","Clínico",
    "Programas sociales","Atención obstétrica"
  ];
  dominio_order.forEach(dom => {
    if (!groups[dom]) return;
    const og = document.createElement("optgroup");
    og.label = dom;
    groups[dom].forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.etiqueta + " (" + v.niveles.length + " niveles)";
      og.appendChild(opt);
    });
    selectEl.appendChild(og);
  });
};

App.fillStratSelect = (selectEl) => {
  // start: "ninguno" + 4 standard covariates
  const ex = selectEl.querySelectorAll("option");
  if (ex.length === 0) {
    const opt = document.createElement("option");
    opt.value = ""; opt.textContent = "(ninguno - total nacional)";
    selectEl.appendChild(opt);
  }
  window.ENDES.COVARIATES.forEach(c => {
    if (c.id === "REGION_CAT") return;
    const opt = document.createElement("option");
    opt.value = c.id; opt.textContent = c.etiqueta;
    selectEl.appendChild(opt);
  });
};

App.fillVariableCatalog = (selectEl) => {
  selectEl.innerHTML = "";
  const groups = {};
  window.ENDES.VARIABLE_CATALOG.forEach(v => {
    if (!groups[v.nivel]) groups[v.nivel] = [];
    groups[v.nivel].push(v);
  });
  Object.keys(groups).forEach(niv => {
    const og = document.createElement("optgroup");
    og.label = NIVEL_LABEL[niv] || niv;
    groups[niv].forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.variable;
      opt.textContent = `${v.variable} · ${v.etiqueta} (${v.tipo})`;
      og.appendChild(opt);
    });
    selectEl.appendChild(og);
  });
};

App.fillSelectors = (E) => {
  // Univariado
  App.fillOutcomeSelect(document.getElementById("uni-outcome"));
  App.fillYearSelect(document.getElementById("uni-year"), false);
  App.fillStratSelect(document.getElementById("uni-strat"));
  document.getElementById("uni-count").textContent =
    `(${E.OUTCOMES.length} disponibles)`;

  // Bivariado - usa MAIN_VARS (70+ opciones agrupadas por dominio)
  App.fillOutcomeSelect(document.getElementById("bi-outcome"));
  App.fillYearSelect(document.getElementById("bi-year"), false);
  App.fillMainVarSelect(document.getElementById("bi-cov"));

  // Multivariado - exposición principal usa MAIN_VARS con multi-select
  App.fillOutcomeSelect(document.getElementById("multi-outcome"));
  App.buildMultiSelect(document.getElementById("multi-main-select"),
                       window.ENDES.MAIN_VARS);
  App.fillYearSelect(document.getElementById("multi-year"), false);

  // Explorador
  App.fillVariableCatalog(document.getElementById("exp-var"));
  App.fillYearSelect(document.getElementById("exp-year"), true);
  App.fillStratSelect(document.getElementById("exp-strat"));

  // confusores note (la lista se actualiza desde los checkboxes del multi-select)
  App.updateConfusoresNote();
};

App.updateConfusoresNote = () => {
  const selected = App.getMultiSelectValues("multi-main-select");
  // confusores fijos excluyendo los que el usuario eligió como exposición
  const all = window.ENDES.COVARIATES.filter(c => !selected.includes(c.id));
  document.getElementById("multi-confusores-list").textContent =
    all.length > 0 ? all.map(c => c.etiqueta).join(" · ")
                   : "(todos los confusores estándar están como exposición principal)";
};

// =====================================================================
// MULTI-SELECT COMPONENT
// =====================================================================
App.buildMultiSelect = (container, options) => {
  // Agrupar opciones por dominio
  const groups = {};
  options.forEach(v => {
    if (!groups[v.dominio]) groups[v.dominio] = [];
    groups[v.dominio].push(v);
  });
  const dominio_order = ["Sociodemográfico","Reproductivo","Acceso a salud",
    "Hogar","Comportamental","Conocimientos","Clínico",
    "Programas sociales","Atención obstétrica"];

  const body = container.querySelector(".ms-body");
  body.innerHTML = "";
  dominio_order.forEach(dom => {
    if (!groups[dom]) return;
    const g = document.createElement("div"); g.className = "ms-group";
    const lab = document.createElement("div"); lab.className = "ms-group-label";
    lab.textContent = dom; g.appendChild(lab);
    groups[dom].forEach(v => {
      const opt = document.createElement("label");
      opt.className = "ms-option";
      opt.dataset.value = v.id;
      opt.dataset.search = (v.etiqueta + " " + dom + " " + v.id).toLowerCase();
      opt.innerHTML = `<input type="checkbox" value="${v.id}">
        <span>${v.etiqueta} <span class="ms-option-meta">· ${v.niveles.length} niveles</span></span>`;
      const cb = opt.querySelector("input");
      cb.addEventListener("change", () => {
        opt.classList.toggle("checked", cb.checked);
        App.updateMultiSelectSummary(container);
        App.updateConfusoresNote();
      });
      g.appendChild(opt);
    });
    body.appendChild(g);
  });

  // Toggle dropdown
  const toggle = container.querySelector(".ms-toggle");
  const dropdown = container.querySelector(".ms-dropdown");
  const closeDropdown = () => {
    dropdown.hidden = true;
    container.classList.remove("open");
  };
  const openDropdown = () => {
    dropdown.hidden = false;
    container.classList.add("open");
  };
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.hidden) openDropdown(); else closeDropdown();
  });
  // Click fuera del componente cierra
  document.addEventListener("click", e => {
    if (!container.contains(e.target)) closeDropdown();
  });
  // Tecla Escape cierra
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !dropdown.hidden) closeDropdown();
  });
  // Botón "Cerrar" — solo cierra
  container.querySelectorAll('[data-action="close"]').forEach(btn => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); closeDropdown(); });
  });
  // Botón "Aplicar y cerrar" — cierra Y ejecuta el modelo
  container.querySelectorAll('[data-action="apply"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDropdown();
      if (container.id === "multi-main-select" && App.runMulti) {
        setTimeout(App.runMulti, 50);  // pequeño delay para que la UI cierre antes
      }
    });
  });

  // Search filter
  container.querySelector(".ms-search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    container.querySelectorAll(".ms-option").forEach(opt => {
      opt.classList.toggle("hidden", q !== "" && !opt.dataset.search.includes(q));
    });
    // Ocultar grupos sin opciones visibles
    container.querySelectorAll(".ms-group").forEach(g => {
      const visible = g.querySelectorAll(".ms-option:not(.hidden)").length;
      g.style.display = visible === 0 ? "none" : "";
    });
  });

  // Action buttons
  container.querySelectorAll(".ms-actions button").forEach(btn => {
    btn.addEventListener("click", e => {
      const action = e.target.dataset.action;
      const all = container.querySelectorAll(".ms-option input");
      if (action === "clear") {
        all.forEach(cb => { cb.checked = false; cb.dispatchEvent(new Event("change")); });
      } else if (action === "sociodemo") {
        all.forEach(cb => {
          const dom = cb.closest(".ms-group").querySelector(".ms-group-label").textContent;
          cb.checked = (dom === "Sociodemográfico");
          cb.dispatchEvent(new Event("change"));
        });
      } else if (action === "default") {
        // Set típico literatura: lengua materna + afiliación seguro + paridad + tipo método
        const defaults = ["LENGUA_MATERNA","AFILIACION_SEGURO","PARIDAD_CAT","TIPO_METODO_ANTI"];
        all.forEach(cb => {
          cb.checked = defaults.includes(cb.value);
          cb.dispatchEvent(new Event("change"));
        });
      }
    });
  });

  // Selección por defecto: una variable para que el modelo arranque
  const firstCb = container.querySelector('.ms-option input[value="LENGUA_MATERNA"]');
  if (firstCb) { firstCb.checked = true; firstCb.dispatchEvent(new Event("change")); }
};

App.getMultiSelectValues = (containerId) => {
  return [...document.querySelectorAll(`#${containerId} .ms-option input:checked`)]
    .map(cb => cb.value);
};

App.updateMultiSelectSummary = (container) => {
  const checked = container.querySelectorAll(".ms-option input:checked");
  const summary = container.querySelector(".ms-summary");
  if (checked.length === 0) {
    summary.textContent = "Click para elegir variables principales";
    summary.classList.remove("has-selection");
  } else if (checked.length === 1) {
    const v = window.ENDES.MAIN_VARS.find(x => x.id === checked[0].value);
    summary.textContent = v?.etiqueta || checked[0].value;
    summary.classList.add("has-selection");
  } else {
    summary.textContent = `${checked.length} variables seleccionadas`;
    summary.classList.add("has-selection");
  }
  // Actualizar contador del footer
  const counter = container.querySelector(".ms-counter");
  if (counter) {
    counter.textContent = `${checked.length} seleccionada${checked.length === 1 ? "" : "s"}`;
    // Advertencia visual si hay demasiadas variables
    if (checked.length > 6) {
      counter.style.color = "var(--accent)";
      counter.textContent += " ⚠️ muchas variables";
    } else {
      counter.style.color = "var(--primary)";
    }
  }
};

// ---------- Tabs ----------
App.bindTabs = () => {
  document.querySelectorAll("nav.tabs button").forEach(btn => {
    btn.addEventListener("click", () => App.showTab(btn.dataset.tab, btn));
  });
  document.querySelectorAll("[data-tab-link]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const tab = a.dataset.tabLink;
      const btn = document.querySelector(`nav.tabs button[data-tab="${tab}"]`);
      App.showTab(tab, btn);
    });
  });
};
App.showTab = (id, btn) => {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (btn) btn.classList.add("active");
  window.scrollTo({top: 0, behavior: "smooth"});
};

// ---------- Buttons ----------
App.bindButtons = () => {
  document.getElementById("uni-run").addEventListener("click", App.runUni);
  document.getElementById("bi-run").addEventListener("click", App.runBi);
  document.getElementById("multi-run").addEventListener("click", App.runMulti);
  document.getElementById("exp-run").addEventListener("click", App.runExp);
  document.getElementById("uni-export").addEventListener("click",
    () => App.exportXLSX("uni"));
  document.getElementById("bi-export").addEventListener("click",
    () => App.exportXLSX("bi"));
  document.getElementById("multi-export").addEventListener("click",
    () => App.exportXLSX("multi"));
  document.getElementById("exp-export").addEventListener("click",
    () => App.exportXLSX("exp"));
  document.getElementById("multi-cite").addEventListener("click", App.cite);
};

// ====================================================================
// UNIVARIADO
// ====================================================================
App.runUni = () => {
  const E = window.ENDES;
  const outcome = document.getElementById("uni-outcome").value;
  const year = document.getElementById("uni-year").value;
  const strat = document.getElementById("uni-strat").value;
  const od = E.OUTCOMES.find(o => o.id === outcome);
  if (!od) return;

  document.getElementById("uni-title").textContent =
    `${od.etiqueta} ${od.tipo === "continuo" ? "(continua)" : ""}`;
  document.getElementById("uni-subtitle").innerHTML =
    `<strong>Denominador:</strong> ${od.denominador} · ` +
    `<strong>Años:</strong> ${od.anio_min}–${od.anio_max} ` +
    `<span class="badge badge-demo">DEMO</span>`;

  // Si NO se estratifica → un solo año + serie temporal
  if (!strat) {
    const u = E.getUnivariate(outcome, +year);
    const trend = E.getTrend(outcome);
    App.renderUniTable(od, [{anio: year, estrato: "Total", ...u}]);
    App.renderUniSummary(od, u);
    App.renderUniChart(od, trend);
  } else {
    // Estratificado: tabla con niveles del estrato para año seleccionado + tendencia por estrato
    const cd = E.COVARIATES.find(c => c.id === strat);
    const rows = cd.niveles.map(lev => {
      const u = E.getUnivariate(outcome, +year, lev);
      return {anio: year, estrato: lev, ...u};
    });
    App.renderUniTable(od, rows);
    App.renderUniSummary(od, rows[0]);
    const trendStrat = E.getTrendStratified(outcome, strat);
    App.renderUniChartStrat(od, trendStrat, cd);
  }
};

App.renderUniSummary = (od, u) => {
  const c = document.getElementById("uni-summary");
  const isBin = od.tipo === "binario";
  const valStr = isBin ? fmt.pct(u.valor) : fmt.dec(u.valor, 2) + " " + (u.unit || "");
  const ciStr = isBin ?
    fmt.ci(u.ic_inf, u.ic_sup, true) + "%" :
    fmt.ci(u.ic_inf, u.ic_sup, false);
  c.innerHTML = `
    <div class="stat">
      <div class="stat-label">${isBin ? "Prevalencia" : "Media"}</div>
      <div class="stat-value">${valStr}</div>
      <div class="stat-unit">IC95%: ${ciStr}</div>
    </div>
    <div class="stat">
      <div class="stat-label">N total</div>
      <div class="stat-value">${fmt.num(u.n_total)}</div>
    </div>
    ${isBin ? `<div class="stat">
      <div class="stat-label">N eventos</div>
      <div class="stat-value">${fmt.num(u.n_evento)}</div>
    </div>` : ""}
  `;
};

App.renderUniTable = (od, rows) => {
  const isBin = od.tipo === "binario";
  const head = document.querySelector("#uni-table thead");
  const body = document.querySelector("#uni-table tbody");
  head.innerHTML = isBin ?
    `<tr><th>Año</th><th>Estrato</th><th class="numeric">N</th>
      <th class="numeric">N evento</th><th class="numeric">% (IC95%)</th></tr>` :
    `<tr><th>Año</th><th>Estrato</th><th class="numeric">N</th>
      <th class="numeric">Media (IC95%)</th></tr>`;
  body.innerHTML = rows.map(r => isBin ?
    `<tr><td>${r.anio}</td><td>${r.estrato}</td>
      <td class="numeric">${fmt.num(r.n_total)}</td>
      <td class="numeric">${fmt.num(r.n_evento)}</td>
      <td class="numeric">${fmt.est(r.valor, r.ic_inf, r.ic_sup, true)}%</td></tr>` :
    `<tr><td>${r.anio}</td><td>${r.estrato}</td>
      <td class="numeric">${fmt.num(r.n_total)}</td>
      <td class="numeric">${fmt.est(r.valor, r.ic_inf, r.ic_sup, false)} ${r.unit || ""}</td></tr>`
  ).join("");
};

App.renderUniChart = (od, trend) => {
  const isBin = od.tipo === "binario";
  const x = trend.map(t => t.anio);
  const y = trend.map(t => isBin ? t.valor * 100 : t.valor);
  const lo = trend.map(t => isBin ? t.ic_inf * 100 : t.ic_inf);
  const hi = trend.map(t => isBin ? t.ic_sup * 100 : t.ic_sup);
  if (typeof Plotly === "undefined") return; Plotly.newPlot("uni-chart", [{
    x: x, y: y, type: "scatter", mode: "lines+markers",
    name: od.etiqueta.slice(0, 40),
    line: {color: PALETTE[0], width: 3},
    marker: {size: 8},
    error_y: {type: "data", symmetric: false,
              array: y.map((v, i) => hi[i] - v),
              arrayminus: y.map((v, i) => v - lo[i])}
  }], {
    title: `Tendencia ${od.anio_min}–${od.anio_max}`,
    xaxis: {title: "Año"},
    yaxis: {title: isBin ? "% (IC95%)" : `Media ${od.unit || ""} (IC95%)`},
    margin: {t: 50}, hovermode: "x unified"
  }, {responsive: true, displaylogo: false});
};

App.renderUniChartStrat = (od, trendStrat, cd) => {
  const isBin = od.tipo === "binario";
  const traces = Object.keys(trendStrat).map((lev, i) => {
    const d = trendStrat[lev];
    return {
      x: d.map(r => r.anio),
      y: d.map(r => isBin ? r.valor * 100 : r.valor),
      name: lev, type: "scatter", mode: "lines+markers",
      line: {color: PALETTE[i % PALETTE.length], width: 2},
      marker: {size: 6}
    };
  });
  if (typeof Plotly === "undefined") return; Plotly.newPlot("uni-chart", traces, {
    title: `Tendencia estratificada por ${cd.etiqueta}`,
    xaxis: {title: "Año"},
    yaxis: {title: isBin ? "% ponderado" : `Media ${od.unit || ""}`},
    margin: {t: 50}, hovermode: "x unified"
  }, {responsive: true, displaylogo: false});
};

// ====================================================================
// BIVARIADO
// ====================================================================
App.runBi = () => {
  const E = window.ENDES;
  const outcome = document.getElementById("bi-outcome").value;
  const cov = document.getElementById("bi-cov").value;
  const year = +document.getElementById("bi-year").value;
  const od = E.OUTCOMES.find(o => o.id === outcome);
  const cd = E.COVARIATES.find(c => c.id === cov);
  if (!od || !cd) return;

  const bi = E.getBivariate(outcome, year, cov);
  document.getElementById("bi-title").textContent =
    `${od.etiqueta} × ${cd.etiqueta}`;
  document.getElementById("bi-subtitle").innerHTML =
    `ENDES ${year} · χ² p = <strong>${fmt.pval(bi.chi_p)}</strong> ` +
    `<span class="badge badge-demo">DEMO</span>`;

  const isBin = od.tipo === "binario";
  const head = document.querySelector("#bi-table thead");
  const body = document.querySelector("#bi-table tbody");
  head.innerHTML = isBin ?
    `<tr><th>Nivel de ${cd.etiqueta}</th><th class="numeric">N</th>
      <th class="numeric">% (IC95%)</th><th class="numeric">RP cruda*</th></tr>` :
    `<tr><th>Nivel de ${cd.etiqueta}</th><th class="numeric">N</th>
      <th class="numeric">Media (IC95%)</th><th class="numeric">Δ vs ref</th></tr>`;
  const refVal = bi.niveles[0].valor;
  body.innerHTML = bi.niveles.map((r, i) => {
    const cmp = i === 0 ? "1.00 (ref)" :
      (isBin ? (r.valor / refVal).toFixed(2) : (r.valor - refVal).toFixed(2));
    return isBin ?
      `<tr><td>${r.nivel}</td><td class="numeric">${fmt.num(r.n)}</td>
        <td class="numeric">${fmt.est(r.valor, r.ic_inf, r.ic_sup, true)}%</td>
        <td class="numeric">${cmp}</td></tr>` :
      `<tr><td>${r.nivel}</td><td class="numeric">${fmt.num(r.n)}</td>
        <td class="numeric">${fmt.est(r.valor, r.ic_inf, r.ic_sup, false)} ${od.unit || ""}</td>
        <td class="numeric">${cmp}</td></tr>`;
  }).join("");
  if (isBin) {
    body.insertAdjacentHTML("beforeend",
      `<tr><td colspan="4" style="font-size:0.75rem;color:var(--muted);">
       * RP cruda calculada como ratio sobre la primera categoría (referencia).</td></tr>`);
  }
  // chart
  if (typeof Plotly === "undefined") return; Plotly.newPlot("bi-chart", [{
    x: bi.niveles.map(r => r.nivel),
    y: bi.niveles.map(r => isBin ? r.valor * 100 : r.valor),
    error_y: {type: "data", symmetric: false,
              array: bi.niveles.map(r => isBin ?
                (r.ic_sup - r.valor) * 100 : r.ic_sup - r.valor),
              arrayminus: bi.niveles.map(r => isBin ?
                (r.valor - r.ic_inf) * 100 : r.valor - r.ic_inf)},
    type: "bar",
    marker: {color: bi.niveles.map((_, i) => PALETTE[i % PALETTE.length])}
  }], {
    title: `${od.etiqueta} por ${cd.etiqueta} · ENDES ${year}`,
    yaxis: {title: isBin ? "% (IC95%)" : `Media ${od.unit || ""} (IC95%)`},
    margin: {t: 50}
  }, {responsive: true, displaylogo: false});
};

// ====================================================================
// MULTIVARIADO
// ====================================================================
App.runMulti = () => {
  const E = window.ENDES;
  const outcome = document.getElementById("multi-outcome").value;
  const mainVars = App.getMultiSelectValues("multi-main-select");
  const year = +document.getElementById("multi-year").value;
  const model = document.getElementById("multi-model").value;
  const od = E.OUTCOMES.find(o => o.id === outcome);

  if (mainVars.length === 0) {
    alert("Selecciona al menos una variable principal de exposición.");
    return;
  }

  // ===== Validaciones inteligentes =====
  const warnings = App.validateSelection(outcome, mainVars, year);
  App.showValidationWarnings(warnings);

  App.updateConfusoresNote();
  const multi = E.getMultivariate(outcome, year, mainVars);
  if (!multi) return;
  const isCont = od.tipo === "continuo";

  // Título
  const varNames = multi.variables.map(v => v.etiqueta).join(" + ");
  document.getElementById("multi-title").textContent =
    `${od.etiqueta} ~ ${mainVars.length} variable${mainVars.length>1?"s":""} principal${mainVars.length>1?"es":""} + confusores`;
  document.getElementById("multi-subtitle").innerHTML =
    `Modelo: ${varNames}<br>` +
    `Confusores ajustados: ${multi.confusores.length > 0 ? multi.confusores.map(c => {
      const cd = E.COVARIATES.find(x=>x.id===c); return cd ? cd.etiqueta : c;
    }).join(", ") : "(ninguno disponible)"} · ENDES ${year} ` +
    `<span class="badge badge-demo">DEMO</span>`;

  // Cabecera de la tabla
  const head = document.querySelector("#multi-table thead");
  const body = document.querySelector("#multi-table tbody");

  let cols = `<tr><th>Variable</th><th>Nivel</th>`;
  if (isCont) {
    cols += `<th class="numeric">β (IC95%)</th><th class="numeric">p</th>`;
  } else {
    if (model === "logit" || model === "both") cols += `<th class="numeric">ORa (IC95%)</th><th class="numeric">p</th>`;
    if (model === "poisson" || model === "both") cols += `<th class="numeric">RPa (IC95%)</th><th class="numeric">p</th>`;
  }
  cols += `</tr>`;
  head.innerHTML = cols;

  // Filas: una por variable × nivel
  const rows = [];
  multi.variables.forEach(varEntry => {
    varEntry.niveles.forEach((r, idx) => {
      let row = `<tr>`;
      // Solo la primera fila de cada variable muestra el nombre (rowspan visual)
      row += `<td>${idx === 0 ? `<strong>${varEntry.etiqueta}</strong>` : ""}</td>`;
      row += `<td>${r.nivel}</td>`;
      if (isCont) {
        row += r.ref ?
          `<td class="numeric">0 (ref)</td><td class="numeric">—</td>` :
          `<td class="numeric">${fmt.est(r.Beta, r.Beta_lo, r.Beta_hi, false)}</td>
           <td class="numeric">${fmt.pval(r.p)}</td>`;
      } else {
        if (model === "logit" || model === "both") {
          row += r.ref ?
            `<td class="numeric">1.00 (ref)</td><td class="numeric">—</td>` :
            `<td class="numeric">${fmt.est(r.ORa, r.ORa_lo, r.ORa_hi, false)}</td>
             <td class="numeric">${fmt.pval(r.p)}</td>`;
        }
        if (model === "poisson" || model === "both") {
          row += r.ref ?
            `<td class="numeric">1.00 (ref)</td><td class="numeric">—</td>` :
            `<td class="numeric">${fmt.est(r.RPa, r.RPa_lo, r.RPa_hi, false)}</td>
             <td class="numeric">${fmt.pval(r.p)}</td>`;
        }
      }
      row += `</tr>`;
      rows.push(row);
    });
  });
  body.innerHTML = rows.join("");

  // Forest plot agregado (todas las variables × niveles)
  const labels = [];
  const oraVals = [], oraLo = [], oraHi = [];
  const rpaVals = [], rpaLo = [], rpaHi = [];
  const betaVals = [], betaLo = [], betaHi = [];
  multi.variables.forEach(v => {
    v.niveles.forEach(r => {
      if (r.ref) return;
      labels.push(`${v.etiqueta.slice(0,25)} · ${r.nivel}`);
      if (!isCont) {
        oraVals.push(r.ORa); oraLo.push(r.ORa_lo); oraHi.push(r.ORa_hi);
        rpaVals.push(r.RPa); rpaLo.push(r.RPa_lo); rpaHi.push(r.RPa_hi);
      } else {
        betaVals.push(r.Beta || 0); betaLo.push(r.Beta_lo || 0); betaHi.push(r.Beta_hi || 0);
      }
    });
  });

  const traces = [];
  if (!isCont && (model === "logit" || model === "both")) {
    traces.push({
      x: oraVals, y: labels, name: "ORa",
      type: "scatter", mode: "markers", marker: {size: 10, color: PALETTE[0]},
      error_x: {type: "data", symmetric: false,
                array: oraVals.map((v, i) => oraHi[i] - v),
                arrayminus: oraVals.map((v, i) => v - oraLo[i])}
    });
  }
  if (!isCont && (model === "poisson" || model === "both")) {
    traces.push({
      x: rpaVals, y: labels, name: "RPa",
      type: "scatter", mode: "markers", marker: {size: 10, color: PALETTE[1]},
      error_x: {type: "data", symmetric: false,
                array: rpaVals.map((v, i) => rpaHi[i] - v),
                arrayminus: rpaVals.map((v, i) => v - rpaLo[i])}
    });
  }
  if (isCont) {
    traces.push({
      x: betaVals, y: labels, name: "β",
      type: "scatter", mode: "markers", marker: {size: 10, color: PALETTE[2]},
      error_x: {type: "data", symmetric: false,
                array: betaVals.map((v, i) => betaHi[i] - v),
                arrayminus: betaVals.map((v, i) => v - betaLo[i])}
    });
  }

  if (typeof Plotly === "undefined") return; Plotly.newPlot("multi-chart", traces, {
    title: `Forest plot · ${mainVars.length} variable(s) principal(es)`,
    xaxis: {title: isCont ? "β (IC95%)" : "Estimador ajustado (IC95%)",
            type: isCont ? "linear" : "log"},
    yaxis: {autorange: "reversed", automargin: true},
    height: Math.max(400, 30 * labels.length + 100),
    shapes: isCont ? [] : [{type:"line", x0:1, x1:1, y0:-0.5, y1:labels.length-0.5,
                            line:{dash:"dash",color:"gray"}}],
    margin: {t:50,l:240}
  }, {responsive:true, displaylogo:false});

  // === DAG ===
  App.renderDAG(od, multi.variables, multi.confusores);
};

// =====================================================================
// VALIDACIONES INTELIGENTES de la selección multivariada
// =====================================================================
App.validateSelection = (outcomeId, mainVarIds, year) => {
  const warnings = [];
  const E = window.ENDES;
  const od = E.OUTCOMES.find(o => o.id === outcomeId);

  // 1. Demasiadas variables principales
  if (mainVarIds.length > 6) {
    warnings.push({
      tipo: "warning",
      titulo: "Muchas variables principales",
      mensaje: `Seleccionaste ${mainVarIds.length} variables. Con tantos predictores, el modelo puede sufrir de colinealidad y degrees of freedom. Recomendado: 1–6 variables.`
    });
  }

  // 2. Pares conceptualmente redundantes
  const redundantPairs = [
    ["PARIDAD_CAT", "EDAD_PRIMER_PARTO_CAT", "Paridad y edad al primer parto están correlacionadas"],
    ["USO_ANTICONCEPTIVO_CAT", "TIPO_METODO_ANTI", "Uso y tipo de anticonceptivo son variables nestadas (la segunda es subconjunto de la primera)"],
    ["FUENTE_AGUA", "AGUA_POTABLE", "Fuente de agua e indicador agua potable son redundantes"],
    ["SANEAMIENTO", "SANEAMIENTO_MEJORADO", "Tipo y categoría de saneamiento son redundantes"],
    ["IMC_CAT", "OBESIDAD_ADULTOS", "Categoría IMC y obesidad son la misma información binarizada"],
    ["FUMA_ESTATUS", "FUMADOR_ACTUAL", "Estatus de tabaquismo y fumador actual son redundantes"],
    ["ANEMIA_NINOS_CAT", "ANEMIA_NINOS_TOTAL", "Categoría de anemia infantil y anemia total son redundantes"],
    ["AFILIACION_SEGURO", "TIPO_ESTABLECIMIENTO", "Afiliación a seguro y tipo de establecimiento están altamente correlacionados"],
    ["ALCOHOL_FRECUENCIA", "AUDIT_CATEGORIA", "Frecuencia de alcohol y AUDIT-C son medidas relacionadas del mismo constructo"]
  ];
  redundantPairs.forEach(([a, b, msg]) => {
    if (mainVarIds.includes(a) && mainVarIds.includes(b)) {
      warnings.push({tipo: "warning", titulo: "Variables redundantes", mensaje: `${msg}. Considera elegir solo una.`});
    }
  });

  // 3. Outcome usado como predictor
  if (mainVarIds.includes(outcomeId)) {
    warnings.push({tipo: "error", titulo: "Outcome como predictor",
      mensaje: "El outcome no puede estar también entre las variables principales."});
  }

  // 4. Variable principal coincide con confusor estándar
  const stdConfounders = ["SEXO_CAT","EDAD_CAT","AREA_CAT","EDUC_CAT","QUINTIL_CAT"];
  const overlap = mainVarIds.filter(v => stdConfounders.includes(v));
  if (overlap.length > 0) {
    warnings.push({tipo: "info", titulo: "Variables que también son confusores",
      mensaje: `Las siguientes son normalmente confusores: ${overlap.join(", ")}. Se excluyen automáticamente del set de ajuste para evitar colinealidad — quedan SOLO como exposición principal.`});
  }

  // 5. Variable no compatible con el nivel del outcome
  const outcomeNivel = od?.nivel;
  if (outcomeNivel === "nino") {
    const adult_only = mainVarIds.filter(v => ["IMC_CAT","PA_CAT","DM_CONOCIDA","FUMA_ESTATUS","ALCOHOL_FRECUENCIA","AUDIT_CATEGORIA","ACTIVIDAD_FISICA"].includes(v));
    if (adult_only.length > 0) {
      warnings.push({tipo: "warning", titulo: "Variables de adulto en outcome infantil",
        mensaje: `${adult_only.join(", ")} son variables de adultos pero el outcome es infantil. Estas se aplicarán al adulto/madre del hogar, no al niño directamente.`});
    }
  }

  // 6. Outcomes que requieren años específicos
  if (od && year < od.anio_min) {
    warnings.push({tipo: "error", titulo: "Año fuera de cobertura",
      mensaje: `El outcome "${od.etiqueta}" solo está disponible desde ${od.anio_min}.`});
  }

  // 7. Sugerencia positiva si la selección coincide con literatura
  const recommendedSets = {
    "anemia_ninos_total": ["LENGUA_MATERNA","PARIDAD_CAT","APN_NUMERO_VISITAS"],
    "desnutricion_cronica": ["LENGUA_MATERNA","BENEF_JUNTOS","CONTROL_CRED_NINO"],
    "fand": ["PARIDAD_CAT","USO_ANTICONCEPTIVO_CAT","DESEO_HIJOS"],
    "papanicolaou_2anios": ["AFILIACION_SEGURO","CONOC_CACU","CONOC_VPH"],
    "violencia_fisica_pareja": ["ALCOHOL_FRECUENCIA","ACEPTA_VIOLENCIA","DECISION_SALUD"],
    "hta_combinada": ["IMC_CAT","FUMA_ESTATUS","AFILIACION_SEGURO"]
  };
  const recommended = recommendedSets[outcomeId];
  if (recommended && recommended.every(v => mainVarIds.includes(v))) {
    warnings.push({tipo: "success", titulo: "Selección alineada con la literatura",
      mensaje: "Esta combinación de variables aparece en estudios publicados sobre este outcome. ¡Buena elección!"});
  }
  return warnings;
};

App.showValidationWarnings = (warnings) => {
  // Buscar/crear el contenedor de advertencias
  let cont = document.getElementById("multi-warnings");
  if (!cont) {
    cont = document.createElement("div");
    cont.id = "multi-warnings";
    const refEl = document.getElementById("multi-confusores-note");
    refEl.parentNode.insertBefore(cont, refEl.nextSibling);
  }
  cont.innerHTML = "";
  if (warnings.length === 0) return;
  warnings.forEach(w => {
    const div = document.createElement("div");
    const color = {
      error:   {bg:"#fee2e2", border:"#c8102e", text:"#7f1d1d", icon:"⚠️"},
      warning: {bg:"#fef3c7", border:"#f59e0b", text:"#92400e", icon:"⚠️"},
      info:    {bg:"#dbeafe", border:"#3b82f6", text:"#1e3a8a", icon:"ℹ️"},
      success: {bg:"#d1fae5", border:"#10b981", text:"#065f46", icon:"✓"}
    }[w.tipo] || {bg:"#fef3c7", border:"#f59e0b", text:"#92400e", icon:"⚠️"};
    div.style.cssText = `background:${color.bg};border-left:4px solid ${color.border};
      color:${color.text};padding:0.6rem 1rem;border-radius:6px;margin-bottom:0.5rem;
      font-size:0.85rem;`;
    div.innerHTML = `<strong>${color.icon} ${w.titulo}:</strong> ${w.mensaje}`;
    cont.appendChild(div);
  });
};

// =====================================================================
// DAG (Mermaid)
// =====================================================================
App.renderDAG = (outcomeObj, mainVarsArr, confusoresIds) => {
  const cont = document.getElementById("multi-dag");
  if (!cont) return;
  // Si Mermaid no está disponible (CDN bloqueado), muestra placeholder
  if (typeof window.mermaid === "undefined") {
    cont.innerHTML = `<div class="note note-info">
      📊 DAG no disponible — la librería Mermaid no se pudo cargar
      (probablemente abriste el archivo localmente con restricciones de seguridad).
      Para verlo, súbelo a GitHub Pages o sirve la carpeta con un servidor local:
      <br><code style="font-size:0.85rem;">cd calculadora_github && python3 -m http.server 8000</code>
      <br>Luego abre <a href="http://localhost:8000">http://localhost:8000</a>
    </div>`;
    return;
  }

  const safeLabel = s => s.replace(/[\[\]{}|()<>"'`]/g, "").slice(0, 40);
  const outcomeLabel = safeLabel(outcomeObj.etiqueta);
  const confusoresObjs = confusoresIds.map(c =>
    window.ENDES.COVARIATES.find(x => x.id === c)).filter(x => x);

  let code = "flowchart LR\n";

  // Subgrafo confusores
  if (confusoresObjs.length > 0) {
    code += "  subgraph C[\"⚙️ Confusores estándar\"]\n";
    code += "    direction TB\n";
    confusoresObjs.forEach((c, i) => {
      code += `    C${i}["${safeLabel(c.etiqueta)}"]\n`;
    });
    code += "  end\n";
  }

  // Subgrafo variables principales
  if (mainVarsArr.length > 0) {
    code += "  subgraph E[\"🎯 Variables principales\"]\n";
    code += "    direction TB\n";
    mainVarsArr.forEach((v, i) => {
      code += `    E${i}["${safeLabel(v.etiqueta)}"]\n`;
    });
    code += "  end\n";
  }

  // Nodo outcome
  code += `  Y(["📌 ${outcomeLabel}"])\n`;

  // Flechas: exposiciones → outcome (sólidas, fuertes)
  mainVarsArr.forEach((v, i) => {
    code += `  E${i} ==> Y\n`;
  });

  // Flechas: confusores → outcome (sólidas)
  confusoresObjs.forEach((c, i) => {
    code += `  C${i} --> Y\n`;
  });

  // Flechas: confusores → exposiciones (definición de confusor)
  confusoresObjs.forEach((c, i) => {
    mainVarsArr.forEach((v, j) => {
      // Relaciones plausibles entre confusor y exposición principal
      // (en un DAG real esto se justifica con literatura; aquí lo simulamos)
      const plausible = App._dagLink(c.id, v.id);
      if (plausible) {
        code += `  C${i} -.-> E${j}\n`;
      }
    });
  });

  // Estilos por tipo de nodo
  code += "\n";
  mainVarsArr.forEach((_, i) => {
    code += `  style E${i} fill:#dbeafe,stroke:#003366,stroke-width:2px,color:#1e3a8a\n`;
  });
  confusoresObjs.forEach((_, i) => {
    code += `  style C${i} fill:#f3f4f6,stroke:#6b7280,color:#374151\n`;
  });
  code += "  style Y fill:#fee2e2,stroke:#c8102e,stroke-width:3px,color:#7f1d1d\n";

  cont.innerHTML =
    `<div class="mermaid">${code}</div>` +
    `<div class="dag-legend">
       <span class="legend-item"><span class="legend-box lb-exposure"></span>Exposiciones</span>
       <span class="legend-item"><span class="legend-box lb-confounder"></span>Confusores</span>
       <span class="legend-item"><span class="legend-box lb-outcome"></span>Outcome</span>
       <span class="legend-item"><span style="border-top:2px solid #6b7280;display:inline-block;width:20px;"></span> Efecto causal directo</span>
       <span class="legend-item"><span style="border-top:2px dashed #6b7280;display:inline-block;width:20px;"></span> Backdoor / confounding</span>
     </div>`;

  try {
    mermaid.run({ nodes: cont.querySelectorAll(".mermaid") });
  } catch(e) { console.warn("DAG render error:", e); }
};

// Reglas heurísticas: ¿hay una relación plausible confusor→exposición?
// En un DAG académico esto se justifica con literatura; aquí seleccionamos
// las relaciones más comúnmente reportadas en epidemiología peruana.
App._dagLink = (confounderId, exposureId) => {
  const links = {
    "SEXO_CAT":   ["ESTADO_CIVIL","TRABAJO_ACTUAL","IMC_CAT","CONOC_VIH","CONOC_CACU"],
    "EDAD_CAT":   ["PARIDAD_CAT","EDAD_PRIMER_PARTO_CAT","ESTADO_CIVIL","TRABAJO_ACTUAL",
                   "USO_ANTICONCEPTIVO_CAT","DESEO_HIJOS","TIPO_METODO_ANTI","FUMA_ESTATUS",
                   "ALCOHOL_FRECUENCIA","ACTIVIDAD_FISICA","IMC_CAT","PA_CAT","DM_CONOCIDA",
                   "EDAD_PRIMERA_RS_CAT","CONOC_VIH","CONOC_CACU"],
    "AREA_CAT":   ["LENGUA_MATERNA","ETNIA_AUTOID","RELIGION_CAT","AFILIACION_SEGURO",
                   "TIPO_ESTABLECIMIENTO","DISTANCIA_EESS","BARRERA_ACCESO",
                   "FUENTE_AGUA","SANEAMIENTO","COMBUSTIBLE","MATERIAL_PISO","MATERIAL_PARED",
                   "TIENE_INTERNET","TIENE_CELULAR","LUGAR_PARTO","PROFESIONAL_PARTO",
                   "BENEF_JUNTOS","BENEF_QALI_WARMA","BENEF_CUNA_MAS"],
    "EDUC_CAT":   ["TRABAJO_ACTUAL","CONOC_VIH","CONOC_CACU","CONOC_VPH","CONOC_METODOS_PF",
                   "DECISION_SALUD","ACEPTA_VIOLENCIA","USO_ANTICONCEPTIVO_CAT","TIPO_METODO_ANTI",
                   "AFILIACION_SEGURO","BARRERA_ACCESO","APN_NUMERO_VISITAS","APN_CAPTACION",
                   "FUMA_ESTATUS","ALCOHOL_FRECUENCIA","ACTIVIDAD_FISICA","CONSUMO_FRUTAS",
                   "EDAD_PRIMER_PARTO_CAT","EDAD_PRIMERA_RS_CAT","VIOLENCIA_HISTORIA"],
    "QUINTIL_CAT":["AFILIACION_SEGURO","TIPO_ESTABLECIMIENTO","DISTANCIA_EESS","BARRERA_ACCESO",
                   "FUENTE_AGUA","SANEAMIENTO","COMBUSTIBLE","MATERIAL_PISO","MATERIAL_PARED",
                   "TIENE_INTERNET","TIENE_CELULAR","BENEF_JUNTOS","BENEF_QALI_WARMA",
                   "BENEF_CUNA_MAS","CONSUMO_FRUTAS","ALCOHOL_FRECUENCIA","FUMA_ESTATUS",
                   "ANTECEDENTE_CESAREA","LUGAR_PARTO","PROFESIONAL_PARTO",
                   "APN_NUMERO_VISITAS","TIPO_METODO_ANTI"]
  };
  return (links[confounderId] || []).includes(exposureId);
};

// ====================================================================
// EXPLORADOR
// ====================================================================
App.runExp = () => {
  const E = window.ENDES;
  const varId = document.getElementById("exp-var").value;
  const year = document.getElementById("exp-year").value;
  const strat = document.getElementById("exp-strat").value;
  const vd = E.VARIABLE_CATALOG.find(v => v.variable === varId);
  if (!vd) return;
  document.getElementById("exp-title").textContent =
    `${vd.variable} · ${vd.etiqueta}`;
  document.getElementById("exp-subtitle").innerHTML =
    `Nivel: ${NIVEL_LABEL[vd.nivel] || vd.nivel} · Tipo: ${vd.tipo} ` +
    `<span class="badge badge-demo">DEMO</span>`;
  const head = document.querySelector("#exp-table thead");
  const body = document.querySelector("#exp-table tbody");

  // Para variables tipo binario y categórico, mostrar distribución
  // Para continuas, mostrar media + p25/p75
  // Como demo, generamos valores procedurales
  const years = year === "pool" ?
    E.YEARS.filter(y => y >= 2010) : [+year];
  const rows = [];
  years.forEach(y => {
    const seed = `${varId}:${y}:${strat || "T"}`;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let r = (h >>> 0) / 4294967296;
    if (vd.tipo === "continuo") {
      // ejemplo: para HW1 (edad meses) media ~28, para QS700 ~640, etc.
      // generamos valores plausibles
      const base = varId === "HW1" ? 28 : varId === "HW2" ? 140 :
                   varId === "HW3" ? 880 : varId === "QS700" ? 640 :
                   varId === "QS701" ? 1580 : varId === "V012" ? 30 :
                   varId === "V525" ? 18.5 : varId === "V201" ? 2.3 :
                   varId === "V212" ? 21.6 : varId === "M19" ? 3180 :
                   varId === "HV220" ? 49 : varId === "QS900A" ? 121 :
                   varId === "QS900B" ? 75 : 50;
      const sd = base * 0.18;
      const n = Math.floor(2000 + r * 8000);
      const se = sd / Math.sqrt(n);
      const m = base + (r - 0.5) * sd * 0.4;
      rows.push({anio:y, estrato: strat ? "Total" : "Total",
                  n: n, media: m, ic_inf: m - 1.96*se, ic_sup: m + 1.96*se,
                  p25: m - 0.67*sd, p50: m, p75: m + 0.67*sd});
    } else {
      // categóricas: distribución
      const n = Math.floor(3000 + r * 7000);
      const cats = ["Categoría 1","Categoría 2","Categoría 3"];
      const props = [0.55 + r*0.1, 0.30 - r*0.05, 0.15 - r*0.05];
      cats.forEach((c, i) => {
        rows.push({anio:y, estrato:c, n: Math.round(n*props[i]),
                   prop: props[i], ic_inf: props[i]-0.02, ic_sup: props[i]+0.02});
      });
    }
  });

  if (vd.tipo === "continuo") {
    head.innerHTML = `<tr><th>Año</th><th>Estrato</th><th class="numeric">N</th>
      <th class="numeric">Media (IC95%)</th><th class="numeric">P25</th>
      <th class="numeric">P50</th><th class="numeric">P75</th></tr>`;
    body.innerHTML = rows.map(r =>
      `<tr><td>${r.anio}</td><td>${r.estrato}</td>
        <td class="numeric">${fmt.num(r.n)}</td>
        <td class="numeric">${fmt.est(r.media, r.ic_inf, r.ic_sup, false)}</td>
        <td class="numeric">${fmt.dec(r.p25)}</td>
        <td class="numeric">${fmt.dec(r.p50)}</td>
        <td class="numeric">${fmt.dec(r.p75)}</td></tr>`
    ).join("");
    // chart: serie temporal de la media
    const trend = years.map(y => rows.find(r => r.anio === y));
    if (typeof Plotly === "undefined") return; Plotly.newPlot("exp-chart", [{
      x: trend.map(r => r.anio), y: trend.map(r => r.media),
      type: "scatter", mode: "lines+markers",
      line: {color: PALETTE[0], width: 3},
      error_y: {type:"data", symmetric: false,
                array: trend.map(r => r.ic_sup - r.media),
                arrayminus: trend.map(r => r.media - r.ic_inf)}
    }], {title:`${vd.variable} · ${vd.etiqueta}`,
         xaxis:{title:"Año"}, yaxis:{title:"Media (IC95%)"},
         margin:{t:50}}, {responsive:true, displaylogo:false});
  } else {
    head.innerHTML = `<tr><th>Año</th><th>Categoría</th><th class="numeric">N</th>
      <th class="numeric">% (IC95%)</th></tr>`;
    body.innerHTML = rows.map(r =>
      `<tr><td>${r.anio}</td><td>${r.estrato}</td>
        <td class="numeric">${fmt.num(r.n)}</td>
        <td class="numeric">${fmt.est(r.prop, r.ic_inf, r.ic_sup, true)}%</td></tr>`
    ).join("");
    // chart: barras por categoría
    if (typeof Plotly === "undefined") return; Plotly.newPlot("exp-chart", [{
      x: rows.filter(r => r.anio === years[0]).map(r => r.estrato),
      y: rows.filter(r => r.anio === years[0]).map(r => r.prop * 100),
      type: "bar", marker: {color: PALETTE[0]}
    }], {title:`${vd.variable} · distribución ${years[0]}`,
         yaxis:{title:"%"}, margin:{t:50}}, {responsive:true,displaylogo:false});
  }
};

// ====================================================================
// EXPORT XLSX
// ====================================================================
App.exportXLSX = (prefix) => {
  const tbl = document.getElementById(`${prefix}-table`);
  if (!tbl) return;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(tbl);
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  // Hoja de metadatos
  const C = window.ENDES.CREDITS;
  const meta = [
    ["Calculadora Histórica ENDES Perú"],
    ["Autor", C.autor],
    ["Institución", C.institucion],
    ["Cargo", C.cargo],
    ["Reconocimiento", C.reconocimiento],
    ["ORCID", C.orcid],
    ["Fuente datos", C.fuente],
    ["Cobertura", C.cobertura],
    ["Fecha exportación", new Date().toISOString()],
    ["Cita sugerida", C.cita],
    ["Versión data", window.ENDES.VERSION]
  ];
  const wsMeta = XLSX.utils.aoa_to_sheet(meta);
  XLSX.utils.book_append_sheet(wb, wsMeta, "Metadatos");
  XLSX.writeFile(wb, `ENDES_${prefix}_${new Date().toISOString().slice(0,10)}.xlsx`);
};

// ====================================================================
// AYUDA / MODAL
// ====================================================================
App.openHelp = () => {
  // Auto-context
  const active = document.querySelector(".tab-content.active")?.id || "—";
  let ctx = `Tab: ${active}`;
  const ids = {univariado:["uni-outcome","uni-year","uni-strat"],
                bivariado:["bi-outcome","bi-cov","bi-year"],
                multivariado:["multi-outcome","multi-year","multi-model"],
                explorador:["exp-var","exp-year","exp-strat"]};
  (ids[active]||[]).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) ctx += ` | ${id}=${el.value}`;
  });
  if (active === "multivariado") {
    const mv = App.getMultiSelectValues("multi-main-select");
    if (mv.length) ctx += ` | variables=${mv.join(",")}`;
  }
  document.getElementById("help-context").value = ctx;
  document.getElementById("help-modal").classList.add("show");
};
App.closeHelp = () => {
  document.getElementById("help-modal").classList.remove("show");
};
App.submitHelp = () => {
  const tipo = document.getElementById("help-tipo").value;
  const nom = document.getElementById("help-nombre").value.trim();
  const mail = document.getElementById("help-email").value.trim();
  const inst = document.getElementById("help-inst").value.trim();
  const msg = document.getElementById("help-msg").value.trim();
  const ctx = document.getElementById("help-context").value;
  if (!nom || !mail || !msg) {
    alert("Por favor completa nombre, correo y mensaje.");
    return;
  }
  const body = encodeURIComponent(
    `Tipo: ${tipo}\n\nNombre: ${nom}\nCorreo: ${mail}\n` +
    `Institución: ${inst || "—"}\n\n` +
    `Contexto en calculadora: ${ctx}\n\nMensaje:\n${msg}\n\n` +
    `--\nEnviado desde la Calculadora ENDES Perú v${window.ENDES.VERSION}`
  );
  const subject = encodeURIComponent(`[Calculadora ENDES] ${tipo}`);
  window.location.href =
    `mailto:${window.ENDES.CREDITS.email}?subject=${subject}&body=${body}`;
  App.closeHelp();
};

// ====================================================================
// CITAR
// ====================================================================
App.cite = () => {
  const outcome = document.getElementById("multi-outcome").value;
  const mainVars = App.getMultiSelectValues("multi-main-select");
  const year = document.getElementById("multi-year").value;
  const od = window.ENDES.OUTCOMES.find(o => o.id === outcome);
  const varLabels = mainVars.map(id => {
    const v = window.ENDES.MAIN_VARS.find(x => x.id === id);
    return v ? v.etiqueta : id;
  }).join(" + ");
  const text =
    `Análisis multivariado: ${od ? od.etiqueta : outcome} ~ ${varLabels || "(sin variables)"} + ` +
    `confusores estándar (sexo, edad, área, educación, quintil de riqueza). ` +
    `ENDES ${year}. Datos: Calculadora Histórica ENDES Perú ` +
    `(Barboza JJ, Universidad Señor de Sipán, 2026). ` +
    `Disponible en: https://[usuario].github.io/endes-calculadora`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Cita copiada al portapapeles ✓");
    }).catch(() => prompt("Copia esta cita:", text));
  } else {
    prompt("Copia esta cita:", text);
  }
};

// ====================================================================
// INIT
// ====================================================================
document.addEventListener("DOMContentLoaded", App.init);
