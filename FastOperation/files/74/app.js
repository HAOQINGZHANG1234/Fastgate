/**
 * svg4everybody polyfill for svg external element support in ie9-11
 * only 1.5kb additional, and is a good idea to future use of any svg icon spritesheets.
 * currently used for search facets
 */
!function(a,b){"function"==typeof define&&define.amd?define([],function(){return a.svg4everybody=b()}):"object"==typeof exports?module.exports=b():a.svg4everybody=b()}(this,function(){function a(a,b){if(b){var c=document.createDocumentFragment(),d=!a.getAttribute("viewBox")&&b.getAttribute("viewBox");d&&a.setAttribute("viewBox",d);for(var e=b.cloneNode(!0);e.childNodes.length;)c.appendChild(e.firstChild);a.appendChild(c)}}function b(b){b.onreadystatechange=function(){if(4===b.readyState){var c=b._cachedDocument;c||(c=b._cachedDocument=document.implementation.createHTMLDocument(""),c.body.innerHTML=b.responseText,b._cachedTarget={}),b._embeds.splice(0).map(function(d){var e=b._cachedTarget[d.id];e||(e=b._cachedTarget[d.id]=c.getElementById(d.id)),a(d.svg,e)})}},b.onreadystatechange()}function c(c){function d(){for(var c=0;c<l.length;){var g=l[c],h=g.parentNode;if(h&&/svg/i.test(h.nodeName)){var i=g.getAttribute("xlink:href");if(e&&(!f.validate||f.validate(i,h,g))){h.removeChild(g);var m=i.split("#"),n=m.shift(),o=m.join("#");if(n.length){var p=j[n];p||(p=j[n]=new XMLHttpRequest,p.open("GET",n),p.send(),p._embeds=[]),p._embeds.push({svg:h,id:o}),b(p)}else a(h,document.getElementById(o))}}else++c}k(d,67)}var e,f=Object(c),g=/\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/,h=/\bAppleWebKit\/(\d+)\b/,i=/\bEdge\/12\.(\d+)\b/;e="polyfill"in f?f.polyfill:g.test(navigator.userAgent)||(navigator.userAgent.match(i)||[])[1]<10547||(navigator.userAgent.match(h)||[])[1]<537;var j={},k=window.requestAnimationFrame||setTimeout,l=document.getElementsByTagName("use");e&&d()}return c});
svg4everybody();

var FLloaded = false;
var hoverActive = false;
var refPopupActive = false;
var noRedirect = false;

