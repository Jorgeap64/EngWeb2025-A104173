import json

# Load the JSON data from a file
with open("TPC4/dataset/cinema.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Add an ID to each movie
for index, movie in enumerate(data["filmes"], start=1):
    movie["id"] = index

# Save the updated JSON back to the file
with open("TPC4/dataset/cinema.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=2, ensure_ascii=False)

print("IDs added successfully!")