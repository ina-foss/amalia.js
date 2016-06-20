<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Amalia.js</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    <link href="css/default.css" rel="stylesheet" type="text/css"/>
</head>
<body>
<div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
            <a href="../" class="navbar-brand">Amalia.js</a>
            <button class="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        </div>
        <div class="navbar-collapse collapse" id="navbar-main">
            <ul class="nav navbar-nav navbar-right">
                <li><a href="../docs" target="_blank">Doc</a></li>
                <li><a href="../apidocs" target="_blank">API</a></li>
                <li><a href="../presentation.pptx" target="_blank">Presentation</a></li>
            </ul>
        </div>
    </div>
</div>
<div class="container header">
    <div class="page-header" id="banner">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12">
                <div class="logo">
                    <img src="images/amalia_logo-visuel_146x175.png" alt=""/>
                </div>
                <h1 class="title">amalia.js</h1>
                <p class="lead">Metadata enriched HTML5 video player</p>
            </div>
        </div>
    </div>
</div>
<div class="container">
    <div class="demo">
        <div class="row">
            <div class="col-lg-6 col-md-6 col-sm-6">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title">Showcases</h3>
                    </div>
                    <div class="panel-body">
                        <div class="list-group">
                            <a target="_blank" class="list-group-item" href="examples/simple.html">Simple</a>
                            <a target="_blank" class="list-group-item" href="examples/callback.html">Callback</a>
                            <a target="_blank" class="list-group-item" href="examples/watermark.html">Watermark</a>
                            <a target="_blank" class="list-group-item" href="examples/text-synchro.html">Synchronized text</a>
                            <a target="_blank" class="list-group-item" href="examples/subtitles.html">Synchronized text EN/FR</a>
                            <a target="_blank" class="list-group-item" href="examples/timeline.html">Timeline</a>
                            <a target="_blank" class="list-group-item" href="examples/timeline-zoom.html">Timeline with zoom</a>
                            <a target="_blank" class="list-group-item" href="examples/timeline_histogram_audio.php">Timeline with histogram (audio)</a>
                            <a target="_blank" class="list-group-item" href="examples/timeline_histogram_video.php">Timeline with histogram (video)</a>
                            <a target="_blank" class="list-group-item" href="examples/timeline_websocket.html">Timeline with websocket</a>
                            <a target="_blank" class="list-group-item" href="examples/overlay.php">Overlay</a>
                            <a target="_blank" class="list-group-item" href="examples/mpeg_dash.html">Mpeg dash</a>
                            <a target="_blank" class="list-group-item" href="examples/annotation.html">Annotation</a>
                            <a target="_blank" class="list-group-item" href="examples/annotation-overlay.html">Tracking annotation</a>
                            <a target="_blank" class="list-group-item" href="examples/storyboard.html">Storyboard</a>
                            <a target="_blank" class="list-group-item" href="examples/simple-yt-player.html">Youtube wrapper</a>
                            <a target="_blank" class="list-group-item" href="examples/web-audio-api.html">Web audio api</a>
                            <a target="_blank" class="list-group-item" href="examples/plugin-d3js.html"><span class="label label-info">New</span> Chart D3JS</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 col-md-6 col-sm-6">
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <h3 class="panel-title">PoC</h3>
                    </div>
                    <div class="panel-body">
                        <div class="list-group">
                            <a target="_blank" href="http://www-player-i.ina.fr/medias/demo/fft/" class="list-group-item">PoC FFT</a>
                            <a target="_blank" href="http://www-player-i.ina.fr/amalia.js/showcases/eumssi-face-detection/" class="list-group-item">Face Detection</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/amalia.js/poc/poc-jwplayer/"> JwPlayer6 wrapper</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/amalia.js/poc/poc-jwplayer/jwplayer-7.html"> JwPlayer7 wrapper</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/amalia.js/poc/poc-dlweb-media-server/"> DLWeb media server</a>
                            <a target="_blank" href="http://www-player-i.ina.fr/amalia.js/poc/poc-webaudio/" class="list-group-item"> Audio multi track list</a>
                            <a target="_blank" href="http://app01-player-i.ina.fr:3000" class="list-group-item"> PoC filigranage</a>
                            <a target="_blank" href="examples/annotation-with-mpeg-dash.html" class="list-group-item"> PoC Mpeg Dash Static</a>
                            <a target="_blank" href="examples/dash_mpeg-local.html" class="list-group-item"> PoC Mpeg Dash Dynamic</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/amalia.js/poc/poc-video-audio-mixer/"> Video Audio Mixer</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/amalia.js/poc/poc-transcription/"> POC Transcription</a>
                            <p class="list-group-item"> Poc Twitter <a target="_blank" href="http://www-player-i.ina.fr/amalia.js/poc/poc-twitter">[Foot]</a> <a target="_blank"  href="http://www-player-i.ina.fr/amalia.js/poc/poc-twitter/index-lpf.html">[Le Petit Journal]</a></p>
                            <a target="_blank" href="http://www-player-i.ina.fr/pocs/poc-si-doc/" class="list-group-item">PoC SI Doc</a>
                            <a target="_blank" class="list-group-item" href="http://search01.adaje-amalia.e.priv.ina"><span class="label label-info">New</span> POC Adaje</a>
                            <a target="_blank" class="list-group-item" href="http://www-player-i.ina.fr/pocs/poc-search-engine/"><span class="label label-info">New</span> POC Search Engine</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="container">
    <div class="row">
        <div class="col-lg-12 col-md-12 col-sm-12"><a href="http://www.institut-national-audiovisuel.fr/en/home">Institut National de l'Audiovisuel - INA</a> © 2015</div>
    </div>
</div>
</body>
</html>