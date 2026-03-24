// =============================================
//  UpSet Plot — Superhero Powers
//  D3.js v7  |  Implementación manual
// =============================================

// Layout
const margin  = { top: 160, right: 30, bottom: 20, left: 160 };
const colW    = 52;
const rowH    = 36;
const barMaxH = 130;
const setBarW = 120;
const dotR    = 8;

// Tooltip
const tooltip = document.getElementById("tooltip");
const showTip = (ev, html) => {
  tooltip.style.opacity = 1;
  tooltip.innerHTML = html;
  tooltip.style.left = (ev.clientX + 14) + "px";
  tooltip.style.top  = (ev.clientY - 40) + "px";
};
const hideTip = () => tooltip.style.opacity = 0;

fetch("../data/upset_heroes.json")
  .then(r => r.json())
  .then(({ powers: SETS, heroes: data }) => {

    // ── 1. Calcular intersecciones ─────────────────────────────────
    const intersections = new Map();

    data.forEach(hero => {
      const key = SETS.map(s => hero[s] ? "1" : "0").join("");
      if (!intersections.has(key)) {
        intersections.set(key, { key, count: 0, heroes: [], sets: [] });
        SETS.forEach((s, i) => { if (key[i] === "1") intersections.get(key).sets.push(s); });
      }
      const inter = intersections.get(key);
      inter.count++;
      inter.heroes.push(hero.hero);
    });

    // Ordenar por count descendente, tomar top 20
    const sorted = [...intersections.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // ── 2. Calcular tamaño total de cada set ──────────────────────
    const setCounts = {};
    SETS.forEach(s => {
      setCounts[s] = data.filter(d => d[s]).length;
    });

    // ── 3. Dimensiones SVG ────────────────────────────────────────
    const nCols = sorted.length;
    const nRows = SETS.length;
    const svgW  = margin.left + nCols * colW + margin.right + setBarW + 20;
    const svgH  = margin.top  + nRows * rowH + margin.bottom + 30;

    const svg = d3.select("#upset-svg")
      .attr("viewBox", `0 0 ${svgW} ${svgH}`)
      .style("height", svgH + "px");

    // ── 4. Escalas ────────────────────────────────────────────────
    const xScale = d3.scaleBand()
      .domain(d3.range(nCols))
      .range([margin.left, margin.left + nCols * colW])
      .padding(0.15);

    const barScale = d3.scaleLinear()
      .domain([0, d3.max(sorted, d => d.count)])
      .range([0, barMaxH]);

    const setBarScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(setCounts))])
      .range([0, setBarW]);

    // ── 5. Barras superiores (cardinalidad de intersecciones) ──────
    const barG = svg.append("g").attr("class", "intersection-bars");

    barG.selectAll("rect")
      .data(sorted)
      .join("rect")
      .attr("class", "bar-intersection")
      .attr("x", (d, i) => xScale(i))
      .attr("width", xScale.bandwidth())
      .attr("y", d => margin.top - barMaxH - 10 + (barMaxH - barScale(d.count)))
      .attr("height", d => barScale(d.count))
      .attr("rx", 3)
      .on("mouseover", (ev, d) => {
        showTip(ev,
          `<strong>${d.count} hero${d.count > 1 ? "es" : ""}</strong><br/>
           Powers: ${d.sets.join(", ") || "none"}<br/>
           <span style="color:#aac4f5;font-size:0.78rem">${d.heroes.slice(0, 5).join(", ")}${d.heroes.length > 5 ? "…" : ""}</span>`);
      })
      .on("mouseleave", hideTip);

    // Valores sobre las barras
    barG.selectAll("text")
      .data(sorted)
      .join("text")
      .attr("class", "bar-value")
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("y", d => margin.top - barMaxH - 10 + (barMaxH - barScale(d.count)) - 4)
      .attr("text-anchor", "middle")
      .text(d => d.count);

    // Eje Y barras superiores
    const yAxisBar = d3.axisLeft(
      d3.scaleLinear()
        .domain([0, d3.max(sorted, d => d.count)])
        .range([margin.top - 10, margin.top - barMaxH - 10])
    ).ticks(d3.max(sorted, d => d.count)).tickFormat(d3.format("d"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxisBar)
      .selectAll("text").attr("class", "axis-label");

    svg.append("text")
      .attr("x", margin.left - 40)
      .attr("y", margin.top - barMaxH / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, ${margin.left - 40}, ${margin.top - barMaxH / 2 - 10})`)
      .attr("font-size", "10px").attr("fill", "#888")
      .text("No. heroes");

    // ── 6. Matriz ─────────────────────────────────────────────────
    const matrixG = svg.append("g").attr("class", "matrix");

    SETS.forEach((s, ri) => {
      matrixG.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top + ri * rowH)
        .attr("width", nCols * colW)
        .attr("height", rowH)
        .attr("fill", ri % 2 === 0 ? "#f0f2fb" : "#f8f9fe");
    });

    sorted.forEach((inter, ci) => {
      const cx = xScale(ci) + xScale.bandwidth() / 2;
      const activeSets = SETS.map((s, ri) => ({ s, ri, active: inter.key[ri] === "1" }));
      const activeRows = activeSets.filter(d => d.active);

      if (activeRows.length > 1) {
        const ys = activeRows.map(d => margin.top + d.ri * rowH + rowH / 2);
        matrixG.append("line")
          .attr("class", "matrix-line")
          .attr("x1", cx).attr("x2", cx)
          .attr("y1", d3.min(ys)).attr("y2", d3.max(ys));
      }

      activeSets.forEach(({ s, ri, active }) => {
        const cy = margin.top + ri * rowH + rowH / 2;
        matrixG.append("circle")
          .attr("class", active ? "matrix-dot-active" : "matrix-dot-inactive")
          .attr("cx", cx).attr("cy", cy)
          .attr("r", dotR);
      });
    });

    // Etiquetas de conjunto (eje Y izquierdo)
    SETS.forEach((s, ri) => {
      svg.append("text")
        .attr("class", "set-label")
        .attr("x", margin.left - 10)
        .attr("y", margin.top + ri * rowH + rowH / 2 + 4)
        .attr("text-anchor", "end")
        .text(s);
    });

    // ── 7. Barras laterales (tamaño total de cada set) ─────────────
    const setBarG = svg.append("g").attr("class", "set-bars");
    const setBarX = margin.left + nCols * colW + 20;

    SETS.forEach((s, ri) => {
      const cy = margin.top + ri * rowH;
      const bh = Math.min(rowH - 6, 20);
      const bw = setBarScale(setCounts[s]);

      setBarG.append("rect")
        .attr("class", "bar-set")
        .attr("x", setBarX)
        .attr("y", cy + (rowH - bh) / 2)
        .attr("width", bw)
        .attr("height", bh)
        .attr("rx", 3)
        .on("mouseover", (ev) => {
          showTip(ev,
            `<strong>${s}</strong><br/>
             Total heroes: ${setCounts[s]}`);
        })
        .on("mouseleave", hideTip);

      setBarG.append("text")
        .attr("class", "bar-value")
        .attr("x", setBarX + bw + 5)
        .attr("y", cy + rowH / 2 + 4)
        .text(setCounts[s]);
    });

    svg.append("text")
      .attr("x", setBarX + setBarW / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px").attr("fill", "#888")
      .text("Total per power");

  });
