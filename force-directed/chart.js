// =============================================
//  Force-Directed Graph
//  International Trade Network
//  D3.js v7  |  Year slider
// =============================================

const REGION_COLORS = {
  "Americas": "#e63946",
  "Europe":   "#4361ee",
  "Asia":     "#2a9d8f",
  "Oceania":  "#f4a261",
  "Africa":   "#9b5de5"
};

const YEARS = [2000, 2005, 2010, 2015, 2018];

// ── Leyenda ─────────────────────────────────────────────────────────
const legendEl = document.getElementById("legend");
Object.entries(REGION_COLORS).forEach(([region, color]) => {
  legendEl.innerHTML += `
    <div class="legend-item">
      <div class="legend-dot" style="background:${color}"></div>
      <span>${region}</span>
    </div>`;
});

// ── SVG setup ───────────────────────────────────────────────────────
const svg    = d3.select("#graph-svg");
const width  = document.getElementById("graph-svg").clientWidth  || 900;
const height = document.getElementById("graph-svg").clientHeight || 560;

svg.attr("viewBox", `0 0 ${width} ${height}`);

const gLink = svg.append("g").attr("class", "links");
const gNode = svg.append("g").attr("class", "nodes");

// Zoom
const zoom = d3.zoom()
  .scaleExtent([0.4, 3])
  .on("zoom", e => {
    gLink.attr("transform", e.transform);
    gNode.attr("transform", e.transform);
  });
svg.call(zoom);

// ── Tooltip ─────────────────────────────────────────────────────────
const tooltip = document.getElementById("tooltip");
const showTip = (ev, html) => {
  tooltip.style.opacity = 1;
  tooltip.innerHTML = html;
  tooltip.style.left = (ev.clientX + 14) + "px";
  tooltip.style.top  = (ev.clientY - 36) + "px";
};
svg.on("mousemove", ev => {
  tooltip.style.left = (ev.clientX + 14) + "px";
  tooltip.style.top  = (ev.clientY - 36) + "px";
});
const hideTip = () => tooltip.style.opacity = 0;

// ── Simulación ──────────────────────────────────────────────────────
const simulation = d3.forceSimulation()
  .force("link",    d3.forceLink().id(d => d.id).distance(120))
  .force("charge",  d3.forceManyBody().strength(-320))
  .force("center",  d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().radius(d => nodeRadius(d) + 8));

let currentYear = 2000;

function nodeRadius(d) {
  const t = (d.trade_by_year && d.trade_by_year[currentYear]) || d.trade;
  return Math.sqrt(t / 1e8) + 6;
}

// ── Drag ────────────────────────────────────────────────────────────
function drag(sim) {
  return d3.drag()
    .on("start", (ev, d) => {
      if (!ev.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on("drag",  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
    .on("end",   (ev, d) => {
      if (!ev.active) sim.alphaTarget(0);
      d.fx = null; d.fy = null;
    });
}

// ── Escalas ─────────────────────────────────────────────────────────
let linkWidthScale, linkOpacityScale;

// ── Render principal ─────────────────────────────────────────────────
let linkSel, nodeSel;

function update(nodes, links) {
  // Recalcular escalas con los valores actuales
  const vals = links.map(l => l.value);
  const maxVal = d3.max(vals) || 1;
  linkWidthScale   = d3.scaleLinear().domain([0, maxVal]).range([0.5, 8]);
  linkOpacityScale = d3.scaleLinear().domain([0, maxVal]).range([0.15, 0.8]);

  // ── Links ──────────────────────────────────────────────────────
  linkSel = gLink.selectAll("line")
    .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
    .join(
      enter => enter.append("line")
        .attr("class", "link")
        .attr("stroke-opacity", 0)
        .call(e => e.transition().duration(600)
          .attr("stroke-opacity", d => linkOpacityScale(d.value))),
      update => update.transition().duration(600)
        .attr("stroke-width",   d => linkWidthScale(d.value))
        .attr("stroke-opacity", d => linkOpacityScale(d.value)),
      exit => exit.transition().duration(300)
        .attr("stroke-opacity", 0).remove()
    )
    .attr("stroke-width", d => linkWidthScale(d.value));

  // ── Nodes ──────────────────────────────────────────────────────
  nodeSel = gNode.selectAll("g.node")
    .data(nodes, d => d.id)
    .join(
      enter => {
        const g = enter.append("g").attr("class", "node")
          .call(drag(simulation));

        g.append("circle")
          .attr("r", 0)
          .attr("fill", d => REGION_COLORS[d.region] || "#aaa")
          .transition().duration(600)
          .attr("r", d => nodeRadius(d));

        g.append("text")
          .attr("x", d => nodeRadius(d) + 3)
          .attr("y", 4)
          .text(d => d.id);

        g.on("mouseover", (ev, d) => {
            const t = (d.trade_by_year && d.trade_by_year[currentYear]) || d.trade;
            showTip(ev,
              `<strong>${d.id}</strong><br/>
               <span style="color:#aac4f5">${d.region}</span>
               <hr style="border:none;border-top:1px solid #444;margin:5px 0"/>
               <span style="color:#aaa">Trade (${currentYear})</span>&nbsp;$${(t/1e9).toFixed(0)}B`);
          })
          .on("mouseleave", hideTip);

        return g;
      },
      update => {
        update.select("circle")
          .transition().duration(600)
          .attr("r",    d => nodeRadius(d))
          .attr("fill", d => REGION_COLORS[d.region] || "#aaa");
        update.select("text")
          .attr("x", d => nodeRadius(d) + 3);
        return update;
      },
      exit => exit.transition().duration(300)
        .style("opacity", 0).remove()
    );

  // ── Simulación ─────────────────────────────────────────────────
  simulation.nodes(nodes).on("tick", () => {
    linkSel
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  simulation.force("link").links(links);
  simulation.alpha(0.5).restart();
}

// ── Cargar datos ─────────────────────────────────────────────────────
fetch("../data/force_directed_trade.json")
  .then(r => r.json())
  .then(data => {

    const allNodes = data.nodes;

    function getGraphForYear(yearIdx) {
      const year = YEARS[yearIdx];
      const activeLinks = data.links
        .filter(l => l.year === year)
        .map(l => ({ ...l }));

      const activeIds = new Set(
        activeLinks.flatMap(l => [l.source, l.target])
      );
      const activeNodes = allNodes.filter(n => activeIds.has(n.id));

      return { nodes: activeNodes, links: activeLinks };
    }

    // Render inicial
    const { nodes, links } = getGraphForYear(0);
    update(nodes, links);

    // ── Slider ──────────────────────────────────────────────────
    const slider  = document.getElementById("year-slider");
    const display = document.getElementById("year-display");

    slider.addEventListener("input", function() {
      const idx = +this.value;
      currentYear = YEARS[idx];
      display.textContent = currentYear;
      const { nodes, links } = getGraphForYear(idx);
      update(nodes, links);
    });
  });