$(document).ready(function() {

  //GENERAL

  $("[data-action='slide-toggle']").on({
    click: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var target = $(this).data('target');

      $(this).toggleClass('open');
      $(target).slideToggle(150);
    }
  });

  // event handler for sidebar section changes
  $("[data-action='change-section']").on({
    click: function(e) {
      var targetId = $(this).data('target'),
      selectedItem = $('a.sidebar-nav-link.active').data('target'),
      scrollPosition = $('body').scrollTop(),
      contentTop = $('.main-content').first().offset().top;
      $('.modal').modal('hide');

      changeArticleSection(selectedItem, targetId, true);
      if (scrollPosition > contentTop && targetId !== 'articleBody') {
        e.preventDefault();
        $('body').scrollTop(contentTop - 20);
      }
    }
  });

  // event handler for window back/forward buttons

  window.onpopstate = function(event) {
    if(event.state) {
      if(console) console.log('running popstate event handler ' + event.state);
      changeArticleSection(null, event.state.targetSection, false);
      if(event.state.targetSection === 'showMetrics') window.showMetrics();
    }
  };

  /**
   * changeArticleSection - handles all article section changes
   * @param string currentSection - the section the user is currently on, can be null
   * @param string targetSection - the section the user is navigating to
   * @param bool updateHistory - determines whether or not the navigation gets added to the browser history stack
   */
  var changeArticleSection = function(currentSection, targetSection, updateHistory) {
    var navLinkSelector = 'a.sidebar-nav-link',
        sectionSelector = '.page-section',
        currentSectionAttr = '[data-target="' + currentSection + '"]',
        targetSectionAttr = '[data-target="' + targetSection + '"]',
        targetPanel = $('#' + targetSection);

    // check if the target section is different from current section
    if (currentSection !== targetSection) {
      // deactivate current selection
      $(navLinkSelector).removeClass('active');
      targetPanel.siblings(sectionSelector).removeClass('active');


      // activate target section
      $(navLinkSelector + targetSectionAttr).addClass('active');
      $('#' + targetSection).addClass('active');
      
      // construct History data
      if (updateHistory) {
        var historyUrl = window.location.href.split('#')[0] + '#' + targetSection;
        window.history.pushState({targetSection: targetSection}, window.title + ': ' + targetSection, historyUrl);
      }

      // section specific actions
      if (targetSection.indexOf('Figure') > -1) evaluateSlideWidths();

    }
  };

  // on page load/start, load the correct page section if a hash exists:
  if($('body.single-article').length > 0 && window.location.hash.length > 0) {
    var urlHash = window.location.hash;

    if(console) console.log('loading page-section on pageload')
    changeArticleSection(null, urlHash.split('#')[1], false);
    if(urlHash === '#articleMetrics') window.showMetrics();
  }

  var scrollElement = function(scrollElementId, distance) {
    var thisElement = $('#' + scrollElementId),
        elementWidth = thisElement.width(),
        childWidth = thisElement.children().first().width(),
        scrollLeft  = thisElement.scrollLeft();

    if (scrollLeft + distance >= childWidth - elementWidth) {
      thisElement.scrollLeft(childWidth - elementWidth);
    }
    else if (scrollLeft + distance <= 0) {
      thisElement.scrollLeft(0);
    }
    else {
      thisElement.scrollLeft(scrollLeft + distance);
    }

  };

  $(".ft-article-next").on({
    click: function(e) {
      var ltr = $(this).attr('ltr');
      scrollElement('conferenceTableNameYear'+ltr, 250);
    }
  });
  $(".ft-article-prev").on({
    click: function(e) {
      var ltr = $(this).attr('ltr');
      scrollElement('conferenceTableNameYear'+ltr, -250);
    }
  });

  $("#confNavScrollNext").on({
    click: function(e) {
      scrollElement('confNavScroll', 250);
    }
  });
  $("#confNavScrollPrevious").on({
    click: function(e) {
      scrollElement('confNavScroll', -250);
    }
  });
    $("#confNavScrollNext--confTable").on({
    click: function(e) {
      var CurrentId = $('.tab-pane.active > .h-scroll-container > .h-scroll-inner').attr('id');
      scrollElement(CurrentId, 250);
    }
  });
  $("#confNavScrollPrevious--confTable").on({
    click: function(e) {
      var CurrentId = $('.tab-pane.active > .h-scroll-container > .h-scroll-inner').attr('id');
      scrollElement(CurrentId, -250);
    }
  });
$('.thumbnail-scroller').each(function() {
    var self = this;
    $(self).sly({
      horizontal: 1,
      itemNav: 'basic',
      // smart: 1,
      // activateOn: 'click',
      mouseDragging: 1,
      touchDragging: 1,
      releaseSwing: 1,
      startAt: 0,
      // scrollBar: $('#journalArticleScrollbar'),
      scrollBy: 1,
      // pagesBar: $wrap.find('.pages'),
      // activatePageOn: 'click',
      speed: 300,
      elasticBounds: 1,
      // easing: 'easeOutExpo',
      dragHandle: 1,
      dynamicHandle: 1,
      clickBar: 1,

      // Cycling
      cycleBy: 'pages',
      cycleInterval: 1000,
      pauseOnHover: 1,
      startPaused: 1,

      // Buttons
      prevPage: $(self).siblings('.scroll-arrow-left').first(),
      nextPage: $(self).siblings('.scroll-arrow-right').first()
    });
  });

  // ARTICLE

  $('#articleBody').on(
    {
      mouseenter: function() {
        var references;
        var refnumarray = [];
        var checknextdash = 0;
        var checkpreviousdash = 0;
        if ($(this)[0].nextSibling && $(this)[0].nextSibling.nodeValue)
          checknextdash = $(this)[0].nextSibling.nodeValue.charCodeAt(0);
        if ($(this)[0].previousSibling && $(this)[0].previousSibling.nodeValue)
          checkpreviousdash = $(this)[0].previousSibling.nodeValue.charCodeAt($(this)[0].previousSibling.nodeValue.length-1);

        // Check if the next element is a dash.  If so, proceed as a range of references.
        if (checknextdash == 45 || checknextdash == 8208 || checknextdash == 8209 || checknextdash == 8211) {
          var nextref = $(this)[0].nextSibling.nextSibling;
          var firstref = extractReferenceNumbers($(this).data("references"));
          var lastref = extractReferenceNumbers($(nextref).data("references"));
          for (var i=parseInt(firstref); i <= parseInt(lastref); i++) {
            refnumarray.push(i);
          }
        // Check if the previous element is a dash.  If so, proceed as a range of references.
        } else if (checkpreviousdash == 45 || checkpreviousdash == 8208 || checkpreviousdash == 8209 || checkpreviousdash == 8211) { 
          var prevref = $(this)[0].previousSibling.previousSibling;
          var firstref = extractReferenceNumbers($(prevref).data("references"));
          var lastref = extractReferenceNumbers($(this).data("references"));
          for (var i=parseInt(firstref); i <= parseInt(lastref); i++) {
            refnumarray.push(i);
          }
        } else {
          refnumarray = extractReferenceNumbers($(this).data("references"));
        }
        var references = showReferences(refnumarray);
        hoverActive = true;
      },
      mouseleave: function() {
        //closeIfInactive("#referenceInfo");
        hoverActive = false;
      }
    },
    ".ref"
  );

  // Commenting this out to try something real quick. Why is this even here, it just forces hoverActive = false. 
  // $('#referenceInfo').hover(
  //   function() {
  //     hoverActive = true;
  //   },
  //   function() {
  //     hoverActive = false;
  //   }
  // );

  $('#articleBody').on('click', '[data-toggle="modal"]', function(e) {
    var elem = $(this).parent().parent('.figure-image'),
        title = elem.find('.figure-title').text(),
        caption = elem.find('.figure-caption').text(),
        imageSrc = elem.find('.figure').attr('src'),
        modal = $('#figureViewerModal');

    modal.find('.figure-title').text(title);
    modal.find('.figure-caption').text(caption);
    modal.find('.figure').attr('src', imageSrc);
  });

  $('#resetAdvsSearch').on({
    click: function(e) {
      e.preventDefault();
      e.stopPropagation();

      $('#advanced-search-popup').each(function() {
        this.reset();
      });

      $('#advsProceedingSelector,#advsJournalsSelector').each(function(){
        this.selectize.clear();
      });
    }
  });

  $('.sr-list').on('click', '.sri-toggle-extended', function(e) {
    $(this).parent().siblings('.sri-extended').slideToggle(75);
    if ($(this).hasClass('fi-plus')) $(this).removeClass('fi-plus').addClass('fi-minus');
	else $(this).removeClass('fi-minus').addClass('fi-plus');
  });

  $('.sf-list').on({
    'show.bs.collapse': function (e) {
      $(this).parent().toggleClass('expanded');
    },
    'hide.bs.collapse': function (e) {
      $(this).parent().toggleClass('expanded');
    }
  });

  $('.sf-sort-toggle').click(function(e){
    $(this).siblings('.sf-sort-popup').fadeToggle(75);
  });

  $('.sf-sort-popup').click(function(e){
    $(this).fadeToggle(75);
  });

  $('.sf-expanded-toggle').click(function(e){
    e.preventDefault();
    e.stopPropagation();

    $(this).siblings('.sf-expanded-popup').fadeToggle(75);
  });

  $('.sf-expanded-popup a').click(function(e){
    e.preventDefault();
    e.stopPropagation();

    $(this).parent().fadeToggle(75);
  });

});

