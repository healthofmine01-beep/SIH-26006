"""Deterministic discovery and safe PostgreSQL identifiers."""
import re
from pathlib import Path
from src.config import FOLDERS, ROUTING

def table_name(filename):
    name = re.sub(r'[^a-z0-9_]', '', re.sub(r'[\s-]+', '_', Path(filename).stem.lower()))
    if not name:
        raise ValueError('Filename has no safe table identifier')
    if name[0].isdigit():
        name = 't_' + name
    if len(name.encode()) > 45:
        raise ValueError('Table identifier exceeds project limit (45 bytes)')
    return name

def discover(root):
    root = Path(root)
    for folder in FOLDERS:
        if not (root/folder).is_dir():
            raise ValueError(f'Required folder missing: {folder}')
    files = sorted(root.rglob('*.csv'), key=lambda p: p.relative_to(root).as_posix())
    seen = set()
    for p in files:
        if p.is_symlink() or not p.resolve().is_relative_to(root.resolve()):
            raise ValueError('Dataset symlinks are not supported')
        layer = p.relative_to(root).parts[0]
        if layer in ROUTING:
            key = (ROUTING[layer], table_name(p.name))
            if key in seen:
                raise ValueError(f'Duplicate table destination: {key}')
            seen.add(key)
    if not (root/'ml_ready/ml_freight_daily.csv').is_file():
        raise ValueError('Required ML file missing')
    return files
