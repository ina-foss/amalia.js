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
 * In charge to handle segment component
 * @class SegmentsComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent( "fr.ina.amalia.player.plugins.timeline.SegmentsComponent",{
    ComponentClassCss : "segments-component",
    ComponentModuleClassCss : "module-segments",
    COMPONENT_NAME : 'segment',
    eventTypes : {
        DATA_CHANGE : "fr.ina.amalia.player.plugins.timeline.SegmentsComponent.eventTypes.DATA_CHANGE"
    }
},
{
    initialize : function ()
    {
        this._super();

        this.mainContainer.on( 'click','.segment',{
            self : this
        },
        this.onClickAtSegment );
    },
    /**
     * In charge to create segment element
     * @method createSegmentElement
     * @param {Number} tcin time code
     * @param {Number} tcout
     * @param {Number} percentWidth
     * @param {Number} width
     * @param {String} title
     * @return {Object} Dom
     */
    createSegmentElement : function (tcin,tcout,percentWidth,width,title)
    {
        var color = (this.settings.color !== "") ? 'color:' + this.settings.color + '; background-color:' + this.settings.color + ';' : '';

        var styleClass = (this.settings.marker === true) ? 'item segment marker' : 'item segment';
        var container = $( '<div>',{
            class : styleClass,
            style : 'left: ' + percentWidth + '%; width:' + width + '%;' + color,
            title : title,
            'data-tc' : tcin,
            'data-tcin' : tcin,
            'data-tcout' : tcout
        } );
        // Le composant sera dragable pour le mode édition
        if (this.settings.editable === true)
        {
            // resizable
            container.resizable( {
                handles : 'e,w',
                ghost : true,
                helper : "ui-resizable-helper",
                start : function (event,ui)
                {
                    var parentElement = $( event.target ).parent();
                    var maxWidth = parentElement.width() - ui.element.position().left;
                    // Limit la largeur max
                    $( event.target ).resizable( "option","maxWidth",maxWidth );
                }
            } );
            container.on( "resizestop",{
                self : this
            },
            this.onResizeStop );
            // draggable
            container.draggable( {
                axis : "x",
                drag : function (event,ui)
                {
                    var targetElement = $( event.target );
                    var parentElement = targetElement.parent();
                    var newLeft = Math.max( 0,ui.position.left );
                    ui.position.left = Math.min( parentElement.first().width() - targetElement.width(),newLeft );
                }
            } );
            container.on( "dragstop",{
                self : this
            },
            this.onDragStop );
            container.css( "position","absolute" );
        }
        return container;
    },
    /**
     * In charge to add item
     * @method addItem
     * @param {Object} data
     */
    addItem : function (data)
    {
        if (data.hasOwnProperty( 'tcin' ) && data.hasOwnProperty( 'tcout' ))
        {
            var itemTcin = parseFloat( data.tcin );
            var itemTcout = parseFloat( data.tcout );
            // global tc
            var gtc = this.tcout - this.tcin;
            var width = ((itemTcout - itemTcin) * 100) / gtc;
            var percentWidth = ((itemTcin - this.tcin) * 100) / gtc;
            var title = null;
            var selectedData = (data.hasOwnProperty( 'selected' ) && data.selected === true);
            if ((data.hasOwnProperty( 'label' ) === true && data.label !== '' && data.label !== null))
            {
                title = data.label;
            }
            else
            {
                title = 'Tc in: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( itemTcin,25,'ms' ) + '\n Tc out: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( itemTcout,25,'ms' );
            }

            var lineContent = this.mainContainer.find( '.line-content' ).first();
            var itemContainer = null;
            if (itemTcin < this.tcout && itemTcout > this.tcin)
            {
                itemContainer = this.createSegmentElement( itemTcin,itemTcout,percentWidth,width,title );
                itemContainer.data( 'metadata',data );
                if (selectedData)
                {
                    if (data.hasOwnProperty( 'formCreated' ) && data.formCreated === false)
                    {
                        this.mainContainer.trigger( this.Class.CLICK_SELECT,{
                            tc : itemTcin,
                            metadata : data
                        } );
                    }
                    itemContainer.addClass( 'selected' );
                }
                //set type
                if (data.hasOwnProperty( 'type' ) && data.type !== null)
                {
                    itemContainer.attr( 'data-item-type',data.type );
                }
                lineContent.append( itemContainer );
                if (this.logger !== null)
                {
                    this.logger.trace( this.Class.fullName,"addItem tcin: " + this.tcin + " tcout: " + this.tcout + " itemTcin:" + itemTcin + " itemTcout:" + itemTcout + " percentWidth:" + percentWidth );
                }
            }
        }
    },
    /**
     * In charge to remove items
     * @method removeItems
     */
    removeItems : function ()
    {
        var lineContent = this.mainContainer.find( '.line-content' ).first();
        lineContent.find( '.segment' ).remove();
    },
    /**
     * Fired on click event
     * @method onClickAtSegment
     * @param {Object} event
     * @event fr.ina.amalia.player.components.SegmentsComponent.eventTypes.CLICK
     */
    onClickAtSegment : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tcin = parseFloat( currentTarget.data( 'tcin' ) );
        var data = $( event.currentTarget ).data( 'metadata' );
        // Ctrl+Click
        if (event.ctrlKey && data.selected !== true && event.data.self.settings.editable === true)
        {
            data.selected = true;
            data.formCreated = false;
            currentTarget.addClass( 'selected' );
            event.data.self.mainContainer.trigger( event.data.self.Class.CLICK_SELECT,{
                tc : tcin,
                metadata : data
            } );
        }
        else
        {
            event.data.self.mainContainer.trigger( event.data.self.Class.CLICK_TC,{
                tc : tcin
            } );
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickAtSegment tcin:" + tcin );
        }
    },
    /**
     * Fired on drag stop event
     * @method onDragStop
     * @param {Object} event
     */
    onDragStop : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tcin = parseFloat( ((event.data.self.zTcout - event.data.self.zTcin) * currentTarget.position().left) / event.data.self.mainContainer.first().width() ) + event.data.self.zTcin;
        var tcout = parseFloat( ((event.data.self.zTcout - event.data.self.zTcin) * currentTarget.width()) / event.data.self.mainContainer.first().width() ) + tcin;
        $( event.currentTarget ).data( 'metadata' ).tcin = Math.max( 0,tcin );
        $( event.currentTarget ).data( 'metadata' ).tcout = Math.min( event.data.self.zTcout,tcout );
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.DATA_CHANGE,{
            id : event.data.self.getMetadataId()
        } );
    },
    /**
     * Fired on resize stop event
     * @method onResizeStop
     * @param {Object} event
     */
    onResizeStop : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tcin = parseFloat( ((event.data.self.zTcout - event.data.self.zTcin) * currentTarget.position().left) / event.data.self.mainContainer.first().width() ) + event.data.self.zTcin;
        var tcout = tcin + parseFloat( ((event.data.self.zTcout - event.data.self.zTcin) * currentTarget.width()) / event.data.self.mainContainer.first().width() );
        $( event.currentTarget ).data( 'metadata' ).tcin = Math.max( 0,tcin );
        $( event.currentTarget ).data( 'metadata' ).tcout = Math.min( event.data.self.zTcout,tcout );

        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.DATA_CHANGE,{
            id : event.data.self.getMetadataId()
        } );
    }
} );
