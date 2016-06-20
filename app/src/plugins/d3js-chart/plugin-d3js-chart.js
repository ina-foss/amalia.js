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
 * In charge to manage annotations
 * @class AnnotationPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-annotation
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings
 * @param {Object} container
 */
fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.extend("fr.ina.amalia.player.plugins.D3JsChartPlugin", {
        classCss: "ajs-plugin plugin-db3-js-chart",
        COMPONENT_NAME: "focus-component",
        eventTypes: {}
    },
    {
        /**
         * Main container of this plugin
         * @property container
         * @type {Object}
         * @default []
         */
        container: null,
        /**
         * true if load data started anw
         * @property loadDataStarted
         * @default null
         */
        loadDataStarted: false,
        /**
         * List of id to deal
         * @property loadDataStarted
         * @default null
         */
        dataToDeal: null,

        /**
         * List of id to deal
         * @property loadDataStarted
         * @default null
         */
        selectedItem: null,
        /**
         * List of id to deal
         * @property loadDataStarted
         * @default null
         */
        chart: null,
        /**
         * Tc in
         * @property tcin
         * @default 0
         */
        tcin: 0,
        /**
         * Tc out
         * @property tcout
         * @default 0
         */
        tcout: 0,

        /**
         * Initialize watermark plugin and create container of this plugin
         * @method initialize
         */
        initialize: function () {
            this.loadDataStarted = true;
            this.selectedItem = null;
            this.dataToDeal = [];
            this.chart = null;
            this.tcin = 0;
            this.tcout = 0;
            this._super();
            this.settings = $.extend({
                defaultColor: "#00CCCC",
                rightClickAction: null,
                framerate: '25',
                timeFormat: 'f',
                timecursor: true,
                colors: [
                    "#0d8bc7", // Secondaire
                    "#00CC99", // Primaire
                    "#AE4CFF",
                    "#00FFDA",
                    "#FF654C",
                    "#18B8FF",
                    "#FF38A0",
                    "#A9FF78",
                    "#FF9500",
                    "#00C7FF",
                    "#FF1986",
                    "#D7FF19",
                    "#FFD907",
                    "#4CFFEE",
                    "#FF00AD",
                    "#82FF4C"
                ],
                withFocus: false,
                callbacks: [
                    {
                        label: 'voir',
                        callback: ''
                    }
                ]
            }, this.settings.parameters || {});

            this.container = $('<div>', {
                'class': this.Class.classCss
            });
            this.pluginContainer.append(this.container);
            // Set default data type managed by this plugin.
            this.registerMetadataType();
            // Set Player events
            this.definePlayerListeners();
            this.loaderContainer.show();
        },
        /**
         * In charge to register data type managed by this plugin.
         * @method registerMetadataType
         */
        registerMetadataType: function () {
            this.listOfMetadataTypes = [];
            this.addManagedMetadataType(fr.ina.amalia.player.PluginBindingManager.dataTypes.HISTOGRAM);
        },

        /**
         * Set player events
         * @method defineListeners
         */
        definePlayerListeners: function () {
            var mainContainer = this.mediaPlayer.getContainer();
            // Player events
            mainContainer.one(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, $.proxy(this.onPluginReady, this));
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.BEGIN_DATA_CHANGE, $.proxy(this.onBeginDataChange, this));
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.END_DATA_CHANGE, $.proxy(this.onEndDataChange, this));
            mainContainer.on(fr.ina.amalia.player.PlayerEventType.DATA_CHANGE, $.proxy(this.onDataChange, this));
            if (this.settings.timecursor === true) {
                mainContainer.on(fr.ina.amalia.player.PlayerEventType.TIME_CHANGE, $.proxy(this.onTimeupdate, this));
            }
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "DefinePlayerListeners");
            }
        },
        /**
         * Initialize plugin on load start
         * @method initializeOnLoadStart
         * @returns {undefined}
         */
        initializeOnLoadStart: function () {
            this.tcin = this.mediaPlayer.getTcOffset();
            this.tcout = this.tcin + this.mediaPlayer.getDuration();
            this.createPluginContainer();
            this.loaderContainer.hide();
            this.createChart();
            this.defineEventListeners();
        },

        /**
         * Set events on  load start
         * @method defineEventListeners
         */
        defineEventListeners: function () {
            var mainContainer = this.mediaPlayer.getContainer();
            if (this.settings.withFocus === true) {
                // resizable
                this.container.find('.focus-container .' + this.Class.COMPONENT_NAME).resizable({
                    handles: 'w,e',
                    containment: "parent",
                    create: function (event) {
                        $(event.target).find('div.ui-resizable-handle').addClass('ajs-icon ajs-icon-reorder');
                    },
                    // start: $.proxy(this.onResizeStart, this),
                    stop: $.proxy(this.onResizeStop, this)
                });
                // draggable
                this.container.find('.focus-container .' + this.Class.COMPONENT_NAME).draggable({
                    axis: "x",
                    containment: "parent",
                    stop: $.proxy(this.onDragStop, this)
                });
            }
            if (this.settings.metadataId === '') {
                mainContainer.on(fr.ina.amalia.player.PlayerEventType.SELECTED_METADATA_CHANGE, $.proxy(this.onSelectedMetadataChange, this));
            }
        },

        /**
         * In charge to create plugin annotation elements
         * @method createPluginAnnotationElements
         */
        createPluginContainer: function () {
            var componentContainer = $('<div>', {
                'class': 'components ajs-margin-top'
            });
            var component = this.createComponent(this.settings.title);
            componentContainer.append(component);
            this.container.append(componentContainer);
        },

        /**
         * In charge to create component
         * @method createComponent
         */
        createComponent: function (title) {

            var component = $('<div>', {
                'class': 'component'
            });

            var timelineCursor = $('<div>', {
                'class': "timeline-cursor"
            });

            var msgContainer = $('<p>', {
                'class': "title"
            });
            msgContainer.html(title);

            var lineContainerElement = $('<div>', {
                'class': 'module-chart'
            });
            lineContainerElement.append('<svg><svg/>');
            var lineElement = $('<div>', {
                'class': 'line'
            });
            component.append(timelineCursor);
            component.append(msgContainer);
            component.append(lineContainerElement);
            component.append(lineElement);
            if (this.settings.withFocus === true) {
                var focusContainer = $('<div>', {
                    'class': "focus-container"
                });
                var focusComponent = $('<div>', {
                    'class': this.Class.COMPONENT_NAME
                });
                focusContainer.append(focusComponent);
                component.append(focusContainer);
            }

            return component;
        },

        /**
         * In charge to create chart
         * @method createComponent
         */
        createChart: function () {
            var self = this;
            nv.addGraph({
                generate: function () {
                    // Set chart
                    self.chart = nv.models.multiBarChart()
                        .staggerLabels(true)
                        .stacked(true)
                        .showYAxis(false)
                        .color(self.settings.colors)
                        .controlLabels({
                            "grouped": fr.ina.amalia.player.PlayerMessage.PLUGIN_D3JS_CHART_LABELS[0],
                            "stacked": fr.ina.amalia.player.PlayerMessage.PLUGIN_D3JS_CHART_LABELS[1]
                        })
                        .margin({"left": 0, "right": 0, "top": 0, "bottom": 50});
                    self.chart.xAxis.tickFormat(function (d) {
                        return fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(d, self.settings.framerate, self.settings.timeFormat);
                    });
                    self.updateChartData();
                    nv.utils.windowResize(self.chart.update);
                    self.chart.multibar.dispatch.on("elementClick", $.proxy(self.onClick, self));
                    return self.chart;
                }
            });
        },

        /**
         * In charge to update chart data
         * @method createComponent
         */
        updateChartData: function () {
            var listOfChartValue = [];
            for (var idx in this.dataToDeal) {
                var metadataObject = this.mediaPlayer.getBlockMetadata(this.dataToDeal[idx]);
                var metadataId = this.dataToDeal[idx].toString();
                var label = (metadataObject !== null && metadataObject.hasOwnProperty('label')) ? metadataObject.label === "-" ? "" : metadataObject.label : metadataId;
                var listOfLocalisations = this.mediaPlayer.getMetadataById(metadataId);
                this.sortListOfData(listOfLocalisations);
                listOfChartValue.push(
                    {
                        key: label,
                        values: $.map(listOfLocalisations, function (val) {
                            return {
                                x: val.tc,
                                y: val.score
                            };
                        })
                    }
                );
            }
            d3.select(this.container.find('.module-chart svg').get(0))
                .datum(listOfChartValue)
                .transition().duration(500)
                .call(this.chart);
        },
        sortListOfData: function (listOfLocalisations) {
            // sort by tc
            listOfLocalisations.sort(function (a, b) {
                // convert to integers from strings
                a = parseInt(a.tc);
                b = parseInt(b.tc);
                // compare
                if (a > b) {
                    return 1;
                }
                else if (a < b) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
        },
        /**
         * Return focus start time code
         * @method getFocusTcin
         * @returns {Number}
         */
        getFocusTcin: function () {
            var duration = this.tcout - this.tcin;
            var selectedTcin = parseFloat((duration * this.container.find(".focus-container ." + this.Class.COMPONENT_NAME).first().position().left) / this.container.find('.focus-container').first().width());
            return Math.max(this.tcin, this.tcin + selectedTcin);
        },

        /**
         * Return focus end time code
         * @returns {Number}
         */
        getFocusTcout: function () {
            var focusTcin = this.getFocusTcin();
            var duration = this.tcout - this.tcin;
            var selectedTcout = parseFloat((duration * (this.container.find(".focus-container ." + this.Class.COMPONENT_NAME).first().width())) / this.container.find('.focus-container').first().width());
            return Math.min(this.tcout, focusTcin + selectedTcout);
        },

        /**
         * Trigger select zone change
         * @method selectedZoneChange
         * @returns {Number}
         */
        selectedZoneChange: function () {
            var focusTcin = this.getFocusTcin();
            var focusTcout = this.getFocusTcout();
            var mainContainer = this.mediaPlayer.getContainer();
            // Trigger Focus event
            mainContainer.trigger(fr.ina.amalia.player.PlayerEventType.ZOOM_RANGE_CHANGE, {
                focusTcin: focusTcin,
                focusTcout: focusTcout
            });
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "selectedZoneChange trigger event :  focusTcin:" + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(focusTcin, this.settings.framerate, this.settings.timeFormat) + " focusTcout:" + fr.ina.amalia.player.helpers.UtilitiesHelper.formatTime(focusTcout, this.settings.framerate, this.settings.timeFormat));
            }
        },

        updateTimelinePos: function (currentTime) {
            var tc = parseFloat(currentTime);
            var gtc = this.tcout - this.tcin;
            this.container.find('.timeline-cursor').css('left', ((tc - this.tcin) * 100) / gtc + '%');
        },

        /** Player Events * */
        /**
         * Fired when plugin ready event
         * @method onPluginReady
         * @param {Object} event
         */
        onPluginReady: function () {
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onPluginReady");
            }
        },

        /**
         * Fired on begin data change event
         * @method onBeginDataChange
         * @param {Object} event
         */
        onBeginDataChange: function () {
            this.loadDataStarted = true;
            this.dataToDeal = [];
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onBeginDataChange");
            }
        },

        /**
         * Fired on data change event
         * @param {Object} event
         * @param {Object} data
         */
        onDataChange: function (event, data) {
            if (this.loadDataStarted === true) {
                var metadataObject = this.mediaPlayer.getBlockMetadata(data.id);
                if (this.isManagedMetadataType(metadataObject.type) && $.inArray(data.id, this.dataToDeal) < 0) {
                    this.dataToDeal.push(data.id);
                }
            }
            else {
                this.updateChartData();
            }
        },

        /**
         * Fired on end data change event
         * @method onEndDataChange
         * @param {Object} event
         */
        onEndDataChange: function () {
            this.loadDataStarted = false;
            this.initializeOnLoadStart();
        },

        onClick: function (e) {
            this.mediaPlayer.setCurrentTime(e.data.x);
        },

        /**
         * Fired on selected metadata change
         * @method onSelectedMetadataChange
         */
        onSelectedMetadataChange: function (event, data) {
            this._super(event, data);
        },

        /**
         * Fired on cursor resize stop
         * @param event
         * @param ui
         */
        onResizeStop: function () {
            this.selectedZoneChange();
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onResizeStop");
            }
        },

        /**
         * Fired on cursor drag stop
         * @param event
         * @param ui
         */
        onDragStop: function () {
            this.selectedZoneChange();
            if (this.logger !== null) {
                this.logger.trace(this.Class.fullName, "onDragStop");
            }
        },
        /**
         * Fired on time change event for update time cursor
         * @method onFirstTimechange
         * @param {Object} event
         * @param {Object} data Données renvoyer par l'événement timeupdate.
         */
        onTimeupdate: function (event, data) {
            this.updateTimelinePos(parseFloat(data.currentTime));
        }

    });