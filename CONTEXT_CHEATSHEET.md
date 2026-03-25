# CONTEXT_CHEATSHEET

## Поточний контекст
- Workspace: `c:/Users/Admin/Desktop/Roz_robka/mar_ch`
- Стан: порожній workspace
- Мета: локально адаптувати `frontend-skill` зі статті OpenAI про GPT-5.4 для подальшої фронтенд-розробки
- Джерело: `https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4`

## Що важливо про оригінальний skill
- Оригінальний `frontend-skill` описаний для `Codex app`
- У статті інсталяція виглядає як `$skill-installer frontend-skill`
- У цьому середовищі немає прямої системної інсталяції skill у Codex-форматі
- Практичний еквівалент тут: локальний workflow + коротка проєктна шпаргалка

## Ключові принципи frontend-skill
- Починати з композиції, а не з компонентів
- Робити перший екран як постер, а не як документ
- За замовчуванням уникати карток, особливо в hero-блоці
- Тримати одну домінантну ідею на секцію
- Обмежувати систему: максимум 2 шрифти, 1 акцентний колір
- Вибудовувати сторінку як наратив: `Hero -> Support -> Detail -> Final CTA`
- Давати сильний візуальний якір: full-bleed hero або dominant visual plane
- Тримати копірайт коротким, конкретним і без design-commentary у UI
- Для app UI віддавати перевагу utility copy замість marketing copy
- Анімації мають підсилювати ієрархію, а не створювати шум

## Практичні інструкції для майбутніх задач
- Для landing page спочатку сформулювати:
  - `visual thesis`
  - `content plan`
  - `interaction thesis`
- Для app/dashboard UI не додавати hero без прямого запиту
- Якщо елемент можна прибрати з card-обгортки без втрати сенсу — прибрати card-обгортку
- Якщо текст можна скоротити на 30% і UI стає кращим — скоротити
- Якщо декоративні тіні прибрати і дизайн розвалюється — композиція слабка

## Рекомендований стек
- `React`
- `Tailwind CSS`
- `Framer Motion` для помірної, цілеспрямованої анімації

## Як використовувати в цьому workspace
- Орієнтуйся на workflow: `.windsurf/workflows/frontend-skill.md`
- Використовуй цей cheat sheet як короткий reference перед генерацією нових сторінок або UI
