"""
Transforma super_hero_powers.csv + heroes_information.csv
(Kaggle: claudiodavi/superhero-set, CC0) al formato JSON del UpSet Plot.

Selecciona los TOP_POWERS poderes más frecuentes entre héroes de Marvel y DC.
Filtra a héroes que tengan al menos 2 de esos poderes.

Uso:
    python3 prepare_upset.py

Salida:
    upset_heroes.json en el mismo directorio
"""

import csv, json, os
from collections import Counter

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
TOP_POWERS = 8       # número de poderes a incluir
MIN_POWERS = 2       # mínimo de poderes top que debe tener un héroe para incluirse
MAX_HEROES = 150     # máximo de héroes en el output

# ── 1. Cargar info de héroes (publisher, alignment) ──────────────────
info = {}
with open(os.path.join(DATA_DIR, "heroes_information.csv"), encoding="utf-8") as f:
    for row in csv.DictReader(f):
        info[row["name"]] = {
            "publisher": row["Publisher"],
            "alignment": row["Alignment"]
        }

# ── 2. Cargar poderes ─────────────────────────────────────────────────
heroes = []
power_cols = []
with open(os.path.join(DATA_DIR, "super_hero_powers.csv"), encoding="utf-8") as f:
    reader = csv.DictReader(f)
    power_cols = [c for c in reader.fieldnames if c != "hero_names"]
    for row in reader:
        name = row["hero_names"]
        publisher = info.get(name, {}).get("publisher", "")
        if publisher not in ("Marvel Comics", "DC Comics"):
            continue
        powers = {p: row[p] == "True" for p in power_cols}
        heroes.append({"name": name, "publisher": publisher, "powers": powers})

# ── 3. Encontrar los TOP_POWERS poderes más frecuentes ───────────────
counter = Counter()
for h in heroes:
    for p, v in h["powers"].items():
        if v:
            counter[p] += 1

top_powers = [p for p, _ in counter.most_common(TOP_POWERS)]
print(f"Top {TOP_POWERS} poderes: {top_powers}")

# ── 4. Filtrar héroes con al menos MIN_POWERS de los top ─────────────
result = []
for h in heroes:
    row = {"hero": h["name"], "publisher": h["publisher"]}
    count = 0
    for p in top_powers:
        val = h["powers"].get(p, False)
        row[p] = val
        if val:
            count += 1
    if count >= MIN_POWERS:
        result.append(row)

# Limitar número de héroes
result = result[:MAX_HEROES]

# ── 5. Guardar ────────────────────────────────────────────────────────
output = os.path.join(DATA_DIR, "upset_heroes.json")
with open(output, "w", encoding="utf-8") as f:
    json.dump({"powers": top_powers, "heroes": result}, f, ensure_ascii=False, indent=2)

print(f"Héroes incluidos: {len(result)}")
print(f"Escrito: {output}")
print("\nDistribución por publisher:")
from collections import Counter as C
pubs = C(h["publisher"] for h in result)
for pub, n in pubs.items():
    print(f"  {pub}: {n}")
