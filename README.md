# Max OpenAPI Schema

## Parser

Парсер получает OpenAPI-схему из JavaScript-чанка сайта
`https://dev.max.ru`, исправляет известные проблемы исходной
выгрузки и сохраняет JSON- и YAML-версии схемы.

Парсер запускать из рабочей папки с nodejs проектом

```bash
cd parser
```

### Требования

- Node.js 24.13.0 или новее
- npm

### Установка

```bash
npm install
```

### Запуск

Запуск исходного TypeScript-кода:

```bash
npm run dev
```

Сборка и запуск JavaScript из `dist/`:

```bash
npm run build
npm run start
```

По умолчанию парсер обращается к `https://dev.max.ru/docs-api`. Другой адрес
можно передать через `--url`:

```bash
npm run dev -- --url https://dev.max.ru/docs-api
```

Для сохранения схемы в другой каталог используйте `--output-dir`:

```bash
npm run dev -- --output-dir ../../max-dev-openapi-schema-schema
```

Справка по аргументам:

```bash
npm run dev -- --help
```

### Результат

При изменении схемы обновляются файлы в корне репозитория:

- `openapi.json` - форматированная json схема
- `openapi.yaml` - YAML-версия схемы

Также создаются доп. архивные копии в `schemas/`:

```text
schema-YYYY-MM-DD-VERSION.json
schema-YYYY-MM-DD-VERSION.yaml
```

Если JSON-схема не изменилась, новый архив не создается. YAML-файл при этом
синхронизируется с актуальными правилами форматирования.

### Работа со схемами

Исходный код парсера хранится в ветке `parser`. Схемы нужно вести в отдельной
ветке `schema`, открытой через git worktree. Это позволяет запускать парсер и
готовить коммиты схем без переключения веток.

Создание рабочей копии ветки `schema`:

```bash
cd ..
git worktree add --orphan -b schema max-dev-openapi-schema-schema
```

Обновление схемы из рабочей копии `parser`:

```bash
cd max-dev-openapi-schema/parser
npm run dev -- --output-dir ../../max-dev-openapi-schema-schema
```

После выполнения команды проверить и закоммитить изменения нужно в рабочей
копии `schema`:

```bash
cd ../../max-dev-openapi-schema-schema
git status
git add openapi.json openapi.yaml schemas/
git commit -m "chore(schema): update OpenAPI schema"
```

### Проверки

```bash
npm run format
npm run typecheck
npm run lint
npm run lint:yaml
npm run test
```

### Известные исправления

В текущей выгрузке Max параметр `message_ids` метода `GET /messages` может
содержать ошибочно вложенные данные всей схемы. Миграция восстанавливает
ожидаемый тип параметра `array` со строковым форматом и удаляет лишние данные.
