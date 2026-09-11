"""Explicit, versioned file/schema/business validation without modifying sources."""
import csv
import hashlib
import io
import json
import math
import re
import statistics
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path
from src.config import PROJECT, ROUTING
from src.discover_files import table_name

CONTRACTS = json.loads((PROJECT/'database/schemas/dataset_contracts.json').read_text())
ML_KEY = ('date', 'route_id', 'vessel_class')
POSITIVE = ('freight_rate_usd_per_mt', 'distance_nm')
NONNEGATIVE = ('wave_height_m', 'wind_speed_kph', 'available_vessel_count', 'ballast_vessel_count')

class ValidationError(ValueError):
    """A safe error containing check identifiers, never credentials or row contents."""

def parse_value(value, kind):
    value = value.strip()
    if not value:
        return None
    if kind == 'BOOLEAN':
        if value.lower() not in {'true', 'false', '1', '0'}:
            raise ValueError('Invalid Boolean; expected true/false or 1/0')
        return value.lower() in {'true', '1'}
    if kind == 'DATE':
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
            raise ValueError('Date must use YYYY-MM-DD')
        return date.fromisoformat(value)
    if kind == 'TIMESTAMP WITH TIME ZONE':
        result = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if result.tzinfo is None:
            raise ValueError('Timestamp requires a timezone')
        return result
    if kind in {'BIGINT', 'NUMERIC'}:
        number = Decimal(value)
        if not number.is_finite():
            raise ValueError('Numeric value must be finite')
        if kind == 'BIGINT':
            if number != number.to_integral_value() or not -(2**63) <= number < 2**63:
                raise ValueError('Invalid BIGINT')
            return int(number)
        return number
    if value.lower() in {'inf', '+inf', '-inf', 'infinity', '-infinity', 'nan'}:
        raise ValueError('Non-finite literal')
    return value

def read_csv(path):
    data = Path(path).read_bytes()
    if not data:
        raise ValidationError('empty_file')
    try:
        reader = csv.reader(io.StringIO(data.decode('utf-8-sig'), newline=''), strict=True)
        header = next(reader)
        if not header or any(not h.strip() for h in header) or len(header) != len(set(header)):
            raise ValidationError('empty_or_duplicate_headers')
        rows, blank_lines = [], 0
        for row in reader:
            if not row or all(not v.strip() for v in row):
                blank_lines += 1
                continue
            if len(row) != len(header):
                raise ValidationError('malformed_row_width')
            rows.append(row)
        if not rows:
            raise ValidationError('no_data_rows')
        return data, header, rows, blank_lines
    except (UnicodeError, csv.Error, StopIteration) as exc:
        raise ValidationError('unsupported_encoding_or_csv_syntax') from exc

def checksum_registry(root):
    """Trust the preserved project baseline, not a mutable candidate's own manifest."""
    baseline = json.loads((PROJECT/'naming-verification.json').read_text())
    prefix = 'CargoPredict_Pipeline_Data/'
    return {x['path'].removeprefix(prefix): x['sha256'] for x in baseline['datasets']}

