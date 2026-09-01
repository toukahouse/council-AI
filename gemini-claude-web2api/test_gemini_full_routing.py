import ssl, urllib.request, urllib.parse, json, re, time, hashlib, sys, os

sys.path.insert(0, r'c:\projectcode\universal proxy\gemini-claude-web2api\gemini')
import gemini_web2api

gemini_web2api.CONFIG['cookie_file'] = r'c:\projectcode\universal proxy\gemini-claude-web2api\gemini\cookie.txt'
cookie_str, sapisid = gemini_web2api.load_cookie()
prefix = gemini_web2api.account_prefix()
ctx = ssl.create_default_context()

ts_xsrf = int(time.time())
h_xsrf = hashlib.sha1(f"{ts_xsrf} {sapisid} https://gemini.google.com".encode()).hexdigest()
auth_xsrf = f"SAPISIDHASH {ts_xsrf}_{h_xsrf}"
init_headers = {
    "Referer": f"https://gemini.google.com{prefix}/app",
    "X-Same-Domain": "1",
    "Cookie": cookie_str,
    "Authorization": auth_xsrf,
}
init_req = urllib.request.Request(f"https://gemini.google.com{prefix}/app", headers=init_headers)
init_resp = urllib.request.urlopen(init_req, timeout=10, context=ctx)
init_text = init_resp.read().decode("utf-8", errors="replace")
m = re.search(r'"SNlM0e":"([^"]+)"', init_text)
fresh_xsrf = m.group(1) if m else ""

def test_full(model_id_str, mode_num, prompt):
    req_arr = [None] * 80
    req_arr[0] = [prompt, None, [None, None, None]]
    req_arr[7] = 1
    req_arr[45] = 1
    req_arr[79] = mode_num

    body_params = {
        "at": fresh_xsrf,
        "f.req": json.dumps([None, json.dumps(req_arr)])
    }
    body = urllib.parse.urlencode(body_params).encode()
    reqid = int(time.time()) % 1000000
    url = f"https://gemini.google.com{prefix}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20260224.08_p0&hl=en&_reqid={reqid}&rt=c"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "Origin": "https://gemini.google.com",
        "Referer": f"https://gemini.google.com{prefix}/",
        "X-Same-Domain": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
        "Cookie": cookie_str,
        "Authorization": gemini_web2api.make_sapisidhash(sapisid),
        "x-goog-ext-525001261-jspb": f'[1,null,null,null,"{model_id_str}",null,null,0,[4],null,null,2]',
        "x-goog-ext-73010989-jspb": "[0]",
        "x-goog-ext-73010990-jspb": "[0]"
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    resp = urllib.request.urlopen(req, timeout=20, context=ctx)
    raw = resp.read().decode("utf-8", errors="replace")
    text = gemini_web2api.extract_response_text(raw)
    return text

print("--- Testing PRO with both header 'e6fa609c3fa255c0' and mode 3 ---")
res_pro = test_full("e6fa609c3fa255c0", 3, "gemini kamu lagi pakai model apa?")
print("PRO RESPONSE:", res_pro.strip())

print("\n--- Testing FLASH with both header '56fdd199312815e2' and mode 1 ---")
res_flash = test_full("56fdd199312815e2", 1, "gemini kamu lagi pakai model apa?")
print("FLASH RESPONSE:", res_flash.strip())
