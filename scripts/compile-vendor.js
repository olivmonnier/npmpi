var concat = require('concat');

concat([
  './node_modules/jquery/dist/jquery.js',
  './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
  './node_modules/lodash/lodash.js',
  './node_modules/bootstrap-treeview/src/js/bootstrap-treeview.js'
], './public/vendor/build.js', function(error) {
  if (error) return console.log(error);
});