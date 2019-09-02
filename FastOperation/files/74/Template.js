
var Template = {
};

$(function () {
    Template = {
        resultRowTpl: $("#search-result-row").html(),
        resultHitTpl: $("#search-result-hit").html(),
        snippetHighlightedTpl: $("#search-result-snippet-highlighted").html(),
        xinfoTpl: $("#search-result-snippet-xinfo").html(),
        pdfLinkTpl: $("#search-result-snippet-pdf").html(),
        htmlLinkTpl: $("#search-result-snippet-html").html(),
        editorspickTpl: $("#search-result-snippet-editors-pick").html(),
        elementVisibleTpl: $("#search-result-element-visible").html(),
        elementHiddenTpl: $("#search-result-element-hidden").html(),
        nbspTpl: $("#search-result-element-nbsp").html(),
        facetTpl: $("#search-result-facet").html(),
        facetMoreTpl: $("#search-result-facet-more").html(),
        detailTpl: $("#search-result-facet-detail").html(),
        facetValueTpl: $("#search-result-facet-value").html(),
        facetClassTpl: $("#search-result-facet-class").html(),
        facetClassStyleNormalTpl: $("#search-result-facet-style-normal").html(),
        facetSortTpl: $("#search-result-facet-sort-popup").html(),
        moreTermValueTpl: $("#more-term-facet-value").html(),
        moreTermSelTpl: $("#more-term-selected").html(),
        pageSizeSelected: $("#template-pagination-selected-page-size").html(),
        pageSizeUnselected: $("#template-pagination-unselected-page-size").html(),
        pageSizeSelectorNumberUnselected: $("#template-pagination-unselected-page-number").html(),
        pageSizeSelectorNumberDisabledUnselected: $("#template-pagination-disabled-unselected-page-number").html(),
        pageSizeSelectorNumberSelected: $("#template-pagination-selected-page-number").html(),
        pageSizeSelector: $("#template-page-size-selector").html(),
        facetTplBasics: $("#search-result-facet-basics").html(),
        facetTplTerms: $("#search-result-facet-terms").html(),
        //#901 fixes
        facetTplJournalProceedings: $("#search-result-facet-journal-proceedings").html(),
        facetTplContent: $("#search-result-facet-content").html(),
        facetPublications: $("#facet-publications").html(),
        filterSearch: $("#filter-search").html(),
        filterSelectedTpl: $("#filter-selected").html(),
        sortPublicationTpl: $("#publication-sort-template").html(),
        sortYearTpl: $("#year-sort-template").html(),
        sortOtherTpl: $("#author-topic-sort-template").html(),
        morePopUpTpl: $("#more-pop-up-template").html(),
        loadGifTpl: $("#loading-gif-template").html(),
        //allNSepTpl: $("#all-plus-separator-template").html(),
        threeColFacetTpl: $("#facet-more-new-content").html(),
        moreTermsFacetTpl: $("#facet-more-terms-div").html(),
        moreTermsListTpl: $("#facet-more-terms-list").html(),
		moreTermColumHeaderTpl: $("#more-topic-column-header").html()
    };
});
