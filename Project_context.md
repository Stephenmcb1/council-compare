# Council Compare — project context

**What this is:** A React web app that makes Scottish local council performance data accessible and understandable to ordinary members of the public. It pulls from open government datasets, presents them visually, and provides the educational context needed to interpret comparisons honestly.

**Who built it:** Stephen Orry, East Kilbride, Scotland. Built as a learning project — each phase of the build is a deliberate step to understand a new technology, API pattern, or data type. The codebase should be readable and annotated accordingly.

**Status:** Phase 1 — scaffold and first data connection.

---

## The problem this solves

Scottish council performance data exists. It is published openly by the Scottish Government at [statistics.gov.scot](https://statistics.gov.scot), the Care Inspectorate, and Public Health Scotland. But it is:

- Hard to find
- Presented as flat files or dense statistical tables
- Never compared across councils in a usable way
- Stripped of the context needed to interpret it fairly

This app makes that data usable. It is as much an educational tool as a data tool. Every metric is shown with the context that explains it — deprivation levels, funding history, the constitutional constraints on what councils can and cannot control.

---

## Core principles

**Honest, not sensational.** League tables without context are misleading. A council in a deprived area spending more on social care and less on libraries is not a failing council — it is a council under different structural pressures. The app must show this.

**Open data, open infrastructure.** All data sources are public, open-licensed (Open Government Licence), and free to access. No APIs require keys in Phase 1. The app itself will be open source.

**Educational by design.** Before showing any comparison data, the app explains:
- What councils actually control vs what Holyrood controls vs what Westminster controls
- How councils are funded (block grant via Barnett formula → Scottish Government → councils)
- Why most Scottish councils are coalitions (STV voting system since 2007)
- Why deprivation is a more powerful explanatory variable than political control

**Build to learn.** Each phase introduces one new concept. Code is commented. Decisions are documented here.

---

## What councils actually control

Understanding this is essential context before interpreting any metric.

**Westminster controls (reserved — councils have zero influence):**
- Benefits (Universal Credit, state pension, housing benefit, child benefit)
- Macroeconomic policy, corporation tax, VAT, interest rates
- Immigration and borders
- Defence and foreign policy
- Energy regulation (grid, North Sea licensing)
- Broadcasting and telecoms

**Holyrood controls (devolved — Scottish Parliament decides):**
- NHS Scotland — health, mental health, dentistry, social care policy
- Education policy — curriculum, tuition fees, school standards
- Justice and policing (Police Scotland)
- Some social security (Scottish Child Payment, disability benefits)
- Income tax rates and bands (collected by HMRC, set by Holyrood)
- Housing and transport policy
- How much of the block grant goes to councils

**Councils control (delivery, not policy):**
- Running schools day-to-day (not curriculum — that is Holyrood)
- Delivering social care (not the policy framework — that is Holyrood)
- Roads and pavements (not trunk roads — those are Transport Scotland)
- Waste collection
- Planning applications
- Libraries and leisure facilities
- Housing allocation and local housing policy
- Environmental health, trading standards, licensing

**The funding chain:**
Westminster sets UK spending → Barnett formula calculates Scotland's share → Holyrood receives block grant (~£50bn in 2025–26) → Holyrood allocates portion to councils (~£14bn) → councils decide how to spend within that envelope + council tax they raise locally.

**Key implication for this app:** When council performance looks poor, the first question is always: was this a council decision, a Holyrood decision, or a Westminster funding decision? The app should make this visible.

---

## Why the SNP dominates Holyrood but not councils

This is one of the most common misunderstandings about Scottish politics, and the app should explain it clearly.

**Holyrood uses Additional Member System (AMS):**
- 73 constituency seats elected by first-past-the-post
- 56 regional list seats elected proportionally
- SNP dominates FPTP constituencies across rural and semi-urban Scotland
- Result: SNP has been the largest party since 2007, governing as minority or with Green support

**Councils use Single Transferable Vote (STV) since 2007:**
- Multi-member wards (3–4 councillors each)
- Ranked preference voting — votes transfer between candidates
- Highly proportional — near-impossible for one party to sweep a council
- Result: almost every council is a coalition or minority administration
- After 2022: only West Dunbartonshire (Labour majority) and Dundee (SNP majority) had single-party control

**This is not a contradiction.** Two different electoral systems, designed to produce different outcomes, doing exactly what they were designed to do.

**App implication:** Never attribute council outcomes purely to "the SNP" or "Labour" without showing the coalition composition and the period of control. A council where SNP leads a coalition with Lib Dems since 2012 is not the same as an SNP-majority council.

---

## UK spending context (2000–2026)

This timeline is essential background for any council performance data from 2010 onwards.

| Period | Westminster government | Council funding context |
|--------|----------------------|------------------------|
| 2000–2010 | New Labour | Real-terms growth. Sure Start, investment in services. Block grant rises. |
| 2010–2015 | Coalition (Con/Lib Dem) | Central grants cut 40% in real terms. Deprived councils hit hardest. Block grant falls via Barnett. |
| 2015–2019 | Conservative | Continued austerity. Social care demand rises, eating budgets. |
| 2019–2024 | Conservative (Johnson/Sunak) | Partial recovery post-Covid. Still ~13.5% below 2010 in real terms. |
| 2024–present | Labour | Block grant increases. Social care still consumes ~65% of council budgets nationally. |

**The structural squeeze:** From 2010, councils were legally required to fund acute adult and children's social care (statutory duty) while grant funding fell. Libraries, youth services, and community services were cut not by choice but because social care left nothing. Libraries fell ~50% in real terms 2010–2025. Youth services fell ~60%.

**Scotland's partial insulation:** Holyrood made different choices about how to distribute the reduced envelope — including a council tax freeze in 2023–24 — but could not escape the overall downward pressure from Westminster spending decisions via the Barnett formula.

---

## Data sources

All data is publicly available under the Open Government Licence unless noted.

### Phase 1 — statistics.gov.scot

**Base URL:** `https://statistics.gov.scot`
**API type:** SPARQL (RDF linked data) — different from REST/JSON APIs
**Documentation:** `https://guides.statistics.gov.scot/category/37-api`
**No API key required**

Key datasets available (all filterable by local authority):
- Education attainment (literacy, numeracy, attainment gap by school)
- Pupil:teacher ratios
- School exclusions and attendance
- Social care spending per head (Local Financial Returns)
- Social care waiting times and eligibility
- Council tax rates by band and authority
- Scottish Local Government Finance Statistics (SLGFS) — per capita spend by service
- Scottish Index of Multiple Deprivation (SIMD) — deprivation scores by area

**SPARQL basics for this project:**
```sparql
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?council ?value WHERE {
  ?obs a qb:Observation ;
       <dataset-specific-dimension> ?council ;
       <dataset-specific-measure> ?value .
}
```
Each dataset has its own dimension and measure URIs — check the dataset page on statistics.gov.scot before writing queries.

**Fetch wrapper pattern for React:**
```js
const SPARQL_ENDPOINT = 'https://statistics.gov.scot/sparql.json'

async function querySparql(sparqlQuery) {
  const url = new URL(SPARQL_ENDPOINT)
  url.searchParams.set('query', sparqlQuery)
  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/sparql-results+json' }
  })
  if (!res.ok) throw new Error(`SPARQL error: ${res.status}`)
  return res.json()
}
```

### Phase 2 (planned) — Care Inspectorate

**URL:** `https://www.careinspectorate.com/index.php/statistics-and-analysis`
Published inspection grades for every registered care service in Scotland. Mappable by local authority area. CSV download — no SPARQL needed.

### Phase 3 (planned) — opendata.nhs.scot

**URL:** `https://www.opendata.nhs.scot`
Public Health Scotland open data. REST API with JSON. Covers A&E waiting times, GP access, mental health waiting lists — all by health board (which maps to council areas).

### Phase 4 (planned) — Political context layer

**TheyWorkForYou API:** MSP voting records, speeches, parliamentary activity. Requires free API key.
**Scottish Parliament open data:** `https://data.parliament.scot` — bills, motions, member data.
**opencouncildata.co.uk** — councillor names, parties, wards across all 32 councils.

---

## The 32 Scottish councils

All data in this app is structured around these 32 unitary authorities. They are the unit of comparison.

Aberdeen City · Aberdeenshire · Angus · Argyll and Bute · City of Edinburgh · Clackmannanshire · Dumfries and Galloway · Dundee City · East Ayrshire · East Dunbartonshire · East Lothian · East Renfrewshire · Falkirk · Fife · Glasgow City · Highland · Inverclyde · Midlothian · Moray · Na h-Eileanan Siar (Western Isles) · North Ayrshire · North Lanarkshire · Orkney Islands · Perth and Kinross · Renfrewshire · Scottish Borders · Shetland Islands · South Ayrshire · South Lanarkshire · Stirling · West Dunbartonshire · West Lothian

---

## Phase 1 — what we are building first

**Goal:** A working React app that fetches real data from statistics.gov.scot and displays a simple comparison between any two councils.

**Stack:**
- React (Vite scaffold)
- No framework (plain CSS or TailwindCSS — decide before starting)
- Chart.js for visualisation (already familiar from other projects)
- fetch() for API calls — no library needed at this stage

**Phase 1 components:**

```
src/
  components/
    CouncilSelector.jsx     — dropdown to pick council A and council B
    MetricCard.jsx          — single metric with value, label, context note
    RadarChart.jsx          — Chart.js radar showing council A vs B across metrics
    DeprivationNote.jsx     — always-visible SIMD context strip
  lib/
    sparql.js               — SPARQL fetch wrapper and query builder
    councils.js             — list of 32 councils with slugs and metadata
    metrics.js              — metric definitions: label, SPARQL query, unit, caveat text
  App.jsx
  main.jsx
```

**Phase 1 metrics (start small — 4 metrics only):**

1. Education attainment — % achieving expected level (literacy), by council
2. Council tax Band D rate — simple, clean, directly comparable
3. Social care spend per head — from Local Financial Returns
4. SIMD — % of population in most deprived 20% of Scotland

**Phase 1 does NOT include:**
- Political history layer (Phase 2)
- Care home inspection grades (Phase 2)
- Health data (Phase 3)
- Historical timeline (Phase 3)
- UK spending overlay (Phase 3)

---

## Learning goals by phase

**Phase 1 — SPARQL and linked data**
- Understand RDF / linked data concepts
- Write basic SPARQL SELECT queries
- Fetch and parse SPARQL JSON results in React
- Display data in Chart.js radar chart
- Understand why linked data uses URIs not column names

**Phase 2 — multiple data source types**
- Fetch and parse CSV (Care Inspectorate)
- Handle data that uses different geographic identifiers
- Join datasets that don't share a common key

**Phase 3 — REST APIs and time series**
- Fetch from opendata.nhs.scot REST API
- Handle paginated responses
- Display time series data (spending over time)
- Introduce react-query or SWR for caching

**Phase 4 — political context layer**
- TheyWorkForYou API (requires key — first authenticated API)
- Understand rate limiting
- Handle data that is narrative/categorical rather than numeric

---

## Important caveats to build into the UI

These must appear in the app, not just in this document.

1. **Deprivation context is mandatory.** Every metric comparison must show the SIMD deprivation score for both councils alongside the metric. A high-deprivation council spending more on social care and less on libraries is not failing.

2. **Coalition composition, not just largest party.** When showing political control, always show the full coalition and whether it is majority/minority.

3. **STV since 2007 only.** Pre-2007 council elections used a different system. Political attribution pre-2007 is cleaner (single-party councils were common). Post-2007 it is almost always coalition.

4. **Correlation is not causation.** Spending level → outcomes is not a straight line. Geography, population age, rurality, and historical industrial base all affect outcomes independently of political decisions.

5. **Data currency.** statistics.gov.scot datasets are updated annually but with a lag. Always show the data year alongside the value.

6. **Scotland vs England distinction.** UK-level spending data (from HM Treasury PESA) covers England primarily. Scottish councils are funded through Holyrood via Barnett — the cut-through is not 1:1 with English councils. Be explicit about this when showing UK-level spending context.

---

## File structure (Phase 1 target)

```
council-compare/
  context.md              ← this file
  README.md               ← brief public readme
  package.json
  vite.config.js
  index.html
  src/
    App.jsx
    main.jsx
    components/
      CouncilSelector.jsx
      MetricCard.jsx
      RadarChart.jsx
      DeprivationNote.jsx
    lib/
      sparql.js
      councils.js
      metrics.js
    styles/
      global.css
  public/
```

---

## How to use this file

**When starting a new chat with an LLM about this project:**
Paste or attach this file at the start of the conversation. Say: "I am building the Council Compare app. Here is the project context. I want to work on [specific component/problem]."

**When asking for code:**
Reference the phase, the component name, and the learning goal. Example: "Help me build `sparql.js` — I want to understand how SPARQL queries work, so explain what each part of the query does as we go."

**When the app grows:**
Update this file. Add a Phase 2 section when Phase 1 is done. Keep the caveats section current — it is the most important part of this document.

**When bringing in a new developer:**
This file is the briefing. The README.md is the quick-start. This document is the why.

---

*Last updated: April 2026 — Stephen Orry*
*Related documents: digital_sovereignty_and_glow.md (background reading on Scottish digital infrastructure)*