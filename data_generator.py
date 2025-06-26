import json
import os

class DataGenerator:
    def __init__(self, processed_data_path, output_dir):
        self.processed_data_path = processed_data_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_tours_data(self, data):
        tours = []
        for item in data:
            # Simple heuristic to categorize as tour (can be refined)
            if "parque" in item["title_pt"].lower() or "atração" in item["title_pt"].lower():
                tours.append({
                    "id": item["slug"],
                    "name": item["title_pt"],
                    "name_en": item["title_en"],
                    "description": item["description_pt"],
                    "description_en": item["description_en"],
                    "image": item["hero_image"],
                    "gallery": item["gallery"],
                    "price": "$XX.XX", # Placeholder
                    "rating": 4.5, # Placeholder
                    "location": item["location"],
                    "category": "Theme Park" if "parque temático" in item["title_pt"].lower() else "Attraction",
                    "video_embed": item["video_embed"]
                })
        return tours

    def generate_restaurants_data(self, data):
        restaurants = []
        for item in data:
            # Simple heuristic to categorize as restaurant (can be refined)
            if "restaurante" in item["title_pt"].lower() or "gastronomia" in item["title_pt"].lower():
                restaurants.append({
                    "id": item["slug"],
                    "name": item["title_pt"],
                    "name_en": item["title_en"],
                    "description": item["description_pt"],
                    "description_en": item["description_en"],
                    "image": item["hero_image"],
                    "gallery": item["gallery"],
                    "price_range": "$$", # Placeholder
                    "rating": 4.0, # Placeholder
                    "cuisine": "Variada", # Placeholder
                    "location": item["location"],
                    "video_embed": item["video_embed"]
                })
        return restaurants

    def generate_all_data(self):
        with open(self.processed_data_path, "r", encoding="utf-8") as f:
            processed_data = json.load(f)

        tours_data = self.generate_tours_data(processed_data)
        restaurants_data = self.generate_restaurants_data(processed_data)

        with open(os.path.join(self.output_dir, "tours.json"), "w", encoding="utf-8") as f:
            json.dump(tours_data, f, ensure_ascii=False, indent=4)
        print("Generated {} tours and saved to {}".format(len(tours_data), os.path.join(self.output_dir, "tours.json")))

        with open(os.path.join(self.output_dir, "restaurants.json"), "w", encoding="utf-8") as f:
            json.dump(restaurants_data, f, ensure_ascii=False, indent=4)
        print("Generated {} restaurants and saved to {}".format(len(restaurants_data), os.path.join(self.output_dir, "restaurants.json")))

if __name__ == "__main__":
    generator = DataGenerator(
        processed_data_path="/home/ubuntu/content_importer/processed_content.json",
        output_dir="/home/ubuntu/experience-florida/src/data"
    )
    generator.generate_all_data()


