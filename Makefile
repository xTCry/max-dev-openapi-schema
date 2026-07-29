.PHONY: schema-update schema-status schema-diff schema-commit

SCHEMA_DIR := $(shell git worktree list --porcelain | awk '/^worktree / { path = substr($$0, 10) } /^branch refs\/heads\/schema$$/ { print path; exit }')
SCHEMA_COMMIT_MESSAGE ?= chore(schema): update openapi schema

schema-update:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	npm --prefix parser run dev -- --output-dir "$(SCHEMA_DIR)"

schema-status:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	git -C "$(SCHEMA_DIR)" status --short --branch

schema-diff:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	git -C "$(SCHEMA_DIR)" diff -- openapi.json openapi.yaml schemas/

schema-commit:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	@test -n "$$(git -C "$(SCHEMA_DIR)" status --short -- openapi.json openapi.yaml schemas/)" || { echo "Изменений схемы нет." >&2; exit 1; }
	git -C "$(SCHEMA_DIR)" add openapi.json openapi.yaml schemas/
	git -C "$(SCHEMA_DIR)" commit -m "$(SCHEMA_COMMIT_MESSAGE)"
