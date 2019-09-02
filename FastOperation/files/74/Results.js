//	return function() {
var Results = function () {
    
	// #904 added to validates if the user click on the page links
	var pageMove = false;

    var _self = this;
    var numResult = 0;
    var maxResults = 0;
    var auxPage = 1;
    var isNewSearch = false;
    var totalResults = 0;
    this.pagination = new Pagination();
    
    
    this.init = function () {
        bus.subscribe(bus.event.RESULT_RESPONSE, _.bind(_self.onResultResponse, _self));
        bus.subscribe(bus.event.NEW_SEARCH, _.bind(_self.onNewSearchResult, _self));
        _self.attachHandlers();
    };
    
    this.attachHandlers = function () {
        
        
        var clickFunction = function (event) {
            event.preventDefault();
            var pageSize = $(event.target).attr('class').split(" ")[0].split("_")[2];
                        
            if (pageSize && pageSize != _self.pagination.getCurrentPageSize()) {
                var selected = "";
                var unselected = "";
                $(".page_size_dropdown").empty();
                for (var i = 0; i < Constants.PAGE_SIZES.length; i++) {
                    if (Constants.PAGE_SIZES[i] == pageSize) {
                        selected += _.template(Template.pageSizeSelected, {
                            size: pageSize
                        });
                    } else {
                        unselected += _.template(Template.pageSizeUnselected, {
                            size: Constants.PAGE_SIZES[i]
                        });
                    }
                }
                var pageSizeSelector = _.template(Template.pageSizeSelector, {
                    selected: selected, unselected: unselected
                });
                $(".page_size_dropdown").append(pageSizeSelector);
                $("a[class*='page_size']").click(clickFunction);
                _self.pagination.setCurrentPageSize(pageSize);
                
                if (_self.pagination.getTotalNumberOfResults() > 0) {
                    bus.publish(bus.event.SELECT_PAGE, {
                    });
                }
            }
        };
        $("a[class*='page_size']").click(clickFunction);
    };
    
    this.onNewSearchResult = function (ev, data) {
        _self.pagination.setCurrentSelectedPage(1);
        isNewSearch = true;
    };
    
    this.onResultResponse = function (ev, data) {
        
        maxResults = parseInt(data.total);
        
        $("#results").empty();
        $("#results").scrollTop();
        
        $(".pageNumbers").empty();
        
        if (! data.isScrolling) {
            //FLX 2014-04-10
            Config.prevScroll = 0;
            numResult = maxResults;
            auxPage = 1;
        }
        //Pagination events..:
        _self.pagination.setTotalNumberOfResults(maxResults);
        $(".pageNumbers").html(_self.pagination.getTemplateByPageNumber());
        var clickFunction = function (event) {
            // #904 added to validates if the user click on the page links
            pageMove = true;
            event.preventDefault();
            if (Constants.ISNEWSEARCH) {
                $(".pageNumbers").html(_self.pagination.getTemplateByPageNumber("1"));
            } else {
                $(".pageNumbers").html(_self.pagination.getTemplateByPageNumber($(event.target).data('value')));
            }
            bus.publish(bus.event.SELECT_PAGE, {
            });
        };
        
        $(".pageNumbers > li").click(clickFunction);
        
        var start = parseInt(data.start);
        this.showArticles(data.result, start);
        
        if (isNewSearch) {
            totalResults = numResult;
            isNewSearch = false;
        }
        // #904 added to validates if the user click on the page links
        if (facetClick) {
            pageMove = false;
            facetClick = false;
        }
        // #904 added to validates if the user click on the page links
        if (! pageMove) {
            $("#resultCount").html(numResult + " results (filtered) of " + totalResults + " total results    ");
        }
        
        viewControl = false;
        
        _self.initializeSnippetLinks(start);
        
        $(".sri-extended").css("display", "none");
        
        $(".expandButton").click(function (ev) {
            $("#" + $(ev.target).attr("name")).toggle();
            
            if ($(ev.target).attr("src") == 'icon_expand.png') {
                $(ev.target).attr("src", 'collapse_40b.png');
            } else {
                $(ev.target).attr("src", 'icon_expand.png');
            }
        });
        $("#loadingIndicator").hide();
    };
    
    this.initializeSnippetLinks = function (start) {
        for (var i = 0; i < _self.pagination.getCurrentPageSize();
        i++) {
            $("a[id|='prev-" + (i + start) + "']").each(function (index, value) {
                
                $(value).click(function (event) {                    
                    event.preventDefault();
                    var matches = $(event.target).parent().parent().find("p");
                    
                    var actual = 0;
                    $.each(matches, function (index, match) {
                        if ($(match).css("display") == "inline") {
                            actual = index - 1;
                            $(match).css("display", "none");
                        }
                    });
                    if (actual == 0) {
                        $(event.target).css("display", "none");
                    }
                    if (actual < matches.length - 1) {
                        $("#next" + event.target.id.replace("prev", "")).css("display", "inline");
                    }
                    $(matches[actual]).css("display", "inline");
                });
            });
            $("a[id|='next-" + (i + start) + "']").each(function (index, value) {
                $(value).click(function (event) {                    
                    event.preventDefault();
                    var matches = $(event.target).parent().parent().find("p");
                    
                    var actual = 0;
                    $.each(matches, function (index, match) {
                        if ($(match).css("display") == "inline") {
                            actual = index + 1;
                            $(matches[index]).css("display", "none");
                        }
                    });
                    if (actual == matches.length - 1) {
                        $(event.target).css("display", "none");
                    }
                    if (actual > 0) {
                        $("#prev" + event.target.id.replace("next", "")).css("display", "inline");
                    }
                    $(matches[actual]).css("display", "inline");
                });
            });
        }
    }
    
    this.showArticles = function (articles, start) {
        
      
        if (articles) {
            $.each(articles, function (index, value) {
                var snippets = value.snippet.match;
                
                var parameters = {
                    indexID: index,
                    documentUri: value.data.imgUri, // changed by Josh to retrieve OIB sytle URI
                    path: value.data.path,
                    year: value.data.years,
                    title: (value.data.title.slice(-1)=='*') ? value.data.title.substring(0,value.data.title.length-1) : value.data.title,
                    authors: value.data.author,
                    name: value.data.name.replace("__","<strong>").replace("___","</strong>"),
                    abstract: value.data.abstracts,
                    searchHits: _self.getResult(snippets),
                    doi: _self.getDoi(value.data.doi),
                    access: _self.getAccessClass(value.data.access),
                    imgLink: _self.getImgLinks(value.data.imgUri),
                    xinfo: _self.createExtraInfo(value.data.binaries, value.data.citations, value.data.editorspick, value.data.spotlight),
                    pdfLinks: _self.getPdfLinks(value.data.imgUri, value.data.path),
                    htmlLinks: _self.getHtmlLinks(value.data[ "has-html"], value.data.imgUri, value.data.path),
                };
                var html = _.template(Template.resultRowTpl, parameters);
                $("#results").append(html);
            });
        }
    };
    
    this.getResult = function (snippets) {
        var hightlightRegExp = new RegExp("\\<search\\:highlight[^\\>]*\\>([^\\<]*)\\</search\\:highlight\\>", "i");
        var snippetText = "";
        for (var i = 0; i < snippets.length; i++) {
            var text = snippets[i].value;
            var result = hightlightRegExp.exec(snippets[i].value);
            while (result) {
                text = text.replace(result[0], "<strong>" + result[1] + "</strong>");
                result = hightlightRegExp.exec(text);
            }
            snippetText += _.template(Template.resultHitTpl, {
                hitText: text
            });
        }
        return snippetText;
    };
    
    this.getDoi = function (doi) {
        return doi == "" ? _.template(Template.nbspTpl, {
        }): "doi: " + doi;
    };
    this.getAccessClass = function (accessCode) {
        return accessCode.trim() == "closed" ? "": "icon-open-access icon-green";
    };
    
    this.getImgLinks = function (path) {
        var output = "/getThumbnail.cfm?uri="+path+"&s=n";
        return output;
    };
    
    this.createExtraInfo = function (suppl, cites, ep, spot) {
    	var xstring = ""; 
		var showcitations = false;
		sortoptionselected = $('.selViewSortBy option').filter(':selected').val();
		if (sortoptionselected.lastIndexOf("citation", 0) === 0 && cites != 0 && cites != "") showcitations = true;
		
		if (suppl > 0) {
			xstring += "Suppl. Mat. ("+suppl+")";
		}
		if (showcitations == true) {
			if (xstring != "") xstring += "; ";
			xstring += "Cited by ("+cites+")";
		}
		if (ep == 1) {
			if (xstring != "") xstring += "; ";
			xstring += "Editors&#39; Pick";
		}
		if (spot == 1) {
			if (xstring != "") xstring += "; ";
			xstring += "Spotlight";
		}
		return xstring != "" ? _.template(Template.xinfoTpl, { xinfo: xstring }) : "";
    };
    
    this.getPdfLinks = function (uri, path) {
        var pdfUri = path + "viewmedia.cfm?URI=" + uri + "&seq=0&origin=search";
        return _.template(Template.pdfLinkTpl, {
            pdfUri: pdfUri
        });
    };
    
    this.getHtmlLinks = function (hasHtml, uri, path) {
        var htmlUri = path + "viewmedia.cfm?URI=" + uri + "&seq=0&html=true&origin=search";
        return hasHtml === "true" ? _.template(Template.htmlLinkTpl, {
            htmlUri: htmlUri
        }): "";
    };
    
    this.hasHTML = function (has1) {
        if (has1 === "true") return " | ";
        else return "";
    };
    
    /**
     * Shows the next snippet.
     * @param id the cell id
     * @param direction indicate if is a forward
     */
    this.moveSnippet = function (id, direction) {
        var self = $("#" + id).parent().find("p[style!='display: none;']");
        var next;
        var directionShow;
        if (direction) {
            next = self.next("p");
            directionShow = {
                direction: "right"
            };
            $("#prev-" + id).show();
        } else {
            next = self.prev("p");
            directionShow = {
                direction: "left"
            };
            $("#next-" + id).show();
        }
        if (next.length == 0) {
            return;
        }
        if (direction && next.next("p").length == 0) {
            $("#next-" + id).hide();
        } else if (! direction && next.prev("p").length == 0) {
            $("#prev-" + id).hide();
        }
        self.hide();
        next.show("slide", directionShow);
    }
};
