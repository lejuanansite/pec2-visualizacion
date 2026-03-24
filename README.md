# PEC2 — Técnicas de Visualización de Datos
**M2.859 Visualización de Datos · UOC**

🌐 **https://lejuanansite.github.io/pec2-visualizacion/**

---

## Visualizaciones

| Técnica | Tema | Dataset | Licencia |
|---|---|---|---|
| [Timeline](https://lejuanansite.github.io/pec2-visualizacion/timeline/) | Grandes epidemias y pandemias (165 AD – 2019) | [Kaggle](https://www.kaggle.com/datasets/thedevastator/a-comprehensive-history-of-major-disease-outbrea) | CC0 |
| [Force-Directed Graph](https://lejuanansite.github.io/pec2-visualizacion/force-directed/) | Red de comercio internacional (2000–2018) | [Kaggle](https://www.kaggle.com/datasets/yasirtariq/tradenetwork) | ODbL 1.0 |
| [UpSet Plot](https://lejuanansite.github.io/pec2-visualizacion/upset/) | Poderes de superhéroes Marvel & DC | [Kaggle](https://www.kaggle.com/datasets/claudiodavi/superhero-set) | CC0 |

## Herramientas
- [D3.js v7](https://d3js.org/)
- [d3-milestones v1.6.0](https://github.com/walterra/d3-milestones) (Timeline)
- GitHub Pages

## Reproducir los datos

Requiere [kaggle CLI](https://www.kaggle.com/docs/api) configurado con API key.

```bash
cd data/
./download_datasets.sh   # descarga los datasets originales
python3 prepare_timeline.py
python3 prepare_force.py
python3 prepare_upset.py
```
