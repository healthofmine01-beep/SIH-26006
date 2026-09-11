import json
import pytest
from prefect.testing.utilities import prefect_test_harness
from src.flows.cargopredict_pipeline import cargopredict_data_pipeline

@pytest.fixture(scope='module')
def prefect_runtime():
    with prefect_test_harness(server_startup_timeout=120): yield

def test_validation_flow_success(small_dataset,tmp_path,prefect_runtime):
    state=cargopredict_data_pipeline(str(small_dataset),report_dir=str(tmp_path/'reports'),return_state=True)
    assert state.is_completed()
    report=json.loads((tmp_path/'reports/latest_pipeline_run.json').read_text())
    assert report['status']=='SUCCESS'
    assert report['database_status']=='NOT_REQUESTED'
    assert len(report['files'])==38
    assert all('rows' not in r for r in report['files'])

def test_validation_flow_failure(small_dataset,tmp_path,prefect_runtime):
    (small_dataset/'ml_ready/ml_freight_daily.csv').write_text('date,date\n1,1\n')
    state=cargopredict_data_pipeline(str(small_dataset),report_dir=str(tmp_path/'reports'),return_state=True)
    assert state.is_failed()
    report=json.loads((tmp_path/'reports/latest_pipeline_run.json').read_text())
    assert report['status']=='FAILED'
    assert any(r['errors'] for r in report['files'])

def test_database_failure_keeps_original_error(small_dataset,tmp_path,prefect_runtime,monkeypatch):
    monkeypatch.delenv('POSTGRES_PASSWORD',raising=False)
    state=cargopredict_data_pipeline(str(small_dataset),mode='full-refresh',
                                     report_dir=str(tmp_path/'reports'),return_state=True)
    assert state.is_failed()
    report=json.loads((tmp_path/'reports/latest_pipeline_run.json').read_text())
    assert 'POSTGRES_PASSWORD' in report['error']
    assert report['audit_status']=='NOT_WRITTEN'
    assert 'original pipeline error preserved' in report['audit_error']
