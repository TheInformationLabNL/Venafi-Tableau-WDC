import axios from "axios"
import { tables, schemas } from "./schemas"
import transformData from "./transformData"
import { refreshAndSaveCredentialsIfNeeded } from "./auth"

let connector = tableau.makeConnector()

connector.getSchema = cb => cb(schemas)

async function getAllPages(uri, resource, postBody) {
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
      uri = data._links[0].Next.replace(/^\/vedsdk/, '')
    } else {
      uri = false
    }
  }

  return results
}

connector.getData = async (tableauTable, doneCallback) => {
  let table = tables[tableauTable.tableInfo.id]

  let data = await getAllPages(table.url, table.resource, table.postBody)

  tableauTable.appendRows(transformData(data))

  doneCallback()
}

connector.init = async (cb) => {
  tableau.authType = tableau.authTypeEnum.custom

  axios.defaults.baseURL = tableau.connectionData || axios.defaults.baseURL

  if (tableau.phase === tableau.phaseEnum.gatherDataPhase) {
    await refreshAndSaveCredentialsIfNeeded()
  }

  cb()
}

tableau.registerConnector(connector)