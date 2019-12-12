import axios from "axios"
import format from "date-fns/format"

export function transformDataRow(row) {
  for (let key in row) {
    if (!row.hasOwnProperty(key)) continue
    if (typeof row[key] !== "string") continue
    if (row[key].match(/^\d{4}-\d\d-\d\d.\d\d:\d\d:\d\d/)) {
      row[key] = format(new Date(row[key]), "yyyy-MM-dd HH:mm:ss")
    }
  }

  return row
}

export function transformData(rows) {
  return rows.map(transformDataRow)
}

export async function getAllPages(uri, resource, postBody) {
  let results = []

  while (uri) {
    let data

    if (postBody) {
      ({data} = await axios.post(uri, postBody))
    } else {
      ({data} = await axios.get(uri))
    }

    results = results.concat(data[resource])

    if (data._links && data._links.length && data._links[0].Next) {
      uri = data._links[0].Next.replace(/^\/vedsdk/, "")
    } else {
      uri = false
    }
  }

  return results
}