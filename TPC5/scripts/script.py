import csv
import json

path = "TPC5/dataset/"
csv_file = path + "contratos2024.csv/contratos2024.csv"
json_file = path + "contratos.json"

# Abrir o CSV e converter para JSON
with open(csv_file, encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter=';')
    data = []

    for row in reader:
        try:
            row["_id"] = str(row["idcontrato"])
            del row["idcontrato"]
            row["precoContratual"] = float(row["precoContratual"].replace(",", "."))
            row["prazoExecucao"] = int(row["prazoExecucao"])
            row["NIPC_entidade_comunicante"] = int(row["NIPC_entidade_comunicante"])
            data.append(row)
        except ValueError as e:
            print(f"Erro ao converter linha: {row['idcontrato'] if 'idcontrato' in row else 'sem id'} - {e}")

# Salvar em JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Conversão concluída!")
