/* global fr */

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
 * Base class on all components used in timeline plugin
 * @class BaseComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
$.Class( "fr.ina.amalia.player.plugins.timeline.BaseComponent",{
    ComponentClassCss : "default-component",
    ComponentModuleClassCss : "module-default",
    STYLE_CLASSNAME_EXPAND_ON : 'ajs-icon-chevron-down',
    STYLE_CLASSNAME_EXPAND_OFF : 'ajs-icon-chevron-right',
    LocalStorageTimeDisplayStateNamespace : 'timeline-display-state',
    NAV_CLICK : 'fr.ina.amalia.player.plugins.timeline.event.NavClick',
    CLOSE_EVENT : 'fr.ina.amalia.player.plugins.timeline.component.event.CloseEvent',
    CLICK_TC : 'fr.ina.amalia.player.plugins.timeline.BaseComponent.event.click',
    CLICK_SELECT : 'fr.ina.amalia.player.plugins.timeline.BaseComponent.event.click_select'
},
{
    /**
     * Logger
     * @property logger
     * @type {fr.ina.amalia.player.log.LogHandler} Logger
     * @default null
     */
    logger : null,
    /**
     * Component settings
     * @property settings
     * @type {Object} Logger
     * @default {}
     */
    settings : {},
    /**
     * Main container of this component
     * @property mainContainer
     * @type {Object}
     * @default null
     */
    mainContainer : null,
    /**
     * Tooltip configuration
     * @property tooltipConfiguration
     * @type {Object}
     * @default null
     */
    tooltipConfiguration : {
        position : {
            my : "center bottom-20",
            at : "center top",
            delay : 3000,
            using : function (position,feedback)
            {
                $( this ).css( position );
                $( "<div>" ).addClass( "ajs-arrow" ).addClass( feedback.vertical ).addClass( feedback.horizontal ).appendTo( this );
            }
        },
        content : function ()
        {
            var element = $( this );
            var title = element.attr( 'title' );
            if (element.is( "[data-src]" ))
            {
                var src = element.attr( 'data-src' );
                return "<img class='image' alt='" + title + "' src='" + src + "' />";
            }
            else
            {
                title = title.replace( /(?:\r\n|\r|\n)/g,'<br />' );
                return "<p>" + title + "</p>";
            }
        }
    },
    /**
     * zoom level
     * @property zoomLevel
     * @type {Object}
     * @default null
     */
    zoomLevel : 0,
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
     * Duration
     * @property duration
     * @type {Number}
     * @default 0
     */
    duration : 0,
    /**
     * Component display state
     * @property displayStateList
     * @type {Array}
     * @default []
     */
    displayStateList : [
        'lg',
        'md',
        'sm',
        'xs'
    ],
    /**
     * Display state index
     * @property displayStateIdx
     * @type {Array}
     * @default []
     */
    displayStateIdx : 0,
    /**
     * Instance of local storage manager
     * @property localStorageManager
     * @type {Object}
     * @default null
     */
    localStorageManager : null,
    /**
     * Attribute in charge of zoom
     * @property displayStateIdx
     * @type {Array}
     * @default []
     */
    zoomProperty : null,
    /**
     * Focus component
     * @property displayStateIdx
     * @type {Array}
     * @default []
     */
    focusable : null,
    /**
     * True if the component has elements
     * @property hasElements
     * @type {Boolean}
     * @default false
     */
    hasElements : false,
    /**
     * True if the component is zoomable
     * @property zoomable
     * @type {Boolean}
     * @default false
     */
    zoomable : false,
    /**
     * Focus component
     * @property focusComponent
     * @type {Object}
     * @default null
     */
    focusComponent : null,
    /**
     * focus line
     * @property focusLine
     * @type {Object}
     * @default null
     */
    focusLine : null,
    /**
     * list of data
     * @property listOfdata
     * @type {Array}
     * @default null
     */
    listOfdata : null,
    /**
     * Zoom component
     * @property zoomableZone
     * @type {Array}
     * @default []
     */
    zoomableZone : null,
    /**
     * Start time code for zoom
     * @property zTcin
     * @type {Number}
     * @default 0
     */
    zTcin : 0,
    /**
     * End time code for zoom
     * @property zTcout
     * @type {Number}
     * @default 0
     */
    zTcout : 0,
    /**
     * Display state index
     * @property currentTime
     * @type {Number}
     * @default 0
     */
    currentTime : 0,
    /**
     * Id of metadata managed by this plugin
     * @property metadataId
     * @type {Number}
     * @default 0
     */
    metadataId : '',
    /**
     * Id of metadata managed by this plugin
     * @property metadataId
     * @type {Number}
     * @default 0
     */
    tcOffset : 0,
    /**
     * Init this class
     * @method init
     * @param settings
     */
    init : function (settings)
    {
        this.settings = $.extend( {
            debug : false,
            icon : 'circle',
            color : "#3cf",
            container : '',
            metadataId : '',
            tcOffset : 0,
            callbacks : {},
            duration : 0,
            pointNav : false,
            zoomHierarchies : false,
            overlap : false,
            withParentLevel : false,
            zoomable : true,
            focusable : false,
            toolsbar : true,
            editable : false,
            closeable : false,
            viewZoom : false,
            marker : false,
            timecursor : false,
            timeFormat : 'ms',
            framerate : 25
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.mainContainer = this.settings.container;
        this.localStorageManager = new fr.ina.amalia.player.LocalStorageManager( {} );
        this.focusable = this.settings.focusable;
        this.zoomable = this.settings.zoomable;
        this.duration = parseFloat( this.settings.duration );
        this.zTcout = parseFloat( this.settings.duration );
        this.tcOffset = parseFloat( this.settings.tcOffset );

        if (this.mainContainer.length === 0 || typeof this.mainContainer !== "object")
        {
            throw new Error( "Your container is empty." );
        }
        this.initialize();
    },
    /**
     * In charge to initialize the base component.
     * @method initialize
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        // Default class
        this.mainContainer.addClass( this.Class.ComponentClassCss );
        this.createAxis();
        if (this.settings.toolsbar === true)
        {
            this.createToolBar();
        }
        if (this.settings.focusable === true)
        {
            this.createBottomToolsBar();
        }
        if (this.settings.closeable === true)
        {
            this.createCloseToolBar();
        }
        if (this.settings.timecursor === true)
        {
            this.createTimeCursor();
            this.mainContainer.parents( '.ajs-plugin.plugin-timeline' ).first().on( fr.ina.amalia.player.plugins.TimelinePlugin.eventTypes.TIME_CHANGE,{
                self : this
            },
            this.onPluginTimeChange );
        }

        if (this.settings.focusable === false && this.settings.zoomable === false && this.settings.viewZoom === true)
        {
            this.createZoomContainer();
        }
        if (typeof this.settings.callbacks.onCreated !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( this.settings.callbacks.onCreated + '(this)' );
            }
            catch (e)
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Error to create callback." );
                }
            }
        }
    },
    /**
     * Create time axe container
     * @method createAxis
     */
    createAxis : function ()
    {
        var line = $( '<div>',{
            'class' : 'line'
        } );
        var lineContent = $( '<div>',{
            'class' : 'line-content'
        } );
        lineContent.append( line );
        var axis = $( '<div>',{
            class : this.Class.ComponentModuleClassCss
        } );
        axis.append( lineContent );
        var label = $( '<div>',{
            class : 'label',
            text : this.settings.title
        } );
        axis.append( label );
        // Add to main container
        this.mainContainer.append( axis );
        var displayState = this.localStorageManager.getItem( this.Class.LocalStorageTimeDisplayStateNamespace );
        if (displayState === null)
        {
            displayState = this.getDisplayState();
        }
        else
        {
            this.displayStateIdx = this.displayStateList.indexOf( displayState );
            this.displayStateIdx++;
        }
        this.mainContainer.removeClass( this.displayStateList.toString().replace( /,/g,' ' ) ).addClass( displayState );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createAxis" );
        }
    },
    /**
     * Create tool bar for component with controls
     * @method createToolBar
     */
    createToolBar : function ()
    {
        var toolbarContainer = $( '<div>',{
            'class' : 'toolbar-container'
        } );
        // expend bouton
        var expandBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_EXPAND,"expand-btn" );
        expandBtn.on( 'click',{
            self : this
        },
        this.onClickExpandBtn );
        expandBtn.addClass( this.Class.STYLE_CLASSNAME_EXPAND_ON );
        toolbarContainer.append( expandBtn );
        // sort bouton
        var sortBtn = $( '<div>',{
            title : fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SORT,
            'class' : 'sort-btn ajs-icon ajs-icon-sort'
        } ).tooltip( this.tooltipConfiguration );
        toolbarContainer.append( sortBtn );
        // module de navigation par point
        if (this.settings.pointNav === true)
        {
            // /Navigation controls
            var navControls = $( '<div>',{
                'class' : 'nav-controls'
            } );
            // Prev
            var prevNavContorl = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_NAV_POINT_PREV,"chevron-circle-left prev-control" );
            prevNavContorl.on( 'click',{
                self : this
            },
            this.onClickPrevNavContorl );
            navControls.append( prevNavContorl );
            // Next
            var nextNavContorl = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_NAV_POINT_NEXT,"chevron-circle-right next-control" );
            nextNavContorl.on( 'click',{
                self : this
            },
            this.onClickNextNavContorl );
            navControls.append( nextNavContorl );
            toolbarContainer.append( navControls );
        }

        this.mainContainer.append( toolbarContainer );
        return toolbarContainer;
    },
    /**
     * Create close button
     * @method createCloseToolBar
     */
    createCloseToolBar : function ()
    {
        var closeToolbarContainer = $( '<div>',{
            'class' : 'toolbar-container'
        } );
        // expend button
        var closeBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_CLOSE,"remove" );
        closeBtn.on( 'click',{
            self : this
        },
        this.onClickCloseBtn );
        closeToolbarContainer.append( closeBtn );
        this.mainContainer.append( closeToolbarContainer );
    },
    /**
     * Create time cursor container
     * @method createTimeCursor
     */
    createTimeCursor : function ()
    {
        var timeCursor = $( '<div>',{
            'class' : 'timecursor',
            'left' : '0px'
        } );
        this.mainContainer.append( timeCursor );
    },
    /**
     * Create button with tool tip
     * @param {String} name
     * @param {String} icon
     * @param {Boolean} tooltip
     */
    createButton : function (name,icon,tooltip)
    {
        if (tooltip === false)
        {
            return $( '<button>',{
                value : name,
                class : icon + " ajs-icon ajs-icon-" + icon
            } );
        }
        else
        {
            return $( '<button>',{
                title : name,
                class : icon + " plugin-btn ajs-icon ajs-icon-" + icon
            } ).tooltip( this.tooltipConfiguration );
        }
    },
    /**
     * Create bottom tool bar container
     * @method createBottomToolsBar
     */
    createBottomToolsBar : function ()
    {
        var bottomToolbarContainer = $( '<div>',{
            'class' : 'bottom-toolbar-container'
        } );
        if (this.settings.focusable === true)
        {
            var focusZoomBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_FOCUS,"zoom-in focus-btn" );
            focusZoomBtn.on( 'click',{
                self : this
            },
            this.onClickFocusBtn );
            bottomToolbarContainer.append( focusZoomBtn );
        }
        this.mainContainer.append( bottomToolbarContainer );
    },
    /**
     * In charge to create focus component
     * @method createFocusComponent
     */
    createFocusComponent : function ()
    {
        var focusSettings = {
            debug : this.settings.debug
        };
        this.focusComponent = new fr.ina.amalia.player.plugins.components.FocusComponent( this.mainContainer,this.duration,focusSettings );
        this.focusComponent.setTc( this.tcin,this.tcout );
        try
        {
            var focusLineContainer = $( '<div>',{
                class : 'sub',
                style : ''
            } );
            this.mainContainer.append( focusLineContainer );
            var focusLineSettings = jQuery.extend( true,{},this.settings );
            focusLineSettings.container = focusLineContainer;
            focusLineSettings.focusable = false;
            focusLineSettings.pointNav = false;
            focusLineSettings.title = "";
            focusLineSettings.toolsbar = false;
            focusLineSettings.zoomHierarchies = false;
            focusLineSettings.withParentLevel = false;
            focusLineSettings.zoomable = true;
            focusLineSettings.closeable = true;
            focusLineSettings.color = "#FFF";
            focusLineSettings.viewZoom = false;
            /* jslint evil: true */
            this.focusLine = eval( "new " + this.Class.fullName + '(focusLineSettings)' );
            // set default tcin and tcout
            this.focusLine.setTcin( this.focusComponent.getFocusTcin() );
            this.focusLine.setTcout( this.focusComponent.getFocusTcout() );

            this.mainContainer.on( fr.ina.amalia.player.plugins.components.FocusComponent.eventTypes.FOCUS_ZONE_CHANGE,{
                self : this
            },
            this.onFocusZoneChange );
            this.focusLine.mainContainer.on( this.Class.CLOSE_EVENT,{
                self : this
            },
            this.onCloseEventRecever );

            if (this.focusLine !== null)
            {
                this.focusLine.removeItems();
                this.focusLine.addItems( this.listOfdata );
            }
        }
        catch (e)
        {
            if (this.logger !== null)
            {
                this.logger.warn( e );
            }
        }
    },
    /**
     * In charge to create zoom container
     * @method createZoomContainer
     */
    createZoomContainer : function ()
    {
        try
        {
            var focusSettings = {
                debug : this.settings.debug,
                modeFocus : false
            };
            this.zoomableZone = new fr.ina.amalia.player.plugins.components.FocusComponent( this.mainContainer,this.duration,focusSettings );
            this.zoomableZone.setTc( this.zTcin,this.zTcout );
        }
        catch (e)
        {
            if (this.logger !== null)
            {
                this.logger.warn( e );
            }
        }

    },
    /**
     * Show this component
     * @method show
     */
    show : function ()
    {
        this.mainContainer.show();
    },
    /**
     * Hide this component
     * @method hide
     */
    hide : function ()
    {
        this.mainContainer.hide();
    },
    /**
     * return main container
     * @method getContainer
     * @returns {Object}
     */
    getContainer : function ()
    {
        return this.mainContainer;
    },
    /**
     * Return metadata id
     * @method getMetadataId
     */
    getMetadataId : function ()
    {
        return this.metadataId.toString();
    },
    /**
     * Set line title
     * @param title
     */
    setTitle : function (title)
    {
        this.settings.title = title;
        this.mainContainer.find( '.label' ).text( title );
    },
    /**
     * Set line shape
     * @param shape
     */
    setShape : function (shape)
    {
        this.settings.icon = shape;
    },
    /**
     * Set color
     */
    setColor : function (color)
    {
        this.settings.color = color;
    },
    /**
     * Set metadata for this line
     * @method setMetadataId
     * @param {String} id
     */
    setMetadataId : function (id)
    {
        this.metadataId = id.toString();
    },
    /**
     * Set start time code
     * @method setTcin
     * @param {Object} tcin
     */
    setTcin : function (tcin)
    {
        if (this.isZoomable() === true || this.getHasElements() === false)
        {
            this.tcin = parseFloat( tcin );
        }
        if (this.focusComponent !== null && this.focusLine !== null)
        {
            this.focusComponent.setTc( this.tcin,this.tcout );
            this.focusLine.setTcin( this.focusComponent.getFocusTcin() );
        }
    },
    /**
     * Set end time code
     * @method setTcout
     * @param {Object} tcout
     */
    setTcout : function (tcout)
    {
        if (this.isZoomable() === true || this.getHasElements() === false)
        {
            this.tcout = parseFloat( tcout );
        }
        if (this.focusComponent !== null && this.focusLine !== null)
        {
            this.focusComponent.setTc( this.tcin,this.tcout );
            this.focusLine.setTcout( this.focusComponent.getFocusTcout() );
        }
    },
    /**
     * Set zoom tc
     * @method setZoomTc
     * @param {Number} tcin
     * @param {Number} tcout
     */
    setZoomTc : function (tcin,tcout)
    {
        this.zTcin = parseFloat( tcin );
        this.zTcout = parseFloat( tcout );
        if (this.zoomableZone !== null)
        {
            this.zoomableZone.setZoomTc( this.zTcin,this.zTcout );
        }
    },
    /**
     * Set zoom propertiy
     * @method setZoomProperty
     * @param {Object} zoomProperty
     */
    setZoomProperty : function (zoomProperty)
    {
        this.zoomProperty = zoomProperty;
    },
    /**
     * Set current time
     * @method setCurrentTime
     * @param {Number} tc time code
     */
    setCurrentTime : function (tc)
    {
        this.currentTime = parseInt( tc );
        if (this.settings.timecursor === true)
        {
            this.updateTimeCursor();
        }
    },
    /**
     * Retrun true if component has elements
     * @method getHasElements
     * @returns {Boolean}
     */
    getHasElements : function ()
    {
        return this.hasElements;
    },
    /**
     * Return true if this component is focusable
     * @method isFocusable
     * @returns {Boolean}
     */
    isFocusable : function ()
    {
        return this.focusable;
    },
    /**
     * Retourne true if this component is zoomable
     * @method isZoomable
     * @returns {Boolean}
     */
    isZoomable : function ()
    {
        return this.zoomable;
    },
    /**
     * In charge to add items with sort by priority and tc
     * @method addItems
     * @param {Array} listOfdata description
     */
    addItems : function (listOfdata)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName," addItems/ZoomLevel:" + this.zoomLevel );
            this.logger.warn( listOfdata );
        }
        var zoomProperty = this.zoomProperty;
        this.hasElements = true;
        if (listOfdata !== null)
        {
            // sort byt tc level
            listOfdata.sort( function (a,b)
            {

                if (a.hasOwnProperty( zoomProperty ) && b.hasOwnProperty( zoomProperty ))
                {
                    // convert to integers from strings
                    a = parseInt( a[zoomProperty] );
                    b = parseInt( b[zoomProperty] );
                }
                // compare
                if (a > b)
                {
                    return 1;
                }
                else if (a < b)
                {
                    return -1;
                }
                else
                {
                    return 0;
                }
            } );
            // sort by tc
            listOfdata.sort( function (a,b)
            {
                // convert to integers from strings
                a = parseInt( a.tc );
                b = parseInt( b.tc );
                // compare
                if (a > b)
                {
                    return 1;
                }
                else if (a < b)
                {
                    return -1;
                }
                else
                {
                    return 0;
                }
            } );
            // Enabling zoom state
            if (this.settings.zoomHierarchies === true)
            {
                listOfdata = this.getHierarchiesData( this.zoomLevel,listOfdata,this.settings.withParentLevel );
            }

            for (var i = 0;
                i < listOfdata.length;
                i++)
            {
                this.addItem( listOfdata[i] );
            }
            this.updateTootip();

        }
        this.listOfdata = listOfdata;
        if (this.settings.overlap === true)
        {
            this.updateDisplayItems();
        }
        if (this.focusLine !== null)
        {
            this.focusLine.removeItems();
            this.focusLine.addItems( listOfdata );
        }
    },
    /**
     * In charge to clear selected items
     * @returns {undefined}
     */
    clearSelectedItems : function ()
    {
        for (var i = 0;
            i < this.listOfdata.length;
            i++)
        {
            var data = this.listOfdata[i];
            if (data.hasOwnProperty( 'selected' ) && data.selected === true)
            {
                data.selected = false;
            }
        }
        this.mainContainer.find( '.line-content .item.cuepoint' ).removeClass( 'selected' );
    },
    /**
     * In charge to update display tool tip state.
     * @method updateTootip
     */
    updateTootip : function ()
    {
        this.mainContainer.find( '.line-content .item.cuepoint' ).tooltip( this.tooltipConfiguration );
        this.mainContainer.find( '.line-content .item.segment' ).tooltip( this.tooltipConfiguration );
    },
    /**
     * In charge to update time cursor
     * @method updateTimeCursor
     */
    updateTimeCursor : function ()
    {
        this.mainContainer.find( '.timecursor' ).css( 'left',((this.currentTime - this.tcin) * 100) / (this.tcout - this.tcin) + '%' );
    },
    /**
     * Return data with zoom level
     * @method getHierarchiesData
     * @param {Object} zoomLevel
     * @param {Object} listOfdata
     * @param {Object} withParentLevel
     * @returns {Array|Object|Array.getHierarchiesData.data}
     */
    getHierarchiesData : function (zoomLevel,listOfdata,withParentLevel)
    {
        var zLevel = parseInt( zoomLevel.toString() );
        var data = [
        ];
        if (withParentLevel === true)
        {
            do
            {
                /* jshint loopfunc:true */
                data = $( listOfdata ).filter( function (i)
                {
                    return listOfdata[i].tclevel === zLevel;
                } );
                if (data.length > 0)
                {
                    return data;
                }

                zoomLevel--;
            }while (zoomLevel > 0);
        }
        else
        {
            data = $( listOfdata ).filter( function (i)
            {
                return listOfdata[i].tclevel === zLevel;
            } );
        }

        return data;
    },
    /**
     * Update the display state of the priority item condition.
     * @method updateDisplayItems
     */
    updateDisplayItems : function ()
    {
        var listOfItems = this.mainContainer.find( '.line-content' ).first().find( '.item' );
        var lineContent = this.mainContainer.find( '.line-content' ).first();
        var item = null;
        var lastItem = null;
        var lastPos,
            newPos,
            itemWidth = null;
        for (var i = listOfItems.length - 1;
            i >= 0;
            i--)
        {
            item = $( listOfItems[i] );
            if (i !== listOfItems.length - 1)
            {
                lastItem = $( lineContent ).find( '.item.on' ).first();
                if (lastItem.length > 0)
                {
                    lastPos = lastItem.offset().left;
                    newPos = item.offset().left;
                    itemWidth = (item.hasClass( 'image' ) && !item.hasClass( 'segment' )) ? item.find( 'img' ).width() : item.width();
                    if (lastPos - newPos > itemWidth)
                    {
                        item.addClass( 'on' );
                        item.show();
                    }
                    else
                    {
                        item.addClass( 'off' );
                        item.hide();
                    }
                }
            }
            else
            {
                item.addClass( 'on' );
            }
        }
    },
    /**
     * Return display state
     * @method getDisplayState
     * @returns {String}
     */
    getDisplayState : function ()
    {
        var displayStateName = '';
        if (this.displayStateIdx < this.displayStateList.length)
        {

            displayStateName = this.displayStateList[this.displayStateIdx];
            this.displayStateIdx++;
        }
        else
        {
            this.displayStateIdx = 0;
            displayStateName = this.displayStateList[this.displayStateIdx];
            this.displayStateIdx++;
        }
        // Save display state in local storage
        this.localStorageManager.setItem( this.Class.LocalStorageTimeDisplayStateNamespace,displayStateName );
        return displayStateName;
    },
    /**
     * Change display state
     * @method changeDisplayState
     */
    changeDisplayState : function ()
    {
        this.mainContainer.removeClass( this.displayStateList.toString().replace( /,/g,' ' ) ).addClass( this.getDisplayState() );
    },
    /**
     * Return next item with time code
     * @method getNextItem
     * @param {Number} currentTime
     */
    getNextItem : function (currentTime)
    {
        var lineContent = this.mainContainer.find( '.line-content' ).first();
        var item = lineContent.find( '.item' ).filter( function (index,element)
        {
            return (parseFloat( $( element ).attr( 'data-tc' ) ) > currentTime);
        } ).first();
        if (item.is( '[data-tc]' ))
        {
            return parseFloat( item.attr( 'data-tc' ) );
        }
        else
        {
            return null;
        }
    },
    /**
     * Return prev item with time code
     * @method getPrevItem
     * @param {Number} currentTime
     */
    getPrevItem : function (currentTime)
    {
        var lineContent = this.mainContainer.find( '.line-content' ).first();
        var item = lineContent.find( '.item' ).filter( function (index,element)
        {
            return (parseFloat( $( element ).attr( 'data-tc' ) )) < currentTime;
        } ).last();
        if (item.is( '[data-tc]' ))
        {
            return parseFloat( item.attr( 'data-tc' ) );
        }
        else
        {
            return null;
        }
    },
    /**
     * Set zoom level
     * @method setZoomLevel
     * @param {Number} level
     */
    setZoomLevel : function (level)
    {
        this.zoomLevel = level;
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
            if (event.data.self.mainContainer.hasClass( 'xs' ))
            {
                event.data.self.mainContainer.removeClass( event.data.self.displayStateList.toString().replace( /,/g,' ' ) );
                event.data.self.mainContainer.addClass( 'lg' );
                event.data.self.mainContainer.find( '.expand-btn.plugin-btn' ).removeClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_OFF ).addClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_ON );
            }
            else
            {
                event.data.self.mainContainer.removeClass( event.data.self.displayStateList.toString().replace( /,/g,' ' ) );
                event.data.self.mainContainer.addClass( 'xs' );
                event.data.self.mainContainer.find( '.expand-btn.plugin-btn' ).removeClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_ON ).addClass( event.data.self.Class.STYLE_CLASSNAME_EXPAND_OFF );

            }
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName," onClickExpandBtn hasClass :--" + event.data.self.mainContainer.hasClass( 'xs' ) );
            }
        }
        catch (e)
        {
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"initialize" + e.toString() );
            }
        }
    },
    /**
     * Fired on click to next button
     * @method onClickNextNavContorl
     * @param {Object} event
     */
    onClickNextNavContorl : function (event)
    {
        event.data.self.mainContainer.trigger( event.data.self.Class.NAV_CLICK,{
            type : 'next'
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickNextNavContorl" );
        }
    },
    /**
     * Fired on click to prev button
     * @method onClickPrevNavContorl
     * @param {Object} event
     */
    onClickPrevNavContorl : function (event)
    {
        event.data.self.mainContainer.trigger( event.data.self.Class.NAV_CLICK,{
            type : 'prev'
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickPrevNavContorl" );
        }
    },
    /**
     * Fired on click to focus button
     * @method onClickFocusBtn
     * @param {Object} event
     */
    onClickFocusBtn : function (event)
    {
        if (event.data.self.focusComponent === null)
        {
            event.data.self.createFocusComponent();
        }
        event.data.self.mainContainer.removeClass( 'focus-off' ).addClass( 'focus-on' );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickHierarchicalZoomBtn" );
        }
    },
    /**
     * Fired on focus change positon
     * @method onFocusZoneChange
     * @param {Object} event
     * @param {Object} data
     */
    onFocusZoneChange : function (event,data)
    {
        event.data.self.focusLine.removeItems();
        event.data.self.focusLine.setTcin( data.focusTcin );
        event.data.self.focusLine.setTcout( data.focusTcout );
        event.data.self.focusLine.addItems( event.data.self.listOfdata );
    },
    /**
     * Fired on click to close button
     * @method onClickCloseBtn
     * @param {Object} event
     */
    onClickCloseBtn : function (event)
    {
        event.data.self.mainContainer.trigger( event.data.self.Class.CLOSE_EVENT );
    },
    /**
     * Fired on close event
     * @method onCloseEventRecever
     */
    onCloseEventRecever : function (event)
    {
        event.data.self.mainContainer.removeClass( 'focus-on' ).addClass( 'focus-off' );
    },
    /**
     * Fired on time change event
     * @param {Object} event
     * @param {Object} data
     */
    onPluginTimeChange : function (event,data)
    {
        event.data.self.setCurrentTime( data.currentTime );
    }
} );
