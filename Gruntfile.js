module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('app/package.json'),
        yuidoc: {
            docsapi: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'app/src/',
                    themedir: 'libs/yuidoc/theme-ina',
                    outdir: 'tmp/apidocs/',
                    helpers: [
                        "libs/yuidoc/theme-ina/helpers/helpers.js"
                    ]
                }
            }
        },
        clean: {
            build: [
                'tmp'
            ]
        },
        copy: {
            docs: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: [
                            'docs/css/**'
                        ],
                        dest: 'tmp/docs/css'
                    },
                    {
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: [
                            'docs/img/**'
                        ],
                        dest: 'tmp/docs/img'
                    },
                    {
                        expand: true,
                        flatten: true,
                        filter: 'isFile',
                        src: [
                            'docs/libs/**'
                        ],
                        dest: 'tmp/docs/libs'
                    },
                    {
                        expand: true,
                        flatten: false,
                        cwd: 'app/build/',
                        src: '**',
                        dest: 'tmp/docs/libs/amalia-js'
                    },
                    {
                        expand: true,
                        flatten: false,
                        cwd: 'app/samples-data/',
                        src: '**',
                        dest: 'tmp/docs/samples-data'
                    }

                ]
            },
            docs_downloads: {
                expand: true,
                flatten: false,
                cwd: 'tmp/download/',
                src: '**',
                dest: 'tmp/docs/download'
            },
            sources: {
                expand: true,
                flatten: false,
                src: [
                    'samples-data/**',
                    'samples/**',
                    'src/**',
                    'tests/**',
                    'Gruntfile.js',
                    'README.md',
                    'bower.json',
                    'package.json'
                ],
                dest: 'tmp/sources'
            }
        },
        htmlbuild: {
            docs: {
                src: 'docs/index.html',
                dest: 'tmp/docs/',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            intro: 'docs/views/intro.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            download: 'docs/views/download.html',
                            examples: 'docs/views/examples.html',
                            futurework: 'docs/views/future-work.html',
                            documentation: 'docs/views/documentation.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            /**Guides**/
            'guide-player': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-player-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-player-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-setup': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-setup.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-setup.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-global-architecture': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-global-architecture.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-global-architecture.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-controlbar': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-player-control-bar-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-player-control-bar-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugins-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugins-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugins-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugin-timeline-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugin-timeline-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugin-timeline-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugin-text-sync-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugin-text-sync-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugin-text-sync-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugin-caption-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugin-caption-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugin-caption-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugin-overlay-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugin-overlay-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugin-overlay-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-metadata-libraries': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-metadata-libraries.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-metadata-libraries.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-plugin-editor-options': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-plugin-editor-options.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-plugin-editor-options.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },

            'guide-player-api': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-player-api.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-player-api.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'guide-player-yt': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/guide-player-yt.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/guide-player-yt.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },
            'release-notes': {
                src: 'docs/guide-layout.html',
                dest: 'tmp/docs/release-notes.html',
                options: {
                    beautify: true,
                    relative: true,
                    sections: {
                        views: {
                            guide: 'docs/views/release-notes.html',
                            about: 'docs/views/about.html',
                            contact: 'docs/views/contact.html',
                            docssidebar: 'docs/views/docssidebar.html',
                            header: 'docs/views/header.html',
                            footer: 'docs/views/footer.html',
                            navbar: 'docs/views/navbar.html'
                        }
                    },
                    data: {
                        // Data to pass to templates
                        name: "<%= pkg.name %>",
                        version: "<%= pkg.version %>",
                        title: '<%= pkg.description %>',
                        updateDate: '<%= grunt.template.today("yyyy-mm-dd") %>',
                        updateYear: '<%= grunt.template.today("yyyy") %>'
                    }
                }
            },

        },
        // make a zipfile
        compress: {
            download_alone: {
                options: {
                    archive: 'tmp/download/<%= pkg.version %>/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'app/build/',
                        src: [
                            '**'
                        ],
                        dest: 'build/',
                        mode: '755'
                    }
                ]
            },
            download_packaged: {
                options: {
                    archive: 'tmp/download/<%= pkg.version %>/<%= pkg.name %>-full-<%= pkg.version %>.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'app/',
                        src: [
                            'build/**/*',
                            'samples/**/*',
                            'samples-data/**/*',
                            'bower_components/jquery/dist/jquery.js',
                            'bower_components/jquery-ui/jquery-ui.min.js',
                            'bower_components/raphael/raphael.js'

                        ],
                        dest: 'full/',
                        mode: '755'
                    }
                ]
            },
            docs: {
                options: {
                    archive: 'tmp/site-<%= pkg.name %>.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'tmp/docs',
                        src: [
                            '**'
                        ],
                        dest: "<%= pkg.public_site %>/"
                    }
                ]
            }

        },
        git_deploy: {
            master: {
                options: {
                    url: 'git@github.com:dev-team-ina/test.git',
                    branch: 'master',
                    message: 'autocommit <%= pkg.name %> <%= pkg.version %>'
                },
                src: 'tmp/sources'
            },
            ghpages: {
                options: {
                    url: 'git@github.com:dev-team-ina/test.git',
                    branch: 'gh-pages',
                    message: 'autocommit <%= pkg.name %> <%= pkg.version %>'
                },
                src: 'tmp/docs'
            }
        },
        sass: {
            options: {
                sourceMap: false
            },
            'libschromecast': {
                files: {
                    'libs/chromecast-player/player.css': ['libs/chromecast-player/assets/less/default.scss']
                }
            },
            pocVideoMixer: {
                files: {
                    'poc/poc-video-audio-mixer/default.css': "poc/poc-video-audio-mixer/sass/default.scss"
                }
            },
            dist: {
                files: {
                    'app/build/css/amalia.js.min.css': "app/src/assets/sass/main.scss"
                }
            }
        },
        watch: {

            'libschromecast': {
                files: 'libs/chromecast-player/assets/sass/*.scss',
                tasks: ['sass:libschromecast']
            },
            'pocVideoMixer': {
                files: "poc/poc-video-audio-mixer/sass/*.scss",
                tasks: ['sass:pocVideoMixer']
            },
            sass: {
                files: 'app/src/assets/sass/*.scss',
                tasks: ['sass:dist']
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        'libs/chromecast-player/*.css',
                        'libs/chromecast-player/*.js',
                        'libs/chromecast-player/*.html',
                        'poc/poc-video-audio-mixer/*.css',
                        'poc/poc-video-audio-mixer/*.js',
                        'poc/poc-video-audio-mixer/*.html',
                        'app/build/css/amalia.js.min.css',
                        'app/src/**/*.js',
                        'app/src/**/**/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    proxy: "localhost"
                }
            }
        }
    });

    //Default
    grunt.registerTask('dev', [
        'sass',
        'sass:pocVideoMixer',
        'browserSync',
        'watch'
    ]);

    //Default
    grunt.registerTask('default', [
        'clean:build',
        'yuidoc:docsapi',
        'copy:docs',
        'compress:download_alone',
        'compress:download_packaged',
        'copy:docs_downloads',
        'htmlbuild',
        'compress:docs',
        'copy:sources'
    ]);
};
