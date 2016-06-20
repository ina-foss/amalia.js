<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Poc Audio tracks with Amalia.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    <link href="../css/default.css" rel="stylesheet" type="text/css"/>
    <link href="css/default.css" rel="stylesheet" type="text/css"/>

    <link href="http://www-player-i.ina.fr/libs/amalia.js/css/amalia.js.min.css" rel="stylesheet">
    <link href="css/default.css" rel="stylesheet" type="text/css"/>
    <!--Utils-->
    <script src="http://www-player-i.ina.fr/libs/bower_components/jquery/dist/jquery.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/bower_components/jquery-ui/jquery-ui.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/bower_components/raphael/raphael-min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js.min.js" type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-logger.min.js" type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-overlay.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-timeline.min.js"
            type="text/javascript"></script>
    <script src="http://www-player-i.ina.fr/libs/amalia.js/js/amalia.js-plugin-text-sync.min.js"
            type="text/javascript"></script>

    <style>
        span.named-entity {
            border: 1px;
            display: block;
            background-color: #3cf;
            padding-left: 5px;
            line-height: 20px;
            text-transform: uppercase;
        }
    </style>
</head>
<?php
$defaultId = "5578471001";
$id = isset($_GET['id']) ? $_GET['id'] : $defaultId;
$file = "data/documents.json";
$json = json_decode(file_get_contents($file), true);
$document = isset($json['listOfDocuments'][$id]) ? $json['listOfDocuments'][$id] : $json['listOfDocuments'][$defaultId];
$supportId = isset($_GET['idSupport']) ? $_GET['idSupport'] : $document['listOfSupports'][0]['id'];
$selectedSupport = null;
?>
<body>
<div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a href="../" class="navbar-brand">Poc Transcription with Amalia.js</a>
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav navbar-right">
                <li <?php if ($id == "5578471001") echo 'class="active"'; ?>><a href="?id=5578471001">5578471001</a></li>
                <li <?php if ($id == "5578472001") echo 'class="active"'; ?>><a href="?id=5578472001">5578472001</a></li>
                <li <?php if ($id == "JT") echo 'class="active"'; ?>><a href="?id=JT">JT</a></li>
            </ul>
        </div>
    </div>
</div>
<div class="container">
    <div class="page-header">

    </div>
</div>
<div class="container">
    <p><b>Liste des matériels</b></p>
    <div class="list-of-support">
        <ul>
            <?php foreach ($document['listOfSupports'] as $support):
                if ($support['id'] == $supportId) {
                    $selectedSupport = $support;
                } ?>
                <li>
                    <a href="<?php echo sprintf('?id=%s&idSupport=%s', $id, $support['id']); ?>"><?php echo $support['id']; ?></a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <p><b>Description</b></p>
    <div class="document-description">
        <p><?php echo $document['description']; ?></p>
    </div>
    <hr/>
    <p><b>Description du matériel</b></p>
    <div class="support-description">
        <?php foreach ($selectedSupport['description'] as $d): ?>
            <p><?php echo $d; ?></p>
        <?php endforeach; ?>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-md-8">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <h3 class="panel-title"><?php echo sprintf('%s | %s | %s', $id, $document['title'], $selectedSupport['id']); ?></h3>
                </div>
                <div class="panel-body">
                    <div style="height: 350px;">
                        <div id="player"></div>
                    </div>
                    <div id="plugin-timeline" style="height: 450px;"></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <h3 class="panel-title">Info</h3>
                </div>
                <div class="panel-body">
                    <div id="plugin-tsync" style="height: 850px;"></div>
                </div>
            </div>
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
        $("#player").mediaPlayer({
            autoplay: false,
            src: "<?php echo $selectedSupport['path'];?>",
            debug: false,
            crossorigin: 'Anonymous',
            controlBar: {
                sticky: true
            },
            plugins: {
                dataServices: [
                    "http://www-player-i.ina.fr/medias/demo/showcases/assets/poc-transcription/Metadata/Transcription/<?php echo $selectedSupport['id']; ?>.json",
                    "http://www-player-i.ina.fr/medias/demo/showcases/assets/poc-transcription/Metadata/Diarization/<?php echo $selectedSupport['id']; ?>.json",
                    "http://www-player-i.ina.fr/medias/demo/showcases/assets/poc-transcription/Metadata/NamedEntity/<?php echo $selectedSupport['id']; ?>.json"
                ],
                list: [
                    {
                        'className': 'fr.ina.amalia.player.plugins.TextSyncPlugin',
                        'container': '#plugin-tsync',
                        'parameters': {
                            metadataId: 'TRANS-<?php echo $selectedSupport['id']; ?>',
                            title: 'Transcription',
                            description: '',
                            level: <?php echo ($id=='JT') ? 2 :0; ?>,
                            displayLevel: <?php echo ($id=='JT') ? 2 :0; ?>,
                            autoScroll: true

                        }
                    },

                    {
                        'className': 'fr.ina.amalia.player.plugins.TimelinePlugin',
                        'container': '#plugin-timeline',
                        'debug': true,
                        'parameters': {
                            displayLines: 5,
                            //timeaxe: false,
                            displayState: 'sm',
                            resizable: true,
                            lineDisplayMode: fr.ina.amalia.player.plugins.PluginBaseMultiBlocks.METADATA_DISPLAY_TYPE.STATIC_DYNAMIC, //STATIC//STATIC_DYNAMIC//DYNAMIC
                            listOfLines: [
                                {
                                    metadataId: "NAMED_ENTITY-<?php echo $selectedSupport['id']; ?>",
                                    title: 'NAMED ENTITY',
                                    type: 'cuepoint',
                                    color: '#3399FF',
                                    icon: 'circle',
                                    pointNav: true
                                }
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