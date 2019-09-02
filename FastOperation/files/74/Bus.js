/**
 * Creates an object to handle the events in the application.
 */
var bus = {
    /**
     * The events will use the document object
     */
    obj: $(document),
    /**
     * Indicate if is debugging.
     */
    isDebugging: false,
    /**
     * All the possible events.
     */
    event: {
        HIDE_VIEW: "HideViewEvent",
        SORT_BY_CHANGE: "SortByChangeEvent",
        SHOW_VIEW: "ShowViewEvent",
        RESULT_RESPONSE: "ResultResponseEvent",
        SCROLL_CHANGE: "ScrollChangeEvent",
        PREV_PAGE: "PreviousPageEvent",
        NEXT_PAGE: "NextPageEvent",
        SELECT_PAGE: "SelectPageEvent",
        NEW_SEARCH: "setNewSearchIndicator",
        EXPAND_RESULTS: "expandResults",
        USER_SEARCH: "UserSearchEvent",
        FACET_RESPONSE: "FacetResponseEvent",
        FACET_SORT_CHANGE: "FacetSortChangeEvent",
        FACET_MORE_CLICK: "FacetMoreClickEvent",
        FACET_CHECK_CHANGE: "FacetCheckChangeEvent",
        FACET_AUTHOR_DETAILS_CLICK: "FacetAuthorDetailsClickEvent",
        FACET_AUTHOR_DETAILS_RESPONSE: "FacetAuthorDetailsResponseEvent",
        SAVE_SEARCH: "UserSaveEvent",
        ONE_FACET_VALUE: "valuesForOneFacet",
        CLEAR_FACET_SELECTED: "clearFacetsSelected"
    },
    /**
     * Subscribes a new handler.
     */
    subscribe: function (eventName, handler) {        
        $(this.obj).bind(eventName, handler);
    },
    /**
     * Unsubscribes a handler.
     */
    unsubscribe: function (eventName, handler) {        
        $(this.obj).unbind(eventName, handler);
    },
    /**
     * Publishes an event. Should be an object.
     */
    publish: function (eventName, data) {        
        $(this.obj).trigger(eventName, data);
    }
};
