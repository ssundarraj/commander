module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'jsmin-sourcemap': {
      'dist/built.min.js': ['src/js/actions.js', 'src/js/main.js', 'src/js/vendor/fuse.min.js']
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
            process: function (content, srcpath){
            return content.replace("<script src=\"js/vendor/fuse.min.js\"></script>\n    <script src=\"js/actions.js\"></script>\n    <script src=\"js/main.js\"></script>", "<script src=\"built.min.js\"></script>").replace("main.css", "main.min.css");
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