//new reference div closing script
// rewrite this so you're not just adding an event listener to everything? 
$(document).on('click', function(e) {
  if (!$(e.target).closest('#referenceInfo').length && !$(e.target).closest('.ref').length) {
    $('#referenceInfo').filter(':visible').fadeOut(200);
    refPopupActive = false;
  }
});

//closing reference div on click/tap outside
// $('html').on('touchstart', function() {
//   $('#referenceInfo').filter(":visible").fadeOut(200);
//   refPopupActive = false;
// });

// $('#referenceInfo').on('touchstart', function(e) {
//   e.stopPropagation();
// });

var closeIfInactive = function(element) {
  setTimeout(function(){
    if (!hoverActive) {
      $(element + ':visible').fadeOut(200);
    }
    else {
      closeIfInactive(element);
    }
  }, 5000);
};


var extractReferenceNumbers = function(s) {
  s = s.toString().replace("[",'').replace("]",'');
  var referenceNumbers = [];

  if (s.indexOf(",") > -1) {
    referenceNumbers = s.split(",");
  }
  else if (s.indexOf("–") > -1) {
    var numbers = s.split("–"),
        start = parseInt(numbers[0]),
        end = parseInt(numbers[1]);

    for (var i=start; i <= end; i++) {
      referenceNumbers.push(i);
    }
  }
  else {
    referenceNumbers.push(s);
  }

  return referenceNumbers;
};
/**
 * function showReferences
 * args: int: refnums
 * closes related content dropdown and then dynamically sets the vertical position of the reference container
 * 
 */
var showReferences = function(refnums) {
  var referenceNumbers = refnums,
      formattedReferences = "";
  var referenceContainer = $("#referenceInfo");
  var relatedContent = document.getElementById("toggle-relatedContent");
  
  // if related content dropdown is open, close it
  if (relatedContent && !relatedContent.checked) {
    relatedContent.checked = true;
  }

  var setReferenceTop = function() {
    var elementOffset = Math.round(referenceContainer.offset().top);
    var elementHeight = Math.round(referenceContainer.height());
    var scrollPosition = Math.round($(window).scrollTop());

    if (scrollPosition < elementOffset) {
      return false;
    } else {
      return (scrollPosition - elementOffset) + 425 + 'px';
    }
  };

  for (var i=0; i < referenceNumbers.length; i++) {
    var number = parseInt(referenceNumbers[i]),
        element = $('#ref' + number);

    formattedReferences += '<p>' + element.html() + '</p>';
  };

  referenceContainer.css('top', '');

  referenceContainer.html(formattedReferences).fadeIn(200).css('top', setReferenceTop());
}

