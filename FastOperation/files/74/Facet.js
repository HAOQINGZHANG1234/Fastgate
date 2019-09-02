// #904 added to validates if the user click on the page links
var facetClick = false;

var Facet = function () {
	this.topics = new Topics("facet");
    var _self = this;
    var arrayAux =[];
    //used to check again when expanding a details.
    var arrayNormalizedCheckedObjectsAgain =[];
    var pubChecked = null;

    /**
     * The facet labels.
     */
    var FACET_LABELS = {
    };
    FACET_LABELS[Constants.FACET.AUTHORS] = "Authors";
    FACET_LABELS[Constants.FACET.PROCEEDING] = "Proceeding";
    FACET_LABELS[Constants.FACET.JOURNAL] = "Journal";
    FACET_LABELS[Constants.FACET.LEVEL2] = "Terms";
    FACET_LABELS[Constants.FACET.YEAR] = "Year";
    
    /**
     * The cache for the sort facet options
     */
    var sortFacetCache = {
    };
    sortFacetCache[Constants.FACET.AUTHORS] = "author:frequency-order:descending";
    sortFacetCache[Constants.FACET.PROCEEDING] = "proceeding:frequency-order:descending";
    sortFacetCache[Constants.FACET.JOURNAL] = "journal:frequency-order:descending";
    sortFacetCache[Constants.FACET.LEVEL2] = "level2:frequency-order:descending";
    sortFacetCache[Constants.FACET.YEAR] = "year:item-order:descending";
    sortFacetCache[Constants.FACET.NORMALIZED] = "normalized:item-order:ascending";
    
    /**
     * Tracks which facet values are checked.
     */
    var checkedFacets = {
    };
    
    /**
     * Save the last visible state of a facet, before sorting.
     */
    var displayAll = {
    };
    
    /**
     * Facet separator HTML 
     */
    var selectedSeparator = "<hr class='sf-authors-search'/>";
    
    var selectedFacets =[];

	/**
	 * Save current user mode - multi mode for selection within the "more" popup
	 */
	var termMulti = false;
    /**
     * Subscribe new handlers.
     */
    this.init = function () {
        bus.subscribe(bus.event.FACET_RESPONSE, _.bind(_self.onFacetResponse, _self));
        bus.subscribe(bus.event.FACET_AUTHOR_DETAILS_RESPONSE, _.bind(_self.onFacetAuthorDetailsResponse, _self));
        bus.subscribe(bus.event.USER_SEARCH, _.bind(_self.onUserSearch, _self));
        bus.subscribe(bus.event.SELECT_PAGE, _.bind(_self.onSelectedPage, _self));
        bus.subscribe(bus.event.ONE_FACET_VALUE, _.bind(_self.onOneFacetValue, _self));
        bus.subscribe(bus.event.CLEAR_FACET_SELECTED, _.bind(_self.clearFacetsSelected, _self));
    };
    
    /**
     * This function populates the more pop-up for the FACETS, it also initialize the events for each button in the box
     * and the selectize input inside the box.
     * @param {event} ev - Event that launched the action.
     * @param {Object} data - This object contains the facet type, name and options.
     */
    this.onOneFacetValue = function (ev, data) {
        var facetType = data.facets[0].name;
        var htmlToReplace = "";
        var arrayChecked =[];
        var arrayCheckedNormalized =[];
        var preChecked =[];
        var preCheckedNormalized =[];
        preChecked = $("input[name='chkFacet-" + facetType + "']:checked");
        preCheckedNormalized = $("input[name='chkFacet-normalized']:checked");
        $(preCheckedNormalized).attr('checked', 'checked');
        for (var i = 0; i < preChecked.length; i++) {
            arrayChecked.push($(preChecked[i]).attr("data-value"));
        }
        for (var i = 0; i < preCheckedNormalized.length; i++) {
            var containerId = $(preCheckedNormalized[i]).data('value').split(',')[0];
            var liToCopy = $(preCheckedNormalized[i]).parent().prop('outerHTML');
            arrayCheckedNormalized.push({
                containerId: containerId, liToCopy: liToCopy
            });
        }
        
		// Special handling of level2 "more" popup
        if (facetType == 'level2') {
			_self.populateTermHierarchy(data.facets[0],data.facets[1],data.facets[2]);
			_self.addPreCheckedTerms();
			var firstCol = _self.topics.getMoreTermCol(2,null);
			$("#moreUl-all-" + facetType).children().remove();
			$("#moreUl-all-" + facetType).append(firstCol).children().addClass('displayNone');
			_self.personalizePopUps(facetType);
			_self.topics.initializeMoreTerms();
		}
		else {
			var popUpSelectize = $("#input-all-" + facetType);
			var facetParams = _self.getBasicFacetValues(data.facets[0], true);
			htmlToReplace = _.template(Template.morePopUpTpl, facetParams);
			$("#moreUl-all-" + facetType).children().remove();
			$("#moreUl-all-" + facetType).append(htmlToReplace).children().addClass('displayNone');
			_self.personalizePopUps(facetType);
			$("#moreUl-all-" + facetType + "> div >div >ul>li>input").prop("checked", false);

			//adding the options to the selectize:
			var arrayValues = $("#moreUl-all-" + facetType + "> div >div >ul>li");
			$.each(arrayValues, function (index, entry) {
				var id = "selectize_" + $(entry).find('input').prop('id');
				var label = $.trim($(entry).find('input').siblings("label").text());
				popUpSelectize[0].selectize.addOption({
					id: id, label: label
				});
			});
			//checking the prechecked values and adding them to the input.
			arrayChecked.forEach(function (entry) {
				var id = $("#moreUl-all-" + facetType + " > div >div >ul>li>input[data-value='" + entry + "']").prop("id");
				$("#moreUl-all-" + facetType + " > div >div >ul>li>input[data-value='" + entry + "']").prop("checked", true)
				if (id != undefined) {
					popUpSelectize[0].selectize.addItem("selectize_" + id);
				}
			});
			//checking the precheckedNormalized in case
			if (arrayCheckedNormalized.length > 0) {
				$(arrayCheckedNormalized).each(function (index) {
					var value = arrayCheckedNormalized[index].containerId;
					$("#moreUl-all-author input[data-value|='" + value + "']").siblings('ul').append(arrayCheckedNormalized[index].liToCopy).show();
				});
			}
			//Initializing CLICK events.
			$("#moreUl-all-" + facetType + " label").click(function (event) {
				event.preventDefault();
				var checkbox = $("#moreUl-all-" + facetType + " #" + $(event.target).attr("for"));
				checkbox.prop("checked", ! checkbox.is(':checked'));
				var id = "selectize_" + checkbox.prop("id");
				if (checkbox.is(':checked')) {
					popUpSelectize[0].selectize.addItem(id);
				} else {
					popUpSelectize[0].selectize.removeItem(id);
				}
			});
        
			$("#moreUl-all-" + facetType + " input").click(function (event) {
				var id = "selectize_" + $(event.target).prop("id");
				if ($(event.target).is(':checked')) {
					popUpSelectize[0].selectize.addItem(id);
				} else {
					popUpSelectize[0].selectize.removeItem(id);
				}
			});
		}
        
        $("#cancel-all-" + facetType).click(function (event) {
            event.preventDefault();
            $("#moreUl-all-" + facetType + "> div").remove();
            if (popUpSelectize) popUpSelectize[0].selectize.clearOptions();
            // $("#cancel-all-" + facetType).parent().css("display", "none");
            $("#more-all-" + facetType).attr("title", "collapsed");
            $("#cancel-all-" + facetType).unbind('click');
            $("#apply-all-" + facetType).unbind("click");
            $("#cancel-all-" + facetType).off('click');
        });
        
        $("#apply-all-" + facetType).click(function (event) {
            event.preventDefault();
            
            var searchOBJ = new Search();
			if (facetType === "level2") {
				var selectedList = $("#moreSelectedList div a");
				if (selectedList.length > 1) termMulti = true;
				else termMulti = false;
				(true || termMulti == false) ? $('#all-level2').parent().hide() : $('#all-level2').parent().show();
				$.each($("input[name='chkFacet-level2'],input[name='chkFacet-level3'],input[name='chkFacet-level4']").parent(), function(index, value) {
					if (!($(this).hasClass('selected-topic')) || $(this).hasClass('facet-inside-l2') || $(this).hasClass('facet-inside-l3') || $(this).hasClass('facet-inside-l4'))
						$(this).remove();
				});
				$("#moreUl-all-" + facetType + "> div").remove();
				for (var i=selectedList.length-1; i>=0; i--) {
					var entry = $(selectedList[i]);
					// Add facet to left list of facets
					var datavalue = entry.attr("data-value");
					var cnt = entry.attr("count");
					var split = datavalue.split("|");
					var label =  split[split.length-1];
					var info = {datavalue: datavalue, count:cnt, label:label, acronym:""}
					var level = "level" + (split.length + 1);

					var hidedupe = false;
					// hide duplicate leaf values
					for (var k=i-1; k>=0; k--) {
						var preval = $(selectedList[k]);
						if (preval.attr("data-value").split('|').pop() == label) { hidedupe = true; }
					}

					if (hidedupe == false) {
						var newfacet = _self.createFacetValue( 9999, info, level, i, false, false, true);
						// Insert facets just above the "more topics" link
						$("#more-all-level2").parent().before(newfacet);
						$("input[name|='chkFacet'][data-value='" + entry.attr("data-value") + "']").prop("checked", true);
					}
						
					// If selecting only one facet from multi-select, make single select by adding level2 and perhaps level3
					for (var j=2; j>=1; j--) {
						if (selectedList.length == 1 && split.length > j) {
							var info = {datavalue: split[0]+(j==2?"|"+split[1]:""), count:cnt, label:split[j-1], acronym:""}
							var newfacet = _self.createFacetValue( 9999, info, "level"+(j+1), 0, false, false, true);
							$("input[id='all-level2']").parent().after(newfacet);
							$("input[name|='chkFacet'][data-value='" + split[0]+(j==2?"|"+split[1]:"") + "']").prop("checked", true);
						}
					}
					
					if (selectedList.length == 1 && split.length > j) var newlevel = "level"+(split.length+1);
				}
			}
			else {
				var journalFilter = document.getElementById("filter_all_jo"),
				proceedingsFilter = document.getElementById("filter_all_pro");
				if (facetType === "proceeding" && ! proceedingsFilter) {
					searchOBJ.creatingFiltersProceedingJournalFacet("Proceedings", "all_pro");
				} else {
					if (facetType === "journal" && ! journalFilter) {
						searchOBJ.creatingFiltersProceedingJournalFacet("Journals", "all_jo");
					}
				}
				
				// Special code for secondary author details expansion
				arrayNormalizedCheckedObjectsAgain =[];
				var arrayNormalizedChecked = $("#moreUl-all-author input[id^='normalized']:checked");
				$(arrayNormalizedChecked).attr("checked", 'checked');
				var arrayNormalizedCheckedObjects =[];
				$(arrayNormalizedChecked).each(function (index) {
					var containerId = $(arrayNormalizedChecked[index]).closest('ul').attr('id');
					var parentAuthor = $(arrayNormalizedChecked[index]).parent().parent().prevAll('input').attr('data-value');
					var parentCount = $(arrayNormalizedChecked[index]).parent().parent().prevAll('label').text();
					parentCount = parentCount.substring(parentCount.indexOf('(')+1,parentCount.indexOf(')'));
					var liToCopy = $(arrayNormalizedChecked[index]).parent().prop('outerHTML');
					var valueToSearch = $(arrayNormalizedChecked[index]).data('value');
					arrayNormalizedCheckedObjects.push({
						parent: containerId, liToCopy: liToCopy, parentAuthor: parentAuthor, parentCount: parentCount
					});
					arrayNormalizedCheckedObjectsAgain.push({
						valueToSearch: valueToSearch, liToCopy: liToCopy
					});
				});
				
				var checkedInside =[];
				checkedInside = $("#moreUl-all-" + facetType + " > div >div >ul> li > input:checked");
				$("input[name='chkFacet-" + facetType + "']").prop("checked", false);
				if (facetType == 'author') $("input[name='chkFacet-normalized']").prop("checked", false);
				$("#moreUl-all-" + facetType + "> div").remove();
				var numfacets = $("input[name='chkFacet-" + facetType + "']").length-1;
				for (var i=0; i<checkedInside.length; i++) {
					var entry = $(checkedInside[i]);
					if (!$("input[data-value='" + entry.attr("data-value") + "']").length) {
						// If facet wasn't displayed in the short list of left facets, add it now
						numfacets++;
						var labeltext = entry.next().text();
						var cnt = labeltext.substring(labeltext.indexOf('(')+1,labeltext.indexOf(')'));
						var label =  labeltext.substring(0,labeltext.indexOf('(')).trim();
						var acronym = entry.attr("acronym");
						var info = {datavalue: entry.attr("data-value"), count:cnt, label:label, acronym:acronym}
						var newfacet = _self.createFacetValue( 9999, info, facetType, numfacets, false, false);
						$("input[name='chkFacet-" + facetType + "']").last().parent().after(newfacet);
					}
					$("input[name|='chkFacet'][data-value='" + entry.attr("data-value") + "']").prop("checked", true);
				}

				// Special handling of secondary author details expansion
				if (facetType === "author" && arrayNormalizedChecked.length > 0) {
					$("ul[id^='details-container']").empty();
					$(arrayNormalizedCheckedObjects).each(function (index) {
						if (!$('#facet-author-values').find('ul[data-value="'+arrayNormalizedCheckedObjects[index].parentAuthor+'"]').length) {
							// If facet wasn't displayed in the short list of left facets, add it now
							numfacets++;
							var info = {datavalue: arrayNormalizedCheckedObjects[index].parentAuthor, label: arrayNormalizedCheckedObjects[index].parentAuthor, count: arrayNormalizedCheckedObjects[index].parentCount}
							var newfacet = _self.createFacetValue( 9999, info, 'author', numfacets, false, false);
							$("input[name='chkFacet-author']").last().parent().after(newfacet);
						}
						$('#facet-author-values').find('ul[data-value="'+arrayNormalizedCheckedObjects[index].parentAuthor +'"]').append(arrayNormalizedCheckedObjects[index].liToCopy).show();
					});
				}
			}

			if (facetType == 'level2') {
				$("input[name='chkFacet-level2'],input[name='chkFacet-level3'],input[name='chkFacet-level4']").unbind("click");
				_self.initializeBoxesAndOther('level2');
				_self.initializeBoxesAndOther('level3');
				_self.initializeBoxesAndOther('level4');
				
				_self.changeChkFacet(false, termMulti == true ? 'topicspopup' : (newlevel ? newlevel : facetType)); // If 'more topics' popup, send custom triggeredBy text
			}
			else {
				$("input[name='chkFacet-"+facetType+"']").unbind("click");
				if (facetType == 'author') _self.alignDetailsLink();
				if (facetType == 'proceeding') $("input[name='chkFacet-proceeding']").click(_self.onFourthLevel);
				if (facetType == 'journal') $("input[name='chkFacet-journal']").click(_self.onFourthLevel);
	            _self.initializeBoxesAndOther(facetType);
				_self.changeChkFacet(false, facetType);
			}
            if (popUpSelectize) popUpSelectize[0].selectize.clearOptions();
            $("#apply-all-" + facetType).unbind("click");
            $("#cancel-all-" + facetType).unbind('click');
            $("#apply-all-" + facetType).off("click");
            //$("#apply-all-" + facetType).parent().css("display", "none");
            $("#more-all-" + facetType).attr("title", "collapsed");
        });
        
        $("#loadingIndicator").hide();
    };
    
    /**
     * This function applies different styles and custom behavior to each popup
     * @param {String} facetType - Name of facet type selected.
     */
    this.personalizePopUps = function (facetType) {
        switch (facetType) {
            case "journal":
            var arrayLi = $("#moreUl-all-" + facetType).children('li');
            var ThreeCols = _self.passToThreeColumnsYears(facetType, arrayLi);
            var ehtml = _.template(Template.threeColFacetTpl, {
                val1: ThreeCols[0], val2: ThreeCols[1], val3: ThreeCols[2]
            });
            $("#moreUl-all-journal").children().remove();
            $("#moreUl-all-journal").append(ehtml).find('li').removeClass('displayNone');
            break;

            case "proceeding":
            var arrayLi = $("#moreUl-all-" + facetType).children('li');
            var ThreeCols = _self.passToThreeColumnsYears(facetType, arrayLi);
            var ehtml = _.template(Template.threeColFacetTpl, {
                val1: ThreeCols[0], val2: ThreeCols[1], val3: ThreeCols[2]
            });
            $("#moreUl-all-proceeding").children().remove();
            $("#moreUl-all-proceeding").append(ehtml).find('li').removeClass('displayNone');
            break;

            case "author":
            var arrayLi = $("#moreUl-all-" + facetType).children('li');
            var ThreeCols = _self.passToThreeColumnsAuthors(facetType, arrayLi);
            _self.passToThreeColumnsAuthors(facetType, arrayLi);
            var ehtml = _.template(Template.threeColFacetTpl, {
                val1: ThreeCols[0], val2: ThreeCols[1], val3: ThreeCols[2]
            });
            $("#moreUl-all-author").children().remove();
            $("#moreUl-all-author").append(ehtml).find('li').removeClass('displayNone');
            _self.alignDetailsLink();
            _self.initializeDetails(true);
            break;

            case "year":
            var arrayLi = $("#moreUl-all-" + facetType).children('li');
            var ThreeCols = _self.passToThreeColumnsYears(facetType, arrayLi);
            var ehtml = _.template(Template.threeColFacetTpl, {
                val1: ThreeCols[0], val2: ThreeCols[1], val3: ThreeCols[2]
            });
            $("#moreUl-all-year").children().remove();
            $("#moreUl-all-year").append(ehtml).find('li').removeClass('displayNone');
            break;

            case "level2":
            var arrayLi = $("#moreUl-all-" + facetType).children('li');
            var FirstCol = _self.topics.passToColumnsTerms(arrayLi);
			var col1 = _.template(Template.moreTermsListTpl, {
                val: FirstCol
            });
			var ehtml = _.template(Template.moreTermsFacetTpl, {
                val: col1, name: _self.topics.names.divlist
            });
            $("#moreUl-all-level2").children().remove();
            $("#moreUl-all-level2").append(ehtml).find('li').removeClass('displayNone');
            break;

            default:
            break;
        }
    };
    
    /**
     * This function is to pass all the YEARS facet list to three columns for the popUp
     * @param {String} facetType - Name of facet type selected.
     * @param {Array} arrayLi - Array objects that contains objects to draw the checkboxes in the popUp.
     */
    this.passToThreeColumnsYears = function (facetType, arrayLi) {
        var out =[];
        var str1 = "";
        var str2 = "";
        var str3 = "";
        if (arrayLi.length > 5) {
            var numDiv = Math.ceil(arrayLi.length / 3);
            for (var i = 0; i < numDiv; i++) {
                str1 += $(arrayLi[i]).prop('outerHTML');
            }
            
            for (var i = numDiv; i < numDiv * 2; i++) {
                str2 += $(arrayLi[i]).prop('outerHTML');
            }
            
            for (var i = numDiv * 2; i < arrayLi.length; i++) {
                str3 += $(arrayLi[i]).prop('outerHTML');
            }
        } else {
            for (var i = 0; i < arrayLi.length; i++) {
                str1 += $(arrayLi[i]).prop('outerHTML');
            }
        }
        out.push(str1);
        out.push(str2);
        out.push(str3);
        
        return out
    };
    
    /**
     * This function is to pass all the AUTHORS facet list to three columns for the popUp
     * @param {String} facetType - Name of facet type selected.
     * @param {Array} arrayLi - Array objects that contains objects to draw the checkboxes in the popUp.
     */
    this.passToThreeColumnsAuthors = function (facetType, arrayLi) {
        auxArrayLi =[];
        var out =[];
        var str1 = "<li><h6 class='sf-authors-bold'>Matching your search</h6></li> ";
        var str2 = "<li><h6 class='sf-authors-bold'>Co-authors</h6></li> ";
        var str3 = "<li><h6>&nbsp;</h6></li>";
        var numDiv = Math.ceil(arrayLi.length / 2);
        for (var i = 20; i >= 0; i--) {
            if ($(arrayLi[i]).children('label').hasClass('sf-authors-bold')) {
                $(arrayLi[i]).children('label').removeClass('sf-authors-bold');
                auxArrayLi.push(arrayLi[i]);
                arrayLi.splice(i, 1);
            }
        }
        for (var i = auxArrayLi.length -1; i >= 0; i--) {
            str1 += $(auxArrayLi[i]).prop('outerHTML');
        }
        
        for (var i = 0; i < numDiv; i++) {
            str2 += $(arrayLi[i]).prop('outerHTML');
        }
        
        for (var i = numDiv; i < arrayLi.length; i++) {
            str3 += $(arrayLi[i]).prop('outerHTML');
        }
        out.push(str1);
        out.push(str2);
        out.push(str3);
        
        return out
    };
    
    this.populateTermHierarchy = function (level2, level3, level4) {
		var l2 = level2["facet-value"];
		var l3 = level3["facet-value"];
		var l4 = level4["facet-value"];
		_self.topics.populateTermHierarchy(l2, l3, l4);
		_self.topics.initializeMoreTermsAutocomplete();
    };
    
    /**
     * Function that runs when the user clicks on the pagination and executes the function to
     * change the facets.
     *
     * @param {event} ev - Event that launched the action.
     * @param {Object} data - This object contains the facet type, name and options.
     */
    this.onSelectedPage = function (ev, data) {
        _self.changeChkFacet(false, '', true);
    };
    
    /**
     * Function that runs when the user clicks on the pagination and executes the function to
     * change the facets.
     *
     * @param {event} ev - Event that launched the action.
     * @param {Object} data - This object contains the facet type, name and options.
     */
    this.onUserSearch = function (ev, data) {
        checkedFacets = {
        };
        displayAll = {
        };
    };
    
    /**
     * Add subitems to authors facets.
     *
     * @param {event} ev - Event that launched the action.
     * @param {Object} data - This object contains the facet type, name and options.
     */
    this.onFacetAuthorDetailsResponse = function (ev, data) {
        var aux = data.isMore ? "#moreUl-all-author": "";
        var field = $(aux + " #details-container-" + data.id);
        field.empty();
        field.append(_self.getFacetValues(5, data[ "facet-value"], false, data.name, true));
        
        if (! data.isMore) {
            _self.initializeGrandChildrenCheckBoxes(field, data.id, data.name, data.isMore);
        }
        if (arrayAux && arrayAux.length > 0) {
            $(arrayAux).each(function (index) {
                field.find("input[data-value='" + $(arrayAux[index]).data('value') + "']").prop('checked', true);
            })
        }
        $("#loadingIndicator").hide();
    };
    
    /**
     * This function is the one which redirects the action after clicking on a more link.
     *
     * @param {event} ev - Event that launched the action.
     */
    this.onMoreFacetClick = function (ev) {
        $("#loadingIndicator").show();
        if ($(ev.target).prop("title") == "collapsed") {
            $(ev.target).prop("title", "expanded");
        } else {
            $(ev.target).prop("title", "collapsed")
        }
        var facetType = $(ev.target).prop("id").split("-")[$(ev.target).prop("id").split("-").length -1];
        if (facetType != 'level2') var popUpSelectize = $("#input-all-" + facetType);
        var facets = _self.getCheckedFacets();
        facets = $.map(facets, function (index, value) {
            return index;
        });
        if ($(ev.target).siblings().css("display") == "none") {
            bus.publish(bus.event.FACET_MORE_CLICK, {
                facetType: facetType, facets: facets
            });
            
            $("#facet-author-values").find(".modal").addClass("sf-expanded-popup-author");
            $("#facet-year-values").find(".modal").addClass("sf-expanded-popup-years");
        } else {
            $("#moreUl-all-" + facetType + "> div").remove();
            $("#moreUl-all-" + facetType + "> li").remove();
            if (popUpSelectize) popUpSelectize[0].selectize.clearOptions();
            $("#apply-all-" + facetType).unbind("click");
            $("#cancel-all-" + facetType).unbind('click');
        }
    };
    
    /**
     * This function is the one which changes the values on the facets on the UI
     *
     * @param {event} ev - Event that launched the action.
     * @param {Object} data - This object contains the facet type, name and options.
     */
    this.onFacetResponse = function (ev, data) {
        var avoid = data.avoid;
        var insideSelectedFacets = false;
        if (selectedFacets.length > 0) {
            selectedFacets.forEach(function (entry) {
                if (entry.facet == avoid || entry.facet == 'normalized') {
                    insideSelectedFacets = true;
                }
            });
        } else if (avoid == 'journal' || avoid == 'proceeding') {
            insideSelectedFacets = true;
        }
		if (avoid == 'topicspopup') insideSelectedFacets = true;
        
        avoid = insideSelectedFacets || data.isSort ? avoid: "";
        
        var rePopulateSurnames = avoid == 'author' || avoid == 'normalized' ? false: true;
        
        rePopulateSurnames = data.isSort ? true: rePopulateSurnames;
        
        rePopulateSurnames = Constants.ISNEWSEARCH ? false: rePopulateSurnames;
        
        if (data.facets) {
            var auxParams = {
            };
            var journalFacet = {
            };
            var proceedingFacet = {
            };
            var yearFacet = {
            };
            var authorFacet = {
            };
            var level2Facet = {
            };
            var level3Facet = {
            };
            var level4Facet = {
            };
            data.facets.forEach(function (entry) {
                switch (entry.name) {
                    case "journal":
                    journalFacet = entry;
                    break;
                    case "proceeding":
                    proceedingFacet = entry;
                    break;
                    case "author":
                    authorFacet = entry;
                    break;
                    case "year":
                    yearFacet = entry;
                    break;
                    case "level2":
                    level2Facet = entry;
                    break;
                    case "level3":
                    level3Facet = entry;
                    break;
                    case "level4":
                    level4Facet = entry;
                    break;
                    default:
                    break;
                }
            });
            var publicationsCondition = ! data.isSort ? (avoid != "proceeding" && avoid != "journal"): !(avoid != "proceeding" && avoid != "journal");
            if (publicationsCondition) {
                $("#contentTypes").empty();
                var proceedingCount = proceedingFacet[ "facet-value"] ? proceedingFacet[ "facet-value"].length: 0;
                var journalCount = journalFacet[ "facet-value"] ? journalFacet[ "facet-value"].length: 0;
                var exHtml = _self.getPublicationValues(proceedingCount, journalCount);
                $("#contentTypes").append(exHtml);
                
                if (journalCount > 0) {
                    var journalParams = _self.getBasicFacetValues(journalFacet, false);
                    journalParams.name = "journals";
                    journalParams.modalTitle = "Journals";
                    journalParams.allId = "all-journal";
                    exHtml = _.template(Template.facetTplJournalProceedings, journalParams);
                    $("#facet-journal-values").append(exHtml);
                }
                
                if (proceedingCount > 0) {
                    var proceedingParams = _self.getBasicFacetValues(proceedingFacet, false);
                    proceedingParams.name = "proceedings";
                    proceedingParams.modalTitle = "Proceedings";
                    proceedingParams.allId = "all-proceeding";
                    exHtml = _.template(Template.facetTplJournalProceedings, proceedingParams);
                    $("#facet-proceeding-values").append(exHtml);
                }
                _self.initializeBoxesAndOther($(proceedingFacet).attr("name"));
                _self.initializeBoxesAndOther($(journalFacet).attr("name"));
                
                $("#facet-journal-values,#facet-proceeding-values").hide();
                _self.initializePopLinks('journal');
                _self.initializePopLinks('proceeding');
                _self.initializeFacetInput('journal');
                _self.initializeFacetInput('proceeding');
                _self.insertSort('journal', 'sortJournal');
                _self.insertSort('proceeding', 'sortProceeding');
                $("#hide-all-journal").click(function () {
                    $("#moreUl-all-journal").toggleClass('displayNone');
                })
                $("#hide-all-proceeding").click(function () {
                    $("#moreUl-all-proceeding").toggleClass('displayNone');
                })
                
                $("#publicationsAll").click(_self.onAllPublicationsChange);
                $("input[id|='facet-publications']").click(_self.onSecondLevel);
                $("input[id='all-proceeding']").click(_self.onThirdLevel);
                $("input[id='all-journal']").click(_self.onThirdLevel);
                $("input[name='chkFacet-proceeding']").click(_self.onFourthLevel);
                $("input[name='chkFacet-journal']").click(_self.onFourthLevel);
                
                $("#facet-journal-show").click(function () {
                    $("#facet-journal-values").toggle();
                    $(".sf-journals .row").toggleClass("expanded");
                    $("#sortJournal .sf-sort").toggleClass("displayNone");
                });
                $("#facet-proceeding-show").click(function () {
                    $("#facet-proceeding-values").toggle();
                    $(".sf-proceedings .row").toggleClass("expanded");
                    $("#sortProceeding .sf-sort").toggleClass("displayNone");
                });
            }

            var topicsCondition = ! data.isSort ? !(avoid == 'topicspopup') : !(avoid != "level2")
            if (topicsCondition) {
                $("#facet-level2-values").empty();
                var topicParams = _self.getTermFacetValues(level2Facet, level3Facet, level4Facet, false);
                if (topicParams) {
                    topicParams.name = "topics";
                    topicParams.allId = "all-level2";
                    exHtml = _.template(Template.facetTplTerms, topicParams);
                } else {
                    exHtml = "";
                }
                $("#facet-level2-values").append(exHtml);
                _self.initializeBoxesAndOther($(level2Facet).attr("name"));
                _self.initializeBoxesAndOther($(level3Facet).attr("name"));
                _self.initializeBoxesAndOther($(level4Facet).attr("name"));
                _self.initializePopLinks('level2');
                _self.insertSort('level2', 'sortTopics');
				(true || termMulti == false) ? $('#all-level2').parent().hide() : $('#all-level2').parent().show();
            }
            
            var authorsCondition = ! data.isSort ? (avoid != "author" && avoid != "normalized"): !(avoid != "author" && avoid != "normalized")
            if (authorsCondition) {
                $("#facet-author-values").empty();
                var authorParams = _self.getBasicFacetValues(authorFacet, false);
                if (authorParams) {
                    authorParams.name = "authors";
                    authorParams.modalTitle = "Authors";
                    authorParams.allId = "all-author";
                    //#901 fixes
                    exHtml = _.template(Template.facetTplBasics, authorParams);
                } else {
                    exHtml = "";
                }
                $("#facet-author-values").append(exHtml);
                _self.initializeBoxesAndOther($(authorFacet).attr("name"));
                _self.initializePopLinks('author');
                _self.initializeFacetInput('author');
                _self.insertSort('author', 'sortAuthor');
            }
            
            var yearsCondition = ! data.isSort ? (avoid != "year"): !(avoid != "year")
            if (yearsCondition) {
                $("#facet-year-values").empty();
                var yearParams = _self.getBasicFacetValues(yearFacet, false);
                if (yearParams) {
                    yearParams.name = "dates";
                    yearParams.modalTitle = "Dates";
                    yearParams.allId = "all-year";
                    exHtml = _.template(Template.facetTplBasics, yearParams);
                } else {
                    exHtml = "";
                }
                $("#facet-year-values").append(exHtml);
                _self.initializeBoxesAndOther($(yearFacet).attr("name"));
                _self.initializePopLinks('year');
                _self.initializeFacetInput('year');
                _self.insertSort('year', 'sortYear');
                $("#input-all-year").parent().addClass('displayNone');
            }
            
            _self.fixSortStyle();
            $("input[id|='all']").unbind('click'); // function may be called multiple times during filtering. unbind previous events.
            $("input[id|='all']").click(_self.onSingleAll);
        }
        
        $('button[name="showHideList"]').click(function (ev) {
            ev.preventDefault();
            $(ev.target).parent().parent().siblings("ul").toggle();
        });
        
        if (data.scrollPosition) {
            $("#facets").scrollTop(data.scrollPosition);
        }
        
        if (arrayNormalizedCheckedObjectsAgain.length > 0) {
            if (rePopulateSurnames) {
                $("ul[id^='details-container']").empty();
                $(arrayNormalizedCheckedObjectsAgain).each(function (index) {
                    var value = arrayNormalizedCheckedObjectsAgain[index].valueToSearch.split(',')[0];
                    $("#facet-author-values input[data-value|='" + value + "']").siblings('ul').append(arrayNormalizedCheckedObjectsAgain[index].liToCopy).show();
                    var auxId = $('input[data-value="' + value + '"]').prop('id');
                    _self.initializeGrandChildrenCheckBoxes($('ul[id^="details-container-' + auxId + '"]'), auxId);
                });
                $("#all-author").prop('checked', false);
                $("#all-author").prop('disabled', false);
            } else {
                $(arrayNormalizedCheckedObjectsAgain).each(function (index) {
                    var value = arrayNormalizedCheckedObjectsAgain[index].valueToSearch.split(',')[0];
                    var auxId = $('input[data-value="' + value + '"]').prop('id');
                    _self.initializeGrandChildrenCheckBoxes($('ul[id^="details-container-' + auxId + '"]'), auxId);
                });
            }
        }
        
        if (! Constants.ISNEWSEARCH) {
            selectedFacets.forEach(function (entry) {
                if (entry.facet == 'journal' || entry.facet == 'proceeding') {
                    $("#publicationsAll").prop("checked", false).prop("disabled", false);
                    $('#facet-publications-' + entry.facet + 's').prop('checked', true);
                    var searchOBJ = new Search();
                    searchOBJ.hideOrShowPublication();
                }
				// Check only the last matching checkbox.  There may be others in the selected facets list which we do not want to check
                $("input[data-value='" + entry.value + "']:last").prop("checked", true);
                var tillName = $("input[data-value='" + entry.value + "']").prop("name");
                var facetType = tillName ? tillName.split("-")[1]: "";
                $("#all-" + facetType).prop("checked", false).prop("disabled", false);
				if (avoid == 'topicspopup') $("#all-level2").prop("checked", false).prop("disabled", false);
                if (facetType == 'normalized') {
                    $("#all-author").prop('checked', false).prop('disabled', false);
                }
            });
            if (pubChecked) {
                $('#' + pubChecked).prop('checked', true);
                $('#publicationsAll').prop('checked', false).prop('disabled', false);
            }
        }
        
        Constants.ISNEWSEARCH = false;
        if ($("#publicationsAll").prop("checked")) {
            $("input[name|='chkFacet-journal'], input[name|='chkFacet-proceeding']").prop("checked", false);
            $("input[id|='all-journal'], input[id|='all-proceeding']").prop("checked", true).prop("disabled", true);
        }
        
        $("#loadingIndicator").hide();
        _self.alignDetailsLink();
        
        if (!($('#chkJournals').prop('checked'))) {
            $('#facet-publications-journals').prop('disabled', true);
        } else if (!($('#chkConferences').prop('checked'))) {
            $('#facet-publications-proceedings').prop('disabled', true);
        }
    };
    
    /**
     * Add class to align the link details
     */
    this.alignDetailsLink = function () {
        $("a.sidebar_more:visible").addClass("link-alignment");
    };
    
    /**
     * The function to insert the sort template and initialize its behavior
     *
     * @param {String} facetType - Name of facet selected to organize the items.
     * @param {String} id - Identifier of html object used for sort.
     */
    this.insertSort = function (facetType, id) {
        //inserting the sort template
        $("#" + id).empty();
        var params = {
            type: facetType
        };
        var exHtml = "";
        if (facetType == 'journal' || facetType == 'proceeding') {
            exHtml = _.template(Template.sortPublicationTpl, params);
        } else if (facetType == 'year') {
            exHtml = _.template(Template.sortYearTpl, params);
        } else {
            exHtml = _.template(Template.sortOtherTpl, params);
        }
        
        $("#" + id).append(exHtml);
        //initializing the click actions
        $("#" + id + " .sf-sort-popup").css("display", "none");
        $("#" + id + " .sf-sort-toggle").click(function () {
            $(this).siblings(".sf-sort-popup").fadeToggle(75)
        })
        $("#" + id + " .sf-sort-popup").click(function () {
            $(this).fadeToggle(75)
        })
        
        $("a[name ='sort-" + facetType + "']").click(function (event) {
            var facetType = $(event.target).prop("name").split('-')[1];
            var key = $(event.target).prop("name");
            $("a[name='" + key + "']").parent().prop("class", "");
            $(event.target).parent().prop("class", "active");
            Constants.DEFAULTFACETS[key] = $(event.target).attr("data-value");
            _self.changeChkFacet(true, facetType);
            event.preventDefault(); // Added by Josh to prevent page jumping
        });
    };
    
    /**
     *
     * This function initializes the input in the more po-up with a selectize component.
     *
     * @param {String} facetType - Name of facet associated to more popUp link selected.
     *
     */
    this.initializeFacetInput = function (facetType) {
        $("input[id ='input-all-" + facetType + "']").selectize({
            plugins:[ 'remove_button'],
            searchField:[ 'label', 'id'],
            labelField: 'label',
            valueField: 'id',
            maxOptions: 20,
            delimiter: ',',
            sortField: 'label',
            options:[],
            onChange: function (values) {
                if (values) {
                    
                    var type = values.split(',')[0].split('_')[1].split('-')[0];
                    
                    $("#moreUl-all-" + type + " input[name='chkFacet-" + type + "']").removeAttr("checked");
                    var selectedValues = values.split(",");
                    $.each(selectedValues, function (i, val) {
                        $("#moreUl-all-" + type + " input[id = '" + val.split('_')[1] + "']").prop('checked', true);
                    });
                } else {
                    $("ul[id|='moreUl-all'] input[name!='chkFacet-normalized']").removeAttr("checked");
                }
            },
            render: {
                option: function (data, escape) {
                    var field_label = this.settings.labelField;
                    var field_value = this.settings.valueField;
                    
                    return '<div class="option">' + escape(data[field_label]) + '</div>';
                },
                item: function (data, escape) {
                    var field_label = this.settings.labelField;
                    var field_value = this.settings.valueField;
                    return '<div class="item" title="' + data[field_label] + '">' + escape(data[field_label]) + '</div>';
                }
            }
        });
    };
    
    /**
     * Put the active property on all elements to sort
     *
     */
    this.fixSortStyle = function () {
        for (var key in Constants.DEFAULTFACETS) {
            $("a[name='" + key + "']").parent().prop("class", "");
            $("a[data-value='" + Constants.DEFAULTFACETS[key] + "']").parent().prop("class", "active");
        }
    };
    
    /**
     * This function initializes the input in the more popUp with a selectize component.
     *
     * @param {String} facetType - Name of facet associated to more popUp link that the user selected.
     */
    this.initializePopLinks = function (facetType) {
        $("#facet-" + facetType + "-values a[data-toggle='modal']").click(_self.onMoreFacetClick);
        $("#facet-" + facetType + "-values a[data-toggle='modal']").click(function (a) {
            if ($(this).siblings(".modal.in").length > 0) {
                $(this).siblings(".modal.in").modal("hide");
                $("#loadingIndicator").hide();
            } else {
                $(".modal").modal("hide");
                $(this).siblings(".modal").modal("show");
            }
            a.preventDefault();
        })
        
        $("#facet-" + facetType + "-values div.sf-expanded-popup a").click(function (a) {
            if ($(this).parent().is(":visible")) {
                $(this).parent().hide();
                $("#loadingIndicator").hide();
            } else {
                $(this).parent().show();
            }
        });
    };
    
    /**
     *
     * This function is executed when you click on any Journal or Proceeding facet.
     *
     * @param {event} event - Event that launched the action.
     */
    this.onFourthLevel = function (event) {
        // #904 added to validates if the user click on the page links
        facetClick = true;
        var isChecked = $(event.target).prop("checked");
        var typeContent = $(event.target).prop("id").split("-")[0];
        var theOtherType = typeContent == "journal" ? "proceeding": "journal",
        searchOBJ = new Search();
        
        var journalFilter = document.getElementById("filter_all_jo"),
        proceedingsFilter = document.getElementById("filter_all_pro");
        
        if (isChecked) {
            $(event.target).prop("checked", "checked");
            _self.onChangeContent(theOtherType, isChecked);
            checkedFacets = {
            };
            checkedFacets = _self.getCheckedFacets();
            $("#publicationsAll").prop("checked", false);
            $("#publicationsAll").prop("disabled", false);
            $("input[id='facet-publications-" + typeContent + "s']").prop("checked", true);
            $("input[id='all-" + typeContent + "']").prop("checked", false);
            $("input[id='all-" + typeContent + "']").prop("disabled", false);
            
            $("#facet-" + typeContent + "-values").show();
            $(".sf-" + typeContent + "s .row").removeClass("expanded");
            $(".sf-" + typeContent + "s .row").addClass("expanded");
            $(".sf-" + theOtherType + "s .row").removeClass("expanded");
            if (typeContent == "proceeding") {
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").addClass("displayNone");
                if (! proceedingsFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Proceedings", "all_pro");
                }
                if (journalFilter) {
                    journalFilter.parentNode.parentNode.parentNode.removeChild(journalFilter.parentNode.parentNode);
                }
            } else {
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").addClass("displayNone");
                if (! journalFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Journals", "all_jo");
                }
                if (proceedingsFilter) {
                    proceedingsFilter.parentNode.parentNode.parentNode.removeChild(proceedingsFilter.parentNode.parentNode);
                }
            }
        }
        checkedFacets = {
        };
        checkedFacets = _self.getCheckedFacets();
        _self.changeChkFacet(false, typeContent);
    };
    
    /**
     * This function is executed when you click on the all checbox of the journals or proceedings facet
     *
     * @param {event} event - Event that launched the action.
     */
    this.onThirdLevel = function (event) {
        // #904 added to validates if the user click on the page links
        facetClick = true;
        var isChecked = $(event.target).prop("checked");
        var typeContent = $(event.target).prop("id").split("-")[1];
        if (isChecked) {
            $("#facet-publications-" + typeContent + "s").prop("checked", isChecked);
            $("input[name=chkFacet-" + typeContent + "]").prop("checked", false);
        } else {
            $("#facet-publications-" + typeContent + "s").prop("checked", isChecked);
        }
        _self.changeChkFacet(false, typeContent);
    };
    
    /**
     * Function executed when you press click in the results publication filters
     * Journals or proceedings checkboxes on the left side (Checkboxes Above the facets)
     *
     * @param {event} event - Event that launched the action.
     */
    this.onSecondLevel = function (event) {
        // #904 added to validates if the user click on the page links
        facetClick = true;
        var isChecked = $(event.target).prop("checked");
        var typeContent = $(event.target).prop("id").split("-")[2].split("s")[0];
        
        var theOtherType = typeContent == "journal" ? "proceeding": "journal",
        searchOBJ = new Search();
        
        var journalFilter = document.getElementById("filter_all_jo"),
        proceedingsFilter = document.getElementById("filter_all_pro");
        
        if (isChecked) {
            $("#publicationsAll").prop("checked", false);
            $("#publicationsAll").prop("disabled", false);
            $("input[id='all-" + typeContent + "']").prop("checked", true);
            $("input[id='all-" + typeContent + "']").prop("disabled", true);
            
            $("#facet-" + typeContent + "-values").show();
            $(".sf-" + typeContent + "s .row").removeClass("expanded");
            $(".sf-" + typeContent + "s .row").addClass("expanded");
            $(".sf-" + theOtherType + "s .row").removeClass("expanded");
            if (typeContent == "proceeding") {
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").addClass("displayNone");
                if (! proceedingsFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Proceedings", "all_pro");
                }
                if (journalFilter) {
                    journalFilter.parentNode.parentNode.parentNode.removeChild(journalFilter.parentNode.parentNode);
                }
            } else {
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").addClass("displayNone");
                if (! journalFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Journals", "all_jo");
                }
                if (proceedingsFilter) {
                    proceedingsFilter.parentNode.parentNode.parentNode.removeChild(proceedingsFilter.parentNode.parentNode);
                }
            }
            _self.onChangeContent(theOtherType, isChecked);
        } else {
            $("input[id='all-" + typeContent + "']").prop("checked", false);
            $("input[id='all-" + typeContent + "']").prop("disabled", false);
            $("input[name='chkFacet-" + typeContent + "']").prop("checked", false);
            
            $("#facet-" + typeContent + "-values").hide();
            $(".sf-" + typeContent + "s .row").removeClass("expanded");
            $(".sf-" + theOtherType + "s .row").removeClass("expanded");
            $(".sf-" + theOtherType + "s .row").addClass("expanded");
            if (typeContent == "proceeding") {
                if (! proceedingsFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Proceedings", "all_pro");
                }
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortProceeding .sf-sort").addClass("displayNone");
                if (proceedingsFilter) {
                    proceedingsFilter.parentNode.parentNode.parentNode.removeChild(proceedingsFilter.parentNode.parentNode);
                }
            } else {
                $("#sortProceeding .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").removeClass("displayNone");
                $("#sortJournal .sf-sort").addClass("displayNone");
                if (! journalFilter) {
                    searchOBJ.creatingFiltersProceedingJournalFacet("Journals", "all_jo");
                }
                if (journalFilter) {
                    journalFilter.parentNode.parentNode.parentNode.removeChild(journalFilter.parentNode.parentNode);
                }
            }
            _self.onChangeContent(theOtherType, isChecked);
        }
        
        _self.changeChkFacet(false, typeContent);
    };
    
    /**
     * This function is executed when you click on the all checbox of the results publication filters.
     *
     * @param {event} event - Event that launched the action.
     */
    this.onAllPublicationsChange = function (event) {
        // #904 added to validates if the user click on the page links
        facetClick = true;
        var isChecked = $(event.target).prop("checked");
        var journalFilter = document.getElementById("filter_all_jo"),
        proceedingsFilter = document.getElementById("filter_all_pro");
        if (isChecked) {
            $("#publicationsAll").prop("disabled", true);
            $("input[id|='facet-publications']").prop("checked", false);
            $("input[id|='all-journal'], input[id|='all-proceeding']").prop("checked", true).prop("disabled", true);
            $("input[name|='chkFacet-journal']").prop("checked", false);
            $("input[name|='chkFacet-proceeding']").prop("checked", false);
            if (proceedingsFilter) {
                proceedingsFilter.parentNode.parentNode.parentNode.removeChild(proceedingsFilter.parentNode.parentNode);
            }
            if (journalFilter) {
                journalFilter.parentNode.parentNode.parentNode.removeChild(journalFilter.parentNode.parentNode);
            }
        }
        $("#facet-journal-values").hide();
        $("#facet-proceeding-values").hide();
        $("#sortProceeding .sf-sort").addClass("displayNone");
        $("#sortJournal .sf-sort").addClass("displayNone");
        $(".sf-proceedings .row").removeClass("expanded");
        $(".sf-journals .row").removeClass("expanded");
        _self.changeChkFacet(false);
    };
    
    /**
     * Collapses and uncheck options in the opposite publication
    �����* If the user clicks Journal, the system deselects facets of Proceedings and collapses the proceedings panel and vice versa
     *
     * @param {String} theOtherType - name of publication.
     * @param {boolean} isTrue - Flag for hide or show the publication panel.
     */
    this.onChangeContent = function (theOtherType, isTrue) {
        var theOtherInput = document.getElementById("facet-publications-" + theOtherType + "s"),
        facetInputs = document.querySelectorAll("input[name=chkFacet-" + theOtherType + "]"),
        clearFilters = document.getElementById("clearFilters");
        facetDiv = document.getElementById("facet-" + theOtherType + "-values");
        if (isTrue) {
            theOtherInput.checked = false;
            $(facetInputs).prop("checked", false);
            $(facetDiv).hide();
        } else {
            theOtherInput.checked = true;
            $(facetInputs).prop("checked", false);
            $(facetDiv).show();
        }
    };
    
    /**
     * It is executed by pressing the button All of one of the facets
     * Disables all button, Removes the selection of the other facets of the same category
     *
     * @param {event} ev - Event that launched the action.
     */
    this.onSingleAll = function (event) {
        var isChecked = $(event.target).prop("checked");
        var typeFacet = $(event.target).prop("id").split("-")[1];
        if (isChecked) {
            $(event.target).prop("disabled", true);
            $("input[name='chkFacet-" + typeFacet + "']").prop("checked", false);
			if (typeFacet == 'level2') {
				termMulti = false;
				$("input[name='chkFacet-level3']").prop("checked", false);
				$("input[name='chkFacet-level4']").prop("checked", false);
				(true || termMulti == false) ? $('#all-level2').parent().hide() : $('#all-level2').parent().show();
			}
			if (typeFacet == 'author') $("input[name='chkFacet-normalized']").prop("checked", false);
        }
        _self.changeChkFacet(false);
    };
    
    /**
     * Initializes all objects related to a facet
     * Checkboxes, More Links, Sort Links, Details Links
     * 
     * @param {String} name - Name of facet.
     */
    this.initializeBoxesAndOther = function (name) {
        _self.initializeChildrenCheckBoxes(name);
        _self.initializeParentCheckBox(name);
        _self.initializeMoreLessLink(name);
        _self.initializeSortLink(name);
		if (name == "level2") {
            _self.initializeFacetX();
		}
        if (name == "author") {
            _self.initializeDetails(false);
        }
    };
    
    /**
     * This function is executed when you click on the all checbox of the results publication filters.
     *
     * @param {String} proceedings - Proceedings count.
     * @param {String} journals - Journals count
     *
     * @return {String} HTML of section for result publications filters and publications facets.
     *
     */
    this.getPublicationValues = function (proceedings, journals) {
        return _.template(Template.facetPublications, {
            totalJournals: journals, totalProceedings: proceedings
        });
    };
    
    /**
     * This function is executed when you click on the all checbox of the results publication filters.
     *
     * @param {Object} facet - Contains the facet name and all facets values asociated to this name.
     * @param {boolean} isMoreEvent - Select the structure to create (for facets or the popUp)
     *
     * @return {String} HTML of section for facets.
     *
     */
    this.getBasicFacetValues = function (facet, isMoreEvent) {
        var ft = $(facet);
        var name = ft.attr("name");
        var values = facet[ "facet-value"];
        if (values && values.length > 0) {
            
            var thereAreMore = false;
            var haveSearched = $(values).attr("searched") === "true";
            var maxLength = values.length;

            if (values.length > Config.MAX_FACETS_LENGTH) {
                maxLength = Config.MAX_FACETS_LENGTH;
                thereAreMore = true;
            }
            
            var parameters = {
                values: _self.getFacetValues(maxLength, values, haveSearched, name, isMoreEvent)
            };
            
            return parameters;
        }
    };
    
    this.getTermFacetValues = function (level2, level3, level4, isMoreEvent) {
        var level2values = level2[ "facet-value"];
        var level3values = level3[ "facet-value"];
        var level4values = level4[ "facet-value"];
		var searchedList = [];
		if (level2values) searchedList = searchedList.concat($.grep(level2values, function(e) { return e.searched == "true" && e.count != ""; }));
		if (level3values) searchedList = searchedList.concat($.grep(level3values, function(e) { return e.searched == "true" && e.count != ""; }));
		if (level4values) searchedList = searchedList.concat($.grep(level4values, function(e) { return e.searched == "true" && e.count != ""; }));
		var l2v;
		var l3v;
		var l4v;
		
		if (level2values && level2values.length > 0) {
			var l2picked = false;
			for (var i=0;i<level2values.length;i++) {
				if (level2values[i]["facet-selected"]) {
					l2v = [ level2values[i] ];
					l2picked = true;
					break;
				}
			}

			var l3picked = false;
			if (level3values)
				for (var i=0;i<level3values.length;i++) {
					if (level3values[i]["facet-selected"]) {
						l3v = [ level3values[i] ];
						l3picked = true;
						break; }
				}

            var thereAreMore = true;
            var haveSearched = searchedList.length > 0;
            var maxLength = level2values.length;

            if (level2values.length > Config.MAX_FACETS_LENGTH_TERMS) {
                maxLength = Config.MAX_FACETS_LENGTH_TERMS;
                thereAreMore = true;
            }
            
			if (l3picked == true) {
				var parameters = {
					values: _self.getTerm3DeepValues(l2v, l3v, level4values, searchedList, "level2", isMoreEvent)
				}
			} else  if (l2picked == true) {
				var parameters = {
					values: _self.getTerm2DeepValues(l2v, level3values, searchedList, "level2", isMoreEvent)
				}
			} else {
				var parameters = {
					values: _self.getFacetValues(maxLength, level2values, searchedList, "level2", isMoreEvent)
				};
			}
            return parameters;
        }
    };

    /***
     *
     * This function associates the event and introduces behavior when the users clicks the children of the authors
     *
     * @param {Object} container - Not used in the code
     * @param {boolean} parentId - Id of html object to add the childrens.
     * @param {boolean} isMore - This field indicates if the action is from the facet or popUp
     *
     */
    this.initializeGrandChildrenCheckBoxes = function (container, parentId, isMore) {
        var children = $("#details-container-" + parentId + " > li > input");
        var parent = $("#" + parentId);

		children.unbind("click");
        children.click({
            parentId: parentId
        },
        function (event) {
            $("#all-author").prop('checked', false);
            $("#all-author").prop('disabled', false);
            var parent = $("#" + parentId);
            var name = parentId.split("-")[0];
            var children = $("#details-container-" + parentId + " > li > input");
            if (children.length > 0) {
                var notChecked = children.filter(":not(:checked)");
                parent.prop("checked", notChecked.length == 0);
                var grandParent = $("input[name='chkAllFacet-" + name + "']");
                var parents = $("input[name='chkFacet-" + name + "']");
                notChecked = parents.filter(":not(:checked)");
                grandParent.prop("checked", notChecked.length == 0);
            }
            checkedFacets = {
            };
            _self.changeChkFacet(false, 'author');
        });
    };
    
    /***
     *
     * This function associates the handler to each author detail checbox
     *
     * @param {boolean} isMore - This field indicates if the action is from the facet or popUp
     *
     */
    this.initializeDetails = function (isMore) {
        var name = Constants.FACET.AUTHORS;
        var aux = isMore ? "#moreUl-all-author": "";
        var links = $(aux + " a[id|='details-link-author']");
        links.each(function (index, link) {
            var id = link.id.substr("details-link-".length);
            //The id of the detail
            var value = $(aux + " #" + id);
            //the selector of the input
            var code = $.base64.decode(value.val(), true);
            //the data-value...
			$(link).unbind('click');
            $(link).click({
                id: id, code: code
            },
            function (event) {
                event.preventDefault();
                _self.handleDetails(id, code, isMore);
            });
        });
    };
    
    /***
     *
     * Function to handle the details
     *
     * @param {String} id - Id of parent element
     * @param {String} code - Code of parent element
     * @param {boolean} isMore - This field indicates if the action is from the facet or popUp
     *
     */
    this.handleDetails = function (id, code, isMore) {
        var aux = isMore ? "#moreUl-all-author": "";
        var field = $(aux + " #details-container-" + id);
        var parent = $(aux + " #" + id);
        arrayAux =[];
        arrayAux = field.find("input:checked");
        
        var label = $(aux + " #details-link-" + id).html();;
        if (label == 'details') {
            field.empty();
            field.show();
            label = "group";
            bus.publish(bus.event.FACET_AUTHOR_DETAILS_CLICK, {
                facetId: id, facetName: Constants.FACET.AUTHORS, facetValue: code, isMore: isMore
            });
        } else {
            label = "details";
            field.hide();
            var children = $(aux + " #details-container-" + id + " > li > input");
            children.each(function (index, value) {
                var name = value.name.split("-");
                name = (name && name[1]) ? name[1]: "";
                delete checkedFacets[name + value.value];
            });
            
            if (! isMore) {
                _self.changeChkFacet(false, 'author');
            }
        }
        $(aux + " #details-link-" + id).html(label);
    };
    
    /***
     *
     * Initialize the sort facet dialog
     *
     * @param {String} name - Name of the component to initialize
     *
     */
    this.initializeSortLink = function (name) {
        var link = $("#sortby-" + name);
        link.click({
            name: name
        },
        function (event) {
            event.preventDefault();
            var sortDialog = $("#sortDialog");
            sortDialog.empty();
            var html = _.template(Template.facetSortTpl, {
                name: name, label: FACET_LABELS[name]
            });
            sortDialog.html(html);
            sortDialog.dialog("option", "title", "Sort by " + name);
            sortDialog.dialog("open");
            $("input[id='" + sortFacetCache[name] + "']").prop("checked", true);
        });
        
        $("#sortDialog").dialog({
            autoOpen: false,
            modal: true,
            buttons:[ {
                text: "OK",
                click: _self.sortFacets
            }]
        });
    };
    
    /**
     * Function to handle the sort
     *
     * @param {event} event - Event that launched the action.
     *
     */
    this.sortFacets = function (event) {
        event.preventDefault();
        $("#sortDialog").dialog("close");
        var facetSortSel = $("input[name='facetSortBy']:checked").val();
        var tokens = facetSortSel.split(":");
        sortFacetCache[tokens[0]] = facetSortSel;
        var data =[ {
            facet: tokens[0], frequencySort: tokens[1] == "frequency-order", ascending: tokens[2] == "ascending", scrollPosition: $("#facets").scrollTop()
        }];
        checkedFacets = _self.getCheckedFacets();
        var more = $("#more-" + tokens[0]);
        displayAll[tokens[0]] = more.length == 0 || more.html().toLowerCase().trim() == "less";
        _self.uncheckAll();
        bus.publish(bus.event.FACET_SORT_CHANGE, data);
    };
    
    /**
     * Define behavior for the parent checkboxes
     *
     * @param {String} name - Facet name.
     *
     */
    this.initializeParentCheckBox = function (name) {
        var parent = $("input[name='chkAllFacet-" + name + "']");
        var children = $("input[name|='chkFacet-" + name + "']");
        if (parent.prop("checked")) {
            children.prop("checked", true);
        }
        if (children.length > 0) {
            var notChecked = children.filter(":not(:checked)");
            parent.prop("checked", notChecked.length == 0);
        }
        parent.click(function (event) {
            var children = $("input[name|='chkFacet-" + name + "']")
            children.prop("checked", parent.prop("checked"));
            children.each(function (index, value) {
                var grandChildren = $("#details-container-" + value.id + " > li > input");
                grandChildren.prop("checked", $(value).prop("checked"));
            });
            checkedFacets = {
            };
            _self.changeChkFacet(false);
        });
    };
    
    /**
     * Adds click behavior for checkboxes of a facet 
     *
     * @param {String} name - Facet name.
     *
     */
    this.initializeChildrenCheckBoxes = function (name) {
        var parent = $("input[name='chkAllFacet-" + name + "']");
        var children = $("input[name|='chkFacet-" + name + "']");
        if (name != "journal" && name != "proceeding") {
            children.click({
                name: name
            },
            function (event) {
                $("input[id='all-" + name + "']").prop("checked", false);
                $("input[id='all-" + name + "']").prop("disabled", false);
                var children = $("input[name|='chkFacet-" + name + "']");
                var notChecked = children.filter(":not(:checked)");
                if ($(event.target).prop("checked")) {
                    var idd = $(event.target).prop("id");
                    var filterParams = {
                        filterValue: $("label[for='" + idd + "']").html().split("(")[0],
                        filterId: idd
                    };
                    /*exHtml = _.template(Template.filterSelectedTpl, filterParams);
                    $("#avsSelectedFilters").append(exHtml);
                    
                    _self.changeVisibilitySelectedFilters();*/


                } else {
                    var idd = $(event.target).prop("id");
					var filterCategory =  idd.split("-")[0];
					// Clear all checks down the hierarchy
					if (filterCategory == 'level2' && termMulti == false) {
						$("input[id|='level3']").prop("checked", false);
						$("input[id|='level4']").prop("checked", false);
					}
					if (filterCategory == 'level3' && termMulti == false) {
						$("input[id|='level4']").prop("checked", false);
					}
					// If in multi term select mode, remove the item
					if (filterCategory.lastIndexOf('level', 0) === 0 && termMulti == true) {
						$(this).parent().remove();
						// If 0 checks remain, turn off multi term mode
						var otherChecks = $("input[name^='chkFacet-level']:checked");
						if (otherChecks.length == 0) termMulti = false;
					}
                    $("#filter_" + idd).remove();
                    _self.changeVisibilitySelectedFilters();
                }
                checkedFacets = {
                };
                _self.changeChkFacet(false, name);
            });
        }
    };

	this.initializeFacetX = function () {
		var xs = $( "span.facet-value_toggle" );
		for (var i=0; i<xs.length; i++) {
			$(xs[i]).unbind("click");
			$(xs[i]).click(function (event) {
				// For initial topic filters, similate click of facet filter instead
				if ($(event.target).parent().parent().hasClass("selected-topic") &&
					!($(event.target).parent().parent().hasClass("facet-inside-l2")) &&
					!($(event.target).parent().parent().hasClass("facet-inside-l3"))) {
					var txt = $(event.target).parent().prev("input").attr("data-value");
					$("span[id^='filter_level'][data-value='"+txt+"']").click();
				} else {
					$(event.target).parent().prev("input").click();
				}
			});
		}
	};

	this.addPreCheckedTerms	= function () {
		$("#"+_self.topics.names.selectedlist).empty();
		if (termMulti == false) {
			// Only add the lowest selected term]
			var preCheckedL2 = $("input[name='chkFacet-level2']:checked");
			var preCheckedL3 = $("input[name='chkFacet-level3']:checked");
			var preCheckedL4 = $("input[name='chkFacet-level4']:checked");
			var facetToAdd;
			if (preCheckedL4.length > 0) facetToAdd = preCheckedL4[0];
			else if (preCheckedL3.length > 0) facetToAdd = preCheckedL3[0];
			else if (preCheckedL2.length > 0) facetToAdd = preCheckedL2[0];
			else return;
			var t = $(facetToAdd).attr("data-value");
			_self.topics.addSelectedTerm(t,_self.topics.findCount(t));
		} else {
			// Add all terms
			var preChecked = $("input[name='chkFacet-level2']:checked,input[name='chkFacet-level3']:checked,input[name='chkFacet-level4']:checked");
			$(preChecked).each(function (index) {
				var t = $(preChecked[index]).attr("data-value");
				_self.topics.addSelectedTerm(t,_self.topics.findCount(t));
			});
		}
	};

    /**
     *
     * Function to handle which filters the user is able to remove
     *
     */
    this.changeVisibilitySelectedFilters = function () {
        var filterSearch = document.getElementsByClassName("filter-search");
        mainSearch = false;
        if ($("#avsSelectedFilters>li:not(.filter-search)").length == 0 && document.querySelectorAll(".filter-search>a>span[id^='filter_all_']").length == 0) {
            if (document.getElementById("facet-publications-proceedings").checked || document.getElementById("facet-publications-journals").checked) {
                if (filterSearch.length <= 3) {
                    for (var x = filterSearch.length; x--;) {
                        var span = filterSearch[x].getElementsByTagName("span")[0];
                        $(filterSearch[x]).children().show();
                    }
                } else {
                    for (var x = filterSearch.length; x--;) {
                        var span = filterSearch[x].getElementsByTagName("span")[0];
                        //ticket #901, commentary #1
                        if (span.id != "filter_all_jo" && span.id != "filter_all_pro" && span.id != "filter_chkJournals" && span.id != "filter_txtSearch") {
                            $(filterSearch[x]).children().hide();
                        } else {
                            $(filterSearch[x]).children().show();
                        }
                    }
                }
            } else {
                $(filterSearch).children().show();
                $("#clearFacetsSelected").hide();
            }
        } else {
            for (var x = filterSearch.length; x--;) {
                var span = filterSearch[x].getElementsByTagName("span")[0];
                if (span.id != "filter_all_jo" && span.id != "filter_all_pro") {
                    $(filterSearch[x]).children().hide();
                }
            }
        }
    };
    
    /**
     *
     * Change the value from more to less in the "more link"
     *
     * @param name the facet name
     *
     */
    this.initializeMoreLessLink = function (name) {
        var more = $("#more-" + name);
        if (displayAll[name]) {
            more.html("less");
        }
        if (more.length > 0) {
            more.click({
                name: name
            },
            function (event) {
                event.preventDefault();
                var children = $("input[name|='chkFacet-" + name + "']");
                if (more.html().toLowerCase().trim() == "more") {
                    more.html("less");
                    displayAll[name] = true;
                } else {
                    more.html("more");
                    var hidden = children.parent().filter(":gt(4)");
                    hidden.css("display", "none");
                    displayAll[name] = false;
                }
            });
        }
    };
    
    /**
     *
     * Create an HTML structure for draw the facets
     *
     * @param maxLength Quantity of items to display
     * @param values the facet-value element selector
     * @param haveSearched Indicates if a new search is performed
     * @param name the facet name
     * @param isMoreEvent if the element is created for facets or the popup
     *
     * @return {String} HTML structure for draw the facets
     *
     */
    this.getFacetValues = function (maxLength, values, haveSearched, name, isMoreEvent) {
        if(typeof(haveSearched) !== "boolean") {
			var searchedList = haveSearched;
			haveSearched = searchedList.length > 0;
		}
		var maxToDisplayThis = isMoreEvent ? values.length: values.length;
        
        var html = "";
        var topHtml = "";
        var lowHtml = "";
        var returnOut = "";
        var maxOut = values.length > maxToDisplayThis ? maxToDisplayThis: values.length;
        if (Constants.FACET.AUTHORS == name) {
            for (var j = 0; j < maxOut; j++) {
                var modified = Util.removeDiacritics(values[j].name);
                values[j].name = modified;
                var val = $(values[j]);
                var toCompare = val[0].name.toLowerCase();
                toCompare = toCompare.replace("\/\)", "");
                var authorsArray = $("#authorSearch").val().split(",");
                
                if (toCompare != "") {
                    var matches = $.grep(authorsArray, function (e) {
                        return $.trim(e.toLowerCase()) === toCompare;
                    });
                    
                    if (matches.length > 0 || val.attr("searched") === "true") {
                        topHtml += _self.createFacetValue(maxLength, val, name, j, true, isMoreEvent);
                    } else {
                        lowHtml += _self.createFacetValue(maxLength, val, name, j, false, isMoreEvent);
                    }
                }
            }
            if (topHtml.length > 1) {
                returnOut = topHtml + selectedSeparator + lowHtml;
            } else {
                returnOut = lowHtml;
            }
        } else if (Constants.FACET.LEVEL2 == name) {
			// Start with original search topics
			for (var j=0; j<searchedList.length; j++) {
				var val = $(searchedList[j]);
				if (val.attr("searched") === "true") {
					val.prop("name",val.prop("name").split('|').pop());
					var treelevel = val.prop("value").split('|').length+1;
					var hidedupe = false;
					// hide duplicate leaf values
					for (var k=j-1; k>=0; k--) {
						var preval = $(searchedList[k]);
						if (preval.prop("name").split('|').pop() == val.prop("name")) { hidedupe = true; }
					}
					if (hidedupe == false) topHtml += _self.createFacetValue(maxLength, val, "level"+treelevel, j, true, isMoreEvent);
				}
			}
			// have to set the offset so selected topic IDs aren't repeated
			var offset=0;
			if (searchedList && searchedList.length >0) offset = searchedList.length;
            for (var j = 0; j < maxOut; j++) {
                var val = $(values[j]);
                lowHtml += _self.createFacetValue(maxLength, val, name, j+offset, false, isMoreEvent);
            }
            if (topHtml.length > 1) {
                returnOut = topHtml + selectedSeparator + lowHtml;
            } else {
                returnOut = lowHtml;
            }
        } else {
            for (var j = 0; j < maxOut; j++) {
                var val = $(values[j]);
                html += _self.createFacetValue(maxLength, val, name, j, false, isMoreEvent);
            }
            returnOut = html;
        }
        return returnOut;
    };
    
    this.getTerm2DeepValues = function (level2, level3, searchedList, isMoreEvent) {
		var haveSearched = searchedList.length > 0;
        var html = "";

        var maxOut =  Config.MAX_FACETS_LENGTH_TERM > level3.length ? Config.MAX_FACETS_LENGTH_TERM : level3.length;

		// Start with original search topics
		for (var j=0; j<searchedList.length; j++) {
			var val = $(searchedList[j]);
			if (val.attr("searched") === "true") {
				val.prop("name",val.prop("name").split('|').pop());
				var treelevel = val.prop("value").split('|').length+1;
				var hidedupe = false;
				// hide duplicate leaf values
				for (var k=j-1; k>=0; k--) {
					var preval = $(searchedList[k]);
					if (preval.prop("name").split('|').pop() == val.prop("name")) { hidedupe = true; }
				}
				if (hidedupe == false) html += _self.createFacetValue(Config.MAX_FACETS_LENGTH_TERMS, val, 'level'+treelevel, j, true, isMoreEvent);
			}
		}
        if (html != "") html += selectedSeparator;
		
		// Start with Level 2 topic
		// have to set the offset so selected topic IDs aren't repeated
		var offset=0;
		if (searchedList && searchedList.length >0) offset = searchedList.length-1;
		html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, $(level2[0]), 'level2', ++offset, true, isMoreEvent, true);
		l2term = $(level2[0]).prop("value");

		for (var j = 0; j < maxOut; j++) {
			var val = $(level3[j]);
			if (val.prop("value") && val.prop("value").lastIndexOf(l2term+'|', 0) === 0) {
				val.prop("name",val.prop("name").replace(l2term+'|',''));
				html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, val, 'level3', ++offset, false, isMoreEvent);
			}
		}

        return html;
    };

    this.getTerm3DeepValues = function (level2, level3, level4, searchedList, isMoreEvent) {
		var haveSearched = searchedList.length > 0;
        var html = "";

        var maxOut =  Config.MAX_FACETS_LENGTH_TERM > level4.length ? Config.MAX_FACETS_LENGTH_TERM : level4.length;

		// Start with original search topics
		for (var j=0; j<searchedList.length; j++) {
			var val = $(searchedList[j]);
			if (val.attr("searched") === "true") {
				val.prop("name",val.prop("name").split('|').pop());
				var treelevel = val.prop("value").split('|').length+1;
				var hidedupe = false;
				// hide duplicate leaf values
				for (var k=j-1; k>=0; k--) {
					var preval = $(searchedList[k]);
					if (preval.prop("name").split('|').pop() == val.prop("name")) { hidedupe = true; }
				}
				if (hidedupe == false) html += _self.createFacetValue(Config.MAX_FACETS_LENGTH_TERMS, val, 'level'+treelevel, j, true, isMoreEvent);
			}
		}
        if (html != "") html += selectedSeparator;

		// Start with Level 2 topic
		// have to set the offset so selected topic IDs aren't repeated
		var offset=0;
		if (searchedList && searchedList.length >0) offset = searchedList.length-1;
		html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, $(level2[0]), 'level2', ++offset, true, isMoreEvent, true);
		l2term = $(level2[0]).prop("value");
		// Start with Level 3 topic
		$(level3[0]).prop("name",$(level3[0]).prop("name").replace(l2term+'|',''));
		html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, $(level3[0]), 'level3', ++offset, true, isMoreEvent, true);
		l3term = $(level3[0]).prop("value");

		var l4picked = false;
		for (var i=0;i<level4.length;i++) {
			if (level4[i]["facet-selected"]) {
				l4v = [ level4[i] ];
				l4picked = true;
				break; }
		}
		
		if (l4picked == true) {
			$(l4v).prop("name",$(l4v).prop("name").replace(l3term+'|',''));
			html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, $(l4v), 'level4', ++offset, false, isMoreEvent, true);
		} else {
			for (var j = 0; j < maxOut; j++) {
				var val = $(level4[j]);
				if (val.prop("value") && val.prop("value").lastIndexOf(l3term+'|', 0) === 0) {
					val.prop("name",val.prop("name").replace(l3term+'|',''));
					html += _self.createFacetValue( Config.MAX_FACETS_LENGTH_TERMS, val, 'level4', ++offset, false, isMoreEvent);
				}
			}
		}

        return html;
    };

    /**
     *
     * Creates a facet value row
     *
     * @param maxLength Quantity of items to display
     * @param val the facet-value element selector
     * @param name the facet name
     * @param idx the index on the facet family name
     * @param isFacetBold indicate if the facet should been bold
     * @param isMoreEvent Indicates if the element is created for facets or the popup
     * @param boolean arrowx will display the "remove" arrow if true, defaults to false 
     *
     */
    this.createFacetValue = function (maxLength, val, name, idx, isFacetBold, isMoreEvent, arrowx) {
		if (!arrowx) arrowx = false;
		if (val.datavalue) {
			var value = val.datavalue;
			var valName = val.label;
			var count = val.count;
			var acronym = val.acronym;
			var searched = '';
		} else {
			var value = val.prop("value");
			var valName = val.attr("name");
			var count = val.attr("count");
			var acronym = val.attr("code");
			var searched = val.attr("searched");
		}
        var id = name + "-" + idx;
		var tempCount = "(" + count + ")";
        var code = $.base64.encode(value, true);
        var decoded = value;
        
        // uses template.detailTpl if the facet name is 'author'
        var detail = name === Constants.FACET.AUTHORS ? _.template(Template.detailTpl, {
            id: id, code: code, valName: valName
        }): "";
        var clazz = searched === "true" ? _.template(Template.facetClassTpl, {
        }): _.template(Template.facetClassStyleNormalTpl, {
        });
        if (! isMoreEvent) {
            var display = (idx >= maxLength) && !(displayAll[name]) ? _.template(Template.elementHiddenTpl, {
            }): "";
        } else {
            var display = "";
        }
        //revisit this. Why is this here again? 
        var checked = (checkedFacets && checkedFacets[name + code]) ? 'checked': '';
		var style = ""; var hasCloseButton = false; var tip = ""; var rowclass = "";

		if (name.lastIndexOf('level', 0) === 0) {
			style = 'hidden';
            rowclass = 'sf-list_list-item--topic';
			// if (searched === "true") {
			// 	clazz = clazz + ' style="margin-left: -20px;"';
			// } else {
			// 	clazz = clazz.substring(0,clazz.length-2) + '; margin-left: -20px;"';
			// }
			//tip = 'title="'+decoded.replace("|"," > ").replace("|"," > ")+'"';
			//tip = 'title="'+decoded.replace("|"," > ").replace("|"," > ")+'"';
		}
		if (arrowx == true) {
			hasCloseButton = true;
			if (termMulti == false && name == 'level2') { rowclass = "facet-inside-l2 selected-topic"; tempCount = ""; }
			if (termMulti == false && name == 'level3') { rowclass = "facet-inside-l3 selected-topic"; tempCount = ""; }
		}
		// For topics selected via Advanced Search
		if (isFacetBold == true && name.lastIndexOf('level', 0) === 0) { 
            hasCloseButton = true;
            rowclass += " selected-topic";
        }
		
		if (termMulti == false && arrowx == false && name == 'level4' && !isFacetBold) rowclass = "facet-under-l4";

		if (display != "") return "";
        return _.template(Template.facetValueTpl, {
            name: name, code: code, id: id, clazz: clazz,
            valName: valName, valCount: tempCount, dataValue: decoded, detail: detail, display: display, checked: checked, acronym: acronym,
			boxstyle: style, hasCloseButton: hasCloseButton, title: tip, rowclass: rowclass, isbold: isFacetBold
        });
    };
    
    /**
     * Clearing the facets selected and making the search again
     */
    this.clearFacetsSelected = function () {
        $("input[name|='chkFacet']").prop('checked', false);
        _self.changeChkFacet(false, '');
    };
    
    /**
     *
     * Click on a facet checkbox.
     *
     * @param {boolean] isSort - Indicates that the action is called from the sort
     * @param {String} triggeredBy - Facet type
     * @param {boolean] isPageChange - Indicates that the action is called from the paginator
     * @param {boolean] isJustExpand - Indicates that the node is expanded or not
     *
     */
    this.changeChkFacet = function (isSort, triggeredBy, isPageChange, isJustExpand) {
        pubChecked = $('input[name="publications"]:checked').prop('id');
        var justExpand = isJustExpand ? isJustExpand: false;
        if (triggeredBy && triggeredBy.lastIndexOf('level', 0) === 0 && termMulti == true) {
			// If no checked filters remain, turn off multi term mode
			if ($("input[name='chkFacet-level2'],input[name='chkFacet-level3'],input[name='chkFacet-level4']").length <= 0)
				termMulti = false;
			else triggeredBy = 'topicspopup';
			(true || termMulti == false) ? $('#all-level2').parent().hide() : $('#all-level2').parent().show();
		}
        var facetTypes =[ "author", "level2", "level3", "level4", "year", "journal", "proceeding"]
        var filterParams = {
        };
        $("#avsSelectedFilters>li:not(.filter-search)>a>span:not([id ^='filter_all' ])").parent().parent().remove();
        var facets = _self.getCheckedFacets();
        facets = $.map(facets, function (index, value) {
            return index;
        });
        _self.copyToPrecheckedNormalized(facets);
        selectedFacets = _self.copyFacetsChecked(facets);
        _self.creatingFilters(selectedFacets);
        facetTypes.forEach(function (entry) {
            if ($("input[name='chkFacet-" + entry + "']:checked").length <= 0) {
                $("#all-" + entry).prop("checked", true);
                $("#all-" + entry).prop("disabled", true);
            }
        });
        if (isSort) {
            bus.publish(bus.event.FACET_SORT_CHANGE, {
                facets: facets, triggeredBy: triggeredBy
            });
        } else {
            $("#results").empty();
            bus.publish(bus.event.FACET_CHECK_CHANGE, {
                facets: facets, triggeredBy: triggeredBy, isPageChange: isPageChange, justExpand: justExpand
            });
        }
        _self.changeVisibilitySelectedFilters();
    };
    
    /**
     *
     * This function copy and normalize an array of facets to the array arrayNormalizedCheckedObjectsAgain
     *
     * @param {Array} facets - Array of selected facets
     *
     */
    this.copyToPrecheckedNormalized = function (facets) {
        arrayNormalizedCheckedObjectsAgain =[];
        $(facets).each(function (index) {
            if (facets[index].facet == 'normalized') {
                var liToCopy = $('input[data-value="' + facets[index].value + '"]').parent().prop('outerHTML');
                var valueToSearch = facets[index].value.split(',')[0];
                arrayNormalizedCheckedObjectsAgain.push({
                    valueToSearch: valueToSearch, liToCopy: liToCopy
                });
            }
        });
    }
    
    /**
     *
     * This function makes a copy of an array of facets to another
     *
     * @param {Array} facets - Array of selected facets
     * @return {Array} Array of objects with a copy of original facets.
     *
     */
    this.copyFacetsChecked = function (facets) {
        var out =[];
        for (var key in facets) {
            out.push({
                facet: facets[key].facet, value: facets[key].value, acronym: facets[key].acronym
            });
        }
        return out;
    };
    
    /**
     *
     * This function creates filters for facets and add behavior to x (to remove the filter)
     *
     * @param {Array} facets - Array of selected facets
     *
     */
    this.creatingFilters = function (facets) {
        facets.forEach(function (entry) {
            var facetValue = "";
            
            if ($.trim(entry.acronym) != "") {
                facetValue = $.trim(entry.acronym);
            } else if (entry.facet == 'level3' || entry.facet == 'level4') {
				split = entry.value.split("|");
				facetValue = split[split.length-1];
			} else {
                facetValue = entry.value;
            }
            
            filterParams = {
                filterValue: facetValue,
                filterType: entry.facet,
                filterId: entry.facet + "_" + entry.value
            };
            exHtml = _.template(Template.filterSelectedTpl, filterParams);
            $("#avsSelectedFilters").append(exHtml);
            
            _self.changeVisibilitySelectedFilters();
        });
        
		// Only add new click functions to facet filters, not original search filter tags
        $("li:not(.filter-search) a span[name='filterSelected']").click(function (event) {
            var facetValue = $(event.target).prop("id").split("_");
            var facetToSearch = $("input[id|='" + facetValue[0] + "']");
            var facetFilter;
            for (i = 0; i < facetToSearch.length; i++) {
                var text = $(facetToSearch[i]).attr("data-value");
                if (text.trim().toLowerCase() == facetValue[1].toLowerCase()) {
                    facetFilter = facetToSearch[i];
                }
                if (facetValue[0] == 'normalized') {
                    $(arrayNormalizedCheckedObjectsAgain).each(function (index) {
                        if (arrayNormalizedCheckedObjectsAgain[index].valueToSearch.trim().toLowerCase() == facetValue[1].toLowerCase()) {
                            arrayNormalizedCheckedObjectsAgain.splice(index, 1);
                        }
                    });
                }
			}

			if (facetFilter && facetValue[0] == 'level2' || facetValue[0] == 'level3' || facetValue[0] == 'level4') {
				// For topic facets, mimic clicking X functionality on left hand facet list instead
				$(facetFilter).click();
				_self.changeVisibilitySelectedFilters();
				return;
			}

            $(facetFilter).prop("checked", false);
            _self.changeChkFacet(false, facetValue[0]);
            _self.changeVisibilitySelectedFilters();
        });
    };
    
    /**
     *
     * This function creates an object with all selected facets
     *
     * @return {Object} Returns object with all facets that the user selects
     */
    this.getCheckedFacets = function () {
        var facets = {
        };
        $("input[name|='chkFacet']:checked").each(function (index, value) {
            var name = value.name.split("-");
            name = (name && name[1]) ? name[1]: "";
            facets[name + value.value] = {
                facet: name, value: $.base64.decode(value.value, true), acronym: $(value).attr("acronym")
            };
        });
        return facets;
    };
    
    /**
     *
     * This function unchecks all facets checkboxes, including "all" checkboxes.
     *
     */
    this.uncheckAll = function () {
        $("input[name|='chkFacet']:checked").prop("checked", false);
        $("input[name|='chkAllFacet']:checked").prop("checked", false);
    };
    
    /**
     *
     * This function unchecks all checkboxes of a facet name
     *
     * @param {String} facetName - Name of facet to uncheck
     */
    this.uncheckFacet = function (facetName) {
        var children = $("input[name|='chkFacet-" + facetName + "']");
        var parent = $("input[name='chkAllFacet-" + facetName + "']");
        parent.prop("checked", false);
        children.prop("checked", false);
        children.each(function (index, value) {
            var grandChildren = $("#details-container-" + value.id + " > li > input");
            grandChildren.prop("checked", false);
        });
    }
};
