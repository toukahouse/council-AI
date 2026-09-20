import ssl, urllib.request, urllib.parse, json, re, time, sys, os
sys.path.insert(0, r'c:\projectcode\MyChatBot\chatbot-council\gemini-claude-web2api\gemini')
import gemini_web2api
import httpx

gemini_web2api.gemini_init()
prompt = 'Tuliskan dialog pendek 2 paragraf antara Asami dan Takamura'
cookie_str, sapisid = gemini_web2api.load_cookie()
prefix = gemini_web2api.account_prefix()
ctx = ssl.create_default_context()
req_arr = [None] * 80
req_arr[0] = [prompt, None, [None, None, None]]
req_arr[7] = 1
req_arr[45] = 1
req_arr[79] = 1

xsrf = gemini_web2api.CONFIG.get('xsrf_token', '')
body = urllib.parse.urlencode({'at': xsrf, 'f.req': json.dumps([None, json.dumps(req_arr)])})
url = f"https://gemini.google.com{prefix}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl={gemini_web2api.CONFIG['gemini_bl']}&hl=en&_reqid=123456&rt=c"
headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    'Origin': 'https://gemini.google.com',
    'Referer': f'https://gemini.google.com{prefix}/',
    'X-Same-Domain': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0',
    'Cookie': cookie_str,
    'Authorization': gemini_web2api.make_sapisidhash(sapisid)
}

with httpx.Client(timeout=30) as client:
    with client.stream('POST', url, content=body, headers=headers) as resp:
        buf = ""
        event_count = 0
        for chunk in resp.iter_text():
            buf += chunk
            while "\n" in buf:
                line, buf = buf.split("\n", 1)
                if '"wrb.fr"' not in line or len(line) < 200:
                    continue
                try:
                    arr = json.loads(line)
                    inner_str = arr[0][2]
                    if not inner_str:
                        continue
                    inner2 = json.loads(inner_str)
                    if isinstance(inner2, list) and len(inner2) > 4 and inner2[4]:
                        event_count += 1
                        cands = inner2[4]
                        print(f"EVENT #{event_count}:")
                        for idx, c in enumerate(cands):
                            if isinstance(c, list) and len(c) > 1 and c[1]:
                                for p_idx, part in enumerate(c[1]):
                                    print(f"   [Cand {idx} Part {p_idx}]: type={type(part)} len={len(part) if isinstance(part, str) else 'N/A'}")
                                    if isinstance(part, str):
                                        print(f"      head: {repr(part[:50])}")
                                        print(f"      tail: {repr(part[-50:])}")
                except Exception as e:
                    print(f"ERR: {e}")
