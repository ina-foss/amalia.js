module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    'default.css': "sass/default.scss"
                }
            }
        },
        watch: {
            sass: {
                files: 'sass/*.scss',
                tasks: ['sass']
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        '*.css',
                        '*.js',
                        '*.html'
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
    grunt.registerTask('default', [
        'sass',
        'browserSync',
        'watch'
    ]);
};
