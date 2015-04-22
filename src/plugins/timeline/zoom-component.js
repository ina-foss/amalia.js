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
 * In charge to zoom on the time axe component
 * @class ZoomComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
$.Class( "fr.ina.amalia.player.plugins.timeline.ZoomComponent",{
    eventTypes : {
        CHANGE : "fr.ina.amalia.player.plugins.timeline.ZoomComponent.event.change"
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
     * Main container
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * Configuration
     * @property settings
     * @type {Object}
     * @default "{}"
     */
    settings : {},
    /**
     * Tc offset
     * @property tcOffset
     * @type {Number}
     * @default 0
     */
    tcOffset : 0,
    /**
     * Media duration
     * @property duration
     * @type {Object}
     * @default 0
     */
    duration : 0,
    /**
     * Start time code
     * @property currentTcin
     * @type {Number}
     * @default 0
     */
    currentTcin : 0,
    /**
     * End time code
     * @property currentTcout
     * @type {Number}
     * @default 0
     */
    currentTcout : 0,
    /**
     * Slide speed
     * @property slideSpeed
     * @type {Number}
     * @default 0
     */
    slideSpeed : 0,
    /**
     * Zoom speed
     * @property zoomSpeed
     * @type {Number}
     * @default 2
     */
    zoomSpeed : 2,
    /**
     * Init this class
     * @constuctor
     * @param {Object} container
     * @param {Object} duration
     * @param {Object} settings
     */
    init : function (container,duration,settings)
    {
        this.settings = $.extend( {
            'debug' : false,
            'zoomSpeed' : 10,
            'tcOffset' : 0
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.container = container;
        this.tcOffset = parseFloat( this.settings.tcOffset ) * 1000;
        this.duration = duration * 1000;
        this.zoomSpeed = this.settings.zoomSpeed;
        this.slideSpeed = 0;
        this.initialize( this.tcOffset,this.duration + this.tcOffset );
    },
    /**
     * Initialize
     * @method initialize
     * @param {Number} tcin
     * @param {Number} tcout
     */
    initialize : function (tcin,tcout)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"Initialize  tcin" + tcin + " tcout:" + tcout + " duration : " + this.duration );
        }
        this.container.append( $( '<span>',{
            class : 'time',
            'style' : 'display: block; position: absolute;height: 100px;width: 1px;background: aqua;margin-top: -50px;'
        } ) );

        var list = $( '<div>',{
            class : 'list'
        } );
        this.container.append( list );
        this.setTc( tcin,tcout );
    },
    /**
     * Set time code
     * @method setTc
     * @param tcin
     * @param tcout
     */
    setTc : function (tcin,tcout)
    {
        if (typeof tcin === "number" && typeof tcout === "number")
        {
            this.currentTcin = tcin;
            this.currentTcout = tcout;
            this.updateTime();
        }
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"setTc / currentTcin :" + this.currentTcin + " currentTcout:" + this.currentTcout );
        }
    },
    /**
     * update time
     * @method updateTime
     */
    updateTime : function ()
    {
        if (this.currentTcin < this.tcOffset || this.currentTcout > this.duration)
        {
            this.currentTcin = this.tcOffset;
            this.currentTcout = this.duration;
        }
        this.updateTc();
        this.sendEvent();
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"updateTime currentTcin :" + this.currentTcin + " currentTcout:" + this.currentTcout );
        }

    },
    /**
     * Trigger event zoom change event
     * @method sendEvent
     */
    sendEvent : function ()
    {
        this.container.trigger( this.Class.eventTypes.CHANGE,{
            tcin : this.currentTcin,
            tcout : this.currentTcout
        } );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"sendEvent sendEvent :" + this.Class.eventTypes.CHANGE + " currentTcin:" + this.currentTcin + " currentTcout " + this.currentTcout );
        }
    },
    /**
     * Update time code
     * @method updateTc
     */
    updateTc : function ()
    {
        this.container.attr( {
            'data-tcin' : this.currentTcin,
            'data-tcout' : this.currentTcout
        } );
    },
    /**
     * Handle zoom in
     * @method zoomIn
     */
    zoomIn : function ()
    {
        var duration = (this.currentTcout - this.currentTcin);
        var coef = Math.round( duration / this.zoomSpeed );
        if (coef !== 0)
        {
            this.slideSpeed = coef;
            this.currentTcin += coef;
            this.currentTcout -= coef;
            this.updateTime();
        }
    },
    /**
     * Handle zoom out
     * @method zoomOut
     */
    zoomOut : function ()
    {
        var duration = (this.currentTcout - this.currentTcin);
        var coef = Math.round( duration / this.zoomSpeed );
        coef = (coef <= 0) ? 1 : coef;
        this.slideSpeed = coef;
        this.currentTcin -= coef;
        this.currentTcout += coef;
        this.updateTime();
    },
    /**
     * Handle slide left
     * @method slideLeft
     */
    slideLeft : function ()
    {
        if ((this.currentTcin - this.slideSpeed) >= 0)
        {
            this.currentTcin = this.currentTcin - this.slideSpeed;
            this.currentTcout = this.currentTcout - this.slideSpeed;
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"slideLeft currentZoom : " + this.currentZoom + " currentTcin :" + this.currentTcin + " currentTcout:" + this.currentTcout );
            }
            this.updateTc();
            this.sendEvent();
        }

    },
    /**
     * Handle slide right
     * @method slideRight
     */
    slideRight : function ()
    {
        if ((this.currentTcout + this.slideSpeed) <= this.duration)
        {
            this.currentTcin = this.currentTcin + this.slideSpeed;
            this.currentTcout = this.currentTcout + this.slideSpeed;
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"slideRight currentZoom : " + this.currentZoom + " currentTcin :" + this.currentTcin + " currentTcout:" + this.currentTcout );
            }
            this.updateTc();
            this.sendEvent();
        }
    }
} );
