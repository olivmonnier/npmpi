var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var Process = require('./process');

module.exports = function(project, io) {
  var cmdPath = 'projects/' + project;
  var proc = Process(project, io);

  return {
    add: function(pkgName, version, env) {
      if (arguments.length == 2) {
        version = '';
        env = arguments[1];
      } else {
        version = '@' + version;
      }
      var self = this;
      var saveEnv = (env == 'dev') ? '-D' : '-S';
      var child = exec('cd ' + cmdPath + ' && npm install ' + saveEnv + ' ' + pkgName + version, function(error, stdout, stderr) {
        var config = self.infos();

        io.to(project).emit('config', config);
      });

      proc.streamEvents('pkgAdd', child, 'Install ' + pkgName + ' package');
      io.to(project).emit('pkgAdd', {name: pkgName, version: version, env: env});
    },
    infos: function() {
      return JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf8'));
    },
    install: function() {
      var child = exec('cd ' + cmdPath + ' && npm install');

      proc.streamEvents('npmInstall', child, 'Install packages');
    },
    packages: function() {
      var pkgs = this.infos();
      var hashPkgs = {
        dev: [],
        prod: []
      }

      for(var k in pkgs.devDependencies) {
        hashPkgs.dev.push({
          name: k,
          version: pkgs.devDependencies[k],
          env: 'dev'
        });
      }

      for(var i in pkgs.dependencies) {
        hashPkgs.prod.push({
          name: k,
          version: pkgs.dependencies[k],
          env: 'prod'
        });
      }

      io.to(project).emit('packages', hashPkgs);
    },
    delete: function(pkgName, env) {
      var self = this;
      var saveEnv = (env == 'dev') ? '-D' : '-S';
      var child = exec('cd ' + cmdPath + ' && npm uninstall ' + saveEnv + ' ' + pkgName, function(error, stdout, stderr) {
        var config = self.infos();

        execSync('cd ' + cmdPath + ' && npm cache clean ./');
        io.to(project).emit('config', config);
      });

      proc.streamEvents('pkgDelete', child, 'Uninstall ' + pkgName + ' package');
      io.to(project).emit('pkgDelete', {name: pkgName, env: env});
    }
  }
}
