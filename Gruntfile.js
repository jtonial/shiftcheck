module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    "phonegap-build": {
      options: {
        archive: "app.zip",
        "appId": "1234",
        "user": {
          "email": "your.email@example.org",
          "password": "yourPassw0rd"
        }
      }
    },
    zip: {
      app: {
        file: {
          src: ["index.html", "js/**/*.js", "css/**/*.js", "icon.png", "images/background.jpg"],
          dest: "app.zip"
        }
     }     
    }
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-zipstream');
  grunt.loadNpmTasks('grunt-phonegap-build');

  // Default task.
  // grunt.registerTask('default', 'zip phonegap-build');
};