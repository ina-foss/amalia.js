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
 * In charge to create all tic on the time axe
 * @class TicComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
$.Class( "fr.ina.amalia.player.plugins.timeline.TicComponent",{
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.timeline.TicComponent.click",
        UPDATE_TC : "fr.ina.amalia.player.plugins.timeline.TicComponent.updatetc"
    }
},
{
    /**
     * instance of the logger
     * @property logger
     * @type {Object}
     * @default null
     */
    logger : null,
    /**
     * This component container
     * @property settings
     * @type {Object}
     * @default "{}"
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
     * Start time code
     * @property currentTcin
     * @type {Number}
     * @default 0
     */
    currentTcin : 0,
    /**
     * End time code
     * @property currentTcout
     * @type {Object}
     * @default 0
     */
    currentTcout : 0,
    /**
     * Tool tip configuration
     * @property tooltipConfiguration
     * @type {Object}
     * @default "{}"
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
     * Tic preferred time code
     * @property PREFERRED_TICS
     * @type {Object}
     * @default "{}"
     */
    PREFERRED_TICS : [
        1,
        5,
        10,
        100,
        1000,
        2000,
        5000,
        10000,
        20000,
        30000,
        60000,
        300000,
        600000,
        1800000
    ],
    /**
     * Media duration
     * @property tooltipConfiguration
     * @type {Object}
     * @default "{}"
     */
    mediaDuration : 0,
    /**
     * label width
     * @property tcout
     * @type {Object}
     */
    averageLabelSize : 50,
    /**
     * In charge to init this component
     * @constuctor
     * @param {Object} container
     * @param {Object} settings
     * @returns {undefined}
     */
    init : function (container,settings)
    {
        this.settings = $.extend( {
            debug : false
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.container = container;
        this.mediaDuration = this.settings.duration * 1000;
        this.averageLabelSize = 50;
        this.initialize();
    },
    /**
     * Initialize
     * @method initialize
     */
    initialize : function ()
    {

        this.container.on( 'click',{
            self : this
        },
        this.onClick );
        this.container.draggable( {
            axis : "x"
        } );
        this.container.on( 'drag',{
            self : this
        },
        this.onDrag );
        this.container.on( 'dragstop',{
            self : this
        },
        this.onDragStop );
        // call function 200 ms after resize is complete.
        $( window ).on( 'resize',{
            self : this
        },
        this.onWindowResize );
    },
    /**
     * Return tic with
     * @returns {Number} px
     */
    getWidth : function ()
    {
        return Math.round( this.container.width() );
    },
    /**
     * Return preferred segments numbers
     * @returns {Number}
     */
    getPreferredNbSegments : function ()
    {
        return Math.round( this.getWidth() / this.averageLabelSize );
    },
    /**
     * In charge to create tic
     * @param {Number} tc
     * @param {Number} pos
     * @param {Number} label
     * @returns {Object} Dom
     */
    createTic : function (tc,pos,label)
    {
        var element = $( '<div>',{
            'class' : 'time-grid',
            'data-tc' : tc
        } );
        var labelElement = $( '<span>',{
            'class' : 'time',
            'text' : label,
            'data-tc' : tc,
            'title' : fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tc / 1000,25,'ms' )
        } );
        element.append( labelElement );
        element.css( 'left',pos + "%" );
        return element;
    },
    /**
     * In charge to update segments
     * @param {Number} tcin en ms
     * @param {Number} tcout en ms
     */
    updateSegments : function (tcin,tcout)
    {
        this.currentTcin = tcin;
        this.currentTcout = tcout;
        var duration = tcout - tcin;
        var preferredNbSegments = this.getPreferredNbSegments();
        var ticLength = 0;
        var curNbTics = 0;
        var curTicTc = tcin;
        var t = -1;
        do
        {
            t++;
            curNbTics = Math.round( duration / this.PREFERRED_TICS[t] );
        }while ((curNbTics > preferredNbSegments) && (t < (this.PREFERRED_TICS.length - 1)));
        ticLength = this.PREFERRED_TICS[t];

        curTicTc = Math.max( -1,(Math.ceil( tcin / ticLength ) - curNbTics) ) * ticLength;

        tcout = Math.min( tcout + duration,this.mediaDuration );
        var pos = 0;
        // clear all labels
        this.container.empty();

        this.container.attr( 'data-duration',duration );
        do
        {
            curTicTc += ticLength;
            pos = (curTicTc - tcin) * 100 / duration;
            this.container.append( this.createTic( curTicTc,pos,this.getFormatTc( curTicTc,ticLength ) ) );
        }while (curTicTc < tcout);
        this.container.find( 'span.time' ).tooltip( this.tooltipConfiguration );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"updateSegments getWidth() : " + this.getWidth() + " preferredNbSegments :" + preferredNbSegments );
        }
    },
    /**
     * Return time code with preferred time format
     * @param {Number} tc ms
     * @param {Number} interval ms
     */
    getFormatTc : function (tc,interval)
    {
        tc = tc / 1000;
        interval = interval / 1000;
        var formatString = "";
        var minutes = Math.floor( tc / 60 );
        var hours = Math.floor( minutes / 60 );
        var seconds = Math.floor( tc % 60 );
        var milliseconds = tc % 60;
        minutes = Math.floor( minutes % 60 );
        minutes = (minutes >= 10) ? minutes : '0' + minutes;
        hours = (hours >= 10) ? hours : '0' + hours;
        seconds = (seconds >= 10) ? seconds : '0' + seconds;
        if (interval > 3600)
        {
            if (parseInt( hours ) === 0)
            {
                formatString = hours + '::' + minutes + ':' + seconds + ' m';
            }
            else
            {
                formatString = hours + 'h';
            }
        }
        else if (interval <= 3600 && interval >= 60)
        {
            if (parseInt( hours ) === 0)
            {
                formatString = minutes + ':' + seconds + ' m';
            }
            else
            {
                formatString = hours + ':' + minutes + ' h';
            }
        }
        else if (interval < 60 && interval > 1)
        {
            if (parseInt( hours ) !== 0 && parseInt( minutes ) === 0)
            {
                formatString = milliseconds.toFixed( 2 ).toString() + ' s';
            }
            else
            {
                formatString = minutes + ':' + seconds + ' m';
            }
        }
        else if (interval <= 1)
        {
            if (interval <= 0.001)
            {
                formatString = milliseconds.toFixed( 4 ).toString().split( '.' )[1] + ' ms';
            }
            else
            {
                formatString = seconds + "." + milliseconds.toFixed( 2 ).toString().split( '.' )[1] + ' s';
            }
        }

        return formatString;
    },
    /**
     * Fired on click at time code
     * @param {Object} event
     */
    onClick : function (event)
    {
        var target = $( event.target );
        event.preventDefault();
        if (target.hasClass( 'time' ))
        {
            var tc = parseFloat( target.attr( 'data-tc' ) );
            if (typeof tc === "number")
            {
                event.data.self.container.trigger( event.data.self.Class.eventTypes.CLICK,{
                    tc : tc / 1000
                } );
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.trace( event.data.self.Class.fullName,"onClick tc:" + tc );
                }
            }
        }
    },
    /**
     * Fired on drag event
     * @param {Object} event
     * @param {Object} ui
     */
    onDrag : function (event,ui)
    {
        var targetElement = $( event.target );
        var firstElementPos = Math.abs( parseInt( targetElement.find( '.time-grid' ).first().position().left ) ); // Valeur
        // absolue
        var lastElementPos = parseInt( targetElement.find( '.time-grid' ).last().position().left );
        var newPosition = ui.position;
        // On bloque le déplacement au première et dernière element
        if (ui.position.left > firstElementPos)
        {
            newPosition.left = firstElementPos;
        }
        else if (targetElement.width() - lastElementPos > ui.position.left)
        {
            newPosition.left = targetElement.width() - lastElementPos;
        }

        return newPosition;
    },
    /**
     * Fired on drag stop event
     * @param {Object} event
     * @param {Object} ui
     */
    onDragStop : function (event,ui)
    {
        var targetElement = $( event.target );
        var tcin = parseFloat( targetElement.attr( 'data-tcin' ) );
        var tcout = parseFloat( targetElement.attr( 'data-tcout' ) );
        var duration = tcout - tcin;
        var movePos = Math.abs( ui.position.left );
        var movPersentage = (movePos * 100) / targetElement.width();
        var movDuration = Math.round( (duration * movPersentage) / 100 );
        tcin = (ui.position.left > 0) ? tcin - movDuration : tcin + movDuration;
        tcout = tcin + duration;

        if (typeof tcin === "number" && typeof tcout === "number")
        {
            // reinisialise la position
            targetElement.css( 'left',"0px" );
            event.data.self.container.trigger( event.data.self.Class.eventTypes.UPDATE_TC,{
                tcin : tcin,
                tcout : Math.min( event.data.self.mediaDuration,tcout )
            } );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onDragStop tcin:" + tcin + " tcout" + tcout );
            }
        }
    },
    /**
     * Fired on widows resize event
     * @param {Object} event
     */
    onWindowResize : function (event)
    {
        var target = $( event.target ).first();
        if (target.is( "div" ) === false)
        {
            event.data.self.updateSegments( event.data.self.currentTcin,event.data.self.currentTcout );
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onWindowResize " );
        }
    }
} );
