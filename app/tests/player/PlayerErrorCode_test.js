/*
 ======== A Handy Little QUnit Reference ========
 http://api.qunitjs.com/
 
 Test methods:
 module(name, {[setup][ ,teardown]})
 test(name, callback)
 expect(numberOfAssertions)
 stop(increment)
 start(decrement)
 Test assertions:
 ok(value, [message])
 equal(actual, expected, [message])
 notEqual(actual, expected, [message])
 deepEqual(actual, expected, [message])
 notDeepEqual(actual, expected, [message])
 strictEqual(actual, expected, [message])
 notStrictEqual(actual, expected, [message])
 throws(block, [expected], [message])
 */

test( 'messageCode ',function () {
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.ACCESS_DENIED ),'Accès refusé.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.FILE_NOT_FOUND ),'Une erreur s\'est produite sur votre lecteur.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.EXCEPTION ),'An exception occurred.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.HTTP_ERROR ),'Http response at 400 or 500 level.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.ABORT ),'Votre requête a été interrompue.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.TIMEOUT ),'Demande dépassé.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage( fr.ina.amalia.player.PlayerErrorCode.CUSTOM_ERROR ),'Une erreur s\'est produite sur votre lecteur.' );
    equal( fr.ina.amalia.player.PlayerErrorCode.getMessage(),'Une erreur s\'est produite sur votre lecteur.' );
} );


