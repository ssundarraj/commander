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
    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'js/dist/output.min.js': ['js/actions.js', 'js/main.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat']);
}