// =============================================
//  Timeline — Grandes epidemias y pandemias
//  d3-milestones v1.6.0
// =============================================

const COLORS = {
  "Bubonic plague":        "#1a1a2e",
  "Smallpox":              "#e63946",
  "Smallpox or measles":   "#e63946",
  "Influenza A/H1N1":      "#4361ee",
  "Influenza A/H2N2":      "#4361ee",
  "Influenza A/H3N2":      "#4361ee",
  "Influenza (disputed)":  "#4361ee",
  "Cholera":               "#2a9d8f",
  "Typhus":                "#f4a261",
  "HIV/AIDS":              "#9b5de5",
  "COVID-19":              "#e9c46a",
  "Cocoliztli":            "#adb5bd"
};

// Categorías agrupadas para la leyenda
const LEGEND = {
  "Bubonic plague":  "#1a1a2e",
  "Smallpox":        "#e63946",
  "Influenza":       "#4361ee",
  "Cholera":         "#2a9d8f",
  "Typhus":          "#f4a261",
  "HIV/AIDS":        "#9b5de5",
  "COVID-19":        "#e9c46a",
  "Cocoliztli":      "#adb5bd"
};

// ── Leyenda ─────────────────────────────────────────────────────────
const legendEl = document.getElementById("legend");
Object.entries(LEGEND).forEach(([cat, color]) => {
  legendEl.innerHTML += `
    <div class="legend-item">
      <div class="legend-dot" style="background:${color}"></div>
      <span>${cat}</span>
    </div>`;
});

// ── Tooltip ─────────────────────────────────────────────────────────
const tooltip = document.getElementById("tooltip");
let mouseX = 0, mouseY = 0;

document.addEventListener("mousemove", ev => {
  mouseX = ev.clientX;
  mouseY = ev.clientY;
  if (tooltip.style.opacity === "1") {
    tooltip.style.left = (mouseX + 14) + "px";
    tooltip.style.top  = (mouseY - 36) + "px";
  }
});

function showTooltip(d) {
  tooltip.style.opacity = 1;
  tooltip.style.left = (mouseX + 14) + "px";
  tooltip.style.top  = (mouseY - 36) + "px";
  tooltip.innerHTML = `
    <strong>${d.event}</strong><br/>
    <span style="color:#aac4f5;font-size:0.78rem">${d.category}</span>
    <hr style="border:none;border-top:1px solid #444;margin:5px 0"/>
    <span style="color:#aaa">Date</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${d.date}<br/>
    <span style="color:#aaa">Deaths</span>&nbsp;&nbsp;${d.deaths}<br/>
    <span style="color:#aaa">Location</span>&nbsp;${d.location}
  `;
}
function hideTooltip() {
  tooltip.style.opacity = 0;
}

// ── Cargar datos y renderizar ────────────────────────────────────────
fetch("../data/timeline_diseases.json")
  .then(r => r.json())
  .then(data => {

    const styled = data.map(d => ({
      ...d,
      bulletStyle: {
        "background-color": COLORS[d.category] || "#888",
        "border-color":     COLORS[d.category] || "#888",
        "width":  "12px",
        "height": "12px"
      },
      categoryStyle: {
        "color":       COLORS[d.category] || "#888",
        "font-weight": "600",
        "font-size":   "0.75rem"
      }
    }));

    milestones("#timeline")
      .mapping({
        timestamp:     "year",
        text:          "event",
        bulletStyle:   "bulletStyle",
        categoryStyle: "categoryStyle"
      })
      .parseTime("%Y")
      .aggregateBy("year")
      .scaleType("time")
      .orientation("horizontal")
      .distribution("top-bottom")
      .optimize(true)
      .useLabels(true)
      .autoResize(true)
      .onEventMouseOver(function(event) {
        const d = event.target.__data__;
        if (d && d.attributes) showTooltip(d.attributes);
      })
      .onEventMouseLeave(hideTooltip)
      .render(styled);
  });
