"""
Transforma archivos .net (Pajek) de Trade Network (Kaggle: yasirtariq/tradenetwork)
al formato JSON requerido por el force-directed graph.

Combina con continents2.csv (Kaggle: andradaolteanu/country-mapping-iso-continent-region)
para añadir región a cada nodo.

Uso:
    python3 prepare_force.py

Salida:
    force_directed_trade.json en el mismo directorio
"""

import re, json, csv, os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
YEARS = [2000, 2005, 2010, 2015, 2018]
TOP_N = 20       # número de países a incluir por volumen total de comercio
TOP_LINKS = 5    # top K socios comerciales por país y año

# ── 1. Cargar mapping ISO3 → región ──────────────────────────────────
region_map = {}
with open(os.path.join(DATA_DIR, "continents2.csv"), encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        region_map[row["alpha-3"]] = row["region"]

# ── 2. Parsear archivos .net ──────────────────────────────────────────
def parse_net(filepath):
    nodes = {}  # idx -> iso3
    arcs = []
    section = None
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.lower().startswith("*vertices"):
                section = "vertices"
            elif line.lower().startswith("*arcs") or line.lower().startswith("*edges"):
                section = "arcs"
            elif section == "vertices" and line:
                m = re.match(r'\s*(\d+)\s+"([^"]+)"', line)
                if m:
                    nodes[int(m.group(1))] = m.group(2)
            elif section == "arcs" and line:
                parts = line.split()
                if len(parts) >= 3:
                    arcs.append((int(parts[0]), int(parts[1]), float(parts[2])))
    return nodes, arcs

# ── 3. Calcular volumen total por país (todos los años) ───────────────
total_trade = {}
all_data = {}
for year in YEARS:
    path = os.path.join(DATA_DIR, f"{year}.net")
    nodes, arcs = parse_net(path)
    all_data[year] = (nodes, arcs)
    for src, tgt, val in arcs:
        iso_s = nodes[src]
        iso_t = nodes[tgt]
        total_trade[iso_s] = total_trade.get(iso_s, 0) + val
        total_trade[iso_t] = total_trade.get(iso_t, 0) + val

# ── 4. Seleccionar top N países ───────────────────────────────────────
top_countries = set(sorted(total_trade, key=total_trade.get, reverse=True)[:TOP_N])

# ── 5. Construir JSON final ───────────────────────────────────────────
# Volumen de comercio por país y año
trade_by_year = {year: {} for year in YEARS}
for year in YEARS:
    nodes, arcs = all_data[year]
    for src, tgt, val in arcs:
        iso_s = nodes[src]
        iso_t = nodes[tgt]
        if iso_s in top_countries:
            trade_by_year[year][iso_s] = trade_by_year[year].get(iso_s, 0) + val
        if iso_t in top_countries:
            trade_by_year[year][iso_t] = trade_by_year[year].get(iso_t, 0) + val

# Nodos únicos con su región y volumen por año
nodes_set = {}
for iso3 in top_countries:
    nodes_set[iso3] = {
        "id": iso3,
        "label": iso3,
        "region": region_map.get(iso3, "Unknown"),
        "trade": round(total_trade[iso3]),
        "trade_by_year": {str(y): round(trade_by_year[y].get(iso3, 0)) for y in YEARS}
    }

# Links por año (solo entre top países)
links_by_year = {year: [] for year in YEARS}
for year in YEARS:
    nodes, arcs = all_data[year]
    # Agrupar arcs por país origen, ordenar por valor, tomar top K
    from collections import defaultdict
    by_source = defaultdict(list)
    for src, tgt, val in arcs:
        iso_s = nodes[src]
        iso_t = nodes[tgt]
        if iso_s in top_countries and iso_t in top_countries and iso_s != iso_t:
            by_source[iso_s].append((val, iso_t))
    seen = set()
    for iso_s, partners in by_source.items():
        partners.sort(reverse=True)
        for val, iso_t in partners[:TOP_LINKS]:
            key = tuple(sorted([iso_s, iso_t]))
            if key not in seen:
                seen.add(key)
                links_by_year[year].append({
                    "source": iso_s,
                    "target": iso_t,
                    "value": round(val, 1),
                    "year": year
                })

# Construir estructura final
result = {
    "nodes": list(nodes_set.values()),
    "links": []
}
for year, links in links_by_year.items():
    result["links"].extend(links)

output = os.path.join(DATA_DIR, "force_directed_trade.json")
with open(output, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

# ── 6. Estadísticas ───────────────────────────────────────────────────
print(f"Nodos: {len(result['nodes'])}")
print(f"Links totales: {len(result['links'])}")
for year in YEARS:
    n = sum(1 for l in result["links"] if l["year"] == year)
    print(f"  {year}: {n} links")
print(f"\nEscrito: {output}")
print("\nTop 10 países por volumen:")
for iso3 in sorted(total_trade, key=total_trade.get, reverse=True)[:10]:
    print(f"  {iso3}: {total_trade[iso3]:,.0f} — {region_map.get(iso3, '?')}")
