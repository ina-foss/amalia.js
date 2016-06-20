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
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.MetadataItemEditorPlugin", {
        classCss: "ajs-plugin plugin-selected-item-editor",
        addSegmentIcon: "ajs-icon ajs-icon-add-whole-segment",
        msgAddSegment: 'AJOUTER UN SEGMENT INTEGRALE',
        msgValid: 'Créer un élément',
        msgEdit: 'Modifier l\'élément'
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
         * Initialize
         * @method initialize
         */
        initialize: function () {
            this.metadataId = null;
            this.selectedItem = null;
            this._super();
            this.settings = $.extend({
                timeFormat: 'f',
                framerate: this.settings.framerate,
                defaultPercentWidth: 0.1
            }, this.settings.parameters || {});

            this.container = $('<div>', {
                'class': this.Class.classCss
            });
            this.pluginContainer.append(this.container);
            this.createAutoFillUpForm();
            this.createFormContainer();
            this.defineListeners();
        },
        createFormItem: function (id, label, type) {
            var formItem = $('<div>', {
                'class': 'form-item ' + id
            });

            var labelFormItem = $('<input>', {
                'class': 'form-item-' + id,
                'type': type,
                'placeholder': label
            });
            formItem.append(labelFormItem);
            return formItem;
        },
        createControl: function (action, label) {
            var formItem = $('<div>', {
                'class': 'form-item ctrl ' + action
            });

            var controlItem = $('<button>', {
                'class': 'form-ctrl-item-' + action,
                'text': label
            });

            formItem.append(controlItem);

            return formItem;
        },
        createAutoFillUpForm: function () {
            var formContainer = $('<div>', {
                'class': 'auto-fill-up-form'
            });
            var message = $('<div>', {
                'class': 'message',
                'text': this.Class.msgAddSegment
            });
            formContainer.append(message);
            formContainer.append(this.createControl('yes', 'Oui'));
            formContainer.append(this.createControl('no', 'NON'));
            this.container.append(formContainer);
        },
        /**
         * Create metadata list block
         * @method createFormContainer
         */
        createFormContainer: function () {
            var formContainer = $('<div>', {
                'class': 'form'
            });
            //Label
            formContainer.append(this.createFormItem('label', 'Titre', 'text'));
            //Tc in
            formContainer.append(this.createControl('tcin', 'TC-IN'));
            formContainer.append(this.createFormItem('tcin', '00:00:00:00', 'text'));
            //TC Out
            formContainer.append(this.createControl('tcout', 'TC-OUT'));
            formContainer.append(this.createFormItem('tcout', '00:00:00:00', 'text'));
            //Valid
            formContainer.append(this.createControl('valid', this.Class.msgValid));
            //Delete
            formContainer.append(this.createControl('delete', 'Supprimer'));
            formContainer.append(this.createControl('close-item', 'Annuler'));
            //Create full segment
            var c = this.createControl('auto-fill-up', '');
            c.find('button').addClass(this.Class.addSegmentIcon);
            formContainer.append(c);

            this.container.append(formContainer);
        },
        /**
         * Set player events
         * @method defineListeners
         */
        defineListeners: function () {
            // Auto complete form
            this.container.find('.form .form-item .form-ctrl-item-auto-fill-up').on('click', {
                self: this
            }, this.onClickOpenAutoCompletForm);
            this.container.find('.auto-fill-up-form .form-ctrl-item-no').on('click', {
                self: this
            }, this.onClickCloseAutoCompletForm);
            this.container.find('.auto-fill-up-form .form-ctrl-item-yes').on('click', {
                self: this
            }, this.onClickAutoCompletForm);


            //Add Form
            this.container.find('.form .form-ctrl-item-tcin').on('click', {
                self: this
            }, this.onClickToTcin);
            this.container.find('.form .form-ctrl-item-tcout').on('click', {
                self: this
            }, this.onClickToTcout);
            this.container.find('.form .form-item-tcin').on('keyup', {
                self: this
            }, this.onFormValuesChange);
            this.container.find('.form .form-item-tcin').on('change', {
                self: this
            }, this.onFormValuesChange);
            this.container.find('.form .form-item-tcout').on('keyup', {
                self: this
            }, this.onFormValuesChange);
            this.container.find('.form .form-item-tcout').on('change', {
                self: this
            }, this.onFormValuesChange);

            this.container.find('.form .form-item .form-ctrl-item-valid').on('click', {
                self: this
            }, this.onFormValid);
            this.container.find('.form .form-item .form-ctrl-item-delete').on('click', {
                self: this
            }, this.onDeleteItem);
            this.container.find('.form .form-item .form-ctrl-item-close-item').on('click', {
                self: this
            }, this.onCloseItem);

            var mainContainer = this.mediaPlayer.getContainer();
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                self: this
            }, this.onDataChange);
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.SELECTED_ITEMS_CHANGE, {
                self: this
            }, this.onSelectedItemsChange);
            //On select metadata
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE, {
                self: this
            }, this.onSelectedMetadataChange);
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "definePlayerListeners");
            }
        },
        addItem: function () {
            if (this.metadataId !== null) {
                var label = this.container.find('.form input.form-item-label').val();
                var tcin = this.container.find('.form input.form-item-tcin').val();
                var tcout = this.container.find('.form input.form-item-tcout').val();
                //Create new data block
                if (this.selectedItem === null) {
                    var dataList = [
                        {
                            'tcin': fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcin),
                            'tcout': fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcout),
                            'label': (label === "") ? this.getLabel() : label
                        }
                    ];
                    this.mediaPlayer.addMetadataById(this.metadataId, dataList);
                    this.clearSelectedData();
                }
                else if (this.selectedItem !== null && this.selectedItem.hasOwnProperty('label') && this.selectedItem.hasOwnProperty('tcin') && this.selectedItem.hasOwnProperty('tcout')) {
                    this.selectedItem.label = (label === "") ? this.getLabel() : label;
                    this.selectedItem.tcin = fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcin);
                    this.selectedItem.tcout = fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcout);
                    this.clearSelectedData();
                    this.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                        id: this.metadataId
                    });
                }
                //Clear edit mode
                this.container.find('.form').removeClass('edit-mode');
            }
        },
        getLabel: function () {
            var label = "";
            var blockMetadata = this.mediaPlayer.getBlockMetadata(this.metadataId);
            var countLoc = $(this.mediaPlayer.getMetadataById(this.metadataId)).size();
            if (blockMetadata !== null && blockMetadata.hasOwnProperty('label')) {
                label = blockMetadata.label + ' - ' + countLoc;
            }
            return label;
        },
        /**
         * Add auto item with tcin and tcout
         */
        addItemAuto: function () {
            if (this.metadataId !== null) {
                var dataList = [
                    {
                        'tcin': this.mediaPlayer.getTcin(),
                        'tcout': this.mediaPlayer.getTcout(),
                        'label': this.getLabel()
                    }
                ];
                this.mediaPlayer.addMetadataById(this.metadataId, dataList);
                this.clearSelectedData();
                return true;
            }
            return false;
        },
        clearSelectedData: function () {
            if (this.selectedItem !== null && this.selectedItem.hasOwnProperty('selected')) {
                this.selectedItem.selected = false;
            }
            this.selectedItem = null;
            //clear data
            this.container.find('.form').removeClass('edit-mode');
            this.container.find('.form input.form-item-label').val("");
            this.container.find('.form input.form-item-tcin').val("");
            this.container.find('.form input.form-item-tcout').val("");
            this.container.find('.form .form-item .form-ctrl-item-delete').removeClass("on");
            this.container.find('.form .form-item .form-ctrl-item-close-item').removeClass("on");
            this.container.find('.form .form-item .form-ctrl-item-valid').text(this.Class.msgValid);
            this.container.find('.form .form-item .form-ctrl-item-valid').removeClass("valid");
            this.container.find('.form').removeClass("valid");
            this.container.find('.form input.form-item-tcout').removeClass("error").removeClass("valid");
            this.container.find('.form input.form-item-tcin').removeClass("error").removeClass("valid");
        },
        validFormItems: function () {
            var isValid = true;
            var timePattern = /^[0-9]{2}:[0-9]{2}:[0-9]{2}:[0-9]{2}$/;
            var tcin = this.container.find('.form input.form-item-tcin').val();
            var tcout = this.container.find('.form input.form-item-tcout').val();
            if (timePattern.test(tcin) !== true) {
                this.container.find('.form input.form-item-tcin').addClass("error").removeClass("valid");
                isValid = false;
            }
            else {
                this.container.find('.form input.form-item-tcin').removeClass("error").addClass("valid");
            }
            if (timePattern.test(tcout) !== true) {
                this.container.find('.form input.form-item-tcout').addClass("error").removeClass("valid");
                isValid = false;
            }
            else {
                this.container.find('.form input.form-item-tcout').removeClass("error").addClass("valid");
            }

            if (fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcin) >= fr.ina.amalia.player.helpers.UtilitiesHelper.convertTimeFPSToSeconde(tcout)) {
                this.container.find('.form input.form-item-tcin').addClass("error");
                this.container.find('.form input.form-item-tcout').addClass("error");
                isValid = false;
            }
            if (this.selectedItem === null) {
                this.container.find('.form .form-item .form-ctrl-item-delete').removeClass("on");
                this.container.find('.form .form-item .form-ctrl-item-close-item').removeClass("on");
                this.container.find('.form .form-item .form-ctrl-item-valid').text(this.Class.msgValid);
            }
            else {
                this.container.find('.form .form-item .form-ctrl-item-delete').addClass("on");
                this.container.find('.form .form-item .form-ctrl-item-close-item').addClass("on");
                this.container.find('.form .form-item .form-ctrl-item-valid').text(this.Class.msgEdit);
            }
            if (isValid) {
                this.container.find('.form .form-item .form-ctrl-item-valid').addClass("valid");
                this.container.find('.form').addClass("valid");
            }
            else {
                this.container.find('.form .form-item .form-ctrl-item-valid').removeClass("valid");
                this.container.find('.form').removeClass("valid");
            }

            return isValid;
        },

        setTcin: function () {
            this.container.find('.form input.form-item-tcin').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(this.mediaPlayer.getCurrentTime(), this.settings.framerate, this.settings.timeFormat));
            if (this.container.find('.form input.form-item-tcout').val() === "") {
                var tcout = Math.min(this.mediaPlayer.getCurrentTime() + (this.mediaPlayer.getDuration() * Math.min(this.settings.defaultPercentWidth, 1)), this.mediaPlayer.getDuration());
                this.container.find('.form input.form-item-tcout').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(tcout, this.settings.framerate, this.settings.timeFormat));
                this.validFormItems();
                this.container.find('.form input.form-item-tcout').removeClass("error").removeClass("valid");
            }
            else {
                this.validFormItems();
            }

        },
        setTcout: function () {
            this.container.find('.form input.form-item-tcout').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(this.mediaPlayer.getCurrentTime(), this.settings.framerate, this.settings.timeFormat));
            this.validFormItems();
        },
        /**
         * in charge to valid form
         */
        validForm: function () {
            if (this.validFormItems()) {
                this.addItem();
            }
        },

        onFormValuesChange: function (event) {
            event.data.self.validFormItems();
        },
        onClickToTcin: function (event) {
            event.data.self.setTcin();
        },
        onClickToTcout: function (event) {
            event.data.self.setTcout();
        },
        /**
         * Fired on selected item
         * @method onSelectedItemsChange
         * @param {Object} event
         * @param {Object} data
         */
        onSelectedItemsChange: function (event, data) {
            event.data.self.selectedItem = (typeof data !== "undefined" && data.hasOwnProperty("item")) ? data.item : null;

            if (event.data.self.selectedItem !== null && event.data.self.selectedItem.selected === false) {
                event.data.self.selectedItem = null;
                event.data.self.clearSelectedData();
            }
            else if (event.data.self.selectedItem !== null && event.data.self.selectedItem.hasOwnProperty('label') && event.data.self.selectedItem.hasOwnProperty('tcin') && event.data.self.selectedItem.hasOwnProperty('tcout')) {
                event.data.self.container.find('.form').addClass('edit-mode');
                event.data.self.container.find('.form input.form-item-label').val(event.data.self.selectedItem.label);
                event.data.self.container.find('.form input.form-item-tcin').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(event.data.self.selectedItem.tcin, event.data.self.settings.framerate, event.data.self.settings.timeFormat));
                event.data.self.container.find('.form input.form-item-tcout').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(event.data.self.selectedItem.tcout, event.data.self.settings.framerate, event.data.self.settings.timeFormat));
                event.data.self.validFormItems();
            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSelectedItemsChange");
            }
        },
        /**
         * Fired on data change event
         * @method onDataChange
         * @param {Object} event
         */
        onDataChange: function (event) {
            if (event.data.self.selectedItem !== null && event.data.self.selectedItem.hasOwnProperty('label') && event.data.self.selectedItem.hasOwnProperty('tcin') && event.data.self.selectedItem.hasOwnProperty('tcout')) {
                event.data.self.container.find('.form input.form-item-label').val(event.data.self.selectedItem.label);
                event.data.self.container.find('.form input.form-item-tcin').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(event.data.self.selectedItem.tcin, event.data.self.settings.framerate, 'f'));
                event.data.self.container.find('.form input.form-item-tcout').val(fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(event.data.self.selectedItem.tcout, event.data.self.settings.framerate, 'f'));
                event.data.self.validFormItems();
            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onSelectedItemsChange");
            }
        },
        /**
         * Fired on selected metadata change
         * @method onSelectedMetadataChange
         * @param {Object} event
         * @param {Object} data
         */
        onSelectedMetadataChange: function (event, data) {
            event.data.self.mediaPlayer.removeAllSelectedItems();
            event.data.self.metadataId = data.metadataId !== null ? data.metadataId.toString() : null;

        },
        onClickOpenAutoCompletForm: function (event) {
            event.data.self.container.find('.auto-fill-up-form').addClass('on');
        },
        onClickCloseAutoCompletForm: function (event) {
            event.data.self.container.find('.auto-fill-up-form').removeClass('on');
        },
        onClickAutoCompletForm: function (event) {
            event.data.self.addItemAuto();
            event.data.self.container.find('.auto-fill-up-form').removeClass('on');
        },
        onFormValid: function (event) {
            event.data.self.validForm();
        },
        /**
         * In charge to delete item
         * @method onDeleteItem
         * @param {Object} event
         */
        onDeleteItem: function (event) {
            event.data.self.selectedItem.tc = null;
            event.data.self.selectedItem.tcin = null;
            event.data.self.selectedItem.tcout = null;
            event.data.self.selectedItem.label = null;
            event.data.self.selectedItem.selected = false;
            event.data.self.selectedItem.formCreated = false;
            event.data.self.selectedItem.deleted = true;
            event.data.self.selectedItem = null;
            event.data.self.clearSelectedData();

            //Send data change evnet
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                id: event.data.self.metadataId
            });
        },
        onCloseItem: function (event) {
            event.data.self.selectedItem = null;
            event.data.self.mediaPlayer.removeAllSelectedItems();
            event.data.self.mediaPlayer.getContainer().trigger(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, {
                id: event.data.self.metadataId
            });
            event.data.self.clearSelectedData();
        }
    });