var articleNavPositionTimer;

$(window).on('load resize scroll', function() {
  clearTimeout(articleNavPositionTimer);
  positionArticleNav("#articleNav", 20);

  articleNavPositionTimer = setTimeout(function(){
    positionArticleNav("#articleNav", 20);
   }, 20);

});
// resizes slider items on window load or resize
$(window).on('load resize', function() {
  evaluateSlideWidths();
});


var originalArticleNavPosition = null;
var originalWindowWidth = null;

var positionArticleNav = function(selector, margin) {
  var element = $(selector) || null;
  var articleContainer = $('#articleContainer');
  var windowWidth = $(window).width();

  if (element.length === 0) return;

  if (windowWidth !== originalWindowWidth) {
    originalWindowWidth = null
    element.removeClass("affixed").css({'width': '', 'left': ''});
  }

  var topOffset = element.offset().top - margin,
      leftOffset = element.offset().left,
      scrollPosition = $(window).scrollTop(),
      distance = (topOffset - scrollPosition),
      width = element.width(),
      height = element.height(),
      articleHeight = articleContainer.offset().top + articleContainer.height();
      distanceToBottom = articleHeight - (height + scrollPosition + (margin * 2))


  if (windowWidth < 977) {
    element.removeClass("affixed").css({'width': '', 'left': ''});
    return;
  }
  else if (!element.is(':visible')) {
    element.show();
  }

  if (!originalArticleNavPosition) originalArticleNavPosition = topOffset;

  if (distanceToBottom <= 0) {
    element.css({'top': distanceToBottom + 'px'})
    return;
  }
  else if (element.css('top') !== margin + 'px') {
    element.css({'top': margin + 'px'})
  }

  if (scrollPosition > originalArticleNavPosition && !element.hasClass("affixed") | !originalWindowWidth) {
    element.addClass("affixed").css({'width': width, 'left': leftOffset});
    originalArticleNavPosition = topOffset;
    originalWindowWidth = windowWidth;
  }
  else if (scrollPosition < originalArticleNavPosition && element.hasClass("affixed")) {
    element.removeClass("affixed").css({'width': '', 'left': ''});
  }
};

var evaluateSlideWidths = function() {
  var containerWidth = $('.scroller-container').first().width() || false;

  if (containerWidth) {
    var slideWidth = Math.floor((containerWidth / 3 - 20));
	if (slideWidth > 140) slideWidth = 140;
  //adding minimum width check to avoid awkwardly narrow items
  if (slideWidth < 110) slideWidth = 110;
	slideWidth = slideWidth + 'px' ;
    $('.slide').each(function() {
      $(this).width(slideWidth)
      if ($(this).find('img').length > 0) {
        $(this).find('.thumbnail').first().height(slideWidth);
      }
    })
    $('.thumbnail-scroller').each(function() {
      $(this).sly('reload');
    });

  }
};

$('#scrollLeft').on('click', function() {
  $('.h-scroll-inner').first().scrollLeft();
  // function scrollDiv(dir, px) {
  //     var scroller = document.getElementById('scroller');
  //     if (dir == 'l') {
  //         scroller.scrollLeft -= px;
  //     }
  //     else if (dir == 'r') {
  //         scroller.scrollLeft += px;
  //     }
  // }
});

$('#scrollRight').on('click', function() {
  $('.h-scroll-inner').first().scrollRight += 1 ;
});

function sortTopics(type) {
	if (type == 'name') {
		$('ul#mytopic-list>li').tsort('span.toc-name');
		$('ul#topic-list>li').tsort('span.toc-name');
		$('#topicSortName').addClass('selected');
		$('#topicSortCount').removeClass('selected');
	} else if (type == 'count') {
		$('ul#mytopic-list>li').tsort('span.toc-count',{order:'desc'},'span.toc-name');
		$('ul#topic-list>li').tsort('span.toc-count',{order:'desc'},'span.toc-name');
		$('#topicSortName').removeClass('selected');
		$('#topicSortCount').addClass('selected');
	}
}

function sortFeatures(type) {
	if (type == 'year') {
		$('ul#features-list>li').tsort('span.journal-year',{order:'desc'},'span.feature-title');
		$('#featureSortYear').addClass('active');
		$('#featureSortTitle').removeClass('active');
	} else if (type == 'title') {
		$('ul#features-list>li').tsort('span.feature-title');
		$('#featureSortYear').removeClass('active');
		$('#featureSortTitle').addClass('active');
	}
}

