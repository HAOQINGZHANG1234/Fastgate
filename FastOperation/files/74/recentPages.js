var pagesLoaded = false;
var pageReload = false;
var storedPages = [];
var maxPages = 8;
function loadRecentPages() {
	if (pagesLoaded == false) {
		if (localStorage["pages"]) {
			// Retrieve history from local Storage
			storedPages = JSON.parse(localStorage["pages"]);
			// Check if page was just reloaded
			if (storedPages[0][0] == document.URL) pageReload = true;
			if (pageReload == false) {
				// Re-create array, shifting down and deleteing repeats
				var temparray = new Array(2);
				temparray[0] = ['',''];
				var currentloc = 1;
				for (var i=0; i<storedPages.length; i++) {
					if (currentloc <= maxPages && storedPages[i][0] != document.URL) {
						temparray[currentloc] = storedPages[i];
						currentloc++;
					}
				}
				storedPages = temparray;
			}
		}
		// Add current page
		if (pageReload == false) {
			var t = document.title.replace("OSA | ","");
			if (t.length > 95) t = t.substring(0,95) + "...";
			storedPages[0] = [document.URL, t];
			localStorage["pages"] = JSON.stringify(storedPages);
		}

		pagesLoaded = true;
	}
}

function populateRecentPages() {
	loadRecentPages();
	for (var i=0; i<storedPages.length; i++) {
		$(".recent-page-list").append("<li><a href=\""+storedPages[i][0]+"\">"+storedPages[i][1]+"</a></li>");
	}
	$(".recent-page-list").append("<li><a href=\"javascript:clearRecentPages();\"><strong>Clear History</strong></a></li>");
}

function clearRecentPages() {
	localStorage.removeItem("pages");
	$(".recent-page-list").empty();
}