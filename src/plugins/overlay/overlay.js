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
 * In charge of the overlay plugin
 * @class OverlayPlugin
 * @namespace fr.ina.amalia.player.plugins.overlay
 * @module plugin
 * @submodule plugin-overlay
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.extend( "fr.ina.amalia.player.plugins.OverlayPlugin",{
    classCss : "ajs-plugin plugin-overlay",
    eventTypes : {
        CLICK : "fr.ina.amalia.player.plugins.OverlayPlugin.eventTypes.CLICK"
    }
},
{
    /**
     * Instance of spatial data parser
     * @property spatialsDataParser
     * @type {Object}
     * @default null
     */
    spatialsDataParser : null,
    /**
     * Parsed spatial data
     * @property spatialsData
     * @type {Object}
     * @default null
     */
    spatialsData : null,
    /**
     * Parsed spatial data
     * @property seekSpatialsData
     * @type {Object}
     * @default null
     */
    seekSpatialsData : null,
    /**
     * Main container
     * @property container
     * @type {Object}
     * @default null
     */
    container : null,
    /**
     * Instance of raphelsjs
     * @property canvas
     * @type {Object}
     * @default null
     */
    canvas : null,
    /**
     * Selected metadata id provide by player core.
     * @property loadDataStarted
     * @default ''
     */
    selectedMetadataId : '',
    /**
     * Instance of metadata manager
     * @property metadataManager
     * @default null
     */
    metadataManager : null,
    /**
     * erase state
     * @property eraseState
     * @type {Boolean}
     * @default null
     */
    eraseState : false,
    /**
     * Last selected form
     * @property selectedShape
     * @type {Boolean}
     * @default null
     */
    selectedShape : null,
    /**
     * True when do draw
     * @property doDraw
     * @type {Object}
     * @default false
     */
    doDraw : false,
    /**
     * True when drawing
     * @property drawing
     * @type {Object}
     * @default false
     */
    drawing : false,
    /**
     * drawingHandler
     * @property drawingHandler
     * @type {Object}
     * @default null
     */
    drawingHandler : null,
    /**
     * Initialize plugin and create container for this plugin
     * @method initializeOnLoadStart
     */
    initialize : function ()
    {
        this.listOfMetadataTypes = [
        ];
        this.notManagedMetadataIds = [
        ];
        this.managedMetadataIds = [
        ];
        this.doDraw = false;
        this.drawing = false;
        this.settings = $.extend( {
            offsetTime : 1,
            metadataId : '',
            editable : false,
            defaultSelectedShape : 'rectangle',
            lineDisplayMode : fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.METADATA_DISPLAY_TYPE.STATIC,
            callbacks : {}
        },
        this.settings.parameters || {} );
        this.container = $( '<div>',{
            'class' : this.Class.classCss
        } );
        this.pluginContainer.append( this.container );
        //Set default shape
        this.setSelectedShape( this.settings.defaultSelectedShape );
        this.canvas = null;
        // initialisation
        this.spatialsData = null;
        this.spatialsDataParser = new fr.ina.amalia.player.plugins.overlay.SpatialsDataParser( this.settings.parameters );
        this.definePlayerListeners();
    },
    /**
     * Fired on load start event
     * @method initializeOnLoadStart
     */
    initializeOnLoadStart : function ()
    {
        this.updateBlockData();
        this.pluginContainer.append( this.container );
        this.createCanvas();
        this.createContextMenuOption();
        this.metadataManager = this.mediaPlayer.getMetadataManager();
        if (this.settings.editable === true)
        {
            this.createToolBoxCtrl();
            this.createErrorContainer();
            this.createDoDrawRect();
            this.container.on( 'mousedown',{
                self : this
            },this.onMouseDown );
            this.container.on( 'mouseup',{
                self : this
            },this.onMouseUp );
            this.container.on( 'mousemove',{
                self : this
            },this.onMouseMove );
        }
    },
    /**
     * Set player events listener on the player
     * @method defineListeners
     */
    definePlayerListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        // Player events
        // L'événement sera déclenché une seul fois
        player.one( fr.ina.amalia.player.PlayerEventType.PLUGIN_READY,{
            self : this
        },
        this.onFirstTimechange );
        player.on( fr.ina.amalia.player.PlayerEventType.ENDEN,{
            self : this
        },
        this.onEnd );
        player.on( fr.ina.amalia.player.PlayerEventType.TIME_CHANGE,{
            self : this
        },
        this.onTimeupdate );
        player.on( fr.ina.amalia.player.PlayerEventType.SEEK,{
            self : this
        },
        this.onSeek );
        // call function 200 ms after resize is complete
        $( window ).on( 'debouncedresize',{
            self : this
        },
        this.onWindowResize );
        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            self : this
        },
        this.onSelectedMetadataChange );
        player.on( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            self : this
        },this.onDataChange );
        ///bind metadata
        player.on( fr.ina.amalia.player.PlayerEventType.BIND_METADATA,{
            self : this
        },this.onBindMetadata );
        player.on( fr.ina.amalia.player.PlayerEventType.UNBIND_METADATA,{
            self : this
        },this.onUnBindMetadata );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * Create context menu option
     * @method createContextMenuOption
     */
    createContextMenuOption : function ()
    {
        var item = this.mediaPlayer.addMenuItemWithLink( fr.ina.amalia.player.PlayerMessage.PLUGIN_OVERLAY_CONTEXT_MENU_ENABLED_DISABLED_PLUGIN,"#","presentation" );
        if (typeof item === "object")
        {
            $( item ).on( 'click',{
                self : this
            },
            function (e)
            {
                e.preventDefault();
                e.data.self.changeDisplayState();
            } );
        }
    },
    /**
     * Return true if is valid type
     * @returns {Boolean}
     */
    isValidMetadataType : function ()
    {
        var metadataType = this.getMetadataType();
        return (metadataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_TRACKING || metadataType === fr.ina.amalia.player.PluginBindingManager.dataTypes.VISUAL_DETECTION);
    },
    /**
     * In charge to toggle display container
     * @method changeDisplayState
     */
    changeDisplayState : function ()
    {
        if (this.container.is( ':visible' ))
        {
            this.container.hide();
        }
        else
        {
            this.container.show();
        }
    },
    /**
     * In charge to update block data
     */
    updateBlockData : function ()
    {
        // use settings metadata if not empty
        if (this.settings.metadataId !== '')
        {
            this.spatialsData = this.updateMetadata( this.settings.metadataId,0,this.mediaPlayer.getDuration() );
        }
        else
        {
            var listOfIds = this.getBindIds();
            this.spatialsData = [
            ];
            for (var i = 0;
                i < listOfIds.length;
                i++)
            {
                var spatialsData = this.updateMetadata( listOfIds[i],0,this.mediaPlayer.getDuration() );
                this.spatialsData = this.spatialsData.concat( spatialsData );
            }
        }
    },
    /**
     * In charge to get metadata by id,tcin and tcout
     * @param {String} metadataId
     * @param {Number} tcin
     * @param {Number} tcout
     */
    updateMetadata : function (metadataId,tcin,tcout)
    {
        var data = this.mediaPlayer.getMetadataWithRange( metadataId,tcin,tcout );
        return this.spatialsDataParser.parserSpacialMetadata( data,metadataId );
    },
    /**
     * In charge to update current time position
     * @method updatePos
     * @param {Number} currentTime
     */
    updatePos : function (currentTime)
    {
        if (typeof this.spatialsData !== "undefined" && this.spatialsData !== null && typeof this.spatialsData === "object" && this.spatialsData.length > 0)
        {
            currentTime = parseFloat( currentTime );
            // if paused get calculating seek position
            var isPaused = (this.mediaPlayer.isPaused());
            var displayData = isPaused ? this.getSeekDisplayItems( currentTime ) : this.getDisplayItems( currentTime );
            if (displayData.length > 0)
            {
                this.createObject( displayData,isPaused );
            }
        }
    },
    /**
     * Return display items
     * @method getDisplayItems
     * @param {Number} currentTime
     * @return {Array}
     */
    getDisplayItems : function (currentTime)
    {
        var item = null;
        var displayData = [
        ];
        for (var i = 0;
            i < this.spatialsData.length;
            i++)
        {
            item = this.spatialsData[i];
            if (typeof item === "object" && item.hasOwnProperty( 'tcin' ) && currentTime >= parseFloat( item.tcin ) && currentTime <= parseFloat( item.tcin ) + this.settings.offsetTime)
            {
                displayData.push( item );
                this.spatialsData.splice( i,1 );
            }
        }
        return displayData;
    },
    /**
     * In charge to create canvas
     * @method createCanvas
     */
    createCanvas : function ()
    {
        var videoSize = this.getVideoSize();
        var width = videoSize.w;
        var height = videoSize.h;
        this.canvas = new Raphael( this.container.get( 0 ),width,height );
        this.canvas.canvas.className.baseVal = "overlay-canvas";
        this.updateCanvasPosition();
        // Add event
        this.container.on( fr.ina.amalia.player.plugins.overlay.DrawBase.eventTypes.CLICK,{
            self : this
        },
        this.onClickAtObject );
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"CreateCanvas width:" + width + " height: " + height );
        }
    },
    /**
     * Return Video size
     * @method getVideoSize
     */
    getVideoSize : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        var videoHeight = player.get( 0 ).videoHeight;
        var videoWidth = player.get( 0 ).videoWidth;
        var widthRatio = player.width() / videoWidth;
        var heightRatio = player.height() / videoHeight;
        var ratio = Math.min( widthRatio,heightRatio );
        return {
            w : ratio * videoWidth,
            h : ratio * videoHeight
        };
    },
    /**
     * In charge to update canvas position
     * @method updateCanvasPosition
     */
    updateCanvasPosition : function ()
    {
        var videoSize = this.getVideoSize();
        var player = this.mediaPlayer.getMediaPlayer();
        this.container.find( '.overlay-canvas' ).css( {
            'left' : (player.width() - videoSize.w) / 2,
            'top' : (player.height() - videoSize.h) / 2
        } );
    },
    /**
     * In charge to create canvas object
     * @method createObject
     * @param {Object} data
     */
    createObject : function (data)
    {
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"createObject" );
            this.logger.info( data );
        }
        if (data !== null && typeof data !== "undefined")
        {
            var settings = $.extend( {
                canvas : this.canvas,
                container : this.container,
                debug : this.settings.debug
            },
            this.settings || {} );
            settings.editable = (this.settings.editable === true);
            var track = null;
            var object = null;
            if (typeof data === "object" && data.length > 0)
            {
                for (var i = 0;
                    i < data.length;
                    ++i)
                {
                    track = data[i];
                    if (track.hasOwnProperty( 'type' ))
                    {
                        if (track.type === "rectangle")
                        {
                            object = new fr.ina.amalia.player.plugins.overlay.DrawRect( settings,this.mediaPlayer,data[i] );
                        }
                        else if (track.type === "ellipse")
                        {
                            object = new fr.ina.amalia.player.plugins.overlay.DrawEllipse( settings,this.mediaPlayer,data[i] );
                        }
                        else
                        {
                            if (this.logger !== null)
                            {
                                this.logger.warn( this.Class.fullName + ": L'objet ne peut pas être interpreté." );
                            }
                        }
                    }
                }
            }
        }
        else
        {
            this.logger.error( "Error to create object" );
            this.logger.error( data );
        }
        return null;
    },
    /**
     * In charge to clear canvas
     * @method clearCanvas
     */
    clearCanvas : function ()
    {
        this.canvas.remove();
        this.createCanvas();
        this.spatialsData = this.spatialsDataParser.getData();
        this.createDoDrawRect();
        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"clearCanvas : " + this.spatialsData.length );
        }
    },
    /**
     * In charge to create toolbox element
     */
    createToolBoxCtrl : function ()
    {
        var _toolboxElement = $( '<div>',{
            'class' : 'toolbox'
        } ).draggable( {
            containment : "parent",
            scroll : false
        } );
        _toolboxElement.css( 'position','absolute' );
        _toolboxElement.append( this.createAddToolboxItem() );
        _toolboxElement.append( this.createEraserToolboxItem() );
        _toolboxElement.append( this.createNavCtrlToolboxItem() );
        //Add events display logic
        _toolboxElement.find( '.add-shapebox .add div.add-ctrl span.ctrl' ).on( 'click',{
            self : this
        },function (event) {
            event.data.self.openAddShape();
        } );
        _toolboxElement.find( '.add-shapebox .add div.add-selectFormBox div.close-box span.ctrl' ).on( 'click',{
            self : this
        },function (event) {
            event.data.self.closeAddShape();
        } );
        _toolboxElement.find( '.erase-box span.ctrl' ).on( 'click',{
            self : this
        },this.onClickToEraser );
        this.container.append( _toolboxElement );
    },
    /**
     * In charge to create add button and select form items
     * @method createAddToolboxItem
     */
    createAddToolboxItem : function ()
    {
        var _addShapeBox = $( '<div>',{
            'class' : 'add-shapebox'
        } );
        var _addBox = $( '<div>',{
            'class' : 'add'
        } );
        //Add Ctrl
        var _addCtrlBox = $( '<div>',{
            'class' : 'add-ctrl'
        } );
        var _addCtrl = $( '<span>',{
            'class' : 'ctrl ajs-icon ajs-icon-plus'
        } );
        _addCtrlBox.append( _addCtrl );
        _addBox.append( _addCtrlBox );
        // select form
        var _selectFormBox = $( '<div>',{
            'class' : 'add-selectFormBox'
        } ).hide();
        var _closeCtrlBox = $( '<div>',{
            'class' : 'close-box'
        } );
        var _closeCtrl = $( '<span>',{
            'class' : 'ctrl ajs-icon ajs-icon-remove'
        } );
        _closeCtrlBox.append( _closeCtrl );
        _selectFormBox.append( _closeCtrlBox );
        var _addShapeMsgBox = $( '<div>',{
            'class' : 'add-shape-msg',
            'text' : 'Sélectionnez une forme'
        } );
        _selectFormBox.append( _addShapeMsgBox );
        //Rect
        var _addShapeRectMsgBox = $( '<div>',{
            'class' : 'add-shape-rectangle'
        } );
        var _rectIcon = $( '<span>',{
            'class' : 'ajs-icon ajs-icon-stop'
        } ).on( 'click',{
            self : this
        },function (event) {
            event.data.self.setSelectedShape( 'rectangle' );
        } );
        _addShapeRectMsgBox.append( _rectIcon );
        _selectFormBox.append( _addShapeRectMsgBox );
        //Ellipse
        var _addShapeEllipseBox = $( '<div>',{
            'class' : 'add-shape-ellipse'
        } );
        var _ellipseIcon = $( '<span>',{
            'class' : 'ajs-icon ajs-icon-circle'
        } ).on( 'click',{
            self : this
        },function (event) {
            event.data.self.setSelectedShape( 'ellipse' );
        } );
        _addShapeEllipseBox.append( _ellipseIcon );
        _selectFormBox.append( _addShapeEllipseBox );
        _addBox.append( _selectFormBox );
        _addShapeBox.append( _addBox );
        return _addShapeBox;
    },
    /**
     * In charge to create eraser button
     * @method createAddToolboxItem
     */
    createEraserToolboxItem : function ()
    {
        //Erase Ctrl
        var _eraseCtrlBox = $( '<div>',{
            'class' : 'erase-box'
        } );
        var _eraseCtrl = $( '<span>',{
            'class' : 'ctrl ajs-icon ajs-icon-eraser'
        } );
        _eraseCtrlBox.append( _eraseCtrl );
        return _eraseCtrlBox;
    },
    /**
     * In charge to create nav button
     * @method createAddToolboxItem
     */
    createNavCtrlToolboxItem : function ()
    {
        //Nav Ctrl
        var _navBox = $( '<div>',{
            'class' : 'nav-box'
        } );
        //Left Ctrl
        var _leftCtrlBox = $( '<div>',{
            'class' : 'nav-left-box'
        } );
        var _leftCtrl = $( '<span>',{
            'class' : 'ctrl ajs-icon ajs-icon-chevron-left'
        } );
        _leftCtrlBox.append( _leftCtrl );
        _navBox.append( _leftCtrlBox );
        //Right Ctrl
        var _rightCtrlBox = $( '<div>',{
            'class' : 'nav-right-box'
        } );
        var _rightCtrl = $( '<span>',{
            'class' : 'ctrl ajs-icon ajs-icon-chevron-right'
        } );
        _rightCtrlBox.append( _rightCtrl );
        _navBox.append( _rightCtrlBox ).hide();
        return _navBox;
    },
    /**
     * In charge to create error container
     * @returns {undefined}
     */
    createErrorContainer : function ()
    {
        var errorContainer = $( '<div>',{
            'class' : 'error'
        } ).hide();
        this.container.append( errorContainer );
    },
    /**
     * In charge to set error message
     * @param {type} msg
     * @returns {plugin-overlay-editorAnonym$1.setErrorMsg.plugin-overlay-editorAnonym$9}
     */
    setErrorMsg : function (msg)
    {
        var message = $( '<span>',{
            'class' : 'msg',
            'text' : msg
        } );
        this.container.find( '.error' ).empty().append( message ).show();
    },
    /**
     * In charge to clear all error messages
     * @returns {undefined}
     */
    clearErrorMsg : function ()
    {
        this.container.find( '.error' ).empty().hide();
    },
    /**
     * In charge to open add shape block and select last used shape
     */
    openAddShape : function ()
    {
        if (this.startDraw())
        {
            var _toolboxElement = this.container.find( '.toolbox' );
            _toolboxElement.find( '.add .add-ctrl' ).hide();
            _toolboxElement.find( '.add .add-selectFormBox' ).show();
            _toolboxElement.find( '.add-selectFormBox div' ).removeClass( 'on' );
            _toolboxElement.find( '.add-selectFormBox div.add-shape-' + this.selectedShape ).addClass( 'on' );
            //erase
            _toolboxElement.find( '.erase-box' ).hide();
        }
    },
    /**
     * In charge to open add shape block and select last used shape
     */
    closeAddShape : function ()
    {
        var _toolboxElement = this.container.find( '.toolbox' );
        _toolboxElement.find( '.add .add-selectFormBox' ).hide();
        _toolboxElement.find( '.add div.add-ctrl' ).show();
        _toolboxElement.find( '.erase-box' ).show();
        this.endDraw();
    },
    /**
     * return  eraseState
     */
    getEraseState : function ()
    {
        return this.eraseState;
    },
    /**
     * set erase state
     * @param {type} val
     */
    setEraseState : function (val)
    {
        this.eraseState = val;
        this.container.find( '.toolbox' ).find( '.erase-box' ).toggleClass( 'on',val );
    },
    /**
     * Set shape
     * @param {String} shape
     */
    setSelectedShape : function (shape)
    {
        if ($.inArray( shape,this.listOfShapes ) > -1)
        {
            this.selectedShape = shape;
        }
        else
        {
            this.selectedShape = this.settings.defaultSelectedShape;
        }
        var _toolboxElement = this.container.find( '.toolbox' );
        _toolboxElement.find( '.add-selectFormBox div' ).removeClass( 'on' );
        _toolboxElement.find( '.add-selectFormBox div.add-shape-' + this.selectedShape ).addClass( 'on' );
    },
    /**
     * Return selected shape
     * @returns {plugin-overlay-editorAnonym$1.settings.selectedShape|String}
     */
    getSelectedShape : function ()
    {
        return this.selectedShape;
    },
    /**
     * Star draw object
     * @returns {undefined}
     */
    startDraw : function ()
    {
        if (this.getSelectedMetadataId() !== null)
        {
            if (this.isValidMetadataType())
            {
                this.doDraw = true;
                this.container.addClass( 'draw' );
                this.setEraseState( false );
                this.mediaPlayer.pause();
                return true;
            }
            else
            {
                this.setErrorMsg( fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA_ITEM_TYPE );
            }
        }
        else
        {
            this.setErrorMsg( fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA );
        }
        return false;
    },
    /**
     * Return metadata bock type
     * @returns {undefined}
     */
    getMetadataType : function ()
    {
        var metadataBlock = this.metadataManager.getBlockMetadata( this.getSelectedMetadataId() );
        if (metadataBlock !== null && metadataBlock.type !== "")
        {
            return metadataBlock.type;
        }
        return null;
    },
    /**
     * Return selected metadata id
     * @method getSelectedMetadataId
     */
    getSelectedMetadataId : function ()
    {
        return this.selectedMetadataId;
    },
    /**
     * Return selected metadata id
     * @method setSelectedMetadataId
     * @param metadataId
     */
    setSelectedMetadataId : function (metadataId)
    {
        if (typeof metadataId === "string")
        {
            this.selectedMetadataId = metadataId;
            this.clearErrorMsg();
        }
        else
        {
            this.selectedMetadataId = null;
        }
    },
    /**
     * End draw object
     * @returns {undefined}
     */
    endDraw : function ()
    {
        this.doDraw = false;
        this.container.removeClass( 'draw' );
        this.container.find( '.toolbox .add-ctrl' ).removeClass( 'on' );
        this.setEraseState( false );
    },
    /**
     * In charge to draw rect
     */
    createDoDrawRect : function ()
    {
        this.drawingHandler = this.canvas.rect( 0,0,10,10 );
        this.drawingHandler.fig = "DoDrawRect";
        this.drawingHandler.attr( {
            // Attributes of the element
            //"fill" : "#3cf",
            "stroke" : "#3cf"
        } );
        this.drawingHandler.toFront();
        this.drawingHandler.hide();
        this.drawingHandler.doDraw = {};
    },
    /**
     * In charge to draw shape
     * @param shapeType {String} shapeType
     * @param x {Number} x coordinate of specified position
     * @param y {Number} y coordinate of specified position
     * @param w {Number} w width
     * @param h {Number} h height
     */
    drawShape : function (shapeType,x,y,w,h) {
        var shape = null;
        if (shapeType === "ellipse")
        {
            shape = this.canvas.ellipse( x,y,w,h );
            shape.fig = "ellipse";
        }
        else
        {
            // default shape rectangle
            shape = this.canvas.rect( x,y,w,h );
            shape.fig = "rectangle";
        }

        if (shape)
        {
            shape.objectId = 'spatial_' + fr.ina.amalia.player.helpers.UtilitiesHelper.generateUUID();
            shape.attr( {
                // Attributes of the element
                //"fill" : "#dfed48",
                "stroke" : "#3cf"
            } );
            // Initial values of applied transforms
            shape.translate = [
                0,
                0
            ];
            shape.scale = [
                1,
                1
            ];
            shape.rotate = 0;
            shape.data.self = this;
            var transformConfig = {
                keepRatio : false,
                fill : 'black',
                draw : [
                    'bbox',
                    'circle'
                ],
                range : {
                    scale : [
                        0,
                        99999
                    ]
                }
            };
            // Add freeTransform
            var _ft = this.canvas.freeTransform( shape,transformConfig,this.onTransformationCallback );
            _ft.self = this;
            return shape;
        }
        return null;
    },
    /**
     * In charge to create data for shape
     * @param {Object} shape
     * @param {Object} shapePos
     */
    createDataShape : function (shape,shapePos)
    {
        var _player = this.mediaPlayer;
        var _data = {
            shape : shapePos,
            sublocalisations : null,
            tclevel : 0,
            thumb : null,
            type : null,
            tc : _player.getCurrentTime(),
            label : shape.hasOwnProperty( 'objectId' ) ? shape.objectId : ''
        };
        shape.data = _data;

        // Add data
        var refLoc = _player.addMetadataItem( this.getSelectedMetadataId(),_data );
        _data.refLoc = refLoc;
        return _data;
    },
    /**
     * In charge to refrech spatial data
     * @returns {undefined}
     */
    refreshSeekData : function ()
    {
        // use settings metadata if not empty
        if (this.settings.metadataId !== '')
        {
            this.seekSpatialsData = this.updateMetadata( this.settings.metadataId,0,this.mediaPlayer.getDuration() );
        }
        else
        {
            var listOfIds = this.getBindIds();
            this.seekSpatialsData = [
            ];
            for (var i = 0;
                i < listOfIds.length;
                i++)
            {
                var seekSpatialsData = this.updateMetadata( listOfIds[i],0,this.mediaPlayer.getDuration() );
                this.seekSpatialsData = this.seekSpatialsData.concat( seekSpatialsData );
            }
        }
    },
    /**
     * Return display items
     * @method getDisplayItems
     * @param {Number} currentTime
     * @return {Array}
     */
    getSeekDisplayItems : function (currentTime)
    {
        var item = null;
        var displayData = [
        ];
        if (this.seekSpatialsData !== null)
        {
            for (var i = 0;
                i < this.seekSpatialsData.length;
                i++)
            {
                item = this.seekSpatialsData[i];
                if (typeof item === "object" && item.hasOwnProperty( 'tcin' ) && item.hasOwnProperty( 'tcout' ) && currentTime >= parseFloat( item.tcin ) && currentTime <= parseFloat( item.tcout ))
                {
                    //reset by default value
                    item.start = jQuery.extend( true,{},this.seekSpatialsData[i].start );
                    var seekPos = this.spatialInterpolation( item.start,item.end,this.mediaPlayer.getCurrentTime() );
                    item.start.shape.c.x = seekPos.x;
                    item.start.shape.c.y = seekPos.y;
                    item.start.shape.rx = seekPos.rx;
                    item.start.shape.ry = seekPos.ry;

                    displayData.push( item );
                    this.seekSpatialsData.splice( i,1 );
                }
            }
        }
        return displayData;
    },
    /**
     * return position
     * @param {Number} ptcin
     * @param {Number} ptcout
     * @param {Number} tcin
     * @param {Number} tcout
     * @param {Number} tc
     * @returns {Number} position
     */
    linearInterpolation : function (ptcin,ptcout,tcin,tcout,tc)
    {
        return ptcin + ((ptcout - ptcin) / (tcout - tcin)) * (tc - tcin);
    },
    /**
     * Return sptial position
     * @param {Object} spi
     * @param {Object} spo
     * @param {Object} tc
     * param {String} type //TODO
     */
    spatialInterpolation : function (spi,spo,tc)
    {
        var _x = this.linearInterpolation( spi.shape.c.x,spo.shape.c.x,spi.tc,spo.tc,tc );
        var _y = this.linearInterpolation( spi.shape.c.y,spo.shape.c.y,spi.tc,spo.tc,tc );
        var _rx = this.linearInterpolation( spi.shape.rx,spo.shape.rx,spi.tc,spo.tc,tc );
        var _ry = this.linearInterpolation( spi.shape.ry,spo.shape.ry,spi.tc,spo.tc,tc );
        return {
            x : _x,
            y : _y,
            rx : _rx,
            ry : _ry
        };
    },
    // /**Player events**/
    /**
     * Fired when windows resize event and call clear the canvas
     * @method onWindowResize
     * @param {Object} event
     */
    onWindowResize : function (event)
    {
        var videoSize = event.data.self.getVideoSize();
        var width = videoSize.w;
        var height = videoSize.h;
        if (this.canvas !== null)
        {
            event.data.self.clearCanvas();
            event.data.self.canvas.setSize( width,height );
            event.data.self.updateCanvasPosition();
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onWindowResize W: " + width + " H:" + height );
        }
    },
    /**
     * Fired on first time change event
     * @method onFirstTimechange
     * @param {Object} event
     */
    onFirstTimechange : function (event)
    {
        event.data.self.initializeOnLoadStart();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"timechange" );
        }
    },
    /**
     * Fired on end event
     * @method onEnd
     * @param {Object} event
     */
    onEnd : function (event)
    {
        event.data.self.clearCanvas();
    },
    /**
     * Fired on time change event to clear canvas
     * @method onTimeupdate
     * @param {Object} event
     * @param {Object} data
     */
    onTimeupdate : function (event,data)
    {
        event.data.self.updatePos( parseFloat( data.currentTime ) );
    },
    /**
     * Fired on seek event to clear canvas
     * @method onSeek
     * @param {Object} event
     */
    onSeek : function (event)
    {
        event.data.self.clearCanvas();
        event.data.self.updateBlockData();
        event.data.self.refreshSeekData();
    },
    /**
     * Fired on click event
     * @method onClickAtObject
     * @param {Object} event
     * @param {Object} data
     */
    onClickAtObject : function (event,data)
    {
        if (typeof event.data.self.settings.parameters !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.settings.parameters.callbacks.click + '(data)' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.info( event.data.self.Class.fullName,"onClickAtObject" );
            event.data.self.logger.warn( event.data );
            event.data.self.logger.warn( data );
        }
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     * @param {Object} event
     * @param {Object} data
     */
    onSelectedMetadataChange : function (event,data)
    {
        if (data.metadataId !== null)
        {
            event.data.self.setSelectedMetadataId( data.metadataId );
        }
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onSelectedMetadataChange id:" + data.metadataId );
        }
    },
    /**
     * Fired on data change event
     * @param {type} event
     * @param {type} data
     */
    onDataChange : function (event,data)
    {
        if (event.data.self.loadDataStarted === false)
        {
            if (event.data.self.isManagedMetadataId( data.id ))
            {
                if (event.data.self.isBoundMetadataId( data.id ))
                {
                    event.data.self.updateBlockData();
                }
            }
            else
            {
                event.data.self.bindMetadataId( data.id );
            }
        }
        else if (event.data.self.dataToDeal !== null)
        {
            // Add to deal array if display mode is dynamic
            if (event.data.self.settings.lineDisplayMode > 1)
            {
                event.data.self.dataToDeal.push( data.id );
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
        for (var i = 0;
            i < event.data.self.dataToDeal.length;
            i++)
        {
            event.data.self.bindMetadataId( event.data.self.dataToDeal[i] );
        }
        event.data.self.dataToDeal = [
        ];
        event.data.self.updateBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onBeginDataChange" );
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
        event.data.self.updateBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onEndDataChange" );
        }
    },
    /**
     * Fired on bind metadata event
     * @param {Object} event
     * @param {Object} data
     */
    onBindMetadata : function (event,data)
    {
        event.data.self.bindMetadataId( data.id );
        event.data.self.updateBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onBindMetadata Id:" + data.id );
        }
    },
    /**
     * Fired on unbind metadata event
     * @param {Object} event
     * @param {Object} data
     */
    onUnBindMetadata : function (event,data)
    {
        event.data.self.unbindMetadataId( data.id );
        event.data.self.updateBlockData();
        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"onUnBindMetadata Id: " + data.id );
        }
    },
    /**
     * Call when mouse down
     * @method onMouseDown
     * @param {Object} event
     */
    onMouseDown : function (event)
    {
        if ((event.data.self.doDraw === true && event.ctrlKey === true && event.data.self.drawing === false) || (event.shiftKey === true && event.ctrlKey === true))
        {
            var videoSize = event.data.self.getVideoSize();
            var startX = Math.max( 0,event.offsetX - ((event.data.self.container.height() - 45 - videoSize.h) / 2) );
            var startY = Math.max( 0,event.offsetY - ((event.data.self.container.height() - videoSize.h) / 2) );
            event.data.self.drawing = true;
            event.data.self.drawingHandler.show();
            event.data.self.drawingHandler.toFront();
            event.data.self.drawingHandler.doDraw.startX = startX;
            event.data.self.drawingHandler.doDraw.startY = startY + 20;
            event.data.self.drawingHandler.attr( 'x',event.data.self.drawingHandler.doDraw.startX );
            event.data.self.drawingHandler.attr( 'y',event.data.self.drawingHandler.doDraw.startY );
        }
    },
    /**
     * Call when mouse up
     * @method onMouseUp
     * @param {Object} event
     */
    onMouseUp : function (event)
    {
        if (event.data.self.drawing === true)
        {
            event.data.self.drawing = false;
            event.data.self.drawingHandler.hide();
            var w = Math.max( 0,event.data.self.drawingHandler.doDraw.endX - event.data.self.drawingHandler.doDraw.startX );
            var h = Math.max( 0,event.data.self.drawingHandler.doDraw.endY - event.data.self.drawingHandler.doDraw.startY );
            var _shape = event.data.self.drawShape( 'rectangle',event.data.self.drawingHandler.doDraw.startX,event.data.self.drawingHandler.doDraw.startY,w,h );
            if (_shape !== null)
            {
                var _shapePos = {
                    c : {
                        x : parseFloat( (event.data.self.drawingHandler.doDraw.startX + event.data.self.drawingHandler.doDraw.endX) / 2 / event.data.self.canvas.width ),
                        y : parseFloat( (event.data.self.drawingHandler.doDraw.startY + event.data.self.drawingHandler.doDraw.endY) / 2 / event.data.self.canvas.height )
                    },
                    rx : parseFloat( (w / event.data.self.canvas.width) / 2 ),
                    ry : parseFloat( (h / event.data.self.canvas.height) / 2 ),
                    o : 0,
                    t : event.data.self.getSelectedShape()
                };
                event.data.self.createDataShape( _shape,_shapePos );
            }
        }
    },
    /**
     * Call when mouse move
     * @method onMouseMove
     * @param {Object} event
     */
    onMouseMove : function (event)
    {
        if (event.data.self.drawing === true)
        {
            var videoSize = event.data.self.getVideoSize();
            var endX = Math.max( 0,event.offsetX - ((event.data.self.container.height() - 45 - videoSize.h) / 2) );
            var endY = Math.max( 0,event.offsetY - ((event.data.self.container.height() - videoSize.h) / 2) );
            var width = Math.max( 0,endX - event.data.self.drawingHandler.doDraw.startX );
            var height = Math.max( 0,endY - event.data.self.drawingHandler.doDraw.startY );
            event.data.self.drawingHandler.doDraw.endX = endX;
            event.data.self.drawingHandler.doDraw.endY = endY;
            event.data.self.drawingHandler.attr( 'width',width );
            event.data.self.drawingHandler.attr( 'height',height );
        }
    },
    /**
     * Call when end transformation
     * @param {type} ft
     * @param {type} events
     */
    onTransformationCallback : function (ft,events)
    {
        if (ft.self.eraseState === true)
        {
            ft.unplug();
            ft.subject.remove();
            ft.self.setEraseState( false );
        }
        else if ($.inArray( 'drag end',events ) > -1 || $.inArray( 'scale end',events ) > -1)
        {
            //translate pos is a center object
            var _shapePos = {
                c : {
                    x : parseFloat( (ft.attrs.center.x + ft.attrs.translate.x) / ft.self.canvas.width ),
                    y : parseFloat( (ft.attrs.center.y + ft.attrs.translate.y) / ft.self.canvas.height )
                },
                rx : parseFloat( (ft.attrs.size.x * ft.attrs.scale.x) / 2 / ft.self.canvas.width ),
                ry : parseFloat( (ft.attrs.size.y * ft.attrs.scale.y) / 2 / ft.self.canvas.height ),
                o : parseFloat( ft.attrs.rotate ),
                t : ft.self.shape
            };

            ft.self.updatePosShape( _shapePos,ft.subject.data );
        }
    },
    /**
     * On eraser
     * @param {Object} event
     */
    onClickToEraser : function (event)
    {
        if (event.data.self.getEraseState() === true)
        {
            event.data.self.setEraseState( false );
        }
        else
        {
            event.data.self.setEraseState( true );
        }
    },
    /**
     * In charge to update shape position
     * @param {Object} shape
     * @param {Object} shapePos
     */
    updatePosShape : function (shapePos,data)
    {
        var _player = this.mediaPlayer;
        var tc = _player.getCurrentTime();
        if (data.hasOwnProperty( 'refLoc' ) && typeof data.refLoc === "object" && data.refLoc.tc !== tc)
        {
            if (data.refLoc.hasOwnProperty( 'sublocalisations' ) === false || data.refLoc.sublocalisations === null || typeof data.refLoc.sublocalisations !== "object")
            {
                //init sublocalisation
                data.refLoc.sublocalisations = {
                    localisation : [
                    ]
                };
                var oldTc = parseFloat( data.refLoc.tc );
                var firstShapePos = jQuery.extend( {},{
                    tc : oldTc,
                    shape : data.refLoc.shape,
                    tclevel : 1

                } );
                data.refLoc.sublocalisations.localisation.push( firstShapePos );
                data.refLoc.shape = null;
                if (oldTc < tc)
                {
                    data.refLoc.tcin = oldTc;
                    data.refLoc.tc = oldTc;
                    data.refLoc.tcout = tc;
                }
                else
                {
                    data.refLoc.tcin = tc;
                    data.refLoc.tc = tc;
                    data.refLoc.tcout = oldTc;
                }
            }
            //search if localisations pos for this tc
            var duplicateItem = $.grep( data.refLoc.sublocalisations.localisation,function (a) {
                return a.tc === tc;
            } );
            if (duplicateItem.length > 0)
            {
                duplicateItem[0].shape = shapePos;
            }
            else
            {
                // add new shap pos
                data.refLoc.sublocalisations.localisation.push( {
                    tc : tc,
                    shape : shapePos,
                    tclevel : 1
                } );
            }

            _player.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : data.hasOwnProperty( 'metadataId' ) ? data.metadataId : _player.getSelectedMetadataId()
            } );
        }
        else if (data.hasOwnProperty( 'refLoc' ) && typeof data.refLoc === "object")
        {
            data.refLoc.shape = shapePos;
            _player.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : data.hasOwnProperty( 'metadataId' ) ? data.metadataId : _player.getSelectedMetadataId()
            } );
        }
    }
} );
