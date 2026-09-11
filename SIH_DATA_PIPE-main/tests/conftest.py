import csv
import os
from pathlib import Path
import pytest
from functools import lru_cache
from src.config import PROJECT

@lru_cache(maxsize=1)
def small_templates():
    templates=[]
    source=PROJECT/'CargoPredict_Pipeline_Data'
    for path in source.rglob('*.csv'):
        relative=path.relative_to(source)
        with path.open(encoding='utf-8-sig',newline='') as f:
            reader=csv.DictReader(f)
            rows=list(reader)
            fields=reader.fieldnames
        if path.name in {'port_master.csv','vessel_specifications.csv','port_specifications.csv'}:
            chosen=rows
        elif path.name=='route_freight_rates_synthetic.csv':
            chosen=[r for r in rows if r['route_id']=='R001'][:32]
        elif path.name=='ml_freight_daily.csv':
            chosen=[r for r in rows if r['route_id']=='R001'][:2]
        else: chosen=rows[:1]
        templates.append((relative,fields,chosen))
    return templates

@pytest.fixture
def small_dataset(tmp_path,monkeypatch):
    root=tmp_path/'dataset'
    for relative,fields,chosen in small_templates():
        target=root/relative
        target.parent.mkdir(parents=True,exist_ok=True)
        with target.open('w',newline='') as f:
            writer=csv.DictWriter(f,fieldnames=fields)
            writer.writeheader(); writer.writerows(chosen)
    # Candidate fixtures intentionally differ from the supplied immutable snapshot.
    # Production always enforces the preservation baseline; only this fixture substitutes it.
    monkeypatch.setattr('src.validate_csv.checksum_registry',lambda root:{})
    import src.flows.cargopredict_pipeline as module
    monkeypatch.setattr(module,'checksum_registry',lambda root:{})
    return root

@pytest.fixture
def db_connection():
    from src.database import connection
    if os.environ.get('CARGOPREDICT_TEST_DATABASE')!='1':
        pytest.skip('Set CARGOPREDICT_TEST_DATABASE=1 with an isolated test database')
    if not os.environ.get('POSTGRES_DB','').startswith('cargopredict_test_'):
        pytest.fail('Integration tests require a database named cargopredict_test_*')
    with connection() as conn:
        yield conn
