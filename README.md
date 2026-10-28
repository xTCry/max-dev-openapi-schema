# Max OpenAPI Schema

[![Schema update](https://img.shields.io/badge/schema%20update-disabled-gray)](#)
[![OpenAPI](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fopenapi.json&query=%24.info.version&label=OpenAPI&prefix=v)](#)
[![OpenAPI spec](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fopenapi.json&query=%24.openapi&label=OpenAPI%20spec)](#)
[![Schema updated](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FxTCry%2Fmax-dev-openapi-schema%2Fschema%2Fschema-status.json)](#)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-open-blue)](https://xtcry.github.io/max-dev-openapi-schema/)

> Снимок OpenAPI-схемы Max Bot API в JSON и YAML. Этот репозиторий больше не обновляется. Актуальная схема доступна в [официальном репозитории MAX](https://github.com/max-messenger/api-schema).

## Files

- [`openapi.json`](./openapi.json) - последняя схема, извлеченная парсером, в JSON
- [`openapi.yaml`](./openapi.yaml) - последняя схема, извлеченная парсером, в YAML
- [`schemas/`](./schemas/) - архив версий схемы
- [`public/`](./public/) - исходники статического сайта вместе со Swagger

## Updates

Автоматическое обновление схемы отключено. За изменениями и актуальной версией
следите в [репозитории MAX](https://github.com/max-messenger/api-schema).

В ветке [`schema`](https://github.com/xTCry/max-dev-openapi-schema/tree/schema) хранится последняя выгрузка с сайта от 15 октября 2026 года.  
В ветке [`official-schema`](https://github.com/xTCry/max-dev-openapi-schema/tree/official-schema) находится снимок схемы из репозитория MAX от 17 сентября 2026 года.
Доступно [сравнение схем](https://github.com/xTCry/max-dev-openapi-schema/compare/1ec254e...official-schema#diff-d910ba2ef878f7db0223a966b81c8b3f3b65027bb39e4431bb05140171eece39).

<!--
Парсер находится в ветке `parser`. Из рабочей копии этой ветки схема
обновляется командами:

```bash
make schema-update
make schema-status
make schema-diff
make schema-commit
```
-->

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

<!--
## Automatic updates

Workflow `.github/workflows/update-schema.yml` запускается вручную и два раза в
день: в 06:18 и 18:18 по МСК. Он получает код из ветки `parser`, обновляет
схему в ветке `schema` и создает коммит только при изменениях. После обновления
schema workflow также публикует новую версию GitHub Pages.
-->
