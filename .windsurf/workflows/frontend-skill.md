---
description: Local adaptation of the OpenAI GPT-5.4 frontend-skill for visually strong frontend work
---
# Frontend Skill Workflow

Використовуй цей workflow, коли задача стосується:
- landing page
- marketing site
- visually strong website
- prototype
- demo UI
- app UI
- dashboard UI
- game UI

## Мета
Створювати інтерфейси, які виглядають deliberate, premium, current, зі стриманою композицією, сильною візуальною ієрархією, невеликою кількістю, але якісними motion-ефектами.

## 1. Перед стартом сформулюй 3 речі
Перед генерацією UI завжди зафіксуй:
- `visual thesis` — 1 речення про mood, material, energy
- `content plan` — які саме секції потрібні
- `interaction thesis` — 2-3 motion-ідеї, які покращують відчуття від сторінки

## 2. Основні дефолти
- Починай з композиції, а не з набору компонентів
- Віддавай перевагу `full-bleed hero` або сильному visual anchor
- Назва бренду або продукту має бути найгучнішим текстом
- Копірайт має читатися за кілька секунд
- Спочатку використовуй whitespace, alignment, scale, contrast, cropping, а вже потім додатковий chrome
- Тримай максимум `2` шрифти
- Тримай максимум `1` accent color, якщо бренд не вимагає інакше
- За замовчуванням уникай card-heavy UI
- Перший viewport має виглядати як постер

## 3. Структура landing page
Типова послідовність:
1. `Hero` — бренд/продукт, promise, CTA, один dominant visual
2. `Support` — один конкретний feature або proof point
3. `Detail` — workflow, atmosphere, story або product depth
4. `Final CTA` — конверсія

## 4. Правила для hero
- Лише одна композиційна ідея
- Hero має бути edge-to-edge, якщо це брендова сторінка з сильним visual-first підходом
- Не використовуй hero cards без прямої причини
- Не використовуй stat strips, logo clouds, pill soup або floating dashboards by default
- Заголовок має вкладатися приблизно в 2-3 рядки на desktop
- Текстовий блок має лежати в calm area з хорошим контрастом
- Якщо після приховування зображення перший екран не втрачає сенсу, значить зображення занадто слабке
- Якщо бренд зникає після приховування nav, значить ієрархія занадто слабка

## 5. Правила для app UI
- Орієнтуйся на restraint у стилі `Linear`
- Будуй структуру навколо:
  - primary workspace
  - navigation
  - secondary context / inspector
  - one clear accent for action or state
- Уникай:
  - dashboard-card mosaics
  - товстих бордерів на кожному блоці
  - декоративних градієнтів у routine product UI
  - кількох accent colors без причини
  - ornamental icons, які не допомагають scanability
- Якщо панель можна перетворити на plain layout без втрати змісту — прибери card treatment

## 6. Правила для imagery
- Зображення має виконувати narrative work
- Для brand/lifestyle/editorial інтерфейсів використовуй хоча б один сильний реалістичний image anchor
- Віддавай перевагу in-situ photography над абстрактними градієнтами
- Не використовуй зображення з зайвими логотипами, signage або typographic clutter
- Не покладайся лише на декоративну текстуру

## 7. Правила для copy
- Пиши product language, а не design commentary
- Заголовок має нести основний сенс
- Supporting copy зазвичай має бути коротким реченням
- Уникай повторення між секціями
- Не вставляй prompt language у UI
- Кожна секція повинна мати одну відповідальність: explain, prove, deepen або convert

## 8. Utility copy для dashboard/app
- Якщо це dashboard, admin, app surface або operational workspace — віддавай перевагу utility copy
- Не додавай marketing hero без прямого запиту
- Хедінги повинні описувати, що це за зона або що тут можна зробити
- Supporting text має пояснювати scope, status, freshness або decision value
- Якщо текст звучить як homepage hero, перепиши його у product/UI тон

## 9. Motion
Додавай 2-3 осмислені motion-ефекти для візуально важливих сторінок:
- один entrance sequence у hero
- один scroll-linked / sticky / depth effect
- один hover / reveal / layout transition

Вимоги до motion:
- motion має бути помітним, але стриманим
- smooth на mobile
- consistent across the page
- якщо motion лише декоративний і не покращує hierarchy або atmosphere — прибери його

## 10. Hard rules
- No cards by default
- No hero cards by default
- No boxed hero, якщо brief вимагає full bleed
- Не більше однієї dominant idea на секцію
- Без filler copy
- Не більше двох шрифтів без чіткої причини
- Не більше одного accent color без чіткої причини

## 11. Перевірка якості перед завершенням
Перед завершенням перевір:
- Чи бренд або продукт unmistakable на першому екрані?
- Чи є один сильний visual anchor?
- Чи можна зрозуміти сторінку, якщо швидко просканувати лише headlines?
- Чи має кожна секція одну чітку роботу?
- Чи справді cards необхідні?
- Чи motion підсилює hierarchy або atmosphere?
- Чи залишиться дизайн premium, якщо прибрати декоративні тіні?

## 12. Рекомендований стек реалізації
- `React`
- `Tailwind CSS`
- `Framer Motion`

## 13. Джерело
Адаптовано зі статті OpenAI:
`https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4`
