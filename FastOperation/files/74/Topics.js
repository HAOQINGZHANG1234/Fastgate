
var Topics = function (type) {
	this.termHierarchy = {};
	this.termArray = [];
	this.names = {};
	this.showcount;
	this.topictype;
	var _self = this;
	
	// Initialize object creation based on which type you are creating
	// Don't forget to call init at the bottom of this object
	this.init = function(type) {
		// Set up div, class, and input names
		_self.topictype = type;
		if (type == 'facet') {
			_self.showcount = true;
			_self.names.selectedlist = "moreSelectedList";
			_self.names.input = "moreTerm";
			_self.names.divlist = "more-terms";
			_self.names.inputbox = "input-all-level2";
		} else if (type == 'adv') {
			_self.showcount = false;
			_self.names.selectedlist = "advTopicsSelectedList";
			_self.names.input = "advMoreTerm";
			_self.names.divlist = "adv-more-terms";
			_self.names.inputbox = "advsTopicsSelector";
		}
	};

    /**
     * The term hierarchy puts the entire result set into JS object structure for quick access when browsing through colums
	 * This also populates the term array which is used for autocomplete
     */
    this.populateTermHierarchy = function (level2, level3, level4) {
		var l2 = _self.topictype == 'adv' ? level2.DL : level2;
		var l3 = _self.topictype == 'adv' ? level3.DL : level3;
		var l4 = _self.topictype == 'adv' ? level4.DL : level4;

		for (var i=0; i<l2.length; i++) {
			var term = _self.topictype == 'adv' ? l2[i] : $(l2[i]).prop("value");
			if (term && term != "") {
				var cnt = _self.showcount == true ? $(l2[i]).attr("count") : "";
				_self.termHierarchy[term] = {};
				_self.termHierarchy[term].count = cnt;
				_self.termArray.push({label: term, value: cnt+"~"+term})
			}
		}
		for (var i=0; i<l3.length; i++) {
			var l3value = _self.topictype == 'adv' ? l3[i] : $(l3[i]).prop("value");
			if (l3value && l3value != "") {
				var l2term = l3value.substring(0,l3value.indexOf("|"));
				var l3term = l3value.substring(l3value.indexOf("|")+1,l3value.length);
				var cnt = _self.showcount == true ? $(l3[i]).attr("count") : "";
				_self.termHierarchy[l2term][l3term] = {}
				_self.termHierarchy[l2term][l3term].count = cnt;
				_self.termArray.push({label: l3term, value: cnt+"~"+l3value})
			}
		}
		for (var i=0; i<l4.length; i++) {
			var l4value = _self.topictype == 'adv' ? l4[i] : $(l4[i]).prop("value");
			var l4valueorig = l4value;
			if (l4value && l4value != "") {
				var l2term = l4value.substring(0,l4value.indexOf("|"));
				l4value = l4value.substring(l4value.indexOf("|")+1,l4value.length);
				var l3term = l4value.substring(0,l4value.indexOf("|"));
				var l4term = l4value.substring(l4value.indexOf("|")+1,l4value.length);
				var cnt = _self.showcount == true ? $(l4[i]).attr("count") : "";
				_self.termHierarchy[l2term][l3term][l4term] = {}
				_self.termHierarchy[l2term][l3term][l4term].count = cnt;
				_self.termArray.push({label: l4term, value: cnt+"~"+l4valueorig})
			}
		}
		_self.termArray.sort(function(a, b){
			var a1= a.label.toLowerCase(), b1= b.label.toLowerCase();
			if (a1==b1) {
				var a2= a.value.toLowerCase(), b2= b.value.toLowerCase();
				var a2s= a2.split("|"), b2s= b2.split("|");
				if (a2s.length == b2s.length)
					return a2>b2? 1:-1;
				else a2s.length>b2s.length? 1:-1;
			}
			return a1> b1? 1: -1;
		});
		// Differentiate terms from different trees with the same name
		/*for (var i=0; i<_self.termArray.length; i++) {
			var changelabel = false;
			for (var j=0; j<_self.termArray.length; j++) {
				if (j!=i && _self.termArray[i].label == _self.termArray[j].label) {
					changelabel = true;
					break;
				}
			}
			if (changelabel == true) {
				var incategory = _self.termArray[i].value.substring(_self.termArray[i].value.indexOf('~')+1).split("|");
				if (incategory.length > 1) {
					incategory = incategory[0] + (incategory.length > 2 ? " > " + incategory[1] : "");
					_self.termArray[i].displabel = _self.termArray[i].label + " (in " + incategory + ")";
				}
			}
		}*/
	};
	
	this.isExpandable = function(term) {
		var tokens = term.split("|");
		var ret = false;
		if (tokens.length == 1) {
			$.map(_self.termHierarchy[tokens[0]], function(v,k) {
				if (k != "count" && k != "") ret = true;
			});
		} else if (tokens.length == 2) {
			$.map(_self.termHierarchy[tokens[0]][tokens[1]], function(v,k) {
				if (k != "count" && k != "") ret = true;
			});
		}
		return ret;
	}

	this.getMoreTermCol = function(level,selected) {
		var divname = _self.names.selectedlist;
		var inputname = _self.names.input;
		var str = '';
		var i=-1;
		var checked = "";
		if (level == 2) {
			$.each(_self.termHierarchy, function(key, value) {
				i++;
				var dv = key;
				var isx = _self.isExpandable(dv);
				if ($("#"+divname+" div a[data-value='"+dv+"']").length) checked = "checked"; else checked = "";
				str += _.template(Template.moreTermValueTpl, {
				name: inputname+"-level2", dataValue: key, clazz: 'style="font-weight:normal"', isx: isx, inputname: inputname,
				valName: key, valCount: value.count != "" ? "("+value.count+")" : "", display: "", checked: checked, boxstyle: ""});
			});
		} else if (level == 3) {
			str+= _.template(Template.moreTermColumHeaderTpl, { name: selected });
			$.each(_self.termHierarchy[selected], function(key, value) {
				if (key != 'count') {
					i++;
					var dv = selected+"|"+key
					var isx = _self.isExpandable(dv);
					if ($("#"+divname+" div a[data-value='"+dv+"']").length) checked = "checked"; else checked = "";
					str += _.template(Template.moreTermValueTpl, {
					name: inputname+"-level3", dataValue: dv, clazz: 'style="font-weight:normal"', isx: isx, inputname: inputname,
					valName: key, valCount: value.count != "" ? "("+value.count+")" : "", display: "", checked: checked, boxstyle: ""});
				}
			});
		} else if (level == 4) {
			var split = selected.split("|");
			str+= _.template(Template.moreTermColumHeaderTpl, { name: split[1] });
			$.each(_self.termHierarchy[split[0]][split[1]], function(key, value) {
				if (key != 'count') {
					i++;
					var dv = split[0]+"|"+split[1]+"|"+key;
					var isx = _self.isExpandable(dv);
					if ($("#"+divname+" div a[data-value='"+dv+"']").length) checked = "checked"; else checked = "";
					str += _.template(Template.moreTermValueTpl, {
					name: inputname+"-level4", dataValue: dv, clazz: 'style="font-weight:normal"', isx: isx, inputname: inputname,
					valName: key, valCount: value.count != "" ? "("+value.count+")" : "", display: "", checked: checked, boxstyle: ""});
				}
			});
		}
		return str;
	};
	
	this.addSelectedTerm = function (data, count) {
		// values to populate data-topic attr for checking with event listener
		var finalTopic = "",
				facetDivSelector = ""; 
		if ($("#"+_self.names.selectedlist+" div a[data-value='"+data+"']").length == 0) {  // Do not add duplicates
			var split = data.split("|");
			var addSel = "";
			for (var i=0; i<split.length; i++) {
				if (i == split.length-1) {
					// This is the last token - the topic selected
					addSel += '<span class="sf-authors-bold">'+split[i]+'</span>';
					finalTopic = split[i];
					facetDivSelector = '.selected-facet[data-topic=\'' + finalTopic + '\']';
				} else {
					addSel += split[i];
					// Remove parent topics from the selection
					_self.deleteSelectedTerm(addSel.replace(" > ","|"),false);
				}
				if (i < split.length-1) addSel += " > ";
			}
			var addHtml = _.template(Template.moreTermSelTpl, {
				val: addSel, dataValue: data, cnt: count, finalTopic: finalTopic
			});
			$("#"+_self.names.selectedlist).append(addHtml);
			$("#"+_self.names.selectedlist+" div a[data-value='"+data+"'] span").click(function(event) {
				event.preventDefault();
				_self.deleteSelectedTerm(data,true);
			});
			_self.handleIndeterminiteStates(data, true);
			
			// For saved search, add to hiden field
			if ($("#savedsearchtopiclist").length) {
				var sslist = $("#savedsearchtopiclist").val();
				if (sslist == "") $("#savedsearchtopiclist").val(data);
				else $("#savedsearchtopiclist").val(sslist+","+data);
			}
		}
		if (_self.topictype == 'adv') {
			$(".selectedtopicsadv").show();
		}
		// hover event for selected topics; attach when loaded
    $(facetDivSelector + ' > .selected-facet_close').on({
        mouseenter: function(e) {
						$(facetDivSelector).addClass('bg-success');
        },
        focusin: function(e) {
						$(facetDivSelector).addClass('bg-success');
        },
        mouseleave: function(e){
						$(facetDivSelector).removeClass('bg-success');
    },
        focusout: function(e){
						$(facetDivSelector).removeClass('bg-success');
        }
    });
	};
	
	this.deleteSelectedTerm = function (data, deleteall) {
		if (deleteall) { var allterms = _self.findDupeTerms(data); }
		else { var allterms = [data]; }
		for (var i=0; i<allterms.length; i++) {
			$("#"+_self.names.selectedlist+" div a[data-value='"+allterms[i]+"']").parent().remove();
			$("input[name|='"+_self.names.input+"'][data-value='"+allterms[i]+"']").prop("checked",false);
			_self.handleIndeterminiteStates(allterms[i], false);
		}
		if (_self.topictype == 'adv' && $("#"+_self.names.selectedlist+" div").length == 0) {
			$(".selectedtopicsadv").hide();
		}
		// For saved search, add to hiden field
		if ($("#savedsearchtopiclist").length) {
			var sslist = $("#savedsearchtopiclist").val();
			var tmp = sslist.split(",");
			for (var i=tmp.length-1; i>=0; i--) {
				if (tmp[i] == data) {
					tmp.splice(i,1);
					break;
				}
			}
			$("#savedsearchtopiclist").val(tmp.join());
		}
	};
	
	this.findDupeTerms = function(data) {
		var split = data.split("|");
		var term = split[split.length-1];
		var dupes = [];
		for (var i=0; i<_self.termArray.length; i++) {
			if (_self.termArray[i].label == term) {
				var value =  _self.termArray[i].value;
				value = value.substring(value.lastIndexOf('~')+1);
				dupes.push(value);
			}
		}
		return dupes;
	}
	
	this.refreshCols = function() {
		var firstcol = _self.getMoreTermCol(2,null);
		var col = _.template(Template.moreTermsListTpl, {
			val: firstcol
		});
		$("#"+_self.names.divlist+"-col1").html(col);
		$("#"+_self.names.divlist+"-col2").html("");
		$("#"+_self.names.divlist+"-col3").html("");
		_self.initializeMoreTerms();
	}

    this.initializeMoreTerms = function () {
		var boxes = $("input[name='"+_self.names.input+"-level2'],input[name='"+_self.names.input+"-level3'],input[name='"+_self.names.input+"-level4']");
		var arrows = $("a."+_self.names.input+"-expandin");
		boxes.unbind();
		boxes.click(function(event) {
			var data = $(this).attr("data-value");
			if (_self.showcount == true) {
				var count = $(this).next('div').find('span').text();
				count = count.substring(count.indexOf('(')+1,count.indexOf(')'));
			} else {
				var count = null;
			}
			if ($(event.target).prop("checked")) {
				_self.addSelectedTerm(data,count);
			} else {
				_self.deleteSelectedTerm(data,true);
			}
        });
		arrows.unbind();
		arrows.click(function(event) {
			event.preventDefault();
			// Find all underlying terms
			var prev = $(this).prev("div");
			var clicked = $(prev).attr("data-value");
			var split = clicked.split("|");
			if (split.length == 1) {
				// Level 2 clicked
				var secondCol = _self.getMoreTermCol(3,clicked);
				var col2 = _.template(Template.moreTermsListTpl, {
					val: secondCol
				});
				$("#"+_self.names.divlist+"-col2").html(col2);
				$("#"+_self.names.divlist+"-col3").html("");
				$("div[name='text-"+_self.names.input+"-level2']").parent().removeClass("more-term-inside-here");
				$(prev).parent().addClass("more-term-inside-here");
			} else if (split.length == 2) {
				// Level 3 clicked
				var thirdCol = _self.getMoreTermCol(4,clicked);
				var col3 = _.template(Template.moreTermsListTpl, {
					val: thirdCol
				});
				$("#"+_self.names.divlist+"-col3").html(col3);
				$("div[name='text-"+_self.names.input+"-level3']").parent().removeClass("more-term-inside-here");
				$(prev).parent().addClass("more-term-inside-here");
			}

			_self.initializeMoreTerms();
        });

		_self.handleIndeterminiteStates(null,true);
    };

	this.handleIndeterminiteStates = function (data, add) {
		if (!data) {
			var dArray = [];
			$.each($("#"+_self.names.selectedlist+" div a"), function(index, value) {
				dArray.push($(value).attr("data-value"));
			});
		} else {
			var dArray = [data];
		}

		for (var i=0; i<dArray.length; i++) {
			var split = dArray[i].split("|");
			// Manipulate indeterminate states - above current selection
			if (split.length > 2) {
				var level3 = $("input[name|='"+_self.names.input+"'][data-value='"+split[0]+"|"+split[1]+"']");
				var others = $("input[name|='"+_self.names.input+"'][data-value^='"+split[0]+"|"+split[1]+"|']:checked");
				if ($(level3).prop("checked") == false && (add || others.length==0)) {
					$(level3).prop("indeterminate",add);
					(add == true) ? $(level3).addClass("chk-indeterminate") : $(level3).removeClass("chk-indeterminate");
				}
			}
			if (split.length > 1) {
				var level2 = $("input[name|='"+_self.names.input+"'][data-value='"+split[0]+"']");
				var others = $("input[name|='"+_self.names.input+"'][data-value^='"+split[0]+"|']:checked");
				if ($(level2).prop("checked") == false && (add || others.length==0)) {
					$(level2).prop("indeterminate",add);
					(add == true) ? $(level2).addClass("chk-indeterminate") : $(level2).removeClass("chk-indeterminate");
				}
			}
			// Manipulate indeterminite states - below current selection
			var boxunder = $("input[name|='"+_self.names.input+"'][data-value^='"+dArray[i]+"|']");
			$.each(boxunder, function (index, value) {
				if ($(boxunder[index]).prop("checked") == false) {
					$(boxunder[index]).prop("indeterminate",add);
					(add == true) ? $(boxunder[index]).addClass("chk-indeterminate") : $(boxunder[index]).removeClass("chk-indeterminate");
				}
			});
		}
	};

    /**
     * This function is to pass all the TERMS facet list to three columns for the popUp
     * @param {String} facetType - Name of facet type selected.
     * @param {Array} arrayLi - Array objects that contains objects to draw the checkboxes in the popUp.
     */
    this.passToColumnsTerms = function (arrayLi) {
        var str1 = "";
        
        for (var i = 0; i < arrayLi.length; i++) {
            str1 += $(arrayLi[i]).prop('outerHTML');
        }
        
        return str1;
    };

	/**
     * This function initializes more terms popup autocomplete
     *
     */
    this.initializeMoreTermsAutocomplete = function () {
        $("#"+_self.names.inputbox).autocomplete({
            minLength: 1,
            delay: 100,
            source: _self.termArray,
			response: function (event, ui) {
				// Removes duplicate answers
				var remove = [];
				for (var i = 0; i<ui.content.length; i++) {
					for (var j = 0; j < i; j++) {
						if (ui.content[i].label == ui.content[j].label) {
							remove.push(i); break;
						}
					}
				}
				for (var i = remove.length-1; i>=0; i--) {
					ui.content.splice(remove[i],1);
				}
			},
			select: function (event, ui) {
				var label = ui.item.label;
				// Add all matching terms from different paths
				for (var i = 0; i < _self.termArray.length; i++) {
					if (_self.termArray[i].label == label) {
						var dv = _self.termArray[i].value;
						if (_self.showcount == true) var count = dv.substring(0,dv.indexOf("~"));
						else var count = "";
						var data = dv.substring(dv.indexOf("~")+1);
						_self.addSelectedTerm(data,count);
					}
				}
				$("#"+_self.names.inputbox).val("");
				return false;
			}
        })
		.data("ui-autocomplete")._renderItem = function( ul, item ) {
			var txt = $("#"+_self.names.inputbox).val();
			return $( "<li>" )
			.append( "<a>" + item.label.replace(new RegExp("(" + $.ui.autocomplete.escapeRegex(txt) + ")", "gi"), "<span style=\"background-color: yellow\">$1</span>") + "</a>" )
			.appendTo( ul );
		};
    };

	this.findCount = function(t) {
		var tokens = t.split("|");
		if (tokens.length == 1)
			return _self.termHierarchy[t].count;
		else if (tokens.length == 2)
			return _self.termHierarchy[tokens[0]][tokens[1]].count;
		else if (tokens.length == 3)
			return _self.termHierarchy[tokens[0]][tokens[1]][tokens[2]].count;
		else return 0;
	};

	this.init(type);
};