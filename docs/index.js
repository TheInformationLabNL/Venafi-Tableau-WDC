(function () {
    function getApiKey(url, username, password) {
        return new Promise(function ($return, $error) {
            var response;
            tableau.log("getApiKey: Logging in and getting apikey");
            return axios.post((url + "/authorize/"), {
                Username: username,
                Password: password
            }).then(function ($await_2) {
                try {
                    response = $await_2;
                    if (response.status === 200) {
                        return $return(response.data.APIKey);
                    }
                    return $error({
                        response: response,
                        message: "Invalid status code " + response.status
                    });
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            }, $error);
        });
    }

    function minutesApiKeyValid(url, apiKey) {
        return new Promise(function ($return, $error) {
            var $Try_1_Catch = function (_err) {
                try {
                    console.error(_err);
                    return $return(-1);
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var response;
                tableau.log("minutesApiKeyValid: Seeing if the apiKey is still valid");
                return axios.get((url + "/authorize/checkvalid"), {
                    headers: {
                        "X-Venafi-API-Key": apiKey
                    }
                }).then(function ($await_3) {
                    try {
                        response = $await_3;
                        if (response.status === 200) {
                            var timestamp = parseInt(response.data.ValidUntil.match(/\/Date\((.*)\)\//)[1]);
                            var validUntil = luxon.DateTime.fromMillis(timestamp);
                            var dateDiff = Math.floor(validUntil.diffNow("minutes").minutes);
                            return $return(dateDiff);
                        }
                        return $return(-1);
                    } catch ($boundEx) {
                        return $Try_1_Catch($boundEx);
                    }
                }, $Try_1_Catch);
            } catch (_err) {
                $Try_1_Catch(_err);
            }
        });
    }

    function transformArrayToString(input) {
        if (Array.isArray(input)) {
            return input.join(", ");
        } else {
            return input;
        }
    }

    function transformIsoDateTime(input) {
        if (!input) 
            { return null; }
        var inputDateTime = luxon.DateTime.fromISO(input);
        return inputDateTime.toFormat("yyyy-LL-dd HH:mm:ss");
    }

    function transformNameValues(input, name) {
        var rt = null;
        input.forEach(function (nv) {
            if (nv.Name && nv.Name == name) {
                rt = transformArrayToString(nv.Values);
            }
        });
        return rt;
    }

    var tables = {
        AllCertificates: {
            columns: [{
                id: "CreatedOn",
                source: "CreatedOn",
                dataType: tableau.dataTypeEnum.datetime
            },{
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Guid",
                source: "Guid",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "ParentDn",
                source: "ParentDn",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "SchemaClass",
                source: "SchemaClass",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "X509_CN",
                source: "X509.CN",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "X509_SANS_DNS",
                source: "X509.SANS.DNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "X509_Serial",
                source: "X509.Serial",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "X509_Thumbprint",
                source: "X509.Thumbprint",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "X509_ValidFrom",
                source: "X509.ValidFrom",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "X509_ValidTo",
                source: "X509.ValidTo",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "Approver",
                source: "Approver",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "CertificateDetails_CN",
                source: "CertificateDetails.CN",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_EnhancedKeyUsage",
                source: "CertificateDetails.EnhancedKeyUsage",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_Issuer",
                source: "CertificateDetails.Issuer",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_KeyAlgorithm",
                source: "CertificateDetails.KeyAlgorithm",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_KeySize",
                source: "CertificateDetails.KeySize",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "CertificateDetails_ValidTo",
                source: "CertificateDetails.ValidTo",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "CertificateDetails_KeyUsage",
                source: "CertificateDetails.KeyUsage",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_OU",
                source: "CertificateDetails.OU",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "CertificateDetails_PublicKeyHash",
                source: "CertificateDetails.PublicKeyHash",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_Serial",
                source: "CertificateDetails.Serial",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_SignatureAlgorithm",
                source: "CertificateDetails.SignatureAlgorithm",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_SignatureAlgorithmOID",
                source: "CertificateDetails.SignatureAlgorithmOID",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_SKIKeyIdentifier",
                source: "CertificateDetails.SKIKeyIdentifier",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_StoreAdded",
                source: "CertificateDetails.StoreAdded",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "CertificateDetails_RevocationStatus",
                source: "CertificateDetails.RevocationStatus",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_RevocationDate",
                source: "CertificateDetails.RevocationDate",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "CertificateDetails_Subject",
                source: "CertificateDetails.Subject",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_SubjectAltNameDNS",
                source: "CertificateDetails.SubjectAltNameDNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "CertificateDetails_Thumbprint",
                source: "CertificateDetails.Thumbprint",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CertificateDetails_ValidFrom",
                source: "CertificateDetails.ValidFrom",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "Contact",
                source: "Contact",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "ManagementType",
                source: "ManagementType",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "RenewalDetails_OrganizationalUnit",
                source: "RenewalDetails.OrganizationalUnit",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "RenewalDetails_Subject",
                source: "RenewalDetails.Subject",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "RenewalDetails_SubjectAltNameDNS",
                source: "RenewalDetails.SubjectAltNameDNS",
                dataType: tableau.dataTypeEnum.string,
                transform: transformArrayToString
            },{
                id: "ValidationDetails_LastValidationStateUpdate",
                source: "ValidationDetails.LastValidationStateUpdate",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "ValidationDetails_ValidationState",
                source: "ValidationDetails.ValidationState",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Origin",
                source: "Origin",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Disabled",
                source: "disabled",
                dataType: tableau.dataTypeEnum.bool
            }]
        },
        AllDevices: {
            columns: [{
                id: "AbsoluteGUID",
                source: "AbsoluteGUID",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "GUID",
                source: "GUID",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Parent",
                source: "Parent",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "Revision",
                source: "Revision",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "TypeName",
                source: "TypeName",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Description",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Description"); }
            },{
                id: "Host",
                dataType: tableau.dataTypeEnum.string,
                source: "NameValues",
                transform: function (inputValue) { return transformNameValues(inputValue, "Host"); }
            },{
                id: "RemoteServerType",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Remote Server Type"); }
            }]
        },
        AllApplications: {
            columns: [{
                id: "AbsoluteGUID",
                source: "AbsoluteGUID",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "DN",
                source: "DN",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "GUID",
                source: "GUID",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Parent",
                source: "Parent",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "Revision",
                source: "Revision",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "TypeName",
                source: "TypeName",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Certificate",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Certificate"); }
            },{
                id: "CertificateInstalled",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Certificate Installed"); }
            },{
                id: "CertificateName",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Certificate Name"); }
            },{
                id: "Credential",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Credential"); }
            },{
                id: "DriverName",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Driver Name"); }
            },{
                id: "FileValidationError",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "File Validation Error"); }
            },{
                id: "FileValidationResult",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "File Validation Result"); }
            },{
                id: "GroupingId",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Grouping Id"); }
            },{
                id: "InstallationStatus",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Installation Status"); }
            },{
                id: "LastPushedOn",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Last Pushed On"); }
            },{
                id: "LastValidation",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Last Validation"); }
            },{
                id: "LastValidationResult",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Last Validation Result"); }
            },{
                id: "LogDebug",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Log Debug"); }
            },{
                id: "Password1",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "CertifPassword 1icate"); }
            },{
                id: "TextField1",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Text Field 1"); }
            },{
                id: "TextField2",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Text Field 2"); }
            },{
                id: "TextField3",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Text Field 3"); }
            },{
                id: "TextField4",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Text Field 4"); }
            },{
                id: "TextField5",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Text Field 5"); }
            },{
                id: "Description",
                source: "NameValues",
                dataType: tableau.dataTypeEnum.string,
                transform: function (inputValue) { return transformNameValues(inputValue, "Description"); }
            }]
        },
        LicenseCounts: {
            columns: [{
                id: "CreationDateTime",
                source: "CreationDateTime",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "TrustAuthorityTLSCertificates",
                source: "TrustAuthorityTLSCertificates",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "TrustForceTLSCertificates",
                source: "TrustForceTLSCertificates",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "TrustAuthoritySSHDevices",
                source: "TrustAuthoritySSHDevices",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "TrustForceSSHDevices",
                source: "TrustForceSSHDevices",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "EnterpriseMobilityProtectCertificates",
                source: "EnterpriseMobilityProtectCertificates",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "TrustAuthorityClientDeviceCertificates",
                source: "TrustAuthorityClientDeviceCertificates",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "EnvironmentType",
                source: "EnvironmentType",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CompanyName",
                source: "CompanyName",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "EngineVersion",
                source: "EngineVersion",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "ActiveFeatures",
                source: "ActiveFeatures",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "UsageStatistics",
                source: "UsageStatistics",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "VenafiAdvancedKeyProtect",
                source: "VenafiAdvancedKeyProtect",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "CodeSigningStatus",
                source: "CodeSigningStatus",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "EnterpriseMobilityProtectVisibilityOnly",
                source: "EnterpriseMobilityProtectVisibilityOnly",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "GenerationTimespan",
                source: "GenerationTimespan",
                dataType: tableau.dataTypeEnum.string
            }]
        },
        LogEvents: {
            columns: [{
                id: "ClientTimestamp",
                source: "ClientTimestamp",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "Component",
                source: "Component",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "ComponentId",
                source: "ComponentId",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "ComponentSubsystem",
                source: "ComponentSubsystem",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Data",
                source: "Data",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Grouping",
                source: "Grouping",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "Id",
                source: "Id",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "Name",
                source: "Name",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "ServerTimestamp",
                source: "ServerTimestamp",
                dataType: tableau.dataTypeEnum.datetime,
                transform: transformIsoDateTime
            },{
                id: "Severity",
                source: "Severity",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "SourceIP",
                source: "SourceIP",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Text1",
                source: "Text1",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Text2",
                source: "Text2",
                dataType: tableau.dataTypeEnum.string
            },{
                id: "Value1",
                source: "Value1",
                dataType: tableau.dataTypeEnum.int
            },{
                id: "Value2",
                source: "Value2",
                dataType: tableau.dataTypeEnum.int
            }]
        }
    };

    var getNestedObject = function (obj, dotSeparatedKeys) {
        if (dotSeparatedKeys !== undefined && typeof dotSeparatedKeys !== "string") 
            { return undefined; }
        if (typeof obj !== "undefined" && typeof dotSeparatedKeys === "string") {
            var splitRegex = /[.\[\]'"]/g;
            var pathArr = dotSeparatedKeys.split(splitRegex).filter(function (k) { return k !== ""; });
            obj = pathArr.reduce(function (o, key) { return o && o[key] !== "undefined" ? o[key] : undefined; }, obj);
        }
        return obj;
    };
    var buildSchema = function (schemaObject) {
        if (Object.prototype.toString.call(schemaObject) === "[object Array]") {
            schemaObject.forEach(function (subObj) { return buildSchema(subObj); });
        } else if (Object.prototype.toString.call(schemaObject) === "[object Object]") {
            Object.keys(schemaObject).forEach(function (subObj) { return buildSchema(schemaObject[subObj]); });
        } else {
            return typeof schemaObject;
        }
        return schemaObject;
    };
    var getSchemaMatch = function (obj, objFromSchema) {
        var result = false;
        if (Object.prototype.toString.call(obj) === "[object Array]") {
            if (objFromSchema.length) {
                for (var i = 0;i < obj.length; i += 1) {
                    if (!getSchemaMatch(obj[i], objFromSchema[i])) {
                        result = false;
                        break;
                    }
                    result = true;
                }
            } else {
                return true;
            }
        } else if (Object.prototype.toString.call(obj) === "[object Object]") {
            for (var key in obj) {
                if (!getSchemaMatch(obj[key], objFromSchema[key])) {
                    result = false;
                    break;
                }
                result = true;
            }
        } else {
            return typeof objFromSchema === typeof obj;
        }
        return result;
    };
    var convertSchemaAndGetMatch = function (obj, schemaObject) {
        var objectFromSchema = buildSchema(schemaObject);
        if (getSchemaMatch(obj, objectFromSchema)) {
            return obj;
        }
        return -1;
    };

    var Typy = function Typy () {};

    var prototypeAccessors = { isValid: { configurable: true },isDefined: { configurable: true },isUndefined: { configurable: true },isNull: { configurable: true },isNullOrUndefined: { configurable: true },isBoolean: { configurable: true },isTrue: { configurable: true },isFalse: { configurable: true },isTruthy: { configurable: true },isFalsy: { configurable: true },isObject: { configurable: true },isEmptyObject: { configurable: true },isString: { configurable: true },isEmptyString: { configurable: true },isNumber: { configurable: true },isArray: { configurable: true },isEmptyArray: { configurable: true },isFunction: { configurable: true },isDate: { configurable: true },isSymbol: { configurable: true },safeObject: { configurable: true },safeObjectOrEmpty: { configurable: true },safeString: { configurable: true },safeNumber: { configurable: true },safeBoolean: { configurable: true },safeFunction: { configurable: true },safeArray: { configurable: true } };

    prototypeAccessors.isValid.get = function () {
        if (this.schemaCheck !== null && this.schemaCheck === true && this.input !== null && this.input !== undefined) {
            return true;
        }
        return false;
    };
    prototypeAccessors.isDefined.get = function () {
        if (typeof this.input !== "undefined") 
            { return true; }
        return false;
    };
    prototypeAccessors.isUndefined.get = function () {
        if (typeof this.input === "undefined") 
            { return true; }
        return false;
    };
    prototypeAccessors.isNull.get = function () {
        if (this.input === null && typeof this.input === "object") 
            { return true; }
        return false;
    };
    prototypeAccessors.isNullOrUndefined.get = function () {
        if (this.isNull || this.isUndefined) 
            { return true; }
        return false;
    };
    prototypeAccessors.isBoolean.get = function () {
        if (typeof this.input === typeof true) 
            { return true; }
        return false;
    };
    prototypeAccessors.isTrue.get = function () {
        if (this.input === true) 
            { return true; }
        return false;
    };
    prototypeAccessors.isFalse.get = function () {
        if (this.input === false) 
            { return true; }
        return false;
    };
    prototypeAccessors.isTruthy.get = function () {
        if (this.input) 
            { return true; }
        return false;
    };
    prototypeAccessors.isFalsy.get = function () {
        if (!this.input) 
            { return true; }
        return false;
    };
    prototypeAccessors.isObject.get = function () {
        if (typeof this.input === "object" && this.input === Object(this.input) && Object.prototype.toString.call(this.input) !== "[object Array]" && Object.prototype.toString.call(this.input) !== "[object Date]") {
            return true;
        }
        return false;
    };
    prototypeAccessors.isEmptyObject.get = function () {
        if (this.isObject && Object.keys(this.input).length === 0) 
            { return true; }
        return false;
    };
    prototypeAccessors.isString.get = function () {
        if (typeof this.input === "string") 
            { return true; }
        return false;
    };
    prototypeAccessors.isEmptyString.get = function () {
        if (this.isString && this.input.length === 0) 
            { return true; }
        return false;
    };
    prototypeAccessors.isNumber.get = function () {
        if (Number.isFinite(this.input)) 
            { return true; }
        return false;
    };
    prototypeAccessors.isArray.get = function () {
        if (Array.isArray(this.input)) 
            { return true; }
        return false;
    };
    prototypeAccessors.isEmptyArray.get = function () {
        if (this.isArray && this.input.length === 0) 
            { return true; }
        return false;
    };
    prototypeAccessors.isFunction.get = function () {
        if (typeof this.input === "function") 
            { return true; }
        return false;
    };
    prototypeAccessors.isDate.get = function () {
        return this.input instanceof Date || Object.prototype.toString.call(this.input) === "[object Date]";
    };
    prototypeAccessors.isSymbol.get = function () {
        return typeof this.input === "symbol" || typeof this.input === "object" && Object.prototype.toString.call(this.input) === "[object Symbol]";
    };
    prototypeAccessors.safeObject.get = function () {
        return this.input;
    };
    prototypeAccessors.safeObjectOrEmpty.get = function () {
        if (this.input) 
            { return this.input; }
        return {};
    };
    prototypeAccessors.safeString.get = function () {
        if (this.isString) 
            { return this.input; }
        return "";
    };
    prototypeAccessors.safeNumber.get = function () {
        if (this.isNumber) 
            { return this.input; }
        return 0;
    };
    prototypeAccessors.safeBoolean.get = function () {
        if (this.isBoolean) 
            { return this.input; }
        return false;
    };
    prototypeAccessors.safeFunction.get = function () {
        if (this.isFunction) 
            { return this.input; }
        return function () {};
    };
    prototypeAccessors.safeArray.get = function () {
        if (this.isArray) 
            { return this.input; }
        if (!this.isNullOrUndefined) 
            { return [this.input]; }
        return [];
    };

    Object.defineProperties( Typy.prototype, prototypeAccessors );
    Typy.prototype.Schema = {
        Number: 1,
        String: "typy",
        Boolean: true,
        Null: null,
        Undefined: undefined,
        Array: [],
        Function: function () {},
        Date: new Date(),
        Symbol: Symbol("")
    };
    Typy.prototype.t = function (obj, options) {
        this.input = obj;
        this.schemaCheck = null;
        if (options) {
            if (typeof options === "string") {
                this.input = getNestedObject(this.input, options);
            } else {
                var checkSchema = convertSchemaAndGetMatch(this.input, options);
                if (checkSchema !== -1) {
                    this.schemaCheck = true;
                    this.input = checkSchema;
                } else {
                    this.schemaCheck = false;
                    this.input = obj;
                }
            }
        }
        return this;
    };

    var t = function (input, objectPath) { return new Typy().t(input, objectPath); };

    function transformData(data, columns) {
        var outData = [];
        data.forEach(function (srcRow) {
            var outRow = {};
            columns.forEach(function (col) {
                var inputValue = t(srcRow, col.source).safeObject;
                if (col.transform !== undefined) {
                    outRow[col.id] = col.transform(inputValue);
                } else {
                    outRow[col.id] = inputValue;
                }
            });
            outData.push(outRow);
        });
        return outData;
    }

    function promiseTimeout(ms) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, ms);
        });
    }

    function handleQueueEntry(queueEntry, queueObject) {
        return new Promise(function ($return, $error) {
            var $Try_1_Finally = (function ($Try_1_Exit) {
                return (function ($Try_1_Value) {
                    try {
                        queueObject.working--;
                        return $Try_1_Exit && $Try_1_Exit.call(this, $Try_1_Value);
                    } catch ($boundEx) {
                        return $error($boundEx);
                    }
                }).bind(this);
            }).bind(this);
            var $Try_1_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_1_Catch = function (_err) {
                try {
                    tableau.log("handleQueueEntry: received error: " + JSON.stringify(_err));
                    return $Try_1_Finally($Try_1_Post)();
                } catch ($boundEx) {
                    return $Try_1_Finally($error)($boundEx);
                }
            };
            try {
                var response;
                queueObject.working++;
                queueObject.done.push(queueEntry.url);
                if (queueEntry.postBody) {
                    return axios.post(queueEntry.url, queueEntry.postBody, {
                        headers: {
                            "X-Venafi-API-Key": queueObject.apiKey
                        }
                    }).then((function ($await_21) {
                        try {
                            response = $await_21;
                            return $If_7.call(this);
                        } catch ($boundEx) {
                            return $Try_1_Catch($boundEx);
                        }
                    }).bind(this), $Try_1_Catch);
                } else {
                    return axios.get(queueEntry.url, {
                        headers: {
                            "X-Venafi-API-Key": queueObject.apiKey
                        }
                    }).then((function ($await_22) {
                        try {
                            response = $await_22;
                            return $If_7.call(this);
                        } catch ($boundEx) {
                            return $Try_1_Catch($boundEx);
                        }
                    }).bind(this), $Try_1_Catch);
                }
                function $If_7() {
                    if (response.status === 200) {
                        queueEntry.cb(response);
                    }
                    if (response.data._links && response.data._links.length && response.data._links[0].Next) {
                        if (response.data.TotalCount) {
                            var loop = function ( offset ) {
                                var urlObj = new URL(queueEntry.url);
                                var searchParams = urlObj.searchParams;
                                searchParams.set("offset", offset);
                                searchParams.set("limit", 100);
                                var qs = searchParams.toString();
                                urlObj.search = qs;
                                var newUrl = urlObj.toString();
                                var i = queueObject.items.findIndex(function (el) { return el.url == newUrl; });
                                if (i == -1) {
                                    i = queueObject.done.findIndex(function (el) { return el == newUrl; });
                                    if (i == -1) {
                                        queueObject.items.push({
                                            url: newUrl,
                                            cb: queueEntry.cb,
                                            postBody: queueEntry.postBody,
                                            isRetry: false
                                        });
                                    }
                                }
                            };

                            for (var offset = 100;offset < response.data.TotalCount; offset += 100) loop( offset );
                        }
                        var newUrl$1 = new URL(response.data._links[0].Next.replace(/^\/vedsdk\//i, ""), queueObject.baseUrl).toString();
                        var idx = queueObject.items.findIndex(function (el) { return el.url == newUrl$1; });
                        if (idx == -1) {
                            idx = queueObject.done.findIndex(function (el) { return el == newUrl$1; });
                            if (idx == -1) {
                                queueObject.items.unshift({
                                    url: newUrl$1,
                                    cb: queueEntry.cb,
                                    postBody: queueEntry.postBody,
                                    isRetry: false
                                });
                            }
                        }
                    }
                    return $Try_1_Finally($Try_1_Post)();
                }
                
            } catch (_err) {
                $Try_1_Catch(_err);
            }
        });
    }

    function runQueue(queueObject) {
        return new Promise(function ($return, $error) {
            var timerId;
            queueObject.done = [];
            queueObject.working = 0;
            timerId = setInterval(function () {
                console.log("items in queue:" + queueObject.items.length + ", urls picked up: " + queueObject.done.length + ", currently running: " + queueObject.working);
            }, 500);
            var $Loop_8_trampoline;
            function $Loop_8() {
                {
                    var queueEntry;
                    if (queueObject.working >= 16) {
                        return promiseTimeout(100).then(function ($await_23) {
                            try {
                                return $Loop_8;
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        }, $error);
                    }
                    if (queueObject.items.length < 1) {
                        if (queueObject.working > 0) {
                            return promiseTimeout(100).then(function ($await_24) {
                                try {
                                    return $Loop_8;
                                } catch ($boundEx) {
                                    return $error($boundEx);
                                }
                            }, $error);
                        }
                        clearInterval(timerId);
                        console.log("queue done");
                        return $return(true);
                    }
                    
                    queueEntry = queueObject.items.shift();
                    handleQueueEntry(queueEntry, queueObject).catch(function (err) {
                        clearInterval(timerId);
                        tableau.log("handleQueueEntry returned an error: " + JSON.stringify(err));
                        throw err;
                    });
                    return $Loop_8;
                }
            }
            
            return ($Loop_8_trampoline = (function (q) {
                while (q) {
                    if (q.then) 
                        { return void q.then($Loop_8_trampoline, $error); }
                    try {
                        if (q.pop) 
                            { if (q.length) 
                            { return q.pop() ? $Loop_8_exit.call(this) : q; }
                         else 
                            { q = $Loop_8; } }
                         else 
                            { q = q.call(this); }
                    } catch (_exception) {
                        return $error(_exception);
                    }
                }
            }).bind(this))($Loop_8);
            function $Loop_8_exit() {
                return $return();
            }
            
        });
    }

    function fetchAllCertificates(table, apiKey) {
        return new Promise(function ($return, $error) {
            var urlObj, certificateQueue;
            urlObj = new URL(tableau.connectionData + "/");
            if (tableau.connectionData.endsWith("/")) {
                urlObj = new URL(tableau.connectionData);
            }
            certificateQueue = {
                baseUrl: urlObj.toString(),
                apiKey: apiKey,
                items: [],
                done: [],
                working: 0
            };
            var $Try_2_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_2_Catch = function (_err) {
                try {
                    tableau.log("fetchAllCertificates: caught an exception");
                    tableau.log("fetchAllCertificates: caught an exception: " + JSON.stringify(_err));
                    console.error("Fetch all certificates error:", _err);
                    if (_err.response) {
                        tableau.log("fetchAllCertificates: response exception");
                        tableau.log("fetchAllCertificates: response exception: " + JSON.stringify(_err.response));
                        console.error("Response error:", _err.response);
                    }
                    throw _err;
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var dataEnabled, dataDisabled, certUrl, tableauData, i;
                tableau.reportProgress("Fetching certificates");
                tableau.log("fetchAllCertificates: start fetching enabled certs");
                dataEnabled = [];
                dataDisabled = [];
                certUrl = new URL("certificates?disabled=0", urlObj);
                certificateQueue.items.push({
                    url: certUrl,
                    postBody: false,
                    isRetry: false,
                    cb: function (response) {
                        if (response.data.Certificates) {
                            dataEnabled = dataEnabled.concat(response.data.Certificates);
                        }
                    }
                });
                certUrl = new URL("certificates?disabled=1", urlObj);
                certificateQueue.items.push({
                    url: certUrl,
                    postBody: false,
                    isRetry: false,
                    cb: function (response) {
                        if (response.data.Certificates) {
                            dataDisabled = dataDisabled.concat(response.data.Certificates);
                        }
                    }
                });
                return runQueue(certificateQueue).then(function ($await_25) {
                    try {
                        var loop = function ( cIdx ) {
                            dataEnabled[cIdx].disabled = false;
                            var cert = dataEnabled[cIdx];
                            certUrl = new URL(("certificates/" + (cert.Guid)), urlObj);
                            certificateQueue.items.push({
                                url: certUrl,
                                postBody: false,
                                isRetry: false,
                                cb: function (response) {
                                    dataEnabled[cIdx] = Object.assign(dataEnabled[cIdx], response.data);
                                }
                            });
                        };

                        for (var cIdx = 0;cIdx < dataEnabled.length; cIdx++) loop( cIdx );
                        dataDisabled.forEach(function (c) {
                            c.disabled = true;
                        });
                        return runQueue(certificateQueue).then(function ($await_26) {
                            try {
                                tableau.log("fetchAllCertificates: transforming data for Tableau");
                                tableauData = transformData(dataEnabled.concat(dataDisabled), tables.AllCertificates.columns);
                                tableau.log("fetchAllCertificates: Returning data in chunks");
                                i = 0;
                                while (i < tableauData.length) {
                                    tableau.reportProgress(("Returning certificate-data: " + i + " / " + (tableauData.length)));
                                    table.appendRows(tableauData.slice(i, i + 100));
                                    i += 100;
                                }
                                return $Try_2_Post();
                            } catch ($boundEx) {
                                return $Try_2_Catch($boundEx);
                            }
                        }, $Try_2_Catch);
                    } catch ($boundEx) {
                        return $Try_2_Catch($boundEx);
                    }
                }, $Try_2_Catch);
            } catch (_err) {
                $Try_2_Catch(_err);
            }
        });
    }

    function fetchAllDevices(table, apiKey) {
        return new Promise(function ($return, $error) {
            var urlObj, deviceQueue;
            urlObj = new URL(tableau.connectionData + "/");
            if (tableau.connectionData.endsWith("/")) {
                urlObj = new URL(tableau.connectionData);
            }
            deviceQueue = {
                baseUrl: urlObj.toString(),
                apiKey: apiKey,
                items: [],
                done: [],
                working: 0
            };
            var $Try_3_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_3_Catch = function (_err) {
                try {
                    console.error("Fetch all devices error:", _err);
                    if (_err.response) {
                        console.error("Response error:", _err.response);
                    }
                    throw _err;
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var deviceUrl, data, tableauData, i;
                tableau.reportProgress("Fetching devices");
                deviceUrl = new URL("config/FindObjectsOfClass", urlObj).toString();
                data = [];
                deviceQueue.items.push({
                    url: deviceUrl,
                    postBody: {
                        Class: "Device"
                    },
                    isRetry: false,
                    cb: function (response) {
                        if (response.data.Objects) {
                            data = data.concat(response.data.Objects);
                        }
                    }
                });
                return runQueue(deviceQueue).then(function ($await_27) {
                    try {
                        var loop = function ( dIdx ) {
                            var device = data[dIdx];
                            deviceUrl = new URL("config/ReadAll", urlObj).toString();
                            deviceQueue.items.push({
                                url: deviceUrl,
                                postBody: {
                                    ObjectDN: device.DN
                                },
                                isRetry: false,
                                cb: function (response) {
                                    data[dIdx] = Object.assign(data[dIdx], response.data);
                                }
                            });
                        };

                        for (var dIdx = 0;dIdx < data.length; dIdx++) loop( dIdx );
                        return runQueue(deviceQueue).then(function ($await_28) {
                            try {
                                tableauData = transformData(data, tables.AllDevices.columns);
                                i = 0;
                                while (i < tableauData.length) {
                                    tableau.reportProgress(("Returning device-data: " + i + " / " + (tableauData.length)));
                                    table.appendRows(tableauData.slice(i, i + 100));
                                    i += 100;
                                }
                                return $Try_3_Post();
                            } catch ($boundEx) {
                                return $Try_3_Catch($boundEx);
                            }
                        }, $Try_3_Catch);
                    } catch ($boundEx) {
                        return $Try_3_Catch($boundEx);
                    }
                }, $Try_3_Catch);
            } catch (_err) {
                $Try_3_Catch(_err);
            }
        });
    }

    function fetchAllApplications(table, apiKey) {
        return new Promise(function ($return, $error) {
            var urlObj, appQueue;
            urlObj = new URL(tableau.connectionData + "/");
            if (tableau.connectionData.endsWith("/")) {
                urlObj = new URL(tableau.connectionData);
            }
            appQueue = {
                baseUrl: urlObj.toString(),
                apiKey: apiKey,
                items: [],
                done: [],
                working: 0
            };
            var $Try_4_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_4_Catch = function (_err) {
                try {
                    console.error("Fetch all applications error:", _err);
                    if (_err.response) {
                        console.error("Response error:", _err.response);
                    }
                    throw _err;
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var appUrl, data, tableauData, i;
                tableau.reportProgress("Fetching applications");
                appUrl = new URL("config/EnumerateObjectsDerivedFrom", urlObj).toString();
                data = [];
                appQueue.items.push({
                    url: appUrl,
                    postBody: {
                        DerivedFrom: "Application Base"
                    },
                    isRetry: false,
                    cb: function (response) {
                        if (response.data.Objects) {
                            data = data.concat(response.data.Objects);
                        }
                    }
                });
                return runQueue(appQueue).then(function ($await_29) {
                    try {
                        var loop = function ( dIdx ) {
                            var app = data[dIdx];
                            appUrl = new URL("config/ReadAll", urlObj).toString();
                            appQueue.items.push({
                                url: appUrl,
                                postBody: {
                                    ObjectDN: app.DN
                                },
                                isRetry: false,
                                cb: function (response) {
                                    data[dIdx] = Object.assign(data[dIdx], response.data);
                                }
                            });
                        };

                        for (var dIdx = 0;dIdx < data.length; dIdx++) loop( dIdx );
                        return runQueue(appQueue).then(function ($await_30) {
                            try {
                                tableauData = transformData(data, tables.AllApplications.columns);
                                i = 0;
                                while (i < tableauData.length) {
                                    tableau.reportProgress(("Returning application-data: " + i + " / " + (tableauData.length)));
                                    table.appendRows(tableauData.slice(i, i + 100));
                                    i += 100;
                                }
                                return $Try_4_Post();
                            } catch ($boundEx) {
                                return $Try_4_Catch($boundEx);
                            }
                        }, $Try_4_Catch);
                    } catch ($boundEx) {
                        return $Try_4_Catch($boundEx);
                    }
                }, $Try_4_Catch);
            } catch (_err) {
                $Try_4_Catch(_err);
            }
        });
    }

    function fetchLicenseCounts(table, apiKey) {
        return new Promise(function ($return, $error) {
            var url;
            url = tableau.connectionData;
            var $Try_5_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_5_Catch = function (_err) {
                try {
                    console.error("Fetch license-count error:", _err);
                    if (_err.response) {
                        console.error("Response error:", _err.response);
                    }
                    throw _err;
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var waiting;
                waiting = true;
                var $Loop_14_trampoline;
                function $Loop_14() {
                    if (waiting) {
                        var response;
                        return axios.post((url + "/config/ReadAll"), {
                            ObjectDN: "\\VED\\Reports\\Licensing Report"
                        }, {
                            headers: {
                                "X-Venafi-API-Key": apiKey
                            }
                        }).then((function ($await_31) {
                            try {
                                response = $await_31;
                                if (response.status == 200) {
                                    var values, csvVaultId, lastRun, startNow, startDiff;
                                    if (response.data.Result && response.data.Result == 400) {
                                        tableau.reportProgress("License report check gave an error. Requesting a new one and trying again");
                                        return axios.post((url + "/config/AddValue"), {
                                            ObjectDN: "\\VED\\Reports\\Licensing Report",
                                            AttributeName: "Start Now",
                                            Value: "1"
                                        }, {
                                            headers: {
                                                "X-Venafi-API-Key": apiKey
                                            }
                                        }).then(function ($await_32) {
                                            try {
                                                return promiseTimeout(20000).then(function ($await_33) {
                                                    try {
                                                        return $Loop_14;
                                                    } catch ($boundEx) {
                                                        return $Try_5_Catch($boundEx);
                                                    }
                                                }, $Try_5_Catch);
                                            } catch ($boundEx) {
                                                return $Try_5_Catch($boundEx);
                                            }
                                        }, $Try_5_Catch);
                                    }
                                    values = response.data.NameValues;
                                    csvVaultId = null;
                                    lastRun = null;
                                    startNow = null;
                                    values.forEach(function (nv) {
                                        if (nv.Name == "CSV Vault Id") {
                                            csvVaultId = nv.Values[0];
                                        } else if (nv.Name == "Last Run") {
                                            lastRun = luxon.DateTime.fromFormat(nv.Values[0], "LL/dd/yyyy HH:mm:ss", {
                                                zone: "UTC"
                                            });
                                        } else if (nv.Name == "Start Now") {
                                            startNow = nv.Values[0];
                                        }
                                    });
                                    startDiff = null;
                                    if (lastRun) {
                                        startDiff = lastRun.diffNow("hours");
                                    }
                                    if (startDiff !== null && startDiff > 47) {
                                        tableau.reportProgress("License report is too old, creating a new one");
                                        return axios.post((url + "/config/AddValue"), {
                                            ObjectDN: "\\VED\\Reports\\Licensing Report",
                                            AttributeName: "Start Now",
                                            Value: "1"
                                        }, {
                                            headers: {
                                                "X-Venafi-API-Key": apiKey
                                            }
                                        }).then(function ($await_34) {
                                            try {
                                                return promiseTimeout(20000).then(function ($await_35) {
                                                    try {
                                                        return $Loop_14;
                                                    } catch ($boundEx) {
                                                        return $Try_5_Catch($boundEx);
                                                    }
                                                }, $Try_5_Catch);
                                            } catch ($boundEx) {
                                                return $Try_5_Catch($boundEx);
                                            }
                                        }, $Try_5_Catch);
                                    }
                                    function $If_18() {
                                        if (startNow !== "1") {
                                            tableau.reportProgress("Waiting for license-report to be completed");
                                            return promiseTimeout(20000).then(function ($await_36) {
                                                try {
                                                    return $Loop_14;
                                                } catch ($boundEx) {
                                                    return $Try_5_Catch($boundEx);
                                                }
                                            }, $Try_5_Catch);
                                        }
                                        if (csvVaultId) {
                                            tableau.reportProgress("Retrieving generated license-report");
                                            return axios.post((url + "/SecretStore/Retrieve"), {
                                                VaultID: csvVaultId
                                            }, {
                                                headers: {
                                                    "X-Venafi-API-Key": apiKey
                                                }
                                            }).then((function ($await_37) {
                                                try {
                                                    response = $await_37;
                                                    if (response.status == 200) {
                                                        var data = atob(response.data.Base64Data);
                                                        var lines = data.split("\n");
                                                        data = [];
                                                        lines.forEach(function (l) {
                                                            var values = l.split(",");
                                                            if (values.length == 2) {
                                                                data[values[0].trim()] = values[1].trim();
                                                            }
                                                        });
                                                        data = [data];
                                                        var tableauData = transformData(data, tables.LicenseCounts.columns);
                                                        var i = 0;
                                                        while (i < tableauData.length) {
                                                            tableau.reportProgress(("Returning license-count-data: " + i + " / " + (tableauData.length)));
                                                            table.appendRows(tableauData.slice(i, i + 100));
                                                            i += 100;
                                                        }
                                                        waiting = false;
                                                    }
                                                    return $If_20.call(this);
                                                } catch ($boundEx) {
                                                    return $Try_5_Catch($boundEx);
                                                }
                                            }).bind(this), $Try_5_Catch);
                                        }
                                        function $If_20() {
                                            return $If_16.call(this);
                                        }
                                        
                                        return $If_20.call(this);
                                    }
                                    
                                    if (startNow !== "1") {
                                        tableau.reportProgress("Waiting for license-report to be completed");
                                        return promiseTimeout(20000).then(function ($await_36) {
                                            try {
                                                return $Loop_14;
                                            } catch ($boundEx) {
                                                return $Try_5_Catch($boundEx);
                                            }
                                        }, $Try_5_Catch);
                                    }
                                    function $If_19() {
                                        if (csvVaultId) {
                                            tableau.reportProgress("Retrieving generated license-report");
                                            return axios.post((url + "/SecretStore/Retrieve"), {
                                                VaultID: csvVaultId
                                            }, {
                                                headers: {
                                                    "X-Venafi-API-Key": apiKey
                                                }
                                            }).then((function ($await_37) {
                                                try {
                                                    response = $await_37;
                                                    if (response.status == 200) {
                                                        var data = atob(response.data.Base64Data);
                                                        var lines = data.split("\n");
                                                        data = [];
                                                        lines.forEach(function (l) {
                                                            var values = l.split(",");
                                                            if (values.length == 2) {
                                                                data[values[0].trim()] = values[1].trim();
                                                            }
                                                        });
                                                        data = [data];
                                                        var tableauData = transformData(data, tables.LicenseCounts.columns);
                                                        var i = 0;
                                                        while (i < tableauData.length) {
                                                            tableau.reportProgress(("Returning license-count-data: " + i + " / " + (tableauData.length)));
                                                            table.appendRows(tableauData.slice(i, i + 100));
                                                            i += 100;
                                                        }
                                                        waiting = false;
                                                    }
                                                    return $If_20.call(this);
                                                } catch ($boundEx) {
                                                    return $Try_5_Catch($boundEx);
                                                }
                                            }).bind(this), $Try_5_Catch);
                                        }
                                        function $If_20() {
                                            return $If_16.call(this);
                                        }
                                        
                                        return $If_20.call(this);
                                    }
                                    
                                    if (csvVaultId) {
                                        tableau.reportProgress("Retrieving generated license-report");
                                        return axios.post((url + "/SecretStore/Retrieve"), {
                                            VaultID: csvVaultId
                                        }, {
                                            headers: {
                                                "X-Venafi-API-Key": apiKey
                                            }
                                        }).then((function ($await_37) {
                                            try {
                                                response = $await_37;
                                                if (response.status == 200) {
                                                    var data = atob(response.data.Base64Data);
                                                    var lines = data.split("\n");
                                                    data = [];
                                                    lines.forEach(function (l) {
                                                        var values = l.split(",");
                                                        if (values.length == 2) {
                                                            data[values[0].trim()] = values[1].trim();
                                                        }
                                                    });
                                                    data = [data];
                                                    var tableauData = transformData(data, tables.LicenseCounts.columns);
                                                    var i = 0;
                                                    while (i < tableauData.length) {
                                                        tableau.reportProgress(("Returning license-count-data: " + i + " / " + (tableauData.length)));
                                                        table.appendRows(tableauData.slice(i, i + 100));
                                                        i += 100;
                                                    }
                                                    waiting = false;
                                                }
                                                return $If_20.call(this);
                                            } catch ($boundEx) {
                                                return $Try_5_Catch($boundEx);
                                            }
                                        }).bind(this), $Try_5_Catch);
                                    }
                                    function $If_20() {
                                        return $If_16.call(this);
                                    }
                                    
                                    return $If_20.call(this);
                                } else {
                                    return promiseTimeout(20000).then((function ($await_38) {
                                        try {
                                            return $If_16.call(this);
                                        } catch ($boundEx) {
                                            return $Try_5_Catch($boundEx);
                                        }
                                    }).bind(this), $Try_5_Catch);
                                }
                                function $If_16() {
                                    return $Loop_14;
                                }
                                
                            } catch ($boundEx) {
                                return $Try_5_Catch($boundEx);
                            }
                        }).bind(this), $Try_5_Catch);
                    } else 
                        { return [1]; }
                }
                
                return ($Loop_14_trampoline = (function (q) {
                    while (q) {
                        if (q.then) 
                            { return void q.then($Loop_14_trampoline, $Try_5_Catch); }
                        try {
                            if (q.pop) 
                                { if (q.length) 
                                { return q.pop() ? $Loop_14_exit.call(this) : q; }
                             else 
                                { q = $Loop_14; } }
                             else 
                                { q = q.call(this); }
                        } catch (_exception) {
                            return $Try_5_Catch(_exception);
                        }
                    }
                }).bind(this))($Loop_14);
                function $Loop_14_exit() {
                    return $Try_5_Post();
                }
                
            } catch (_err) {
                $Try_5_Catch(_err);
            }
        });
    }

    function fetchLogEvents(table, apiKey) {
        return new Promise(function ($return, $error) {
            var urlObj, logQueue;
            urlObj = new URL(tableau.connectionData + "/");
            if (tableau.connectionData.endsWith("/")) {
                urlObj = new URL(tableau.connectionData);
            }
            logQueue = {
                baseUrl: urlObj.toString(),
                apiKey: apiKey,
                items: [],
                done: [],
                working: 0
            };
            var $Try_6_Post = function () {
                try {
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_6_Catch = function (_err) {
                try {
                    console.error("Fetch log-events error:", _err);
                    if (_err.response) {
                        console.error("Response error:", _err.response);
                    }
                    throw _err;
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var logUrl, data, tableauData, i;
                tableau.reportProgress("Fetching log-events");
                logUrl = new URL("log?limit=100000", urlObj);
                if (table.incrementValue) {
                    var lastLog = luxon.DateTime.fromFormat(table.incrementValue, "yyyy-LL-dd HH:mm:ss");
                    var lastLogDate = lastLog.toFormat("yyyy-LL-dd");
                    var lastLogTime = lastLog.toFormat("HH:mm:ss");
                    var searchParams = new URLSearchParams();
                    searchParams.FromTime = lastLogDate + "T" + lastLogTime;
                    logUrl.search = searchParams.toString();
                }
                data = [];
                logQueue.items.push({
                    url: logUrl.toString(),
                    postBody: false,
                    isRetry: false,
                    cb: function (response) {
                        if (response.data.LogEvents) {
                            data = data.concat(response.data.LogEvents);
                        }
                    }
                });
                return runQueue(logQueue).then(function ($await_39) {
                    try {
                        tableauData = transformData(data, tables.LogEvents.columns);
                        i = 0;
                        while (i < tableauData.length) {
                            tableau.reportProgress(("Returning log-event-data: " + i + " / " + (tableauData.length)));
                            table.appendRows(tableauData.slice(i, i + 100));
                            i += 100;
                        }
                        return $Try_6_Post();
                    } catch ($boundEx) {
                        return $Try_6_Catch($boundEx);
                    }
                }, $Try_6_Catch);
            } catch (_err) {
                $Try_6_Catch(_err);
            }
        });
    }

    var connector = tableau.makeConnector();
    connector.getSchema = function (schemaCallback) {
        var certificatesTable = {
            id: "all_certificates",
            alias: "All certificates",
            columns: tables.AllCertificates.columns
        };
        var devicesTable = {
            id: "all_devices",
            alias: "All devices",
            columns: tables.AllDevices.columns
        };
        var applicationsTable = {
            id: "all_applications",
            alias: "All applications",
            columns: tables.AllApplications.columns
        };
        var licenseCountTable = {
            id: "license_counts",
            alias: "LicenseCounts",
            columns: tables.LicenseCounts.columns
        };
        var logEventsTable = {
            id: "log_events",
            alias: "Log events",
            columns: tables.LogEvents.columns,
            incrementColumnId: "ServerTimestamp"
        };
        var tableConnections = [{
            alias: "Devices and applications",
            tables: [{
                id: "all_devices",
                alias: "All devices"
            },{
                id: "all_applications",
                alias: "All applications"
            }],
            "joins": [{
                "left": {
                    "tableAlias": "All devices",
                    "columnId": "DN"
                },
                "right": {
                    "tableAlias": "All applications",
                    "columnId": "Parent"
                },
                "joinType": "left"
            }]
        }];
        schemaCallback([certificatesTable,devicesTable,applicationsTable,licenseCountTable,
            logEventsTable], tableConnections);
    };
    function reportError(_err) {
        if (_err && _err.message) {
            tableau.abortWithError("Error in WDC: " + _err.message);
        } else {
            tableau.abortWithError("Unknown error in WDC");
        }
    }

    connector.getData = function (table, doneCallback) {
        var passwordData;
        try {
            passwordData = JSON.parse(tableau.password);
            console.log("Password data:", passwordData);
        } catch (_err) {
            console.error("tableau.password had invalid contents", _err);
            tableau.abortForAuth("tableau.password had invalid contents");
            return;
        }
        if (!table.tableInfo || !table.tableInfo.id) {
            tableau.log("No table-id supplied by tableau");
            tableau.abortWithError("No table-id supplied by Tableau");
            return;
        }
        handleTokenLifespan(passwordData).then(function () {
            switch (table.tableInfo.id) {
                case "all_certificates":
                    tableau.log("from getData(), calling fetchAllCertificates()");
                    fetchAllCertificates(table, passwordData.apiKey).then(function () {
                        tableau.log("from getData(), fetchAllCertificates() returned OK");
                        doneCallback();
                    }).catch(function (_err) {
                        reportError(_err);
                    });
                    break;
                case "all_devices":
                    fetchAllDevices(table, passwordData.apiKey).then(function () {
                        doneCallback();
                    }).catch(function (_err) {
                        reportError(_err);
                    });
                    break;
                case "all_applications":
                    fetchAllApplications(table, passwordData.apiKey).then(function () {
                        doneCallback();
                    }).catch(function (_err) {
                        reportError(_err);
                    });
                    break;
                case "license_counts":
                    fetchLicenseCounts(table, passwordData.apiKey).then(function () {
                        doneCallback();
                    }).catch(function (_err) {
                        reportError(_err);
                    });
                    break;
                case "log_events":
                    fetchLogEvents(table, passwordData.apiKey).then(function () {
                        doneCallback();
                    }).catch(function (_err) {
                        reportError(_err);
                    });
                    break;
                default:
                    tableau.log("Unknown table-id: " + table.tableInfo.id);
                    tableau.abortWithError("Tableau requested an unknown table-id: " + table.tablInfo.id);
                    doneCallback();
            }
        }).catch(function () {
            tableau.abortWithError("The WDC could not refresh it's token. Please try after starting Tableau again, or delete and re-add the datasource");
        });
    };
    function handleTokenLifespan(passwordData) {
        return new Promise(function ($return, $error) {
            var $Try_2_Post = function () {
                try {
                    if (passwordData.password && tableau.username) {
                        console.log("Trying to get new API key");
                        var $Try_3_Post = (function () {
                            try {
                                return $If_6.call(this);
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        }).bind(this);
                        var $Try_3_Catch = function (_err) {
                            try {
                                throw "Error in trying to get apiKey. Reauthenticate";
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        };
                        try {
                            var newKey;
                            return getApiKey(tableau.connectionData, tableau.username, passwordData.password).then(function ($await_8) {
                                try {
                                    newKey = $await_8;
                                    console.log("Received a new apikey (but not showing it here)");
                                    passwordData.apiKey = newKey;
                                    return $return(passwordData);
                                } catch ($boundEx) {
                                    return $Try_3_Catch($boundEx);
                                }
                            }, $Try_3_Catch);
                        } catch (_err) {
                            $Try_3_Catch(_err);
                        }
                    } else {
                        return $error("No current username, password and/or apiKey present. Reauthenticate");
                    }
                    function $If_6() {
                        return $return();
                    }
                    
                    return $If_6.call(this);
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            var $Try_2_Catch = function (_err) {
                try {
                    passwordData.apiKey = null;
                    return $Try_2_Post();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                if (passwordData.password && passwordData.apiKey && tableau.connectionData) {
                    var dateDiff;
                    console.log("Checking if API key is valid");
                    return minutesApiKeyValid(tableau.connectionData, passwordData.apiKey).then((function ($await_9) {
                        try {
                            dateDiff = $await_9;
                            console.log(dateDiff);
                            if (dateDiff > 5) {
                                console.log("Enough minutes left, lets use it");
                                return $return(passwordData);
                            }
                            throw "apiKey is expired";
                        } catch ($boundEx) {
                            return $Try_2_Catch($boundEx);
                        }
                    }).bind(this), $Try_2_Catch);
                }
                return $Try_2_Post();
            } catch (_err) {
                $Try_2_Catch();
            }
        });
    }

    connector.init = function (initCallback) {
        return new Promise(function ($return, $error) {
            var passwordData;
            tableau.log("VENAFI init callback");
            console.log("init:", tableau);
            if (tableau.phase !== "gatherData") {
                console.log("We're not in gatherData, stopping init");
                initCallback();
                return $return();
            }
            try {
                passwordData = JSON.parse(tableau.password);
                console.log("Password data:", passwordData);
            } catch (_err) {
                console.error("tableau.password had invalid contents", _err);
                tableau.abortForAuth("tableau.password had invalid contents");
                return $return();
            }
            var $Try_5_Catch = function (_err) {
                try {
                    tableau.abortForAuth("Error while getting new apiKey, reauthenticate");
                    return $return();
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            };
            try {
                var newPasswordData;
                return handleTokenLifespan(passwordData).then(function ($await_10) {
                    try {
                        newPasswordData = $await_10;
                        tableau.password = JSON.stringify(newPasswordData);
                        initCallback();
                        return $return();
                    } catch ($boundEx) {
                        return $Try_5_Catch($boundEx);
                    }
                }, $Try_5_Catch);
            } catch (_err) {
                $Try_5_Catch();
            }
        });
    };
    tableau.registerConnector(connector);

    document.getElementById("form").addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("submit clicked");
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        var currentURL = new URL(window.location.href);
        var base_url = (currentURL.protocol) + "//" + (currentURL.host) + "/VEDSDK";
        tableau.connectionData = base_url;
        var qsParams = new URLSearchParams(currentURL.search);
        if (qsParams) {
            if (qsParams.has("baseUrl")) {
                tableau.connectionData = qsParams.get("baseUrl");
            }
        }
        tableau.connectionName = "Venafi " + tableau.connectionData;
        getApiKey(tableau.connectionData, username, password).then(function (response) {
            console.log("Received api key", response);
            tableau.username = username;
            tableau.password = JSON.stringify({
                password: password,
                apiKey: response
            });
            tableau.submit();
        }).catch(function (err) {
            console.error("Error:", err);
        });
    });

}());
