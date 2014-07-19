
$.config({

        level:6,

        baseUrl:'leoUi/',

        alias : {

            leoCss : '../../css/leo.css',

            jqueryMousewheel:'../jquery/jquery-mousewheel'

        },

        shim: {

            jquery: {

                src: '../jquery/jquery-1.9.1.js',

                exports: "$"

            }　

        }

}).require('leoUi-draggable,leoCss,ready', function($) {

    $(".a").leoDraggable({

            handle:false, //点击拖拽地区

            cursor:'move',//拖动时的CSS指针。

            bClone:true, //是否使用克隆拖拽

            bCloneAnimate:true, //克隆拖拽是否动画

            dragBoxReturnToTarget:false,//是否回到target位置

            duration:400,//动画时间

            stopMouseWheel:false, //拖拽时候是否关闭滚轮事件

            revert:false, //如果设置为true, 当拖动停止时元素将返回它的初始位置。

            revertAnimate:true //还原是否动画

    });


});
