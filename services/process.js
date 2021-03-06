var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var psTree = require('ps-tree');
var _ = require('lodash');

module.exports = function (project, io) {
  var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });
  var cmdPath = 'projects/' + project;

  return {
    exec: function(scriptName) {
      var child = exec('cd ' + cmdPath + ' && npm run ' + scriptName);

      this.streamEvents(scriptName, child);
    },
    kill: function (pid, signal, callback) {
      var promise = new Promise(function(resolve, reject) {
        signal = signal || 'SIGKILL';
        callback = callback || function () {};
        var isWin = /^win/.test(process.platform);

        if (isWin) {
          resolve(execSync('taskkill /PID ' + pid + ' /T /F'));
          io.to(project).emit('killProcess', pid);
          return;
        } else {
          psTree(pid, function (err, children) {
            [pid].concat(
              children.map(function (p) {
                return p.PID;
              })
            ).forEach(function (tpid) {
              try { process.kill(tpid, signal) }
              catch (ex) { }
            });
            io.to(project).emit('killProcess', pid);
            resolve(callback());
          });
        }
      });

      return promise;
    },
    killAll: function () {
      var self = this;
      var pids = ROOMS[roomIndex].processes.map(function(proc) {
        return proc.pid;
      });

      return Promise.all(pids.map(function(pid) {
        self.kill(pid);
        io.to(project).emit('killProcess', pid);
      }));
    },
    streamEvents: function (scriptName, processChild, logRun) {
      var logRun = logRun || '<br/>Command running';
      var child = {name: scriptName, pid: processChild.pid};

      ROOMS[roomIndex].logs.push(logRun);
      ROOMS[roomIndex].processes.push(child);
      io.to(project).emit('log', logRun);
      io.to(project).emit('process', child);

      processChild.stdout.setEncoding('utf8').on('data', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.stderr.setEncoding('utf8').on('data', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.on('error', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.on('close', function(data) {
        var log = 'Process finished <br/>';
        ROOMS[roomIndex].logs.push(log);
        ROOMS[roomIndex].processes = _.remove(ROOMS[roomIndex].processes, function(process) {
          return process.pid != child.pid;
        });
        io.emit('killProcess', child.pid);
        io.to(project).emit('log', log);
      });
    }
  }
}
