PYTHON ?= .venv/bin/python
.PHONY: setup db-up validate load verify test db-down
setup:
	python3 -m venv .venv
	$(PYTHON) -m pip install -r requirements.txt
db-up:
	docker compose up -d --wait
validate:
	$(PYTHON) -m src.flows.cargopredict_pipeline --mode validate-only
load:
	$(PYTHON) -m src.flows.cargopredict_pipeline --mode full-refresh
verify:
	$(PYTHON) -m src.flows.cargopredict_pipeline --mode verify-only
test:
	$(PYTHON) -m pytest -q
db-down:
	docker compose stop
