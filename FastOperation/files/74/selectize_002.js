

var CustomizeSelectize = function () {
    
    /**
     * This fuctions overrides the search function in selectize controls.
     *
     * @param {Object} proceedingSelectize - Selectize that you want to change the search method.
     */
    this.overrideProceedingSearchSelectize = function (proceedingSelectize) {
        proceedingSelectize[0].selectize.sifter.search =
        function (a, b) {
            var searchOBJ = new Search();
            var c, d, e, f, g = this;
            return d = this.prepareSearch(a, b), b = d.options, a = d.query, f = b.score || g.getScoreFunction(d), a.length ? g.iterator(g.items, function (a, e) {
                c = f(a), (searchOBJ.validateAcronym(d.query, e) || b.filter === ! 1 || c > 0) && d.items.push({
                    score: c, id: e
                })
            }): g.iterator(g.items, function (a, b) {
                d.items.push({
                    score: 1, id: b
                })
            }), e = g.getSortFunction(d, b), e && d.items.sort(e), d.total = d.items.length, "number" == typeof b.limit && (d.items = d.items.slice(0, b.limit)), d
        };
    };
};