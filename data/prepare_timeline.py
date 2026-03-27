"""
Transforma df_1.csv (Kaggle: thedevastator/a-comprehensive-history-of-major-disease-outbrea)
al formato JSON requerido por el timeline.

Uso:
    python3 prepare_timeline.py /ruta/a/df_1.csv

Salida:
    timeline_diseases.json en el mismo directorio que este script
"""

import csv, json, re, sys, os

def extract_year(date_str):
    date_str = re.sub(r'\[.*?\]', '', date_str).strip()
    match = re.search(r'\b(\d{3,4})\b', date_str)
    return match.group(1) if match else None

def clean(text):
    return re.sub(r'\[.*?\]', '', text).strip()

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
input_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA_DIR, "df_1.csv")

data = []
with open(input_path, encoding='utf-8') as f:
    for row in csv.DictReader(f):
        year = extract_year(row['Date'])
        if not year:
            continue
        data.append({
            'year': year,
            'event': clean(row['Epidemics/pandemics']),
            'category': clean(row['Disease']),
            'date': clean(row['Date']),
            'deaths': clean(row['Death toll']),
            'location': clean(row['Location']),
            'description': clean(row['Epidemics/pandemics'])
        })

data = [d for d in data if int(d['year']) >= 1300]
data.sort(key=lambda x: int(x['year']))

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'timeline_diseases.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Escrito: {len(data)} eventos -> {output_path}")
for d in data:
    print(f"  {d['year']} | {d['event'][:45]:45} | {d['category']}")
