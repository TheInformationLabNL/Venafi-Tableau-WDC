export default [
  {
    id: "Certificates",
    columns: [
      { id: "Guid", dataType: tableau.dataTypeEnum.string },
      { id: "Name", dataType: tableau.dataTypeEnum.string },
      { id: "DN", dataType: tableau.dataTypeEnum.string },
      { id: "ParentDn", dataType: tableau.dataTypeEnum.string },
      { id: "CreatedOn", dataType: tableau.dataTypeEnum.datetime },
    ]
  },
]