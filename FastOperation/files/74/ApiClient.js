
var ApiClient = function () {
    var _url = Config.baseUrl;
    var _self = this;
    var _searchDataMapping = {
        "queryText": {
            "type": "xs:string", "param": "query-text"
        },
        "startValue": {
            "type": "xs:int", "param": "start-value"
        },
        "numResults": {
            "type": "xs:int", "param": "num-results"
        },
        "sortBy": {
            "type": "xs:string", "param": "sort-by"
        },
        "journals": {
            "type": "xs:string", "param": "journal"
        },
        "volume": {
            "type": "xs:string", "param": "volume"
        },
        "issue": {
            "type": "xs:string", "param": "issue"
        },
        "page": {
            "type": "xs:string", "param": "page"
        },
        "conferences": {
            "type": "xs:string", "param": "conference"
        },
        "conferenceYear": {
            "type": "xs:int", "param": "conference-year"
        },
        "paperNumber": {
            "type": "xs:string", "param": "paper-number"
        },
        "authors": {
            "type": "xs:string", "param": "authors"
        },
        "anyAuthor": {
            "type": "xs:boolean", "param": "any-authors"
        },
        "yearsBetween": {
            "type": "xs:int", "param": "years-between"
        },
        "onlySearchIn": {
            "type": "xs:string", "param": "only-search-in"
        },
        "facetLength": {
            "type": "xs:int", "param": "facets-length"
        },
        "facetSearchOnly": {
            "type": "xs:boolean", "param": "facet-search-only"
        },
        "level2": {
            "type": "xs:string", "param": "l2terms"
        },
        "level3": {
            "type": "xs:string", "param": "l3terms"
        },
        "level4": {
            "type": "xs:string", "param": "l4terms"
        },
        "anyTopic": {
            "type": "xs:boolean", "param": "any-topics"
        },
        "specialCollection": {
            "type": "xs:string", "param": "special-collection"
        },
        "searchInJournals": {
            "type": "xs:boolean", "param": "search-in-journals"
        },
        "searchInConferences": {
            "type": "xs:boolean", "param": "search-in-conferences"
        },
        "searchInOther": {
            "type": "xs:boolean", "param": "search-in-others"
        },
        "searchInYearsBetween": {
            "type": "xs:boolean", "param": "search-in-years-between"
        },
        "publi": {
            "type": "xs:string", "param": "publi"
        },
        "fromDate": {
            "type": "xs:string", "param": "from-date"
        }
    };
    
    var _searchInMapping = {
        "searchInJournals": {
            "type": "xs:boolean", "param": "search-in-journals"
        },
        "conferences": {
            "type": "xs:boolean", "param": "search-in-conferences"
        },
        "other": {
            "type": "xs:boolean", "param": "search-in-others"
        },
        "yearsBetween": {
            "type": "xs:boolean", "param": "search-in-years-between"
        },
        "authors": {
            "type": "xs:boolean", "param": "search-in-authors"
        }
    };
    
    /**
     * This method make a search.
     * @param data the search data which is an object SearchData
     * @return the search response which is an object SearchResponse
     * @param callback
     */
    this.search = function (data, callback, searchobj, runfacets) {
        var body = _self._buildBody(data);
        $.ajax(_url, {
            "type": "POST",
            "dataType": "json",
            "headers": { "accept": "application/json; charset=UTF-8" },
            "contentType": "application/json; charset=UTF-8",
            "async": true,
            "global": false,
            "data": body,
            "timeout": 30000, // 30 second timeout in case there is a problem with the request
            "success": function (mldata, status, req) {
                if (req.status == 200) {
                    callback(mldata);
                    checkedJournal = document.getElementById("chkJournals").checked,
                    checkedProceding = document.getElementById("chkConferences").checked;
                    //#898 added the new functionality to select the journal or proceeding facet when use advanced search
                    if (! mainSearch) {
                        if (checkedJournal && ! checkedProceding) {
                            document.getElementById("facet-publications-journals").checked = true;
                            document.getElementById("publicationsAll").checked = false;
                        } else if (! checkedJournal && checkedProceding) {
                            document.getElementById("facet-publications-proceedings").checked = true;
                            document.getElementById("publicationsAll").checked = false;
                        }
                        mainSearch = true;
                    }
                    //#894 comment #2, clear the filters from facets that are in proceedings and journals
                    var allJournals = document.getElementById("all-journal"),
                    allProceedings = document.getElementById("all-proceeding");
                    if (allJournals && allJournals.checked) {
                        $(document.querySelectorAll("input[id^='journal-']")).prop("checked", false);
                    }
                    if (allProceedings && allProceedings.checked) {
                        $(document.querySelectorAll("input[id^='proceeding-']")).prop("checked", false);
                    }
                    if (searchobj && runfacets) searchobj.runFacetSavedState();
                }
            },
            "error": function (mldata, status, req) {
                $("#results").html("There was a problem retrieving your search. Please try again shortly.");
                $("#loadingIndicator").hide();
            }
        });
    };
    
    /**
     * Retrieve the list of categories.
     * @param callback function
     * @return an array of Option objects
     */
    this.getCategoriesInit = function (callback) {
        return _self._getOptionsInit(Config.categoryListURL, callback);
    };
    
    /**
     * Retrieves the journals.
     * @param callback function
     * @return an array of Option objects
     */
    this.getJournalsInit = function (callback) {
        return _self._getOptionsInit(Config.journalListURL, callback);
    };
    
    /**
     * Retrieves the conferences.
     * @param callback function
     * @return an array of Option objects
     */
    this.getConferencesInit = function (callback) {
        return _self._getOptionsInit(Config.conferenceListURL, callback);
    };
    
    /**
     * Retrieves the authors.
     * @param keyword the keyword to used to search which is an String
     * @return an array of Option objects
     * @param callback
     */
    this.getAuthors = function (keyword, callback) {
        return _self._getOptions("author", {
            "rs:keyword": keyword
        },
        callback);
    };
    
    /**
     * Retrieve the list of items from the given resource sending the given data.
     * @param resource the resource to use
     * @param data the data to send
     * @param callback
     * @return an array of Option objects
     */
    this._getOptions = function (resource, data, callback) {
        $.ajax(_url + "?resource="+resource, {
            "type": "GET",
            "dataType": "json",
            "headers": { "accept": "application/json; charset=UTF-8" },
            "async": true,
            "global": false,
            "data": data,
            "cache": true,
            "success": function (data, status, req) {
                if (req.status == 200) {
                    callback(data.LI.DL);
                }
            }
        });
    };
    
    /**
     * Retrieve the list of items from the static page for initialization.
     * @param resource the resource to use
     * @param data the data to send
     * @param callback
     * @return an array of Option objects
     */
    this._getOptionsInit = function (resource, callback) {
        $.ajax(resource, {
        	"cache": true,
            "type": "GET",
            "dataType": "json",
            "headers": { "accept": "application/json; charset=UTF-8" },
            "async": false, // TODO: switch pack to true when topic browser is user activated
            "global": false,
            "success": function (data, status, req) {
                if (req.status == 200) {
					if (data.LI.DL)
						callback(data.LI.DL);
					else
						callback(data.LI);
                }
            }
        });
    };
    
    /**
     * Receives a SearchData object and returns a json map used by the resource.
     * @param data the data used to search
     * @return the json used by the resource
     */
    this._buildBody = function (data) {
        var map =[];
        for (var k in data) {
            var entry = null;
            if (_.isNull(data[k]) || _.isUndefined(data[k])) {
                continue;
            } else if (_.isArray(data[k]) || k == "facets") {
                _self._addSequenceEntry(map, k, data[k]);
            } else {
                _self._addSimpleEntry(map, k, data[k]);
            }
        }
        return JSON.stringify({
            "map": {
                "_children": {
                    "entry": map
                }
            }
        });
    };
    
    /**
     * Creates an entry.
     * @param key the key
     * @param value the value or values
     * @param type the type
     */
    this._createEntry = function (key, value, type) {
        var values, i;
        if (_.isArray(value)) {
            values =[];
            for (i = 0; i < value.length; i++) {
                values[i] = _self._createValue(value[i], type);
            }
        } else {
            values = _self._createValue(value, type);
        }
        return {
            "_children": {
                "key": key,
                "value": values
            }
        };
    };
    
    /**
     * Creates a single value.
     * @param value the value
     * @param type the type
     */
    this._createValue = function (value, type) {
        return {
            "_value": value,
            "_attributes": {
                "xsi:type": type
            }
        };
    };
    
    /**
     * Adds a simple entry to the map.
     * @param the map
     * @param key the ApiClient key
     * @param value the value
     * @return the new entry
     */
    this._addSimpleEntry = function (map, key, value) {
        
        if (_.isUndefined(value) || _.isNull(value) || value == "") {
            return;
        }
        
        if (key == "searchInOptions") {
            for (var k in value) {
                var obj = _searchInMapping[k];
                if (!(obj) || _.isNull(obj)) {
                    continue;
                }
                var entry = _self._createEntry(obj.param, value[k], obj.type);
                map.push(entry);
            }
        } else {
            var obj = _searchDataMapping[key];
            if (_.isNull(obj)) {
                return;
            }
            var entry = _self._createEntry(obj.param, value, obj.type);
            map.push(entry);
        }
    };
    
    /**
     * Adds a sequence of entries to the map using the same key.
     * @param map the map
     * @param key the ApiClient key
     * @param value the value
     * @return the new entry
     */
    this._addSequenceEntry = function (map, key, array) {
        if (_.isEmpty(array)) {
            return;
        }
        if ([ "journals", "conferences", "yearsBetween", "level2", "level3", "level4", "onlySearchIn"].indexOf(key) != -1) {
            var obj = _searchDataMapping[key];
            if (_.isNull(obj)) {
                return;
            }
            var entry = _self._createEntry(obj.param, array, obj.type);
            map.push(entry);
        } else if ("facetCheckedOption" == key) {
            var opts =[];
            for (var i = 0; i < array.length; i++) {
                var facetChkOption = array[i];
                var str = facetChkOption.facet + ":" + facetChkOption.value;
                opts.push(str);
            }
            var entry = _self._createEntry("facets", opts, "xs:string");
            map.push(entry);
        } else if ("facets" == key) {
            var opts =[];
            
            for (var key in array) {
                opts.push(array[key]);
            }
            var entry = _self._createEntry("facet-options-selected", opts, "xs:string");
            map.push(entry);
        } else {
        }
    };
};