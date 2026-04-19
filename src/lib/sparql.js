/**
 * sparql.js — SPARQL fetch wrapper for statistics.gov.scot
 *
 * statistics.gov.scot exposes data as RDF linked data, queried via SPARQL.
 * SPARQL is a query language for graph databases — think SQL but for data
 * where everything is connected by URIs rather than table/column names.
 *
 * The endpoint accepts a GET request with a `query` parameter containing
 * the SPARQL query string. We ask for results in JSON format via the
 * Accept header.
 *
 * Response shape:
 * {
 *   head: { vars: ["council", "value", ...] },
 *   results: {
 *     bindings: [
 *       { council: { type: "uri", value: "..." }, value: { type: "literal", value: "42.3" } },
 *       ...
 *     ]
 *   }
 * }
 */

const SPARQL_ENDPOINT = 'https://statistics.gov.scot/sparql.json'

/**
 * Send a SPARQL SELECT query to statistics.gov.scot and return the parsed JSON.
 *
 * @param {string} sparqlQuery - A valid SPARQL SELECT query string
 * @returns {Promise<Object>} - The raw SPARQL JSON response
 */
export async function querySparql(sparqlQuery) {
  const url = new URL(SPARQL_ENDPOINT)
  // The endpoint takes the query as a URL parameter
  url.searchParams.set('query', sparqlQuery)

  const res = await fetch(url.toString(), {
    headers: {
      // Tell the server we want SPARQL results as JSON (not XML)
      Accept: 'application/sparql-results+json',
    },
  })

  if (!res.ok) {
    throw new Error(`SPARQL request failed: HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Flatten SPARQL bindings into a plain array of objects.
 *
 * SPARQL results wrap every value in a type envelope:
 *   { council: { type: "uri", value: "..." }, value: { type: "literal", value: "42.3" } }
 *
 * This helper strips the envelope so you get:
 *   { council: "...", value: "42.3" }
 *
 * @param {Object} sparqlJson - The raw JSON from querySparql()
 * @returns {Array<Object>} - Plain array of result row objects
 */
export function flattenBindings(sparqlJson) {
  return sparqlJson.results.bindings.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, cell]) => [key, cell.value])
    )
  )
}
