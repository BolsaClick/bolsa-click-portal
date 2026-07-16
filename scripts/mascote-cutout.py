#!/usr/bin/env python3
"""
Recorte de mascotes 3D (renders com fundo claro/xadrez baked).

Uso:
  python3 scripts/mascote-cutout.py <entrada.png|pasta> <pasta-saida> [--grid COLSxROWS]

- Sem --grid: cada arquivo tem 1 personagem (remove fundo + sombra translúcida).
- Com --grid: fatia uma folha (sheet) em células e extrai por componentes conexos,
  reanexando fragmentos (mãos/braços que cruzam a célula) ao personagem mais próximo.

Regras: fundo = pixels neutros claros (saturação <=10, valor >=212) conectados à borda;
sombra = neutros 170..242 nos 15% inferiores -> convertidos em sombra escura translúcida.
Ver docs/MASCOTES.md.
"""
import sys, os, pathlib
from collections import deque
from PIL import Image

def neutro(p, vmin=212, sat=10):
    r, g, b = p[0], p[1], p[2]
    return max(r, g, b) - min(r, g, b) <= sat and min(r, g, b) >= vmin

def flood_bg(im):
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if neutro(px[x, y]):
            px[x, y] = (0, 0, 0, 0)
            if x > 0: q.append((x - 1, y))
            if x < w - 1: q.append((x + 1, y))
            if y > 0: q.append((x, y - 1))
            if y < h - 1: q.append((x, y + 1))
    return im

def sombra_translucida(im, banda=0.15):
    w, h = im.size
    px = im.load()
    bbox = im.getbbox()
    if not bbox:
        return im
    corte = bbox[3] - (bbox[3] - bbox[1]) * banda
    for y in range(int(corte), bbox[3]):
        for x in range(bbox[0], bbox[2]):
            p = px[x, y]
            if p[3] > 0 and max(p[0], p[1], p[2]) - min(p[0], p[1], p[2]) <= 14 and 170 <= min(p[0], p[1], p[2]) <= 242:
                escuro = max(20, 242 - min(p[0], p[1], p[2]))
                px[x, y] = (15, 20, 35, min(110, escuro * 2))
    return im

def feather(im):
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 255:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
                        px[x, y] = (r, g, b, 150)
                        break
    return im

def processa_arquivo(src, dst):
    im = Image.open(src).convert('RGBA')
    im = flood_bg(im)
    im = sombra_translucida(im)
    im = feather(im)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst, optimize=True)
    return im.size

def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    entrada, saida = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    saida.mkdir(parents=True, exist_ok=True)
    arquivos = sorted(entrada.glob('*.png')) if entrada.is_dir() else [entrada]
    for f in arquivos:
        size = processa_arquivo(f, saida / f.name)
        print(f.name, size)

if __name__ == '__main__':
    main()
