# -*- coding: utf-8 -*-
"""Construiește index.html, pagina site-ului, din artifact.html.

artifact.html e singura sursă a paginii: pe claude.ai primește scheletul HTML la publicare,
aici îl primește de la acest script. Se rulează după orice schimbare în artifact.html:
    python construieste_site.py
"""
import os

AICI = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(AICI, 'artifact.html'), encoding='utf-8').read()

# Ce stă înaintea primului desen e antetul paginii (titlu, fonturi, stiluri); restul e corpul.
taietura = '<svg width="0"'
assert src.count(taietura) == 1, 'nu găsesc începutul corpului în artifact.html'
antet, corp = src.split(taietura, 1)
corp = taietura + corp

# Pe site, PDF-ul și pagina de lucru se pot deschide; în artifact, descărcările sunt blocate.
legaturi = ('  <p class="muted">Planșele, gata de tipărit pe A3: '
            '<a href="plansa-suport-tastatura.pdf">PDF</a> · '
            '<a href="plansa.html">în browser</a> · '
            'calculele și verificările: <a href="proiect.html">pagina de lucru</a>.</p>\n</main>')
assert corp.count('</main>') == 1
corp = corp.replace('</main>', legaturi)

pagina = ('<!doctype html>\n<html lang="ro">\n<head>\n<meta charset="utf-8">\n'
          '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
          + antet + '</head>\n<body>\n' + corp + '</body>\n</html>\n')
open(os.path.join(AICI, 'index.html'), 'w', encoding='utf-8').write(pagina)
print('index.html scris')
