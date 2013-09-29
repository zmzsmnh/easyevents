
var currentStep=0;
var local = {};
var placerequest;
var userrequest;
var navtitles = ["Easy Events", "Step 1: New Event", "Step 2: Choose Places", "Step 3: Add Participants"];
$(function(){
    $("#a_left").hide();

    var savePosition = function(pos) {
        local['latitude'] = pos.coords.latitude;
        local['longitude'] = pos.coords.longitude;
        bindEvents();
    };

    var needzipcode = function() {
        local['zip'] = "95136";
        bindEvents();
        return;
        $("#a_zip_dialog").click();
    };
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(savePosition, function(err) {
             needzipcode();
        });
    } else {
        needzipcode();
    }

    $.getJSON('/event/me', function(events) {
        $.each(events, function(i, event) {
            var html = "<li><a href=\"#\"><h2>" + event.name + "</h2><p>" + event.start_time + " " + event.start_date + " - " + event.end_time + " " + event.end_date + "</p><span class='hide'>" + JSON.stringify(event) + "</span></a></li>"
            $("#e_events").append(html);
            if(i == events.length - 1){
                $("#e_events").listview('refresh');
                $("#e_events li").click(function() {
                    $("#lb_title").text("Event Detail");
                    $(this).siblings("li").removeClass("active");
                    $(this).addClass("active");
                    var event = $.parseJSON($(this).find("a span").text());
                    $("#ed_name").text(event.name);
                    var description = event.start_time + " " + event.start_date + " - " + event.end_time + " " + event.end_date + " with ";
                    $.each(event.participants, function(i, participant) {
                        description += participant.name;
                        description += ", ";
                    })
                    $("#ed_description").text(description);
                    $("#ed_places").empty();
                    $.each(event.places, function(i, place) {
                        $("#ed_places").append("<p>" + place.Title + " - " + place.Address + "," + place.City + "," + place.State + "</p>");
                    })
                    $("#div_events > div").not(".detail").hide();
                    $("#div_events > div.detail").show();
                    $("#a_left .ui-btn-text").text("Back");
                    $("#a_left").removeClass('add').addClass('Back').show();
                    $("#a_right .ui-btn-text").text("Claim");
                    $("#a_right .ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-edit");
                    $("#a_right").addClass('claim').attr("data-icon", "edit");
                    var backtohome = function() {
                        location.reload();
                    };
                    var claimexpense = function() {
                        $.each(event.participants, function(i, participant) {
                            $("#c_participants").append("<input type=\"checkbox\" id=" + participant._id + " checked=true><label for=" + participant._id + ">" + participant.name + "</label>").trigger("create");
                        })
                        $("#div_events > div").not(".claim").hide();
                        $("#div_events > div.claim").show();
                        $("#a_right .ui-btn-text").text("Send");
                        $("#a_right .ui-icon").removeClass("ui-icon-edit").addClass("ui-icon-arrow-r");
                        $("#a_right").addClass('send').attr("data-icon", "arrow-r");
                        $("#a_left").unbind('click').click(function() {
                            $("#div_events > div").not(".detail").hide();
                            $("#div_events > div.detail").show();
                            $("#a_right .ui-btn-text").text("Claim");
                            $("#a_right .ui-icon").removeClass("ui-icon-arrow-r").addClass("ui-icon-edit");
                            $("#a_right").addClass('claim').attr("data-icon", "edit");
                            $("#lb_title").text(navtitles[0]);
                        });
                        $("#a_right").unbind('click').click(function() {
                            var claim = {};
                            claim.eventid = event._id;
                            claim.description = $("#c_des").val();
                            claim.total = $("#c_amount").val();
                            claim.participants = [];
                            $("#c_participants .ui-checkbox label.ui-checkbox-on").each(function(){
                                claim.participants.push($(this).attr("for"));
                            });
                            $.post('/expense/claim', claim, function(data) {
                                $("#a_left").click();
                                $("#a_left").unbind('click').click(backtohome);
                                $("#a_right").unbind('click').click(claimexpense);
                            });
                        })
                    };
                    $("#a_left").unbind('click').click(backtohome);
                    $("#a_right").unbind('click').click(claimexpense);
                });
            }
        });
    })
})

