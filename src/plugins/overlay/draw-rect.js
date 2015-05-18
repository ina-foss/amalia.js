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
 * In charge to manage rectangle shape and extend draw base class
 * @class DrawRect
 * @namespace fr.ina.amalia.player.plugins.overlay
 * @module plugin
 * @submodule plugin-overlay
 * @extends fr.ina.amalia.player.plugins.overlay
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 * @param {Object} mediaPlayer
 * @param {Object} data
 */
fr.ina.amalia.player.plugins.overlay.DrawBase.extend( "fr.ina.amalia.player.plugins.overlay.DrawRect",{
    classCss : "spatial-base"

},
{
    /**
     * Initialize component
     * @method initialize
     */
    initialize : function ()
    {
        this.shape = 'rectangle';
        if (this.data.hasOwnProperty( 'tcin' ) && this.data.hasOwnProperty( 'tcout' ) && this.data.hasOwnProperty( 'start' ) && this.data.hasOwnProperty( 'end' ))
        {
            var style = this.getStyle();
            var startCor = this.getRectData( this.data.start );
            var endCor = this.getRectData( this.data.end );
            var duration = parseFloat( this.data.tcout - this.mediaPlayer.getCurrentTime());
            var label = this.data.hasOwnProperty( 'label' ) ? this.data.label : '';
            if (startCor !== null && endCor !== null)
            {
                // Rect
                this.element = this.settings.canvas.rect( startCor.x,startCor.y,startCor.w,startCor.h );
                // style
                this.element.attr( style );
                this.element.transform( "r" + Math.round( (startCor.o / Math.PI) * 180 ) );
                this.element.attr( {
                    'cursor' : 'pointer'
                } );
                this.element.data( 'demo',this.settings.demo );
                this.element.data( 'self',this );
                // Label
                if (this.settings.labels === true && label !== '')
                {
                    this.labelElement = this.settings.canvas.text( startCor.x + (startCor.w / 2),startCor.y + (startCor.h / 2),label ).attr( {
                        font : "12px Arial",
                        opacity : 1,
                        fill : "#000"
                    } );
                }

                // end pos
                var elementEndCor = {
                    x : endCor.x,
                    y : endCor.y,
                    width : endCor.w,
                    height : endCor.h,
                    transform : 'r' + Math.round( (endCor.o / Math.PI) * 180 )
                };

                // duration en ms
                this.element.stop().animate( elementEndCor,duration * 1000,"",this.onEndOfAnimation );
                //pause animation
                if (this.mediaPlayer.isPaused())
                {
                    this.element.pause();                    
                }
                
                if (this.labelElement !== null)
                {
                    // end pos
                    var labelEndCor = {
                        x : endCor.x + (endCor.w / 2),
                        y : endCor.y + (endCor.y / 2)
                    };
                    this.labelElement.stop().animate( labelEndCor,duration * 1000,"",this.onEndOfAnimation );
                }

                if (this.settings.editable === true && this.mediaPlayer.isPaused())
                {
                    this.plugFreeTransformObject();
                }

                $( this.element.node ).on( 'click',{
                    'self' : this,
                    'data' : this.data,
                    'tcin' : this.data.tcin,
                    'tcout' : this.data.tcout
                },
                this.onClick );
                if (this.logger !== null)
                {
                    this.logger.trace( this.Class.fullName,"initialize" );
                    this.logger.info( {
                        data : this.data,
                        start : startCor,
                        end : endCor
                    } );
                }
                return true;
            }
        }

        if (this.logger !== null)
        {
            this.logger.error( "Error :" + this.Class.fullName + ":initialize" );
            this.logger.error( this.data );
        }
    },
    /**
     * In charge to set rectangle size and position
     * @param {Object} data
     * @method getRectData
     */
    getRectData : function (data)
    {
        var rectParameter = {
            // x coordinate of the top left corner
            x : 0,
            // y coordinate of the top left corner
            y : 0,
            w : 0,
            h : 0,
            // radius for rounded corners, default is 0,
            r : 0,
            o : 0
        };
        try
        {
            var width = this.settings.canvas.width;
            var height = this.settings.canvas.height;
            if (data.hasOwnProperty( 'shape' ))
            {
                rectParameter.w = data.shape.rx * width * 2;
                rectParameter.h = data.shape.ry * height * 2;
                rectParameter.x = (data.shape.c.x * width) - rectParameter.w / 2;
                rectParameter.y = (data.shape.c.y * height) - rectParameter.h / 2;
                rectParameter.o = data.shape.o;
                return rectParameter;
            }
        }
        catch (e)
        {
            if (this.logger !== null)
            {
                this.logger.error( "Error to parse data GetRectData " );
                this.logger.error( data );
            }
        }
        return null;
    }
} );
