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
fr.ina.amalia.player.plugins.timeline.BaseComponent("fr.ina.amalia.player.plugins.timeline.SegmentsComponent", {
        ComponentClassCss: "segments-component",
        ComponentModuleClassCss: "module-segments",
        COMPONENT_NAME: 'segment',
        eventTypes: {
            DATA_CHANGE: "fr.ina.amalia.player.plugins.timeline.SegmentsComponent.eventTypes.DATA_CHANGE"
        }
    },
    {
        initialize: function () {
            this._super();
            this.mainContainer.on('dblclick ', '.segment', {
                self: this
            }, this.onDBLClickAtSegment);
            this.mainContainer.on('click', '.segment', {
                self: this
            }, this.onClickAtSegment);
            if (this.settings.editable === true && this.settings.selectable === true) {
                this.mainContainer.find('.module-segments').selectable({
                    filter: '.item',
                    stop: $.proxy(this.onSelectStop, this)
                });
            }
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
        createSegmentElement: function (tcin, tcout, percentWidth, width, title) {
            var self = this;
            var color = (this.settings.color !== "") ? 'color:' + this.settings.color + '; background-color:' + this.settings.color + ';' : '';
            var styleClass = (this.settings.marker === true) ? 'item segment marker' : 'item segment';
            var container = $('<div>', {
                class: styleClass,
                style: 'left: ' + percentWidth + '%; width:' + width + '%;' + color,
                title: title,
                'data-tc': tcin,
                'data-tcin': tcin,
                'data-tcout': tcout
            });
            // Le composant sera dragable pour le mode édition
            if (this.settings.editable === true) {
                // resizable
                container.resizable({
                    handles: 'e,w',
                    ghost: true,
                    helper: "ui-resizable-helper",
                    start: function (event, ui) {
                        var parentElement = $(event.target).parent();
                        var maxWidth = parentElement.width() - ui.element.position().left;
                        // Limit la largeur max
                        $(event.target).resizable("option", "maxWidth", maxWidth);
                        var targetOriginalEventElement = $(event.originalEvent.target);
                        $(ui.element).data('resizeTcin', targetOriginalEventElement.hasClass('ui-resizable-w'));
                        $(ui.element).data('resizeTcout', targetOriginalEventElement.hasClass('ui-resizable-e'));
                    },
                    resize: function (event, ui) {
                        var resizeTcin = parseFloat(((self.zTcout - self.zTcin) * Math.max(0,ui.position.left)) / self.mainContainer.first().width()) + self.zTcin;
                        var resizeTcout = tcin + parseFloat(((self.zTcout - self.zTcin) * ui.size.width) / self.mainContainer.first().width());
                        container.attr('title', 'Tc in : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(resizeTcin, self.settings.framerate, self.settings.timeFormat) + '\n Tc out : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(resizeTcout, self.settings.framerate, self.settings.timeFormat));
                        self.updateTooltip();
                    }

                });
                container.on("resizestop", {
                    self: this
                }, this.onResizeStop);
                // draggable
                container.draggable({
                    axis: "x",
                    drag: function (event, ui) {
                        var targetElement = $(event.target);
                        var parentElement = targetElement.parent();
                        var newLeft = Math.max(0, ui.position.left);
                        ui.position.left = Math.min(parentElement.first().width() - targetElement.width(), newLeft);
                        var dragTcin = parseFloat(((self.zTcout - self.zTcin) * ui.position.left) / self.mainContainer.first().width()) + self.zTcin;
                        var dragTcout = parseFloat(((self.zTcout - self.zTcin) * targetElement.width()) / self.mainContainer.first().width()) + dragTcin;

                        if (event.shiftKey === true) {
                            var dataOffsetTc = dragTcin - targetElement.data('metadata').tcin;
                            container.attr('title', 'Offset seconds : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(dataOffsetTc, self.settings.framerate, 'seconds'));
                        }
                        else {
                            container.attr('title', 'Tc in : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(dragTcin, self.settings.framerate, self.settings.timeFormat) + '\n Tc out : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(dragTcout, self.settings.framerate, self.settings.timeFormat));
                        }
                        self.updateTooltip();
                    }
                });
                container.on("dragstop", {
                    self: this
                }, this.onDragStop);
                container.css("position", "absolute");
            }
            return container;
        },
        /**
         * In charge to add item
         * @method addItem
         * @param {Object} data
         */
        addItem: function (data) {
            if (data.hasOwnProperty('tcin') && data.hasOwnProperty('tcout')) {
                var tcin = parseFloat((this.zoomable === false) ? this.tcOffset : this.tcin);
                var tcout = parseFloat((this.zoomable === false) ? this.duration : this.tcout);
                var itemTcin = parseFloat(data.tcin);
                var itemTcout = parseFloat(data.tcout);

                var duration = tcout - tcin;
                var width = ((itemTcout - itemTcin) * 100) / duration;
                var percentWidth = ((itemTcin - tcin) * 100) / duration;
                var title = null;
                var selectedData = (data.hasOwnProperty('selected') && data.selected === true);
                if ((data.hasOwnProperty('label') === true && data.label !== '' && data.label !== null)) {
                    title = data.label;
                }
                else {
                    title = 'Tc in : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(itemTcin, this.settings.framerate, this.settings.timeFormat) + '\n Tc out : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(itemTcout, this.settings.framerate, this.settings.timeFormat);
                }

                var lineContent = this.mainContainer.find('.line-content').first();
                var itemContainer = null;
                if (itemTcin < tcout && itemTcout > tcin) {
                    itemContainer = this.createSegmentElement(itemTcin, itemTcout, percentWidth, width, title);
                    itemContainer.data('metadata', data);
                    if (selectedData) {
                        //Add style
                        itemContainer.addClass('selected');
                    }
                    if (selectedData && data.hasOwnProperty('formCreated') && data.formCreated === false) {
                        this.mainContainer.trigger(this.Class.CLICK_SELECT, {
                            tc: itemTcin,
                            metadata: data
                        });
                    }
                    //set type
                    if (data.hasOwnProperty('type') && data.type !== null) {
                        itemContainer.attr('data-item-type', data.type);
                    }
                    lineContent.append(itemContainer);
                    if (this.logger !== null) {
                        this.logger.trace(this.Class.fullName, "addItem tcin: " + tcin + " tcout: " + tcout + " itemTcin:" + itemTcin + " itemTcout:" + itemTcout + " percentWidth:" + percentWidth);
                    }
                }
            }
        },
        /**
         * In charge to remove items
         * @method removeItems
         */
        removeItems: function () {
            var lineContent = this.mainContainer.find('.line-content').first();
            lineContent.find('.segment').remove();
        },
        /**
         * Fired on click event
         * @method onClickAtSegment
         * @param {Object} event
         * @event fr.ina.amalia.player.components.SegmentsComponent.eventTypes.CLICK
         */
        onClickAtSegment: function (event) {
            event.stopPropagation();
            var currentTarget = $(event.currentTarget);
            var tcin = parseFloat(currentTarget.data('tcin'));
            var data = $(event.currentTarget).data('metadata');
            // Alt+Click
            if (event.altKey && event.data.self.settings.editable === true && typeof data === "object" && data.selected !== true) {
                currentTarget.addClass('selected');
                event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_SELECT, {
                    tc: tcin,
                    metadata: data
                });
            }
            else {
                event.data.self.clearSelectedItems();
                event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_TC, {
                    tc: tcin,
                    metadata: data
                });
            }

            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickAtSegment tcin:" + tcin);
            }
        },
        /**
         * Fired on click event
         * @method onClickAtSegment
         * @param {Object} event
         * @event fr.ina.amalia.player.components.SegmentsComponent.eventTypes.CLICK
         */
        onDBLClickAtSegment: function (event) {
            var currentTarget = $(event.currentTarget);
            var tcin = parseFloat(currentTarget.data('tcin'));
            var data = $(event.currentTarget).data('metadata');
            event.preventDefault();
            if (event.data.self.settings.editable === true && typeof data === "object") {
                event.data.self.clearSelectedItems();
                if (data.hasOwnProperty("selected") && data.selected === true) {
                    currentTarget.removeClass('selected');
                    event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_REMOVE_SELECT_ITEM, {
                        tc: tcin,
                        metadata: data
                    });
                }
                else {
                    currentTarget.addClass('selected');
                    event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_SELECT, {
                        tc: tcin,
                        metadata: data
                    });
                }

            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onDBLClickAtSegment tcin:" + tcin);
            }
        },
        /**
         * Fired on drag stop event
         * @method onDragStop
         * @param {Object} event
         */
        onDragStop: function (event) {
            var currentTarget = $(event.currentTarget);
            var zTcin = parseFloat((event.data.self.zoomable === false) ? event.data.self.tcOffset : event.data.self.zTcin);
            var zTcout = parseFloat((event.data.self.zoomable === false) ? event.data.self.duration : event.data.self.zTcout);
            var tcin = parseFloat(((zTcout - zTcin) * currentTarget.position().left) / event.data.self.mainContainer.first().width()) + zTcin;
            var tcout = parseFloat(((zTcout - zTcin) * currentTarget.width()) / event.data.self.mainContainer.first().width()) + tcin;
            if (event.shiftKey === true) {
                var offsetTc = tcin - currentTarget.data('metadata').tcin;
                event.data.self.localisationManager.shiftLocBlock(event.data.self.mediaPlayer.getMetadataById(event.data.self.getMetadataId()), offsetTc, event.data.self.mediaPlayer.getTcin(), event.data.self.mediaPlayer.getTcout(), event.altKey);
            }
            else {
                currentTarget.data('metadata').tcin = tcin;
                currentTarget.data('metadata').tcout = tcout;
            }
            event.data.self.mainContainer.trigger(event.data.self.Class.eventTypes.DATA_CHANGE, {
                id: event.data.self.getMetadataId()
            });
        },
        /**
         * Fired on resize stop event
         * @method onResizeStop
         * @param {Object} event
         */
        onResizeStop: function (event, ui) {
            var currentTarget = $(event.currentTarget);
            var zTcin = parseFloat((event.data.self.zoomable === false) ? event.data.self.tcOffset : event.data.self.zTcin);
            var zTcout = parseFloat((event.data.self.zoomable === false) ? event.data.self.duration : event.data.self.zTcout);
            var tcin = parseFloat(((zTcout - zTcin) * Math.max(0,currentTarget.position().left)) / event.data.self.mainContainer.first().width()) + zTcin;
            var tcout = tcin + parseFloat(((zTcout - zTcin) * currentTarget.width()) / event.data.self.mainContainer.first().width());
            // Fix for resize only one side
            var element = $(ui.element);
            if (element.data('resizeTcin') === true) {
                $(event.currentTarget).data('metadata').tcin = tcin;
            }
            if (element.data('resizeTcout') === true) {
                $(event.currentTarget).data('metadata').tcout = tcout;
            }
            event.data.self.updateTooltip();
            event.data.self.mainContainer.trigger(event.data.self.Class.eventTypes.DATA_CHANGE, {
                id: event.data.self.getMetadataId()
            });
        },
        /**
         * Triggered at the end of the select operation.
         */
        onSelectStop: function () {
            this.clearSelectedItems();
            var self = this;
            this.mainContainer.find('.module-segments').find('.item.ui-selected').each(function (i, e) {
                var element = $(e);
                element.addClass('selected');
                var metadata = element.data('metadata');
                if (metadata !== null) {
                    metadata.selected = true;
                    self.mainContainer.trigger(self.Class.CLICK_SELECT, {
                        tc: metadata.tc,
                        metadata: metadata
                    });
                }
            });
            this.mainContainer.find('.module-segments').selectable("option", "cancel", ".item");
        }
    });