def validate_file(root, path, contract=None, checksum=None):
    root, path = Path(root), Path(path)
    relative = path.relative_to(root).as_posix()
    layer = relative.split('/')[0]
    result = dict(file=relative, layer=layer, schema=ROUTING.get(layer),
                  table=table_name(path.name) if layer in ROUTING else None,
                  sha256=None, source_rows=0, columns=0, duplicate_count=0,
                  missing_count=0, blank_lines=0, blank_columns=[], types={},
                  synthetic_rows=0, first_date=None, last_date=None,
                  errors=[], warnings=[], status='FAIL', rows=[])
    errors, warnings = result['errors'], result['warnings']
    try:
        data, headers, raw, blank_lines = read_csv(path)
        digest = hashlib.sha256(data).hexdigest()
        result.update(sha256=digest, source_rows=len(raw), columns=len(headers), blank_lines=blank_lines)
        if checksum and digest != checksum:
            errors.append('checksum_mismatch')
        if blank_lines:
            (warnings if layer == 'raw_supplied' else errors).append('blank_lines')
        contract = contract if contract is not None else CONTRACTS.get(relative)
        if contract is None:
            errors.append('unregistered_dataset_contract')
            contract = {h:'TEXT' for h in headers}
        result['types'] = contract
        if set(headers) != set(contract):
            errors.append('required_columns_or_unexpected_columns')
        result['duplicate_count'] = len(raw) - len(set(map(tuple, raw)))
        result['missing_count'] = sum(not v.strip() for row in raw for v in row)
        result['blank_columns'] = [h for i,h in enumerate(headers) if all(not row[i].strip() for row in raw)]
        strict = layer in {'synthetic', 'ml_ready'}
        if result['duplicate_count']:
            (errors if strict or path.stem in {'route_master','port_master'} else warnings).append('duplicate_rows')
        if result['missing_count']:
            (errors if strict or path.stem in {'route_master','port_master'} else warnings).append('missing_cells')
        if result['blank_columns']:
            warnings.append('completely_blank_columns')
        parse_errors = Counter()
        typed = []
        for raw_row in raw:
            row = {}
            for h,v in zip(headers,raw_row):
                try:
                    row[h] = parse_value(v, contract.get(h,'TEXT'))
                except (ValueError, InvalidOperation, OverflowError):
                    parse_errors[h] += 1
                    row[h] = None
            typed.append(row)
        errors.extend(f'invalid_type:{h}:{n}' for h,n in sorted(parse_errors.items()))
        if layer in ROUTING:
            if not {'source_origin','is_synthetic'} <= set(headers):
                errors.append('missing_provenance_or_synthetic_flag')
            else:
                if any(not row.get('source_origin') or row.get('is_synthetic') is None for row in typed):
                    errors.append('missing_provenance_value')
                expected = strict
                if any(row.get('is_synthetic') is not expected for row in typed):
                    errors.append('incorrect_synthetic_labels')
                if any(('synthetic' in str(row.get('source_origin')).lower()) != expected for row in typed):
                    errors.append('mixed_source_provenance')
        result['synthetic_rows'] = sum(row.get('is_synthetic') is True for row in typed)
        for key in ['date','quote_date','effective_from','source_verified_date']:
            dates = [row[key] for row in typed if isinstance(row.get(key),date)]
            if dates:
                result['first_date'],result['last_date'] = str(min(dates)),str(max(dates))
                if min(dates) < date(1900,1,1) or max(dates) > date.today():
                    errors.append('date_outside_supported_range')
                break
        # Source periods are preserved verbatim but calendar validity is still checked.
        if layer == 'raw_supplied' and 'date' in headers:
            for row in typed:
                v=row.get('date')
                if not v: continue
                try:
                    if re.fullmatch(r'\d{4}',v): date.fromisoformat(v+'-01-01')
                    elif re.fullmatch(r'\d{4}-\d{2}',v): date.fromisoformat(v+'-01')
                    else: date.fromisoformat(v)
                except ValueError:
                    warnings.append('source_date_requires_normalization')
                    break
        for c in POSITIVE + NONNEGATIVE + ('congestion_score',):
            if c not in headers: continue
            bad = False
            for row in typed:
                v=row.get(c)
                if v is None: continue
                try:
                    v=Decimal(str(v))
                    bad |= v<=0 if c in POSITIVE else not (0<=v<=100) if c=='congestion_score' else v<0
                except InvalidOperation: bad=True
            if bad: errors.append('business_rule:'+c)
        if path.name == 'ml_freight_daily.csv':
            keys=[tuple(row.get(k) for k in ML_KEY) for row in typed]
            result['duplicate_keys']=len(keys)-len(set(keys))
            result['route_count']=len({row.get('route_id') for row in typed})
            if result['duplicate_keys']: errors.append('duplicate_ml_key')
            groups=defaultdict(list)
            for row in typed: groups[(row.get('route_id'),row.get('vessel_class'))].append(row.get('date'))
            if any(None in ds or ds!=sorted(ds) for ds in groups.values()):
                errors.append('not_chronological_within_group')
        result['rows']=typed
    except (OSError, ValidationError) as exc:
        errors.append(str(exc) if isinstance(exc,ValidationError) else 'file_unreadable')
    result['errors']=sorted(set(errors))
    result['warnings']=sorted(set(warnings))
    result['status']='FAIL' if errors else 'PASS_WITH_WARNINGS' if warnings else 'PASS'
    return result

