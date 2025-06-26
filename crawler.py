import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import re
import json

class OrlandoCrawler:
    def __init__(self, base_url, delay=0.1):
        self.base_url = base_url
        self.delay = delay
        self.visited_urls = set()
        self.to_visit_urls = []
        self.collected_data = []
        self.allowed_paths = [
            "/atividades",
            "/eventos"
        ]
        self.excluded_paths = [
            "/blog",
            "/onde-ficar",
            "/newsletter",
            "/banners",
            "/ingressos",
            "/hoteis"
        ]

    def is_valid_url(self, url):
        parsed_url = urlparse(url)
        if parsed_url.netloc != urlparse(self.base_url).netloc:
            return False

        path = parsed_url.path
        if any(path.startswith(ep) for ep in self.excluded_paths):
            return False
        if not any(path.startswith(ap) for ap in self.allowed_paths):
            return False
        
        # Exclude specific event types if not recurring/touristic
        if path.startswith("/eventos") and not self._is_recurring_event(url):
            return False

        return True

    def _is_recurring_event(self, url):
        # This is a placeholder. A real implementation would involve
        # deeper analysis of the event page content to determine if it's recurring.
        # For now, we'll assume all /eventos URLs are valid for collection.
        return True

    def fetch_page(self, url):
        try:
            print(f"Fetching: {url}")
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None

    def parse_page(self, html_content, url):
        if not html_content:
            return

        soup = BeautifulSoup(html_content, 'lxml')
        
        # Extracting title
        title = soup.find('h1').get_text(strip=True) if soup.find('h1') else "No Title"
        
        # Extracting meta description
        meta_description = soup.find('meta', attrs={'name': 'description'})
        description = meta_description['content'] if meta_description else "No Description"
        
        # Extracting main content (paragraphs, lists, images, embeds)
        content_elements = []
        for tag in soup.find_all(['p', 'ul', 'ol', 'img', 'iframe']):
            # Normalize HTML: remove classes and inline styles
            for attr in ['class', 'style', 'id']:
                if attr in tag.attrs:
                    del tag.attrs[attr]
            
            if tag.name == 'img':
                # Store image src for later download
                content_elements.append({"type": "image", "src": urljoin(url, tag.get('src'))})
            elif tag.name == 'iframe':
                # Store video embed src
                content_elements.append({"type": "video", "src": tag.get('src')})
            else:
                content_elements.append({"type": "text", "content": str(tag)})

        page_data = {
            "url": url,
            "title": title,
            "description": description,
            "content_elements": content_elements
        }
        self.collected_data.append(page_data)

        # Find all links on the page
        for link in soup.find_all('a', href=True):
            href = link['href']
            absolute_url = urljoin(self.base_url, href)
            if self.is_valid_url(absolute_url) and absolute_url not in self.visited_urls:
                self.to_visit_urls.append(absolute_url)

    def crawl(self, start_url):
        self.to_visit_urls.append(start_url)

        while self.to_visit_urls:
            current_url = self.to_visit_urls.pop(0)
            if current_url in self.visited_urls:
                continue

            self.visited_urls.add(current_url)
            html_content = self.fetch_page(current_url)
            self.parse_page(html_content, current_url)
            time.sleep(self.delay)  # Respect the delay

        return self.collected_data

if __name__ == "__main__":
    crawler = OrlandoCrawler(base_url="https://pt.visitorlando.com")
    data = crawler.crawl(start_url="https://pt.visitorlando.com/atividades/")
    
    # Save collected data to a JSON file
    with open("/home/ubuntu/content_importer/collected_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Total URLs collected and saved to collected_data.json: {len(data)}")