function selectTOC(jrnid,volid,issid,tocid) {
	$("#accordion-current").html("Loading...");
	$.get( "/_includes/dynamic/toc-articles.cfm?jrnid="+jrnid+"&volid="+volid+"&issid="+issid+"&tocid="+tocid, function( data ) {
		$( "#accordion-current" ).html( data );
	});
	$("#showAllTopicsLink").removeClass("selected");
	$("#showMyTopicsLink").removeClass("selected");
	$(".sidebar__topic").removeClass("disableLink");
	$(".xouttoc").hide();
	$("#xout"+tocid).show();
	element_to_scroll_to = document.getElementById('accordion-current');
	element_to_scroll_to.scrollIntoView();
  //testing some class addition for link disabling
  $(".xouttoc" +tocid).siblings(".sidebar__topic").addClass("disableLink");
	window.location.hash = "#toc_"+tocid;
}

function selectVirtualTOC(vid,tocid) {
	$("#accordion-current").html("Loading...");
	$.get( "/_includes/dynamic/toc-articles.cfm?vid="+vid+"&tocid="+tocid, function( data ) {
		$( "#accordion-current" ).html( data );
	});
	$(".xouttoc").hide();
	$("#xout"+tocid).show();
	element_to_scroll_to = document.getElementById('accordion-current');
	element_to_scroll_to.scrollIntoView();
	window.location.hash = "#toc_"+tocid;
}

function selectSpotlightTopic(month,year,panelist,tecid) {
	$("#accordion-current").html("Loading...");
	$.get( "/_includes/dynamic/spotlight-articles.cfm?sort=techdiv&month="+month+"&year="+year+"&panelist="+panelist+"&techdivid="+tecid, function( data ) {
		$( "#spotlight-articles-div" ).html( data );
	});
	$(".xouttec").hide();
	$("#xout"+tecid).show();
	element_to_scroll_to = document.getElementById('spotlight-articles-div');
	element_to_scroll_to.scrollIntoView();
}

function sortIssueBy(type) {
	$.get( "/_includes/dynamic/toc-articles.cfm?jrnid="+thisJournal+"&volid="+thisVolume+"&issid="+thisIssue+"&sort="+type, function( data ) {
		$( "#accordion-current" ).html( data );
	});
	if (type == "toc") {
		$("#sortByTopic").addClass("active");
		$("#sortByPage").removeClass("active");
	} else if (type == "page") {
		$("#sortByTopic").removeClass("active");
		$("#sortByPage").addClass("active");
	}
	window.location.hash = "#sort_"+type;
}
function showAllTopics() {
	$.get( "/_includes/dynamic/toc-articles.cfm?jrnid="+thisJournal+"&volid="+thisVolume+"&issid="+thisIssue, function( data ) {
		$( "#accordion-current" ).html( data );
	});
	$("#showAllTopicsLink").addClass("selected");
	$("#showMyTopicsLink").removeClass("selected");
}
function showAllTopicsV() {
	$.get( "/_includes/dynamic/toc-articles.cfm?vid="+thisVid, function( data ) {
		$( "#accordion-current" ).html( data );
	});
}
function showAllSpotlight() {
	$.get( "/_includes/dynamic/spotlight-articles.cfm?month="+thisMonth+"&year="+thisYear+"&panelist="+thisPanelist+"&sort=techdiv", function( data ) {
		$( "#spotlight-articles-div" ).html( data );
	});
}
function showMyTopics() {
	$.get( "/_includes/dynamic/toc-articles.cfm?jrnid="+thisJournal+"&volid="+thisVolume+"&issid="+thisIssue+"&mytopics=true", function( data ) {
		$( "#accordion-current" ).html( data );
	});
	$("#showAllTopicsLink").removeClass("selected");
	$("#showMyTopicsLink").addClass("selected");
}
function sortUpcomingBy(type) {
	if (type == "issue" && currentSort == "published") {
		$.get( "/_includes/dynamic/multiple-upcoming-display.cfm?jrnid="+thisJournal, function( data ) {
			$( "#accordion-in-progress" ).html( data );
		});
		$("#sortByPublished").removeClass("active");
		$("#sortByIssue").addClass("active");
		currentSort = "issue";
	} else if (type == "published" && currentSort == "issue") {
		$.get( "/_includes/dynamic/toc-articles.cfm?jrnid="+thisJournal+"&sort=published&upcoming=true", function( data ) {
			$( "#accordion-in-progress" ).html( data );
		});
		$("#sortByPublished").addClass("active");
		$("#sortByIssue").removeClass("active");
		currentSort = "published";
	}
}
function showAllUpcomingTopics() {
	$.get( "/_includes/dynamic/multiple-upcoming-display.cfm?jrnid="+thisJournal, function( data ) {
		$( "#accordion-in-progress" ).html( data );
	});
	$("#showAllTopicsLink").addClass("selected");
	$("#showMyTopicsLink").removeClass("selected");
}
function showMyUpcomingTopics() {
	$.get( "/_includes/dynamic/multiple-upcoming-display.cfm?jrnid="+thisJournal+"&mytopics=true", function( data ) {
		$( "#accordion-in-progress" ).html( data );
	});
	$("#showAllTopicsLink").removeClass("selected");
	$("#showMyTopicsLink").addClass("selected");
}
function showFL(getvars) {
	if (FLloaded == false) {
		document.getElementById("forwardlinks").innerHTML = "<p>Retrieving forward links...</p>";
		$.get("/abstract_forwardlinks.cfm?" + getvars, function (data) {
			$("#forwardlinks").html(data);
			document.getElementById("numrefs").innerHTML = document.getElementById("refcount").innerHTML;
		});
		FLloaded = true;
	}
}
function chooseLetter(obj) {
	$(".ltr-btn").removeClass("active");
	$(obj).addClass("active");
}
	
