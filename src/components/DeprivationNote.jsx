export default function DeprivationNote() {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
        Deprivation context — read before comparing
      </p>

      <p className="text-xs text-amber-900 leading-relaxed">
        The Scottish Index of Multiple Deprivation (SIMD) is the most important variable for
        interpreting any council comparison. It measures structural disadvantage across income,
        employment, health, education, housing, crime, and access to services. A council in a
        high-deprivation area faces different pressures — more demand for social care, lower tax
        collection, worse health outcomes — regardless of political control or management quality.
        The{' '}
        <span className="text-amber-800 font-medium">Healthy Life Expectancy</span> metric below
        is the closest available proxy: the gap between the wealthiest and most deprived Scottish
        councils exceeds 10 years.
      </p>
    </div>
  )
}
