<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Showcases Amalia.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    <link href="../css/default.css" rel="stylesheet" type="text/css"/>
    <link href="http://www-player-i.ina.fr/libs/amalia.js/css/amalia.js.min.css" rel="stylesheet">
    <link href="http://www-player-i.ina.fr/libs/bower_components/jquery-ui/themes/base/all.css" rel="stylesheet"/>
    <style>
        /* Specific adjustement for this template : to display volume slider over all components */
        .ajs-plugin.plugin-timeline {
            position: relative;
            z-index: 0;
        }
        .plugin-custom-controlbar.sticky
        {
            position: absolute;
            z-index: 10;
        }        .ajs-plugin.plugin-timeline
        {
            position: relative;
            z-index: 10;
        }
    </style>
    <!--Utils-->
    <script src="http://www-player-i.ina.fr/libs/bower_components/jquery/dist/jquery.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/bower_components/jquery-ui/jquery-ui.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/bower_components/raphael/raphael-min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js.min.js" type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-overlay.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-timeline.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-text-sync.min.js"
            type="text/javascript"></script>
</head>
<body>
<div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a href="../" class="navbar-brand">Showcases Amalia.js</a>
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>
    </div>
</div>
<div class="container">
    <div class="page-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12">
                <h3 class="title">Media player with timeline plugin (histogram)</h3>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <div class="row">
        <div class="col-lg-8 col-md-8 col-sm-8">
            <div style="background-color:#000">
                <div id='player1_timelinePlugin1' style="height: 200px;"></div>
                <div style="height: 90px;">
                    <div id="player1"></div>
                </div>
                <div id='player_timeline-plugin' style="height: 200px;"></div>

            </div>
        </div>
        <div class="col-lg-4 col-md-4 col-sm-4">
            <h4>Links</h4>
            <ul>
                <li><a href="simple-player_timeline_histogram.php">92C03500EA0180</a></li>
                <li><a href="simple-player_timeline_histogram.php?file=185L00394_01">185L00394</a></li>
                <li><a href="simple-player_timeline_histogram.php?file=201M00481_01">201M00481</a></li>
            </ul>
        </div>
    </div>
</div>


<div class="container">
    <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12"><a href="http://www.institut-national-audiovisuel.fr/en/home">Institut
                National de l'Audiovisuel - INA</a> © 2015
        </div>
    </div>
</div>
<script type="text/javascript">
    $(function () {
        $("#player1").mediaPlayer({
            debug: false,
            autoplay: false,
            defaultVolume: 20,
            tcOffset: 1000,
            src: "http://media.ina-lab.drakulan.devdsi12.ina.fr:8081/audio/92C03500EA0180_01.MP3",
            controlBar: {
                sticky: true
            },
            plugins: {
                dataServices: [
                    'http://media.ina-lab.drakulan.devdsi12.ina.fr:8081/getData.php?file=audio/92C03500EA0180_01-2048-0.json',
                    'http://media.ina-lab.drakulan.devdsi12.ina.fr:8081/getData.php?file=audio/92C03500EA0180_01-320-1.json',
                    '../data/keyframes_zoom.json'
                ],
                list: [
                    {
                        'className': 'fr.ina.amalia.player.plugins.TimelinePlugin',
                        'container': '#player1_timelinePlugin1',
                        'debug': true,
                        'parameters': {
                            displayLines: 1,
                            nbZoomLevel: 5,
                            zoomProperty: 'tclevel',
                            timeaxis: true,
                            resizable: false,
                            viewZoomSync: true,
                            timecursor: false,
                            listOfLines: [
                                {
                                    title: '',
                                    type: 'histogram',
                                    metadataId: 'waveform-92C03500EA0180_01-2048-0',
                                    color: "#FFFFFF",
                                    zoomable: false,
                                    viewZoom: true,
                                    viewZoomSync: true
                                }
                            ]
                        }
                    },
                    {
                        'className': 'fr.ina.amalia.player.plugins.TimelinePlugin',
                        'container': '#player_timeline-plugin',
                        'debug': false,
                        'parameters': {
                            debug: true,
                            timeaxeExpandable: true,
                            resizable: true,
                            displayLines: 2,
                            editingMode: true,
                            lineDisplayMode: fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.METADATA_DISPLAY_TYPE.STATIC_DYNAMIC,
                            listOfLines: [
                                {
                                    title: 'Ball moving up',
                                    type: 'segment',
                                    metadataId: 'ball-amalia01',
                                    color: 'orange',
                                    pointNav: true,
                                    editable: true,
                                    zoomable: false
                                },
                            ]
                        }
                    }
                ]
            }
        });
    });
</script>


</body>
</html>