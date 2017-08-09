module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'jsmin-sourcemap': {
      'dist/built.min.js': [
        'src/js/vendor/fuzzy.js',
        'src/js/vendor/chrome-promise.js',
        'src/js/actions.js',
        'src/js/main.js',
      ],
      'dist/options.min.js': [
        'src/js/vendor/chrome-promise.js',
        'src/js/vendor/run_prettify.js',
        'src/js/actions.js',
        'src/js/options.js',
      ],

    },
    watch: {
      js: {
        files: [
          'src/**'
        ],
        tasks: [
          'default',
        ]
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['src/**', '!src/js/**', '!src/css/**'], dest: 'dist/', filter: 'isFile'}
        ],
        options: {
            processContentExclude: ['**/*.{png,gif,jpg,ico,psd}'],
            process: function (content, srcpath){
                return content
                  .replace(
                    /href="css\/([^"]+?)\.css"/g,
                    'href="$1.min.css"'
                  )
                  .replace(
                    /<!-- <jsminify dest="(.+)"> -->[\S\s]+?<!-- <\/jsminify> -->/g,
                    '<script src="$1"></script>'
                  );
            }
        }
      }
    },
    compress: {
      main: {
        options: {
          archive: 'dist/commander.zip'
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['**', '!*.zip', '!*.map'], flatten: true, dest: '', filter: 'isFile'}
        ]
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['*.css', '!*.min.css'],
          dest: 'dist',
          ext: '.min.css'
        }]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-jsmin-sourcemap');
  grunt.registerTask('default', ['copy', 'cssmin', 'jsmin-sourcemap', 'compress']);
}