function highlightRef(refid) {
	$("#"+refid).addClass("bg-warning");
	setTimeout(function() {
		$("#"+refid).removeClass("bg-warning");
	}, 2000);
}

$("a.ref").click(function (e) { 
  e.preventDefault();
  if (refPopupActive === false) {
    $("#referenceInfo").fadeIn(200);
    refPopupActive = true;
  }
});

$(document).ready(function(){
	$(".loginErr").toggle(false);
	$(".loginLoading").toggle(false);
	$("#loginButton,#pageLoginButton").click(function(){	
		  username=$("#inputEmail").val() != "" ? $("#inputEmail").val() : $("#pageInputEmail").val();
		  password=$("#inputPassword").val() != "" ? $("#inputPassword").val() : $("#pageInputPassword").val();
		  rememberme=$("#rememberme").is(':checked') ? 1 : 0;
		  $.ajax({
		   type: "POST",
		   url: "/login.cfm",
			data: "email="+encodeURIComponent(username)+"&password="+encodeURIComponent(password)+"&rememberme="+rememberme,
		   success: function(html){ 
			if(html=='Success') {
			 if ($("#redirectURL").length && $("#redirectURL").val() != "" && !noRedirect)
			  location.href = $("#redirectURL").val();
			 else
			  location.reload();
			} else {
		    $(".loginLoading").toggle(false);
			 $(".loginErr").html(html);
			 $(".loginErr").toggle(true);
			}
		   },
		   error: function(html){
		    $(".loginLoading").toggle(false);
		    $(".loginErr").html("Connection error. Please try again later.");
		    $(".loginErr").toggle(true);
		   }
		   ,beforeSend:function()
		   {
		    $(".loginErr").toggle(false);
		    $(".loginLoading").toggle(true);
		   }
		  });
		return false;
	});
	$("#topSearch").click(function(event){
		event.preventDefault();
		doTopSearch();
	});
	if (window.location.href.indexOf("search.cfm") < 0 && window.location.href.indexOf("results.html") < 0) {
		$("#cmdSearch").click(function(){
			doTopSearch();
		});
	}
	$("#topSearchText,#txtSearch,#authorSearch").keyup(function(event) {
		if(event.keyCode == 13){
			event.preventDefault();
			doTopSearch();
		}
	});
	$("#journalSearchKeyword,#journalSearchVol,#journalSearchIss,#journalSearchPage").keyup(function(event) {
		if(event.keyCode == 13){
			doJournalSearch();
		}
	});
	$("#topSearchMobile").click(function(){
		doTopSearchMobile();
	});
	$("#journalSearch").click(function(){
		doJournalSearch();
	});
	$("#conferenceSearch").click(function(){
		doConferenceSearch();
	});
	$("#confyearselect").change(function() {
		var mid = $("#confyearselect option:selected").val();
		var yr = $("#confyearselect option:selected").text();
		document.location = '/conference.cfm?meetingid='+mid+'&yr='+yr;
	});
	$(".navextras").click(function() {
		$("#backtonav").show();
		$("#leftarticlenav").hide();
	});
	$("#backtonav").click(function() {
		$("#backtonav").hide();
		$("#leftarticlenav").show();
	});

  // preventing citation drop-down from closing when clicked on 
	// $("#getCitation").on("mousedown", function(e) { e.stopPropagation(); }); 
	// $("#getCitation").on("mouseup", function(e) { e.stopPropagation(); }); 
	// $("#getCitation").on("click", function(e) { e.stopPropagation(); }); 

	$(".xouttoc").on("click", function(e) {
		e.stopPropagation();
		$("#accordion-current").html("Loading...");
		$(this).siblings(".sidebar__topic").removeClass("disableLink");
		if ($(this).hasClass("virtual"))
			showAllTopicsV();
		else
			showAllTopics();
		$(this).hide();
		element_to_scroll_to = document.getElementById('accordion-current');
		element_to_scroll_to.scrollIntoView();
	});
	$(".xouttec").on("click", function(e) {
		e.stopPropagation();
		$("#spotlight-articles-div").html("Loading...");
		showAllSpotlight();
		$(this).hide();
		element_to_scroll_to = document.getElementById('spotlight-articles-div');
		element_to_scroll_to.scrollIntoView();
	});

	// Mary's accordion JS from osa.org
	$('.collapse').on('show.bs.collapse', function() {
		$(this).siblings().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
	 }).on('hide.bs.collapse', function(){
	    $(this).siblings().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
	});

  // Adding blue-gradient class to accordions when they are the active category
  
  // grabs the substring of the url after the domain. Looks for the first forward slash after skipping the protocol (https:// is the longest we use)
  var currentUrl = window.location.href.substr(window.location.href.indexOf('/', 8));
  // reset accordions so none of them are expanded
  $('resource-group > .osap-accordion__label').attr('checked');
  // compares urls of links in accordions to the current url, and then highlights the closest parent osap-accordion__label
  $('.resource-sub-links a').each(function() {
    var checkUrl = $(this).attr('href');
    if (checkUrl == currentUrl) {
      // highlights the current link 
      $(this).addClass('currentPage');
      // expands the parent accordion so the current page is visible
      $(this).closest('.osap-accordion__content').siblings('.osap-accordion__toggle').removeAttr('checked');
      return false;
    }
  });
});

