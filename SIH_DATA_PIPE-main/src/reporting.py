"""Local JSON/CSV evidence; validation-only never implies database readiness."""
import csv
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

def now():
    return datetime.now(timezone.utc).isoformat()

def public_report(report):
    return {**report,'files':[{k:v for k,v in r.items() if k!='rows'} for r in report.get('files',[])]}

def atomic_text(path, text):
    path=Path(path)
    path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile('w',dir=path.parent,delete=False,encoding='utf-8') as f:
        f.write(text)
        temporary=f.name
    os.replace(temporary,path)

def export_report(report, directory):
    directory=Path(directory)
    safe=public_report(report)
    payload=json.dumps(safe,indent=2,default=str)+'\n'
    atomic_text(directory/(report['run_id']+'.json'),payload)
    atomic_text(directory/'latest_pipeline_run.json',payload)
    import io
    for filename,columns,rows in [
        ('table_row_counts.csv',['file','schema','table','source_rows','inserted_rows','database_rows','load_status'],
         [r for r in safe.get('files',[]) if r['schema']]),
        ('data_quality_summary.csv',['file','source_rows','columns','sha256','duplicate_count','missing_count','synthetic_rows','status','errors','warnings'],safe.get('files',[]))]:
        output=io.StringIO(newline='')
        writer=csv.DictWriter(output,fieldnames=columns,extrasaction='ignore')
        writer.writeheader()
        for r in rows:
            writer.writerow({k:';'.join(v) if isinstance(v,list) else v for k,v in r.items()})
        atomic_text(directory/filename,output.getvalue())
    return str(directory/'latest_pipeline_run.json')
