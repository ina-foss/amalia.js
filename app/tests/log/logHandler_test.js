/*
 * ======== A Handy Little QUnit Reference ======== http://api.qunitjs.com/
 * 
 * Test methods: module(name, {[setup][ ,teardown]}) test(name, callback) expect(numberOfAssertions) stop(increment) start(decrement) Test assertions: ok(value, [message]) equal(actual, expected,
 * [message]) notEqual(actual, expected, [message]) deepEqual(actual, expected, [message]) notDeepEqual(actual, expected, [message]) strictEqual(actual, expected, [message]) notStrictEqual(actual,
 * expected, [message]) throws(block, [expected], [message])
 */

test( 'logDisabled ',function ()
{
    var logHandler = new fr.ina.amalia.player.log.LogHandler();
    equal( logHandler.trace( 'Class','Info Test' ),null );
    equal( logHandler.info( 'info' ),'info' );
} );

test( 'logEnabled',function ()
{
    var logHandler = new fr.ina.amalia.player.log.LogHandler( {
        enabled : true
    } );
    equal( logHandler.trace( 'Class','trace' ),'Class:trace' );
    equal( logHandler.info( 'info' ),'info' );
} );
