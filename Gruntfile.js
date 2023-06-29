'use strict';
module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            player: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: [
                    'src/player/**/*.js',
                    'src/helpers/**/*.js',
                    'src/plugins/**/*.js',
                    'src/*.js'
                ]
            },
            i18n: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: [
                    'src/i18n/**/*.js'
                ]
            },
            // Configuration with console.log
            log: {
                options: {
                    jshintrc: 'src/log/.jshintrc'
                },
                src: [
                    'src/log/**/*.js'
                ]
            },
            // Configuration with ok,notEqual,deepEqual,notDeepEqual...
            tests: {
                options: {
                    jshintrc: 'tests/.jshintrc'
                },
                src: [
                    'tests/**/*.js'
                ]
            }
        },
        uglify: {
            options: {
                banner: '/*!<%= pkg.description %> V<%= pkg.version %>, © <%= pkg.author %> <%= grunt.template.today("yyyy") %> */\n<%= pkg.licenseText %>',
                compress: {
                    global_defs: {
                        "_PlayerAmaliaVersion_": '<%= pkg.description %> V<%= pkg.version %>, © <%= pkg.author %> <%= grunt.template.today("yyyy") %>',
                        "_PlayerAmaliaHomepage_": '<%= pkg.homepage %>'
                    }
                }
            },
            build: {
                files: {
                    'build/js/i18n/<%= pkg.name %>-message-en.js': [
                        'src/i18n/player-error-message-en.js',
                        'src/i18n/player-message-en.js'
                    ],
                    'build/js/<%= pkg.name %>-logger.min.js': [
                        'src/log/log-handler.js'
                    ],
                    'build/js/<%= pkg.name %>.min.js': [
                        'src/utils/jquery-class.js',
                        'src/utils/jquery-knob.js',
                        'src/utils/jquery.ui.touch-punch.js',
                        'src/utils/dash.min.js',
                        'src/utils/jquery-debouncedresize.js',
                        'src/utils/raphael_free_transform.js',
                        'src/utils/jquery.hotkeys.js',
                        'src/helpers/browser-feature-detection.js',
                        'src/helpers/html5-helper.js',
                        'src/helpers/utilities-helper.js',
                        'src/player/constants/player-error-code.js',
                        'src/player/constants/player-event-type.js',
                        'src/player/constants/player-message.js',
                        'src/player/loader/base-loader.js',
                        'src/player/loader/http-loader.js',
                        'src/player/loader/ws-loader.js',
                        'src/player/parsers/base-parser-metadata.js',
                        'src/player/metadata/metadata-manager.js',
                        'src/player/metadata/localisation-manager.js',
                        'src/player/widgets/widget-base.js',
                        'src/player/widgets/base-button.js',
                        'src/player/widgets/time-label.js',
                        'src/player/widgets/play-button.js',
                        'src/player/widgets/pause-button.js',
                        'src/player/widgets/fullscreen-button.js',
                        'src/player/widgets/volume-control-bar.js',
                        'src/player/widgets/progress-bar.js',
                        'src/player/widgets/label.js',
                        'src/player/widgets/jog-shuttle-button.js',
                        'src/player/widgets/channel-volume-control-bar.js',
                        'src/player/plugins/plugin-base.js',
                        'src/player/plugins/plugin-base-multi-blocks.js',
                        'src/player/plugins/plugin-base-simple-block.js',
                        'src/player/plugins/plugin-binding-manager.js',
                        'src/player/plugins/plugin-manager.js',
                        'src/player/plugins/captions-base.js',
                        'src/player/plugins/context-menu-plugin.js',
                        'src/player/plugins/custom-control-bar.js',
                        'src/player/local-storage-manager.js',
                        'src/player/media-type-manager.js',
                        'src/player/media-type-dash-mpeg.js',
                        'src/player/shortcuts-manager.js',
                        'src/player/base-player.js',
                        'src/player/player-html5.js',
                        'src/player/media-factory.js',
                        'src/ina-player.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-watermark.min.js': [
                        'src/plugins/watermark/watermark.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-overlay.min.js': [
                        'src/plugins/overlay/spatials-data-parser.js',
                        'src/plugins/overlay/draw-base.js',
                        'src/plugins/overlay/draw-rect.js',
                        'src/plugins/overlay/draw-ellipse.js',
                        'src/plugins/overlay/overlay.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-text-sync.min.js': [
                        'src/plugins/text-sync/component.js',
                        'src/plugins/text-sync/text-sync.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-captions.min.js': [
                        'src/plugins/captions/captions.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-timeline.min.js': [
                        'src/plugins/timeline/default-configuration.js',
                        'src/plugins/timeline/base-component.js',
                        'src/plugins/timeline/focus-component.js',
                        'src/plugins/timeline/tic-component.js',
                        'src/plugins/timeline/zoom-component.js',
                        'src/plugins/timeline/time-axis-component.js',
                        'src/plugins/timeline/cuepoints-component.js',
                        'src/plugins/timeline/segments-component.js',
                        'src/plugins/timeline/images-component.js',
                        'src/plugins/timeline/histogram-component.js',
                        'src/plugins/timeline/visual-component.js',
                        'src/plugins/timeline/timeline.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-editor.min.js': [
                        'src/plugins/editor/plugin-metadata-list-editor.js',
                        'src/plugins/editor/plugin-metadata-block-editor.js',
                        'src/plugins/editor/plugin-metadata-items-editor.js',
                        'src/plugins/editor/plugin-metadata-item-editor.js',
                        'src/plugins/editor/plugin-metadata-items-ref-editor.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-progress-bar.min.js': [
                        'src/plugins/control-bar/progress-bar.js'
                    ],
                    'build/js/<%= pkg.name %>-plugin-storyboard.min.js': [
                        'src/plugins/storyboard/base-frame-position-calculator.js',
                        'src/plugins/storyboard/plugin-storyboard.js'
                    ],
                    'build/js/<%= pkg.name %>-yt-player.min.js': [
                        'src/plugins/yt-player/yt-player.js'
                    ],
                    'build/js/<%= pkg.name %>-d3js-player.min.js': [
                        'src/plugins/d3js-chart/plugin-d3js-chart.js'
                    ]
                }
            }
        },
        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'build/css/<%= pkg.name %>.min.css': "src/assets/sass/main.scss"
                }
            }
        },
        webfont: {
            icons: {
                src: 'src/assets/icons/*.svg',
                dest: 'src/assets/fonts',
                destCss: 'src/assets/sass',
                options: {
                    font: 'ajs-webfont',
                    stylesheet: 'scss',
                    syntax: 'bem',
                    htmlDemo: true,
                    autoHint: true,
                    hashes: true,
                    relativeFontPath: '../fonts/',
                    destHtml: 'samples',
                    embed: true,
                    engine: (grunt.option('engine') || 'fontforge'),
                    templateOptions: {
                        baseClass: 'ajs-icon',
                        classPrefix: 'ajs-icon-',
                        mixinPrefix: 'ajs-icon-'
                    }
                }
            }
        },
        clean: {
            build: [
                'build',
                'docs',
                'tmp'
            ]
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/fonts',
                        src: '**',
                        dest: 'build/fonts',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },
        // qunit: {
        //     build: [
        //         'tests/**/*.html'
        //     ]
        // },
        watch: {
            uglify: {
                files: [
                    'src/**/*.js',
                    'src/**/**/*.js'
                ],
                tasks: ['uglify:build']
            },
            sass: {
                files: 'src/assets/sass/*.scss',
                tasks: ['sass']
            }

        },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'build/css/*.css',
                        'build/js/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    proxy: "localhost"
                }
            }
        }
    });

    //dev
    grunt.registerTask('dev', [
        'clean:build',
        'webfont:icons',
        'copy:build',
        'uglify:build',
        'sass:dist',
        'browserSync',
        'watch'
    ]);

    //Default
    grunt.registerTask('default', [
        'clean:build',
        'jshint',
        'qunit:build',
        'uglify:build',
        'sass:dist',
        'copy:build'
    ]);
};