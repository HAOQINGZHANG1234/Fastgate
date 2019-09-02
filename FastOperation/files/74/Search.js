$(document).ready(function () {
    $("#focusAll").click(function () {
        $("#advsFocusInputs").addClass("disabled"), $("#advsFocusInputs input").prop("disabled", !0)
    }), $("#focusInputs").click(function () {
        $("#advsFocusInputs").removeClass("disabled"), $("#advsFocusInputs input").prop("disabled", !1)
    }), $("#contentAll").click(function () {
        $("#advsContentInputs").addClass("disabled"), $("#advsContentInputs input").prop("disabled", !0)
    }), $("#contentInputs").click(function () {
        $("#advsContentInputs").removeClass("disabled"), $("#advsContentInputs input").prop("disabled", !1), a("#journalsSection", ".input-journal"), a("#proceedingsSection", ".input-proceedings")
    }), $("#journalsSection").click(function () {
        a("#journalsSection", ".input-journal")
    }), $("#proceedingsSection").click(function () {
        a("#proceedingsSection", ".input-proceedings")
    }), $("#mediaSection").click(function () {
        a("#mediaSection")
    });
    var a = function (a, b) {
        var c = $(a).children("input"), d = c.is(":checked"), e = c.is(":disabled");
        d && !e ? ($(a).removeClass("disabled"), $("#advsContentInputs " + b).prop("disabled", !1).parent().removeClass("disabled")) : e || ($(a).addClass("disabled"), $("#advsContentInputs " + b).prop("disabled", !0).parent().addClass("disabled"))
    };
    $(".avs-close, .avs-submit-search").click(function () {
        var a = $("#advancedSearch");
        a.is(":visible") ? (a.slideUp(300), setTimeout(function () {
            $(".avs-close").html('<span class="caret"></span>'), $("#searchContainer").removeClass("search-expanded")
        }, 300)) : (a.slideDown(), $("#searchContainer").addClass("search-expanded"), $(".avs-close").text("Close Options ^"))
    }), $(".select-group").click(function (a) {
        a.stopPropagation();
        var b = $(this);
        b.is(":checked") ? (console.log("checked"), b.prop("checked", !0), $(this).parent().parent().find("input").prop("checked", !0)) : (console.log("unchecked"), b.prop("checked", !1), $(this).parent().parent().find("input").prop("checked", !1))
    }), $(".expandable").click(function (a) {
        a.stopPropagation(), a.preventDefault(), console.log("expandable element", $(this), $(this).hasClass("expanded"));
        var b = $(this);
        b.hasClass("expanded") ? $(this).removeClass("expanded") : $(this).addClass("expanded")
    }), $(".avs-modal-open").click(function (event) {
        
        $("#avsModal").fadeIn();
        $("#avsModal").height($(document).height());
        
        var popupSelector = $('#input-popup-selectize');
        popupSelector[0].selectize.clearOptions();
        
        var optionList=[];
        var originControl="";
        var isTopic = false;
        if($(event.target).closest(".input-group-btn").attr("name") === "journal"){
            optionList = originalJournalList;
            originControl ="advsJournalsSelector";
            $("#titleFiltersPopup").text("journals");
            $("#avsModalSubmit").text("Select Journals");
            $("#myTopicList").hide();
        } else if($(event.target).closest(".input-group-btn").attr("name") === "proceeding"){
            optionList = originalProceedinglList;
            originControl ="advsProceedingSelector";
            $("#titleFiltersPopup").text("proceedings");   
            $("#avsModalSubmit").text("Select Proceedings");
            $("#myTopicList").hide();
        }
        
        var checkboxlist = "";
        $.each(optionList, function( index, value ) {  
            checkboxlist += 
                '<li>'+
                    '<table>'+
                        '<tbody>'+
                            '<tr>'+
                                '<td style="vertical-align: text-top"><input type="checkbox" name="'+ ((isTopic) ? value.value : value.id) +'"></td>'+
                                '<td>&nbsp;</td>'+
                                '<td><label style="font-weight: normal;">'+value.label+'</label></td>'+
                            '</tr>'+  
                        '</tbody>'+
                    '</table>'+
               '</li>';
            popupSelector[0].selectize.addOption({"id" :  ((isTopic) ? value.value : value.id), "label" : value.label});
            
        });
        
        $("#checkBoxList").html("");
        $("#checkBoxList").append(checkboxlist);
        
        $("#avsModalSubmit").attr("name", originControl);
        
        $.each($("#"+originControl).parent().find(".selectize-input>div"), function( index, value ) {
             var id = $(value).attr("data-value");
             popupSelector[0].selectize.addItem(id);
             $("input[name = '"+id+"']").prop('checked', true);
        });
        
        //Change clic event.
        $("#checkBoxList label").click(function(event){
            var checkbox = $(event.target).parent().parent().find("input");
            checkbox.prop("checked", !checkbox.is(':checked'));
            
            var id = checkbox.attr("name");
            var popupSelector = $('#input-popup-selectize');
            if(checkbox.is(':checked')){
                popupSelector[0].selectize.addItem(id); 
            }else{
                popupSelector[0].selectize.removeItem(id); 
            }
        }); 
         
        //Add clic event
        $("#checkBoxList input").click(function(event){ 
            var id = $(event.target).attr("name");
            var popupSelector = $('#input-popup-selectize');
            if($(event.target).is(':checked')){
                popupSelector[0].selectize.addItem(id); 
            }else{
                popupSelector[0].selectize.removeItem(id); 
            }            
        }); 

        
    }), $("#avsModalClose").click(function () {
        $("#avsModal").fadeOut()
    }), $("#avsModalSubmit").click(function (event) {
        $("#avsModal").fadeOut();
        
        var popupSelector = $("#"+$(event.target).attr("name"));
        
        var optionList = [];
        var isTopic = false;

        if($(event.target).attr("name") === "advsJournalsSelector"){
            optionList = originalJournalList;
        } else if($(event.target).attr("name") === "advsProceedingSelector"){
            optionList = originalProceedinglList;
        } else if($(event.target).attr("name") === "advsTopicsSelector"){
            isTopic = true;
        }
        
        $.each($("#checkBoxList input"), function( index) {
             var id = $(this).attr("name");  
             if($(this).is(":checked")) 
                popupSelector[0].selectize.addItem(id); 
             else
                popupSelector[0].selectize.removeItem(id);   
        });
        
        $("#checkBoxList").html("");
        
        var a = [], b = $("#avsModal").find("input:checked");
        b.each(function () {
            a.push($(this).parent().text())
        }), 
        $("#selectedFilters").text("" !== a.join() ? "Selected filters: " + a.join(", ") : "No topic filters currently selected")
    }), $("#reset").click(function () {
        window.location = ""
    }), 
    $("#browsetopicsbutton").click(function (e) {
		e.preventDefault();
        $('.avs_grayout').toggleClass('is-active');
        $('#pickTopicsBrowse').toggleClass("hidden");
		$(this).toggleClass("btn-default").toggleClass("btn-primary");
        $(this).text() === "Browse All Topics" ? $(this).text('Close Topic Browser') : $(this).text('Browse All Topics');
        $(window).scrollTop($('.avs_topics').offset().top);
	}), 
    $("#browsetopicsclosebutton").click(function (e) {
		e.preventDefault();
        $('.avs_grayout').removeClass('is-active');
        $("#pickTopicsBrowse").toggleClass("hidden");
		$("#browsetopicsbutton").toggleClass("btn-disabled btn-default");
	});
    // event listener to exit topic browser if the grayed out area is selected
    $('.avs_grayout').click(function(e) {
        $('.avs_grayout').removeClass('is-active');
        $('#pickTopicsBrowse').addClass("hidden");
        $('#browsetopicsbutton').text("Browse All Topics").removeClass("btn-primary").addClass("btn-default");
    });
    // ensure that advanced search options aren't grayed out when the panel is shown.
    $('#advanced-search-popup').on('hidden.bs.collapse', function() {
        $('.avs_grayout').removeClass('is-active');
        $('#pickTopicsBrowse').addClass("hidden");
        $('#browsetopicsbutton').text("Browse All Topics").removeClass("btn-primary").addClass("btn-default");
    });
    
});