function searchQueryString() {
	if ($("#txtSearch").val() != "") searchString = 'q=' + $("#txtSearch").val();
	else searchString = 'q=' + $("#topSearchText").val();
	if ($("#chkOtrResource").is(":checked")) searchString = searchString + '&mm=1';
	if ($("#chk-searchin-metadata").is(":checked")) searchString = searchString + '&meta=1';
	if ($("#chk-searchin-all").is(":checked")) searchString = searchString + '&full=1';
	if ($("#authorSearch").val() != "") searchString = searchString + '&a=' + $("#authorSearch").val();
	if ($("#chkAll").is(":checked")) searchString = searchString + '&aa=all';
	if ($("#chkAllTopic").is(":checked")) searchString = searchString + '&at=all';
	if ($("#advsJournalsSelector").val() != "") searchString = searchString + '&j=' + $("#advsJournalsSelector").val();
	if ($("#volSearch").val() != "") searchString = searchString + '&v=' + $("#volSearch").val();
	if ($("#issueSearch").val() != "") searchString = searchString + '&i=' + $("#issueSearch").val();
	if ($("#pageSearch").val() != "") searchString = searchString + '&p=' + $("#pageSearch").val();
	if ($("#advsProceedingSelector").val() != "") searchString = searchString + '&c=' + $("#advsProceedingSelector").val();
	if ($("#yearSearch").val() != "") searchString = searchString + '&y=' + $("#yearSearch").val();
	if ($("#sessionPagerSearch").val() != "") searchString = searchString + '&s=' + $("#sessionPagerSearch").val();
	if ($("#chkJournals").is(":checked")) searchString = searchString + '&cj=1';
	else searchString = searchString + '&cj=0';
	if ($("#chkConferences").is(":checked")) searchString = searchString + '&cc=1';
	else searchString = searchString + '&cc=0';
	if ($("#startYear").val() != "") searchString = searchString + '&sy=' + $("#startYear").val();
	if ($("#endYear").val() != "") searchString = searchString + '&ey=' + $("#endYear").val();
	if ($("#advTopicsSelectedList div a").length > 0) {
		var categorySelectedList = $("#advTopicsSelectedList div a");
		var categoryList = "";
		for (var i=0; i<categorySelectedList.length; i++) {
			var entry = $(categorySelectedList[i]);
			var datavalue = entry.attr("data-value");
			categoryList = categoryList + datavalue + ",";
		}
		if (categoryList.length > 0) searchString = searchString + "&t=" + categoryList.substring(0,categoryList.length-1);
	}
	if ($("input[name='specialcollections']:checked").val() !== undefined) searchString = searchString + '&sc=' + $("input[name='specialcollections']:checked").val();
	return searchString;
}

function saveSearch() {
	window.open('/user/alert_edit.cfm?' + searchQueryString());
}

function doTopSearch() {
	document.location = '/search.cfm?' + searchQueryString();
}

function doTopSearchMobile() {
	document.location = '/search.cfm?q=' + $("#topSearchTextMobile").val();
}

function doJournalSearch() {
	document.location = '/search.cfm?q=' + $("#journalSearchKeyword").val() + '&j=' + $("#journalSearchJournal").val() + '&v=' + $("#journalSearchVol").val() + '&i=' + $("#journalSearchIss").val() + '&p=' + $("#journalSearchPage").val();
}

function doConferenceSearch() {
	if ($("#conferenceSearchConference").val()) c = $("#conferenceSearchConference").val();
	else c = 'all';
	document.location = '/search.cfm?q=' + $("#conferenceSearchKeyword").val() + '&c=' + c + '&s=' + $("#conferenceSearchPaper").val() + '&y=' + $("#conferenceSearchYear").val();
}

