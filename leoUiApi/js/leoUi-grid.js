/**
+-------------------------------------------------------------------
* jQuery leoUi--grid
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

    	name:'leoGrid',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            disabled:false,//如果设置为true禁用grid

            tableModel:[],//grid格式见例子

            onlyInit:false,//只是初始化

            trIdKey:'trid',//trIdKey

            disabledCheck:false,//禁用选择

            disabledEvent:false,//是否禁用事件

            isHover:true,//是否移入变色

            hoverClass:'leoUi-state-hover',//移入添加的类名称

            evenClass:'leoUi-priority-secondary',//为表身的偶数行添加一个类名，以实现斑马线效果。false 没有

            activeClass:'leoUi-state-highlight',//选中效果

            boxCheckType:'multiple',//radio单选，multiple多选,false无

            tableModelDefault:{

                width:100,//宽

                type:'text',//类型

                align:'center',//对齐方式

                theadName:'',//对应的表头内容

                className:false,//加上的class

                resize:false,//是否可调整宽度

                sortable:false,//是否排序

                checked:false,//是否选择

                fixed:false,//是否固定

                cellLayout:5,//宽度以外的值

                minWidth:10,//最小宽度

                renderCell:null,//为每一个单元格渲染内容

                edit:false,//是否可以编辑

                selectValId:false,//select类型的Id

                localSort:false,//自定义列的本地排序规则

                formatSort:false,//自定义列的本地排序格式化值的规则

                getSortVal:false,//自定义列的本地排序取值的规则

                sortableType:'string'//自定义列的本地排序取值的类型

            },

            dataType:'ajax',//ajax,data

            gridData:[],//grid的数据

            ajax:{

                url:'leoui.com',

                type: "POST",

                dataType:'json',

                offsetKey:'offset',//分页offsetkey

                lengthKey:'length',//分页长度key

                teamsCountKey:'teams_count',//数据总条数

                teamsKey:'teams',//总数据(为false时直接用data)

                data:{}

            },

            cellEdit:false,//是否可编辑单元格

            minRow:1,//至少一条数据

            defaulTrId: 0,//默认trid

            isPage:true,//是否要分页功能

            rowNum:10,//每一页条数

            rowList:[10,20,30],//每一页可选条数

            currentPage:1,//当前选中的页面 (按照人们日常习惯,非计算机常识,是从1开始)

            height:500,//设置表格的高度(可用函数返回值)

            resizeHeight:false,//是否在改变尺寸时调节高度

            width:500,//设置表格的宽度(可用函数返回值)

            resizeWidth:false,//是否在改变尺寸时调节宽度

            beforeSaveCell:false,//保存之前回调

            afterSaveCell:$.noop,//保存后回调

            beforeCellEdit:false,//编辑之前回调

            afterCellEdit:$.noop,//编辑后回调

            setTableWidthCallback:$.noop,//设置表格的宽度默认与父级宽高

            tableLoadCallback:$.noop,//table完成后回调

            clickTdCallback:$.noop//点击bodyTableTD回调

        },

        _init:function(){

            this._createGridBox();

        },

        _getSendAjaxPagerInfo:function( offset, length, isCurrentPage ){

            var op = this.options,ajax = $.extend( {}, op.ajax );

            ajax.data[ajax.lengthKey] = length;

            ajax.data[ajax.offsetKey] = isCurrentPage === true ? ( offset - 1 ) * length : offset;

            return ajax;

        },

        _getData:function(pagerInfo){

            var op = this.options,dataType = op.dataType,ajax,This = this,teamsKey;

            if(dataType === 'ajax'){

                this._loading(true);

                teamsKey = op.ajax.teamsKey;

                if(op.isPage === true){

                    pagerInfo === 'init' ? ajax = this._getSendAjaxPagerInfo( op.currentPage, op.rowNum, true ) : ajax = this._getSendAjaxPagerInfo( pagerInfo.fristItems, pagerInfo.perPages );

                }else{

                    ajax = op.ajax;

                }

                $.ajax(ajax).done(function(data){

                    This._loading();

                    This.totalItems = data[ajax.teamsCountKey];

                    teamsKey === false ? This.teams = data : This.teams = data[teamsKey];

                    This._clearTableData();

                    if(op.isPage === true){

                        This._changePager( This._getPagerInfo( pagerInfo.currentPage ) );

                    }else{

                        This._bodyTableAppendContent();

                        This._setTableHeight(true);

                        This._resizeTableWidth();

                    }

                    This._boxIsAllCheck();

                    This._restoreSortClass();

                }).fail(function(data){

                    console.log(data.statusText);

                });

            }else if(dataType === 'data'){

                this._clearTableData();

                if(op.isPage === true){

                    this._changePager(pagerInfo)

                }else{

                    this._bodyTableAppendContent();

                    this._setTableHeight(true);

                    this._resizeTableWidth();

                }

                this._boxIsAllCheck();

                this._restoreSortClass();

            }

        },

        _getPagerInfo:function( page, perPages, totalItems ){

            var op = this.options,totalItems = + totalItems || + this.totalItems ||  0,

            index,currentPage,last,totalpages;

            perPages = + perPages || + this.perPages || + op.rowNum;

            perPages < 1 && ( perPages = 1 );

            this.perPages = perPages;

            totalpages = Math.ceil( totalItems/perPages );

            totalpages < 1 && ( totalpages = 1 );

            oldCurrentPage = currentPage = this.currentPage || + op.currentPage;

            page = page || 0;

            switch(page){

                case 'now':

                    break;

                case 'first_page':

                    currentPage = 0;

                    break;

                case 'prev_page':

                    currentPage -= 1;

                    break;

                case 'next_page':

                    currentPage += 1;

                    break;

                case 'last_page':

                    currentPage = totalpages;

                    break;

                default:

                    currentPage = + page;

            }

            if( currentPage < 1 ){

                currentPage = 1;

            }else if( currentPage > totalpages ){

                currentPage = totalpages;

            }

            this.currentPage =  currentPage;

            index = perPages * ( currentPage - 1 );

            index < 0 && ( index = 0 );

            last = index + perPages - 1;

            last + 1 > totalItems && ( last = totalItems - 1 );

            return{

                isChange: oldCurrentPage !== currentPage,

                totalItems: totalItems,

                perPages: perPages,

                length: last + 1 - index,

                currentPage: currentPage,

                totalpages: totalpages,

                isFristPage: currentPage === 1,

                isLastPage: currentPage === totalpages,

                fristItems: index,

                lastItems: last

            }

        },

        _initData:function(){

            var op = this.options,pagerInfo,This = this,teamsKey;

            if( op.dataType === 'data' ){

                this.totalItems = op.gridData.length;

                this.teams = $.extend( [], op.gridData );

                This.options.isPage === true && (pagerInfo = this._getPagerInfo( op.currentPage, op.rowNum ));

                this._createBodyTable(pagerInfo);

                this._initPager(pagerInfo);

                this._addEvent();

                this.$target.empty().append( this.$gridBox );

                this._setTableWidth();

                This._setFixHeight();

                this._setTableHeight();

                this._tableWidthAuto();

                this.$gridBox.css( 'visibility', '' );

                this.options.tableLoadCallback.call( null, this.$bodyTable );

            }else if( op.dataType === 'ajax' ){

                this._loading(true);

                teamsKey = op.ajax.teamsKey;

                this.options.isPage === true ? ajax = this._getSendAjaxPagerInfo( op.currentPage, op.rowNum, true ) : ajax = op.ajax;;

                this.$target.empty().append( this.$gridBox );

                this.$gridBox.css( 'visibility', '' );

                $.ajax(ajax).done(function(data){

                    This._loading();

                    console.log(data)

                    This.totalItems = data[ajax.teamsCountKey];

                    teamsKey === false ? This.teams = data : This.teams = data[teamsKey];

                    This.options.isPage === true && ( pagerInfo = This._getPagerInfo( op.currentPage, op.rowNum ) );

                    This._createBodyTable(pagerInfo);

                    This._initPager(pagerInfo);

                    This._addEvent();

                    This._setTableWidth();

                    This._setFixHeight();

                    This._setTableHeight();

                    This._tableWidthAuto();

                    This.options.tableLoadCallback.call( null, this.$bodyTable );

                }).fail(function(data){

                    console.log(data.statusText);

                });

            }

        },

        changeData:function(url){

            !!url && (this.options.ajax.url = url);

            this._getData('init');

            this.$gridBox.show();

        },

        _setPager:function( page, perPages, mustChange, changeInput ){

            if(this.options.isPage === false){return;}

            var pagerInfo = this._getPagerInfo( page, perPages );

            if( pagerInfo.isChange === false && !mustChange ){

                changeInput === true && this.$setPageInput.val( pagerInfo.currentPage );

                return;

            }

            this._getData(pagerInfo);

        },

        _bodyTableAppendContent:function(pagerInfo){

            this.$bodyTable.empty().append(this._bodyTableTbodyStr(pagerInfo));

        },

        _changePager:function( pagerInfo, notAddBodyTable, rowLength ){

            if(this.options.isPage === false){return;}

            var fPageStyle,LPageStyle,lastItems,fristItems,oldCurrentPage,

            pageRightInfo = this.$pageRightInfo;

            rowLength === 0 && ( oldCurrentPage = this.currentPage );

            !pagerInfo && ( pagerInfo = this._getPagerInfo( 'now' ) );

            pagerInfo.isFristPage === true ? fPageStyle = 'default' : fPageStyle = 'pointer';

            pagerInfo.isLastPage === true ? LPageStyle = 'default' : LPageStyle = 'pointer';

            !notAddBodyTable && this._bodyTableAppendContent(pagerInfo);

            this.$firstPage.css( 'cursor', fPageStyle );

            this.$nextPage.css( 'cursor', LPageStyle );

            this.$lastPage.css( 'cursor', LPageStyle );

            if( typeof rowLength === 'number' ){

                lastItems = pagerInfo.fristItems + rowLength;

                if( rowLength === 0 ){

                    this.$pageRightInfo.text('无数据显示');

                    this.currentPage = oldCurrentPage;

                }else{

                    this.$pageRightInfo.html((pagerInfo.fristItems+1)+' - '+lastItems+'&nbsp;&nbsp;共'+pagerInfo.totalItems+'条');

                }

            }else{

                this.$allPage.text(pagerInfo.totalpages);

                this.$prevPage.css( 'cursor', fPageStyle );

                this.$setPageInput.val(pagerInfo.currentPage);

                if(pagerInfo.length === 0){

                    this.$pageRightInfo.text('无数据显示');

                }else{

                    lastItems = pagerInfo.lastItems + 1;

                    this.$pageRightInfo.html((pagerInfo.fristItems+1)+' - '+lastItems+'&nbsp;&nbsp;共'+pagerInfo.totalItems+'条');

                }

            }

            this._setTableHeight(true);

            this._resizeTableWidth();

        },

        _initPager:function( pagerInfo, isHide ){

            if(this.options.isPage === false){return;}

            var rowList = this.options.rowList,i = 0,length = rowList.length,child,

            pagerInfo = pagerInfo !== 'init' ? (pagerInfo || this._getPagerInfo()) : {},

            perPages = pagerInfo.perPages,leoGrid = this.leoGrid,

            fPageStyle = pagerInfo.isFristPage === true ? 'cursor: default;' : 'cursor: pointer;';

            LPageStyle = pagerInfo.isLastPage === true ? 'cursor: default;' : 'cursor: pointer;';

            str = '<div id="'+ leoGrid +'page" class="leoUi-state-default leoUi-jqgrid-pager leoUi-corner-bottom"><div class="leoUi-pager-control" id="'+ leoGrid +'pg_page"><table cellspacing="0" cellpadding="0" border="0" role="row" style="width:100%;table-layout:fixed;height:100%;" class="leoUi-pg-table"><tbody><tr><td align="left" id="'+ leoGrid +'page_left"></td><td align="center" style="white-space: pre; width: 276px;" id="'+ leoGrid +'page_center"><table cellspacing="0" cellpadding="0" border="0" class="leoUi-pg-table" style="table-layout:auto;" id="'+ leoGrid +'page_center_table"><tbody><tr><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'first_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-first"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'prev_page" style="'+fPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-prev"></span></td><td style="width: 4px; cursor: default;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td><input id="'+ leoGrid +'set_page_input" type="text" role="textbox" value="'+pagerInfo.currentPage+'" maxlength="7" size="2" class="leoUi-pg-input"><span style="margin:0 4px 0 8px">共</span><span id="'+ leoGrid +'sp_1_page">'+pagerInfo.totalpages+'</span><span style="margin:0 4px">页</span></td><td style="width:4px;" class="leoUi-pg-button leoUi-state-disabled"><span class="leoUi-separator"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'next_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-next"></span></td><td class="leoUi-pg-button leoUi-corner-all leoUi-state-disabled" id="'+ leoGrid +'last_page" style="'+LPageStyle+'"><span class="leoUi-icon leoUi-icon-seek-end"></span></td><td><select  id="'+ leoGrid +'get_perPages_select" class="leoUi-pg-selbox">';

            for( ; i < length; i++ ){

                child = rowList[i];

                child === perPages ? str += '<option selected="selected" value="'+child+'">'+child+'</option>' : str += '<option value="'+child+'">'+child+'</option>';

            }

            pagerInfo.length === 0 ? str += '</select></td></tr></tbody></table></td><td align="right" id="'+ leoGrid +'page_right"><div id="'+ leoGrid +'page_right_info" class="leoUi-paging-info" style="text-align:right">无数据显示</div></td></tr></tbody></table></div></div>' : str += '</select></td></tr></tbody></table></td><td align="right" id="'+ leoGrid +'page_right"><div id="'+ leoGrid +'page_right_info" class="leoUi-paging-info" style="text-align:right">'+(pagerInfo.fristItems+1)+' - '+(pagerInfo.lastItems+1)+'&nbsp;&nbsp;共'+pagerInfo.totalItems+'条</div></td></tr></tbody></table></div></div>';;

            this.$pager = $(str);

            this.$firstPage = this.$pager.find('#' + leoGrid + 'first_page');

            this.$prevPage = this.$pager.find('#' + leoGrid + 'prev_page');

            this.$nextPage = this.$pager.find('#' + leoGrid + 'next_page');

            this.$lastPage = this.$pager.find('#' + leoGrid + 'last_page');

            this.$allPage = this.$pager.find('#' + leoGrid + 'sp_1_page');

            this.$pageRightInfo = this.$pager.find('#' + leoGrid + 'page_right_info');

            this.$setPageInput = this.$pager.find('#' + leoGrid + 'set_page_input');

            this._initPagerEvent();

            this.$pager.appendTo(this.$gviewGrid);

        },

        _initPagerEvent:function(){

        	var This = this,leoGrid = this.leoGrid;

            this._on( this.$pager.find('#' + leoGrid + 'page_center_table'), 'click', 'td', function(event){

                event.preventDefault();

                if( this.id === leoGrid + 'first_page' ){

                    This._setPager('first_page');

                }else if( this.id === leoGrid + 'prev_page' ){

                    This._setPager('prev_page');

                }else if( this.id === leoGrid + 'next_page' ){

                    This._setPager('next_page');

                }else if( this.id === leoGrid + 'last_page' ){

                    This._setPager('last_page');

                }

            } );

            this._on( this.$pager.find('#' + leoGrid + 'get_perPages_select'), 'change', function(event){

                event.preventDefault();

                This._setPager( 'first_page', this.value, true );

            } );

            this._on( this.$setPageInput, 'keydown', function(event){

                event.keyCode === 13 && This._setPager( $(this).val(), false, false, true );

            } );

        },

        _createGridBox:function(){

            var leoGrid = this.leoGrid = $.leoTools.getId('Grid') + '_';

            this.$gridBox = $('<div id="'+ leoGrid +'leoUi_grid" class="leoUi-jqgrid leoUi-widget leoUi-widget-content leoUi-corner-all" style="visibility:hidden"><div id="'+ leoGrid +'lui_grid" class="leoUi-widget-overlay jqgrid-overlay"></div><div id="'+ leoGrid +'load_grid" class="loading leoUi-state-default leoUi-state-active">读取中...</div><div class="leoUi-jqgrid-view" id="'+ leoGrid +'gview_grid"><div class="leoUi-state-default leoUi-jqgrid-hdiv"><div class="leoUi-jqgrid-hbox"></div></div><div class="leoUi-jqgrid-bdiv"><div class="leoUi-jqgrid-hbox-inner" style="position:relative;"></div></div></div><div id="'+ leoGrid +'rs_mgrid" class="leoUi-jqgrid-resize-mark" ></div></div>');

            this.tableData = {};

            this.tableData.selectRowElArr = [];

            this.leoGridTrId = 0;

            this.$gviewGrid = this.$gridBox.find('#' + leoGrid + 'gview_grid');

            this.$uiJqgridHdiv = this.$gviewGrid.find('div.leoUi-jqgrid-hdiv');

            this.$uiJqgridBdiv = this.$gviewGrid.find('div.leoUi-jqgrid-bdiv');

        	this._createHeadTable();

            this._createBoxCheckFn();

            this._createResizeTh();

            this._createSortTb();

            if(this.options.onlyInit){

                this._createBodyTable('init');

                this._initPager('init');

                this.$target.empty().append( this.$gridBox );

                this._addEvent();

                this._setFixHeight();

                this._setTableWidth();

                this._tableWidthAuto();

                this.$gridBox.hide().css( 'visibility', '' );

            }else{

                this._initData();

            }

        },

        _clearTableData:function(){

            this.tableData = {};

            this.tableData.selectRowElArr = [];

        },

        _loading:function(show){

            !this.$loading && ( this.$loading = this.$gridBox.find('#' + this.leoGrid + 'load_grid') );

            show === true ? this.$loading.show() : this.$loading.hide();

        },

        setDisabledEvent:function(flag){

            this.options.disabledEvent = !!flag;

        },

        _setTableWidth:function(isRiseze){

            if( this.options.resizeWidth === false && isRiseze === true ){ return; }

            var tableWidth = this.options.width;

            if(tableWidth === false){return;}

            $.isFunction( tableWidth ) === true && ( tableWidth = tableWidth(this.$target) + 0 );

            if(typeof tableWidth === 'number'){

                this.$gridBox.width(tableWidth);

                this.$gviewGrid.width(tableWidth);

                this.$uiJqgridHdiv.width(tableWidth);

                this.$uiJqgridBdiv.width(tableWidth);

                !!this.$pager && this.$pager.width(tableWidth);

                this.tableOption.boxWidth = tableWidth;

            }else if(typeof tableWidth === 'string'){

                this.$gridBox.width(tableWidth);

                tableWidth = this.tableOption.boxWidth = this.$gridBox.width();

                this.$gviewGrid.width(tableWidth);

                this.$uiJqgridHdiv.width(tableWidth);

                this.$uiJqgridBdiv.width(tableWidth);

                !!this.$pager && this.$pager.width(tableWidth);

            }

        },

        setTableWidthOrHeight:function(tableWidth, tableHeight){

            var flag = false;

            if(typeof tableWidth === 'number'){

                this.$gridBox.width(tableWidth);

                this.$gviewGrid.width(tableWidth);

                this.$uiJqgridHdiv.width(tableWidth);

                this.$uiJqgridBdiv.width(tableWidth);

                !!this.$pager && this.$pager.width(tableWidth);

                this.tableOption.boxWidth = tableWidth;

                flag = true;

            }else if(typeof tableWidth === 'string'){

                this.$gridBox.width(tableWidth);

                tableWidth = this.tableOption.boxWidth = this.$gridBox.width();

                this.$gviewGrid.width(tableWidth);

                this.$uiJqgridHdiv.width(tableWidth);

                this.$uiJqgridBdiv.width(tableWidth);

                !!this.$pager && this.$pager.width(tableWidth);

                flag = true;
            }

            if(typeof tableHeight === 'number'){

                this.$gridBox.setOuterHeight(tableHeight);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this.difGridBoxHeight );

                flag = true;

            }else if(typeof tableHeight === 'string'){

                this.$gridBox.height(tableHeight);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this.difGridBoxHeight );

                flag = true;

            }

            flag === true && this._resizeTableWidth();

        },

        _setTableHeight:function(isRiseze){

            if( this.options.resizeHeight === false && isRiseze === true ){ return; }

            var tableHeight = this.options.height;

            if(tableHeight === false){return;}

            $.isFunction( tableHeight ) === true && ( tableHeight = tableHeight() + 0 );

            if(typeof tableHeight === 'number'){

                this.$gridBox.setOuterHeight(tableHeight);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this.difGridBoxHeight );

            }else if(typeof tableHeight === 'string'){

                this.$gridBox.height(tableHeight);

                tableHeight = this.$gridBox.height();

                this.$uiJqgridBdiv.height( tableHeight - this.difGridBoxHeight );

            }

        },

        _setFixHeight:function(){

            this.difGridBoxHeight = this.$gridBox.height() - this.$uiJqgridBdiv.outerHeight();

        },

        _tableWidthAuto:function(){

            var tableOption = this.tableOption,tableWidth = tableOption.tableWidth,

            tableModel = tableOption.tableModel,first = false;

            if( !this.$jqgThtrow ){

                this.$jqgThtrow = this.$headTable.find('tr.leoUi-jqgrid-labels');

                first = true;

                tableOption.firstTableWidth = tableWidth;

            }

            this._resizeTableWidth( first, tableWidth );

        },

        removeTableSelectRow:function(){

            var selectRowElArr = this.tableData.selectRowElArr,

            i = selectRowElArr.length;

            if( i > 0 ){

                this.totalItems -= i;

                while( i-- ){

                    $(selectRowElArr[i]).remove();

                    this._removeSelectRowtableData(selectRowElArr[i]);

                }

                this._removeSelectAllRowArr();

                this._changePager( false, true, this.$bodyTable[0].rows.length - 1 );

                this._boxIsAllCheck();

                this._refreshEvenClass();

            }

        },

        _removeSelectRowtableData:function(tr){

            delete this.tableData[tr.id];

        },

        _refreshEvenClass:function(){

            var evenClass = this.options.evenClass;

            if( typeof evenClass !== 'string' ){ return; }

            this.$bodyTable.find('tr.jqgrow').each(function(index, el) {

                $(el).removeClass(evenClass);

                index % 2 === 1 && $(el).addClass(evenClass);

            });

        },

        getSelectRowsTrId:function(){

            var arr = [],selectRowElArr = this.tableData.selectRowElArr,

            i = selectRowElArr.length;

            while( i-- ){

                arr.push( this.getTrId(selectRowElArr[i]) );

            }

            return arr;

        },

        getTrId:function(tr){

            return (tr && this.tableData[tr.id][this.options.trIdKey]) || '';

        },

        getEditRowInfo: function( tr, typeOptionDoneCallBack, typeOptionFailCallBack ){

            var tableModel = this.tableOption.tableModel,length = tableModel.length,

            child,prop,arr = [],tableData = this.tableData[tr.id],

            fnArr = [],This = this,typeOptions = {},i = 0,

            edit,trIdKey = this.options.trIdKey,data = {};

            data[trIdKey] = tableData[trIdKey];

            for( ;i < length; i++ ){

                child = tableModel[i];

                prop = {};

                edit = child.edit;

                if( edit !== false ){

                    if( edit.type === 'text' ){

                        prop.theadName = child.theadName;

                        prop.id = child.id;

                        prop.val = tableData[child.thId].val;

                    }else if( edit.type === 'select' ){

                        prop.theadName = child.theadName;

                        prop.id = child.id;

                        prop.val = tableData[child.thId].val;

                        prop.selectKeyId = edit.selectKeyId;

                        prop.selectKey = tableData[child.thId].selectKey;

                    }

                    prop.edit = $.extend( {}, edit );

                    if( typeof edit.typeOption === 'function' ){

                        if( edit.typeOptionFnAsyn === true ){

                            var dfd = $.Deferred();

                            edit.typeOption( dfd, prop.edit, 'typeOption' );

                            fnArr.push(dfd);

                        }else{

                            prop.edit.typeOption = edit.typeOption();

                        }

                    }else{

                        prop.edit.typeOption = edit.typeOption;

                    }

                    arr.push(prop);

                }

            }

            if( fnArr.length === 0 ){

                data.teams = arr;

                typeOptionDoneCallBack && typeOptionDoneCallBack(data);

                return data;

            }else{

                this._loading(true);

                $.when.apply(null,fnArr).done(function(datas){

                    This._loading();

                    data.teams = arr;

                    typeOptionDoneCallBack && typeOptionDoneCallBack(data);

                }).fail(function(failData){

                    This._loading();

                    typeOptionFailCallBack && typeOptionFailCallBack(failData);

                })

            }

        },

        _getEditTypeOption:function(edit, doneCallBack){

            var dfd,prop;

            if( typeof edit.typeOption === 'function' ){

                if( edit.typeOptionFnAsyn === true ){

                    prop = {};

                    edit.typeOption( dfd = $.Deferred(), prop, 'typeOption' );

                    dfd.done(function(data){

                        doneCallBack && doneCallBack(prop.typeOption);

                    });

                }else{

                    doneCallBack && doneCallBack(edit.typeOption());

                }

            }else{

                doneCallBack && doneCallBack(edit.typeOption);

            }

        },

        getEditCellInfo: function( td, typeOptionDoneCallBack, typeOptionFailCallBack ){

            if(!tr){return;}

            var This = this,thid = $(td).attr('thid'),trIdKey = this.options.trIdKey,

            tableData = this.tableData[td.parentNode.id],data = { thid: thid };

            data.tableModel = $.extend({}, this._getTableModel(thid));

            data.rowDatas = $.extend({}, tableData.rowDatas);

            data[trIdKey] = tableData[trIdKey];

            $.extend(data, tableData[thid]);

            return data;

        },

        removeRow:function(tr){

            $(tr).remove();

            this.totalItems--;

            this._changePager( false, true, this.$bodyTable[0].rows.length - 1 );

            this._removeSelectRowArr(tr);

            this._removeSelectRowtableData(tr);

            this._refreshEvenClass();

            this._boxIsAllCheck();

        },

        _resizeTableWidth:function( first, firstTableWidth ){

            var tableOption = this.tableOption,resizeGetWidth,jqgfirstrow,

            tableFixed = tableOption.tableFixed,i,width,prop,propArr = [];

            if( tableOption.isFixed === true ){

                first === true && this._makeFixedPercent(tableFixed);

                resizeGetWidth = this._resizeGetWidth();

                this._resizeCountWidth( resizeGetWidth.difWidth, tableFixed.fixedProp, resizeGetWidth.tableWidth, tableOption );

            }else if( first === true ){

                this.$headTable.width(firstTableWidth);

                this.$bodyTable.width(firstTableWidth);

            }else if( tableOption.isResize === true ){

                this._resizeSetHeadTable(tableOption);

            }

        },

        _resizeSetHeadTable:function(tableOption){

            var tableModels = tableOption.tableModel,i = tableModels.length,

            tableModel,$jqgThtrow = this.$jqgThtrow,

            firstTableWidth = tableOption.firstTableWidth,

            $jqgfirstrow = this.$bodyTable.find('tr.jqgfirstrow');

            while( i-- ){

                tableModel = tableModels[i]

                $jqgThtrow.children('#' + tableModel.thId ).width(tableModel.width);

                $jqgfirstrow.children('td[firstid="'+ tableModel.thId +'"]').width(tableModel.width);

            }

            this.$headTable.width(firstTableWidth);

            this.$bodyTable.width(firstTableWidth);

        },

        _resizeGetWidth:function(){

            var difWidth,scrollWidth = 18,boxWidth,tableOption = this.tableOption

            opBoxWidth = tableOption.boxWidth;

            !opBoxWidth && (opBoxWidth = this.$gridBox.width());

            boxWidth = this._resizeTableIsScroll() === true ? opBoxWidth - scrollWidth : opBoxWidth;

            difWidth = boxWidth - tableOption.fixed;

            return {

                difWidth: difWidth,

                tableWidth: boxWidth

            };

        },

        _resizeCountWidth:function( difWidth, fixedProp, tableWidth, tableOption ){

            var tableModels = tableOption.tableModel,i = tableModels.length,

            oldWidth = 0,child,j = fixedProp.length,

            $jqgfirstrow = this.$bodyTable.find('tr.jqgfirstrow'),width = 0,tableModel,

            $jqgThtrow = this.$jqgThtrow;

            while( i-- ){

                tableModel = tableModels[i]

                if( tableModel.fixed === true ){

                    child = fixedProp[--j];

                    if( j === 0 ){

                        width = difWidth - oldWidth;

                        child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                        child.width = width;

                        $jqgThtrow.children('#' + child.id ).width(width);

                        $jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                    }else{

                        oldWidth += width =  Math.round( child.fixedPercent * difWidth )

                        child.minWidth >= width && ( tableWidth += child.minWidth - width, width = child.minWidth );

                        child.width = width;

                        $jqgThtrow.children('#' + child.id ).width(width);

                        $jqgfirstrow.children('td[firstid="'+ child.id +'"]').width(width);

                    }

                }else if( tableOption.isResize === true ){

                    $jqgThtrow.children('#' + tableModel.thId ).width(tableModel.width);

                    $jqgfirstrow.children('td[firstid="'+ tableModel.thId +'"]').width(tableModel.width);

                }

            }

            this.$headTable.width(tableWidth);

            this.$bodyTable.width(tableWidth);

            this.tableOption.tableWidth = tableWidth;

        },

        _resizeTableIsScroll:function(){

            return this.$uiJqgridBdiv.height() < this.$bodyTable.outerHeight();

        },

        _makeFixedPercent:function(tableFixed){

            var fixedWidth = tableFixed.fixedWidth,fixedProp = tableFixed.fixedProp,

            i = fixedProp.length;

            this.tableOption.fixed = this.tableOption.tableWidth - fixedWidth;

            while( i-- ){

                fixedProp[i].fixedPercent = fixedProp[i].width / fixedWidth;

            }

        },

        _addEvent:function(){

            var time,This = this;

            this._on( this.window, 'resize', function(event){

                event.preventDefault();

                !!time && clearTimeout(time);

                time = setTimeout( function(){

                    This._setTableWidth(true);

                    This._setTableHeight(true);

                    This._resizeTableWidth();

                }, 16 );

            } );

            this._on( this.$uiJqgridBdiv, 'scroll', function(event){

                event.preventDefault();

                This.$uiJqgridHdiv.scrollLeft( $(this).scrollLeft() );

            } );

            this._on( this.$bodyTable, 'click', 'tr', function(event){

                !!This._boxCheck && This._boxCheck(this);

            } );

            this._on( this.$bodyTable, 'click', 'td', function(event){

                This.options.clickTdCallback.call( this, event, this, This._publicEvent, This.$bodyTable[0] );

                This.cellEdit(this);

            } );

            this._addMouseHover();

        },

        _addMouseHover:function(){

            var op = this.options,hoverClass = op.hoverClass;

            if(op.isHover){

                this._on( this.$bodyTable, 'mouseenter', 'tr', function(event){

                    event.preventDefault();

                    $(this).addClass(hoverClass);

                } );

                this._on( this.$bodyTable, 'mouseleave', 'tr', function(event){

                    event.preventDefault();

                    $(this).removeClass(hoverClass);

                } );


            }

        },

        saveCell: function(){

            var $edit = this.$bodyTable.find('#' + this.editId || ''),td,

            $td,thid,tableModel,tdData,val,edit,selectKey,op,tableModelId;

            if(!$edit[0]){return;}

            op = this.options;

            $td = $edit.parent('td');

            td = $td[0];

            trid = td.parentNode.id;

            thid = $td.attr('thid');

            tableModel = this._getTableModel(thid);

            tdData = this.tableData[trid][thid];

            tableModelId = tdData.tableModelId;

            edit = tableModel.edit;

            switch(edit.type){

                case 'text':

                    this._editKeyDownOff($edit);

                    val = $edit.val();

                    op.beforeSaveCell !== false && (val = op.beforeSaveCell(td, val, tableModelId));

                    $td.text(val = $edit.val());

                    op.afterSaveCell(td, val, tableModelId, tdData.val);

                    tdData.val = val;

                    break;

                case 'select':

                    this._editKeyDownOff($edit);

                    selectKey = $edit.val();

                    op.beforeSaveCell !== false && (selectKey = op.beforeSaveCell(td, selectKey, tableModelId));

                    $td.text(val = $edit.find('option[value="'+selectKey+'"]').text());

                    op.afterSaveCell(td, selectKey, tableModelId, tdData.selectKey);

                    tdData.selectKey = selectKey;

                    tdData.val = val;

                    break;

                default:

            }

        },

        cellEdit: function(td){

            if(this.options.cellEdit === false && !$.contains( td, this.$bodyTable[0] )){return;}

            var This = this,thid,trData,$td = $(td),

            thid = $td.attr('thid'),tdId,

            tableModel = this._getTableModel(thid),edit = tableModel.edit;

            if(edit){

                trData = this.tableData[tdId = td.parentNode.id];

                tdData = trData[thid];

                id = tdId + tableModel.id;

                if($td.find('#' + id)[0]){return;}

                this.saveCell();

                switch(edit.type){

                    case 'text':

                        this._editCellText(td, tdData, id);

                        break;

                    case 'select':

                        this._editCellSelect(id, td, edit, tdData);

                        break;

                    default:

                }

            }

        },

        _editCellText:function(td, tdData, id){

            var op = this.options,val = tdData.val,

            tableModelId = tdData.tableModelId;

            op.beforeCellEdit !== false && (val = op.beforeCellEdit(td, val, tableModelId));

            this._editKeyDownOn($('<input id="'+ id +'" class="textbox" type="text" style="width: 100%;">').val(val).appendTo($(td).empty()).select());

            this.editId = id;

            op.afterCellEdit(td, val, tableModelId);

        },

        _editCellSelect:function(id, td, edit, tdData){

            var This = this,op = this.options;

            this._getEditTypeOption(edit, function(typeOption){

                var str = '<select id="'+ id +'" size="1">',prop,

                selectKey = tdData.selectKey,

                tableModelId = tdData.tableModelId;

                for(prop in typeOption){

                    if(typeOption.hasOwnProperty(prop)){

                        str += '<option value="'+ prop +'">'+ typeOption[prop] +'</option>';

                    }

                }

                str += '</select>';

                op.beforeCellEdit !== false && (selectKey = op.beforeCellEdit(td, selectKey, tableModelId));

                This._editKeyDownOn($(str).val(selectKey).appendTo($(td).empty()).focus());

                This.editId = id;

                op.afterCellEdit(td, selectKey, tableModelId);

            })

        },

        _editKeyDownOn: function($el){

            var This = this;

            this._on($el, 'keydown', function(event) {

                if (event.which === 13) {

                    This.saveCell();

                    return false;

                }

            });

        },

        getEditTableData: function(cellCallBack, rowCallBack, tableCallBack){

            var tableData = $.extend({}, this.tableData),callBackData,

            prop,arr = [],row,rowObj,cell,isEmpty,val,tableModelId,

            trIdKey = this.options.trIdKey;

            for(prop in tableData){

                if(tableData.hasOwnProperty(prop)){

                    row = tableData[prop];

                    if(prop !== 'selectRowElArr'){

                        rowObj = {};

                        isEmpty = true;

                        for(prop in row){

                            if(row.hasOwnProperty(prop)){

                                cell = row[prop];

                                if(prop === trIdKey){

                                    rowObj[prop] = cell;

                                }else if(tableModelId = cell.tableModelId){

                                    !!cellCallBack ? val = cellCallBack(tableModelId, cell.selectKey || cell.val) : val = cell.selectKey || cell.val;

                                    rowObj[tableModelId] = val;

                                    val !== '' && (cell.isMust === true) && (isEmpty = false);

                                }

                            }

                        }

                        if(rowCallBack && (callBackData = rowCallBack(rowObj, isEmpty, row)) !== false){

                            arr.push(callBackData);

                        }else{

                            isEmpty === false && arr.push(rowObj);

                        }

                    }

                }

            }

            !!tableCallBack && (arr = tableCallBack(arr) || arr);

            return arr;

        },

        _editKeyDownOff: function($el){

            this._off($el, 'keydown');

        },

        _createBoxCheckFn:function(){

            var boxCheckType = this.options.boxCheckType;

            if( boxCheckType === 'radio' ){

                this._boxCheck = function(tr){

                    var radioBoxRow = this.tableData.radioBoxRow,

                    activeClass = this.options.activeClass,

                    $tr = $(tr),radioBoxId = this.tableOption.radioBoxId;

                    if( this.options.disabledCheck === false  ){

                        if(radioBoxRow){

                            $(radioBoxRow).removeClass(activeClass).find('input[checkid="'+ radioBoxId +'"]').prop( 'checked', false );

                        }

                        !radioBoxId ? $tr.addClass(activeClass) : $tr.addClass(activeClass).find('input[checkid="'+ radioBoxId +'"]').prop( 'checked', true );

                        this.tableData.radioBoxRow = tr;

                    }

                }

            }else if( boxCheckType === 'multiple' ){

                var This = this;

                this._boxCheck = function(tr){

                    if( this.options.disabledCheck === false  ){

                        var $tr = $(tr),activeClass = this.options.activeClass;

                        if( $tr.hasClass(activeClass) === true ){

                            $tr.removeClass(activeClass);

                            this._removeSelectRowArr(tr);

                            this._boxCheckOff(tr);

                        }else{

                            $tr.addClass(activeClass);

                            this._addSelectRowArr(tr);

                            this._boxCheckOn(tr);

                        }

                    }

                }

                this._on( this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId ), 'click.checkBox', function(event){

                    This.boxAllCheck( event, this, true );

                } );

            }

        },

        _boxCheckOn:function(tr){

            var checkBoxId = this.tableOption.checkBoxId,rowsLength,checkLength;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', true );

            this._boxIsAllCheck();

        },

        boxAllCheck:function( event, input, notSetCheck ){

            if( this.options.disabledCheck === true ){ return; }

            var checkBoxId = this.tableOption.checkBoxId,This = this,

            activeClass = this.options.activeClass,$input = $(input),

            isAllChecked = this._getSelectRowArrLength() === this.$bodyTable[0].rows.length - 1;

            if( checkBoxId ){

                this.$thCheck = this.$thCheck || this.$headTable.find( '#' + checkBoxId );

                if( !notSetCheck ){

                    isAllChecked === true ? this.$thCheck.prop( 'checked', false ) : this.$thCheck.prop( 'checked', true );

                }

            };

            this.$bodyTable.find('tr').not('tr.jqgfirstrow').each(function(index, el) {

                var $el = $(this);

                if( isAllChecked === false ){

                    $el.addClass(activeClass);

                    !!checkBoxId && $el.find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', true );

                    This._addSelectRowArr(this);

                }else{

                    $el.removeClass(activeClass);

                    !!checkBoxId && $el.find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', false );

                    This._removeSelectRowArr(this);

                }

            });

            isAllChecked === false ? $input.prop( 'checked', true ) : $input.prop( 'checked', false );

            !notSetCheck && this._boxIsAllCheck();

        },

        _boxIsAllCheck:function(){

            var checkBoxId = this.tableOption.checkBoxId,length;

            if( !checkBoxId ){ return; }

            length = this._getSelectRowArrLength();

            this.$thCheck = this.$thCheck || this.$headTable.find( '#' + this.tableOption.checkBoxId );

            if( length === 0 ){

                this.$thCheck.prop( {'indeterminate': false, 'checked': false } );

            }else if( length === this.$bodyTable[0].rows.length - 1 && length !== 0 ){

                this.$thCheck.prop( {'indeterminate': false, 'checked': true } );

            }else{

                this.$thCheck.prop( {'indeterminate': true, 'checked': false } );

            }

        },

        _boxCheckOff:function(tr){

            var checkBoxId = this.tableOption.checkBoxId;

            if( !checkBoxId ){ return; }

            $(tr).find('input[checkid="'+ checkBoxId +'"]').prop( 'checked', false );

            this._boxIsAllCheck();

        },

        _addSelectRowArr:function(el){

            var selectRowElArr = this.tableData.selectRowElArr;

            $.inArray( el, selectRowElArr ) === -1 && this.tableData.selectRowElArr.push(el);

        },

        _getSelectRowArrLength:function(){

            return !!this.tableData.selectRowElArr && this.tableData.selectRowElArr.length || 0;

        },

        _removeSelectAllRowArr:function(){

            this.tableData.selectRowElArr = [];

        },

        _removeSelectRowArr:function(el){

            var selectRowElArr = this.tableData.selectRowElArr,

            i = selectRowElArr.length;

            while( i-- ){

                if( selectRowElArr[i] === el ){

                    selectRowElArr.splice( i, 1 );

                }

            }

        },

        addRow:function(data){

            var $body = this.$bodyTable,rowLength = $body[0].rows.length - 1,

            length,i = 0,totalItems = +this.totalItems;

            $.type(data) !== 'array' && (data = [data]);

            length = data.length;

            for ( ; i < length; i++ ) {

                $body.find('tbody').append( this._tableTbodyTrStr( data[i], this.tableOption.tableModel, rowLength++ ) );

            };

            this.totalItems = totalItems + length;

            this._changePager( false, true, rowLength );

            this._boxIsAllCheck();

        },

        editCell:function(td, val, selectKey){

            if(!td && (val === undefined)){return;}

            var $td = $(td),thId = $td.attr('thid'),typeOption,

            trId = td.parentNode.id,tableModel = this._getTableModel(thId),

            rowData = this.tableData[trId],

            cellData = rowData[thId],edit = tableModel.edit,

            trIndex = rowData.trIndex;

            if(edit){

                if(edit.type === 'select'){

                    if(selectKey && (edit.selectKeyId !== undefined)){

                        cellData.selectKey = selectKey;

                    }else if(typeof (typeOption = edit.typeOption) === 'object'){

                        selectKey = val + '' || '';

                        val = typeOption[selectKey] || '';

                        cellData.selectKey = selectKey;

                    }

                }

                if( typeof tableModel.renderCell === 'function' && (val = tableModel.renderCell(selectKey || val, trIndex)) ){

                    $td.html(val);

                }else{

                    $td.text(val);

                }

                cellData.val = val;

            }

        },

        editRow:function( tr, data ){

            if(!tr && (data === undefined)){return;}

            var tableModel = this.tableOption.tableModel,i = tableModel.length,

            thId,child,val,$tr = $(tr),edit,tdData,selectKey,thid,

            trId = tr.id,$td,tableData = this.tableData[trId],

            trIndex = tableData.trIndex;

            if( !$tr[0] ){

                $tr = this.$bodyTable.find('#' + trId);

                if( !$tr[0] ){ return; }

            }

            while( i-- ){

                child = tableModel[i];

                edit = child.edit;

                if( val = data[child.id] ){

                    thid = this.leoGrid + child.id;

                    tdData = tableData[thid];

                    $td = $tr.find('td[thid="'+ thid +'"]');

                    if(edit.type === 'select'){

                        if(edit.selectKeyId && (selectKey = data[edit.selectKeyId]) !== undefined){

                            tdData && (tdData.selectKey = selectKey);

                        }else if(typeof (typeOption = edit.typeOption) === 'object'){

                            selectKey = val + '' || '';

                            val = typeOption[selectKey] || '';

                            tdData && (tdData.selectKey = selectKey);

                        }

                    }

                    if( typeof child.renderCell === 'function' && (val = child.renderCell(selectKey || val, trIndex)) ){

                        $td.html(val);

                    }else{

                        $td.text(val);

                    }

                    tdData && (tdData.val = val);

                }

            }

        },

        renderTable:function(){

            this.options.isPage === true ? this._setPager( 'now', false, true ) : this._getData();

        },

        _createResizeTh:function(){

            if( this.tableOption.isResize === true ){

                this._resizeThEvent();

                this.$rsLine = this.$rsLine || this.$gridBox.find('#' + this.leoGrid + 'rs_mgrid');

            }

        },

        _createSortTb:function(){

            if( this.tableOption.isSort === true ){

                this._sortTbEvent();

                this.colsStatus = this.colsStatus || {};

            }

        },

        _sortTbEvent:function(){

            var This = this;

            this._on( this.$headTable, 'click.sort', 'div.leoUi-jqgrid-sortable', function(event){

                This._sortTb( event, this.parentNode );

            } );

        },

        _sortTb:function( event, th ){

            var $th = $(th),thId = th.id,status,

            tableModel = this._getTableModel(thId),

            localSort = tableModel.localSort,sortby = this._sortby,

            formatSort = tableModel.formatSort || this._formatSort,

            getSortVal = tableModel.getSortVal || this._getSortVal,

            $bodyTable = this.$bodyTable,

            sortableType = $.trim( tableModel.sortableType ).toLowerCase();

            this.sortRows = $bodyTable.find('tr.jqgrow').get();

            status = this.colsStatus[thId] = ( this.colsStatus[thId] == null ) ? 1 : this.colsStatus[thId] * -1;

            if( $.isFunction(localSort) ){

                this.sortRows.sort(function( row1, row2 ){

                    return localSort( row1, row2, formatSort, getSortVal, status, thId, sortableType );

                });

            }else{

                this.sortRows.sort(function( row1, row2 ){

                    return sortby( row1, row2, formatSort, getSortVal, status, thId, sortableType );

                });

            }

            $bodyTable.append(this.sortRows);

            this._refreshEvenClass();

            this._setSortClass( $th.find('span.leoUi-sort'), status );

        },

        _setSortClass:function( $span, status ){

            var lastSpan = this.colsStatus.lastSpan;

            $span.removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb');

            if( status === 1 ){

                $span.addClass('leoUi-sort-asc');

            }else if( status === -1 ){

                $span.addClass('leoUi-sort-desc');

            }

            if( !!lastSpan && lastSpan !== $span[0] ){

                $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            }

            this.colsStatus.lastSpan = $span[0];

        },

        _restoreSortClass:function(){

            if(!this.tableOption.isSort){return;}

            var lastSpan = this.colsStatus.lastSpan;

            !!lastSpan && $(lastSpan).removeClass('leoUi-sort-desc leoUi-sort-asc leoUi-sort-ndb').addClass('leoUi-sort-ndb');

            this.colsStatus = {};

        },

        _sortby:function( row1, row2, formatSort, getSortVal, status, thId, sortableType ){

            var val1 = formatSort( getSortVal( row1, thId ), sortableType ),

            val2 = formatSort( getSortVal( row2, thId ), sortableType ),

            result = 0;

            switch(typeof val1){

                case "string":

                    result = val1.localeCompare(val2);

                    break;

                case "number" :

                    result = val1 - val2;

                    break;

            }

            result *= status;

            return result;

        },

        _getSortVal:function( tr, thId ){

            return $(tr).children('td[thid="'+ thId +'"]').text() || '';

        },

        _formatSort:function( s, sortableType ){

            var result;

            switch(sortableType){

                case "string":

                    result = s.toUpperCase();

                    break;

                case "number" :

                    if(/\%$/.test(s)){

                        result = Number(s.replace("%",""));

                    }else{

                        result = parseFloat(s,10);

                    }

                    break;

                case "date" :

                    !s ? result = 0 : result = Date.parse(s.replace(/\-/g,'/'));

                    break;

            }

            return result;

        },

        _textselect:function(bool) {

            this[bool ? "_on" : "_off"]( this.document, 'selectstart.darg', false );

            this.document.css("-moz-user-select", bool ? "none" : "");

            this.document[0].unselectable = bool ? "off" : "on";

        },

        _resizeThEvent:function(){

            var This = this;

            this._on( this.$headTable, 'mousedown.dargLine', 'span.leoUi-jqgrid-resize-ltr', function(event){

                This._resizeLineDragStart(event,this.parentNode);

            } );

        },

        _getTableModel:function(thid){

            var tableModels = this.tableOption.tableModel,

            i = tableModels.length,tableModel;

            while(i--){

                tableModel = tableModels[i];

                if( tableModel.thId === thid ){

                    return tableModel;

                }

            }

        },

        _resizeLineDragStart:function(event,th){

            var $th = $(th),This = this,firstLeft,baseLeft,thId = th.id,dargLine,

            lineHeight = this.$uiJqgridHdiv.outerHeight() + this.$uiJqgridBdiv.outerHeight();

            dargLine = this.dargLine = {};

            dargLine.width = $th.width();

            dargLine.thId = thId;

            dargLine.minWidth = this._getTableModel(thId).minWidth;

            this.$rsLine.css({top:0,left:firstLeft = ( event.pageX - (this.dargLine.startLeft=this.$gridBox.offset().left))}).height(lineHeight).show();

            baseLeft = dargLine.baseLeft = firstLeft - dargLine.width;

            dargLine.minLeft = baseLeft + dargLine.minWidth;

            this._textselect(true);

            this._on( this.$uiJqgridHdiv, 'mousemove.dargLine', function(event){

                This._resizeLineDragMove(event);

            } );

            this._on( this.document, 'mouseup.dargLine', function(event){

                This._resizeLineDragStop(event);

            } );

            event.preventDefault();

            return true;

        },

        _resizeLineDragMove:function(event){

            var dargLine = this.dargLine,

            minLeft = dargLine.minLeft,left = event.pageX - dargLine.startLeft;

            minLeft > left && ( left = minLeft );

            dargLine.left = left;

            this.$rsLine.css({top:0,left:left});

            event.preventDefault();

            return false;

        },

        _resizeLineDragStop:function(event){

            var dargLine = this.dargLine;

            this._off( this.$uiJqgridHdiv, 'mousemove.dargLine' );

            this._off( this.document, 'mouseup.dargLine' );

            this.$rsLine.hide();

            this._setTdWidth( dargLine.left - dargLine.baseLeft, dargLine );

            this._textselect(false);

            this.dargLine = null;

            return false;

        },

        _setTdWidth:function( newTdWidth, dargLine ){

            var difWidth = newTdWidth - dargLine.width,

            tableOption = this.tableOption,id = dargLine.thId,

            tableWidth = tableOption.tableWidth + difWidth;

            this.$jqgThtrow.children('#' + id ).width(newTdWidth);

            this.$bodyTable.find('tr.jqgfirstrow').children('td[firstid="'+ id +'"]').width(newTdWidth);

            this.$headTable.width(tableWidth);

            this.$bodyTable.width(tableWidth);

            tableOption.isFixed === true && ( tableOption.tableWidth = tableWidth );

        },

        _createHeadTable:function(){

            this.$headTable = $( this._headTableStr() ).appendTo( this.$uiJqgridHdiv.find('div.leoUi-jqgrid-hbox') );

        },

        _createBodyTable:function(pagerInfo){

            var str = '<table class="leoUi-jqgrid-btable" cellspacing="0" cellpadding="0" border="0">';

            pagerInfo !== 'init' && (str += this._bodyTableTbodyStr(pagerInfo));

            str += '</table>';

            this.$bodyTable = $(str).appendTo( this.$uiJqgridBdiv.find('div.leoUi-jqgrid-hbox-inner') );

        },

        _bodyTableTbodyStr:function( pagerInfo ){

            if( !this.teams ){ return ''; }

            var opModel = this.tableOption.tableModel,index,op = this.options,

            pagerInfo,i,length,teams = this.teams,minRow = op.minRow,

            str = '<tbody>' + this._tableTbodyFirstTrStr( opModel, opModel.length );

            if(op.isPage === true){

                pagerInfo = pagerInfo || this._getPagerInfo();

                index = i = pagerInfo.fristItems;

                length = pagerInfo.lastItems + 1

                if( op.dataType === 'ajax' ){

                    i = 0;

                    length = pagerInfo.length;

                }

                teams = this.createEmptyArray(length, teams);

                length = teams.length;

                for ( ; i < length; i++ ) {

                    str += this._tableTbodyTrStr( teams[i], opModel, index );

                    index++;

                };

            }else{

                length = teams.length || this.totalItems;

                teams = this.createEmptyArray(length, teams);

                length = teams.length;

                for ( i = 0; i < length; i++ ) {

                    str += this._tableTbodyTrStr( teams[i], opModel, i );

                };

            }

            return str += '</tbody>';

        },

        createEmptyArray:function(length, teams){

            var minLength,op = this.options,minRow = op.minRow,

            tableModel = op.tableModel,i,obj;

            if((minLength = minRow - length) > 0 && tableModel){

                i = tableModel.length;

                obj = {};

                obj[op.trIdKey] = op.defaulTrId;

                while(i--){

                    obj[tableModel[i].id] = "";

                }

                while(minLength--){

                    teams.push($.extend({}, obj));

                }

                return teams;

            }else{

                return teams;

            }

        },

        _headTableStr:function(){

            var str = '',gridJsonTh,op = this.options,

            tableModel,i = 0,opModel,modelLength;

            !this.tableOption && ( this.tableOption = { tableWidth : 0, tableModel: [], tableFixed: { fixedWidth: 0, fixedProp: [] } } );

            tableModel = op.tableModel;

            modelLength = tableModel.length;

            str +='<table class="leoUi-jqgrid-htable" cellspacing="0" cellpadding="0" border="0"><thead><tr class="leoUi-jqgrid-labels">';

            for ( ; i < modelLength; i++ ) {

                str += this._tableThStr( tableModel[i] );

            };

            str += '</tr></thead></table>';

            return str;

        },

        _tableThStr:function(obj){

            var prop,tableOption = this.tableOption,serialNumber,checkBox,radioBox,str = '';

            if( obj.id || ( !tableOption.serialNumberId && ( serialNumber = obj.boxType === 'serialNumber' ) ) || ( !tableOption.checkBoxId && ( checkBox = obj.boxType === 'checkBox' ) ) || ( !tableOption.radioBoxId && ( radioBox = obj.boxType === 'radioBox' ) ) ){

                obj.thId = this.leoGrid + ( obj.id || obj.boxType );

                prop = $.extend( {}, this.options.tableModelDefault, obj );

                serialNumber === true && ( tableOption.serialNumberId = prop.thId );

                radioBox === true && ( tableOption.radioBoxId = prop.thId + '_input' );

                checkBox === true && ( tableOption.checkBoxId = prop.thId + '_input' );

                tableOption.tableModel.push(prop);

                tableOption.tableWidth += prop.width + prop.cellLayout;

                str += '<th id = "'+ prop.thId +'" class="leoUi-state-default leoUi-th-column leoUi-th-ltr" style="width:'+ prop.width +'px">';

                prop.resize === true && ( str += '<span class="leoUi-jqgrid-resize leoUi-jqgrid-resize-ltr" style="cursor: col-resize;">&nbsp;</span>', tableOption.isResize = true );

                prop.sortable === true ? str += '<div class="leoUi-jqgrid-sortable">' : str += '<div>';

                if( prop.type === 'check' ){

                    prop.checked === true ? str += '<input type="checkbox" checked>' : str += '<input type="checkbox">';

                }else if(checkBox){

                    str += '<input type="checkbox" id="'+ tableOption.checkBoxId +'">'

                }else{

                    str += prop.theadName + '';

                };

                prop.sortable === true && ( str += '<span class="leoUi-sort-ndb leoUi-sort"><span class="leoUi-sort-top"></span><span class="leoUi-sort-bottom"></span></span>', tableOption.isSort = true );

                if( prop.fixed === true ){

                    tableOption.tableFixed.fixedProp.push( { id: prop.thId, width: prop.width, minWidth: prop.minWidth } );

                    tableOption.tableFixed.fixedWidth += prop.width;

                    tableOption.isFixed = true;

                }

                str += '</div></th>';

            }

            return str;

        },

        _tableTbodyFirstTrStr:function( gridJsonTh, thLength ){

            var str = '<tr class="jqgfirstrow" style="height:auto">',width,i = 0;

            for ( ; i < thLength; i++ ) {

                th = gridJsonTh[i];

                str += '<td style="height:0px;width:'+ th.width +'px" firstid="' + th.thId + '"></td>';

            };

            return str += '</tr>';

        },

        _tableTbodyTrStr:function( gridJsonTr, gridJsonTh, trIndex ){

            var str = '',width,i = 0,length = gridJsonTh.length,th,op = this.options,

            trId = gridJsonTr && gridJsonTr[op.trIdKey],tableDatas = this.tableData,

            evenClass = op.evenClass,leoGrid = this.leoGrid,tableData,rowDatas,

            id = leoGrid + this.leoGridTrId++,rowDataKeys = op.rowDataKeys,value;

            typeof evenClass !== 'string' ? str = '<tr id="' + id + '" class="leoUi-widget-content jqgrow leoUi-row-ltr" tabindex="-1" ' : trIndex % 2 === 1 ? str = '<tr id="' + id + '" class="leoUi-widget-content jqgrow leoUi-row-ltr ' + evenClass + '" tabindex="-1" ' : str = '<tr id="' + id + '" class="leoUi-widget-content jqgrow leoUi-row-ltr" tabindex="-1"';

            str += '>';

            tableData = tableDatas[id] = {};

            rowDatas = tableData.rowDatas = {};

            !!rowDataKeys && rowDataKeys.replace(/[^, ]+/g,function(key){

                rowDatas[key] = gridJsonTr[key] || '';

            });

            !!~trId && (tableData[op.trIdKey] = trId);

            tableData.trIndex = trIndex;

            for ( ; i < length; i++ ) {

                th = gridJsonTh[i];

                value = gridJsonTr && gridJsonTr[th.id] || '';

                str += this._tableTdStr( value, th, trIndex, gridJsonTr, tableData );

            };

            return str += '</tr>';

        },

        _tableTdStr:function( value, tableModel, trIndex, tr, tableData ){

            if( !tableModel ){ return; }

            var className = tableModel.className,renderCell = tableModel.renderCell,

            typeOption,selectKey,edit = tableModel.edit,thId = tableModel.thId,

            tdData,value = value + '',tdData,

            str = '<td style="text-align:' + tableModel.align + '" thid="' + thId + '"';

            className !== false && ( str += ' class="' + className + '"' );

            !!edit && (tdData = tableData[thId] = {});

            if(edit.type === 'select'){

                if(edit.selectKeyId && (selectKey = tr[edit.selectKeyId]) !== undefined){

                    !!tdData && (tdData.selectKey = selectKey);

                }else if(typeof (typeOption = edit.typeOption) === 'object'){

                    selectKey = value + '' || '';

                    value = typeOption[selectKey] || '';

                    !!tdData && (tdData.selectKey = selectKey);

                }

            }

            str += '>';

            if( typeof renderCell === 'function' && typeof ( renderCell = renderCell( selectKey || value, trIndex ) ) === 'string' ){

                str += (value = renderCell);

            }else if( tableModel.boxType === 'checkBox' ){

                str += '<input type="checkbox" checkid="'+ this.tableOption.checkBoxId +'">';

            }else if( tableModel.boxType === 'radioBox' ){

                str += '<input type="checkbox" checkid="'+ this.tableOption.radioBoxId +'">';

            }else if( tableModel.boxType === 'serialNumber' ){

                str += trIndex + 1;

            }else{

                str += $.leoTools.htmlEncode(value);

            };

            if(tdData){

                tdData.val = value;

                tdData.tableModelId = tableModel.id;

                edit.isMust === false ? tdData.isMust = false : tdData.isMust = true;

            }

            return str += '</td>';

        }

    });

	return $;

}));