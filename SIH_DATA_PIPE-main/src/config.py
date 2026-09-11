"""Non-secret configuration. Database secrets are read only at connection time."""
from dataclasses import dataclass
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
FLOW_NAME = 'cargopredict_data_pipeline'
PIPELINE_NAME = 'cargopredict_pipeline'
ROUTING = {'standardized': 'reference', 'synthetic': 'synthetic', 'ml_ready': 'ml'}
FOLDERS = ('raw_supplied', 'standardized', 'synthetic', 'ml_ready', 'documentation')

@dataclass(frozen=True)
class Config:
    dataset_root: Path
    mode: str
    database: str
    report_dir: Path

def resolve_config(dataset_root=None, mode='validate-only', database='local', report_dir=None):
    if mode not in {'validate-only', 'full-refresh', 'verify-only'}:
        raise ValueError('Unsupported execution mode')
    if database not in {'local', 'supabase'}:
        raise ValueError('Unsupported database target')
    return Config(Path(dataset_root or PROJECT/'CargoPredict_Pipeline_Data').resolve(),
                  mode, database, Path(report_dir or PROJECT/'reports').resolve())
