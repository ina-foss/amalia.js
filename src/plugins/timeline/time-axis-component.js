/**
 * Copyright (c) 2015 Institut National de l'Audiovisuel, INA
 *
 * This file is part of amalia.js
 *
 * Amalia.js is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version
 *
 * Redistributions of source code, javascript and css minified versions must
 * retain the above copyright notice, this list of conditions and the following
 * disclaimer
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission
 *
 * You should have received a copy of the GNU General Public License along with
 * amalia.js. If not, see <http://www.gnu.org/licenses/>
 *
 * Amalia.js is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details
 */
/**
 * In charge to handle the time axe component
 * @class TimeAxisComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent.extend( "fr.ina.amalia.player.plugins.timeline.TimeAxisComponent",{
    STYLE_CLASSNAME_EXPAND_ON : 'ajs-icon-chevron-down',
    STYLE_CLASSNAME_EXPAND_OFF : 'ajs-icon-chevron-right',
    eventTypes : {
        CLICK_AT_TIC : "fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.event.clickattic",
        RANGE_CHANGE : "fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.event.rangechange",
        CHANGE_DISPLAY : "fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.event.changedisplay",
        CHANGE_TIMEAXE_DISPLAY_STATE : "fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.event.changetimeaxedisplaystate"
    }
},
{
    /**
     * Start time code
     * @property tcin
     * @type {Number}
     * @default 0
     */
    tcin : 0,
    /**
     * End time code
     * @property tcout
     * @type {Number}
     * @default 0
     */
    tcout : 0,
    /**
     * Media duration
     * @property duration
     * @type {Number}
     * @default 0
     */
    duration : 0,
    /**
     * Instance of tic component
     * @property segmentsGenerator
     * @type {Object}
     * @default null
     */
    segmentsGenerator : null,
    /**
     * Instance of zoom component
     * @property timeZoomComponent
     * @type {Object}
     * @default null
     */
    timeZoomComponent : null,
    /**
     * Init this class
     * @method init
     * @param {Object} settings
     */
    init : function (settings)
    {
        this.settings = $.extend( {
            debug : false,
            container : null,
            duration : 0,
            expand : false,
            tcOffset : 0
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.mainContainer = this.settings.container;
        this.tcin = parseFloat( this.settings.tcOffset );
        this.tcout = parseFloat( this.settings.duration ) + parseFloat( this.settings.tcOffset );
        this.duration = parseFloat( this.settings.duration );
        this.segmentsGenerator = null;
        this.timeZoomComponent = null;

        if (typeof this.mainContainer !== "object")
        {
            throw new Error( "Your container is empty." );
        }
        this.initialize();

    },
    /**
     * Initialize this class and create container
     * @method initialize
     */
    initialize : function ()
    {
        this.createTimeAxis();
        if (this.settings.expand === true)
        {
            this.createControleBar();
            this.createLabelContainer();
        }
    },
    /**
     * Return start time code
     * @returns {Number}
     */
    getTcin : function ()
    {
        return this.tcin;
    },
    /**
     * Return end time code
     * @returns {Number}
     */
    getTcout : function ()
    {
        return this.tcout;
    },
    /**
     * In charge to create control bar container
     * @method createControleBar
     */
    createControleBar : function ()
    {
        var toolbarContainer = $( '<div>',{
            'class' : 'toolbar-container'
        } );
        // expend button
        var expandBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_EXPAND,"expand-btn" );
        expandBtn.on( 'click',{
            self : this
        },
        this.onClickExpandBtn );
        expandBtn.addClass( this.Class.STYLE_CLASSNAME_EXPAND_ON );
        toolbarContainer.append( expandBtn );

        this.mainContainer.append( toolbarContainer );
    },
    /**
     * In charge to create label container
     * @method createLabelContainer
     */
    createLabelContainer : function ()
    {
        var timeAxisLabel = $( '<div>',{
            'class' : 'timeaxis-label'
        } );
        timeAxisLabel.append( $( '<p>',{
            'class' : 'label',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_TIMEAXE
        } ) );
        this.mainContainer.append( timeAxisLabel );
    },
    /**
     * In charge to create time axe component
     * @method createTimeAxis
     */
    createTimeAxis : function ()
    {
        var lineContent = $( '<div>',{
            'class' : 'line-content'
        } );
        var line = $( '<div>',{
            'class' : 'line'
        } );

        // /tools bar
        var toolsbarContainer = $( '<div>',{
            'class' : 'toolsbar'
        } );
        this.createToolsBar( toolsbarContainer );

        var timeAxis = $( '<div>',{
            'class' : 'module-timeaxis'
        } );

        timeAxis.append( line );
        timeAxis.append( lineContent );
        // add to main container
        this.mainContainer.append( timeAxis );
        this.mainContainer.append( toolsbarContainer );

        this.timeZoomComponent = new fr.ina.amalia.player.plugins.timeline.ZoomComponent( lineContent,this.duration,this.settings );
        // init tic component
        this.segmentsGenerator = new fr.ina.amalia.player.plugins.timeline.TicComponent( lineContent,this.settings );

        timeAxis.on( fr.ina.amalia.player.plugins.timeline.ZoomComponent.eventTypes.CHANGE,{
            self : this
        },
        this.onTimeRangeChange );


        this.mainContainer.on( 'mousewheel',{
            self : this
        },
        this.onMousewheel );
        this.mainContainer.on( 'DOMMouseScroll',{
            self : this
        },
        this.onDOMMouseScroll );

        // add event listener on tic click event
        lineContent.on( fr.ina.amalia.player.plugins.timeline.TicComponent.eventTypes.CLICK,{
            self : this
        },
        this.onClickAtTic );
        // add event listener on update time code
        lineContent.on( fr.ina.amalia.player.plugins.timeline.TicComponent.eventTypes.UPDATE_TC,{
            self : this
        },
        this.onUpdateTicRange );

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createTimeAxis" );
        }
    },
    /**
     * In charge to create tools bar container
     * @method createToolsBar
     * @param {Object} container
     */
    createToolsBar : function (container)
    {
        var rowContainer = $( '<div>',{
            class : 'ajs-row'
        } );
        var leftContainer = $( '<div>',{
            class : 'ajs-col leftContainer'
        } );
        var middleContainer = $( '<div>',{
            class : 'ajs-col middleContainer'
        } );
        var rightContainer = $( '<div>',{
            class : 'ajs-col rightContainer'
        } );

        var zoomInBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_ZOOM_IN,'plus' );
        zoomInBtn.on( 'click',{
            self : this
        },
        this.onZoomIn );
        middleContainer.append( zoomInBtn );
        var zoomOutBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_ZOOM_OUT,'minus' );
        zoomOutBtn.on( 'click',{
            self : this
        },
        this.onZoomOut );
        middleContainer.append( zoomOutBtn );
        var changeDisplayBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_CHANGE_DISPLAY,'arrows-v' );
        changeDisplayBtn.on( 'click',{
            self : this
        },
        this.onChangeDisplay );
        middleContainer.append( changeDisplayBtn );

        var slideLeftBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SLIDE_LEFT,'chevron-left' );
        slideLeftBtn.on( 'click',{
            self : this
        },
        this.onSlideLeft );
        slideLeftBtn.addClass( 'pull-left' );
        leftContainer.append( slideLeftBtn );

        var slideRightBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SLIDE_RIGHT,'chevron-right' );
        slideRightBtn.on( 'click',{
            self : this
        },
        this.onSlideRight );
        slideRightBtn.addClass( 'pull-right' );
        rightContainer.append( slideRightBtn );
        rowContainer.append( leftContainer );
        rowContainer.append( middleContainer );
        rowContainer.append( rightContainer );
        container.append( rowContainer );

    },
    /**
     * In charge to set time code
     * @method
     * @param {Number} tcin
     * @param {Number} tcout
     */
    setZoomTc : function (tcin,tcout)
    {
        this.timeZoomComponent.setTc( parseFloat( tcin * 1000 ),parseFloat( tcout * 1000 ) );
    },
    /**
     * Handle a zoom event
     * @param {String} _state up/down
     */
    zoom : function (_state)
    {
        var state = (typeof _state === "undefined") ? 'in' : _state;
        // Default zoom out
        if (state === "in")
        {
            this.timeZoomComponent.zoomIn();
        }
        else
        {
            this.timeZoomComponent.zoomOut();
        }
    },
    /**
     * Handle a slide event
     * @param {String} _state left/right
     */
    slide : function (_state)
    {
        var state = (typeof _state === "undefined") ? 'left' : _state;
        // Default slide right
        if (state === "left")
        {
            this.timeZoomComponent.slideLeft();
        }
        else
        {
            this.timeZoomComponent.slideRight();
        }
    },
    // set events
    /**
     * Fired on zoom event
     * @param {Object} event
     * @param {Object} data
     */
    onTimeRangeChange : function (event,data)
    {
        event.data.self.segmentsGenerator.updateSegments( data.tcin,data.tcout );
        // Trigger
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.RANGE_CHANGE,{
            tcin : data.tcin / 1000,
            tcout : data.tcout / 1000
        } );
    },
    /**
     * Fired on zoom in event
     * @param {Object} event
     */
    onZoomIn : function (event)
    {
        event.data.self.zoom( "in" );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onZoomIn" );
        }
    },
    /**
     * Fired on zoom out event
     * @param {Object} event
     */
    onZoomOut : function (event)
    {
        event.data.self.zoom( "out" );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onZoomOut" );
        }
    },
    /**
     * Fired slide left event
     * @param {Object} event
     */
    onSlideLeft : function (event)
    {
        event.data.self.slide( "left" );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"slideLeft" );
        }
    },
    /**
     * Fired slide right event
     * @param {Object} event
     */
    onSlideRight : function (event)
    {
        event.data.self.slide( "right" );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"slideRight" );
        }
    },
    /**
     * Fired on display change event
     * @param {Object} event
     */
    onChangeDisplay : function (event)
    {
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CHANGE_DISPLAY );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onChangeDisplay" );
        }
    },
    /**
     * Fired on mouse scroll
     * @method onDOMMouseScroll
     * @param {Object} event
     */
    onDOMMouseScroll : function (event)
    {
        // prevent default process
        event.preventDefault();
        var rot = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : event.originalEvent.detail;
        if (typeof rot === "number")
        {
            if (rot < 0)
            {
                event.data.self.zoom( "in" );
            }
            else
            {
                event.data.self.zoom( "out" );
            }
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onDOMMouseScroll" );
        }
    },
    /**
     * Fired on Mousewheel event
     * @method onMousewheel
     * @param {Object} event
     */
    onMousewheel : function (event)
    {
        // prevent default process
        event.preventDefault();
        var rot = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : event.originalEvent.detail;
        if (typeof rot === "number")
        {
            if (rot > 0)
            {
                event.data.self.zoom( "in" );
            }
            else
            {
                event.data.self.zoom( "out" );
            }
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onMousewheel" );
        }
    },
    /**
     * Fired on click to tic label
     * @see TicComponent
     * @method onClickAtTic
     * @param {Object} event
     * @param {Object} data
     */
    onClickAtTic : function (event,data)
    {
        if (data.hasOwnProperty( 'tc' ) === true && typeof data.tc === "number")
        {
            event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CLICK_AT_TIC,{
                tc : parseFloat( data.tc )
            } );
        }
    },
    /**
     * Fired on tic range change
     * @see TicComponent
     * @method onUpdateTicRange
     * @param {Object} event
     * @param {Object} data
     */
    onUpdateTicRange : function (event,data)
    {
        if (data.hasOwnProperty( 'tcin' ) === true && data.hasOwnProperty( 'tcout' ) === true)
        {
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onUpdateTicRange" );
            }
            event.data.self.timeZoomComponent.setTc( data.tcin,data.tcout );
        }
    },
    /**
     * Fired on click to expand button
     * @method onClickExpandBtn
     * @param {Object} event
     */
    onClickExpandBtn : function (event)
    {
        try
        {
            if (event.data.self.mainContainer.hasClass( 'off' ))
            {
                event.data.self.mainContainer.removeClass( "off" ).addClass( 'on' );
                event.data.self.mainContainer.find( '.expand-btn.plugin-btn' ).removeClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_OFF ).addClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_ON );
                event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CHANGE_TIMEAXE_DISPLAY_STATE,{
                    state : true
                } );
            }
            else
            {
                event.data.self.mainContainer.removeClass( "on" ).addClass( 'off' );
                event.data.self.mainContainer.find( '.expand-btn.plugin-btn' ).removeClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_ON ).addClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_OFF );
                event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CHANGE_TIMEAXE_DISPLAY_STATE,{
                    state : false
                } );
            }

        }
        catch (e)
        {
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.error( event.data.self.Class.fullName + "onClickExpandBtn : " + e.toString() );
            }
        }
    }
} );
