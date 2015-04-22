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
 * In charge to handle focus component
 * @class FocusComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
$.Class( "fr.ina.amalia.player.plugins.components.FocusComponent",{
    CONTAINER_NAME : "focus-container",
    eventTypes : {
        FOCUS_ZONE_CHANGE : "fr.ina.amalia.player.plugins.components.FocusComponent.FOCUS_ZONE_CHANGE",
        ZOOM_ZONE_CHANGE : "fr.ina.amalia.player.plugins.components.FocusComponent.ZOOM_ZONE_CHANGE"
    }
},
{
    /**
     * Instance of logger
     * @property logger
     * @type {Object}
     * @default null
     */
    logger : null,
    /**
     * Settings
     * @property settings
     * @type {Object}
     * @default "{}"
     */
    settings : {},
    /**
     * Main container
     * @property mainContainer
     * @type {Object}
     * @default null
     */
    mainContainer : null,
    /**
     * Container focus element
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * True for mode focus
     * @property modeFocus
     * @type {Boolean}
     * @default "{}"
     */
    modeFocus : null,
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
     * @type {Object}
     * @default "{}"
     */
    duration : 0,
    /**
     * In charge to init this component
     * @constructor
     * @param {Object} container
     * @param {Number} duration
     * @param {Object} settings
     */
    init : function (container,duration,settings)
    {
        this.settings = $.extend( {
            debug : false,
            modeFocus : true
        },
        settings || {} );
        this.modeFocus = this.settings.modeFocus;
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }

        this.mainContainer = container;
        this.duration = parseFloat( duration );
        if (this.mainContainer.length === 0 || typeof this.mainContainer !== "object")
        {
            throw new Error( "Your container is empty." );
        }
        this.initialize();
    },
    /**
     * In charge to initialize this component
     */
    initialize : function ()
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"initialize" );
        }
        this.createContainer();
        this.setMode();
        this.mainContainer.on( fr.ina.amalia.player.plugins.timeline.TimeAxisComponent.eventTypes.RANGE_CHANGE,{
            self : this
        },
        this.onTimeRangeChange );
    },
    /**
     * In charge to create focus component
     * @method createContainer
     */
    createContainer : function ()
    {
        this.container = $( '<div>',{
            'class' : this.Class.CONTAINER_NAME
        } );
        // resizable
        this.container.resizable( {
            handles : 'w,e',
            // ghost : true,
            create : function (event)
            {
                $( event.target ).find( 'div.ui-resizable-handle' ).addClass( 'ajs-icon ajs-icon-reorder' );
            },
            start : function (event,ui)
            {
                var parentElement = $( event.target ).parent();
                var maxWidth = parentElement.width() - ui.element.position().left;
                $( event.target ).resizable( "option","minWidth",40 );
                // Limit la largeur max
                $( event.target ).resizable( "option","maxWidth",maxWidth );
            }
        } );
        this.container.on( "resizestop",{
            self : this
        },
        this.onResizeStop );
        // draggable
        this.container.draggable( {
            axis : "x",
            drag : function (event,ui)
            {
                var targetElement = $( event.target );
                var parentElement = targetElement.parent();
                var newLeft = Math.max( 0,ui.position.left );
                ui.position.left = Math.min( parentElement.first().width() - targetElement.width(),newLeft );
            }
        } ).css( "position","absolute" );
        this.container.on( "dragstop",{
            self : this
        },
        this.onDragStop );
        this.mainContainer.append( this.container );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createContainer" );
        }
    },
    /**
     * In charge to set component mode
     * @method createContainer
     */
    setMode : function ()
    {
        if (this.modeFocus === true)
        {
            this.mainContainer.find( '.' + this.Class.CONTAINER_NAME ).addClass( 'focus' );
        }
        else
        {
            this.mainContainer.find( '.' + this.Class.CONTAINER_NAME ).addClass( 'zoom' );
        }
    },
    /**
     * Return the main container
     * @method getContainer
     */
    getContainer : function ()
    {
        return this.mainContainer;
    },
    /**
     * Set tcin and tcout
     * @method setTc
     */
    setTc : function (tcin,tcout)
    {
        this.tcin = parseFloat( tcin );
        this.tcout = parseFloat( tcout );
        this.mainContainer.find( '.' + this.Class.CONTAINER_NAME ).attr( 'tcin',parseFloat( tcin ) );
        this.mainContainer.find( '.' + this.Class.CONTAINER_NAME ).attr( 'tcout',parseFloat( tcout ) );

        this.selectedZoneChange();
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"setTc: default tc:" + this.tcin + ":" + this.tcout );
        }
    },
    /**
     * Set zoom time code
     * @method setZoomTc
     * @param zTcin
     * @param zTcout
     */
    setZoomTc : function (zTcin,zTcout)
    {
        this.resize( ((zTcout - zTcin) * 100) / this.duration,(zTcin * 100) / this.duration );
    },
    /**
     * Update container size
     * @param {Number} percentWidth
     * @param {Number} percentOffset
     */
    resize : function (percentWidth,percentOffset)
    {
        this.mainContainer.find( '.' + this.Class.CONTAINER_NAME ).first().css( {
            'width' : Math.min( Math.max( 0,parseFloat( percentWidth ) ),100 ) + '%',
            'left' : Math.min( Math.max( 0,parseFloat( percentOffset ) ),100 ) + '%'
        } );
        this.container.trigger( "dragstop" );
    },
    /**
     * trigger select zone change
     * @method selectedZoneChange
     * @returns {Number}
     */
    selectedZoneChange : function ()
    {
        var focusTcin = this.getFocusTcin();
        var focusTcout = this.getFocusTcout();
        // Trigger
        if (this.modeFocus === true)
        {
            // Trigger Focus event
            this.mainContainer.trigger( this.Class.eventTypes.FOCUS_ZONE_CHANGE,{
                focusTcin : focusTcin,
                focusTcout : focusTcout
            } );
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"selectedZoneChange trigger event : " + this.Class.eventTypes.FOCUS_ZONE_CHANGE + " focus focusTcin:" + focusTcin + " focusTcout:" + focusTcout );
            }
        }
        else
        {
            // Trigger zoom event
            this.mainContainer.trigger( this.Class.eventTypes.ZOOM_ZONE_CHANGE,{
                zTcin : focusTcin,
                zTcout : focusTcout
            } );
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"selectedZoneChange trigger event : " + this.Class.eventTypes.ZOOM_ZONE_CHANGE + " focus zTcin:" + focusTcin + " zTcout:" + focusTcout );
            }
        }

    },
    /**
     * Return focus start time code
     * @method getFocusTcin
     * @returns {Number}
     */
    getFocusTcin : function ()
    {
        var selectedTcin = parseFloat( ((this.tcout - this.tcin) * this.mainContainer.find( "." + this.Class.CONTAINER_NAME ).first().position().left) / this.mainContainer.first().width() );
        return Math.max( 0,this.tcin + selectedTcin );
    },
    /**
     * Return focus end time code
     * @returns {Number}
     */
    getFocusTcout : function ()
    {
        var focusTcin = this.getFocusTcin();
        var selectedTcout = parseFloat( ((this.tcout - this.tcin) * (this.mainContainer.find( "." + this.Class.CONTAINER_NAME ).first().width())) / this.mainContainer.first().width() );
        return Math.min( this.duration,focusTcin + selectedTcout );
    },
    /**
     * Fired on time range change event
     * @param {Object} event
     * @param {Object} data
     */
    onTimeRangeChange : function (event,data)
    {
        event.data.self.setTc( data.tcin,data.tcout );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onTimeRangeChange default tc:" + data.tcin + ":" + data.tcout );
        }
    },
    /**
     * Fired on drag stop event
     * @param {Object} event
     */
    onDragStop : function (event)
    {
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onDragStop" );
        }
        event.data.self.selectedZoneChange();
    },
    /**
     * Fired on resize event
     * @param {Object} event
     * @param {Object} ui
     */
    onResizeStop : function (event,ui)
    {
        var element = $( ui.element );
        if (event.data.self.modeFocus === true)
        {
            element.css( 'height','50%' );
        }
        else
        {
            element.css( 'height','100%' );
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onResizeStop" );
        }
        event.data.self.selectedZoneChange();
    }

} );
