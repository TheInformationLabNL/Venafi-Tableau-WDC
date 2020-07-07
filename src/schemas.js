/*global tableau,luxon*/

function transformArrayToString(input) {
    if (Array.isArray(input)) {
        return input.join(", ");
    } else {
        return input;
    }
}

function transformIsoDateTime(input) {
    if (!input) return null;
    const inputDateTime = luxon.DateTime.fromISO(input);
    return inputDateTime.toFormat("yyyy-LL-dd HH:mm:ss");
}

function transformNameValues(input, name) {
    let rt = null;
    input.forEach((nv) => {
        if (nv.Name && nv.Name == name) {
            rt = transformArrayToString(nv.Values);
        }
    });
    return rt;
}

let tables = {
    AllCertificates: {
        columns: [
            {
                id: "CreatedOn",
                source: "CreatedOn",
                dataType: tableau.dataTypeEnum.datetime,
            },
            {
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Guid",
                source: "Guid",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "ParentDn",
                source: "ParentDn",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "SchemaClass",
                source: "SchemaClass",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "X509_CN",
                source: "X509.CN",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "X509_SANS_DNS",
                source: "X509.SANS.DNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "X509_Serial",
                source: "X509.Serial",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "X509_Thumbprint",
                source: "X509.Thumbprint",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "X509_ValidFrom",
                source: "X509.ValidFrom",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "X509_ValidTo",
                source: "X509.ValidTo",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "Approver",
                source: "Approver",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "CertificateDetails_CN",
                source: "CertificateDetails.CN",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_EnhancedKeyUsage",
                source: "CertificateDetails.EnhancedKeyUsage",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_Issuer",
                source: "CertificateDetails.Issuer",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_KeyAlgorithm",
                source: "CertificateDetails.KeyAlgorithm",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_KeySize",
                source: "CertificateDetails.KeySize",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "CertificateDetails_ValidTo",
                source: "CertificateDetails.ValidTo",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "CertificateDetails_KeyUsage",
                source: "CertificateDetails.KeyUsage",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_OU",
                source: "CertificateDetails.OU",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "CertificateDetails_PublicKeyHash",
                source: "CertificateDetails.PublicKeyHash",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_Serial",
                source: "CertificateDetails.Serial",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_SignatureAlgorithm",
                source: "CertificateDetails.SignatureAlgorithm",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_SignatureAlgorithmOID",
                source: "CertificateDetails.SignatureAlgorithmOID",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_SKIKeyIdentifier",
                source: "CertificateDetails.SKIKeyIdentifier",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_StoreAdded",
                source: "CertificateDetails.StoreAdded",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "CertificateDetails_RevocationStatus",
                source: "CertificateDetails.RevocationStatus",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_RevocationDate",
                source: "CertificateDetails.RevocationDate",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "CertificateDetails_Subject",
                source: "CertificateDetails.Subject",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_SubjectAltNameDNS",
                source: "CertificateDetails.SubjectAltNameDNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "CertificateDetails_Thumbprint",
                source: "CertificateDetails.Thumbprint",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CertificateDetails_ValidFrom",
                source: "CertificateDetails.ValidFrom",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "Contact",
                source: "Contact",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "ManagementType",
                source: "ManagementType",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "RenewalDetails_OrganizationalUnit",
                source: "RenewalDetails.OrganizationalUnit",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "RenewalDetails_Subject",
                source: "RenewalDetails.Subject",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "RenewalDetails_SubjectAltNameDNS",
                source: "RenewalDetails.SubjectAltNameDNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString,
            },
            {
                id: "ValidationDetails_LastValidationStateUpdate",
                source: "ValidationDetails.LastValidationStateUpdate",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "ValidationDetails_ValidationState",
                source: "ValidationDetails.ValidationState",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Origin",
                source: "Origin",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Disabled",
                source: "disabled",
                dataType: tableau.dataTypeEnum.bool,
            },
        ],
    },
    AllDevices: {
        columns: [
            {
                id: "AbsoluteGUID",
                source: "AbsoluteGUID",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "GUID",
                source: "GUID",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Parent",
                source: "Parent",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "Revision",
                source: "Revision",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "TypeName",
                source: "TypeName",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Description",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Description"),
            },
            {
                id: "Host",
                dataType: tableau.dataTypeEnum.string,
                source: "NameValues",
                transform: (inputValue) => transformNameValues(inputValue, "Host"),
            },
            {
                id: "RemoteServerType",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Remote Server Type"),
            },
        ],
    },
    AllApplications: {
        columns: [
            {
                id: "AbsoluteGUID",
                source: "AbsoluteGUID",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "GUID",
                source: "GUID",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Parent",
                source: "Parent",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "Revision",
                source: "Revision",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "TypeName",
                source: "TypeName",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Certificate",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Certificate"),
            },
            {
                id: "CertificateInstalled",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Certificate Installed"),
            },
            {
                id: "CertificateName",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Certificate Name"),
            },
            {
                id: "Credential",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Credential"),
            },
            {
                id: "DriverName",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Driver Name"),
            },
            {
                id: "FileValidationError",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "File Validation Error"),
            },
            {
                id: "FileValidationResult",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "File Validation Result"),
            },
            {
                id: "GroupingId",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Grouping Id"),
            },
            {
                id: "InstallationStatus",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Installation Status"),
            },
            {
                id: "LastPushedOn",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Last Pushed On"),
            },
            {
                id: "LastValidation",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Last Validation"),
            },
            {
                id: "LastValidationResult",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Last Validation Result"),
            },
            {
                id: "LogDebug",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Log Debug"),
            },
            {
                id: "Password1",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "CertifPassword 1icate"),
            },
            {
                id: "TextField1",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Text Field 1"),
            },
            {
                id: "TextField2",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Text Field 2"),
            },
            {
                id: "TextField3",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Text Field 3"),
            },
            {
                id: "TextField4",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Text Field 4"),
            },
            {
                id: "TextField5",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Text Field 5"),
            },
            {
                id: "Description",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: (inputValue) => transformNameValues(inputValue, "Description"),
            },
        ],
    },
    LicenseCounts: {
        columns: [
            {
                id: "CreationDateTime",
                source: "CreationDateTime",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "TrustAuthorityTLSCertificates",
                source: "TrustAuthorityTLSCertificates",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "TrustForceTLSCertificates",
                source: "TrustForceTLSCertificates",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "TrustAuthoritySSHDevices",
                source: "TrustAuthoritySSHDevices",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "TrustForceSSHDevices",
                source: "TrustForceSSHDevices",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "EnterpriseMobilityProtectCertificates",
                source: "EnterpriseMobilityProtectCertificates",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "TrustAuthorityClientDeviceCertificates",
                source: "TrustAuthorityClientDeviceCertificates",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "EnvironmentType",
                source: "EnvironmentType",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CompanyName",
                source: "CompanyName",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "EngineVersion",
                source: "EngineVersion",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "ActiveFeatures",
                source: "ActiveFeatures",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "UsageStatistics",
                source: "UsageStatistics",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "VenafiAdvancedKeyProtect",
                source: "VenafiAdvancedKeyProtect",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "CodeSigningStatus",
                source: "CodeSigningStatus",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "EnterpriseMobilityProtectVisibilityOnly",
                source: "EnterpriseMobilityProtectVisibilityOnly",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "GenerationTimespan",
                source: "GenerationTimespan",
                dataType: tableau.dataTypeEnum.string,
            },
        ],
    },
    LogEvents: {
        columns: [
            {
                id: "ClientTimestamp",
                source: "ClientTimestamp",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "Component",
                source: "Component",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "ComponentId",
                source: "ComponentId",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "ComponentSubsystem",
                source: "ComponentSubsystem",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Data",
                source: "Data",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Grouping",
                source: "Grouping",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "ServerTimestamp",
                source: "ServerTimestamp",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime,
            },
            {
                id: "Severity",
                source: "Severity",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "SourceIP",
                source: "SourceIP",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Text1",
                source: "Text1",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Text2",
                source: "Text2",
                dataType: tableau.dataTypeEnum.string,
            },
            {
                id: "Value1",
                source: "Value1",
                dataType: tableau.dataTypeEnum.int,
            },
            {
                id: "Value2",
                source: "Value2",
                dataType: tableau.dataTypeEnum.int,
            },
        ],
    },
};

export { tables };
