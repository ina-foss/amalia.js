/**
 * Copyright (c) 2015-2023 Institut National de l'Audiovisuel, INA
 *
 * This file is part of amalia.js
 *
 * Amalia.js is free software: you can redistribute it and/or modify it under
 * the terms of the MIT License
 *
 * Redistributions of source code, javascript and css minified versions must
 * retain the above copyright notice, this list of conditions and the following
 * disclaimer
 *
 * Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission
 *
 * You should have received a copy of the MIT License along with
 * amalia.js. If not, see <https://opensource.org/license/mit/>
 *
 * Amalia.js is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.
 */
/**
 * Base class on all components used in timeline plugin
 * @class BaseComponent
 * @namespace fr.ina.amalia.player.plugins.timeline
 * @module plugin
 * @submodule plugin-timeline
 * @constructor
 * @param {Object} settings
 * @param {Object} container
 */
$.Class("fr.ina.amalia.player.plugins.timeline.DefaultConfiguration", {
    tooltipConfiguration: {
        position: {
            my: "center bottom-20",
            at: "center top",
            delay: 3000,
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>").addClass("ajs-arrow").addClass(feedback.vertical).addClass(feedback.horizontal).appendTo(this);
            }
        },
        content: function () {
            var element = $(this);
            var title = element.attr('title');
            if (element.is("[data-src]")) {
                var src = element.attr('data-src');
                return "<img class='image' alt='" + title + "' src='" + src + "' />";
            }
            else {
                title = title.replace(/(?:\r\n|\r|\n)/g, '<br />');
                return "<p>" + title + "</p>";
            }
        }
    }
}, {});