def cross_validate(results):
    """Check references and recompute lag/rolling values from the full earlier history."""
    by_file={r['file']:r for r in results}
    required=['standardized/route_master.csv','standardized/port_master.csv',
              'standardized/vessel_specifications.csv','standardized/port_specifications.csv',
              'synthetic/route_freight_rates_synthetic.csv','ml_ready/ml_freight_daily.csv']
    if any(n not in by_file or by_file[n]['errors'] for n in required):
        return ['cross_validation_dependencies_invalid']
    routes={row['route_id']:row for row in by_file[required[0]]['rows']}
    ports={row['port_id']:row for row in by_file[required[1]]['rows']}
    vessels={row['vessel_class'] for row in by_file[required[2]]['rows']}
    specifications={row['port'].casefold() for row in by_file[required[3]]['rows']}
    for r in results:
        if r['layer'] not in {'synthetic','ml_ready'} and r['table']!='route_master': continue
        checks=set()
        for row in r['rows']:
            if 'route_id' in row and row['route_id'] not in routes: checks.add('unknown_route')
            if 'vessel_class' in row and row['vessel_class'] not in vessels: checks.add('unknown_vessel_class')
            for c in ['port_id','origin_port_id','destination_port_id']:
                if c in row and row[c] not in ports: checks.add('unknown_port')
            if 'route_id' in row and row['route_id'] in routes:
                ref=routes[row['route_id']]
                for c in ['origin_port_id','destination_port_id','vessel_class','distance_nm']:
                    if c in row and row[c]!=ref[c]: checks.add('route_master_mismatch:'+c)
        r['errors'].extend(sorted(checks))
    ml=by_file[required[-1]]
    uncovered=sorted(p for p,v in ports.items() if v['port_name'].casefold() not in specifications)
    if uncovered:
        ml['warnings'].append('port_specifications_missing:'+','.join(uncovered))
    for key in ['route_id','port_id']:
        master=by_file[required[0 if key=='route_id' else 1]]
        values=[row[key] for row in master['rows']]
        if len(values)!=len(set(values)): master['errors'].append('duplicate_master_key')
    history=defaultdict(list)
    for row in by_file[required[-2]]['rows']:
        history[(row['route_id'],row['vessel_class'])].append(row)
    expected={}
    for key,rows in history.items():
        rows.sort(key=lambda r:r['date'])
        if any(b['date']-a['date']!=timedelta(days=1) for a,b in zip(rows,rows[1:])):
            ml['errors'].append('non_daily_or_duplicate_freight_history')
        for i,row in enumerate(rows):
            if i<30: continue
            values={f'freight_lag_{lag}':float(rows[i-lag]['freight_rate_usd_per_mt']) for lag in [1,7,14,30]}
            for window in [7,14,30]:
                prior=[float(x['freight_rate_usd_per_mt']) for x in rows[i-window:i]]
                values[f'freight_rolling_mean_{window}']=statistics.mean(prior)
                if window==7: values['freight_rolling_std_7']=statistics.stdev(prior)
            values['freight_rate_usd_per_mt']=float(row['freight_rate_usd_per_mt'])
            expected[(row['date'],*key)]=values
    actual={tuple(row[k] for k in ML_KEY) for row in ml['rows']}
    if actual!=set(expected): ml['errors'].append('ml_history_coverage_or_maximum_lag_window')
    failures=set()
    for row in ml['rows']:
        exp=expected.get(tuple(row[k] for k in ML_KEY))
        if exp is None: continue
        for c,value in exp.items():
            try:
                if not math.isclose(float(row[c]),value,rel_tol=1e-8,abs_tol=1e-7): failures.add('leakage_or_history_mismatch:'+c)
            except (TypeError,KeyError,ValueError): failures.add('leakage_or_history_mismatch:'+c)
    ml['errors'].extend(sorted(failures))
    for r in results:
        r['errors']=sorted(set(r['errors']))
        r['warnings']=sorted(set(r['warnings']))
        r['status']='FAIL' if r['errors'] else 'PASS_WITH_WARNINGS' if r['warnings'] else 'PASS'
    return []

def validate_dataset(root, files):
    registry=checksum_registry(root)
    missing=sorted(set(CONTRACTS)-{p.relative_to(root).as_posix() for p in files})
    results=[validate_file(root,p,checksum=registry.get(p.relative_to(root).as_posix())) for p in files]
    errors=['required_file_missing:'+x for x in missing]
    errors.extend(cross_validate(results))
    return results,errors

def ensure_valid(results, errors=()):
    failures=list(errors)+[r['file']+':'+','.join(r['errors']) for r in results if r['errors']]
    if failures:
        raise ValidationError('; '.join(failures))
