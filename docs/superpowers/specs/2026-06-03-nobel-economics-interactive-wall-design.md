# Nobel Economics Interactive Wall Design

## Context

The Economics College is building a first-floor interactive section for a discipline-oriented ideological and political education base. The available equipment document describes a touch wall made from BOE 55-inch screens with 1920x1080 resolution per panel and a custom infrared touch frame around 4109x1213 mm. The content source is `1969-2025年诺贝尔经济学奖得主.docx`, which contains laureate years, names, theory summaries, quotes, and embedded portrait images.

The approved direction is a full-coverage Nobel economics laureate wall covering 1969-2025. The user selected an avatar matrix and then selected decade-based browsing for the full data set.

## Goals

- Show all Nobel Memorial Prize in Economic Sciences laureates from 1969 through 2025.
- Make the first screen readable on a wide first-floor touch wall.
- Let visitors browse by decade and tap an economist to see details.
- Combine academic content with a calm, institutional visual tone suitable for Zhejiang University Economics College.
- Reuse portraits embedded in the existing Word document where possible.

## Non-Goals

- Do not build a general content management system.
- Do not require visitors to type on the large screen.
- Do not make a marketing landing page.
- Do not depend on live network data during normal display.

## Product Design

The page opens directly into the interactive wall, not a landing page. It uses a full-screen layout optimized for a wide touch display.

The header shows the college/base context and the module title:

- `浙江大学经济学院 学科思政基地`
- `诺贝尔经济学奖得主`

The main navigation groups all laureates by decade:

- `1969-1979`
- `1980s`
- `1990s`
- `2000s`
- `2010s`
- `2020s`

Selecting a decade updates the visible avatar matrix. Each person card includes:

- Portrait or generated initials avatar
- Chinese name
- Award year
- Short theory tag

Tapping a person updates a detail panel. The detail panel includes:

- Portrait
- Chinese name
- English name where available
- Country or region where available
- Award year
- Classic theory or contribution
- Quote
- Short personal introduction

If no person is selected yet, the first laureate in the active decade is selected by default.

## Interaction Design

The interaction model is intentionally simple for public touch use:

- Tap a decade to switch the avatar matrix.
- Tap a laureate to show their details.
- The active decade and active person are visually highlighted.
- After 30 seconds with no touch interaction, the page auto-advances to another laureate.
- Any touch pauses and resets the auto-advance timer.

Text input is excluded because typing is uncomfortable on a public touch wall.

## Data Model

The implementation should convert the Word document into a structured local data file. Recommended shape:

```json
[
  {
    "year": 1969,
    "decade": "1969-1979",
    "nameZh": "拉格纳·弗里希",
    "nameEn": "Ragnar Frisch",
    "country": "挪威",
    "theoryTag": "计量经济学",
    "theory": "创立计量经济学，提出计量经济学中的概率方法，发展动态经济学传播模型。",
    "quote": "计量经济学可以定义为基于理论与观测的同时发展，通过适当的推理方法联系起来的实际经济现象的定量分析。",
    "bio": "拉格纳·弗里希是计量经济学的重要奠基者之一，他推动经济理论与统计观测相结合，使经济现象能够被更精确地建模和分析。",
    "portrait": "assets/portraits/frisch-ragnar.png"
  }
]
```

The source document may contain multiple laureates in one year. Each laureate should become one record while sharing the same award year.

## Content Handling

The existing Word document contains text and many embedded media files. The parser should:

- Extract year sections from `word/document.xml`.
- Parse `得主`, `经典理论`, and `精彩名言` blocks.
- Split multi-laureate years into individual records.
- Extract embedded images into local assets.
- Map portraits to laureates where the document structure makes that possible.
- Use initials-based placeholders when a portrait cannot be confidently mapped.

Some source content may include missing values such as `找不到`. Those should be treated as missing fields, not displayed as final copy.

## Visual Direction

The visual tone should be scholarly, calm, and legible:

- Dark green/charcoal base for the wall background.
- Warm gold for active states and award accents.
- Light paper-toned panels for cards and details.
- Large type, high contrast, and generous touch targets.

The palette should not become a single-color theme. Secondary accents may include muted blue, brick, and olive in portrait placeholders or small tags.

## Technical Architecture

Build as a standalone local web module that can run full-screen in a browser on the display server. A static implementation is sufficient unless later requirements add remote editing.

Recommended structure:

```text
index.html
src/
  app.js
  data/laureates.json
  styles.css
assets/
  portraits/
  placeholders/
scripts/
  extract-laureates.js or extract-laureates.py
```

The app state consists of:

- Active decade
- Active laureate id
- Last interaction timestamp

All data loads locally from the bundled JSON file.

## Error Handling

- If a portrait is missing, show a stable initials avatar.
- If a quote is missing, hide the quote section.
- If a bio is missing, show theory/contribution only.
- If data loading fails, show a clear offline fallback message in Chinese.
- If a decade has no records due to data extraction error, show an empty state and keep other decades usable.

## Testing And Verification

Before delivery, verify:

- The page opens locally without network access.
- Decade switching updates the avatar matrix.
- Tapping a person updates the detail panel.
- Auto-advance works and pauses after touch.
- Missing portraits and missing quotes render cleanly.
- The layout has no overlapping text at the touch wall aspect ratio.
- The layout remains usable in a normal desktop browser.

Use browser screenshots or local visual inspection for the final page because the target is a public display.

## Open Decisions

- Final exact portrait-to-person mapping quality depends on the embedded Word document image order.
- Final copy editing for some biographies may need a human academic review before public display.
- The exact deployment path on the Windows display server is not specified yet.
