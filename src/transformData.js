export function transformDataRow(row) {
  for (let key in row) {
    if (!row.hasOwnProperty(key)) continue
    if (typeof row[key] !== 'string') continue
    if (row[key].match(/^\d{4}-\d\d-\d\d.\d\d:\d\d:\d\d/)) {
      row[key] = new Date(row[key])
    }
  }

  return row
}

export default function transformData(rows) {
  return rows.map(transformDataRow)
}