import json
import re
from slugify import slugify

def parse_content(content_string):
    data = {
        "Restaurantes Temáticos": [],
        "Cafés da Manhã": [],
        "Passeios para Família": [],
        "Tour de Compras de Marcas": [],
        "Tour de Compras Mais Baratas": [],
        "Baladas e Passeios para Adultos": [],
        "Roteiro de Passeios": [],
        "Roteiro de Cidades Próximas": []
    }

    current_section = None
    lines = content_string.split("\n")
    temp_item_data = {}
    
    # Regex for extracting details for Restaurants
    restaurant_detail_regex = {
        "Tema": r"Tema:\s*(.*)",
        "Endereço": r"Endereço:\s*(.*)",
        "Horário": r"Horário:\s*(.*)",
        "Telefone": r"Telefone:\s*(.*)",
        "Instagram": r"Instagram:\s*(@[^|]+)",
        "Facebook": r"Facebook:\s*([^|]+)",
        "TikTok": r"TikTok:\s*(#.+)"
    }

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for section headers
        if line in data:
            current_section = line
            temp_item_data = {} # Reset for new section
            continue

        if current_section:
            if current_section == "Restaurantes Temáticos":
                if "Tema:" in line:
                    # If we have a previous item, save it before starting a new one
                    if temp_item_data.get("name") and "description" in temp_item_data:
                        data[current_section].append(temp_item_data)
                    temp_item_data = {"name": "", "description": ""}
                    temp_item_data["description"] = line.replace("Tema:", "").strip()
                elif "Endereço:" in line:
                    temp_item_data["address"] = line.replace("Endereço:", "").strip()
                elif "Horário:" in line:
                    temp_item_data["hours"] = line.replace("Horário:", "").strip()
                elif "Telefone:" in line:
                    temp_item_data["phone"] = line.replace("Telefone:", "").strip()
                elif "Instagram:" in line or "Facebook:" in line or "TikTok:" in line:
                    social_links = temp_item_data.get("social", {})
                    insta_match = re.search(restaurant_detail_regex["Instagram"], line)
                    if insta_match: social_links["instagram"] = insta_match.group(1).strip()
                    fb_match = re.search(restaurant_detail_regex["Facebook"], line)
                    if fb_match: social_links["facebook"] = fb_match.group(1).strip()
                    tiktok_match = re.search(restaurant_detail_regex["TikTok"], line)
                    if tiktok_match: social_links["tiktok"] = tiktok_match.group(1).strip()
                    temp_item_data["social"] = social_links
                elif not temp_item_data.get("name") and not any(k in line for k in restaurant_detail_regex.keys()):
                    # This is likely the name of the restaurant
                    temp_item_data["name"] = line.strip()
                else:
                    # Append to description if it's not a known field and name is set
                    if temp_item_data.get("name") and not any(k in line for k in restaurant_detail_regex.keys()):
                        temp_item_data["description"] += " " + line.strip()

            elif current_section == "Cafés da Manhã":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue # Skip partial items or multi-line items for now
                data[current_section].append({"name": line.strip()})
            
            elif current_section == "Passeios para Família":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue
                data[current_section].append({"name": line.strip()})

            elif current_section == "Tour de Compras de Marcas":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue
                data[current_section].append({"name": line.strip()})

            elif current_section == "Tour de Compras Mais Baratas":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue
                data[current_section].append({"name": line.strip()})

            elif current_section == "Baladas e Passeios para Adultos":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue
                data[current_section].append({"name": line.strip()})

            elif current_section == "Roteiro de Passeios":
                if line.endswith("...") or line.startswith("Dia ") or ":" in line:
                    continue
                data[current_section].append({"name": line.strip()})

            elif current_section == "Roteiro de Cidades Próximas":
                # This section has a different format (Day 1: ..., Day 2: ...)
                if line.startswith("Dia "):
                    data[current_section].append({"name": line.strip()})

    # Add the last collected item for Restaurantes Temáticos if any
    if current_section == "Restaurantes Temáticos" and temp_item_data.get("name") and "description" in temp_item_data:
        data[current_section].append(temp_item_data)

    return data

