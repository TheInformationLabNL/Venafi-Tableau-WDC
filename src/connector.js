import axios from "axios"
import schemas from "./schemas"
import transformData from "./transformData"
import { refreshAndSaveCredentialsIfNeeded } from "./auth"

let connector = tableau.makeConnector()

connector.getSchema = cb => cb(schemas)

connector.getData = async (table, doneCallback) => {
  let resource = table.tableInfo.id.replace("_", "/")
  let { data } = await axios.get(resource.toLowerCase() + "/")

  table.appendRows(transformData(data[resource]))

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