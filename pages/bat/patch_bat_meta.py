"""
Kör från valfri plats:
  python3 patch_bat_meta.py
"""

import os, re

os.chdir(os.path.expanduser('~/Documents/Andungeklubben/svensk andungeklubb/pages/bat'))

# Data från batregistret.html (nr: hamn, byggår, varv, material)
BOATS = {
    100: ('Fiskebäck', '2021', 'Lilla Kålvik', 'Mahogny'),
    101: ('Instön', '197?', 'Börsholmen', 'Plast'),
    102: ('Stockholm, Ornö', '1971', 'Börsholmen', 'Plast'),
    103: ('Brännö', '1971', 'Börsholmen', 'Plast'),
    104: ('Lerum', '197?', 'Börsholmen', 'Plast'),
    106: ('Ingaröfjorden', '1976', 'Börsholmen', 'Plast'),
    107: ('Skeppsmyra, Roslagen', '1977', 'Börsholmen', 'Plast'),
    108: ('Hällene Brygga', '', 'Börsholmen', 'Plast'),
    109: ('Kullavik', '1973', 'Börsholmen', 'Plast'),
    110: ('Vargö', '1981', 'Börsholmen', 'Plast'),
    111: ('Gunnersviken, Skärhamn', '1979', 'SAK Göteborg', 'Plast / blå'),
    112: ('Björholmen', '1979', 'SAK Göteborg', 'Plast / röd'),
    113: ('Ängholmen', '1979', 'SAK Göteborg', 'Plast'),
    114: ('Färjestaden', '1980', 'SAK Göteborg', 'Plast / vit'),
    115: ('Hinsholmen, Gbg', '1980', 'SAK Göteborg', 'Plast / vit'),
    116: ('Brännö', '1982', 'SAK Göteborg', 'Plast'),
    117: ('Sommen', '1982', 'SAK Göteborg', 'Plast'),
    118: ('Stora Förö Göteborg', '1982', 'SAK Göteborg', 'Plast'),
    119: ('Brännö', '1977', 'Börsholmen', 'Plast'),
    120: ('Saltsjöbaden', '1973', 'Börsholmen', 'Plast'),
    121: ('Björholmen', '1979', 'Börsholmen', 'Plast'),
    122: ('Haverdal', '1975', 'Börsholmen', 'Plast'),
    123: ('Kyrkesund', '', 'Börsholmen', 'Plast'),
    124: ('Varberg', '1981', 'Börsholmen', 'Plast'),
    125: ('Djursnäs, Edsbruk', '197?', 'Börsholmen', 'Plast'),
    126: ('Asker', '1970', 'Börsholmen', 'Mahogny'),
    127: ('Svartsö, Stockholm', '1978', 'Börsholmen', 'Plast'),
    128: ('Hinsholmskilen/Flatön', '1970', 'Börsholmen', 'Plast'),
    129: ('Kullavik', '1981', 'Börsholmen', 'Plast'),
    130: ('Kyrkosund, Sydkoster', '1977', 'Börsholmen', 'Plast'),
    131: ('Kullavik', '1983', 'Börsholmen', 'Plast'),
    132: ('Mjösund, Ödsmål', '1976', 'Börsholmen', 'Plast'),
    133: ('Tångudden', '1980', 'Börsholmen', 'Plast'),
    134: ('Billdal, På trailer', '1979', 'Börsholmen', 'Plast'),
    135: ('Långedrag', '1978', 'Börsholmen', 'Plast'),
    136: ('Halmstad', '', 'Börsholmen', 'Plast'),
    137: ('Nordreviken, Billdal', '1979', 'Börsholmen', 'Plast'),
    138: ('Kornhall', '', 'Börsholmen', 'Plast'),
    139: ('Kalmar', '1974', 'Börsholmen', 'Plast blått/grön/vit'),
    140: ('Kullavik, Kungsbacka', '1990', 'Son Marin', 'Plast'),
    141: ('Mollösund', '1977', 'Börsholmen', 'Plast'),
    142: ('Saltsjöbaden', '2021', 'Stockholms Båtsnickeri', 'Mahogny'),
    143: ('Göteborg', '1979', 'Börsholmen', 'Plast'),
    144: ('Bunn', '1979', 'Börsholmen', 'Plast'),
    145: ('Billdal', '1976', 'Börsholmen', 'Plast'),
    146: ('Kornhall', '2024', 'Kornhallsandungen AB', 'Plast'),
    147: ('Göteborg', '2024', 'Kornhallsandungen AB', 'Plast'),
    148: ('', '1975', 'Börsholmen', 'Plast'),
    149: ('', '1979', 'Börsholmen', 'Plast'),
    176: ('Särö/Marstrand', '1991', 'Son Marin', 'Plast'),
}

def fill_meta(html, hamn, byggår, varv, material):
    fields = [
        ('Hemmahamn',  hamn),
        ('Bygg\u00e5r', byggår),   # Byggår
        ('Varv',       varv),
        ('Material',   material),
    ]
    for label, value in fields:
        # Match label (with possible HTML entities) and empty value div after it
        pattern = (
            r'(<div class="bat-meta-label">' + re.escape(label) + r'</div>'
            r'<div class="bat-meta-value">)(<\/div>)'
        )
        replacement = r'\g<1>' + value + r'\2'
        html, n = re.subn(pattern, replacement, html)
        if n == 0:
            # Try with &aring; entity for å
            label_enc = label.replace('å', '&aring;')
            pattern2 = (
                r'(<div class="bat-meta-label">' + re.escape(label_enc) + r'</div>'
                r'<div class="bat-meta-value">)(<\/div>)'
            )
            html, _ = re.subn(pattern2, replacement, html)
    return html

updated = 0
skipped = 0

for nr, data in BOATS.items():
    fname = f'{nr}.html'
    if not os.path.exists(fname):
        print(f'  SAKNAS: {fname}')
        skipped += 1
        continue
    
    html = open(fname, encoding='utf-8').read()
    hamn, byggår, varv, material = data
    new_html = fill_meta(html, hamn, byggår, varv, material)
    
    if new_html != html:
        open(fname, 'w', encoding='utf-8').write(new_html)
        print(f'  ✓ {fname}: {hamn} | {byggår} | {varv} | {material}')
        updated += 1
    else:
        print(f'  – {fname}: redan ifyllt eller mönster hittades ej')
        skipped += 1

print(f'\nKlart: {updated} filer uppdaterade, {skipped} hoppades över.')
