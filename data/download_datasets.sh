#!/bin/bash
# =============================================================================
# PEC2 — Descarga de datasets
# =============================================================================
# Requiere: kaggle CLI instalado y ~/.kaggle/kaggle.json configurado
#   pip install kaggle
#   Obtener API key en: https://www.kaggle.com/settings -> API -> Create New Token
#
# Uso:
#   chmod +x download_datasets.sh
#   ./download_datasets.sh
# =============================================================================

DATA_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Descargando datasets en: $DATA_DIR"
echo ""

# -----------------------------------------------------------------------------
# 1. TIMELINE — Major Disease Outbreaks
# -----------------------------------------------------------------------------
# Fuente : https://www.kaggle.com/datasets/thedevastator/a-comprehensive-history-of-major-disease-outbrea
# Licencia: CC0 Public Domain
# Archivo : df_1.csv
# Uso     : prepare_timeline.py genera timeline_diseases.json
# -----------------------------------------------------------------------------
echo "[1/3] Timeline: Major Disease Outbreaks (CC0)..."
kaggle datasets download \
  -d thedevastator/a-comprehensive-history-of-major-disease-outbrea \
  -p "$DATA_DIR" --unzip
echo ""

# -----------------------------------------------------------------------------
# 2. FORCE-DIRECTED — Trade Network (163 countries, 2000–2018)
# -----------------------------------------------------------------------------
# Fuente : https://www.kaggle.com/datasets/yasirtariq/tradenetwork
# Licencia: ODbL 1.0
# Archivos: 2000.net, 2005.net, 2010.net, 2015.net, 2018.net (formato Pajek)
# Uso     : prepare_force.py genera force_directed_trade.json
# -----------------------------------------------------------------------------
echo "[2/3] Force-Directed: Trade Network (ODbL)..."
kaggle datasets download \
  -d yasirtariq/tradenetwork \
  -p "$DATA_DIR" --unzip
echo ""

# -----------------------------------------------------------------------------
# 3. FORCE-DIRECTED (complemento) — Country mapping ISO3 → Region
# -----------------------------------------------------------------------------
# Fuente : https://www.kaggle.com/datasets/andradaolteanu/country-mapping-iso-continent-region
# Licencia: CC BY-SA 4.0
# Archivo : continents2.csv
# Uso     : prepare_force.py lo usa para asignar región a cada país
# -----------------------------------------------------------------------------
echo "[3/3] Regiones: Country Mapping ISO-Continent (CC BY-SA 4.0)..."
kaggle datasets download \
  -d andradaolteanu/country-mapping-iso-continent-region \
  -p "$DATA_DIR" --unzip
echo ""

# -----------------------------------------------------------------------------
# 4. UPSET — Superhero Powers (Marvel & DC)
# -----------------------------------------------------------------------------
# Fuente : https://www.kaggle.com/datasets/claudiodavi/superhero-set
# Licencia: CC0 Public Domain
# Archivos: super_hero_powers.csv, heroes_information.csv
# Uso     : prepare_upset.py genera upset_heroes.json
# -----------------------------------------------------------------------------
echo "[4/4] UpSet: Superhero Powers (CC0)..."
kaggle datasets download \
  -d claudiodavi/superhero-set \
  -p "$DATA_DIR" --unzip
echo ""

echo "✓ Descarga completada."
echo ""
echo "Transformar los datos:"
echo "  python3 prepare_timeline.py"
echo "  python3 prepare_force.py"
echo "  python3 prepare_upset.py"
