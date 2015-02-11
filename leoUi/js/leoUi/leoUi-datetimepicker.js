/**
 +-------------------------------------------------------------------
 * jQuery leoUi--datetimepicker
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","leoUi-date","leoUi-tools","leoUi-effects"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoDatetimepicker',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

        	monthsName: [
				"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
			],

			dayOfWeekName: [
				"日", "一", "二", "三", "四", "五", "六"
			],

			weeksName:"周数",

        	weekStart:0,//一周从哪一天开始。0（星期日）到6（星期六）

        	quickButton:false,

        	showWeekDays:false,

        	showOtherMonthDays:true,

        	parseFormat:"yyyy-MM-dd",

        	strFormat: "yyyy-MM-dd",

        	dayTitleFormat: "yyyy-MM-dd",

        	maxMineFormat:"yyyy-MM-dd",

        	maxDate:false,//"2015-02-04"

            minDate:false,//"2015-02-04"

            viewSelect:'day'//'year', 'month', 'day'

        },

        _init:function(){

            this.viewSelect = this.options.viewSelect;

            this._selectDay = false;

            this._selectMonth= false;

            this._selectYear = false;

        	this._getDateValue();

        	this._createDatetimepicker();

            this.addEvent();

        },

        _getDateValue:function(){

            this._currentVal = $.leoTools.Date.getDate(this.$target.val(), this.options.parseFormat);

            this._initLeoDate();

        },

        _initLeoDate:function(){

        	var leoDate = $.leoTools.Date, op = this.options;

        	this._currentDate = new leoDate(this._currentVal && this._currentVal.clone(), {

        		parseFormat:op.parseFormat,

        		strFormat:op.strFormat

        	});

        },

        _getDaysTableDayStart:function(){

        	var firstDateOfMonthDate = this._currentDate.getFirstDayOfMonthDate(),

        	difDays = this.options.weekStart - firstDateOfMonthDate.getDay();

        	difDays >= 0 && (difDays -= 7);

        	return firstDateOfMonthDate.addDays(difDays).clearTime();

        },

        _createDatetimepicker:function(){

            this._createHeader();

        	this.$datetimepicker = $('<div class="leoDatetimepicker leoUi_clearfix"></div>').append(this.$datetimepickerHeader).appendTo(this.$target);

            this._setViewSelectTable();


        },

        _setHeader:function(){

            var headerTitle = this._getHeaderTitle(),

            quickButton = this.options.quickButton;

            this.$datetimepickerHeaderTitle.html(this._getHeaderTitle());

            switch (this.viewSelect) {

                case "day":

                    this.$datetimepickerHeaderPrev.attr('event', "prevMonths");

                    this.$datetimepickerHeaderNext.attr('event', "nextMonths");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextYears");

                    }

                    break;

                case "month":

                    this.$datetimepickerHeaderPrev.attr('event', "prevYears");

                    this.$datetimepickerHeaderNext.attr('event', "nextYears");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextYears");

                    }

                    break;

                case "year":

                    this.$datetimepickerHeaderPrev.attr('event', "prevTenYears");

                    this.$datetimepickerHeaderNext.attr('event', "nextTenYears");

                    if(quickButton){

                        this.$datetimepickerHeaderQuickPrev.attr('event', "prevTenYears");

                        this.$datetimepickerHeaderQuickNext.attr('event', "nextTenYears");

                    }

                    break;

            }

        },

        _setViewSelectTable:function(){

            var $datetimepickerHeader = this.$datetimepickerHeader;

            this._setHeader();

            switch (this.viewSelect) {

                case "day":

                    this.dayTableHeight = $(this._createDaysTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end()).height();

                    break;

                case "month":

                    $(this._createMonthsYearsTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end()).setOuterHeight(this.dayTableHeight);

                    break;

                case "year":

                    $(this._createMonthsYearsTable()).appendTo(this.$datetimepicker.find('table[role="leoDatetimepickerTable"]').remove().end()).setOuterHeight(this.dayTableHeight);

                    break;

            }


        },

        _getHeaderTitle:function(){

            var currentDate = this._currentDate.getCurrentDate(true),

            op = this.options, returnVal, year;

            switch (this.viewSelect) {

                case "day":

                    returnVal = op.monthsName[currentDate.getMonth()] + '&nbsp&nbsp' + currentDate.getFullYear();

                    break;

                case "month":

                    returnVal = currentDate.getFullYear();

                    break;

                case "year":

                    year = Math.floor(currentDate.getFullYear() / 10) * 10 - 1;

                    returnVal = (year + 1) + " - " + (year + 10);

                    break;

            }

        	return returnVal;

        },

        _createHeader:function(){

        	var str, innerStr = '<div class="leoDatetimepicker-header-inner"><a href="#" class="leoDatetimepicker-header-prevMonths leoDatetimepicker-header-button" role="prev"  event="prevMonths"><span class="leoDatetimepicker-icon"></span></a><div class="leoDatetimepicker-header-inner-title" role="headerTitle">' + this._getHeaderTitle() +'</div><a href="#" class="leoDatetimepicker-header-nextMonths leoDatetimepicker-header-button" role="next"  event="nextMonths"><span class="leoDatetimepicker-icon"></span></a></div>',

            $datetimepickerHeader,

            quickButton = this.options.quickButton;

        	if(!quickButton){

        		str = '<div class="leoDatetimepicker-header" role="header">';

        		str += innerStr;

        		str += '</div>';

        	}else{

        		str = '<div class="leoDatetimepicker-header leoDatetimepicker-header-yearsbutton" role="header"><a href="#" class="leoDatetimepicker-header-prevYears leoDatetimepicker-header-button" role="quickPrev" event="prevYears"><span class="leoDatetimepicker-icon"></span></a>';

        		str += innerStr;

        		str += '<a href="#" class="leoDatetimepicker-header-nextYears leoDatetimepicker-header-button" role="quickNext" event="nextYears"><span class="leoDatetimepicker-icon"></span></a></div>';

        	}

            $datetimepickerHeader = this.$datetimepickerHeader = $(str);

            this.$datetimepickerHeaderTitle = $datetimepickerHeader.find('div[role="headerTitle"]');

            this.$datetimepickerHeaderPrev = $datetimepickerHeader.find('a[role="prev"]');

            this.$datetimepickerHeaderNext = $datetimepickerHeader.find('a[role="next"]');

            if(quickButton){

                this.$datetimepickerHeaderQuickPrev = $datetimepickerHeader.find('a[role="quickPrev"]');

                this.$datetimepickerHeaderQuickNext = $datetimepickerHeader.find('a[role="quickNext"]');

            }

        	return str;

        },

        _createDaysTable:function(){

        	var op = this.options,weekStart = op.weekStart,

            dayOfWeekName = op.dayOfWeekName,

        	weeksName = op.weeksName, showWeekDays = op.showWeekDays,

        	showOtherMonthDays = op.showOtherMonthDays,

        	leoDate = $.leoTools.Date,

        	maxMineFormat = op.maxMineFormat,

        	startDate = this._getDaysTableDayStart(),

        	currentDate = this._currentDate.getCurrentDate(),

        	currentMonth = currentDate.getMonth(),

        	today = Date.today(),weekDayLen = 7,

        	dayTitleFormat = op.dayTitleFormat,

        	d, m, classes, i = 0, j = 0, z,

        	equals = Date.equals,role,

            currentVal = this._currentVal,

            rangeDateCreate = this._rangeDateCreate('day'),

        	tableStr = '<table class="leoDatetimepicker-calendar" role="leoDatetimepickerTable"><thead><tr>';

        	if(showWeekDays){

        		tableStr +='<th>' + weeksName + '</th>';

        		weekDayLen = 8;

        	}

        	for (; i < 7; i++) {

				tableStr += '<th>' + dayOfWeekName[(i + weekStart) > 6 ? 0 : i + weekStart] + '</th>';

			}

			tableStr += '</tr></thead><tbody>';

			for(; j < 6; j++){

				tableStr += '<tr>';

				for(z = 0; z < weekDayLen; z++ ){

					classes = [];

					d = startDate.getDate();

					m = startDate.getMonth();

					if(showWeekDays && z === 0){

						tableStr += '<td class="leoDatetimepicker-week-col">' + startDate.getWeek() + '</td>';

						continue;

					}

					if(currentMonth !== m){

						if(showOtherMonthDays){

							classes.push('leoDatetimepicker-other-month');

						}else{

							tableStr += '<td class="leoDatetimepicker-day-gap">&nbsp;</td>';

							startDate.addDays(1);

							continue;

						}

					}

					if(!rangeDateCreate(startDate)){

						classes.push('leoDatetimepicker-disabled');

                        role = "disabled";

					}else{

                        role = "select";

                        if(currentVal && equals(startDate, currentVal)){

                            classes.push('leoDatetimepicker-current-day');

                        }

                        if(equals(startDate, today)){

                            classes.push('leoDatetimepicker-today');

                        }

                    }

					tableStr += '<td class="' + classes.join(' ') + '" title="' +  startDate.toString(dayTitleFormat) + '" value="' + startDate.getTime() + '" role="' + role + '"><a href="#" class="leoDatetimepicker-day-default">' + d + '</a></td>';

					startDate.addDays(1);

				}

				tableStr += '</tr>';

			}

			tableStr += '</tbody></table>';

			return tableStr;

        },

        _createMonthsYearsTable:function(){

            var op = this.options, rows = 3, cols = 4, i, j,

            tableStr = '<table class="leoDatetimepicker-calendar leoDatetimepicker-grid" role="leoDatetimepickerTable"><tbody>',

            date = this._currentDate.getCurrentDate(true),

            monthsName = op.monthsName,value,role,

            leoDate = $.leoTools.Date, cls = [],

            maxMineFormat = op.maxMineFormat,select,

            index,outofRange,cellText,year,range,

            viewSelect = this.viewSelect, startDate, rangeDateCreate;

            if(viewSelect === 'month'){

                startDate = date;

            }else{

                startDate = Math.floor(date.getFullYear() / 10) * 10 - 1;

            }

            rangeDateCreate = this._rangeDateCreate(viewSelect, startDate);

            for(i = 0; i < rows; i++){

                tableStr += '<tr height="30%">';

                for(j = 0; j < cols; j++){

                    index = i * 4 + j;

                    outofRange = false;

                    cellText = '';

                    year = null;

                    cls = [];

                    switch (viewSelect) {

                        case "month":

                            cellText = monthsName[index];

                            range = rangeDateCreate(index);

                            value = index;

                            select = this._selectMonth;

                            break;

                        case "year":

                            year = startDate + index;

                            range = rangeDateCreate(index);

                            cellText = year.toString();

                            value = cellText;

                            select = this._selectYear;

                            ;(index === 0 || index === 11) && (cls.push('leoDatetimepicker-grid-other'));

                            break;

                    }

                    if(!range){

                        cls.push('leoDatetimepicker-disabled');

                        role = "disabled";

                    }else{

                        role = "select";

                        select && cls.push('leoDatetimepicker-grid-active');

                    }

                    tableStr += '<td class="leoDatetimepicker-day-default '+cls.join(' ')+'" value="'+value+'" role="' + role + '"><a href="###">' + cellText + '</a></td>';

                }

                tableStr += '</tr>';

            }

            return tableStr;

        },

        _rangeDateCreate:function(type, start){

            var op = this.options, maxDate = op.maxDate,

            minDate = op.minDate, leoDate = $.leoTools.Date,

            maxMineFormat = op.maxMineFormat,

            This = this, currentVal = this._currentVal;

            !currentVal && (currentVal = false);

            switch (type) {

                case "day":

                    if(maxDate !== false){

                        maxDate = leoDate.getMaxDate(maxDate, maxMineFormat, true);

                    }

                    if(minDate !== false){

                        minDate = leoDate.getMinDate(minDate, maxMineFormat, true);

                    }

                    currentVal && (currentVal = currentVal.clearTime());

                    break;

                case "month":

                    if(maxDate !== false){

                        maxDate = leoDate.getDate(maxDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear() * 12 + maxDate.getMonth());

                    }

                    if(minDate !== false){

                        minDate = leoDate.getDate(minDate, maxMineFormat, true);

                        minDate && (minDate = minDate.getFullYear() * 12 + minDate.getMonth());

                    }

                    start = start.getFullYear() * 12;

                    currentVal && (currentVal = currentVal.getFullYear() * 12 + currentVal.getMonth());

                    break;

                case "year":

                    if(maxDate !== false){

                        maxDate = leoDate.getDate(maxDate, maxMineFormat, true);

                        maxDate && (maxDate = maxDate.getFullYear());

                    }

                    if(minDate !== false){

                        minDate = leoDate.getDate(minDate, maxMineFormat, true);

                        maxDate && (minDate = minDate.getFullYear());

                    }

                    currentVal && (currentVal = currentVal.getFullYear());

                    break;

            }

            return function(date){

                var returnVal, value;

                switch (type) {

                    case "day":

                        if((maxDate !== false && date > maxDate) || (minDate !== false && date < minDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === date){

                            This._selectDay = true;

                        }else{

                            This._selectDay = false;

                        }

                        break;

                    case "month":

                        value = start + date;

                        if((minDate !== false && value < minDate) || (maxDate !== false && value > maxDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === value){

                            This._selectMonth = true;

                        }else{

                            This._selectMonth = false;

                        }

                        break;

                    case "year":

                        value = start + date;

                        if((minDate !== false && value < minDate) || (maxDate !== false && value > maxDate)){

                            returnVal = false;

                        }else{

                            returnVal = true;

                        }

                        if(currentVal !== false && currentVal === value){

                            This._selectYear = true;

                        }else{

                            This._selectYear = false;

                        }

                        break;

                }

                return returnVal;

            }

        },

        _currentDateNextMonths:function(){

        	this._currentDate.nextMonths();

        },

        _currentDatePrevMonths:function(){

        	this._currentDate.prevMonths();

        },

        _currentDateNextYears:function(){

            this._currentDate.nextYears();

        },

        _currentDatePrevYears:function(){

            this._currentDate.prevYears();

        },

        _currentDatePrevTenYears:function(){

            this._currentDate.addYears(-10);

        },

        _currentDateNextTenYears:function(){

            this._currentDate.addYears(10);

        },

        _setCurrentVal:function(){

            this._currentVal = this._currentDate.getCurrentDate(true);

        },

        addEvent:function(){

        	var This = this;

        	this._on(this.$datetimepicker, 'click', 'a', function(event){

        		var $this = $(this);

                switch($this.attr('event')) {

                    case "prevMonths":

                        This._currentDatePrevMonths();

                        break;

                    case "nextMonths":

                        This._currentDateNextMonths();

                        break;

                    case "prevYears":

                        This._currentDatePrevYears();

                        break;

                    case "nextYears":

                        This._currentDateNextYears();

                        break;

                    case "prevMonths":

                        This._currentDateNextYears();

                        break;

                    case "prevTenYears":

                        This._currentDatePrevTenYears();

                        break;

                    case "nextTenYears":

                        This._currentDateNextTenYears();

                        break;

                }

                This._setViewSelectTable();

        	})._on(this.$datetimepickerHeaderTitle, 'click', function(event){

                switch(This.viewSelect) {

                    case "day":

                        This.viewSelect = 'month';

                        This._setViewSelectTable();

                        break;

                    case "month":

                        This.viewSelect = 'year';

                        This._setViewSelectTable();

                        break;

                    case "year":

                        break;

                }

            })._on(this.$datetimepicker, 'click', 'td[role="select"]', function(event){

                switch(This.viewSelect) {

                    case "day":

                        This._currentDate.getCurrentDate().setTime($(this).attr('value'));

                        This._setCurrentVal();

                        This._setViewSelectTable();

                        break;

                    case "month":

                        This.viewSelect = 'day';

                        This._currentDate.getCurrentDate().setMonth($(this).attr('value'));

                        This._setViewSelectTable();

                        break;

                    case "year":

                        This.viewSelect = 'month';

                        This._currentDate.getCurrentDate().setFullYear($(this).attr('value'));

                        This._setViewSelectTable();

                        break;

                }

            });

        }

    });

    return $;

}));