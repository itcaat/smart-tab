# Background and Motivation
Пользователь хочет расширение Chrome под названием **smart tab**, которое при открытии новой вкладки показывает все открытые вкладки, сгруппированные по сайтам (доменам), в стиле Smart Tabs. Это позволит быстро переключаться между вкладками и визуально управлять ими.

# Key Challenges and Analysis
- Получение списка всех открытых вкладок браузера.
- Группировка вкладок по домену/сайту.
- Отображение информации на странице новой вкладки (new tab override).
- Удобный и быстрый UI (Smart Tabs, иконки сайтов, названия, предпросмотр?).
- Работа с разрешениями Chrome (tabs, newTabOverride).
- Минимальный дизайн, чтобы не перегружать пользователя.
- Локализация (опционально).
- Производительность при большом количестве вкладок.

# High-level Task Breakdown
1. Создать структуру расширения Chrome (manifest, папки, базовые файлы).
   - Success: В проекте есть manifest.json, popup/newtab html, js, css.
2. Реализовать захват и группировку всех открытых вкладок по домену.
   - Success: В консоли new tab выводятся сгруппированные вкладки.
3. Реализовать UI для отображения групп (Smart Tabs: иконка сайта, название, список вкладок).
   - Success: На новой вкладке видны группы, каждая содержит вкладки с этого сайта.
4. Добавить возможность перехода по вкладке при клике.
   - Success: Клик по элементу переводит к соответствующей вкладке.
5. (Опционально) Добавить предпросмотр, favicon, drag-n-drop, удаление вкладки.
   - Success: UI поддерживает дополнительные функции.
6. Провести тестирование и отладку.
   - Success: Все работает стабильно, нет багов, UX удобен.

## Project Status Board

- [x] Draft privacy policy for Chrome Web Store publication (docs/privacy-policy.md)
- [ ] User review and confirm privacy policy is ready for submission
- [ ] Close new tab after clicking a tile (implemented, needs user testing)
- [x] Fix horizontal scroll bug (CSS changes to prevent overflow)

## Executor's Feedback or Assistance Requests

- The privacy policy has been drafted in docs/privacy-policy.md, focusing on minimal data collection and user privacy, suitable for Chrome Web Store requirements. Please review the document and confirm if it meets your expectations or if any changes are needed before marking this task as complete.

- The feature to close the new tab after clicking a tile has been implemented. Please test this behavior: when you click a tile, the corresponding tab should be activated and the new tab page should close automatically. Let me know if it works as expected or if any adjustments are needed.

- Applied CSS fixes to prevent horizontal scrolling: set overflow-x: hidden on html, body, and .speeddial; set box-sizing: border-box globally; changed #app width from 100vw to 100%.
- Opened newtab.html for manual verification. Please check if the horizontal scroll issue is resolved in your browser. If not, let me know so I can further investigate.

Previous implementation pinned individual tabs, but user clarified the requirement is to pin/unpin entire groups (domains). Will update logic and UI to support pinning groups instead of tabs. Task 8 is now in progress for group pinning. 