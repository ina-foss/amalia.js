/*
 ** Comparator
 */

var video = null;
var playerLeft = null;
var playerRight = null;
var playerLeftSeek, playerRightSeek = false;
var playWithTc = false;
$(function () {
    var config = {
        autoplay: false,
        crossorigin: 'Anonymous',
        controlBar: {
            sticky: true,
            autohide: false,
            widgets: {
                left: {
                    'timelabelWidget': 'fr.ina.amalia.player.plugins.controlBar.widgets.TimeLabel'
                },
                mid: {

                    'playWidget': 'fr.ina.amalia.player.plugins.controlBar.widgets.PlayButton',
                    'pauseWidget': 'fr.ina.amalia.player.plugins.controlBar.widgets.PauseButton',

                },
                right: {
                    'full': 'fr.ina.amalia.player.plugins.controlBar.widgets.FullscreenButton',
                    'volume': 'fr.ina.amalia.player.plugins.controlBar.widgets.ChannelVolumeControlBar'
                },
                settings: {
                    timelabelWidget: {
                        timeFormat: 's',
                        framerate: 20
                    },
                    volume: {
                        channelMerger: false,
                        channelMergerNode: 'l',
                    }
                }
            },
            callbacks: {}
        }
    };

    var leftConf = $.extend(true, {
        src: 'http://www-player-i.ina.fr/medias/demo/showcases/assets/mixer/FMVDA1100646_VIS_01.MP4',
        callbacks: {
            onReady: 'onLeftPlayerReady'
        }
    }, config);
    leftConf.controlBar.widgets.settings.volume.channelMergerNode = 'l';
    $("#player-left").mediaPlayer(leftConf);

    var rightConf = $.extend(true, {
        src: 'http://www-player-i.ina.fr/medias/demo/showcases/assets/mixer/FPVDA11111903_VIS_01.MP4',
        callbacks: {
            onReady: 'onRightPlayerReady'
        }
    }, config);
    rightConf.controlBar.widgets.settings.volume.channelMergerNode = 'r';
    $("#player-right").mediaPlayer(rightConf);

    ///set control events
    $("#ctrl-btn").on('click', togglePlayPause);
    $("#pause-btn").on('click', pause);
    $("#stop-btn").on('click', stop);
    $("#tc-play-btn").on('click', toggleTcButton);
    $(".add-value").on('click', setPlaybackrate);
    $(".remove-value").on('click', setPlaybackrate);
    $(".capture.btn").on('click', getCapture);

});
function onLeftPlayerReady() {
    playerLeft = $('#player-left').data('fr.ina.amalia.player').getPlayer();
    if (playerLeft !== null && playerRight !== null) {
        playTc();
        getCapture();
    }


    $('#player-left').on(fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE, function (event, data) {
        $('#cp-left').attr('src', data.captureImage).attr('captureTc', data.captureTc);
        resembleControl();
    });
    $('#player-left').on(fr.ina.amalia.player.PlayerEventType.SEEK, function (event, data) {
        var rightTcOffset = parseFloat($('#right-tc-offset').val());
        var leftTcOffset = parseFloat($('#left-tc-offset').val());
        playerLeftSeek = parseInt(data.currentTime - leftTcOffset);
        if (playWithTc && parseInt(playerRightSeek + rightTcOffset) != playerLeftSeek) {
            playerRight.setCurrentTime(playerLeftSeek + rightTcOffset);
        }
    });
    $('#player-left').on(fr.ina.amalia.player.PlayerEventType.PLAYING, function (event, data) {
        if (!playerRight.isPaused()) {
            $('#ctrl-btn i.ajs-icon').removeClass('ajs-icon-controlbar-play').addClass('ajs-icon-controlbar-pause');
        }
    });
    $('#player-left').on(fr.ina.amalia.player.PlayerEventType.PAUSED, function (event, data) {
        if (playerRight.isPaused()) {
            $('#ctrl-btn i.ajs-icon').addClass('ajs-icon-controlbar-play').removeClass('ajs-icon-controlbar-pause');
        }
    });
}

