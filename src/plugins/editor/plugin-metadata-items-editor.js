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
 * In charge to manage selected items
 * @class MetadataItemsEditorPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-editor
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.MetadataItemsEditorPlugin",{
    classCss : "ajs-plugin editor plugin-items-editor"
},
{
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
     * Main container of this plugin
     * @property container
     * @type {Object}
     * @default []
     */
    container : null,
    /**
     * true if load data started anw
     * @property loadDataStarted
     * @default null
     */
    loadDataStarted : false,
    /**
     * Instance of metadata manager
     * @property metadataManager
     * @default null
     */
    metadataManager : null,
    /**
     * Selected metadata id
     * @property metadataId
     * @default null
     */
    metadataId : null,
    /**
     * Localisation manager
     * @property localisationManager
     * @type {Object}
     * @default null
     */
    localisationManager : null,
    /**
     * Initialize
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.settings = $.extend( {
            defaultPercentWidth : 0.1
        },
        this.settings.parameters || {} );

        this.container = $( '<div>',{
            'class' : this.Class.classCss
        } );
        this.tcin = this.mediaPlayer.getTcOffset();
        this.tcout = this.mediaPlayer.getDuration() + this.mediaPlayer.getTcOffset();
        this.pluginContainer.append( this.container );
        this.createHeaderElement();
        this.createMetadataItemsBlock();
        this.createFooterElement();
        this.defineListeners();
        this.metadataManager = this.mediaPlayer.getMetadataManager();
        this.localisationManager = new fr.ina.amalia.player.LocalisationManager();
    },
    /**
     * Create block header
     * @method createHeaderElement
     */
    createHeaderElement : function ()
    {
        var element = $( '<div>',{
            'class' : 'heading'
        } );
        var titleElement = $( '<h3>',{
            'class' : 'title',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_ITEMS_EDITOR_LABEL_HEADER
        } );
        element.append( titleElement );
        this.container.append( element );
    },
    /**
     * Create metadata list block
     * @method createHeaderElement
     */
    createMetadataItemsBlock : function ()
    {
        var element = $( '<div>',{
            'class' : 'body'
        } );
        var messagesElement = $( '<div>',{
            'class' : 'messages-container'
        } ).hide();
        var listOfSelectedItemsElement = $( '<ul>',{
            'class' : 'listOfSelectedItems'
        } );

        element.append( messagesElement );
        element.append( listOfSelectedItemsElement );

        this.container.append( element );
    },
    /**
     * Create block header
     * @method createHeaderElement
     */
    createFooterElement : function ()
    {
        var element = $( '<div>',{
            'class' : 'footer'
        } );
        var addBtnElement = $( '<span>',{
            'class' : 'button add ajs-icon ajs-icon-plus'
        } ).on( 'click',{
            self : this
        },
        this.onAddItem );
        var validateBtnElement = $( '<span>',{
            'class' : 'button validateAll ajs-icon ajs-icon-check'
        } ).on( 'click',{
            self : this
        },
        this.onValidateItems );

        var clearBtnElement = $( '<span>',{
            'class' : 'button clear ajs-icon ajs-icon-eject'
        } ).on( 'click',{
            self : this
        },
        this.onClearItems );

        element.append( addBtnElement );
        element.append( validateBtnElement );
        element.append( clearBtnElement );
        this.container.append( element );
    },
    /**
     * In charge to set message error
     * @param {type} messages
     * @param {type} messageType
     * @returns {undefined}
     */
    setMessage : function (messages,messageType)
    {
        messageType = (messageType) ? messageType : 'info';
        if (typeof messages !== 'undefined' && typeof messages.length !== 'undefined')
        {
            var container = this.container.find( '.messages-container' );
            container.empty().removeClass( function (index,css)
            {
                return (css.match( /(^|\s)type-\S+/g ) || [
                ]).join( ' ' );
            } ).addClass( 'type-' + messageType );
            for (var i = 0;
                i < messages.length;
                i++)
            {
                var message = $( '<p>',{
                    'class' : 'error',
                    'text' : messages[i].toString()
                } );
                container.append( message );
            }

            if (messages.length !== 0)
            {
                container.show();
            }
            else
            {
                container.hide();
            }
        }
    },
    /**
     * In charge to clear message container
     */
    clearMessage : function ()
    {
        var container = this.container.find( '.messages-container' );
        container.empty().hide();
    },
    /**
     * Set player events
     * @method defineListeners
     */
    defineListeners : function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();

        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE,{
            self : this
        },
        this.onSelectedMetadataChange );

        player.on( fr.ina.amalia.player.PlayerEventType.SELECTED_ITEMS_CHANGE,{
            self : this
        },
        this.onSelectedItemsChange );
        //On data change event
        player.on( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            self : this
        },
        this.onDataChange );

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * In charge to create form by item
     * @param {type} data
     * @returns {Object}
     */
    createFormData : function (data)
    {
        var formData = $( '<form>',{
            'class' : 'form-data'
        } ).data( 'metadata',data );
        // Label
        var labelElementContainer = $( '<div>',{
            'class' : 'form-input'
        } );

        var labelTextElement = $( '<span>',{
            'class' : 'text data-model-label',
            'text' : data.hasOwnProperty( 'label' ) ? data.label : ''
        } );
        var labelElement = $( '<input>',{
            'name' : 'label',
            'class' : 'input data-model-label',
            'value' : data.hasOwnProperty( 'label' ) ? data.label : '',
            'placeholder' : 'Label'
        } ).hide();

        labelElementContainer.append( labelTextElement );
        labelElementContainer.append( labelElement );
        formData.append( labelElementContainer );

        if (data.hasOwnProperty( 'tcout' ))
        {
            // Tc In
            var tcInElementContainer = $( '<div>',{
                'class' : 'form-input'
            } );
            var tcInTextElement = $( '<span>',{
                'class' : 'text  data-model-tcin',
                'data-label' : 'Tc-in: ',
                'text' : data.hasOwnProperty( 'tcin' ) ? 'Tc-in: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcin,'ms' ) : ''
            } );
            var tcInElement = $( '<input>',{
                'name' : 'tcin',
                'class' : 'input  data-model-tcin',
                'value' : data.hasOwnProperty( 'tcin' ) ? fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcin,'ms' ) : '',
                'placeholder' : 'TC-IN'
            } ).hide();
            tcInElementContainer.append( tcInTextElement );
            tcInElementContainer.append( tcInElement );
            formData.append( tcInElementContainer );

            // Tc Out
            var tcOutElementContainer = $( '<div>',{
                'class' : 'form-input'
            } );
            var tcOutTextElement = $( '<span>',{
                'class' : 'text data-model-tcout',
                'data-label' : 'Tc-out: ',
                'text' : data.hasOwnProperty( 'tcout' ) ? 'Tc-out: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcout,'ms' ) : ''
            } );
            var tcOutElement = $( '<input>',{
                'name' : 'tcout',
                'class' : 'input data-model-tcout',
                'value' : data.hasOwnProperty( 'tcout' ) ? fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcout,'ms' ) : '',
                'placeholder' : 'TC-OUT'
            } ).hide();
            tcOutElementContainer.append( tcOutTextElement );
            tcOutElementContainer.append( tcOutElement );
            formData.append( tcOutElementContainer );
        }
        else
        {
            var tc = (typeof data.tc === "number") ? data.tc : fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( data.tc );
            // Tc
            var tcElementContainer = $( '<div>',{
                'class' : 'form-input'
            } );
            var tcTextElement = $( '<span>',{
                'class' : 'text data-model-tc',
                'data-label' : 'Tc: ',
                'text' : data.hasOwnProperty( 'tc' ) ? 'Tc: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tc,'ms' ) : ''
            } );
            var tcElement = $( '<input>',{
                'name' : 'tc',
                'class' : 'input data-model-tc',
                'value' : data.hasOwnProperty( 'tc' ) ? fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( tc,'ms' ) : '',
                'placeholder' : 'TC'
            } ).hide();
            tcElementContainer.append( tcTextElement );
            tcElementContainer.append( tcElement );
            formData.append( tcElementContainer );
        }

        // Submit
        var controlsElementContainer = $( '<div>',{
            'class' : 'form-controls'
        } );
        var submitBtnElement = $( '<span>',{
            // 'text' : 'valid',
            'class' : 'button valid ajs-icon ajs-icon-check'
        } );

        var removeBtnElement = $( '<span>',{
            // 'text' : 'valid',
            'class' : 'button remove ajs-icon ajs-icon-eraser'
        } );

        var closeBtnElement = $( '<span>',{
            // 'text' : 'valid',
            'class' : 'button close ajs-icon ajs-icon-eject'
        } );

        controlsElementContainer.append( submitBtnElement );
        controlsElementContainer.append( removeBtnElement );
        controlsElementContainer.append( closeBtnElement );

        formData.append( controlsElementContainer );

        return formData;
    },
    /**
     * In charge to update selected items
     */
    updateSelectedItems : function ()
    {
        var listOfSelectedItemsElement = this.container.find( 'ul.listOfSelectedItems' );
        var listOfSelectedItems = this.mediaPlayer.getSelectedItems();
        var lastItem = listOfSelectedItemsElement.find( 'li.item' ).last();
        var oldIdx = lastItem.length > 0 ? parseInt( lastItem.attr( 'class' ).match( /item-([0-9]+)/ )[1] ) + 1 : 0;
        oldIdx = isNaN( oldIdx ) ? 0 : oldIdx;
        // Clear old data
        // listOfSelectedItemsElement.empty();
        if (typeof listOfSelectedItems !== 'undefined' && listOfSelectedItems.hasOwnProperty( 'length' ) && listOfSelectedItems.length > 0)
        {
            for (var i = 0;
                i < listOfSelectedItems.length;
                i++)
            {
                var data = listOfSelectedItems[i];

                if (data !== null && data.hasOwnProperty( 'formCreated' ) && data.formCreated === false)
                {
                    var itemForm = this.createFormData( data );
                    var item = $( '<li>',{
                        'class' : 'item item-' + i
                    } );
                    data.formCreated = true;
                    item.append( itemForm );
                    listOfSelectedItemsElement.append( item );
                }
            }
        }
        // Add events
        listOfSelectedItemsElement.find( '.form-input' ).on( 'click',{
            self : this
        },
        this.onFormEdit );
        listOfSelectedItemsElement.find( '.form-input input.input' ).on( 'focusout',{
            self : this
        },
        this.onFormFocusout );
        listOfSelectedItemsElement.find( '.form-data .form-controls .button.valid' ).on( 'click',{
            self : this
        },
        this.onSaveForm );
        listOfSelectedItemsElement.find( '.form-data .form-controls .button.remove' ).on( 'click',{
            self : this
        },
        this.onDeleteItem );
        listOfSelectedItemsElement.find( '.form-data .form-controls .button.close' ).on( 'click',{
            self : this
        },
        this.onCloseForm );
    },
    /**
     * In charge close item
     * @param {Object} itemDataElement
     */
    _closeItem : function (itemDataElement)
    {
        var itemIdx = parseInt( itemDataElement.attr( 'class' ).match( /item-([0-9]+)/ )[1] );
        var formData = itemDataElement.find( 'form' ).first();
        var itemData = formData.data( 'metadata' );
        itemData.selected = false;
        itemData.formCreated = false;
        itemDataElement.remove();
        this.metadataManager.removeSelectedItem( itemIdx );
    },
    /**
     * In charge of validate item
     * @param {Object} itemDataElement
     */
    _validateItem : function (itemDataElement)
    {
        var itemIdx = parseInt( itemDataElement.attr( 'class' ).match( /item-([0-9]+)/ )[1] );
        var formData = itemDataElement.find( 'form' ).first();
        var itemData = formData.data( 'metadata' );
        var timePattern = /^[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{2}$/;
        var isValid = false;

        if (timePattern.test( formData.find( '[name="tc"]' ).val() ))
        {
            isValid = true;
        }
        else if (typeof formData.find( '[name="tcin"]' ).val() !== "undefined" && typeof formData.find( '[name="tcout"]' ).val() !== "undefined")
        {
            if (timePattern.test( formData.find( '[name="tcin"]' ).val() ) && timePattern.test( formData.find( '[name="tcout"]' ).val() ))
            {
                isValid = true;
            }
            else
            {
                isValid = false;
            }
        }

        // Set values
        itemData.tc = fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( formData.find( '[name="tc"]' ).val() );
        if (this.validItemTcRange( itemData,itemData.tc ))
        {
            isValid = true;
        }
        else if (itemData.hasOwnProperty( "tcRange" ))
        {
            isValid = false;
        }

        if (isValid)
        {
            if (typeof formData.find( '[name="tcout"]' ).val() !== "undefined")
            {
                itemData.tcin = fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( formData.find( '[name="tcin"]' ).val() );
                itemData.tcout = fr.ina.amalia.player.helpers.UtilitiesHelper.convertHourToSeconde( formData.find( '[name="tcout"]' ).val() );
            }
            itemData.label = fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formData.find( '[name="label"]' ).val() );
            itemData.selected = false;
            itemData.formCreated = false;
            itemDataElement.remove();
            this.metadataManager.removeSelectedItem( itemIdx );
        }
        return isValid;
    },
    /**
     * In charge to valid item tc range
     * @method validItemTcRange
     * @param {Object} item
     * @param {Object} tc
     */
    validItemTcRange : function (item,tc)
    {
        var isValid = false;
        if (item !== null && typeof item === "object" && item.hasOwnProperty( "tcRange" ))
        {
            if (item.tcRange.hasOwnProperty( 'min' ) && item.tcRange.hasOwnProperty( 'max' ))
            {
                isValid = tc > item.tcRange.min && tc < item.tcRange.max;
            }
            else if (item.tcRange.hasOwnProperty( 'min' ))
            {
                isValid = tc > item.tcRange.min && tc <= this.tcout;
            }
            else if (item.tcRange.hasOwnProperty( 'max' ))
            {
                isValid = tc >= this.tcin && tc < item.tcRange.max;
            }
        }
        return isValid;
    },
    /**
     * In charge to update selected form items when data change event
     * @param {Object} targetElement
     */
    updateFormItems : function ()
    {
        var listOfSelectedItemsElement = this.container.find( 'ul.listOfSelectedItems li.item' );
        for (var selectedItemElementIdx = 0;
            selectedItemElementIdx < listOfSelectedItemsElement.length;
            selectedItemElementIdx++)
        {
            var dataItem = $( listOfSelectedItemsElement[selectedItemElementIdx] ).find( 'form.form-data' ).data( 'metadata' );

            if (typeof dataItem === "object" && dataItem.hasOwnProperty( 'selected' ) && dataItem.selected === true)
            {
                $.each( $( listOfSelectedItemsElement[selectedItemElementIdx] ).find( '.form-data' ),this.updateFormItem );
            }
            else if (typeof dataItem === "object" && dataItem.hasOwnProperty( 'selected' ) && dataItem.selected === false)
            {
                this._closeItem($(listOfSelectedItemsElement[selectedItemElementIdx]));
            }
        }
    },
    updateFormItem : function (idx,element) {
        var targetElement = $( element );
        var data = targetElement.data( 'metadata' );
        if (data.hasOwnProperty( 'label' ))
        {
            targetElement.find( 'span.data-model-label' ).html( data.label );
            targetElement.find( 'input.data-model-label' ).val( data.label );
        }
        if (data.hasOwnProperty( 'tc' ))
        {
            targetElement.find( 'span.data-model-tc' ).html( targetElement.find( 'span.data-model-tc' ).attr( 'data-label' ) + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tc,'ms' ) );
            targetElement.find( 'input.data-model-tc' ).val( fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tc,'ms' ) );
        }
        if (data.hasOwnProperty( 'tcin' ))
        {
            targetElement.find( 'span.data-model-tcin' ).html( targetElement.find( 'span.data-model-tcin' ).attr( 'data-label' ) + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcin,'ms' ) );
            targetElement.find( 'input.data-model-tcin' ).val( fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcin,'ms' ) );
        }
        if (data.hasOwnProperty( 'tcout' ))
        {
            targetElement.find( 'span.data-model-tcout' ).html( targetElement.find( 'span.data-model-tcout' ).attr( 'data-label' ) + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcout,'ms' ) );
            targetElement.find( 'input.data-model-tcout' ).val( fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime( data.tcout,'ms' ) );
        }
    },
    /**
     * In charge to open selected input
     * @param {Object} event
     */
    onFormEdit : function (event)
    {
        var currentElement = $( event.currentTarget );
        currentElement.find( '.text' ).html( '' ).hide();
        currentElement.find( 'input' ).show().focus();
    },
    /**
     * Fired on focus out of item
     * @param {Object} event
     */
    onFormFocusout : function (event)
    {
        var currentElement = $( event.target );
        var textElement = currentElement.parent().find( '.text' );
        textElement.text( textElement.attr( 'data-label' ) + currentElement.val() ).show();
        currentElement.parents( 'li.item' ).find( '.button.valid' ).addClass( 'on' );
        currentElement.hide();
    },
    /**
     * In charge to save form content in to ref of the data - remove validate
     * form - send data change event
     * @method onSaveForm
     * @param {Object} event
     */
    onSaveForm : function (event)
    {
        var isValid = event.data.self._validateItem( $( event.currentTarget ).parents( 'li.item' ).first(),event.data.self.metadataId );
        if (isValid)
        {
            event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
                id : event.data.self.metadataId
            } );
        }
        else
        {
            $( event.currentTarget ).parents( 'li.item' ).first().addClass( 'error' );
        }
    },
    /**
     * In charge to close edit item without save
     * @method onCloseForm
     * @param {Object} event
     */
    onCloseForm : function (event)
    {
        event.data.self._closeItem( $( event.currentTarget ).parents( 'li.item' ).first() );
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : event.data.self.metadataId
        } );
    },
    /**
     * In charge to delete item
     * @method onDeleteItem
     * @param {Object} event
     */
    onDeleteItem : function (event)
    {
        var itemDataElement = $( event.currentTarget ).parents( 'li.item' ).first();
        var itemIdx = parseInt( itemDataElement.attr( 'class' ).match( /item-([0-9]+)/ )[1] );
        var formData = itemDataElement.find( 'form' ).first();
        var itemData = formData.data( 'metadata' );
        itemData.tc = null;
        itemData.tcin = null;
        itemData.tcout = null;
        itemData.label = null;
        itemData.selected = false;
        itemData.formCreated = false;
        event.data.self.metadataManager.removeSelectedItem( itemIdx );
        itemDataElement.remove();
        itemData.deleted = true;
        if (itemData.hasOwnProperty( 'subItem' ) && itemData.subItem === true)
        {
            var data = event.data.self.mediaPlayer.getMetadataById( event.data.self.metadataId );
            event.data.self.localisationManager.updateSpacialLocBlock( data );
        }
        itemDataElement.remove();
        //Send data change evnet
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : event.data.self.metadataId
        } );
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     * @param {Object} event
     * @param {Object} data
     */
    onSelectedMetadataChange : function (event,data)
    {
        var listOfSelectedItemsElement = event.data.self.container.find( 'ul.listOfSelectedItems li.item' );
        for (var selectedItemElementIdx = 0;
            selectedItemElementIdx < listOfSelectedItemsElement.length;
            selectedItemElementIdx++)
        {
            event.data.self._closeItem( $( listOfSelectedItemsElement[selectedItemElementIdx] ) );
        }
        event.data.self.metadataId = data.metadataId !== null ? data.metadataId.toString() : null;
        event.data.self.clearMessage();
    },
    /**
     * In charge to add item
     * @param {Object} event
     */
    onAddItem : function (event)
    {
        if (event.data.self.metadataId !== null && event.data.self.metadataId !== '')
        {
            var dataList = null;
            var lineType = '';
            if (event.data.self.metadataId !== null)
            {
                var metadataObject = event.data.self.mediaPlayer.getBlockMetadata( event.data.self.metadataId );
                var metadataDataType = (metadataObject !== null && metadataObject.hasOwnProperty( 'type' )) ? metadataObject.type : '';
                lineType = event.data.self.bindingManager.getLinetypeWithDataType( metadataDataType );
            }
            switch (lineType) {
                case fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_SEGMENT:
                    dataList = [
                        {
                            'tcin' : event.data.self.mediaPlayer.getCurrentTime(),
                            'tcout' : Math.min( event.data.self.mediaPlayer.getCurrentTime() + (event.data.self.mediaPlayer.getDuration() * Math.min( event.data.self.settings.defaultPercentWidth,1 )),event.data.self.mediaPlayer.getDuration() ),
                            'label' : 'New segment',
                            'tclevel' : 1,
                            'selected' : true,
                            'formCreated' : false
                        }
                    ];
                    event.data.self.mediaPlayer.addMetadataById( event.data.self.metadataId,dataList );
                    event.data.self.clearMessage();
                    break;
                case fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_IMAGE:
                    dataList = [
                        {
                            'tc' : event.data.self.mediaPlayer.getCurrentTime(),
                            'label' : 'New Point',
                            'tclevel' : 1,
                            'selected' : true,
                            'formCreated' : false
                        }
                    ];
                    event.data.self.mediaPlayer.addMetadataById( event.data.self.metadataId,dataList );
                    event.data.self.clearMessage();
                    break;
                case fr.ina.amalia.player.PluginBindingManager.pluginTypes.TIMELINE_CUEPOINT:
                    dataList = [
                        {
                            'tc' : event.data.self.mediaPlayer.getCurrentTime(),
                            'label' : 'New Point',
                            'tclevel' : 1,
                            'selected' : true,
                            'formCreated' : false
                        }
                    ];
                    event.data.self.mediaPlayer.addMetadataById( event.data.self.metadataId,dataList );
                    event.data.self.clearMessage();
                    break;
                default:
                    event.data.self.setMessage( [
                        fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA_ITEM_TYPE
                    ],'error' );
            }

        }
        else
        {
            event.data.self.setMessage( [
                fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_ITEMS_EDITOR_NEED_METADTA
            ],'error' );
        }

    },
    /**
     * In charge to clear all selected items
     * @param {Object} event
     */
    onClearItems : function (event)
    {
        var listOfSelectedItemsElement = event.data.self.container.find( 'ul.listOfSelectedItems li.item' );
        for (var selectedItemElementIdx = 0;
            selectedItemElementIdx < listOfSelectedItemsElement.length;
            selectedItemElementIdx++)
        {
            event.data.self._closeItem( $( listOfSelectedItemsElement[selectedItemElementIdx] ) );
        }
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : event.data.self.metadataId
        } );
    },
    /**
     * In charge to clear all selected items
     * @param {Object} event
     */
    onValidateItems : function (event)
    {
        var listOfSelectedItemsElement = event.data.self.container.find( 'ul.listOfSelectedItems li.item' );
        for (var selectedItemElementIdx = 0;
            selectedItemElementIdx < listOfSelectedItemsElement.length;
            selectedItemElementIdx++)
        {
            var isValid = event.data.self._validateItem( $( listOfSelectedItemsElement[selectedItemElementIdx] ) );
            if (!isValid)
            {
                $( listOfSelectedItemsElement[selectedItemElementIdx] ).addClass( 'error' );
            }
        }
        event.data.self.mediaPlayer.getMediaPlayer().trigger( fr.ina.amalia.player.PlayerEventType.DATA_CHANGE,{
            id : event.data.self.metadataId
        } );
    },
    /**
     * On data change event
     * @param {Object} event
     * @param {Object} data
     */
    onDataChange : function (event,data)
    {
        if (data.id === event.data.self.metadataId)
        {
            event.data.self.updateFormItems();
        }
    },
    /**
     * Fired on selected items change
     * @method onSelectedItemsChange
     * @param {Object} event
     */
    onSelectedItemsChange : function (event)
    {
        if (event.data.self.metadataId !== null && event.data.self.metadataId !== '')
        {
            event.data.self.updateFormItems();
//            var listOfSelectedItemsElement = event.data.self.container.find( 'ul.listOfSelectedItems li.item' );
////            for (var selectedItemElementIdx = 0;
////                selectedItemElementIdx < listOfSelectedItemsElement.length;
////                selectedItemElementIdx++)
////            {
////                event.data.self._closeItem( $( listOfSelectedItemsElement[selectedItemElementIdx] ) );
////            }
            event.data.self.updateSelectedItems();
        }

        if (event.data.self.logger !== null)
        {
            event.data.self.logger.trace( event.data.self.Class.fullName,"EndDataChange" );
        }
    }
} );
