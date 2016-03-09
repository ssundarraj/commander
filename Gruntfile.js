module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['js/actions.js', 'js/main.js', 'js/vendor/fuse.min.js'],
        dest: 'js/dist/built.js',
      },
    },
    watch: {
      js: {
        files: [
          'js/*.js'

        ],
        tasks: [
          'default',
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
}