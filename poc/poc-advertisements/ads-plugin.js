/**
 * Class en charge du plugin overlay
 * @class OverlayPlugin
 * @namespace fr.ina.amalia.player.plugins
 * @module plugin
 * @submodule plugin-overlay
 * @constructor
 * @extends fr.ina.amalia.player.plugins.PluginBase
 * @param {Object} settings les paramètres.
 * @param {Object} container L'élément Dom pour afficher le plugin.
 */
fr.ina.amalia.player.plugins.PluginBase.extend("fr.ina.amalia.player.plugins.AdsPlugin", {
    classCss: "inaplayerhtml5-plugin plugin-ads",
    style: "position: absolute;top: 0;z-index: 100;color: red;height: inherit;width: inherit;"

},
{
    container: null,
    videoContent: null,
    adDisplayContainer: null,
    adsLoader: null,
    adsManager: null,
    intervalTimer: null,
    initialize: function ()
    {
        this.videoContent = this.mediaPlayer.mediaPlayer.get(0);
        this.container = $('<div>', {
            class: this.Class.classCss,
            style: this.Class.style
        });
        this.pluginContainer.append(this.container);
        this.definePlayerListeners();
        this.container.hide();
        this.requestAds();

    },
    createAdDisplayContainer: function ()
    {
        // We assume the adContainer is the DOM id of the element that will house
        // the ads.
        this.adDisplayContainer =
                new google.ima.AdDisplayContainer(this.container.get(0));
        this.container.find('div:first').css('width', '100%').css('height', '100%');
    },
    requestAds: function ()
    {
        // Create the ad display container.
        this.createAdDisplayContainer();
        // Initialize the container. Must be done via a user action on mobile devices.
        this.adDisplayContainer.initialize();
        // Create ads loader.
        this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
        this.adsLoader.pluginInaAds = this;

        // Listen and respond to ads loaded and error events.
        this.adsLoader.addEventListener(
                google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                this.onAdsManagerLoaded,
                false);
        /*$(this.adsLoader).on(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, {
         obj : this
         },
         this.onAdsManagerLoaded);*/
        this.adsLoader.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                this.onAdError,
                false);
        $(this.adsLoader).on(google.ima.AdErrorEvent.Type.AD_ERROR, {
            obj: this
        },
        this.onAdError);
        // Request video ads.
        var date = new Date();
        var adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = this.settings.parameters.adTagUrl;

        // Specify the linear and nonlinear slot sizes. This helps the SDK to
        // select the correct creative if multiple are returned.
        //		adsRequest.linearAdSlotWidth = 640;
//		adsRequest.linearAdSlotHeight = 400;
//		adsRequest.nonLinearAdSlotWidth = 640;
//		adsRequest.nonLinearAdSlotHeight = 150;
        this.adsLoader.requestAds(adsRequest);
    },
    onAdsManagerLoaded: function (adsManagerLoadedEvent)
    {
        this.pluginInaAds.container.show();
        // Get the ads manager.
        this.pluginInaAds.adsManager = adsManagerLoadedEvent.getAdsManager(
                this.pluginInaAds.videoContent);  // should be set to the content video element
        this.pluginInaAds.adsManager.pluginInaAds = this.pluginInaAds;
        // Add listeners to the required events.
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                this.pluginInaAds.onAdError);
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
                this.pluginInaAds.onContentPauseRequested);
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
                this.pluginInaAds.onContentResumeRequested);
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                this.pluginInaAds.onAdEvent);

        // Listen to any additional events, if necessary.
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.LOADED,
                this.pluginInaAds.onAdEvent);
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.STARTED,
                this.pluginInaAds.onAdEvent);
        this.pluginInaAds.adsManager.addEventListener(
                google.ima.AdEvent.Type.COMPLETE,
                this.pluginInaAds.onAdEvent);

        try {
            // Initialize the ads manager. Ad rules playlist will start at this time.
            this.pluginInaAds.adsManager.init('100%', '100%', google.ima.ViewMode.NORMAL);
            // Call play to start showing the ad. Single video and overlay ads will
            // start at this time; the call will be ignored for ad rules.
            this.pluginInaAds.adsManager.start();
        } catch (adError) {
            // An error may be thrown if there was a problem with the VAST response.
            this.pluginInaAds.videoContent.play();
        }
    },
    onAdEvent: function (adEvent)
    {
        // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
        // don't have ad object associated.
        var ad = adEvent.getAd();
        switch (adEvent.type) {
            case google.ima.AdEvent.Type.LOADED:
                // This is the first event sent for an ad - it is possible to
                // determine whether the ad is a video ad or an overlay.
                if (!ad.isLinear()) {
                    // Position AdDisplayContainer correctly for overlay.
                    // Use ad.width and ad.height.
                }
                break;
            case google.ima.AdEvent.Type.STARTED:
                // This event indicates the ad has started - the video player
                // can adjust the UI, for example display a pause button and
                // remaining time.
                if (ad.isLinear()) {
                    // For a linear ad, a timer can be started to poll for
                    // the remaining time.
                    var pluginInaAds = this.pluginInaAds;
                    var remainingTime = null;
                    this.pluginInaAds.intervalTimer = setInterval(
                            function () {
                                remainingTime = pluginInaAds.adsManager.getRemainingTime();
                            },
                            300); // every 300ms
                }
                break;
            case google.ima.AdEvent.Type.COMPLETE:
                // This event indicates the ad has finished - the video player
                // can perform appropriate UI actions, such as removing the timer for
                // remaining time detection.
                if (ad.isLinear()) {
                    clearInterval(this.pluginInaAds.intervalTimer);
                }
                break;
        }
    },
    onAdError: function (adErrorEvent)
    {
        // Handle the error logging.
        if (this.pluginInaAds.logger !== null)
        {
            this.pluginInaAds.logger.warn(this.pluginInaAds.Class.fullName + " adErrorEvent: " + adErrorEvent.getError());
        }
        this.pluginInaAds.adsManager.destroy();
        this.pluginInaAds.container.hide();
    },
    onContentPauseRequested: function ()
    {
        this.pluginInaAds.container.show();
        this.pluginInaAds.videoContent.pause();
        // This function is where you should setup UI for showing ads (e.g.
        // display ad timer countdown, disable seeking etc.)
        // setupUIForAds();
    },
    onContentResumeRequested: function ()
    {
        this.pluginInaAds.container.hide();
        this.pluginInaAds.videoContent.play();
        // This function is where you should ensure that your UI is ready
        // to play content. It is the responsibility of the Publisher to
        // implement this function when necessary.
        // setupUIForContent();

    },
    /**
     * Méthode en charge créer les events listener sur le player
     * @method definePlayerListeners
     */
    definePlayerListeners: function ()
    {
        var player = this.mediaPlayer.getMediaPlayer();
        player.on(fr.ina.amalia.player.PlayerEventType.PLAYING, {
            obj: this
        },
        this.onPlay);

        if (this.logger !== null)
        {
            this.logger.trace(this.Class.fullName, "definePlayerListeners");
        }
    },
    ///**Player events**/
    /**
     * Se déclenche au moment du play pour afficher bouton pause et cacher le bouton play.
     * @param {type} event
     */
    onPlay: function (event)
    {
        if (event.data.obj.logger !== null)
        {
            event.data.obj.logger.trace(event.data.obj.Class.fullName, "onPlay");
        }
    }

});