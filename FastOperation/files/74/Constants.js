//define(["jquery", "underscore"], function() {
//return {
var Constants = {
    FACET: {
        YEAR: "year",
        JOURNAL: "journal",
        AUTHORS: "author",
        CONTENT_TYPE: "contentType",
        LEVEL2: "level2",
        LEVEL3: "level3",
        LEVEL4: "level4",
        NORMALIZED: "normalized",
        PROCEEDING: "proceeding"
    },
    test: "test",
    PAGE_SIZES:[ '20', '40', '60', '80', '100'],
    DEFAULTFACETS: {
        "sort-year": "year:item-order:descending",
        "sort-journal": "journal:frequency-order:descending",
        "sort-author": "author:frequency-order:descending",
        "sort-proceeding": "proceeding:frequency-order:descending",
        "sort-level2": "level2:frequency-order:descending",
        //"sort-level3": "level3:frequency-order:descending",
        //"sort-level4": "level4:frequency-order:descending",
        "sort-normalized": "normalized:item-order:ascending"
    },
    DEFAULTFACETSDOS: {
        "sort-year": "year:item-order:descending",
        "sort-journal": "journal:frequency-order:descending",
        "sort-author": "author:frequency-order:descending",
        "sort-proceeding": "proceeding:frequency-order:descending",
        "sort-level2": "level2:frequency-order:descending",
        //"sort-level3": "level3:frequency-order:descending",
        //"sort-level4": "level4:frequency-order:descending",
        "sort-normalized": "normalized:item-order:ascending"
    },
    SEARCH: {
        "minCharsToSearch": 2,
        "formParamCount": 13
    },
    CHECKEDFACETS:[],
    ISNEWSEARCH: true
};