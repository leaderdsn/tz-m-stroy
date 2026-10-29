# tz-m-stroy

Тестовое задание в компанию MStroy, на позицию Frontend разработчика

## Запуск

Требуется Node.js `^22.18.0` или `>=24.12.0`.

```sh
npm ci
npm run dev
```

## Скрипты

| Команда                 | Описание                    |
| ----------------------- | --------------------------- |
| `npm run dev`           | Запуск dev-сервера          |
| `npm run build`         | Проверка типов и сборка     |
| `npm run preview`       | Просмотр собранного проекта |
| `npm test`              | Unit-тесты                  |
| `npm run test:coverage` | Unit-тесты с покрытием      |
| `npm run test:bench`    | Тесты производительности    |
| `npm run lint`          | Проверка ESLint             |
| `npm run format`        | Форматирование Prettier     |

## Структура

```
public/items.json              — данные, загружаются через fetch
src/store/TreeStore.ts         — класс TreeStore
src/types/tree.ts              — типы элементов
src/api/items.ts               — загрузка данных с задержкой 2 секунды
src/components/TreeTable.vue   — таблица на AG Grid
src/components/CategoryCell.vue — ячейка «Категория» с кнопками добавления и удаления
src/App.vue                    — загрузка данных, вывод таблицы, добавление и удаление строк
```

Тесты лежат в папках `__tests__` рядом с кодом.

## TreeStore

```ts
import { TreeStore } from './src/store/TreeStore'
```

Элементы хранятся в двух `Map`: по `id` и по `parent` (дочерние элементы).
Индексы строятся за один проход в `setItems` и обновляются точечно при изменениях,
поэтому `getItem`, `getChildren` и `getAllParents` не обходят весь массив.
