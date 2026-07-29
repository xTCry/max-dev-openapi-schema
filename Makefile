.PHONY: schema-update schema-status schema-diff

SCHEMA_DIR := $(shell git worktree list --porcelain | awk '/^worktree / { path = substr($$0, 10) } /^branch refs\/heads\/schema$$/ { print path; exit }')

schema-update:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	npm --prefix parser run dev -- --output-dir "$(SCHEMA_DIR)"

schema-status:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	git -C "$(SCHEMA_DIR)" status --short --branch

schema-diff:
	@test -n "$(SCHEMA_DIR)" || { echo "Не найден worktree ветки schema." >&2; exit 1; }
	git -C "$(SCHEMA_DIR)" diff -- openapi.json openapi.yaml schemas/