function bindEvents() {
    $("#a_right.add").click(function(){
        $("#div_events > div").not(".form.step1").hide();
        $("#div_events > div.form.step1").show();
        $("#a_left .ui-btn-text").text("Back");
        $("#a_left").removeClass('home').addClass('back').show();
        $("#a_right .ui-btn-text").text("Next");
        $("#a_right .ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-arrow-r");
        $("#a_right").addClass('next').attr("data-icon", "arrow-r").show();
        currentStep=1;
        $("#lb_title").text(navtitles[currentStep]);

        $("#a_right.next").unbind('click').click(function(){
            currentStep++;
            $("#lb_title").text(navtitles[currentStep]);
            $("#div_events > div").not(".form.step" + currentStep).hide();
            $("#div_events > div.form.step" + currentStep).show();
            if(currentStep >= 3){
                $("#a_right .ui-btn-text").text("Save");
                $("#a_right .ui-icon").removeClass("ui-icon-arrow-r").addClass("ui-icon-check");
                $("#a_right").removeClass("next").addClass("save");
                $("#a_right.save").unbind('click').click(function(e){
                    var event = {};
                    event.name = $("#e_name").val();
                    event.start_date = $("#e_startdate").val();
                    event.start_time = $("#e_starttime").val();
                    event.end_date = $("#e_enddate").val();
                    event.end_time = $("#e_endtime").val();

                    event.places = [];
                    $("#list_places li a span.hide").each(function(){
                         event.places.push($.parseJSON($(this).text()));
                    })
                    event.participants = [];
                    $("#list_participants li a span.hide").each(function(){
                        event.participants.push(JSON.parse($(this).text()));
                    })
                    console.log(event);
                    $.post('/event/add', event, function(data) {
                        location.reload();
                    });
                });
            }
        });

        $("#a_left.back").unbind('click').click(function(e) {
            currentStep--;
            $("#lb_title").text(navtitles[currentStep]);
            $("#div_events > div").not(".form.step" + currentStep).hide();
            $("#div_events > div.form.step" + currentStep).show();
            if(currentStep == 0){
                $("#a_left").hide();
                $("#a_right .ui-btn-text").text("Add");
                $("#a_right .ui-icon").removeClass("ui-icon-arrow-r").addClass("ui-icon-plus");
                $("#a_right").removeClass('next').attr("data-icon", "plus");
                $("#div_events > div").not(".list").hide();
                $("#div_events > div.list").show();
                bindEvents();
            }
        });

        var inputplaceholder = $("#e_place").siblings(".ui-listview-filter").find(".ui-input-text");
        inputplaceholder.keyup(function(){
            if(inputplaceholder.val().length >= 4) {
                localsearch(inputplaceholder.val());
            }
        });

        var participantsinput = $("#e_participants").siblings(".ui-listview-filter").find(".ui-input-text");
        participantsinput.keyup(function(){
            usersearch($(this).val());
        });
    });

    $(".ui-footer li").click(function() {
        $(this).siblings().removeClass("ui-btn-active").removeClass("ui-state-persist");
        $(this).addClass("ui-btn-active").addClass("ui-state-persist");
        $(this).siblings("li a.ui-btn").removeClass("ui-btn-active");
        $(this).find("li a.ui-btn").addClass("ui-btn-active");
    })

    $("#li_ev").click(function() {
        location.reload();
    })

    $("#li_cl").click(function() {
        $("#a_left").hide();
        $("#a_right").hide();
        $("#div_events > div").not(".check").hide();
        $("#div_events > div.check").show();
        $.getJSON('/expense/check', function(res) {
            $("#c_list").empty();
            var mapping = res.mapping;
            $.each(res.results, function(i, bill) {
                var partner = "";
                var amount = 0;
                if(bill.creditor == res.id) {
                    partner = bill.debitor;
                    amount = '-'+bill.amount;
                } else {
                    partner = bill.creditor;
                    amount = bill.amount;
                }
                var html = "<li id='" + bill._id + "' data-amount='" + amount + "'><a href=\"#\"><div class='quater'>" + bill.description + " </div><div class='quater'>" + mapping[partner] + " </div>" + amount + "</a></li>";
                $("#c_list").append(html);
            });
            $("#c_list").listview('refresh');
            $("#c_list li").click(function() {
                $("#c_list li.active").removeClass("active");
                $(this).addClass("active");
                $("#a_claimverify_dialog").click();
            })
        });

        $("#li_pm").click(function() {
            $("#a_left").hide();
            $("#a_right").hide();
            $("#div_events > div").not(".payment").hide();
            $("#div_events > div.payment").show();
            $.getJSON('/expense/summary', function(res) {
                $("#p_list").empty();
                var mapping = res.mapping;
                $.each(res.results, function(partner, amount) {
                    var html = "<li id='" + partner + "' data-amount='" + amount + "'><a href=\"#\"><div class='half'>" + mapping[partner] + "</div>" + amount + "</a></li>";
                    $("#p_list").append(html);
                });
                $("#p_list").listview('refresh');
                $("#p_list li").click(function() {
                    $("#p_list li.active").removeClass("active");
                    $(this).addClass("active");
                    $("#div_events > div").not(".relation").hide();
                    $("#div_events > div.relation").show();
                    $("#a_left .ui-btn-text").text("Back");
                    $("#a_left").removeClass('home').addClass('back').show();
                    $("#a_right .ui-btn-text").text("Paid");
                    $("#a_right").removeClass('add').removeClass('next').removeClass('save').addClass("paid").show();
                    $("#a_left").unbind('click').click(function() {
                        $("#a_left").hide();
                        $("#a_right").hide();
                        $("#div_events > div").not(".payment").hide();
                        $("#div_events > div.payment").show();
                        $("#lb_title").text(navtitles[0]);
                    });
                    $("#a_right").unbind('click').click(function() {
                        var receiver = $("#p_list li.active").attr('id');
                        $.post("/expense/pay", {receiver: receiver}, function(data) {
                            $("#li_pm").click();
                        });
                    });
                    $("#lb_title").text(mapping[$("#p_list li.active").attr('id')]);

                    $("#r_list").empty();
                    $.getJSON("/expense/detail?p="+$("#p_list li.active").attr('id'), function(bills) {
                        $.each(bills, function(i, bill){
                            var html = "<li id='" + bill._id + "' data-amount='" + bill.amount + "'><a href=\"#\"><div class='half'>" + bill.description + "</div>" + bill.amount + "</a></li>";
                            $("#r_list").append(html);
                        });
                        $("#r_list").listview('refresh');
                    })
                })
            });

        })
    })
}

