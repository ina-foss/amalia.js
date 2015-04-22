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
 * In charge to manage block metadata
 * @class MetadataBlockEditorPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-editor
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend( "fr.ina.amalia.player.plugins.MetadataBlockEditorPlugin",{
    classCss : "ajs-plugin editor plugin-block-editor",
    eventTypes : {}
},
{
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
     * Initialize editor plugin and create container of this plugin
     * @method initialize
     */
    initialize : function ()
    {
        this._super();
        this.settings = $.extend( {
            shapesListOfElements : [
                'legal',
                'facetime',
                'circle'
            ]
        },
        this.settings.parameters || {} );

        this.container = $( '<div>',{
            'class' : this.Class.classCss
        } );
        this.pluginContainer.append( this.container );
        this.createHeaderElement();
        this.createMetadataBlock();
        this.createFooterElement();
        this.defineListeners();
        this.metadataManager = this.mediaPlayer.getMetadataManager();
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
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_LABEL_HEADER
        } );
        element.append( titleElement );
        this.container.append( element );
    },
    /**
     * Create metadata list block
     * @method createHeaderElement
     */
    createMetadataBlock : function ()
    {
        var element = $( '<div>',{
            'class' : 'body'
        } );
        var messagesElement = $( '<div>',{
            'class' : 'messages-container'
        } );
        messagesElement.hide();
        var formElement = $( '<form>',{
            'class' : 'formMetadataBlock'
        } );
        var idElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_ID
        } );
        var idElement = $( '<input>',{
            'class' : 'metadata-id input',
            'name' : 'id',
            'type' : 'text',
            'disabled' : 'disabled',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_ID
        } );
        idElementContainer.append( idElement );
        var lebelElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_LABAL
        } );
        var labelElement = $( '<input>',{
            'class' : 'metadata-label input',
            'name' : 'label',
            'type' : 'text',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_LABAL
        } );

        lebelElementContainer.append( labelElement );
        var typeElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_TYPE
        } );
        var typeElement = $( '<select>',{
            'class' : 'metadata-type select',
            'name' : 'type'
        } );
        typeElementContainer.append( typeElement );
        var typeListOfElements = fr.ina.amalia.player.PluginBindingManager.dataTypes;
        for (var typeItem in typeListOfElements)
        {
            var typeOption = $( '<option>',{
                'value' : typeListOfElements[typeItem].toString(),
                'text' : typeItem.toString()
            } );
            typeElement.append( typeOption );
        }
        // description
        var descriptionElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_DESCRIPTION
        } );

        var descriptionElement = $( '<textarea>',{
            'class' : 'metadata-description text-area',
            'name' : 'description',
            'placeholder' : "Description"
        } );
        descriptionElementContainer.append( descriptionElement );

        var refElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_REFERENCE
        } );

        var refElement = $( '<input>',{
            'class' : 'metadata-ref input',
            'name' : 'ref',
            'type' : 'text',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_REFERENCE
        } );
        refElementContainer.append( refElement );
        // author
        var authorElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_AUTHOR
        } );
        var authorElement = $( '<input>',{
            'class' : 'metadata-author input',
            'name' : 'author',
            'type' : 'text',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_AUTHOR
        } );
        authorElementContainer.append( authorElement );

        // shapes
        var shapesElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_SHAPE
        } );
        var shapesElement = $( '<p>',{
            'class' : 'metadata-shape',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_SHAPE
        } );
        shapesElementContainer.append( shapesElement );
        var shapesListOfElements = this.settings.shapesListOfElements;
        for (var shapeItem in shapesListOfElements)
        {
            var shapeOption = $( '<input>',{
                'id' : 'shape-item-' + shapesListOfElements[shapeItem].toString(),
                'name' : 'shape',
                'value' : shapesListOfElements[shapeItem].toString(),
                'type' : 'radio'
            } );
            var item = $( '<label>',{
                'for' : 'shape-item-' + shapesListOfElements[shapeItem].toString(),
                'class' : 'shape ajs-icon ajs-icon-' + shapesListOfElements[shapeItem].toString()
            } );

            shapesElement.append( shapeOption );
            shapesElement.append( item );
        }

        // color
        var colorElementContainer = $( '<div>',{
            'class' : 'form-item',
            'text' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_COLOR
        } );
        var colorElement = $( '<input>',{
            'class' : 'metadata-color input',
            'type' : 'color',
            'name' : 'color',
            'placeholder' : fr.ina.amalia.player.PlayerMessage.PLUGIN_METADATA_BLOCK_EDITOR_FORM_LABEL_METADATA_COLOR
        } );
        colorElementContainer.append( colorElement );

        formElement.append( idElementContainer );
        formElement.append( typeElementContainer );
        formElement.append( lebelElementContainer );
        formElement.append( descriptionElementContainer );
        formElement.append( refElementContainer );
        formElement.append( authorElementContainer );
        formElement.append( colorElementContainer );
        formElement.append( shapesElementContainer );
        element.append( messagesElement );
        element.append( formElement );
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
        var btnAddMetadata = $( '<button>',{
            'class' : 'save-metadata ajs-icon ajs-icon-check'
        } ).on( 'click',{
            self : this
        },
        this.onSaveMetadata );
        element.append( btnAddMetadata );
        this.container.append( element );
    },
    /**
     * In charge to set message error
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

        if (this.logger !== null)
        {
            this.logger.trace( this.Class.fullName,"definePlayerListeners" );
        }
    },
    /**
     * In charge to validate form
     */
    isValidForm : function (errors)
    {
        if (typeof errors !== 'undefined' && typeof errors.length !== 'undefined')
        {
            var formContainer = this.container.find( '.formMetadataBlock' );
            if (formContainer.find( '[name="id"]' ).val() === '')
            {
                errors.push( 'Id is required field' );
            }
            else if (formContainer.find( '[name="label"]' ).val() === '')
            {
                errors.push( 'Label is required field' );
            }
            else if (formContainer.find( '[name="type"]' ).val() === '')
            {
                errors.push( 'Type is required field' );
            }
            return (errors.length === 0);
        }
        return false;
    },
    updateMetadata : function (id)
    {
        var metadataBlock = this.metadataManager.getBlockMetadata( id );
        var formContainer = this.container.find( '.formMetadataBlock' );
        if (metadataBlock !== null)
        {
            formContainer.find( '[name="label"]' ).val( metadataBlock.hasOwnProperty( 'label' ) ? metadataBlock.label : '' );
            formContainer.find( '[name="type"] option[value="' + metadataBlock.type + '"]' ).prop( 'selected',true );
            if (metadataBlock.type === fr.ina.amalia.player.PluginBindingManager.dataTypes.DEFAULT)
            {
                formContainer.find( '[name="type"]' ).prop( 'disabled',false );
            }
            else
            {
                formContainer.find( '[name="type"]' ).prop( 'disabled',true );
            }
            formContainer.find( '[name="description"]' ).val( metadataBlock.hasOwnProperty( 'description' ) ? metadataBlock.description : '' );
            formContainer.find( '[name="ref"]' ).val( metadataBlock.hasOwnProperty( 'ref' ) ? metadataBlock.ref : '' );
            formContainer.find( '[name="author"]' ).val( metadataBlock.hasOwnProperty( 'author' ) ? metadataBlock.author : '' );
            formContainer.find( '[name="color"]' ).val( metadataBlock.hasOwnProperty( 'color' ) ? metadataBlock.color : '' );
            formContainer.find( '[name="shape"]' ).first().prop( 'checked',true );
            formContainer.find( '[name="shape"][value="' + metadataBlock.shape + '"]' ).prop( 'checked',true );
        }
        else
        {
            formContainer.find( '[name="label"]' ).val( '' );
            formContainer.find( '[name="type"] option' ).prop( 'selected',false );
            formContainer.find( '[name="type"]' ).prop( 'disabled',false );
            formContainer.find( '[name="description"]' ).val( '' );
            formContainer.find( '[name="ref"]' ).val( '' );
            formContainer.find( '[name="author"]' ).val( '' );
            formContainer.find( '[name="color"]' ).val( '' );
            formContainer.find( '[name="shape"]' ).first().prop( 'checked',true );
        }
        this.container.find( 'form.formMetadataBlock .form-item .metadata-id' ).val( id );
        this.clearMessage();
    },
    /**
     * In charge to save form
     */
    saveMetadata : function ()
    {
        var formContainer = this.container.find( '.formMetadataBlock' );
        var errors = [
        ];
        if (this.isValidForm( errors ))
        {
            var metadataId = formContainer.find( '[name="id"]' ).val();
            this.metadataManager.updateBlockMetadata( metadataId,{
                id : metadataId,
                label : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="label"]' ).val() ),
                type : formContainer.find( '[name="type"]' ).val(),
                description : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="description"]' ).val() ),
                ref : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="ref"]' ).val() ),
                author : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="author"]' ).val() ),
                color : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="color"]' ).val() ),
                shape : fr.ina.amalia.player.helpers.UtilitiesHelper.htmlEscape( formContainer.find( '[name="shape"]:checked' ).val() )
            } );
            this.updateMetadata( metadataId );
            this.setMessage( [
                'Saved!'
            ],'info' );
        }
        else
        {
            this.setMessage( errors,'error' );
        }
    },
    /**
     * Fired on selected metadata change
     * @method onSelectedMetadataChange
     * @param {Object} e
     * @param {Object} data
     */
    onSelectedMetadataChange : function (e,data)
    {
        if (data.metadataId !== null)
        {
            e.data.self.updateMetadata( data.metadataId );
        }
    },
    /**
     * Called on click to save btn
     * @param {Object} e
     */
    onSaveMetadata : function (e)
    {
        e.data.self.saveMetadata();
    }
} );
