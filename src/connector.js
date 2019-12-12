import axios from "axios"
import { tables, schemas } from "./schemas"
import { transformData, getAllPages } from "./data"
import { refreshAndSaveCredentialsIfNeeded } from "./auth"

let connector = tableau.makeConnector()

connector.getSchema = cb => cb(schemas)

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