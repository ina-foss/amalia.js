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
 * In charge to handle image component
 * @class ImagesComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent.extend( "fr.ina.amalia.player.plugins.timeline.ImagesComponent",{
    ComponentClassCss : "images-component",
    ComponentModuleClassCss : "module-images",
    COMPONENT_NAME : 'image',
    eventTypes : {
    }
},
{
    /**
     * Tool tip configuration
     * @property timeZoomComponent
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
                $( "<div>" ).addClass( "ajs-arrow" ).addClass( "timeline-images-component" ).addClass( feedback.vertical ).addClass( feedback.horizontal ).appendTo( this );
            }
        },
        content : function ()
        {
            var element = $( this );
            var title = element.attr( 'title' );
            if (element.is( "[data-src]" ))
            {
                var src = element.attr( 'data-src' );
                return "<img class='timeline-images-component tooltip-image' alt='" + title + "' src='" + src + "' />";
            }
            else
            {
                title = title.replace( /(?:\r\n|\r|\n)/g,'<br />' );
                return "<p>" + title + "</p>";
            }

        }
    },
    initialize : function ()
    {
        this._super();
        this.mainContainer.on( 'click','.image',{
            self : this
        },
        this.onClickAtImage );
    },
    /**
     * In charge to create image element
     * @method createImageElement
     * @param {Number} tcin timecode
     * @param {Number} tcout
     * @param {Number} percentWidth
     * @param {Number} width
     * @param {String} title
     * @param {String} image
     * @param {Number} level
     * @return {Object} dom
     */
    createImageElement : function (tcin,tcout,percentWidth,width,title,image,level)
    {
        var imageContainer = $( '<img>',{
            src : image,
            class : 'content',
            title : title,
            'data-src' : image
        } ).tooltip( this.tooltipConfiguration );
        var imageElement = null;
        if (tcout !== null)
        {
            var flowline = $( '<hr>',{
                class : 'flow',
                style : 'border-color:' + this.settings.color + '; color:' + this.settings.color + ';'
            } );
            imageElement = $( '<div>',{
                class : 'item image segment',
                style : 'left: ' + percentWidth + '%; width:' + width + '%;',
                title : title,
                'data-tc' : tcin,
                'data-tclevel' : level,
                'data-tcin' : tcin,
                'data-tcout' : tcout
            } ).append( flowline );

            if (width > parseInt( this.settings.pointTogglePercentHeight ))
            {
                imageElement.append( imageContainer );
            }
            else
            {
                imageElement.tooltip( this.tooltipConfiguration );
            }
        }
        else
        {
            imageElement = $( '<div>',{
                class : 'item image',
                style : 'left: ' + percentWidth + '%; margin-left:-' + this.settings.offset + 'px;',
                title : title,
                'data-tc' : tcin,
                'data-tclevel' : level
            } ).append( imageContainer );
        }
        // add image
        imageElement.on( "mouseenter mouseleave",function (e)
        {
            if (e.type === "mouseenter")
            {
                $( e.currentTarget ).parent().find( '.image' ).css( 'opacity','.3' );
                $( e.currentTarget ).addClass( 'on' ).css( 'opacity','1' );
            }
            else
            {
                $( e.currentTarget ).parent().find( '.image' ).css( 'opacity','1' );
                $( e.currentTarget ).removeClass( 'on' ).css( 'opacity','1' );
            }
        } );
        return imageElement;
    },
    /**
     * In charge to add element
     * @param {Object} data
     */
    addItem : function (data)
    {
        var percentWidth = null;
        var title = null;
        var lineContent = null;
        // global tc
        var gtc = this.tcout - this.tcin;
        var thumb = (data.hasOwnProperty( 'thumb' ) === true && data.thumb !== '' && data.thumb !== null) ? data.thumb : '';
        if (data.hasOwnProperty( 'tcin' ) && data.hasOwnProperty( 'tcout' ))
        {
            var itemTcin = parseFloat( data.tcin );
            var itemTcout = parseFloat( data.tcout );
            var width = ((itemTcout - itemTcin) * 100) / gtc;
            percentWidth = ((itemTcin - this.tcin) * 100) / gtc;

            // if data has label
            if (data.hasOwnProperty( 'label' ) === true && data.label !== '' && data.label !== null)
            {
                title = data.label;
            }
            else
            {
                title = 'Tc in: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( itemTcin,25,'ms' ) + '\n Tc out: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( itemTcout,25,'ms' );
            }

            lineContent = this.mainContainer.find( '.line-content' ).first();
            if (itemTcin >= this.tcin && itemTcin <= this.tcout)
            {
                lineContent.append( this.createImageElement( itemTcin,itemTcout,percentWidth,width,title,thumb,data.tclevel ) );
                if (this.logger !== null)
                {
                    this.logger.trace( this.Class.fullName,"addItem tcin: " + this.tcin + " tcout: " + this.tcout + " itemTcin:" + itemTcin + " itemTcout:" + itemTcout + " percentWidth:" + percentWidth );
                }
            }
        }
        else if (data.hasOwnProperty( 'tc' ))
        {
            var tc = parseFloat( data.tc );
            percentWidth = ((tc - this.tcin) * 100) / gtc;
            title = (data.hasOwnProperty( 'label' ) === true && data.label !== '' && data.label !== null) ? data.label : fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tc,25,'ms' );
            lineContent = this.mainContainer.find( '.line-content' ).first();

            if (tc >= this.tcin && tc <= this.tcout)
            {
                lineContent.append( this.createImageElement( tc,null,percentWidth,null,title,thumb,data.tclevel ) );
                if (this.logger !== null)
                {
                    this.logger.trace( this.Class.fullName,"addItem tc: " + tc );
                }
            }
        }
    },
    /**
     * In charge to remover all elements
     */
    removeItems : function ()
    {
        this.mainContainer.find( '.line-content' ).first().find( '.image' ).remove();
    },
    /**
     * Fired on click event
     * @method onClickAtImage
     * @param {Object} event
     * @event fr.ina.amalia.player.components.ImagesComponent.eventTypes.CLICK
     */
    onClickAtImage : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tcin = parseFloat( currentTarget.data( 'tc' ) );
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.CLICK_TC,{
            tc : tcin
        } );
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickAtImage tcin:" + tcin );
        }
    }
} );
