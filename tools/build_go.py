"""Writes go/<code>/index.html redirect pages from tools/go-links.json.

  /go/<platform>/         profile/bio link   -> /writing/
  /go/<platform>-<key>/   one article         -> that article

Each page adds the UTM tags and redirects at once, so Google Analytics
counts the visit under that platform, campaign and article. The target
page's og:/twitter: tags are copied in so LinkedIn and other previews show
the real title and cover. Run from the repo root: python3 tools/build_go.py
"""
import html, json, os, re, shutil
from urllib.parse import urlencode

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, "tools", "go-links.json")))
site = cfg["site"]

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{title}</title>
{meta}
<meta http-equiv="refresh" content="0; url={url}">
<script>location.replace({js});</script>
</head>
<body><p><a href="{url}">Continue to harshaaakanti.github.io</a></p></body>
</html>
"""

links = {}
prof = cfg["profile_links"]
for p, tags in cfg["platforms"].items():
    t = dict(tags, utm_medium=prof["utm_medium"], utm_content=prof["utm_content"])
    links[p] = (prof["target"], t)
    for key, path in cfg["articles"].items():
        links[p + "-" + key] = (path, dict(tags, utm_content=key))

def preview(path, go_url):
    """og:/twitter: meta lines and title from the target page, og:url pointed at the short link."""
    src = open(os.path.join(ROOT, path.strip("/"), "index.html")).read()
    lines = re.findall(r'^<meta (?:property="og:|name="twitter:).*>$', src, re.M)
    lines = [f'<meta property="og:url" content="{go_url}">' if 'og:url' in l else l for l in lines]
    title = re.search(r'<title>(.*?)</title>', src).group(1)
    return "\n".join(lines), title

out = os.path.join(ROOT, "go")
shutil.rmtree(out, ignore_errors=True)
for code, (path, tags) in sorted(links.items()):
    url = site + path + "?" + urlencode(tags)
    meta, title = preview(path, f"{site}/go/{code}/")
    os.makedirs(os.path.join(out, code))
    with open(os.path.join(out, code, "index.html"), "w") as f:
        f.write(PAGE.format(meta=meta, title=title, url=html.escape(url), js=json.dumps(url)))
    print(f"{site}/go/{code}/  ->  {url}")