function checkboxActions(actionInput) {
	var actform = document.articlesForm;
	var article_checked = false;
	if (actionInput.length > 7 && actionInput.substr(0,7) == "export_") {
		actform.ArticleAction.value = actionInput;
		actform.action = "/custom_tags/IB_Download_Citations.cfm";
	} else if (actionInput == "savetofav") {
		actform.action = "/user/favorites_add_article.cfm";
		actform.target = "_blank";
	} else {
		alert("Please select an action");
		return false;
	}

	// Accomodate hidden field if calling from abstract page
	if (actform.articles[0] && actform.articles[0].type == "checkbox") {
		for (i=0; i<actform.articles.length; i++) {
			if (actform.articles[i].checked == true) article_checked = true;
		}
	} else if (actform.articles.type == "checkbox") {
		if (actform.articles.checked == true) article_checked = true;
	} else if (actform.articles.value != "") {
		article_checked = true;
	}

    if (!article_checked) {
		alert("Please select an article (by clicking one or more article checkboxes) before proceeding.");
		return false;
	}

	actform.submit();
}

function tocCheckAll(obj,cls) {
	if (obj.checked == true) {
		$("."+cls).prop('checked',true);
	} else {
		$("."+cls).prop('checked',false);
	}
}

function popUpWindow(URL,w,h) {
	day = new Date();
	id = day.getTime();
	eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,width="+w+",height="+h+"');");
}

// Sortable tables
var aAsc = [];
function sortTable(e) {
	var nr = $(e.currentTarget).index();
	aAsc[nr] = aAsc[nr]=='asc'?'desc':'asc';
	$('.table-striped>tbody>tr').tsort('td:eq('+nr+')',{attr:'abbr',order:aAsc[nr]});
}
$('.table-striped').find('thead th:last').siblings().andSelf().on('click',sortTable);

function updateSortIcons(x) {
	$('.conf-icon-sort').toggle(false);
	$('.confsort'+x).toggle(true);
}

// pause videos on modal close
// listens for the bootstrap modal close event
// then finds the id attribute of the closing modal's video child (should only be one!)
// and passes this id to the videojs API and calls the pause method

// note that you need to give the modal divs the class 'modal-bc' if you want this functionality to work
$('.modal-bc').on('hide.bs.modal', function modalPauseVideos() {
  var videoID = $(this).find('video').attr('id');
  videojs(videoID).pause();
})

function ajaxDiv(url,div) {
	$.get(url, function( data ) {
		$("#" + div).html( data );
	});
}

// controlling tabs with mobile-only dropdown
// listens for changes to confNavSelect, fires the bootstrap .tab method

$('#confNavSelect').change(function() {
  var yearSelected = $('#confNavSelect option:selected');
  yearSelected.tab('show');
})

// Get citation menu behavior javascript
// I'm not using vanilla bootstrap data-toggles because those close the dropdown when you click inside
// stop propagation was what we used, but it was inconsistent and is not the best idea in general

// opening the citation dropdown on click
$('.js-article-dropdown-toggle').on('mouseup', function(event) {
  // close other open dropdowns in article-tools
  $('.article-tools .js-article-dropdown.open').removeClass('open');
  $(event.target).closest('.js-article-dropdown').toggleClass("open");
});

// closing the citation dropdown when the user clicks outside the dropdown
$(document).on('mouseup', function(event) {
  if (!$(event.target).closest('.js-article-dropdown').length) {
    $('.js-article-dropdown').removeClass('open');
  }
});

//opening the optics and photonics help dropdown on click
$('#topicsHelp__toggle').on('mouseup', function(event) {
  $('#topicsHelp').toggleClass("open");
});

//opening the EPUB help dropdown on click
$('#epubHelp__toggle').on('mouseup', function(event) {
  $('#epubHelp').toggleClass("open");
});

// closing the citation dropdown when the user clicks outside the dropdown
$(document).on('mouseup', function(event) {
  if(!$(event.target).closest('.get-citation').length) {
    $('div.get-citation').removeClass('open');
  }
});

$(document).ready(function() {
  // adding event handlers to MathJax configuration link
  var mathControls = $('.math-controls');
  if(mathControls.length) {
    mathControls.on('click', function(e) {
      $(this).siblings().find('span[id^=MathJax-Element]').trigger('contextmenu');
      //mathElement.trigger("contextmenu");
    });
  }

  // sessionStorage for cookie notification close button
  // using strings because session storage only stores strings 
  var showCookieWindow = sessionStorage.getItem('showCookieWindow') || 'true';
  if (document.querySelector('#cookiePopup') && showCookieWindow === 'true') {
    document.querySelector('#cookiePopup').classList.remove('hidden');
  }

  $('#cookiePopupClose').on('click', function() {
    sessionStorage.setItem('showCookieWindow', 'false');
  });
});

function preventRedirect() { noRedirect = true; }
