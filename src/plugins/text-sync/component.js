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
 * In charge to text sync block element
 * @class Component
 * @namespace fr.ina.amalia.player.components
 * @module plugin
 * @submodule plugin-text-sync
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
$.Class( "fr.ina.amalia.player.plugins.textSyncPlugin.Component",{
    ComponentClassCss : "line-component",
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.textSyncPlugin.Component.event.click"
    }
},
{
    /**
     * Defines configuration
     * @property settings
     * @type {Object}
     * @default {}
     */
    settings : {},
    /**
     * In charge to render messages in the web console output
     * @property logger
     * @type {Object}
     * @default null
     */
    logger : null,
    /**
     * Component container
     * @property mainContainer
     * @type {Object}
     * @default null
     */
    mainContainer : null,
    /**
     * Tootip configuration
     * @property tooltipConfiguration
     * @type {Object}
     * @default {}
     */
    tooltipConfiguration : {
        position : {
            my : "left+10 center",
            at : "right center",
            delay : 3000,
            using : function (position,feedback)
            {
                $( this ).css( position );
                $( "<div>" ).addClass( feedback.vertical ).addClass( feedback.horizontal ).appendTo( this );
            }
        }
    },
    /**
     * In charge to init class
     * @constructor
     * @method init
     * @param {Object} settings
     */
    init : function (settings)
    {
        this.settings = $.extend( {
            debug : false,
            framerate : '25',
            container : ''
        },
        settings || {} );
        if (typeof fr.ina.amalia.player.log !== "undefined" && typeof fr.ina.amalia.player.log.LogHandler !== "undefined")
        {
            this.logger = new fr.ina.amalia.player.log.LogHandler( {
                enabled : this.settings.debug
            } );
        }
        this.mainContainer = this.settings.container;
        if (this.mainContainer.length === 0 || typeof this.mainContainer !== "object")
        {
            throw new Error( "Your container is empty." );
        }
        this.initialize();
    },
    /**
     * Initialize the class and add style name to the main container
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
    },
    /**
     * In charge to create one line of text-sync component
     * @method createLine
     * @param {Number} tcin
     * @param {Number} tcout
     * @param {String} label
     * @param {String} text
     * @param {String} thumb
     */
    createLine : function (tcin,tcout,label,text,thumb)
    {
        var line = $( '<li>',{
            'class' : 'line media',
            'data-tcin' : tcin,
            'data-tcout' : tcout
        } );
        var leftBlock = $( '<div>',{
            class : 'info pull-left'
        } );
        // thumb
        thumb = (thumb !== null && typeof thumb !== "undefined" ) ? 'background-image:url("' + thumb + '");':'';
        var imgContainer = $( '<div>',{
            class : 'thumb',
            'data-tc' : tcin,
            style : thumb
        } );
        leftBlock.append( imgContainer );
        imgContainer.on( 'click',{
            self : this
        },
        this.onClickAtTc );

        var tcinContainer = $( '<time>',{
            class : 'tcin badge',
            title : 'Tc in',
            'data-tc' : tcin,
            text : fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tcin,this.settings.framerate,"s" )
        } ).tooltip( this.tooltipConfiguration ).on( 'click',{
            self : this
        },
        this.onClickAtTc );

        var tcoutContainer = $( '<time>',{
            class : 'tcout badge',
            title : 'Tc out',
            'data-tc' : tcout,
            text : fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tcout,this.settings.framerate,"s" )
        } ).tooltip( this.tooltipConfiguration ).on( 'click',{
            self : this
        },
        this.onClickAtTc );

        var progressbarContainer = $( '<div>',{
            class : 'ajs-progress'
        } ).hide();
        var progressBar = $( '<div>',{
            class : 'ajs-progress-bar',
            style : 'width:0%;'
        } );
        progressbarContainer.append( progressBar );
        leftBlock.append( tcinContainer );
        leftBlock.append( tcoutContainer );
        var contentBlock = $( '<div>',{
            'class' : 'content'
        } );
        if (label !== null)
        {
            var labelContainer = $( '<label>',{
                'class' : 'heading',
                text : label
            } );
            contentBlock.append( labelContainer );
        }
        this.textContainer = $( '<p>',{
            'class' : 'text'
        } );
        if (typeof text === 'string')
        {
            this.textContainer.text( text );
        }
        else
        {
            this.textContainer.append( text );
        }
        contentBlock.append( this.textContainer );
        contentBlock.append( progressbarContainer );
        line.append( leftBlock );
        line.append( contentBlock );

        this.mainContainer.append( line );
    },
    /**
     * In charge to add text in text container
     * @method addText
     * @param {String} text
     */
    addText : function (text)
    {
        if (this.textContainer !== null)
        {
            this.textContainer.append( text );
        }
    },
    /** events* */
    /**
     * Fired when click event of text container
     * @method onClickAtSegment
     * @param {Object} event
     * @event fr.ina.amalia.player.components.CuepointsComponent.eventTypes.CLICK
     */
    onClickAtTc : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tc = parseFloat( currentTarget.attr( 'data-tc' ) );
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CLICK,{
            tc : tc
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickAtCuepoint tc:" + tc );
        }
    }
} );
