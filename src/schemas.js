let tables = {
  "AllCertificates": {
    url: "certificates/",
    resource: "Certificates",
    columns: [
      { id: "Guid", dataType: tableau.dataTypeEnum.string },
      { id: "Name", dataType: tableau.dataTypeEnum.string },
      { id: "DN", dataType: tableau.dataTypeEnum.string },
      { id: "ParentDn", dataType: tableau.dataTypeEnum.string },
      { id: "CreatedOn", dataType: tableau.dataTypeEnum.datetime },
    ]
  },
  "MasterAdmins": {
    url: "identity/browse",
    resource: "Identities",
    columns: [
      { id: "Prefix", dataType: tableau.dataTypeEnum.string },
      { id: "PrefixedName", dataType: tableau.dataTypeEnum.string },
      { id: "PrefixedUniversal", dataType: tableau.dataTypeEnum.string },
      { id: "Name", dataType: tableau.dataTypeEnum.string },
      { id: "FullName", dataType: tableau.dataTypeEnum.string },
      { id: "Universal", dataType: tableau.dataTypeEnum.string },
      { id: "IsGroup", dataType: tableau.dataTypeEnum.bool },
      { id: "IsContainer", dataType: tableau.dataTypeEnum.bool },
      { id: "Type", dataType: tableau.dataTypeEnum.int },
      { id: "Disabled", dataType: tableau.dataTypeEnum.bool },
    ],
    postBody: {
      Filter: "ApproverGroupTest",
      Limit: 1,
      IdentityType: 2
    }
  }
}

tables["RetiredCertificates"] = {
  ...tables["AllCertificates"],
  url: "certificates/?disabled=1"
}

tables["ActiveCertificates"] = {
  ...tables["AllCertificates"],
  url: "certificates/?disabled=0"
}

export { tables }

// We need to format our table definitions a bit differently for Tableau
export let schemas = Object.entries(tables).map(([id, value]) => {
  let alias = id.replace(/([a-z])([A-Z])/g, '$1 $2')
  let schema = { id, alias, ...value }
  delete schema.url
  delete schema.postBody
  return schema
})