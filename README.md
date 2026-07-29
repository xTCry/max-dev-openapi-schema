# Max OpenAPI Schema

> Актуальная OpenAPI-схема Max Bot API в JSON и YAML.

## Files

- `openapi.json` - текущая JSON-схема
- `openapi.yaml` - текущая YAML-схема
- `schemas/` - архив версий схемы
- `public/` - исходники статического сайта вместе со Swagger

## Updates

Парсер находится в ветке `parser`. Из рабочей копии этой ветки схема
обновляется командами:

```bash
make schema-update
make schema-status
make schema-diff
make schema-commit
```

## Web - local preview

Собрать статический сайт:

```bash
./scripts/build-site.sh
```

Для загрузки схемы браузер должен открыть страницу через HTTP, а не как файл.
Например:

```bash
npx serve dist
```

После запуска открыть `http://localhost:3000/`.

- `http://localhost:3000/swagger/` - Swagger UI.
- `http://localhost:3000/scalar/` - Scalar API Reference.
