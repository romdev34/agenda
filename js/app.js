$(function () {
    //calcul du numéro de semaine 
    Date.prototype.getWeek = function () {
            return $.datepicker.iso8601Week(this);
        }
        // Recupere le nombre de jours dans le mois
        // Sans parametre, ce sera effectue sur le mois en cours,
        // sinon en fonction du mois et de l'annee
    Date.prototype.getDaysInMonth = function (month, year) {
        var date = null;
        var _month;
        if (typeof month !== 'undefined' && typeof year !== 'undefined') {
            date = new Date(year, month - 1, 1);
            console.log('with parameters ' + date);
        }
        else {
            date = new Date();
        }
        var days = date.getDate();
        _month = date.getMonth(); // on stock la valeur du mois en cours dans une variable.
        while (date.getMonth() === _month) {
            date.setDate(++days);
        }
        return days - 1;
    }
    Date.prototype.getFormat = function () {
        var month = this.getMonth() + 1;
        var day = this.getDate();
        month = (month < 10 ? '0' : '') + month;
        day = (day < 10 ? '0' : '') + day;
        return this.getFullYear() + '-' + month + '-' + day;
    }
    Date.prototype.firstWeekDay = function () {
        var date = new Date(this);
        date.setDate(date.getDate() - date.getDay() + 1);
        return date;
    }
    Date.prototype.lastWeekDay = function () {
        var date = new Date(this);
        date.setDate(date.getDate() + (7 - date.getDay()));
        return date;
    }
    Date.prototype.compareDate = function (date) {
        var timeDiff = Math.abs(date.getTime() - this.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    }
    Date.setFormat = function (date) {
            return new Date(date.substring(0, 4), parseInt(date.substring(5, 7)) - 1, date.substring(8, 10));
        }
        //on récupère les infos des rendez vous dans le fichier de data
    function msgToHTML(data) {
        if (data.length == 0) {
            return '';
        }
        var messages = data[0].message;
        for (var x = 1; x < data.length; ++x) {
            messages = messages + '@-@' + data[x].message;
        }
        return messages;
    }

    function hourToHTML(data) {
        if (data.length == 0) {
            return '';
        }
        var hours = data[0].time;
        for (var x = 1; x < data.length; ++x) {
            hours = hours + '@-@' + data[x].time;
        }
        return hours;
    }

    function setHours(hours) { //fonction pour passer de hhH à HH:MM:SS
        hours += ':00';
        hours2 = hours.replace('h', '');
        return hours2;
    }

    function setHoursShored(hours) { //fonction pour passer d'une heure HH:MM:SS a hhH
        var hours_shorted = hours.substring(0, 2) + 'h';
        return hours_shorted;
    }

    function setZeroMonths(date) {
        if (date.getMonth() + 1 < 10) {
            var months = '0' + (date.getMonth() + 1);
            return months;
        }
        else {
            return date.getMonth() + 1;
        }
    }
    //on envoie la date de la semaine en cours pour récupérer les rdv de la semaine
    function getMessage(date) {
        $.ajax({
            method: "POST"
            , url: "classes/events.php"
            , data: {
                dateBegin: date.firstWeekDay().getFormat()
                , dateEnd: date.lastWeekDay().getFormat()
            , }
            , dataType: "json"
        }).done(function (msg) {
            var not_hour = [];
            $($('#day_ul > li >ul>li')).css('cursor', 'pointer');
            $("#day_ul > li> ul >li").unbind("mouseenter");
            $("#day_ul > li> ul >li").unbind("click");
            var dateMonday = date.firstWeekDay();
            var json = msg;
            if (json == '') {
                $('#day_ul > li> ul >li').click(function (e) {
                    $('.hidden_date_to_post_main').text($($(this).parents()).children('.hidden_date_to_post').text());
                    $('.hidden_hour').text($(this).text());
                    $('.hidden_date').text(($(this).parents()).children('.date_displayed').text());
                    $('.new_rdv').css('display', 'block');
                    e.stopPropagation();
                });
            }
            else {
                var a = 0;
                for (i = 0; i < json.length; i++) {
                    var day = json[i]; // i correspond a l'indice du rdv dans la semaine
                    var dc = dateMonday.compareDate(Date.setFormat(day['date'])); //correspon au numéro de jour concerné par le rdv
                    var match = $('#day_ul > li').get(dc); //on identifie le(s) jour(s) de la semaine ayant un  ou plusieurs rdv 
                    $('> ul >li', match).on('click', function (e) { //on leur autorise le new rdv a toutes les heures
                        $('.hidden_date_to_post_main').text($($(this).parents()).children('.hidden_date_to_post').text());
                        $('.hidden_date').text(($(this).parents()).children('.date_displayed').text());
                        $('.hidden_hour').text($(this).text());
                        $('.new_rdv').css('display', 'block');
                        e.stopPropagation();
                    });
                    while (a < 7) { //on balaye tous les jours qui ne sont pas concerné par un rendez-vous et autorise le new rdv aux heures
                        if (a != dc) {
                            var not_match = ($('#day_ul > li').get(a));
                            $('>ul>li', not_match).click(function (e) {
                                $('.hidden_date_to_post_main').text($($(this).parents()).children('.hidden_date_to_post').text());
                                $('.hidden_date').text(($(this).parents()).children('.date_displayed').text());
                                $('.hidden_hour').text($(this).text());
                                $('.new_rdv').css('display', 'block');
                                e.stopPropagation();
                            });
                        }
                        a++;
                    }
                    for (j = 0; j < day['times'].length; j++) {
                        var hour = day['times'][j]; // on récupere l'heure en brut du ou des rdv de la journée du rdv dans lequel on se trouve deja
                        var heure = parseInt(hour.time.substring(0, 2)) - 8;
                        //on récupere toutes les heures qui sont  concernées par un rdv dans le jour du rdv dans lequel on se trouve et on empeche le new rdv
                        $($('> ul >li', match).get(heure)).on('click', function () {
                            $('.new_rdv').css('display', 'none');
                        });
                        messages = msgToHTML(hour['messages']);
                        hours = hourToHTML(hour['messages']);
                        $($('> ul >li', match).get(heure)).find('.message').html('vous avez ' + hour['messages'].length + ' rendez-vous' + '<span class="msg_hidden" style="display: none;">' + messages + '</span>' + '<span class="hours_hidden" style="display: none;">' + hours + '</span>');
                        //mouse enter first
                        $($('> ul >li', match).get(heure)).on('mouseenter', function () {
                            var T_msg = $('.msg_hidden', this).html().split('@-@');
                            var T_hours = $('.hours_hidden', this).html().split('@-@');
                            var parents = $(this).parents();
                            $('.num_day').text((parents).children('.date_displayed').text());
                            var T_hours_withoutSeconds = null;

                            function logArrayElements(element, index, array) {
                                T_hours_withoutSeconds = T_hours[index].substr(0, 5);
                                T_hours[index].substr(0, 5);
                                $('.list_events').html($('.list_events').html() + (index + 1) + ') ' + '<span class="T_hours_withoutSeconds">' + T_hours_withoutSeconds + '</span> ' + ' ' + element + '<br/>');
                                $('.handler_event_conflict').html($('.list_events').html());
                            }
                            T_msg.forEach(logArrayElements);
                            $('#tool_tip').css('display', 'block');
                            //                  
                        });
                        $($('> ul >li', match).get(heure)).on('click', function (e) {
                            var T_msg = $('.msg_hidden', this).html().split('@-@');
                            var T_hours = $('.hours_hidden', this).html().split('@-@');
                            var parents = $(this).parents();
                            $('.num_day').text((parents).children('.date_displayed').text());
                            $('.list_events').html('');
                            var T_hours_withoutSeconds = null;

                            function logArrayElements(element, index, array) {
                                T_hours_withoutSeconds = T_hours[index].substr(0, 5);
                                $('.list_events_edit_rdv').html($('.list_events_edit_rdv').html() + (index + 1) + ') ' + '<span class="T_hours_withoutSeconds">' + T_hours_withoutSeconds + '</span> ' + ' ' + element + ' ' + '<p class="edit_link" style="color:black; text-decoration:underline;">éditer</p>' + ' ' + ' <p class="delete_link" style = "color:black; text-decoration:underline;" > supprimer </p><br/ > ');
                                $('.handler_event_conflict_edit_rdv').html($('.list_events_edit_rdv').html());
                            }
                            T_msg.forEach(logArrayElements);
                            $('.num_hour').text(setHoursShored(T_hours[0]));
                            $('#tool_tip_edit_rdv').css('display', 'block');
                            $('#datepicker').css('display', 'none');
                            $('#tool_tip').css('display', 'none');
                            $('#main_frame').css('display', 'none');
                            var d = $('#datepicker').datepicker('getDate');
                            //ajax suppresion d'un rdv
                            $('.delete_link').on('click', function () {
                                $('<div></div>').appendTo('body').html('<div><h6>Are you sure?</h6></div>').dialog({
                                    modal: true
                                    , title: 'Supprimer message'
                                    , zIndex: 10000
                                    , autoOpen: true
                                    , width: 250
                                    , resizable: true
                                    , buttons: {
                                        Yes: function () {
                                            var heure = T_hours[0];
                                            var date = $('.hidden_date_to_post_main').text();
                                            var id_utilisateur = 1;
                                            $(this).dialog("close");
                                            $.ajax({
                                                method: "POST"
                                                , url: "classes/delete_events.php"
                                                , data: {
                                                    heure: heure
                                                    , date: date
                                                    , id_utilisateur: '1'
                                                }
                                                , dataType: "text"
                                            }).done(function (msg) {
                                                location.reload();
                                            });
                                        }
                                        , No: function () {
                                            $(this).dialog("close");
                                        }
                                    }
                                    , close: function (event, ui) {
                                        $(this).remove();
                                    }
                                });
                            });
                            //édition d'un rdv
                            $('.edit_link').on('click', function () {
                                var heure = T_hours[0];
                                var date = $('.hidden_date_to_post_main').text();
                                var id_utilisateur = 1;
                                $('#textarea_msg').attr('disabled', false);
                                $('.edit_button').on('click', function () {
                                    var message = $('#textarea_msg').val();
                                    $.ajax({
                                        method: "POST"
                                        , url: "classes/update_events.php"
                                        , data: {
                                            heure: heure
                                            , date: date
                                            , id_utilisateur: '1'
                                            , message: message
                                        }
                                        , dataType: "text"
                                    }).done(function (msg) {
                                        console.log(msg);
                                        location.reload();
                                    });
                                });
                            });
                        });
                        $($('> ul >li', match).get(heure)).on('mouseleave', function (e) {
                            $('.list_events').text('');
                            $('#tool_tip').css('display', 'none');
                        });
                        $('#tool_tip').on('mouseenter', function () {
                            $('.list_events').html($('.handler_event_conflict').html());
                            $('#tool_tip').css('display', 'block');
                        });
                        $('#tool_tip').on('mouseleave', function () {
                            $('#tool_tip').css('display', 'none');
                            $('.list_events').text('');
                        });
                    }
                }
            }
        });
    }
    //        ajax sur la création d'un nouveau rdv
    $('#submit_message').click(function () {
        $('#message ').ajaxComplete(function (ev, req, options) {
            $(this).append('Méthode ajaxComplete exécutée<br >');
        });
        var time_heure = ($($(this).parents()).children('.hidden_hour').text());
        var trim_time_hour = (time_heure.trim());
        var hours_corrected = setHours(trim_time_hour + ':' + $('.input_range').val());
        var date = $('.hidden_date_to_post_main').text();
        var mess = $('#message_content').val();
        $.ajax({
            method: "POST"
            , url: "classes/create_events.php"
            , data: {
                message_content: mess
                , date: date
                , time: hours_corrected
                , id_utilisateur: '1'
            }
            , dataType: "text"
        }).done(function (msg) {
            location.reload();
        });
    });
    // Affiche les numeros des jours correspondant a la semaine en cours
    // Prend en parametre le jour de la semaine selectionnee
    function setWeekDays(date) {
        var posJour = date.getDay(); //numero de jour dans la semaine
        var today = new Date(); // Recupere la date d'aujourd'hui
        date.setDate(date.getDate() - posJour); // Ramene la date au dimanche precedent
        $('.background_dday').removeClass('background_dday');
        $('.day_li').each(function (i) {
            date.setDate(date.getDate() + 1); // Incremente la date d'un jour 
            if (today.getDate() === date.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear()) {
                $(this).addClass('background_dday');
            }
            if (posJour === i + 1) {
                $('.background_selected').removeClass('background_selected');
                $(this).addClass('background_selected');
            }
            $('.num_jour', this).text(date.getDate());
            $('.hidden_date_to_post', this).text(date.getFormat());
            $('.num_month', this).text(setZeroMonths(date));
        });
    }

    function updateCalendar(date) {
        $('#info_semaine').text('Semaine numéro: ' + (date.getWeek())); // Returns the week number as an intege
        $('.message').empty();
        setWeekDays(new Date(date));
        getMessage(date);
    }
    //on récupere l'info de la date en fonction de ce que l'on selectionne dans le datepicker
    $("#datepicker").datepicker({
        onSelect: function (dateText, inst) {
            var dateAsObject = $(this).datepicker('getDate'); //the getDate method          
            updateCalendar(dateAsObject);
        }
    });

    function changeWeek(e) {
        e.preventDefault();
        if ($(this).closest('#semaine_arrow').children('a').first().is($(this))) {
            var d = $('#datepicker').datepicker('getDate');
            d.setDate(d.getDate() - 7);
            $('#datepicker').datepicker('setDate', (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear());
            updateCalendar(d);
        }
        else {
            var d = $('#datepicker').datepicker('getDate');
            d.setDate(d.getDate() + 7);
            $('#datepicker').datepicker('setDate', (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear());
            updateCalendar(d);
        }
    }
    var myDate = new Date();
    updateCalendar(new Date(myDate.getFullYear(), myDate.getMonth(), myDate.getDate()));
    //changement de semaine avec les fleches
    $('#semaine_arrow a').click(changeWeek);
    //gestion de la dispariation du tool tip detail des rdv au click en dehors de la fenetre
    $('#main:not(.tool_tip)').click(function () {
        $('.new_rdv').css('display', 'none');
    });
    //gestion de la fermeture avec echapp
    $(document).keyup(function (e) {
            if (e.keyCode == 27) {
                $('.new_rdv').css('display', 'none');
            }
        })
        //gestion du range des minutes pour un nouveau rdv
    $('.minute_range').text($('.input_range').val());
    $('.input_range').on('change', function () {
        $('.minute_range').text($('.input_range').val());
        if (($('.input_range').val() > 59) || ($('.input_range').val() < 0)) {
            alert('Veuillez saisir un nombre entre 0 et 59');
            $('.input_range').val(00);
            $('.minute_range').text("00");
        }
    });
    // gestion de l'ajout d'un rdv dans le meme créneau horaire d'un rdv deja existant
    $('#add_rdv_icon').on('click', function () {
        var T_minute_already_used = [];
        var hour_shorted = ($('.num_hour').text());
        var rdv = $('.list_events_edit_rdv').text();
        var pos_rdv = parseInt((rdv.substr(1, 1)));
        if ($('.edit_link').length > 1) {
            pos_rdv = $('.edit_link').length;
        }
        $('#textarea_msg').attr('disabled', false);
        $('.add_rdv').html(pos_rdv + 1 + ') ' + hour_shorted + ' <input class="input_range2" type="number" max="59" min="0" step="10" />');
        $('.input_range2').on('change', function () {
            if (($('.input_range2').val() > 59) || ($('.input_range2').val() < 0)) {
                alert('Veuillez saisir un nombre entre 0 et 59');
                $('.input_range2').val(00);
            }
        });
        $('.edit_button').on('click', function () {
            var test = {
                test2: true
            };
            var minute_already_used = $($($(this).parents('#tool_tip_edit_rdv')).children()[1]).children();
            minute_already_used.siblings('.T_hours_withoutSeconds').each(function (i) {
                T_minute_already_used[i] = $(this).text().substr(3, 2);
                if (T_minute_already_used[i] == $('.input_range2').val()) {
                    alert('2 rendez-vous ne peuvent pas avoir la meme heure');
                    $('.input_range2').val('00');
                    test.test2 = false;
                }
            });
            if (test.test2) {
                var message = $('#textarea_msg').val();
                var date = $('.hidden_date_to_post_main').text();
                var hour = hour_shorted + $('.input_range2').val() + ':00';
                var hour2 = hour.replace("h", ":");
                $.ajax({
                    method: "POST"
                    , url: "classes/create_events.php"
                    , data: {
                        time: hour2
                        , date: date
                        , id_utilisateur: '1'
                        , message_content: message
                    , }
                    , dataType: "text"
                }).done(function (msg) {
                    location.reload();
                });
            }
        });
    });
});