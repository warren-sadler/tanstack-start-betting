export type DateRangeSearch = {
  from: string
  to: string
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function formatDateForInput(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!DATE_PATTERN.test(trimmed)) {
    return null
  }

  return trimmed
}

export function getDefaultDateRange(): DateRangeSearch {
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))

  return {
    from: formatDateForInput(start),
    to: formatDateForInput(end),
  }
}

export function normalizeDateRangeSearch(
  search: Record<string, unknown>,
): DateRangeSearch {
  const defaults = getDefaultDateRange()
  const from = parseInputDate(search.from) ?? defaults.from
  const to = parseInputDate(search.to) ?? defaults.to

  if (from <= to) {
    return { from, to }
  }

  return { from: to, to: from }
}

export function toOddsApiDateRange(range: DateRangeSearch): {
  commenceTimeFrom: string
  commenceTimeTo: string
} {
  return {
    commenceTimeFrom: `${range.from}T00:00:00Z`,
    commenceTimeTo: `${range.to}T23:59:59Z`,
  }
}
