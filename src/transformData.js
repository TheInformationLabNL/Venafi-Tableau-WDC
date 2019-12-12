import format from 'date-fns/format'

export function transformDataRow(row) {
  for (let key in row) {
    if (!row.hasOwnProperty(key)) continue
    if (typeof row[key] !== 'string') continue
    if (row[key].match(/^\d{4}-\d\d-\d\d.\d\d:\d\d:\d\d/)) {
      row[key] = format(new Date(row[key]), 'yyyy-MM-dd HH:mm:ss')
    }
  }

  return row
}

export default function transformData(rows) {
  return rows.map(transformDataRow)
}