def generate_json_payloads(parsed_data):
    all_items = []

    # Helper for translation simulation
    def simulate_translation(text, target_lang):
        if target_lang == "en":
            # This is a very basic simulation. A real LLM would be used here.
            # Add more specific translations as needed based on the content.
            translations_map = {
                "Aventura pré-histórica com dinossauros animatrônicos.": "Prehistoric adventure with animatronic dinosaurs.",
                "Diariamente, das 11h às 21h": "Daily, 11 AM to 9 PM",
                "Restaurante premiado com estrela Michelin no Grand Floridian.": "Award-winning Michelin-starred restaurant at Grand Floridian.",
                "Bakery e café conhecido pelos seus doces artesanais.": "Bakery and cafe known for its artisanal sweets.",
                "Frutos do mar premium com vista para o lago em Disney Springs.": "Premium seafood with lake views at Disney Springs.",
                "Sua porta de entrada para as melhores experiências em Orlando": "Your gateway to the best experiences in Orlando",
                "Tema: Aventura pré-histórica com dinossauros animatrônicos.": "Theme: Prehistoric adventure with animatronic dinosaurs.",
                "Endereço:": "Address:",
                "Horário:": "Hours:",
                "Telefone:": "Phone:",
                "Instagram:": "Instagram:",
                "Facebook:": "Facebook:",
                "TikTok:": "TikTok:",
                "Café da manhã": "Breakfast",
                "Passeios para Família": "Family Tours",
                "Tour de Compras de Marcas": "Brand Shopping Tour",
                "Tour de Compras Mais Baratas": "Cheaper Shopping Tour",
                "Baladas e Passeios para Adultos": "Nightclubs and Adult Tours",
                "Roteiro de Passeios": "Tour Itinerary",
                "Roteiro de Cidades Próximas": "Nearby Cities Itinerary",
                "Parques": "Parks",
                "T-REX Café": "T-REX Cafe",
                "Rainforest Café": "Rainforest Cafe",
                "Toothsome Chocolate Emporium & Savory Feast Kitchen": "Toothsome Chocolate Emporium & Savory Feast Kitchen",
                "The Edison": "The Edison",
                "Ford’s Garage": "Ford’s Garage",
                "Sugar Factory": "Sugar Factory",
                "Pirates Dinner Adventure": "Pirates Dinner Adventure",
                "Raglan Road Irish Pub": "Raglan Road Irish Pub",
                "ICEBAR Orlando": "ICEBAR Orlando",
                "Café Tu Tu Tango": "Cafe Tu Tu Tango",
                "Chef Mickey’s – Disney’s Contemporary Resort": "Chef Mickey’s – Disney’s Contemporary Resort",
                "Good Morning Breakfast with Goofy & His Pals – Four Seasons Orlando": "Good Morning Breakfast with Goofy & His Pals – Four Seasons Orlando",
                "Hollywood & Vine – Disney’s Hollywood Studios": "Hollywood & Vine – Disney’s Hollywood Studios",
                "The Crystal Palace – Magic Kingdom": "The Crystal Palace – Magic Kingdom",
                "Akershus Royal Banquet Hall – EPCOT": "Akershus Royal Banquet Hall – EPCOT",
                "Cape May Café – Disney’s Beach Club Resort": "Cape May Cafe – Disney’s Beach Club Resort",
                "Orlando Science Center": "Orlando Science Center",
                "Crayola Experience": "Crayola Experience",
                "Fun Spot America": "Fun Spot America",
                "Gatorland": "Gatorland",
                "Lake Eola Park": "Lake Eola Park",
                "ICON Park": "ICON Park",
                "CoCo Key Water Resort": "CoCo Key Water Resort",
                "Leu Gardens": "Leu Gardens",
                "Sea Life Orlando Aquarium": "Sea Life Orlando Aquarium",
                "WonderWorks Orlando": "WonderWorks Orlando",
                "The Mall at Millenia": "The Mall at Millenia",
                "Orlando Vineland Premium Outlets": "Orlando Vineland Premium Outlets",
                "Orlando International Premium Outlets": "Orlando International Premium Outlets",
                "Celine Orlando": "Celine Orlando",
                "Walt Disney World Resort": "Walt Disney World Resort",
                "Universal Orlando Resort": "Universal Orlando Resort",
                "SeaWorld Orlando": "SeaWorld Orlando",
                "Dia 1: Winter Park (Boat Tour, Morse Museum, Park Avenue) + Mount Dora (Historic Downtown, Palm Island Boardwalk)": "Day 1: Winter Park (Boat Tour, Morse Museum, Park Avenue) + Mount Dora (Historic Downtown, Palm Island Boardwalk)",
                "Dia 2: Sanford (Historic Downtown, Central Florida Zoo) + Celebration (Town Center, Lakeside Park)": "Day 2: Sanford (Historic Downtown, Central Florida Zoo) + Celebration (Town Center, Lakeside Park)"
            }
            return translations_map.get(text, text) # Return translated text or original if not found
        return text

    # Process Restaurantes Temáticos
    for item in parsed_data["Restaurantes Temáticos"]:
        name_pt = item["name"]
        description_pt = item.get("description", "")
        address = item.get("address", "")
        hours = item.get("hours", "")
        phone = item.get("phone", "")
        social = item.get("social", {})

        name_en = simulate_translation(name_pt, "en")
        description_en = simulate_translation(description_pt, "en")

        payload = {
            "id": slugify(name_pt),
            "name_pt": name_pt,
            "name_en": name_en,
            "category": "Restaurantes",
            "description_pt": description_pt,
            "description_en": description_en,
            "address": address,
            "hours": hours,
            "phone": phone,
            "social": social,
            "images": [f"media/{slugify(name_pt)}.webp"], # Assuming .webp for all images
            "price_from": None,
            "call_to_action": None 
        }
        all_items.append(payload)

    # Process Cafés da Manhã
    for item in parsed_data["Cafés da Manhã"]:
        name_pt = item["name"]
        name_en = simulate_translation(name_pt, "en")
        # Placeholder description for now
        description_pt = f"Desfrute de um delicioso café da manhã em {name_pt}."
        description_en = f"Enjoy a delicious breakfast at {name_en}."

        payload = {
            "id": slugify(name_pt),
            "name_pt": name_pt,
            "name_en": name_en,
            "category": "Restaurantes",
            "description_pt": description_pt,
            "description_en": description_en,
            "address": "", # To be filled
            "hours": "", # To be filled
            "phone": "", # To be filled
            "social": {}, # To be filled
            "images": [f"media/{slugify(name_pt)}.webp"],
            "price_from": None,
            "call_to_action": None
        }
        all_items.append(payload)

    # Process Passeios (Family, Shopping, Nightlife, Itineraries)
    for section_name in [
        "Passeios para Família",
        "Tour de Compras de Marcas",
        "Tour de Compras Mais Baratas",
        "Baladas e Passeios para Adultos",
        "Roteiro de Passeios",
        "Roteiro de Cidades Próximas"
    ]:
        for item in parsed_data[section_name]:
            name_pt = item["name"]
            name_en = simulate_translation(name_pt, "en")
            # Placeholder description for now
            description_pt = f"Explore {name_pt} em Orlando."
            description_en = f"Explore {name_en} in Orlando."

            category = "Passeios"
            # Logic to determine if it's a 

