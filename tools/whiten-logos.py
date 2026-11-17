"""Turn logo PNGs into tightly cropped white-on-transparent PNGs (stdlib only)."""
import struct
import sys
import zlib
from pathlib import Path


def read_png(path):
    data = Path(path).read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", path
    pos, idat, w = 8, b"", None
    while pos < len(data):
        n, kind = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + n]
        if kind == b"IHDR":
            w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
            assert depth == 8 and interlace == 0 and ctype in (2, 6), (path, depth, ctype, interlace)
        elif kind == b"IDAT":
            idat += body
        pos += 12 + n
    ch = 4 if ctype == 6 else 3
    raw = zlib.decompress(idat)
    stride = w * ch
    out = bytearray(h * stride)
    prev = bytearray(stride)
    i = 0
    for y in range(h):
        f = raw[i]
        line = bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0
            b = prev[x]
            c = prev[x - ch] if x >= ch else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        out[y * stride:(y + 1) * stride] = line
        prev = line
    px = []
    for k in range(0, len(out), ch):
        r, g, bl = out[k], out[k + 1], out[k + 2]
        al = out[k + 3] if ch == 4 else 255
        px.append((r, g, bl, al))
    return w, h, px


def write_png(path, w, h, rows):
    raw = b"".join(b"\x00" + bytes(r) for r in rows)
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    Path(path).write_bytes(png)


def lum(r, g, b):
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255


def whiten(src, dst, preview, mode):
    w, h, px = read_png(src)
    # flatten transparency onto white for the colour modes
    flat = [(r * a // 255 + 255 - a, g * a // 255 + 255 - a, b * a // 255 + 255 - a) for r, g, b, a in px]
    bg = flat[w + 1]
    bgl = lum(*bg)
    alphas = []
    for (r, g, b), (_, _, _, a0) in zip(flat, px):
        if mode == "alpha":
            a = a0 / 255
        elif mode == "diff":
            d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            a = min(1, max(0, (d - 14) / 70))
        else:  # tone: darker than the background reads as more white ink
            a = min(1, max(0, (bgl - lum(r, g, b)) / bgl)) ** 0.7
            a = 0 if a < 0.06 else a
        alphas.append(a)

    edge = 6
    for i in range(len(alphas)):
        x, y = i % w, i // w
        if x < edge or y < edge or x >= w - edge or y >= h - edge:
            alphas[i] = 0
    xs = [i % w for i, a in enumerate(alphas) if a > 0.05]
    ys = [i // w for i, a in enumerate(alphas) if a > 0.05]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    pad = int(max(x1 - x0, y1 - y0) * 0.02)
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w - 1, x1 + pad), min(h - 1, y1 + pad)
    cw, chh = x1 - x0 + 1, y1 - y0 + 1

    rows, prev_rows = [], []
    for y in range(y0, y1 + 1):
        row, prow = bytearray(), bytearray()
        for x in range(x0, x1 + 1):
            a = alphas[y * w + x]
            row += bytes((255, 255, 255, round(a * 255)))
            v = round(11 + (255 - 11) * a)
            prow += bytes((v, v, min(255, v + 5), 255))
        rows.append(row)
        prev_rows.append(prow)
    write_png(dst, cw, chh, rows)
    write_png(preview, cw, chh, prev_rows)
    print(f"{Path(dst).name}: {cw}x{chh}  bg={bg} mode={mode}")


if __name__ == "__main__":
    src_dir, out_dir, prev_dir = map(Path, sys.argv[1:4])
    jobs = {
        "hbo": ("hbo-max-logo.png", "diff"),
        "kroot": ("kroot-logo.png", "alpha"),
        "productsc": ("ProductSC-logo-website.png", "diff"),
        "hearst": ("hearst-logo.png", "diff"),
        "bizlang": ("bizlang-website-logo.png", "tone"),
        "femo": ("femo-logo-original.png", "tone"),
    }
    for name, (src, mode) in jobs.items():
        whiten(src_dir / src, out_dir / f"{name}.png", prev_dir / f"{name}-preview.png", mode)