function onRightPlayerReady() {
    playerRight = $('#player-right').data('fr.ina.amalia.player').getPlayer();
    if (playerLeft !== null && playerRight !== null) {
        playTc();
        getCapture();
    }
    $('#player-right').on(fr.ina.amalia.player.PlayerEventType.IMAGE_CAPTURE, function (event, data) {
        $('#cp-right').attr('src', data.captureImage).attr('captureTc', data.captureTc);
        resembleControl();
    });
    $('#player-right').on(fr.ina.amalia.player.PlayerEventType.SEEK, function (event, data) {
        var leftTcOffset = parseFloat($('#left-tc-offset').val());
        var rightTcOffset = parseFloat($('#right-tc-offset').val());
        playerRightSeek = parseInt(data.currentTime - rightTcOffset);

        if (playWithTc && playerRightSeek != parseInt(playerLeftSeek + leftTcOffset)) {
            playerLeft.setCurrentTime(playerRightSeek + leftTcOffset);
        }
    });
    $('#player-right').on(fr.ina.amalia.player.PlayerEventType.PLAYING, function (event, data) {
        if (!playerLeft.isPaused()) {
            $('#ctrl-btn i.ajs-icon').removeClass('ajs-icon-controlbar-play').addClass('ajs-icon-controlbar-pause');
        }
    });

    $('#player-right').on(fr.ina.amalia.player.PlayerEventType.PAUSED, function (event, data) {
        if (playerRight.isPaused()) {
            $('#ctrl-btn i.ajs-icon').addClass('ajs-icon-controlbar-play').removeClass('ajs-icon-controlbar-pause');
        }
    });

}


function togglePlayPause() {
    if (playerLeft !== null && playerRight !== null) {
        if (playerRight.isPaused() || playerRight.isPaused()) {
            if (playWithTc) {
                playTc();
            }
            else {
                playerLeft.play();
                playerRight.play();
            }

        }
        else {
            playerLeft.pause();
            playerRight.pause();
        }
    }
}

/*
 ** Change TC button state
 */
function toggleTcButton() {
    if ($("#tc-play-btn").hasClass('active')) {
        // Disabled state to TC button
        $("#tc-play-btn").removeClass('active');
        playWithTc = false;
    } else {
        // Active state to TC button
        $("#tc-play-btn").addClass('active');
        playWithTc = true;
    }
}


function playTc() {
    if (playerLeft !== null && playerRight !== null) {
        var leftTcOffset = parseFloat($('#left-tc-offset').val());
        var rightTcOffset = parseFloat($('#right-tc-offset').val());
        var playTc = parseFloat($('#tc-play').val());
        playerLeft.setCurrentTime(leftTcOffset + playTc);
        playerRight.setCurrentTime(rightTcOffset + playTc);
        playerLeft.play();
        playerRight.play();
    }
}

function pause() {
    if (playerLeft !== null && playerRight !== null) {
        playerLeft.pause();
        playerRight.pause();
    }
}

function stop() {
    if (playerLeft !== null && playerRight !== null) {
        playerLeft.stop();
        playerRight.stop();
    }
}
function setPlaybackrate(e) {
    var eventCurrent=$(event.currentTarget);
    var cT = $(".option-value.space");
    var offset = 0.25;
    var ratePlayback = parseFloat($(".option-value.space").html());
    var newCtValue =0;
    // Add or remove rate value
    if (eventCurrent.hasClass("add-value")) {
        newCtValue = Math.min(4, ratePlayback + offset);
        if(ratePlayback==4){

        }
    } else {
        newCtValue = Math.max(0.25, ratePlayback - offset);
    }
    $(".option-value.space").html(newCtValue.toFixed(2));

    if (playerLeft !== null && playerRight !== null) {
        playerLeft.setPlaybackrate(parseFloat(cT.html()));
        playerRight.setPlaybackrate(parseFloat(cT.html()));
    }
}
function getCapture() {
    if (playerLeft !== null && playerRight !== null) {
        playerLeft.getTcImage('compare', playerLeft.getCurrentTime());
        $('#cp-left').attr('src', '');
        playerRight.getTcImage('compare', playerRight.getCurrentTime());
        $('#cp-right').attr('src', '');
        $('#cp-diff').attr('src', '');
    }
}


function resembleControl() {
    var leftCaptureSrc = $('#cp-left').attr('src');
    var rightCaptureSrc = $('#cp-right').attr('src');
    if (leftCaptureSrc !== '' && rightCaptureSrc !== '') {
        resemble(leftCaptureSrc).compareTo(rightCaptureSrc).ignoreAntialiasing().onComplete(function (data) {
            if (typeof data !== 'undefined') {
                updateComparator(data.misMatchPercentage, data.getImageDataUrl(), data.dimensionDifference, data.analysisTime);

            } else {
                updateComparator(0);
            }
            console.log(data);
            return data;
        });
    }

}

function updateComparator(misMatchPercentage, imageDataUrl, dimensionDifference, analysisTime) {
    var container = $('.cp-comparator');
    if (misMatchPercentage !== "" && imageDataUrl !== "" && dimensionDifference && analysisTime) {
        container.find('.keywords-value').html(misMatchPercentage + '%');
        container.find('#cp-diff').attr('src', imageDataUrl);
        container.find('#analysis-time').html(analysisTime + ' ms');
        container.find('#dimension-difference-width').html(dimensionDifference.width);
        container.find('#dimension-difference-height').html(dimensionDifference.height);
    } else {
        container.find('.progress-bar').css('width', '0%').html('0%');
    }
}
