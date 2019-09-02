/**
 * Created by rdelarosa on 5/5/14.
 */

var Pagination = function () {
    
    var currentPageSize = 20;
    var _this = this;
    var forward = "\u00BB";
    var backward = "\u00AB";
    var totalNumberOfResults = 0;
    var currentSelectedPage = 1;
    var totalNumberOfPages = 5;
    
    _this.getCurrentSelectedPage = function () {
        return currentSelectedPage;
    };
    
    _this.setCurrentSelectedPage = function (page) {
        currentSelectedPage = page;
    };
    
    _this.getTotalNumberOfResults = function () {
        return totalNumberOfResults;
    };
    
    _this.setTotalNumberOfResults = function (total) {
        totalNumberOfResults = total;
    };
    
    _this.getCurrentPageSize = function () {
        return currentPageSize;
    };
    
    _this.setCurrentPageSize = function (pageSize) {
        if (currentPageSize != pageSize) {
            currentPageSize = pageSize;
            currentSelectedPage = 1;
        }
    };
    
    _this.getTemplateByPageNumber = function (number) {
        
        if (! number) {
            number = currentSelectedPage;
        }
        currentSelectedPage = number;
        var html = "";
        var start = _this.getMultiple(number);
        if (start > 0 && start % totalNumberOfPages == 0 && start == number) {
            start -= totalNumberOfPages;
        }
        
        var disabled = false;
        
        for (var i = start; i <= start + totalNumberOfPages + 1; i++) {
            var label = i + "";
            if (i == start + totalNumberOfPages + 1) {
                label = forward;
            } else if (i == start) {
                label = backward;
            }
            
            disabled = false;
            if ((i < 1) || (((i -1) * currentPageSize) > totalNumberOfResults) || i == currentSelectedPage) {
                disabled = true;
            }
            if (i == number) {
                html += _.template(Template.pageSizeSelectorNumberSelected, {
                    number: i, label: label
                });
            } else if (disabled == true) {
                html += _.template(Template.pageSizeSelectorNumberDisabledUnselected, {
                    number: i, label: label
                });
            } else {
                html += _.template(Template.pageSizeSelectorNumberUnselected, {
                    number: i, label: label
                });
            }
        }
        return html;
    };
    
    _this.getMultiple = function (number) {
        return Math.floor(number / totalNumberOfPages) * totalNumberOfPages;
    }
};
