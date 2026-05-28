import os
import sys
import json
import asyncio
import browser_cookie3
from dotenv import load_dotenv

try:
    from gemini_webapi import GeminiClient
    from loguru import logger
    logger.remove()
except ModuleNotFoundError:
    # PM2 on Linux often drops user site-packages from sys.path. 
    # Forcefully append common linux user paths before importing.
    import site
    sys.path.append(os.path.join(site.getuserbase(), "lib", f"python{sys.version_info.major}.{sys.version_info.minor}", "site-packages"))
    # Hardcode for nova's specific VPS environment just in case pm2 runs as root
    sys.path.append("/home/nova/.local/lib/python3.10/site-packages")
    sys.path.append("/home/nova/.local/lib/python3.12/site-packages")
    from gemini_webapi import GeminiClient
    from loguru import logger
    logger.remove() # Silence internal logs to prevent polluting stderr

# Load env variables for fallbacks
load_dotenv()

def get_cookies_from_browser(browser_name):
    try:
        if browser_name.lower() == "chrome":
            cj = browser_cookie3.chrome(domain_name=".google.com")
        elif browser_name.lower() == "edge":
            cj = browser_cookie3.edge(domain_name=".google.com")
        elif browser_name.lower() == "firefox":
            cj = browser_cookie3.firefox(domain_name=".google.com")
        else:
            cj = browser_cookie3.load(domain_name=".google.com")

        psid = None
        psidts = None

        for cookie in cj:
            if cookie.name == "__Secure-1PSID":
                psid = cookie.value
            elif cookie.name == "__Secure-1PSIDTS":
                psidts = cookie.value

        return psid, psidts
    except Exception as e:
        print(f"Error reading cookies from browser: {e}", file=sys.stderr)
        return None, None

async def main():
    input_data = sys.stdin.read()
    if not input_data:
        return
        
    try:
        payload = json.loads(input_data)
    except Exception as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        return

    character = payload.get('character', {})
    persona = payload.get('persona', {})
    memories = payload.get('memories', [])
    history = payload.get('history', [])
    new_message = payload.get('newMessage', '')
    api_settings = payload.get('apiSettings', {})

    # Proxy settings
    psid = api_settings.get('cookiePsid') or os.environ.get("GEMINI_COOKIE_1PSID")
    psidts = api_settings.get('cookiePsidts') or os.environ.get("GEMINI_COOKIE_1PSIDTS")
    browser = api_settings.get('browserName') or os.environ.get("BROWSER_NAME", "edge")
    model_name = api_settings.get('proxyModel') or os.environ.get("GEMINI_MODEL", "gemini-3-pro-plus")

    # If cookies aren't provided manually, try to extract them from the browser
    if not psid or not psidts:
        psid_auto, psidts_auto = get_cookies_from_browser(browser)
        if psid_auto and psidts_auto:
            psid = psid_auto
            psidts = psidts_auto
        else:
            print(json.dumps({"error": "No cookies found. Please set them in settings or .env", "type": "error"}), flush=True)
            return

    # Build the massive contextual prompt
    prompt_parts = []
    
    # 1. System Prompt
    char_name = character.get('name', 'AI')
    prompt_parts.append(f"You are roleplaying as {char_name}.")
    
    sys_prompt = character.get('systemPrompt', '')
    if sys_prompt:
        prompt_parts.append(f"System Prompt:\n{sys_prompt}")
    
    char_persona = character.get('personality', '')
    if char_persona:
        prompt_parts.append(f"Karakter Persona:\n{char_persona}")
        
    sample_dialog = character.get('sampleDialog', '')
    if sample_dialog:
        prompt_parts.append(f"Contoh Dialog:\n{sample_dialog}")

    # 2. User Persona
    user_desc = persona.get('description', '')
    if user_desc:
        prompt_parts.append(f"Deskripsi User:\n{user_desc}")

    # 3. Memory
    if memories:
        mem_text = "\n".join([f"- {m}" for m in memories])
        prompt_parts.append(f"Memory Karakter AI:\n{mem_text}")
        
    # 4. History (Full history)
    if history:
        prompt_parts.append("[Riwayat Percakapan Sebelumnya]")
        for msg in history:
            role = "AI" if msg.get("role") == "ai" else "User"
            prompt_parts.append(f"{role}: {msg.get('content', '')}")
            
    # 5. New Message
    if new_message:
        prompt_parts.append(f"[Pesan Baru]\nUser: {new_message}")

    final_prompt = "\n\n".join(prompt_parts)

    try:
        # Initialize Gemini Web API Client
        client = GeminiClient(secure_1psid=psid, secure_1psidts=psidts)
        await client.init()
        
        chat_session = client.start_chat(model=model_name)
        last_thought_len = 0
        async for chunk in chat_session.send_message_stream(prompt=final_prompt, temporary=True):
            # Capture thought process, handling both full string or deltas
            thought_full = getattr(chunk, "thoughts", None)
            if thought_full:
                thought_delta = thought_full[last_thought_len:]
                if thought_delta:
                    print(json.dumps({"type": "thought", "content": thought_delta}), flush=True)
                    last_thought_len = len(thought_full)
            else:
                thought_delta = getattr(chunk, "thought_delta", None) or getattr(chunk, "thought", None)
                if thought_delta:
                    print(json.dumps({"type": "thought", "content": thought_delta}), flush=True)
                
            # Send text chunks
            text_delta = getattr(chunk, "text_delta", "")
            if text_delta:
                print(json.dumps({"type": "text", "content": text_delta}), flush=True)

    except Exception as e:
        print(f"Error from Gemini Proxy AI: {e}", file=sys.stderr)
        print(json.dumps({"type": "error", "content": str(e)}), flush=True)

if __name__ == "__main__":
    if os.name == 'nt':
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stdin.reconfigure(encoding='utf-8')
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
