<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Showcases Amalia.js</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
        <link href="../css/default.css" rel="stylesheet" type="text/css"/>
        <link href="http://www-player-i.ina.fr/libs/bower_components/jquery-ui/themes/base/all.css" rel="stylesheet"/>
        <link href="http://www-player-i.ina.fr/libs/amalia.js/css/amalia.js.min.css" rel="stylesheet">
        <!--Utils-->
        <script src="http://www-player-i.ina.fr/libs/bower_components/jquery/dist/jquery.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/bower_components/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/bower_components/raphael/raphael-min.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js.min.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-overlay.min.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-timeline.min.js" type="text/javascript"></script>
        <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-text-sync.min.js" type="text/javascript"></script>
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
            <div class="page-header" >
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12">
                        <h3 class="title">Media player with overlay plugin</h3>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-lg-8 col-md-8 col-sm-8">
                    <div style="background-color:#000">
                        <div style="height: 350px;"  >
                            <div id="player1"></div>
                        </div>
                        <div id='player1_timelinePlugin' style="height: 360px;"></div>					
                    </div>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-4">
                    <h4>Links</h4>
                    <ul>
                        <?php for($i=200;$i<210;$i++):?>
                        <li><a href="?id=video<?php echo $i; ?>">Video - <?php echo $i; ?></a></li>
                        <?php endfor;?>
                    </ul>
                </div>               
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-12"><a href="http://www.institut-national-audiovisuel.fr/en/home">Institut National de l'Audiovisuel - INA</a> © 2015</div>
            </div>
        </div>
        <script type="text/javascript">
<?php
$mediaId = isset($_GET['id']) ? $_GET['id'] : "video201";
?>
            $(function () {
                $("#player1").mediaPlayer({
                    debug: false,
                    autoplay: false,
                    defaultVolume: 20,
                    src: "http://www-player-i.ina.fr/medias/tracks/<?php echo $mediaId;?>.mp4",
                    controlBar: {
                        sticky: true,
                        height: 45
                    },
                    plugins: {
                        dataServices:
                                [
                                    {
                                        protocol: "http",
                                        url: 'http://www-player-i.ina.fr/medias/tracks/<?php echo $mediaId;?>.json',
                                        parameters: {
                                            mainLevel: true
                                        }
                                    }
                                ],
                        list:
                                [
                                    {
                                        'className': 'fr.ina.amalia.player.plugins.OverlayPlugin',
                                        //'metadataId' : 'tracks-amalia01',

                                        'parameters': {
                                            cuepointMinDuration: 1,
                                            'labels': true,
                                            style: {
                                                'fill': '#0F0',
                                                'strokeWidth': 2,
                                                'stroke': '#0F0',
                                                'fillOpacity': 0
                                            }
                                        }
                                    },
                                    {
                                        'className': 'fr.ina.amalia.player.plugins.TimelinePlugin',
                                        'container': '#player1_timelinePlugin',
                                        'debug': false,
                                        'parameters': {
                                            displayLines: 3,
                                            resizable: true,
                                            lineDisplayMode: fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.METADATA_DISPLAY_TYPE.STATIC_DYNAMIC, //STATIC//STATIC_DYNAMIC//DYNAMIC                           
                                            listOfLines: [
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