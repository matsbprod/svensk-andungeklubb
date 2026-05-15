"""
Kör från valfri plats — fixar dubblett-bild i bat-filer 101+
  python3 ~/Documents/Andungeklubben/svensk\ andungeklubb/pages/bat/fix_duplicate_photo.py
"""
import os, re

os.chdir(os.path.expanduser('~/Documents/Andungeklubben/svensk andungeklubb/pages/bat'))

fixed = 0
skipped = 0

for fname in sorted(os.listdir('.')):
    if not fname.endswith('.html'):
        continue
    try:
        nr = int(fname.replace('.html',''))
    except:
        continue
    if nr < 101:
        continue

    txt = open(fname, encoding='utf-8').read()

    # Remove any bat-photo div that sits OUTSIDE (after) the closing </div> of bat-photos
    # Pattern: </div>\n  </div>\n      <div class="bat-photo">.....</div>\n</div>
    new_txt = re.sub(
        r'(</div>\s*\n\s*</div>)\s*\n\s*<div class="bat-photo">.*?</div>\s*\n(</div>)',
        r'\1\n\2',
        txt,
        flags=re.DOTALL
    )

    if new_txt != txt:
        open(fname, 'w', encoding='utf-8').write(new_txt)
        print(f'  ✓ {fname}: dubbletten borttagen')
        fixed += 1
    else:
        skipped += 1

print(f'\nKlart: {fixed} filer fixade, {skipped} utan dublett.')
