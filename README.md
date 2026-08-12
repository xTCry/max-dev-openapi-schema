# Max OpenAPI Schema

[![Schema update](https://github.com/xTCry/max-dev-openapi-schema/actions/workflows/update-schema.yml/badge.svg?branch=schema)](https://github.com/xTCry/max-dev-openapi-schema/actions/workflows/update-schema.yml?query=branch%3Aschema)
[![OpenAPI](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fopenapi.json&query=%24.info.version&label=OpenAPI&prefix=v)](#)
[![OpenAPI spec](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fopenapi.json&query=%24.openapi&label=OpenAPI%20spec)](#)
[![Schema updated](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fschema-status.json)](#)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-open-blue)](https://xtcry.github.io/max-dev-openapi-schema/)

> Актуальная OpenAPI-схема Max Bot API в JSON и YAML.

## Files

- [`openapi.json`](./openapi.json) - текущая JSON-схема
- [`openapi.yaml`](./openapi.yaml) - текущая YAML-схема
- [`schemas/`](./schemas/) - архив версий схемы
- [`public/`](./public/) - исходники статического сайта вместе со Swagger

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

## Automatic updates

Workflow `.github/workflows/update-schema.yml` запускается вручную и два раза в
день: в 06:18 и 18:18 по МСК. Он получает код из ветки `parser`, обновляет
схему в ветке `schema` и создает коммит только при изменениях. После обновления
schema workflow также публикует новую версию GitHub Pages.
