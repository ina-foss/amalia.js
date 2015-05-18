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
 * In charge to draw ellipse shape and extend draw base class
 * @class DrawEllipse
 * @namespace fr.ina.amalia.player.plugins.overlay
 * @module plugin
 * @submodule plugin-overlay
 * @extends fr.ina.amalia.player.plugins.overlay
 * @constructor
 * @param {Object} settings Defines the configuration of this class
 * @param {Object} mediaPlayer
 * @param {Object} data
 */
fr.ina.amalia.player.plugins.overlay.DrawBase.extend( "fr.ina.amalia.player.plugins.overlay.DrawEllipse",{
    classCss : "spatial-ellipse"

},
{
    /**
     * Initialize
     * @method initialize
     */
    initialize : function ()
    {
        //set shape name
        this.shape = 'ellipse';
        if (this.data.hasOwnProperty( 'tcin' ) && this.data.hasOwnProperty( 'tcout' ) && this.data.hasOwnProperty( 'start' ) && this.data.hasOwnProperty( 'end' ))
        {
            var style = this.getStyle();
            var startCor = this.getEllipseData( this.data.start );
            var endCor = this.getEllipseData( this.data.end );
            var duration = parseFloat( this.data.tcout - this.mediaPlayer.getCurrentTime() );
            var label = this.data.hasOwnProperty( 'label' ) ? this.data.label : '';
            if (startCor !== null && endCor !== null)
            {
                this.element = this.settings.canvas.ellipse( startCor.cx,startCor.cy,startCor.rx,startCor.ry );
                // Set style
                this.element.attr( style );
                this.element.transform( "r" + Math.round( (startCor.o / Math.PI) * 180 ) );
                this.element.attr( {
                    'cursor' : 'pointer'
                } );
                // set label
                if (this.settings.labels === true && label !== '')
                {
                    this.labelElement = this.settings.canvas.text( startCor.cx,startCor.cy,label ).attr( {
                        font : "12px Arial",
                        opacity : 1,
                        fill : "#000"
                    } );
                }

                // end pos
                var elattrs = {
                    cx : endCor.cx,
                    cy : endCor.cy,
                    rx : endCor.rx,
                    ry : endCor.ry,
                    transform : 'r' + Math.round( (endCor.o / Math.PI) * 180 )
                };

                // duration en ms
                this.element.stop().animate( elattrs,duration * 1000,"",this.onEndOfAnimation );
                //pause animation
                if (this.mediaPlayer.isPaused())
                {
                    this.element.pause();
                }
                if (this.labelElement !== null)
                {
                    // end pos
                    var labelEndCor = {
                        x : endCor.cx,
                        y : endCor.cy
                    };
                    this.labelElement.stop().animate( labelEndCor,duration * 1000,"",this.onEndOfAnimation );
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
     * In charge to set size and position
     * @param {Object} data
     * @return {Object}
     */
    getEllipseData : function (data)
    {
        var ellipseParameter = {
            // x coordinate of the centre
            x : 0,
            // y coordinate of the centre
            y : 0,
            // horizontal radius
            rx : 0,
            // vertical radius
            ry : 0,
            o : 0
        };
        try
        {
            var width = this.settings.canvas.width;
            var height = this.settings.canvas.height;
            if (data.hasOwnProperty( 'shape' ))
            {
                ellipseParameter.cx = data.shape.c.x * width;
                ellipseParameter.cy = data.shape.c.y * height;
                // horizontal radius
                ellipseParameter.rx = data.shape.rx * width;
                // vertical radius
                ellipseParameter.ry = data.shape.ry * height;
                ellipseParameter.o = data.shape.o;
                return ellipseParameter;
            }
        }
        catch (e)
        {
            if (this.logger !== null)
            {
                this.logger.error( "Error to parse data getEllipseData" );
                this.logger.error( data );
            }
        }
        return null;
    }
} );
