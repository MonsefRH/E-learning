import json
from pathlib import Path
import subprocess
import edge_tts
import os
import httpx
from selenium import webdriver
from PIL import Image
import time

from app.schemas.courseRequest import CourseRequest


#async def receive_content(payload : CourseRequest):
#    print(f"Receiving content with payload: {payload}")
#    async with httpx.AsyncClient() as client:
#        print("Sending request to upload/generate endpoint")
#        response = await client.post("http://localhost:8000/upload/generate", json=payload.dict())
#        print(f"Response status: {response.status_code}")
#        return response.json()

async def send_content(payload: CourseRequest,course_id: int):
    print(f"Initiating content generation with payload: {payload}")
    async with httpx.AsyncClient() as client:
        print("Sending initial request to start generation")
        response = await client.post(f"http://localhost:8001/generate/{course_id}", json=payload.dict())
        print(f"Initial response status: {response.status_code}")
        return response.json()




async def generate_content(course_id: int,language, response):
    print(f"Generating content for course_id: {course_id}")
    course_path = Path(f"presentations/{course_id}")
    course_path.mkdir(parents=True, exist_ok=True)
    print(f"Created directory: {course_path}")




    print(f"Received content response: {response}")

    print("Generating slides...")
    slides = await generate_slides(response.get('slides', {}), str(course_path / "slides"))
    print(f"Generated slides: {slides}")

    print("Creating audio...")
    audio_files = await create_audio(response.get('speech', {}), language, str(course_path / "audios"))

    print(f"Created audio files: {audio_files}")

    count = count_slides(slides)

    generate_video(count,course_id)

    return {
        "slides": slides,
        "audio_files": audio_files
    }


async def create_audio(speech, language, path: str):
    print(f"Creating audio with language: {language}, path: {path}")
    os.makedirs(path, exist_ok=True)
    print(f"Created audio directory: {path}")
    if isinstance(speech, str):
        print("Speech is string, parsing JSON")
        speech_data = json.loads(speech)
    else:
        print("Speech is object")
        speech_data = speech
    print(f"Speech data: {speech_data}")

    generated_files = []

    for slide in speech_data:
        slide_id = slide.get("id")
        script = slide.get("script")
        code_explanation = slide.get("code_explanation")
        script = script + "\n" + code_explanation

        if not code_explanation or code_explanation == "Explication indisponible":
            script = slide.get("script")

        if not script or script == "Explication indisponible":
            continue

        file_name = f"audio{slide_id}.mp3"
        file_path = os.path.join(path, file_name)

        voice = "en-US-AriaNeural"
        if language == "fr":
            voice = "fr-FR-DeniseNeural"
        elif language == "es":
            voice = "es-ES-ElviraNeural"
        elif language == "it":
            voice = "it-IT-ElsaNeural"

        print(f"Generating audio for slide {slide_id} with voice {voice}")
        await generate_audio(
            speech_text=script,
            file_name=file_name,
            file_path=path,
            voice=voice
        )
        print(f"Audio generated for slide {slide_id}")

        generated_files.append({
            "slide_id": slide_id,
            "audio_file": file_path
        })

    return generated_files

async def generate_audio(speech_text: str, file_name: str, file_path: str, voice: str = "en-US-AriaNeural"):
    os.makedirs(file_path, exist_ok=True)

    full_path = os.path.join(file_path, file_name)

    communicate = edge_tts.Communicate(speech_text, voice)

    await communicate.save(full_path)

    return full_path


async def generate_slides(slides, path: str):
    print(f"Starting generate_slides with slides: {slides} and path: {path}")

    output_dir = Path(path)
    output_dir.mkdir(exist_ok=True)
    print(f"Created output directory: {output_dir}")

    generated_files = []

    print(f"Processing slides: {slides}")
    for slide in slides:
        print(f"Processing slide: {slide}")
        slide_id = slide.get("id")
        if slide_id is None:
            print(f"Skipping slide without ID: {slide}")
            continue

        print(f"Generating HTML for slide ID {slide_id}")
        html_content = generate_html_slide(slide)
        print(f"HTML content generated with length: {len(html_content)}")

        filename = f"slide{slide_id}.html"
        filepath = output_dir / filename
        print(f"Writing to file: {filepath}")

        with open(filepath, 'w', encoding='utf-8') as html_file:
            html_file.write(html_content)
        print(f"File written successfully: {filepath}")

        generated_files.append({
            "slide_id": slide_id,
            "html_file": str(filepath)
        })
        print(f"Added to generated_files, current count: {len(generated_files)}")

    print(f"Returning {len(generated_files)} generated files")
    return generated_files

