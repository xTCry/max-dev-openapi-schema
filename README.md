# Max OpenAPI Schema

> Актуальная OpenAPI-схема Max Bot API в JSON и YAML.

## Files

- `openapi.json` - текущая JSON-схема
- `openapi.yaml` - текущая YAML-схема
- `schemas/` - архив версий схемы
- `site/` - статическая страница Swagger UI

## Updates

Парсер находится в ветке `parser`. Из рабочей копии этой ветки схема
обновляется командами:

```bash
make schema-update
make schema-status
make schema-diff
make schema-commit
```
