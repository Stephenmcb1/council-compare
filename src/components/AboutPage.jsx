export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-10 text-slate-700">

      {/* What this is */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">What is Council Compare?</h2>
        <p>
          Council Compare makes Scottish local council performance data accessible and understandable
          to ordinary members of the public. It pulls from open government datasets published by the
          Scottish Government at{' '}
          <a href="https://statistics.gov.scot" className="text-green-700 underline hover:text-green-900">
            statistics.gov.scot
          </a>
          , presents them visually, and provides the educational context needed to interpret
          comparisons honestly.
        </p>
        <p>
          It is as much an educational tool as a data tool. Every metric is shown with the context
          that explains it — deprivation levels, funding history, the constitutional constraints on
          what councils can and cannot control.
        </p>
      </section>

      {/* The problem */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">The problem this solves</h2>
        <p>
          Scottish council performance data exists. It is published openly. But it is:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Hard to find</li>
          <li>Presented as flat files or dense statistical tables</li>
          <li>Never compared across councils in a usable way</li>
          <li>Stripped of the context needed to interpret it fairly</li>
        </ul>
        <p>
          This app makes that data usable — with the context that stops comparisons from misleading.
        </p>
      </section>

      {/* Core principles */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900">Core principles</h2>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Honest, not sensational</h3>
            <p>
              League tables without context are misleading. A council in a deprived area spending
              more on social care and less on libraries is not a failing council — it is a council
              under different structural pressures. This app must show that.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Open data, open infrastructure</h3>
            <p>
              All data sources are public, open-licensed under the Open Government Licence, and free
              to access. No API keys are required for Phase 1 data.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Educational by design</h3>
            <p>
              Before drawing conclusions from any comparison, it helps to understand what councils
              actually control, how they are funded, and why deprivation is a more powerful
              explanatory variable than political control.
            </p>
          </div>
        </div>
      </section>

      {/* What councils control */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-900">What councils actually control</h2>
        <p>Understanding this is essential before interpreting any metric.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-red-700">
              Westminster (reserved)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>Benefits &amp; welfare</li>
              <li>Macroeconomic policy</li>
              <li>Corporation tax &amp; VAT</li>
              <li>Energy regulation</li>
              <li>Immigration</li>
              <li>Defence &amp; foreign policy</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Holyrood (devolved)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>NHS Scotland</li>
              <li>Education policy &amp; curriculum</li>
              <li>Justice &amp; policing</li>
              <li>Some social security</li>
              <li>Income tax rates</li>
              <li>How much goes to councils</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-green-700">
              Councils (delivery)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>Running schools day-to-day</li>
              <li>Delivering social care</li>
              <li>Roads &amp; pavements</li>
              <li>Waste collection</li>
              <li>Planning applications</li>
              <li>Libraries &amp; leisure</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
          <span className="font-semibold text-slate-900">The funding chain: </span>
          <span className="text-slate-600">
            Westminster sets UK spending → Barnett formula calculates Scotland's share → Holyrood
            receives block grant (~£50bn in 2025–26) → Holyrood allocates a portion to councils
            (~£14bn) → councils decide how to spend within that envelope plus council tax raised
            locally.
          </span>
        </div>

        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-xl p-4">
          When council performance looks poor, the first question is always: was this a council
          decision, a Holyrood decision, or a Westminster funding decision?
        </p>
      </section>

      {/* Why SNP dominates Holyrood but not councils */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          Why the SNP dominates Holyrood but not councils
        </h2>
        <p>
          This is one of the most common misunderstandings about Scottish politics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Holyrood — Additional Member System (AMS)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>73 constituency seats via first-past-the-post</li>
              <li>56 regional list seats proportionally</li>
              <li>SNP dominates FPTP constituencies</li>
              <li>Result: SNP largest party since 2007</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Councils — Single Transferable Vote (STV, since 2007)
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>Multi-member wards (3–4 councillors each)</li>
              <li>Ranked preference voting</li>
              <li>Highly proportional — coalitions almost always result</li>
              <li>After 2022: only 2 single-party councils in Scotland</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          This is not a contradiction. Two different electoral systems, designed to produce
          different outcomes, doing exactly what they were designed to do. Never attribute council
          outcomes purely to one party without checking the coalition composition and period of control.
        </p>
      </section>

      {/* UK spending context */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">UK spending context (2000–2026)</h2>
        <p className="text-sm text-slate-600">
          Essential background for any council performance data from 2010 onwards.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-slate-600 font-medium">Period</th>
                <th className="text-left py-2 pr-4 text-slate-600 font-medium">Government</th>
                <th className="text-left py-2 text-slate-600 font-medium">Council funding context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['2000–2010', 'New Labour', 'Real-terms growth. Sure Start, investment in services. Block grant rises.'],
                ['2010–2015', 'Coalition (Con/Lib Dem)', 'Central grants cut 40% in real terms. Deprived councils hit hardest. Block grant falls via Barnett.'],
                ['2015–2019', 'Conservative', 'Continued austerity. Social care demand rises, eating budgets.'],
                ['2019–2024', 'Conservative (Johnson/Sunak)', 'Partial recovery post-Covid. Still ~13.5% below 2010 in real terms.'],
                ['2024–present', 'Labour', 'Block grant increases. Social care still consumes ~65% of council budgets nationally.'],
              ].map(([period, govt, context]) => (
                <tr key={period}>
                  <td className="py-2 pr-4 text-slate-800 whitespace-nowrap">{period}</td>
                  <td className="py-2 pr-4 text-slate-600 whitespace-nowrap">{govt}</td>
                  <td className="py-2 text-slate-600">{context}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600">
          From 2010, councils were legally required to fund acute adult and children's social care
          (a statutory duty) while grant funding fell. Libraries, youth services, and community
          services were cut not by choice but because social care left nothing — libraries fell
          ~50% in real terms 2010–2025, youth services ~60%.
        </p>
        <p className="text-sm text-slate-600">
          Scotland's partial insulation: Holyrood made different choices about how to distribute
          the reduced envelope, but could not escape the overall downward pressure from Westminster
          spending decisions via the Barnett formula.
        </p>
      </section>

      {/* Data sources */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">Data sources</h2>
        <p className="text-sm text-slate-600">
          All data is publicly available under the{' '}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/"
            className="text-green-700 underline hover:text-green-900"
          >
            Open Government Licence
          </a>
          .
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-slate-900 mb-1">statistics.gov.scot — Phase 1 (live)</p>
            <p className="text-slate-600">
              Scottish Government linked data. Queried via SPARQL — a graph database query language
              where every data point is identified by a URI rather than a column name. No API key
              required. All metrics on the Compare page are drawn from this source.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">Care Inspectorate — Phase 2 (planned)</p>
            <p>Inspection grades for every registered care service in Scotland, by local authority.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">opendata.nhs.scot — Phase 3 (planned)</p>
            <p>Public Health Scotland open data. A&amp;E waiting times, GP access, mental health lists.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500">
            <p className="font-semibold text-slate-600 mb-1">Political context layer — Phase 4 (planned)</p>
            <p>TheyWorkForYou API, Scottish Parliament open data, councillor composition data.</p>
          </div>
        </div>
      </section>

      {/* The 32 councils */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-slate-900">The 32 Scottish councils</h2>
        <p className="text-sm text-slate-600">
          All data in this app is structured around these 32 unitary authorities.
        </p>
        <p className="text-sm text-slate-500 leading-relaxed">
          Aberdeen City · Aberdeenshire · Angus · Argyll and Bute · City of Edinburgh ·
          Clackmannanshire · Dumfries and Galloway · Dundee City · East Ayrshire ·
          East Dunbartonshire · East Lothian · East Renfrewshire · Falkirk · Fife ·
          Glasgow City · Highland · Inverclyde · Midlothian · Moray ·
          Na h-Eileanan Siar (Western Isles) · North Ayrshire · North Lanarkshire ·
          Orkney Islands · Perth and Kinross · Renfrewshire · Scottish Borders ·
          Shetland Islands · South Ayrshire · South Lanarkshire · Stirling ·
          West Dunbartonshire · West Lothian
        </p>
      </section>

    </main>
  )
}
