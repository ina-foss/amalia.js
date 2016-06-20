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
 * In charge to manage all items of metadata
 * @class MetadataItemsRefEditorPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-editor
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.MetadataItemsRefEditorPlugin", {
        classCss: 'ajs-plugin plugin-items-ref-editor',
        classCssForThumbCapture: 'ajs-icon ajs-icon-screenshot',
        classCssEditForm: 'ajs-icon ajs-icon-check',
        LABEL_DESCRIPTION: 'Description'
    },
    {
        /**
         * Main container of this plugin
         * @property container
         * @type {Object}
         * @default []
         */
        container: null,
        metadataId: null,
        selectedItem: null,
        /**
         * Localisation manager
         * @property localisationManager
         * @type {Object}
         * @default null
         */
        localisationManager: null,
        /**
         * Initialize
         * @method initialize
         */
        initialize: function () {
            this.metadataId = null;
            this.selectedItem = null;
            this._super();
            this.settings = $.extend({
                defaultPercentWidth: 0.1,
                timeFormat: 'f',
                framerate: this.settings.framerate
            }, this.settings.parameters || {});

            this.container = $('<div>', {
                'class': this.Class.classCss
            });
            this.localisationManager = new fr.ina.amalia.player.LocalisationManager();
            this.pluginContainer.append(this.container);
            this.createMetadataItemsBlock();
            this.defineListeners();
        },
        /**
         * Create metadata list block
         * @method createHeaderElement
         */
        createMetadataItemsBlock: function () {
            var titleElement = $('<div>', {
                'class': 'heading off'
            });
            titleElement.append("<p class='title'></p>");

            var element = $('<div>', {
                'class': 'body'
            });
            var messagesElement = $('<div>', {
                'class': 'messages-container'
            }).hide();
            var listOfItemsElement = $('<ul>', {
                'class': 'listOfSelectedItems'
            });
            element.append(titleElement);
            element.append(messagesElement);
            element.append(listOfItemsElement);
            this.container.append(element);
        },
        createItem: function (data) {
            var itemElement = $('<li>', {
                'class': 'item'
            }).data('metadata', data);

            var thumbElement = $('<div>', {
                'class': 'thumb'
            });
            var captureElement = $('<span>', {
                "class": "capture " + this.Class.classCssForThumbCapture
            });
            if (data.hasOwnProperty('thumb') && data.thumb !== null && data.thumb !== "") {
                thumbElement.css('background-image', 'url(' + data.thumb + ')');
            }
            thumbElement.append(captureElement);
            itemElement.append(thumbElement);
            var labelTextElement = $('<span>', {
                'class': 'text',
                'text': data.hasOwnProperty('label') ? data.label : ''
            });
            itemElement.append(labelTextElement);
            var tcInTextElement = $('<span>', {
                'class': 'tcin',
                'text': data.hasOwnProperty('tcin') ? fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(data.tcin, this.settings.framerate, this.settings.timeFormat) : ''
            });
            itemElement.append(tcInTextElement);
            var tcOutTextElement = $('<span>', {
                'class': 'tcout',
                'text': data.hasOwnProperty('tcout') ? fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(data.tcout, this.settings.framerate, this.settings.timeFormat) : ''
            });
            itemElement.append(tcOutTextElement);
            itemElement.append("<div style='clear: both;'></div>");
            //Add data fields
            var editDataElements = $('<div>', {
                'class': 'edit-form'
            });
            var textElement = $('<p>', {class: 'text-element'});
            var textElementLabel = $('<label>', {'class': 'text-label', 'text': this.Class.LABEL_DESCRIPTION});
            var text = (data !== null && data.hasOwnProperty('data') && data.data !== null && data.data.hasOwnProperty('text') && data.data.text !== null) ? data.data.text.join('\n') : '';
            var textContainer = $('<textarea>', {class: 'text-element', text: text});
            textElement.append(textElementLabel);
            textElement.append(textContainer);
            editDataElements.append(textElement);
            textContainer.one('keydown', function () {
                itemElement.addClass('change');
            });
            var actionsElements = $('<div>', {
                'class': 'actions-list'
            });
            var saveElement = $('<button>', {
                'class': 'save ' + this.Class.classCssEditForm
            });
            actionsElements.append(saveElement);
            editDataElements.append(actionsElements);
            itemElement.append(editDataElements);
            return itemElement;
        },

        /**
         * In charge to update metadata block
         */
        updataFormHeader: function () {
            var metadataBlock = this.mediaPlayer.getBlockMetadata(this.metadataId);
            if (metadataBlock !== null && typeof metadataBlock === "object" && metadataBlock.hasOwnProperty('label')) {
                this.container.find('div.heading').removeClass('off').addClass('on');
                this.container.find('div.heading p.title').html(metadataBlock.label);
            }
            else {
                this.container.find('div.heading').removeClass('on').addClass('off');
            }
        },
        /**
         * Update form items
         */
        updateFormItems: function () {
            var listOfSelectedItemsElement = this.container.find('ul.listOfSelectedItems');
            listOfSelectedItemsElement.empty();
            this.localisationManager.updateLocBlock(this.mediaPlayer.getMetadataById(this.metadataId));
            var listOfMetadata = this.mediaPlayer.getMetadataById(this.metadataId);
            if (listOfMetadata !== null) {
                for (var i = 0;
                     i < listOfMetadata.length;
                     i++) {
                    var data = listOfMetadata[i];
                    if (data !== null && data.hasOwnProperty('tcin') && data.tcin >= this.mediaPlayer.getTcOffset()) {
                        listOfSelectedItemsElement.append(this.createItem(data));
                    }
                }
                listOfSelectedItemsElement.find('li.item .thumb .capture').on('click', {
                        self: this
                    },
                    this.onClickToCapture);
                //add on click item for seek to item tcin
                listOfSelectedItemsElement.find('li.item').on('click', {
                        self: this
                    },
                    this.onSelectItem);
                listOfSelectedItemsElement.find('li.item .edit-form .save').on('click', {
                        self: this
                    },
                    this.onSaveItem);
            }
        },

        updateCaptureImage: function (element) {
            var thumb = this.mediaPlayer.getCurrentImage();
            var metadata = element.data("metadata");
            if (typeof metadata !== "undefined") {
                metadata.thumb = thumb;
                element.find('.thumb').css('background-image', "url(" + thumb + ")");
            }
        },
        saveItem: function (element) {
            var texts = element.find('.edit-form textarea.text-element').val().split('\n');
            var metadata = element.data("metadata");
            if (typeof metadata !== "undefined") {
                if (metadata.data === null || typeof metadata.data === "undefined") {
                    metadata.data = {};
                }
                metadata.data.text = texts;
            }
            element.removeClass('change');
        },
        /**
         * Set player events
         * @method defineListeners
         */
        defineListeners: function () {
            var mainContainer = this.mediaPlayer.getContainer();
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                self: this
            }, this.onDataChange);
            //On select metadata
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE, {
                self: this
            }, this.onSelectedMetadataChange);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "definePlayerListeners");
            }
        },
        /**
         * Fired on data change event
         * @method onDataChange
         * @param {Object} event
         * @param {Object} data
         */
        onDataChange: function (event, data) {
            if (event.data.self.metadataId !== null && event.data.self.metadataId === data.id) {
                event.data.self.updataFormHeader();
                event.data.self.updateFormItems();
                if (event.data.self.logger !== null) {
                    event.data.self.logger.trace(event.data.self.Class.fullName, "onSelectedItemsChange");
                }
            }
        },
        /**
         * Fired on selected metadata change
         * @method onSelectedMetadataChange
         * @param {Object} event
         * @param {Object} data
         */
        onSelectedMetadataChange: function (event, data) {
            event.data.self.metadataId = data.metadataId !== null ? data.metadataId.toString() : null;
            event.data.self.updataFormHeader();
            event.data.self.updateFormItems();
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSelectedMetadataChange:" + data.metadataId);
            }
        },
        /**
         * Fired on selected metadata change
         * @method onSelectItem
         * @param {Object} event
         * @param {Object} data
         */
        onSelectItem: function (event) {
            event.data.self.container.find('ul.listOfSelectedItems').find('li.item').removeClass('on');
            $(event.currentTarget).addClass('on');
            var metadata = $(event.currentTarget).data('metadata');
            if (metadata.hasOwnProperty('tcin') === true && metadata.tcin !== null) {
                event.data.self.mediaPlayer.setCurrentTime(parseFloat(metadata.tcin));
            }
            else if (metadata.hasOwnProperty('tc') === true && metadata.tc !== null) {
                event.data.self.mediaPlayer.setCurrentTime(parseFloat(metadata.tc));
            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSelectItem");
            }
        },
        /**
         * Fired on click to capture icon
         * @method onClickToCapture
         * @param {Object} event
         * @param {Object} data
         */
        onClickToCapture: function (event) {
            event.data.self.updateCaptureImage($(event.currentTarget).parents('li').first());
            event.preventDefault();
            event.stopPropagation();
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickToCapture");
            }
        },
        /**
         * Fired on click to save item
         * @method onSaveItem
         * @param {Object} event
         * @param {Object} data
         */
        onSaveItem: function (event) {
            event.preventDefault();
            event.data.self.saveItem($(event.currentTarget).parents('li').first());
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickToCapture");
            }
        }
    });