function localsearch(query) {
    if(placerequest) {
        placerequest.abort();
    }
    var str = "https://query.yahooapis.com/v1/public/yql?format=json&q=select * from local.search where query='" + query + "'";
    $.map(local, function(value, key) {
        str = str + " and " + key + "=" + value;
    });
    placerequest = $.getJSON(str, function(res) {
        showSearchItems(res.query.results.Result);
    });
}

function showSearchItems(items) {
    $("#e_place").empty();
    if(!(items instanceof Array)) {
        items = [items];
    }
    $.each(items, function(i, item) {
        console.log(item);
        var str = "<li><a href='#'>" + item.Title + " - " + item.Address + "," + item.City + "," + item.State + "<span class='hide'>" + JSON.stringify(item) + "</span></a></li>";
        $("#e_place").append(str);
    });
    $("#e_place").listview('refresh');
    $("#e_place li").unbind('click').click(function(){
        $("#list_places").append($(this));
        $("#list_places li").attr("data-icon", "delete");
        $("#list_places li span.ui-icon").removeClass("ui-icon-arrow-r").addClass("ui-icon-delete");
        $("#list_places").listview();
        $("#e_place").empty();
        $("#e_place").siblings(".ui-listview-filter").find(".ui-input-text").val("").focus();
        $("#e_place").listview('refresh');
    });
}

function usersearch(query) {
    if(userrequest) {
        userrequest.abort();
    }
    userrequest = $.getJSON("/user/list?q=" + query, function(users){
        $("#e_participants").empty();
        $.each(users, function(i, item) {
            var str = "<li><a href='#'>" + item.name + " - " + item.gender + "<span class='hide'>" + JSON.stringify(item) + "</span></a></li>";
            $("#e_participants").append(str);
        });
        $("#e_participants").listview('refresh');
        $("#e_participants li").unbind('click').click(function(){
            $("#list_participants").append($(this));
            $("#list_participants li").attr("data-icon", "delete");
            $("#list_participants li span.ui-icon").removeClass("ui-icon-arrow-r").addClass("ui-icon-delete");
            $("#list_places").listview();
            $("#e_participants").empty();
            $("#e_participants").siblings(".ui-listview-filter").find(".ui-input-text").val("").focus();
            $("#e_participants").listview('refresh');
        });
    })
}
