import json
import re
from slugify import slugify
from media_handler import MediaHandler

class ContentProcessor:
    def __init__(self):
        self.media_handler = MediaHandler()

    def _simulate_rewrite_and_translate(self, text, lang):
        # This is a simulation. In a real scenario, this would use an LLM.
        if lang == "pt":
            # Simple paraphrasing for Portuguese
            if "Orlando" in text:
                return text.replace("Orlando", "a capital mundial da diversão")
            return "Descubra: " + text + " (reescrito)"
        elif lang == "en":
            # Simple translation for English
            if "Orlando" in text:
                return text.replace("Orlando", "the world capital of fun")
            return "Discover: " + text + " (rewritten and translated)"
        return text

    def process_data(self, input_file, output_file):
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        processed_data = []
        for item in data:
            original_title_pt = item.get("title", "")
            original_description_pt = item.get("description", "")

            # Simulate rewriting Portuguese title and description
            rewritten_title_pt = self._simulate_rewrite_and_translate(original_title_pt, "pt")
            rewritten_description_pt = self._simulate_rewrite_and_translate(original_description_pt, "pt")

            # Simulate translating to English
            translated_title_en = self._simulate_rewrite_and_translate(rewritten_title_pt, "en")
            translated_description_en = self._simulate_rewrite_and_translate(rewritten_description_pt, "en")

            # Generate slug
            slug = slugify(rewritten_title_pt)

            hero_image_url = None
            gallery_images = []
            video_embed_url = None

            # Process content elements for images and videos
            for element in item.get("content_elements", []):
                if element.get("type") == "image":
                    downloaded_path = self.media_handler.download_and_optimize_image(element["src"], slug)
                    if downloaded_path:
                        if not hero_image_url:
                            hero_image_url = downloaded_path
                        gallery_images.append(downloaded_path)
                elif element.get("type") == "video":
                    video_embed_url = self.media_handler.handle_video_embed(element["src"])

            # Placeholder for content elements (simplified for this simulation)
            description_pt_html = "<p>" + rewritten_description_pt + "</p>"
            description_en_html = "<p>" + translated_description_en + "</p>"

            processed_item = {
                "title_pt": rewritten_title_pt,
                "title_en": translated_title_en,
                "slug": slug,
                "category": "Geral", # Placeholder
                "excerpt_pt": rewritten_description_pt[:100] + "..." if len(rewritten_description_pt) > 100 else rewritten_description_pt,
                "excerpt_en": translated_description_en[:100] + "..." if len(translated_description_en) > 100 else translated_description_en,
                "description_pt": description_pt_html,
                "description_en": description_en_html,
                "hero_image": hero_image_url if hero_image_url else "/media/placeholder.jpg",
                "gallery": gallery_images,
                "video_embed": video_embed_url,
                "duration": None, # Placeholder
                "price_from": None, # Placeholder
                "location": "Orlando, FL", # Placeholder
                "tags": [], # Placeholder
                "seo": {
                    "meta_title_pt": f"{rewritten_title_pt} | Experience Florida",
                    "meta_desc_pt": f"Descubra {rewritten_title_pt} em Orlando...",
                    "meta_title_en": f"{translated_title_en} | Experience Florida",
                    "meta_desc_en": f"Discover {translated_title_en} in Orlando..."
                }
            }
            processed_data.append(processed_item)

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=4)
        print(f"Processed {len(processed_data)} items and saved to {output_file}")

if __name__ == "__main__":
    processor = ContentProcessor()
    processor.process_data(
        input_file="/home/ubuntu/content_importer/collected_data.json",
        output_file="/home/ubuntu/content_importer/processed_content.json"
    )


