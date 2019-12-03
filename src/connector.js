import axios from "axios"
import { tables, schemas } from "./schemas"
import transformData from "./transformData"
import { refreshAndSaveCredentialsIfNeeded } from "./auth"

let connector = tableau.makeConnector()

connector.getSchema = cb => cb(schemas)

connector.getData = async (tableauTable, doneCallback) => {
  let table = tables[tableauTable.tableInfo.id]
  let data

  // If the table definition has a postBody property
  if (table.hasOwnProperty('postBody')) {
    // Then we want to make a POST request
    ({ data } = await axios.post(table.url, table.postBody))
  }

  // Otherwise
  else {
    // We want to make a GET request
    ({ data } = await axios.get(table.url))
  }

  tableauTable.appendRows(transformData(data[table.resource]))

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