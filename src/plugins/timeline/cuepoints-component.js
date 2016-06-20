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
 * In charge to handle cue point component
 * @class CuepointsComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @extends fr.ina.amalia.player.plugins.timeline.BaseComponent
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.timeline.BaseComponent.extend("fr.ina.amalia.player.plugins.timeline.CuepointsComponent", {
        eventTypes: {
            DATA_CHANGE: "fr.ina.amalia.player.plugins.timeline.CuepointsComponent.eventTypes.DATA_CHANGE"
        },
        ComponentClassCss: "cuepoints-component",
        ComponentModuleClassCss: "module-cuepoints",
        COMPONENT_NAME: 'cuepoint'
    },
    {
        /**
         * In charge to initialize cue point component
         * @method initialize
         */
        initialize: function () {
            this._super();
            this.mainContainer.on('click', '.cuepoint', {
                self: this
            }, this.onClickAtCuepoint);
            if (this.settings.editable === true && this.settings.selectable === true) {

                this.mainContainer.find('.module-cuepoints').selectable({
                    filter: '.item',
                    stop: $.proxy(this.onSelectStop, this)
                });

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
        createCuePointElement: function (tc, percentPos, title, level) {
            var self = this;
            var icon = (typeof this.settings.icon !== "undefined" && this.settings.icon !== "" ) ? this.settings.icon : 'circle';
            var container = $('<i>', {
                'class': 'item cuepoint ajs-icon ajs-icon-' + icon,
                'style': 'left: ' + percentPos + '%; color:' + this.settings.color + ';',
                'title': title,
                'data-tc': tc,
                'data-tclevel': level
            });

            if (this.settings.editable === true) {
                // draggable
                container.draggable({
                    axis: "x",
                    drag: function (event, ui) {

                        var targetElement = $(event.target);
                        var parentElement = targetElement.parent();
                        var newLeft = Math.max(0, ui.position.left);
                        ui.position.left = Math.min(parentElement.first().width(), newLeft);
                        var dragTc = self.zTcin + parseFloat(((self.zTcout - self.zTcin) * newLeft) / self.mainContainer.first().width());
                        if (event.shiftKey === true) {
                            var dataOffsetTc = dragTc - targetElement.data('metadata').tc;
                            container.attr('title', 'Offset seconds : ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(dataOffsetTc, self.settings.framerate, 'seconds'));
                        }
                        else {
                            container.attr('title', fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(dragTc, self.settings.framerate, self.settings.timeFormat));
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
         * @param {Object} data
         */
        addItem: function (data) {
            if (data.hasOwnProperty('tc')) {
                //Item tc
                var tc = parseFloat(data.tc);
                //Global tc
                var gtc = this.tcout - this.tcin;
                var percentPos = ((tc - this.tcin) * 100) / gtc;
                var lineContent = this.mainContainer.find('.line-content').first();
                var title = (data.hasOwnProperty('label') === true && data.label !== '' && data.label !== null) ? data.label : 'Tc: ' + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(tc, this.settings.framerate, this.settings.timeFormat);
                var itemContainer = null;
                var selectedData = (data.hasOwnProperty('selected') && data.selected === true);
                if (tc >= this.tcin && tc <= this.tcout) {
                    itemContainer = this.createCuePointElement(tc, percentPos, title, data.tclevel);
                    itemContainer.data('metadata', data);
                    if (selectedData) {
                        itemContainer.addClass('selected');
                        if (data.hasOwnProperty('formCreated') && data.formCreated === false) {
                            this.mainContainer.trigger(this.Class.CLICK_SELECT, {
                                tc: tc,
                                metadata: data
                            });
                        }
                    }
                    //set type
                    if (data.hasOwnProperty('type') && data.type !== null) {
                        itemContainer.attr('data-item-type', data.type);
                    }
                    lineContent.append(itemContainer);
                    if (this.logger !== null) {
                        this.logger.trace(this.Class.fullName, "addItem tcin: " + this.tcin + " tcout: " + this.tcout + " tc:" + tc + " percentPos:" + percentPos);
                    }
                }
            }
        },
        /**
         * In charge to remove items
         */
        removeItems: function () {
            this.mainContainer.find('.line-content .cuepoint').remove();
        },
        /** events* */
        /**
         * Fired on click event at the cue point
         * @method onClickAtSegment
         * @param {Object} event
         * @event fr.ina.amalia.player.components.CuepointsComponent.eventTypes.CLICK
         */
        onClickAtCuepoint: function (event) {
            event.stopPropagation();
            var currentTarget = $(event.currentTarget);
            var tc = parseFloat(currentTarget.data('tc'));
            var data = $(event.currentTarget).data('metadata');
            // Alt+Click
            if (event.ctrlKey && event.altKey && data.selected !== true && event.data.self.settings.editable === true) {
                currentTarget.addClass('selected');
                event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_SELECT, {
                    tc: tc,
                    metadata: data
                });
            } else if (event.altKey && event.data.self.settings.editable === true) {
                event.data.self.clearSelectedItems();
                currentTarget.addClass('selected');
                event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_SELECT, {
                    tc: tc,
                    metadata: data
                });
            }
            else {
                event.data.self.clearSelectedItems();
                event.data.self.mainContainer.trigger(event.data.self.Class.CLICK_TC, {
                    tc: tc
                });
            }
            if (event.data.self.logger !== null) {
                event.data.self.logger.trace(event.data.self.Class.fullName, "onClickAtCuepoint tc:" + tc);
            }
        },
        /**
         * Fired on drag stop event
         * @method onDragStop
         * @param {Object} event
         */
        onDragStop: function (event) {
            var currentTarget = $(event.currentTarget);
            var tc = event.data.self.zTcin + parseFloat(((event.data.self.zTcout - event.data.self.zTcin) * currentTarget.position().left) / event.data.self.mainContainer.first().width());
            if (event.shiftKey === true) {
                var offsetTc = tc - currentTarget.data('metadata').tc;
                event.data.self.localisationManager.shiftLocBlock(event.data.self.mediaPlayer.getMetadataById(event.data.self.getMetadataId()), offsetTc, event.data.self.mediaPlayer.getTcin(), event.data.self.mediaPlayer.getTcout(), event.altKey);
            }
            else {
                currentTarget.data('metadata').tc = tc;
                if (currentTarget.data('metadata').hasOwnProperty('tcin')) {
                    currentTarget.data('metadata').tcin = tc;
                }
            }
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
            this.mainContainer.find('.module-cuepoints').find('.item.ui-selected').each(function (i, e) {
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
            this.mainContainer.find('.module-cuepoints').selectable("option", "cancel", ".item");
        }
    });
