import csv
import hashlib
from datetime import date
from decimal import Decimal
from pathlib import Path
import pytest
from src.config import FOLDERS
from src.discover_files import table_name, discover
from src.validate_csv import parse_value, validate_file, read_csv, ValidationError, validate_dataset, cross_validate, ensure_valid

@pytest.mark.parametrize('name,expected',[
    ('Freight Rates.csv','freight_rates'),('Cargo-Port.csv','cargo_port'),
    ('42.csv','t_42'),('x;select.csv','xselect'),('cargo_type.csv','cargo_type')])
def test_table_name(name,expected): assert table_name(name)==expected

@pytest.mark.parametrize('name',['!!!.csv','a'*46+'.csv'])
def test_unsafe_or_long_name(name):
    with pytest.raises(ValueError): table_name(name)

@pytest.mark.parametrize('value,kind,expected',[
    ('2020-02-29','DATE',date(2020,2,29)),('True','BOOLEAN',True),('False','BOOLEAN',False),
    ('0','BOOLEAN',False),('1','BOOLEAN',True),('1.25','NUMERIC',Decimal('1.25')),
    ('12','BIGINT',12),('','NUMERIC',None),('00042','TEXT','00042')])
def test_parsers(value,kind,expected): assert parse_value(value,kind)==expected

@pytest.mark.parametrize('value,kind',[
    ('2021-02-29','DATE'),('2020-01','DATE'),('yes','BOOLEAN'),('2','BOOLEAN'),
    ('NaN','NUMERIC'),('Infinity','NUMERIC'),('1.2','BIGINT'),('1e30','BIGINT'),
    ('abc','NUMERIC'),('2020-01-01T12:00:00','TIMESTAMP WITH TIME ZONE')])
def test_invalid_parsing(value,kind):
    with pytest.raises((ValueError,ArithmeticError)): parse_value(value,kind)

@pytest.mark.parametrize('text',['a,a\n1,2\n','a,b\n1,2,3\n','','a,b\n','a,b\n"unterminated,2'])
def test_bad_csv(tmp_path,text):
    path=tmp_path/'bad.csv'; path.write_text(text)
    with pytest.raises(ValidationError): read_csv(path)

def test_discovery_missing_folder(tmp_path):
    with pytest.raises(ValueError,match='folder'): discover(tmp_path)

def test_discovery_sorted_and_collision(small_dataset):
    files=discover(small_dataset)
    assert len(files)==38
    assert files==sorted(files)
    p=small_dataset/'standardized/route master.csv'
    p.write_bytes((small_dataset/'standardized/route_master.csv').read_bytes())
    with pytest.raises(ValueError,match='Duplicate'): discover(small_dataset)

def rewrite(path,change):
    with path.open(newline='') as f:
        reader=csv.DictReader(f); fields=reader.fieldnames; rows=list(reader)
    fields,rows=change(fields,rows)
    with path.open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(rows)

@pytest.mark.parametrize('column,value,check',[
    ('freight_rate_usd_per_mt','-1','business_rule:freight_rate_usd_per_mt'),
    ('distance_nm','0','business_rule:distance_nm'),
    ('congestion_score','101','business_rule:congestion_score'),
    ('wave_height_m','-1','business_rule:wave_height_m'),
    ('wind_speed_kph','-1','business_rule:wind_speed_kph'),
    ('available_vessel_count','-1','business_rule:available_vessel_count'),
    ('ballast_vessel_count','-1','business_rule:ballast_vessel_count'),
    ('date','2020-02-30','invalid_type:date:1'),
    ('is_synthetic','False','incorrect_synthetic_labels'),
    ('source_origin','','missing_provenance_value'),
    ('freight_rate_usd_per_mt','','missing_cells'),
])
def test_ml_bad_fields(small_dataset,column,value,check):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    def change(fields,rows): rows[0][column]=value; return fields,rows
    rewrite(path,change)
    result=validate_file(small_dataset,path)
    assert check in result['errors']
    with pytest.raises(ValidationError): ensure_valid([result])

def test_required_columns(small_dataset):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    def change(fields,rows):
        return [f for f in fields if f!='is_synthetic'],[{k:v for k,v in r.items() if k!='is_synthetic'} for r in rows]
    rewrite(path,change)
    result=validate_file(small_dataset,path)
    assert 'missing_provenance_or_synthetic_flag' in result['errors']
    assert 'required_columns_or_unexpected_columns' in result['errors']

def test_duplicate_keys(small_dataset):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    rewrite(path,lambda fields,rows:(fields,rows+[rows[0]]))
    result=validate_file(small_dataset,path)
    assert result['duplicate_keys']==1
    assert 'duplicate_ml_key' in result['errors']

@pytest.mark.parametrize('column,value,check',[
    ('route_id','UNKNOWN','unknown_route'),('vessel_class','UNKNOWN','unknown_vessel_class'),
    ('origin_port_id','UNKNOWN','unknown_port'),
    ('freight_lag_1','999','leakage_or_history_mismatch:freight_lag_1'),
    ('freight_rolling_mean_7','999','leakage_or_history_mismatch:freight_rolling_mean_7')])
def test_references_and_leakage(small_dataset,column,value,check):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    def change(fields,rows): rows[0][column]=value; return fields,rows
    rewrite(path,change)
    results,errors=validate_dataset(small_dataset,discover(small_dataset))
    ml=next(r for r in results if r['table']=='ml_freight_daily')
    assert check in ml['errors']

def test_checksum_mismatch(small_dataset):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    assert 'checksum_mismatch' in validate_file(small_dataset,path,checksum='0'*64)['errors']

def test_good_small_dataset(small_dataset):
    results,errors=validate_dataset(small_dataset,discover(small_dataset))
    ensure_valid(results,errors)
    assert next(r for r in results if r['table']=='ml_freight_daily')['source_rows']==2

def test_missing_registered_file(small_dataset):
    # A file can disappear even when its folder still exists.
    (small_dataset/'synthetic/port_costs_synthetic.csv').unlink()
    results,errors=validate_dataset(small_dataset,discover(small_dataset))
    assert 'required_file_missing:synthetic/port_costs_synthetic.csv' in errors
    with pytest.raises(ValidationError): ensure_valid(results,errors)

def test_not_chronological(small_dataset):
    path=small_dataset/'ml_ready/ml_freight_daily.csv'
    rewrite(path,lambda fields,rows:(fields,list(reversed(rows))))
    assert 'not_chronological_within_group' in validate_file(small_dataset,path)['errors']

def test_discovery_rejects_symlink(small_dataset,tmp_path):
    external=tmp_path/'external.csv';external.write_text('x\n1\n')
    (small_dataset/'synthetic/link.csv').symlink_to(external)
    with pytest.raises(ValueError,match='symlinks'): discover(small_dataset)
