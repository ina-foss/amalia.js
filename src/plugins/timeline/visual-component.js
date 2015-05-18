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
 * In charge to handle spatials component
 * @class VisualComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent( "fr.ina.amalia.player.plugins.timeline.VisualComponent",{
    ComponentClassCss : "visual-component",
    ComponentModuleClassCss : "module-visual",
    COMPONENT_NAME : 'visual',
    STYLE_CLASSNAME_BIND_ON : 'ajs-icon-eye-on',
    STYLE_CLASSNAME_BIND_OFF : 'ajs-icon-eye-off',
    eventTypes : {
        DATA_CHANGE : "fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.DATA_CHANGE",
        BIND : "fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.BIND",
        UNBIND : "fr.ina.amalia.player.plugins.timeline.VisualComponent.eventTypes.UNBIND"
    }
},
{
    localisationManager : null,
    initialize : function ()
    {
        this._super();
        this.localisationManager = new fr.ina.amalia.player.LocalisationManager();
        this.mainContainer.on( 'click','.cuepoint',{
            self : this
        },
        this.onClickAtCuepoint );
    },
    createToolBar : function ()
    {
        var toolbarContainer = this._super();
        // expend bouton
        var bindBtn = this.createButton( fr.ina.amalia.player.PlayerMessage.PLUGIN_TIMELINE_LABEL_BIND,"bind-btn" );
        bindBtn.on( 'click',{
            self : this
        },
        this.onClickBindBtn );
        bindBtn.addClass( this.Class.STYLE_CLASSNAME_BIND_ON );
        toolbarContainer.append( bindBtn );
    },
    /**
     * In charge to add item
     * @method addItem
     * @param {Object} data
     */
    addItem : function (data)
    {
        var _itemContainer = null;
        var _selectedData = (data.hasOwnProperty( 'selected' ) && data.selected === true);
        var _title = (data.hasOwnProperty( 'label' ) === true && data.label !== '' && data.label !== null) ? data.label : '';
        var _lineContent = this.mainContainer.find( '.line-content' ).first();
        // global tc
        var _gtc = this.tcout - this.tcin;
        if (data.hasOwnProperty( 'tcin' ) && data.hasOwnProperty( 'tcout' ) && data.hasOwnProperty( 'sublocalisations' ) === true && data.sublocalisations !== null && data.sublocalisations.hasOwnProperty( 'localisation' ))
        {
            this.createSublocalisationSegments( _lineContent,data,_title,_selectedData );
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"addItem segment tcin: " + data.tcin + " tcout: " + data.tcout );
            }
        }
        else if (data.hasOwnProperty( 'tc' ))
        {
            var _tc = parseFloat( data.tc );
            var _percentPos = ((_tc - this.tcin) * 100) / _gtc;
            _title = (_title !== "") ? _title : 'Tc : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( _tc,this.settings.framerate,this.settings.timeFormat );
            if (_tc >= this.tcin && _tc <= this.tcout)
            {
                _itemContainer = this.createCuePointElement( _tc,_percentPos,_title,data.tclevel );
                _itemContainer.data( 'metadata',data );
                if (this.settings.editable === true)
                {
                    // draggable
                    _itemContainer.draggable( {
                        axis : "x",
                        drag : function (event,ui)
                        {
                            var targetElement = $( event.target );
                            var parentElement = targetElement.parent();
                            var newLeft = Math.max( 0,ui.position.left );
                            ui.position.left = Math.min( parentElement.first().width(),newLeft );
                        }
                    } );
                    _itemContainer.on( "dragstop",{
                        self : this
                    },
                    this.onCuepointDragStop );
                    _itemContainer.css( "position","absolute" );

                }
                if (_selectedData)
                {
                    _itemContainer.addClass( 'selected' );
                    if (data.hasOwnProperty( 'formCreated' ) && data.formCreated === false)
                    {
                        this.mainContainer.trigger( this.Class.CLICK_SELECT,{
                            tc : _tc,
                            metadata : data
                        } );
                    }
                }
                _lineContent.append( _itemContainer );
            }
            if (this.logger !== null)
            {
                this.logger.trace( this.Class.fullName,"addItem cuepoint tcin:  tc:" + data.tc );
            }
        }
    },
    createSublocalisationSegments : function (lineContent,data,title)
    {
        this.localisationManager.setLoc( data.sublocalisations.localisation );
        var locTc = this.localisationManager.getLocTc();
        if (locTc !== null) {
            //update main tc
            data.tcin = locTc.tcin;
            data.tcout = locTc.tcout;
            var _startTc = parseFloat( locTc.tcin );
            var _endTc = parseFloat( locTc.tcout );
            var localisation = data.sublocalisations.localisation;
            var _gtc = this.tcout - this.tcin;
            var percentWidth = ((_endTc - _startTc) * 100) / _gtc;
            var percentLeft = ((_startTc - this.tcin) * 100) / _gtc;
            var color = (this.settings.color !== "") ? 'color:' + this.settings.color + '; background-color:' + this.settings.color + ';' : '';
            var container = $( '<div>',{
                class : 'item segment marker',
                style : 'left: ' + percentLeft + '%; width:' + percentWidth + '%;' + color,
                title : 'Tc in: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( _startTc,25,'ms' ) + '\n Tc out: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( _endTc,25,'ms' ),
                'data-tc' : _startTc,
                'data-tcin' : _startTc,
                'data-tcout' : _endTc
            } );
            lineContent.append( container );
            container.data('metadata',data);

            var _itemContainer = null;
            for (var i = 0;
                i < localisation.length;
                i++)
            {
                var _tc = localisation[i].tc;
                var _percentPos = ((_tc - _startTc) * 100) / (_endTc - _startTc);
                title = (title !== "") ? title : 'Tc: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( _tc,this.settings.framerate,this.settings.timeFormat );
                _itemContainer = this.createCuePointElement( _tc,_percentPos,title );
                _itemContainer.data( 'metadata',localisation[i] );
                _itemContainer.draggable( {
                    axis : "x",
                    drag : this.onItemDrag
                } );
                _itemContainer.on( "dragstop",{
                    self : this
                },
                this.onSegmentDragStop );
                container.append( _itemContainer );
            }

            if (percentWidth < 100)
            {
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
                this.onShiftDragStop );
            }
        }
    },
    /**
     * In charge to crate the cue point
     * @param {Number} tc time code
     * @param {Number} percentPos
     * @param {String} title
     * @param {Number} level
     * @return {Object} element
     */
    createCuePointElement : function (tc,percentPos,title,level)
    {
        var color = (typeof this.settings.color !== "undefined" && this.settings.color !== "") ? this.settings.color : '#3cf';
        var icon = (typeof this.settings.icon !== "undefined" && this.settings.icon !== "") ? this.settings.icon : 'circle';
        var container = $( '<i>',{
            'class' : 'item cuepoint ajs-icon ajs-icon-' + icon,
            'style' : 'left: ' + percentPos + '%; color:' + color + ';',
            'title' : title,
            'data-tc' : tc,
            'data-tclevel' : level
        } );

        return container;
    },
    /**
     * In charge to remove items
     * @method removeItems
     */
    removeItems : function ()
    {
        var lineContent = this.mainContainer.find( '.line-content' ).first();
        lineContent.find( '.item' ).remove();
    },
    /**
     * Fired on click event at the cue point
     * @method onClickAtSegment
     * @param {Object} event
     * @event fr.ina.amalia.player.components.CuepointsComponent.eventTypes.CLICK
     */
    onClickAtCuepoint : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tc = parseFloat( currentTarget.data( 'tc' ) );
        var data = $( event.currentTarget ).data( 'metadata' );
        // Ctrl+Click
        if (event.ctrlKey && data.selected !== true && event.data.self.settings.editable === true)
        {
            data.selected = true;
            data.formCreated = false;
            currentTarget.addClass( 'selected' );
            event.data.self.mainContainer.trigger( event.data.self.Class.CLICK_SELECT,{
                tc : tc,
                metadata : data
            } );
        }
        else
        {
            event.data.self.mainContainer.trigger( event.data.self.Class.CLICK_TC,{
                tc : tc
            } );
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onClickAtCuepoint tc:" + tc );
        }
    },
    /**
     * Fired on drag stop event
     * @method onDragStop
     * @param {Object} event
     */
    onCuepointDragStop : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tc = parseFloat( ((event.data.self.tcout - event.data.self.tcin) * currentTarget.position().left) / event.data.self.mainContainer.first().width() );
        $( event.currentTarget ).data( 'metadata' ).tc = Math.max( 0,tc );
        $( event.currentTarget ).data( 'metadata' ).tcin = Math.max( 0,tc );
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.DATA_CHANGE,{
            id : event.data.self.getMetadataId()
        } );
    },
    /**
     * Fired on drag stop event
     * @method onDragStop
     * @param {Object} event
     */
    onSegmentDragStop : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tc = parseFloat( ((event.data.self.tcout - event.data.self.tcin) * (currentTarget.parent().position().left + currentTarget.position().left)) / event.data.self.mainContainer.first().width() ) + event.data.self.tcin;
        //Set Tc
        $( event.currentTarget ).data( 'metadata' ).tc = Math.max( 0,tc );

        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.DATA_CHANGE,{
            id : event.data.self.getMetadataId()
        } );
    },
    /**
     * Fired on drag stop event
     * @method onShiftDragStop
     * @param {Object} event
     */
    onShiftDragStop : function (event)
    {
        var currentTarget = $( event.currentTarget );
        var tcin = parseFloat( ((event.data.self.tcout - event.data.self.tcin) * (currentTarget.parent().position().left + currentTarget.position().left)) / event.data.self.mainContainer.first().width() ) + event.data.self.tcin;
        //Shift tcin
        event.data.self.localisationManager.shiftSpacialLocBlock(currentTarget.data( 'metadata' ),tcin);
        
        event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.DATA_CHANGE,{
            id : event.data.self.getMetadataId()
        } );
    },
    /**
     * Fired on click to bind button
     * @method onClickBindBtn
     * @param {Object} event
     */
    onClickBindBtn : function (event)
    {
        var currentTarget = $( event.currentTarget );
        if (currentTarget.hasClass( event.data.self.Class.STYLE_CLASSNAME_BIND_ON ))
        {
            currentTarget.removeClass( event.data.self.Class.STYLE_CLASSNAME_BIND_ON ).addClass( event.data.self.Class.STYLE_CLASSNAME_BIND_OFF );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onClickBindBtn UNBIND:" + event.data.self.getMetadataId() );
            }
            event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.UNBIND,{
                id : event.data.self.getMetadataId()
            } );
        }
        else if (currentTarget.hasClass( event.data.self.Class.STYLE_CLASSNAME_BIND_OFF ))
        {
            currentTarget.removeClass( event.data.self.Class.STYLE_CLASSNAME_BIND_OFF ).addClass( event.data.self.Class.STYLE_CLASSNAME_BIND_ON );
            if (event.data.self.logger !== null)
            {
                event.data.self.logger.trace( event.data.self.Class.fullName,"onClickBindBtn BIND:" + event.data.self.getMetadataId() );
            }
            event.data.self.mainContainer.trigger( event.data.self.Class.eventTypes.BIND,{
                id : event.data.self.getMetadataId()
            } );
        }
    },
    onItemDrag : function (event,ui)
    {
        var targetElement = $( event.target );
        var parentElement = targetElement.parent();
        var newLeft = ui.position.left;
        var metadata = targetElement.data( 'metadata' );
        if (metadata.hasOwnProperty( 'firstItem' ) && metadata.firstItem === true)
        {
            newLeft = Math.max( -parentElement.first().offset().left + targetElement.width(),ui.position.left );
            ui.position.left = Math.min( parentElement.first().width(),newLeft );
        }
        else if (metadata.hasOwnProperty( 'lastItem' ) && metadata.lastItem === true)
        {
            var maxLeftPos = parentElement.first().parent().width() - parentElement.first().offset().left + targetElement.width();
            newLeft = Math.max( 0,newLeft );
            ui.position.left = Math.min( newLeft,maxLeftPos );
        }
        else
        {
            newLeft = Math.max( 0,newLeft );
            ui.position.left = Math.min( parentElement.first().width(),newLeft );
        }
    }
} );
