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

test( 'Test Load Video Entities',function () {
    var settings = {
        debug : true
    };
    var loadData = null;
    var loader = new fr.ina.amalia.player.LoaderBase( settings );
    loader.load( 'data/VideoEntities.json' );
    deepEqual( loader.getSendData(),{} );

    asyncTest( "Entities TEST load data test: 3 second later!",function () {
        expect( 1 );
        setTimeout( function () {
            loadData = loader.getData();
            equal( loadData.id,"entities-2305843779355017216" );
            //equal(loadData.type, "entities");
            start();
        },3000 );
    } );

} );

test( 'Test Load Video Keyframes',function () {
    var settings = {
        debug : true
    };
    var loadData = null;
    var loader = new fr.ina.amalia.player.LoaderBase( settings );
    loader.load( 'data/VideoKeyframes.json' );
    deepEqual( loader.getSendData(),{} );

    asyncTest( "Keyframes TEST load data test: 3 second later!",function () {
        expect( 1 );
        setTimeout( function () {
            loadData = loader.getData();
            equal( loadData.id,"keyframes-2305843779355017216" );
            //equal(loadData.type, "keyframes");
            start();
        },3000 );
    } );

} );

