# Sobor (parish-template-sobor)

A parish website template for Project Orthodox and the OrthodoxConnect website builder. It has one fixed design: a large Slavic cathedral look in forest green, antique gold and cream. The demo parish, St. Example Russian Orthodox Cathedral, is sample content only.

All text in the template is short placeholder copy. Each parish adds its own welcome text, history and other content.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317
npm run build      # checks content, then writes the static site to out/
npm run serve      # serves out/ at http://localhost:4318
```

`out/` is a plain static site: every page is a folder with an `index.html` file, and there is a `404.html`. Upload it to any static host. If the site lives in a subfolder, build with `NEXT_PUBLIC_BASE_PATH=/subfolder`.

## Editing

All content lives in `content/*.json`. Each file has a JSON Schema in `content/schema/`, and `npm run validate` checks every file.

| File | What it holds |
| --- | --- |
| `site.json` | Name, contact details, languages, calendarStyle, logo style, hero, modules on or off, payments, donations |
| `pages.json` | Page tree and menu order. Each page has a list of sections you can turn on or off and reorder |
| `schedule.json`, `feasts.json` | Weekly services, one-off services, feasts and the services they add |
| `clergy.json`, `history.json`, `gallery.json`, `news.json`, `sermons.json` | Our Parish and Livestream content |
| `store.json`, `parish-services.json`, `zapiski.json`, `connect.json` | The four optional modules |
| `ui.json` | Buttons, labels and messages in every language |

- Pages can nest to any depth. Child pages become dropdown items and subpage cards.
- The Welcome block on the home page and the About us block on Our Parish are optional. Set `"enabled": false` to hide them.
- Modules (`site.json` > `modules`): `livestream`, `store`, `requestService`, `zapiski`, `getInvolved`. Turning one off removes its pages, menu items and home sections.
- Languages (`site.json` > `languages`): add or remove entries. Every text field is an object keyed by language code. Missing translations fall back to `defaultLanguage`. The switcher adapts to the number of languages, and `dir: "rtl"` is supported.
- Logo (`site.json` > `logo.style`): `seal`, `kiot`, `square` (your own image) or `wordmark`.
- Calendar (`site.json` > `calendarStyle`): `old` or `new`. Old uses the Julian calendar for fixed feasts (civil date plus Old Style). New uses the Revised Julian calendar (civil dates for fixed feasts). Pascha follows the Orthodox paschalion for both.
- Colors and fonts are set in `src/styles/tokens.css`.
- Placeholder photo sources are listed in `IMAGE-SOURCES.md` and on the Image credits page.

## Integrations still to connect

Each one is a single function marked `TODO`:

- Payments for the store, donations and zapiski: `src/lib/integrations/payments.ts` (Stripe or Authorize.net)
- OrthodoxConnect sign-ups, deep links and the newsletter: `src/lib/integrations/orthodoxconnect.ts`
- Contact and service request forms: `src/lib/integrations/forms.ts`

Until then the forms work in sample mode and send or charge nothing.
