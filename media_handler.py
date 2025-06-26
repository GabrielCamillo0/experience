import requests
from PIL import Image
from io import BytesIO
import os
from urllib.parse import urlparse
import re

class MediaHandler:
    def __init__(self, media_output_dir="/home/ubuntu/experience-florida/public/media"):
        self.media_output_dir = media_output_dir
        os.makedirs(self.media_output_dir, exist_ok=True)

    def download_and_optimize_image(self, image_url, slug):
        try:
            response = requests.get(image_url)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            
            # Convert to WebP and optimize (quality 80)
            filename = f"{slug}.webp"
            output_path = os.path.join(self.media_output_dir, filename)
            image.save(output_path, "webp", quality=80)
            print(f"Downloaded and optimized image: {image_url} to {output_path}")
            return f"/media/{filename}"
        except Exception as e:
            print(f"Error processing image {image_url}: {e}")
            return None

    def handle_video_embed(self, video_url):
        # Extract YouTube/Vimeo ID or note self-hosted MP4
        if "youtube.com/embed/" in video_url:
            match = re.search(r"youtube\.com/embed/([a-zA-Z0-9_-]+)", video_url)
            if match:
                return f"https://www.youtube.com/embed/{match.group(1)}"
        elif "vimeo.com/video/" in video_url:
            match = re.search(r"vimeo\.com/video/([0-9]+)", video_url)
            if match:
                return f"https://player.vimeo.com/video/{match.group(1)}"
        elif video_url.endswith(".mp4"):
            # For self-hosted MP4s, we would typically transfer to S3.
            # For this simulation, we'll just return the original URL.
            print(f"Note: Self-hosted MP4 detected: {video_url}. In a real scenario, this would be transferred to S3.")
            return video_url
        return None

    def remove_watermark_placeholder(self, image_path):
        # Placeholder for watermark removal. Actual implementation is complex.
        print(f"Placeholder: Watermark removal for {image_path}")
        return image_path


