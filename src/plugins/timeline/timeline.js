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
 * In charge to timeline plugin for visualize the keyframes with cue point,
 * segment,image ,histogram  and visual components.
 * @class TimelinePlugin
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.extend( "fr.ina.amalia.player.plugins.TimelinePlugin",{
    eventTypes : {
        TIME_CHANGE : "fr.ina.amalia.player.plugins.timeline.TIME_CHANGE"
    },
    classCss : "ajs-plugin plugin-timeline",
    style : "",
    componentDefaultHeight : 110
},
{
    /**
     * Dom element for time cursor
     * @property timeCursor
     * @type {Object}
     */
    timeCursor : null,
    /**
     * Main time cursor
     * @property timeProgressContainer
     * @type {Object}
     */
    timeProgressContainer : null,
    /**
     * time axe cursor component container
     * @property timeAxisComponentContainer
     * @type {Object}
     */
    timeAxisComponentContainer : null,
    /**
     * Instance de la classe TimeAxisComponent.
     * @property timeAxisComponent
     * @type {Object} fr.ina.amalia.player.plugins.timeline.TimeAxisComponent
     * @default null
     */
    timeAxisComponent : null,
    /**
     * Contains all the components
     * @property componentsContainer
     * @type {Object}
     */
    componentsContainer : null,
    /**
     * Nav bar container
     * @property navBarContainer
     * @type {Object}
     */
    navBarContainer : null,
    /**
     * list of zoom range
     * @property navBarContainer
     * @type {Object}
     */
    zoomRangeLevels : null,
    /**
     * zoom level
     * @property navBarContainer
     * @type {Object}
     */
    zoomLevel : 0,
    /**
     * Number of line to be displayed
     * @property displayLinesNb
     * @type {Object}
     */
    displayLinesNb : 0,
    /**
     * list of components
     * @property listOfComponents
     * @default []
     */
    listOfComponents : [
    ],
    /**
     * Start time code
     * @property tcin
     * @default 0
     */
    tcin : 0,
    /**
     * End time code
     * @property tcout
     * @default 0
     */
    tcout : 0,
    /**
     * Start zoom tim ecode
     * @property zTcin
     * @default 0
     */
    zTcin : 0,
    /**
     * End zoom time code
     * @property zTcout
     * @default 0
     */
    zTcout : 0,
    /**
     * Default height of time axe
     * @property timeAxeHeight
     * @default 150
     */
    timeAxeHeight : 150,
    /**
     * Tool tip configuration
     * @property tooltipConfiguration
     * @default 150
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
     * Instance of local storage
     * @property localStorageManager
     * @default null
     */
    localStorageManager : null,
    /**
     * true if load data started anw
     * @property loadDataStarted
     * @default null
     */
    loadDataStarted : false,
    /**
     * List of id to deal
     * @property loadDataStarted
     * @default null
     */
    dataToDeal : null,
    /**
     * Line configuration
     * @property loadDataStarted
     * @default null
     */
    settingsListOfComponents : [
    ],
    /**
     * True if editing mode is enabled
     * @property editingMode
     * @default null
     */
    editingMode : false,
    /**
     * Instance of metadata manager
     * @property metadataManager
     * @default null
     */
    metadataManager : null,
    /**
     * Initialize this class with default parameters
     * @method initialize
     */
    initialize : function ()
    {
        this.listOfMetadataTypes = [
        ];
        this.notManagedMetadataIds = [
        ];
        this.managedMetadataIds = [
        ];
        this.listOfComponents = [
        ];
        // Default configuration
        this.settings = $.extend( {
            debug : this.settings.debug,
            internalPlugin : false,
            // Line configuration
            listOfLines : {},
            // Number of line to be displayed
            displayLines : 3,
            // Default zoom level
            nbZoomLevel : 3,
            // Default zoom configuration
            zoomCoef : [
                1 / 4,
                1 / 16,
                1 / 64,
                1 / 256
            ],
            // Attribute name use for zoom
            zoomProperty : 'tclevel',
            // To enable the time axis
            timeaxe : true,
            // To enable resizable mode
            resizable : false,
            viewZoomSync : false,
            viewZoomSyncOffset : 1,
            // To enable time cursor
            timecursor : true,
            timeaxeExpandable : false,
            editingMode : false,
            lineDisplayMode : fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.METADATA_DISPLAY_TYPE.STATIC
        },
        this.settings.parameters || {} );
        this.tcin = this.mediaPlayer.getTcOffset();
        this.tcout = this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset();
        this.zTcin = this.mediaPlayer.getTcOffset();
        this.zTcout = this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset();
        this.metadataManager = this.mediaPlayer.getMetadataManager();
        this.loadDataStarted = false;
        this.editingMode = this.settings.editingMode;
        // Set default data type managed by this plugin.
        this.registerMetadataTypes();
        this.registerPluginTypes();

        // Line configuration
        this.settingsListOfComponents = $.extend( true,[
        ],this.settings.listOfLines );

        if (this.settings.timecursor === true)
        {
            this.createTimeCursor();
        }

        // Enable time axe
        if (this.settings.timeaxe === true)
        {
            this.timeAxisComponentContainer = $( '<div>',{
                class : 'timeaxis'
            } );
            this.createTimeProgressContainer();
        }
        else
        {
            this.timeProgressContainer = null;
        }

        this.componentsContainer = $( '<div>',{
            class : 'components',
            style : 'height:' + (this.pluginContainer.height() - this.timeAxeHeight) + 'px;'
        } );
        // jquery ui sortable
        this.componentsContainer.sortable( {
            handle : '.sort-btn'
        } );
        // zoom
        this.zoomRangeLevels = this.getZoomRangeLevels( this.tcout,this.settings.nbZoomLevel,this.settings.zoomCoef );


        this.pluginContainer.append( this.timeAxisComponentContainer );
        this.pluginContainer.append( this.componentsContainer );
        this.createTimlineNavBar( this.settings.listOfLines.length );
        // Instance of local storage
        this.localStorageManager = new fr.ina.amalia.player.LocalStorageManager( {} );
        // update tool tips
        this.pluginContainer.find( '.plugin-btn' ).tooltip( "option","disabled",(this.localStorageManager.hasItem( 'help-tooltip' ) === false) ? false : this.localStorageManager.getItem( 'help-tooltip' ) );
        // Enabling resize mode
        if (this.settings.resizable === true)
        {
            this.pluginContainer.resizable( {
                handles : 's',
                create : function (event)
                {
                    $( event.target ).find( 'div.ui-resizable-handle' ).addClass( 'ajs-icon ajs-icon-ellipsis-h' );
                },
                start : this.onResizeStart,
                resize : this.onResize
            } );
        }
        this.resizeComponentsHeight();
        if (this.timeAxisComponent !== null)
        {
            this.timeAxisComponent.setZoomTc( this.zTcin,this.zTcout );
        }
        this.defineListeners();
    },
    /**
     * In charge to register data type managed by this plugin.
     * @method registerMetadataTypes
     */
    registerMetadataTypes : function ()
    {
        this.addManagedMetadataType( fr.ina.amalia.player.PluginBindingManager.dataTypes.DIGINPIX_TRANS );
        this.addManagedMetadataType( fr.ina.amalia.player.PluginBindingManager.dataTypes.TRANS );
    },
    /**
     * In charge to register this plugin types
     * @method registerPluginTypes
     */
    registerPluginTypes : function ()
    {
        this.registerPluginType( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_CUEPOINT );
        this.registerPluginType( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT );
        this.registerPluginType( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_IMAGE );
        this.registerPluginType( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_HISTOGRAM );
        this.registerPluginType( fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_VISUAL );
    },
    /**
     * In charge to create time cursor container
     * @method createTimeCursor
     */
    createTimeCursor : function ()
    {
        this.timeCursor = $( '<div>',{
            'class' : 'timeline-cursor'
        } );
        // Add to main container
        this.pluginContainer.append( this.timeCursor );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createTimeCursor" );
        }
    },
    /**
     * In charge to create time progress bar container
     * @method createTimeProgressContainer
     */
    createTimeProgressContainer : function ()
    {
        this.timeProgressContainer = $( '<div>',{
            'class' : 'timeline-progress-container'
        } );
        this.initializeTimeAxeComponent();
        // Add to main container
        this.pluginContainer.append( this.timeProgressContainer );

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createTimeProgressContainer" );
        }
    },
    /**
     * In charge to create time axe navigation bar
     * @param {Numbre} nbItems
     */
    createTimlineNavBar : function (nbItems)
    {
        this.navBarContainer = $( '<div>',{
            'class' : 'module-nav-bar-container '
        } );
        var rowContainer = $( '<div>',{
            class : 'ajs-row toolsbar'
        } );
        var leftContainer = $( '<div>',{
            class : 'ajs-col-3 leftContainer'
        } );
        var middleContainer = $( '<div>',{
            class : 'ajs-col-6 middleContainer'
        } );
        var rightContainer = $( '<div>',{
            class : 'ajs-col-3 rightContainer'
        } );
        // boutons
        var scrollDownBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SCROLL_DOWN,'chevron-down scroll-btn' );
        scrollDownBtn.on( 'click',{
            self : this
        },
        this.onScrollDown );
        var scrollUpBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SCROLL_UP,'chevron-up scroll-btn' );
        scrollUpBtn.on( 'click',{
            self : this
        },
        this.onScrollUp );
        middleContainer.append( scrollUpBtn );
        middleContainer.append( scrollDownBtn );
        leftContainer.append( $( '<div>',{
            class : 'info',
            html : '<span class="count">' + nbItems + '</span> ' + fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_ELEMENTS
        } ) );
        rightContainer.append( this.createDropdownMenu() );
        rowContainer.append( leftContainer );
        rowContainer.append( middleContainer );
        rowContainer.append( rightContainer );
        this.navBarContainer.append( rowContainer );
        // Add to main container
        this.pluginContainer.append( this.navBarContainer );
        // Initialize all line with configuration
        if (this.settings.lineDisplayMode < 3)
        {
            this.createComponentsWithList( this.settingsListOfComponents );
        }
    },
    /**
     * Create button with tooltip
     * @method createButton
     * @param {String} name
     * @param {String} icon
     */
    createButton : function (name,icon)
    {
        return $( '<button>',{
            title : name,
            class : "plugin-btn ajs-icon ajs-icon-" + icon
        } ).tooltip( this.tooltipConfiguration );
    },
    /**
     * Create drop down menu
     * @method createDropdownMenu
     */
    createDropdownMenu : function ()
    {
        var dropup = $( '<div>',{
            class : 'config-menu btn-group'
        } );
        var dropupCtrl = $( '<span>',{
            class : "config-btn",
            'data-toggle' : "dropdown"
        } ).on( 'click',function (e) {
            $( e.currentTarget ).parent().find( '.config-menu-list' ).show();
        } );
        dropupCtrl.append( $( '<span>',{
            class : "ajs-icon ajs-icon-cog"
        } ) );
        dropup.append( dropupCtrl );
        var menuItems = $( "<ul>",{
            'class' : 'config-menu-list',
            "role" : "menu"
        } ).hide().on( 'mouseleave',function (e) {
            $( e.currentTarget ).hide();
        } );
        // Item permettant de contrôler l'affichage des infobulles
        var itemHideTootips = $( '<li>',{
            text : fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_SHOW_HIDE_TOOTIP
        } ).on( 'click',{
            self : this
        },
        this.onChangeToogleStatus );
        menuItems.append( itemHideTootips );
        dropup.append( menuItems );
        return dropup;
    },
    /**
     * Initialize time axe component
     * @method initializeTimeAxeComponent
     */
    initializeTimeAxeComponent : function ()
    {
        var componentSettings = $.extend( {
            debug : this.settings.debug,
            container : this.timeAxisComponentContainer,
            duration : this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset(),
            expand : this.settings.timeaxeExpandable,
            tcOffset : this.mediaPlayer.getTcOffset()
        },
        this.settings.timeAxisSettings || {} );
        try
        {
            this.timeAxisComponent = new fr.ina.amalia.player.plugins.timeline.TimeAxisComponent( componentSettings );

            this.timeAxisComponent.getContainer().on( fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.eventTypes.RANGE_CHANGE,{
                self : this
            },
            this.onRangeChange );
            this.timeAxisComponent.getContainer().on( fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.eventTypes.CHANGE_DISPLAY,{
                self : this
            },
            this.onDisplayStateChange );
            this.timeAxisComponent.getContainer().on( fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.eventTypes.CHANGE_TIMEAXE_DISPLAY_STATE,{
                self : this
            },
            this.onTimeaxeDisplayStateChange );
            this.timeAxisComponent.getContainer().on( fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.eventTypes.CLICK_AT_TIC,{
                self : this
            },
            this.onClickTc );
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( error.stack );
            }
            this.timeAxisComponent = null;
        }
    },
    /**
     * Add player events listener
     * @method definePlayerListeners
     */
    defineListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        // On time change
        player.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimeupdate );
        player.on( fr.ina.amalia.player.PlayerEventType.BEGIN_DATA_CHANGE,{
            self : this
        },
        this.onBeginDataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.END_DATA_CHANGE,{
            self : this
        },
        this.onEndDataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            self : this
        },
        this.onDataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.ZOOM_RANGE_CHANGE,{
            self : this
        },
        this.onZoomRangeChange );

        //Selected metadata changed event
        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            self : this
        },
        this.onSelectedMetadataChange );

        // Add data change events
        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.CuepointsComponent.eventTypes.DATA_CHANGE,{
            self : this
        },
        this.onCuepointDataChange );
        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.SegmentsComponent.eventTypes.DATA_CHANGE,{
            self : this
        },
        this.onSegmentDataChange );

        this.pluginContainer.on( fr.ina.amalia.player.plugins.components.FocusComponent.eventTypes.ZOOM_ZONE_CHANGE,{
            self : this
        },
        this.onZoomZoneChangeWithFocusComponent );
        // /onCuepointDataChange
        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.BaseComponent.CLICK_SELECT,{
            self : this
        },
        this.onSelectItem );
        ///Visual component

        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.DATA_CHANGE,{
            self : this
        },
        this.onVisualComponentDataChange );
        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.BIND,{
            self : this
        },
        this.onVisualComponentBindMetadata );
        this.pluginContainer.on( fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.UNBIND,{
            self : this
        },
        this.onVisualComponentUnBindMetadata );


        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * Update zoom tcin and tcout
     * @method updateZoomChange
     * @param {Number} zTcin
     * @param {Number} zTcout
     */
    updateZoomChange : function (zTcin,zTcout)
    {
        if (this.zTcin !== zTcin || this.zTcout !== zTcout)
        {
            this.zTcin = Math.max( 0,parseFloat( zTcin ) );
            this.zTcout = Math.min( this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset(),parseFloat( zTcout ) );
            this.mediaPlayer.setZoomTc( this.zTcin,this.zTcout,this.eventTag );
            if (this.timeAxisComponent !== null)
            {
                this.timeAxisComponent.setZoomTc( this.zTcin,this.zTcout );
            }
            this.updateRange( this.zTcin,this.zTcout );
            if (this.settings.timecursor === true)
            {
                this.updateTimelinePos( parseFloat( this.mediaPlayer.getCurrentTime() ) );
            }
        }
    },
    /**
     * Update time range
     * @param {Number} tcin
     * @param {Number} tcout
     */
    updateRange : function (tcin,tcout)
    {
        this.tcin = tcin;
        this.tcout = tcout;
        this.zoomLevel = this.getZoomRangeLevel( this.tcin,this.tcout );
        this.updateAllBlocks();
    },
    /**
     * Update time cursor position
     * @method updateTimelinePos
     * @param {Object} currentTime
     */
    updateTimelinePos : function (currentTime)
    {
        // item tc
        var tc = parseFloat( currentTime );
        // global tc
        var gtc = this.tcout - this.tcin;
        var percentWidth = ((tc - this.tcin) * 100) / gtc;

        if (currentTime > this.tcin && currentTime < this.tcout)
        {
            this.timeCursor.show();
            this.timeCursor.data( 'tc',currentTime );
            this.timeCursor.css( 'left',percentWidth + '%' );
            if (this.timeProgressContainer !== null)
            {
                this.timeProgressContainer.show();
                this.timeProgressContainer.data( 'tc',currentTime );
                this.timeProgressContainer.css( 'right',(100 - percentWidth) + '%' );
            }
        }
        else if (currentTime > this.tcin)
        {
            this.timeCursor.hide();
            if (this.timeProgressContainer !== null)
            {
                this.timeProgressContainer.css( 'right','0%' );
            }
        }
        else
        {
            this.timeCursor.hide();
            if (this.timeProgressContainer !== null)
            {
                this.timeProgressContainer.hide();
            }
        }
    },
    /**
     * Get zoom range level with timecode
     * @param {Number} tcin
     * @param {Number} tcout
     */
    getZoomRangeLevel : function (tcin,tcout)
    {
        var tc = tcout - tcin;
        for (var i = 0;
            i < this.zoomRangeLevels.length;
            i++)
        {
            if (tc > this.zoomRangeLevels[i].start && tc < this.zoomRangeLevels[i].end)
            {
                return this.zoomRangeLevels[i].level;
            }
        }
        return 0;
    },
    /**
     * Get all zoom range level with timecode and zoom coefficient
     * @param {Number} tc time code
     * @param {Number} nbLevel level numbre
     * @param {Object} zoomCoef
     */
    getZoomRangeLevels : function (tc,nbLevel,zoomCoef)
    {
        var zoomTcRange = [
        ];
        var zoomRange = null;
        for (var i = 0;
            i < nbLevel;
            i++)
        {
            zoomRange = {
                level : i,
                start : (i < nbLevel - 1) ? zoomCoef[i] * tc : 0,
                end : (i === 0) ? tc : zoomCoef[i - 1] * tc
            };
            zoomRange.tc = zoomRange.end - zoomRange.start;
            zoomTcRange.push( zoomRange );
        }
        return zoomTcRange;
    },
    /**
     * In charge to create cue point component
     * @method createCuepointsComponent
     * @param {String} container
     * @param {Object} settings
     */
    createComponent : function (container,settings)
    {
        var componentSettings = $.extend( {
            debug : this.settings.debug,
            container : container,
            duration : this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset(),
            tcOffset : this.mediaPlayer.getTcOffset()
        },
        settings || {} );

        var component = null;
        try
        {
            if (componentSettings.hasOwnProperty( 'className' ) === true)
            {
                /* jslint evil: true */
                component = eval( "new " + componentSettings.className + '(componentSettings)' );
            }
            else
            {
                /* jslint evil: true */
                component = eval( "new " + this.getComponentType( settings.type ) + '(componentSettings)' );
            }
        }
        catch (error)
        {
            if (this.logger !== null)
            {
                this.logger.warn( error.stack );
            }
        }
        return component;
    },
    /**
     * Return the component default class name of the component by type
     * @param {String} type line type
     */
    getComponentType : function (type)
    {
        var className = '';
        switch (type)
        {
            // create image component
            case "image" :
                className = 'fr.ina.amalia.player.plugins.timeline.ImagesComponent';
                break;
                // create segment component
            case "segment" :
                className = 'fr.ina.amalia.player.plugins.timeline.SegmentsComponent';
                break;
                // create histogram component
            case "histogram" :
                className = 'fr.ina.amalia.player.plugins.timeline.HistogramComponent';
                break;
            case "visual" :
                className = 'fr.ina.amalia.player.plugins.timeline.VisualComponent';
                break;
            default :
                className = 'fr.ina.amalia.player.plugins.timeline.CuepointsComponent';
                break;
        }
        return className;
    },
    /**
     * In cherge to configure dynaminc line
     * @param metadataId
     * @param type
     * @param shape
     */
    getNewLineConf : function (metadataId,type,shape)
    {
        type = type.split( '_' )[1];
        return {
            title : metadataId,
            metadataId : metadataId,
            type : type,
            // color : 'orange',
            icon : shape,
            editable : true
        };
    },
    /**
     * In charge to create components with list
     * @method createComponentsWithList
     * @param listOfComponents
     */
    createComponentsWithList : function (listOfComponents)
    {
        var container = null;
        var component = null;
        for (var i = 0;
            i < listOfComponents.length;
            i++)
        {
            var lineSettings = listOfComponents[i];
            if (lineSettings.hasOwnProperty( 'title' ) === true && lineSettings.hasOwnProperty( 'type' ) === true && lineSettings.hasOwnProperty( 'metadataId' ) === true)
            {
                container = $( '<div>',{
                    class : "component"
                } );
                this.componentsContainer.append( container );
                component = this.createComponent( container,lineSettings );
                if (component !== null)
                {
                    component.setZoomProperty( this.settings.zoomProperty );
                    component.setMetadataId( lineSettings.metadataId );
                    component.setZoomLevel( this.zoomLevel );
                    component.setTcin( this.tcin );
                    component.setTcout( this.tcout );
                    component.setZoomTc( this.zTcin,this.zTcout );
                    // Set metadata id
                    container.attr( 'data-metadata-id',lineSettings.metadataId );
                    this.bindMetadataId( lineSettings.metadataId );
                    this.listOfComponents.push( component );

                    component.getContainer().on( fr.ina.amalia.player.plugins.timeline.BaseComponent.CLICK_TC,{
                        self : this
                    },
                    this.onClickTc );
                    component.getContainer().on( fr.ina.amalia.player.plugins.timeline.BaseComponent.NAV_CLICK,{
                        self : this,
                        component : component
                    },
                    this.onClickNavControls );
                }
            }
            else
            {
                if (this.logger !== null)
                {
                    this.logger.warn( "Error initializing the component." );
                }
            }
        }
        this.resizeComponentsHeight();
        this.updateComponentsLineHeight();

        this.componentsContainer.find( '.component' ).on( 'click',{
            self : this
        },
        this.onSelectComponents );

    },
    /**
     * In charge to delete component
     * @param {String} metadataId
     */
    deleteComponentsWithMetadataId : function (metadataId)
    {
        this.componentsContainer.find( '.component[data-metadata-id="' + metadataId + '"]' ).remove();
        this.unbindMetadataId( metadataId );
    },
    /**
     * Update all block
     */
    updateAllBlocks : function ()
    {
        var listOfObject = null;
        for (var i = 0;
            i < this.listOfComponents.length;
            i++)
        {
            var component = this.listOfComponents[i];
            component.setZoomLevel( this.zoomLevel );
            component.setTcin( this.tcin );
            component.setTcout( this.tcout );
            component.setZoomTc( this.zTcin,this.zTcout );
            if (typeof component.removeItems === "function" && typeof component.addItems === "function" && typeof component.getMetadataId === "function")
            {
                component.removeItems();
                listOfObject = this.mediaPlayer.getMetadataById( component.getMetadataId() );
                if (typeof listOfObject !== "undefined" && listOfObject !== null && listOfObject.hasOwnProperty( 'length' ) && listOfObject.length > 0)
                {
                    component.addItems( listOfObject );
                }
            }
        }

    },
    /**
     * In charge to update block by id metadata
     * @param {String} id
     * @param {String} action
     */
    updateBlock : function (id,action)
    {
        for (var i = 0;
            i < this.listOfComponents.length;
            i++)
        {
            var component = this.listOfComponents[i];

            if (component.getMetadataId() === id.toString())
            {
                if (typeof component.removeItems === "function" && typeof component.addItems === "function" && typeof component.getMetadataId === "function")
                {
                    component.removeItems();
                    var listOfObject = this.mediaPlayer.getMetadataById( component.getMetadataId() );
                    if (this.settings.lineDisplayMode > 1 && this.settings.editingMode === true)
                    {
                        var metadataObject = this.mediaPlayer.getBlockMetadata( id.toString() );
                        component.setTitle( metadataObject.label );
                        component.setShape( metadataObject.shape );
                        component.setColor( metadataObject.color );
                        if (action === "replace-all" && typeof component.setHistogramIsCreated === "function")
                        {
                            component.setHistogramIsCreated( false );
                        }
                    }
                    if (typeof listOfObject !== "undefined" && listOfObject !== null && listOfObject.hasOwnProperty( 'length' ) && listOfObject.length > 0)
                    {
                        component.addItems( listOfObject );
                    }
                }
            }
        }

    },
    /**
     * In charge to update list of ids
     * @param listOfIds list of ids
     */
    updateBlocks : function (listOfIds)
    {
        if (typeof listOfIds === 'object')
        {
            for (var i = 0;
                i < listOfIds.length;
                i++)
            {
                if (this.settings.lineDisplayMode > 1 && this.isManagedMetadataId( listOfIds[i] ) === false)
                {
                    var metadataObject = this.mediaPlayer.getBlockMetadata( listOfIds[i] );
                    var metadataDataType = (metadataObject !== null && metadataObject.hasOwnProperty( 'type' )) ? metadataObject.type : '';
                    var lineType = this.bindingManager.getLinetypeWithDataType( metadataDataType );

                    if (this.bindingManager.isManagedDataType( this.uuid,metadataDataType ) === true && lineType !== null)
                    {
                        var shape = (metadataObject !== null && metadataObject.hasOwnProperty( 'shape' )) ? metadataObject.shape : '';
                        this.createComponentsWithList( [
                            this.getNewLineConf( listOfIds[i],lineType,shape )
                        ] );
                    }
                    //this.bindMetadataId( listOfIds[i] );
                    this.updateBlock( listOfIds[i] );
                }
                else
                {
                    this.updateBlock( listOfIds[i] );
                }
            }
        }
        this.updateRange( this.tcin,this.tcout );
    },
    /**
     * Update line height
     * @method updateComponentsLineHeight
     */
    updateComponentsLineHeight : function ()
    {
        var element = this.pluginContainer;
        var headerAndFooterHeight = parseFloat( element.find( '.timeaxis' ).height() + element.find( '.module-nav-bar-container' ).height() );
        var linesOffset = 2 * element.find( '.component' ).length;
        var lineHeight = $( element ).find( '.component' ).first().height();
        var displayLinesNb = this.settings.displayLines;
        element.find( '.components' ).first().css( 'height',lineHeight * displayLinesNb + linesOffset ); // 5
        // offset
        element.css( "height",lineHeight * displayLinesNb + linesOffset + headerAndFooterHeight );
        element.find( '.module-nav-bar-container .info span.count' ).text( element.find( '.component' ).length );
    },
    /**
     * In charge to update lines components
     * @method resizeComponentsHeight
     */
    resizeComponentsHeight : function ()
    {
        var headerAndFooterHeight = parseFloat( this.pluginContainer.find( '.timeaxis' ).height() + this.pluginContainer.find( '.module-nav-bar-container' ).height() );
        var lineHeight = parseFloat( fr.ina.amalia.player.plugins.TimelinePlugin.componentDefaultHeight );
        var offset = 2;
        this.displayLinesNb = (typeof this.settings.displayLines === "number") ? this.settings.displayLines : this.settings.listOfLines.length;
        if (this.displayLinesNb > this.settings.listOfLines.length)
        {
            this.displayLinesNb = this.settings.listOfLines.length;
        }
        offset = this.displayLinesNb * offset;
        var lh = (this.displayLinesNb * lineHeight) + this.navBarContainer.height();
        if (this.settings.timeaxe)
        {
            this.pluginContainer.css( 'height',lh + this.timeAxeHeight + 'px' );
        }
        else
        {
            this.pluginContainer.css( 'height',lh + 'px' );
        }
        this.componentsContainer.css( 'height',(this.pluginContainer.height() - headerAndFooterHeight) + 'px' );

        var scrollBtnState = (this.componentsContainer.height() + offset >= this.componentsContainer.get( 0 ).scrollHeight);
        this.navBarContainer.find( '.scroll-btn' ).toggle( !scrollBtnState );
        if (!scrollBtnState)
        {
            this.componentsContainer.on( 'mousewheel DOMMouseScroll',{
                self : this
            },
            this.onComponentsMousewheel );
        }
    },
    // Events

    /**
     * Trigger on zoom range change
     * @method onRangeChange
     * @param {Object} event
     * @param {Object} data tcin/tcout
     */
    onRangeChange : function (event,data)
    {
        event.data.self.updateZoomChange( parseFloat( data.tcin ),parseFloat( data.tcout ) );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onRangeChange Tcin:" + data.tcin + " Tcout" + data.tcout );
        }
    },
    /**
     * Fired on display state change event
     * @param {Object} event
     */
    onDisplayStateChange : function (event)
    {
        for (var i = 0;
            i < event.data.self.listOfComponents.length;
            i++)
        {
            var component = event.data.self.listOfComponents[i];
            if (typeof component.changeDisplayState === "function")
            {
                component.changeDisplayState();
            }
        }
        // Permet de mettre à jour la hauteur du plugin
        if (event.data.self.settings.displayLines === false)
        {
            event.data.self.updateComponentsLineHeight();
        }
    },
    /**
     * Fired on time axe display change event
     * @param {Object} event
     * @param {Object} data
     */
    onTimeaxeDisplayStateChange : function (event,data)
    {
        if (event.data.self.timeProgressContainer !== null)
        {
            if (data.state === true)
            {
                event.data.self.timeProgressContainer.css( 'height','102px' );
            }
            else
            {
                event.data.self.timeProgressContainer.css( 'height','2px' );
            }
        }
        if (event.data.self.settings.displayLines === false)
        {
            event.data.self.updateComponentsLineHeight();
        }
        else
        {
            var element = event.data.self.pluginContainer;
            var headerAndFooterHeight = parseFloat( element.find( '.timeaxis' ).height() + element.find( '.module-nav-bar-container' ).height() );
            var linesOffset = 2 * event.data.self.displayLinesNb;
            var lineHeight = $( element ).find( '.component' ).first().height();
            var componentsHeight = lineHeight * event.data.self.displayLinesNb + linesOffset;
            element.find( '.components' ).first().css( 'height',componentsHeight );
            element.css( "height",componentsHeight + headerAndFooterHeight );
        }
    },
    /**
     * Fired on click at time code
     * @param {Object} event
     * @param {Object} data
     */
    onClickTc : function (event,data)
    {
        if (data.hasOwnProperty( 'tc' ) === true)
        {
            event.data.self.mediaPlayer.setCurrentTime( parseFloat( data.tc ) );
        }
    },
    /**
     * Fired on time change event for update time cursor
     * @method onFirstTimechange
     * @param {Object} event
     * @param {Object} data Données renvoyer par l'événement timeupdate.
     */
    onTimeupdate : function (event,data)
    {
        if (event.data.self.settings.timecursor === true)
        {
            event.data.self.updateTimelinePos( parseFloat( data.currentTime ) );
        }
        event.data.self.pluginContainer.trigger( fr.ina.amalia.player.plugins.TimelinePlugin.eventTypes.TIME_CHANGE,{
            'currentTime' : parseFloat( data.currentTime )
        } );

        if (event.data.self.settings.viewZoomSync === true)
        {
            if (parseFloat( data.currentTime ) > (event.data.self.zTcout - event.data.self.settings.viewZoomSyncOffset))
            {
                var range = (event.data.self.zTcout - event.data.self.zTcin);
                var zTcout = Math.min( event.data.self.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset(),event.data.self.zTcout + range );
                var zTcin = Math.max( 0,zTcout - range );
                event.data.self.updateZoomChange( zTcin,zTcout );
            }
        }
    },
    /**
     * Fired on begin data change event
     * @method onBeginDataChange
     * @param {Object} event
     */
    onBeginDataChange : function (event)
    {
        event.data.self.loadDataStarted = true;
        event.data.self.dataToDeal = [
        ];
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onBeginDataChange" );
        }
    },
    /**
     * Fired on data change event
     * @param {Object} event
     * @param {Object} data
     */
    onDataChange : function (event,data)
    {
        if (event.data.self.loadDataStarted === false)
        {
            if (event.data.self.editingMode)
            {
                if (data.hasOwnProperty( 'action' ) && data.action === 'deleteBlock')
                {
                    event.data.self.deleteComponentsWithMetadataId( data.id );
                }
                else
                {
                    if (event.data.self.isManagedMetadataId( data.id ))
                    {
                        event.data.self.updateBlock( data.id,data.action );
                    }
                    else if (event.data.self.settings.lineDisplayMode > 1)
                    {
                        var metadataObject = event.data.self.mediaPlayer.getBlockMetadata( data.id );
                        var metadataDataType = (metadataObject !== null && metadataObject.hasOwnProperty( 'type' )) ? metadataObject.type : '';
                        var lineType = event.data.self.bindingManager.getLinetypeWithDataType( metadataDataType );
                        var shape = (metadataObject !== null && metadataObject.hasOwnProperty( 'shape' )) ? metadataObject.shape : '';
                        if (event.data.self.bindingManager.isManagedDataType( event.data.self.uuid,metadataDataType ) === true && lineType !== null)
                        {
                            event.data.self.createComponentsWithList( [
                                event.data.self.getNewLineConf( data.id,lineType,shape )
                            ] );
                            //event.data.self.bindMetadataId( data.id );
                            event.data.self.updateBlock( data.id );
                        }
                    }
                }
            }
            else if (event.data.self.isManagedMetadataId( data.id ))
            {
                // Mode static
                event.data.self.updateBlock( data.id,data.action );
            }
        }
        else
        {
            // begin data change
            if (event.data.self.dataToDeal !== null)
            {
                // Add to deal array if only the plugin is editing mode and line
                // display mode is dynamic
                if (event.data.self.settings.lineDisplayMode > 1)
                {
                    if ($.inArray( data.id,event.data.self.dataToDeal ) < 0) {
                        event.data.self.dataToDeal.push( data.id );
                    }
                }
            }
        }
    },
    /**
     * Fired on end data change event
     * @method onEndDataChange
     * @param {Object} event
     */
    onEndDataChange : function (event)
    {
        event.data.self.loadDataStarted = false;

        event.data.self.updateBlocks( event.data.self.dataToDeal );
        event.data.self.dataToDeal = [
        ];
        //update line plugin size
        if (event.data.self.settings.displayLines === false)
        {
            event.data.self.updateComponentsLineHeight();
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"EndDataChange" );
        }
    },
    /**
     * Fired on zoom range change
     * @param {Object} event
     * @param {Object} data
     */
    onZoomRangeChange : function (event,data)
    {
        if (data.eventTag === event.data.self.eventTag)
        {
            return;
        }
        if (Math.ceil( event.data.self.zTcin ) !== Math.ceil( data.zTcin ) || Math.ceil( event.data.self.zTcout ) !== Math.ceil( data.zTcout ))
        {
            event.data.self.updateZoomChange( data.zTcin,data.zTcout );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onZoomRangeChange zTcin:" + data.zTcin + " zTcout" + data.zTcout );
            }
        }
    },
    /**
     * Fired for select metadata change
     * @param {Object} event
     * @param {Object} data
     */
    onSelectedMetadataChange : function (event,data)
    {
        event.data.self.componentsContainer.find( '.component' ).removeClass( 'activated' );
        if (data.metadataId !== null)
        {
            event.data.self.componentsContainer.find( '.component[data-metadata-id="' + data.metadataId + '"]' ).addClass( 'activated' );
            var movePos = event.data.self.componentsContainer.find( '.component[data-metadata-id="' + data.metadataId + '"]:first' ).position();
            var scrollTop = event.data.self.componentsContainer.get( 0 ).scrollTop;
            if (typeof movePos === 'object' && movePos.hasOwnProperty( 'top' ))
            {
                scrollTop = Math.min( scrollTop,event.data.self.componentsContainer.get( 0 ).scrollHeight );
                event.data.self.componentsContainer.stop().animate( {
                    scrollTop : scrollTop + movePos.top
                },
                500,'easeInOutExpo' );
            }
        }
    },
    /**
     * Fired on cue point data change event
     * @param {Object} event
     * @param {Object} data
     */
    onCuepointDataChange : function (event,data)
    {
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : data.id
        } );

    },
    /**
     * Fired on segment data change event
     * @param {Object} event
     * @param {Object} data
     */
    onSegmentDataChange : function (event,data)
    {
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : data.id
        } );
    },
    /**
     * Fired on visual component data change event
     * @param {Object} event
     * @param {Object} data
     */
    onVisualComponentDataChange : function (event,data)
    {
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : data.id
        } );
    },
    /**
     * Fired for select line
     * @param {Object} event
     */
    onSelectComponents : function (event)
    {
        var metadataId = $( event.currentTarget ).attr( 'data-metadata-id' );
        if (event.data.self.mediaPlayer.getSelectedMetadataId() !== metadataId)
        {
            event.data.self.mediaPlayer.setSelectedMetadataId( metadataId );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onSelectComponents  : " + metadataId );
            }
        }
    },
    /**
     * Fired on scroll up event
     * @param {Object} event
     */
    onScrollUp : function (event)
    {
        var moveHeight = event.data.self.componentsContainer.find( '.component' ).height();
        var scrollTop = event.data.self.componentsContainer.get( 0 ).scrollTop - moveHeight;
        scrollTop = Math.min( scrollTop,event.data.self.componentsContainer.get( 0 ).scrollHeight );
        event.data.self.componentsContainer.stop().animate( {
            scrollTop : scrollTop
        },
        500,'easeInOutExpo' );
    },
    /**
     * Fired on scroll down event
     * @param {Object} event
     */
    onScrollDown : function (event)
    {
        var moveHeight = event.data.self.componentsContainer.find( '.component' ).height();
        var scrollTop = event.data.self.componentsContainer.get( 0 ).scrollTop + moveHeight;
        scrollTop = Math.min( scrollTop,event.data.self.componentsContainer.get( 0 ).scrollHeight );
        event.data.self.componentsContainer.stop().animate( {
            scrollTop : scrollTop
        },
        500,'easeInOutExpo' );
    },
    /**
     * Fired on Mousewheel event
     * @param {Object} event
     */
    onComponentsMousewheel : function (event)
    {
        // preventDefault scrool page event
        event.preventDefault();
        var delta = Math.max( -1,Math.min( 1,(event.originalEvent.wheelDelta || -event.originalEvent.detail) ) );
        if (typeof delta === "number")
        {
            var scrollTop = event.data.self.componentsContainer.get( 0 ).scrollTop - delta;
            scrollTop = Math.min( scrollTop,event.data.self.componentsContainer.get( 0 ).scrollHeight );
            event.data.self.componentsContainer.get( 0 ).scrollTop = scrollTop;
        }
    },
    /**
     * On click to select item
     * @param {Object} event
     * @param {Object} data
     */
    onSelectItem : function (event,data)
    {
        var metadataId = $( event.target ).attr( 'data-metadata-id' );
        if (event.data.self.mediaPlayer.getSelectedMetadataId() !== metadataId)
        {
            event.data.self.mediaPlayer.setSelectedMetadataId( metadataId );
        }
        event.data.self.mediaPlayer.addSelectedItem( data.metadata );
    },
    /**
     * Fired on zoom zone change
     * @param {Object} event
     * @param {Object} data
     */
    onZoomZoneChangeWithFocusComponent : function (event,data)
    {
        if (Math.ceil( event.data.self.zTcin ) !== Math.ceil( data.zTcin ) || Math.ceil( event.data.self.zTcout ) !== Math.ceil( data.zTcout ))
        {
            event.data.self.updateZoomChange( data.zTcin,data.zTcout );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onZoomZoneChangeWithFocusComponent zTcin:" + data.zTcin + " zTcout" + data.zTcout );
            }
        }
    },
    /**
     * Fired on resize start event
     * @param {Object} evnet
     * @param {Object} ui
     */
    onResizeStart : function (evnet,ui)
    {
        var element = ui.element;
        var lineHeight = $( element ).find( '.component' ).first().height();
        var linesOffset = 2 * $( element ).find( '.component' ).length;
        var headerAndFooterHeight = parseFloat( $( element ).find( '.timeaxis' ).height() + $( element ).find( '.module-nav-bar-container' ).height() );
        element.resizable( "option","minHeight",lineHeight + headerAndFooterHeight );
        element.resizable( "option","maxHeight",(lineHeight * $( element ).find( '.component' ).length - linesOffset) + headerAndFooterHeight );
    },
    /**
     * Fired on resize event
     * @param {Object} event
     * @param {Object} ui
     */
    onResize : function (event,ui)
    {
        var element = ui.element;
        var headerAndFooterHeight = parseFloat( $( element ).find( '.timeaxis' ).height() + $( element ).find( '.module-nav-bar-container' ).height() );
        $( element ).find( '.components' ).first().css( 'height',ui.size.height - headerAndFooterHeight );
    },
    /**
     * Fired on visual component bind metadata
     * @param {Object} event
     * @param {Object} data
     */
    onVisualComponentBindMetadata : function (event,data)
    {
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.BIND_METADATA,{
            id : data.id
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onVisualComponentBindMetadata  : " + data.id );
        }
    },
    /**
     * Fired on visual component un bind metadata
     * @param {Object} event
     * @param {Object} data
     */
    onVisualComponentUnBindMetadata : function (event,data)
    {
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.UNBIND_METADATA,{
            id : data.id
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onVisualComponentUnBindMetadata  : " + data.id );
        }
    }
} );