def count_slides(slides):
    count =0
    for slide in slides :
        count=count+1
    return count


def generate_html_slide(slide_data):
    html_template = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{slide_data.get('title', f"Slide {slide_data['id']}")}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            animation: slideIn 0.6s ease-out;
        }}

        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateY(30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}

        .header::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            opacity: 0.3;
        }}

        .slide-number {{
            position: absolute;
            top: 20px;
            right: 30px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }}

        .title {{
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }}


        .content {{
            padding: 40px;
        }}

        .summary {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 5px solid #3498db;
            padding: 25px;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }}

        .summary h2 {{
            color: #2c3e50;
            font-size: 1.4em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }}

        .summary h2::before {{
            content: "📚";
            margin-right: 10px;
            font-size: 1.2em;
        }}

        .summary ul {{
            list-style: none;
            padding-left: 0;
        }}

        .summary li {{
            margin: 15px 0;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
            position: relative;
            padding-left: 25px;
        }}

        .summary li::before {{
            content: "▶";
            position: absolute;
            left: 0;
            color: #3498db;
            font-size: 0.8em;
        }}

        .summary li:last-child {{
            border-bottom: none;
        }}

        .summary strong {{
            color: #2c3e50;
            font-weight: 600;
        }}

        .code-section {{
            background: #1e1e1e;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-top: 30px;
        }}

        .code-header {{
            background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
            color: white;
            padding: 15px 25px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .code-header::before {{
            content: "☕";
            margin-right: 10px;
            font-size: 1.2em;
        }}

        .code-lang {{
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.9em;
        }}

        .code-content {{
            padding: 0;
        }}

        .code-content pre {{
            margin: 0;
            padding: 25px;
            background: #1e1e1e;
            color: #f8f8f2;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            overflow-x: auto;
        }}

        .code-content pre code {{
            background: none;
            padding: 0;
            border-radius: 0;
        }}

        .navigation {{
            background: #f8f9fa;
            padding: 20px 40px;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .nav-button {{
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }}

        .nav-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }}

        .nav-button:disabled {{
            background: #bdc3c7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }}

        .slide-indicator {{
            background: #e9ecef;
            border-radius: 15px;
            padding: 8px 16px;
            color: #6c757d;
            font-size: 0.9em;
            font-weight: 500;
        }}

        .unavailable {{
            color: #e74c3c;
            font-style: italic;
            text-align: center;
            padding: 20px;
            background: #fdf2f2;
            border-radius: 8px;
            border: 1px solid #f5c6cb;
        }}

        @media (max-width: 768px) {{
            .container {{
                margin: 10px;
                border-radius: 10px;
            }}

            .header {{
                padding: 20px;
            }}

            .title {{
                font-size: 2em;
            }}

            .content {{
                padding: 20px;
            }}

            .navigation {{
                padding: 15px 20px;
                flex-direction: column;
                gap: 15px;
            }}

            .nav-button {{
                width: 100%;
                justify-content: center;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="slide-number">Slide {slide_data['id']}</div>
        </div>

        <div class="content">
            <div class="summary">
                <h2>Résumé</h2>
                {slide_data.get('summary', 'Résumé indisponible')}
            </div>

            <div class="code-section">
                <div class="code-header">
                    <span>Code Java</span>
                    <span class="code-lang">Java</span>
                </div>
                <div class="code-content">
                    {slide_data.get('example_code', '<pre><code>// Code indisponible</code></pre>')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>"""
    return html_template


def capture_slide(html_path: str, output_png: str):
    """Capture une slide HTML en image PNG"""
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')  # Dimensions paires standard
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-software-rasterizer')  # Éviter les erreurs GPU
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--disable-backgrounding-occluded-windows')

    driver = None
    try:
        driver = webdriver.Chrome(options=options)
        # Utiliser un chemin absolu pour éviter les problèmes
        abs_path = os.path.abspath(html_path)
        driver.get(f"file://{abs_path}")
        time.sleep(3)  # Augmenter le délai pour permettre le chargement complet

        # S'assurer que la fenêtre a la bonne taille
        driver.set_window_size(1920, 1080)
        time.sleep(1)  # Petit délai supplémentaire après le redimensionnement

        driver.save_screenshot(output_png)
        print(f"Screenshot saved: {output_png}")
    except Exception as e:
        print(f"Error capturing slide {html_path}: {e}")
        raise
    finally:
        if driver:
            driver.quit()


def create_video_from_image_audio(image: str, audio: str, output: str):
    """Crée une vidéo à partir d'une image et d'un fichier audio"""
    try:
        # Utiliser des filtres vidéo pour s'assurer que les dimensions sont paires
        # et réduire le bitrate audio pour éviter les erreurs AAC
        cmd = [
            'ffmpeg', '-y', '-loop', '1', '-i', image, '-i', audio,
            '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '128k',
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',  # Force des dimensions paires
            '-pix_fmt', 'yuv420p', '-shortest', output
        ]
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Video created: {output}")
    except subprocess.CalledProcessError as e:
        print(f"Error creating video {output}: {e}")
        print(f"FFmpeg stderr: {e.stderr}")
        raise


def concat_videos(video_list: list, output_file: str):
    """Concatène plusieurs vidéos en une seule"""
    try:
        # Créer le fichier de liste dans le même répertoire que la sortie
        output_dir = os.path.dirname(output_file)
        videos_txt = os.path.join(output_dir, 'videos.txt')

        with open(videos_txt, 'w') as f:
            for video in video_list:
                # Utiliser des chemins absolus pour éviter les problèmes
                abs_video_path = os.path.abspath(video)
                f.write(f"file '{abs_video_path}'\n")

        cmd = ['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', videos_txt, '-c', 'copy', output_file]
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Final video created: {output_file}")

        # Nettoyer le fichier temporaire
        os.remove(videos_txt)
    except subprocess.CalledProcessError as e:
        print(f"Error concatenating videos: {e}")
        print(f"FFmpeg stderr: {e.stderr}")
        raise


def generate_video(nbr_slides, course_id: int):
    print('debut')
    slides_dir = f'presentations/{course_id}/slides'
    audio_dir = f'presentations/{course_id}/audios'
    output_dir = f'presentations/{course_id}'


    # Vérifier que les répertoires existent
    if not os.path.exists(slides_dir):
        raise FileNotFoundError(f"Slides directory not found: {slides_dir}")
    if not os.path.exists(audio_dir):
        raise FileNotFoundError(f"Audio directory not found: {audio_dir}")

    videos = []

    try:
        for i in range(1, int(nbr_slides) + 1):  # Correction: inclure la dernière slide
            html = f"{slides_dir}/slide{i}.html"
            image = f"{output_dir}/slide{i}.png"
            audio = f"{audio_dir}/audio{i}.mp3"
            video = f"{output_dir}/slide{i}.mp4"

            # Vérifier que les fichiers existent
            if not os.path.exists(html):
                print(f"Warning: HTML file not found: {html}")
                continue
            if not os.path.exists(audio):
                print(f"Warning: Audio file not found: {audio}")
                continue

            print(f"Processing slide {i}...")
            capture_slide(html, image)
            create_video_from_image_audio(image, audio, video)
            videos.append(video)

            # Nettoyer l'image temporaire
            if os.path.exists(image):
                os.remove(image)

        if not videos:
            raise ValueError("No videos were generated")

        # Créer la vidéo finale
        final_video = f"{output_dir}/{course_id}.mp4"
        concat_videos(videos, final_video)

        # Nettoyer les vidéos intermédiaires
        for v in videos:
            if os.path.exists(v):
                os.remove(v)

        print(f"Course video generated successfully: {final_video}")
        return final_video

    except Exception as e:
        # Nettoyer en cas d'erreur
        for v in videos:
            if os.path.exists(v):
                os.remove(v)
        raise e