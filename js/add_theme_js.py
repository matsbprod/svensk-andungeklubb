#!/usr/bin/env python3
"""
Lägger till  <script src=".../js/theme.js"></script>  i <head> på alla
HTML-sidor som saknar det, så att ljust läge (standard) sätts innan sidan
ritas och det inte blinkar mörkt.

Kör från sajtens rotmapp (den som innehåller index.html):

    python3 add_theme_js.py            # torrkörning: visar bara vad som skulle ändras
    python3 add_theme_js.py --apply    # utför ändringarna

Före ändring kopieras varje berörd fil till en backupmapp bredvid sajtmappen
(inte inuti den, så den inte hamnar på GitHub/Netlify). Skriptet kan köras
flera gånger — sidor som redan har theme.js hoppas över.
"""
import os
import re
import shutil
import sys
import time

ROOT = os.getcwd()
APPLY = '--apply' in sys.argv
SKIP_DIRS = {'.git', 'node_modules', 'netlify', '.netlify'}

# Hittar <link ... href="[../]*css/style.css" ...> — prefixet visar var js/ ligger
LINK_RE = re.compile(
    r'^(?P<indent>[ \t]*)<link\b[^>]*href="(?P<prefix>(?:\.\./)*)css/style\.css"[^>]*>',
    re.MULTILINE,
)

stamp = time.strftime('%Y%m%d_%H%M%S')
backup_root = os.path.join(
    os.path.dirname(ROOT), os.path.basename(ROOT) + '_backup_theme_' + stamp
)

changed, already, no_link = [], [], []

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for name in sorted(filenames):
        if not name.lower().endswith('.html'):
            continue
        path = os.path.join(dirpath, name)
        rel = os.path.relpath(path, ROOT)

        with open(path, encoding='utf-8', newline='') as f:
            text = f.read()

        if 'theme.js' in text:
            already.append(rel)
            continue

        m = LINK_RE.search(text)
        if not m:
            no_link.append(rel)
            continue

        nl = '\r\n' if '\r\n' in text else '\n'
        tag = '%s<script src="%sjs/theme.js"></script>%s' % (m.group('indent'), m.group('prefix'), nl)
        new_text = text[:m.start()] + tag + text[m.start():]
        changed.append(rel)

        if APPLY:
            backup_path = os.path.join(backup_root, rel)
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(path, backup_path)
            with open(path, 'w', encoding='utf-8', newline='') as f:
                f.write(new_text)

print()
print(('ÄNDRADE' if APPLY else 'SKULLE ÄNDRAS') + ': %d filer' % len(changed))
for r in changed[:15]:
    print('   ' + r)
if len(changed) > 15:
    print('   ... och %d till' % (len(changed) - 15))
print('Har redan theme.js: %d filer' % len(already))
if no_link:
    print('Hoppade över (ingen länk till css/style.css): %d filer' % len(no_link))
    for r in no_link:
        print('   ' + r)
if APPLY and changed:
    print()
    print('Backup finns i: ' + backup_root)
elif not APPLY:
    print()
    print('Inget ändrat än. Kör med --apply för att utföra ändringarna.')
