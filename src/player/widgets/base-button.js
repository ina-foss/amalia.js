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
 * Base button for control bar with callback function
 * @class BaseButton
 * @namespace fr.ina.amalia.player.plugins.controlBar.widgets
 * @module player
 * @submodule player-controlbar
 * @extends fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase
 */
fr.ina.amalia.player.plugins.controlBar.widgets.WidgetBase.extend( "fr.ina.amalia.player.plugins.controlBar.widgets.BaseButton",{
    classCss : "player-base-button",
    style : ""
},
{
    /**
     * Initialize the component
     * @method initialize
     */
    initialize : function ()
    {
        // Create component
        this.component = $( '<div>',{
            'class' : this.Class.classCss,
            'style' : this.Class.style
        } );
        var buttonContainer = $( "<span>",{
            class : "button-container"
        } );
        var icon = $( '<span>',{
            class : this.parameter.style
        } );
        if (this.parameter.hasOwnProperty( 'title' ) === true)
        {
            icon.attr( 'title',this.parameter.title );
        }
        buttonContainer.append( icon );
        // set events
        this.component.on( 'click',{
            self : this,
            component : this.component
        },
        this.onClick );
        this.component.append( buttonContainer );
        // Add to container
        this.container.append( this.component );

    },
    /**
     * On click event fire callback function
     * @method onClick
     * @param {Object} event
     */
    onClick : function (event)
    {
        if (typeof event.data.self.parameter.callback !== "undefined")
        {
            try
            {
                /* jslint evil: true */
                eval( event.data.self.parameter.callback + '(event.data.self.mediaPlayer, event.data.self.parameter)' );
            }
            catch (e)
            {
                if (event.data.self.logger !== null)
                {
                    event.data.self.logger.warn( "Send callback failed." );
                }
            }
        }
    }
} );
