!function e(t,n,a){function i(r,s){if(!n[r]){if(!t[r]){var c="function"==typeof require&&require;if(!s&&c)return c(r,!0);if(o)return o(r,!0);var l=new Error("Cannot find module '"+r+"'");throw l.code="MODULE_NOT_FOUND",l}var d=n[r]={exports:{}};t[r][0].call(d.exports,function(e){var n=t[r][1][e];return i(n?n:e)},d,d.exports,e,t,n,a)}return n[r].exports}for(var o="function"==typeof require&&require,r=0;r<a.length;r++)i(a[r]);return i}({1:[function(e,t,n){var a=e("./projects"),i=e("./project"),o=e("./file");window.Socket=io.connect(),Socket.on("connect",function(e){null!==ROOM&&Socket.emit("room",ROOM)}),$(document).ready(function(){if($("#accordion").length>0&&i().initialize(),$("#project-list").length>0&&a().initialize(),$("body > #fileView").length>0){var e=o(!1);e.initialize(),$("#fileActions").html(e.renderFileEditAction())}$(document).on("click",".btn-ajax",function(e){e.preventDefault(),$.get($(this).attr("href"))}),$(document).on("click",".submit-ajax",function(e){e.preventDefault();var t=$(this).closest("form"),n=t.serialize(),a=$(this).data("url"),i=$(this).data("redirect");$.post(a,n).done(function(){i&&(document.location.href=i)})})})},{"./file":2,"./project":3,"./projects":4}],2:[function(e,t,n){t.exports=function(e){var t;return{initialize:function(){return t=ace.edit("editor"),t.setReadOnly(!0),t.$blockScrolling=1/0,t.setTheme("ace/theme/tomorrow_night"),t.setOptions({enableBasicAutocompletion:!0,enableSnippets:!0,enableLiveAutocompletion:!0}),this.events(e),t},events:function(e){var n=this;$(document).on("click",".btn-edit-file",function(){t.setReadOnly(!1),$("#fileActions").html(n.renderFileActions({data:{project:ROOM,filePath:NavPath,advance:e}}))}),$(document).on("click",".btn-save-file",function(){$.post("/projects/"+ROOM+"/files",{filePath:NavPath,fileContent:t.getValue()}).done(function(){$("#fileActions").html(n.renderFileEditAction()),t.setReadOnly(!0)})}),$(document).on("click",".btn-cancel-file",function(){$.get("/projects/"+ROOM+"/files",{filePath:NavPath}).done(function(e){t.setReadOnly(!0),t.setValue(e.fileContent,-1),$("#fileActions").html(n.renderFileEditAction())})})},renderFileActions:_.template('<li><button class="btn btn-xs btn-warning btn-cancel-file"><i class="glyphicon glyphicon-remove"></i><span>Cancel</span></button></li><li><button class="btn btn-xs btn-primary btn-save-file"><i class="glyphicon glyphicon-save"></i><span>Save</span></button></li><% if (data.advance){ %><li><a class="btn btn-xs btn-default btn-toggle-file" href="/projects/<%= data.project %>/file?path=<%= data.filePath %>" target="_blank"><i class="glyphicon glyphicon-new-window"></i><span>Window</span></a></li><li><button class="btn btn-xs btn-danger btn-delete-file"><i class="glyphicon glyphicon-trash"></i><span>Delete</span></button></li><% } %>'),renderFileEditAction:_.template('<li><button class="btn btn-xs btn-primary btn-edit-file"><i class="glyphicon glyphicon-edit"></i><span>Edit</span></button></li>')}}},{}],3:[function(e,t,n){function a(){var e=$(location).attr("hash"),t=e.split(/\//),n=[],a=0;t.shift(),t.forEach(function(e){n=$('#tree a:contains("'+e+'")'),n.length>0&&(a=n.closest("li").data("nodeid"),$("#tree").treeview("revealNode",[a,{silent:!1}]),$("#tree").treeview("selectNode",[a,{silent:!1}]),$("#tree").treeview("expandNode",[a,{silent:!1}]))})}function i(){$('#folderActions li [data-target="#modalRenameFolder"]')["/"==NavPath?"addClass":"removeClass"]("hidden"),$("#folderActions li .btn-delete-folder")["/"==NavPath?"addClass":"removeClass"]("hidden")}function o(e){var t=e.slice(1).split("/");return t[0]?t.unshift(ROOM):t=[ROOM],t}function r(){$("#folderView").fadeOut("slow"),$("#fileView").fadeIn("slow")}function s(){$("#fileView").fadeOut("slow"),$("#folderView").fadeIn("slow")}var c=e("./file");t.exports=function(){window.NavPath="/";var e,t=c(!0).initialize(),n={data:TreeDir,showBorder:!1,collapseIcon:"glyphicon glyphicon-triangle-bottom",expandIcon:"glyphicon glyphicon-triangle-right",enableLinks:!0,highlightSelected:!1,onNodeSelected:function(n,a){NavPath="/"+a.href.slice(2),nodeSelected=a.nodeId,parentNodeSelected=$("#tree").treeview("getParent",a.nodeId).nodeId,a.nodes?($("#folderView .breadcrumb").html(e.renderBreadcrumbs({data:{files:o(NavPath)}})),i(),s()):$.get("/projects/"+ROOM+"/files",{filePath:NavPath}).done(function(e){t.setValue(e.fileContent,-1),t.session.setMode("ace/mode/"+e.extension),t.setReadOnly(!0),$("#fileActions").html(c(!0).renderFileEditAction()),r()})}};return{initialize:function(){e=this;$("#tree").treeview(n),a(),i(),e.events()},updateTreeDir:function(t,a){a=a||!1,n.data=t.tree,TreeDir=t.tree,$("#tree").treeview(n),$("#tree").treeview("revealNode",[a?nodeSelected:parentNodeSelected,{silent:!1}]),$("#tree").treeview("selectNode",[a?nodeSelected:parentNodeSelected,{silent:!1}]),$("#tree").treeview("expandNode",[a?nodeSelected:parentNodeSelected,{silent:!1}]),$("#folderView .breadcrumb").html(e.renderBreadcrumbs({data:{files:o(NavPath)}}))},events:function(){Socket.on("init",function(t){var n=_.findIndex(t,function(e){return e.name==ROOM});t[n]&&($("#logs").append(e.renderLogs({data:{logs:t[n].logs}})),$("#processes").append(e.renderProcesses({data:{processes:t[n].processes}})))}).on("redirect",function(e){document.location.href=e}).on("config",function(e){$("textarea[name=configFile]").html(JSON.stringify(e,null,2))}).on("log",function(t){$("#logs").append(e.renderLogs({data:{logs:[t]}}))}).on("process",function(t){$("#processes").append(e.renderProcesses({data:{processes:[t]}}))}).on("killProcess",function(e){$("[data-process="+e+"]").remove()}).on("pkgAdd",function(t){$(".pkg-list."+t.env).append(e.renderPackages({data:{packages:[t]}}))}).on("pkgDelete",function(e){$(".pkg-list."+e.env).find("[data-pkg="+e.name+"]").remove()}).on("packages",function(t){$(".pkg-list.dev").html(e.renderPackages({data:{packages:t.dev}})),$(".pkg-list.prod").html(e.renderPackages({data:{packages:t.prod}}))}).on("scripts",function(t){$("#scriptList").html(e.renderScripts({data:{scripts:t}}))}),$("#folderView .breadcrumb").html(e.renderBreadcrumbs({data:{files:o(NavPath)}})),$(document).on("click",".btn-show-app",function(e){e.preventDefault();var t=$(this).attr("href");$("#contentAppShow").removeClass("hide").animate({bottom:0},1e3,function(){$(this).append(_.template('<iframe src="<%= data.url %>"></iframe>')({data:{url:t}}))})}).on("click",".btn-notshow-app",function(e){$("#contentAppShow").animate({bottom:"999px"},1e3,function(){$(this).addClass("hide").find("iframe").remove()})}).on("click",".btn-add-folder",function(t){t.preventDefault();var n=$(this),a=$(this).closest("form").find('input[name="folderName"]').val();$.get("/projects/"+ROOM+"/folders",{folderPath:NavPath+"/"+a,action:"add"}).done(function(t){e.updateTreeDir(t,!0),n.closest(".modal").modal("hide")})}).on("click",".btn-add-pkg",function(){var e=$(this).parent();$.get("/projects/"+ROOM+"/packages",{action:"add",name:e.find("[name=pkgName]").val(),version:e.find("[name=version]").val(),env:e.find("[name=env]").val()})}).on("click",".btn-rename-folder",function(t){t.preventDefault();var n=$(this),a=$(this).closest("form").find('input[name="folderName"]').val();$.get("/projects/"+ROOM+"/folders",{action:"rename",folderPath:NavPath,folderName:a}).done(function(t){NavPath="",e.updateTreeDir(t,!0),n.closest(".modal").modal("hide")})}).on("click",".btn-delete-folder",function(){$.get("/projects/"+ROOM+"/folders",{action:"delete",folderPath:NavPath}).done(function(t){NavPath="",e.updateTreeDir(t,!1)})}).on("click",".btn-add-file",function(t){t.preventDefault();var n=$(this),a=$(this).closest("form").find('input[name="fileName"]').val();$.get("/projects/"+ROOM+"/files",{filePath:NavPath+"/"+a,action:"add"}).done(function(t){e.updateTreeDir(t),n.closest(".modal").modal("hide")})}).on("click",".btn-delete-file",function(){$.get("/projects/"+ROOM+"/files",{filePath:NavPath,action:"delete"}).done(function(t){e.updateTreeDir(t,!1),s()})})},renderBreadcrumbs:_.template("<% _.forEach(data.files, function(file) { %><li><%= file %></li><% }); %>"),renderLogs:_.template("<% _.forEach(data.logs, function(log) { %><%= log %><br/><% }); %>"),renderPackages:_.template('<% _.forEach(data.packages, function(pkg) { %><li class="list-group-item" data-pkg="<%= pkg.name %>"><a href="https://www.npmjs.com/package/<%= pkg.name %>" target="_blank"><%= pkg.name %> - <%= pkg.version %></a><div class="pull-right"><a class="btn btn-warning btn-ajax" href="/projects/'+ROOM+'/packages?name=<%= pkg.name %>&env=<%= pkg.env %>&action=delete"><i class="glyphicon glyphicon-trash"></i></a></div></li><% }); %>'),renderProcesses:_.template('<% _.forEach(data.processes, function(process) { %><li data-process="<%= process.pid %>"><a href="/projects/'+ROOM+'/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="badge btn-ajax"><%= process.name %> <i class="glyphicon glyphicon-remove-circle"></i></a></li><% }); %>'),renderScripts:_.template('<% _.forEach(data.scripts, function(script) { %><li><a class="btn btn-primary btn-ajax" href="/projects/'+ROOM+'/scripts?name=<%= script %>&action=exec"><%= script %></a></li><% }); %>')}}},{"./file":2}],4:[function(e,t,n){t.exports=function(){return{initialize:function(){var e=this;Socket.on("init",function(t){t.forEach(function(t){t.processes.length>0&&$("[data-project="+t.name+"] ul.processing").append(e.renderProcesses({data:{project:t.name,processes:t.processes}}))})}).on("killProcess",function(e){$("[data-process="+e+"]").remove()}).on("monitor",function(t){$(".monitor tbody tr").html(e.renderMonitor({data:{memoryTotalUsed:((t.totalmem-t.freemem)/1e6).toFixed(2),memoryTotal:(t.totalmem/1e6).toFixed(2),memoryFree:(t.freemem/1e6).toFixed(2)}}))})},renderProcesses:_.template('<% _.forEach(data.processes, function(process) { %><li data-process="<%= process.pid %>"><a href="/projects/<%= data.project %>/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="badge btn-ajax"><%= process.name %> <i class="glyphicon glyphicon-remove-circle"></i></a></li><% }); %>'),renderMonitor:_.template("<td><%= data.memoryTotalUsed %> (<%= (data.memoryTotalUsed / data.memoryTotal * 100).toFixed(2) %>%)</td><td><%= data.memoryFree %> (<%= (data.memoryFree / data.memoryTotal * 100).toFixed(2) %>%)</td><td><%= data.memoryTotal %></td>")}}},{}]},{},[1]);