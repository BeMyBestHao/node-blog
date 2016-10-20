
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000); // 设置端口
app.set('views', path.join(__dirname, 'views')); // 设置views的目录，__dirname为全局变量，表示当前正在执行的脚本所在的目录
app.set('view engine', 'ejs'); // 设置视图的模板引擎为ejs
app.use(flash());
app.use(express.favicon()); // 使用默认的favicon图标，可以使用自己的图标
// 输出日志
app.use(express.logger('dev')); // 开发模式使用的日志
app.use(express.logger({stream: accessLog}));
// 解析请求体
// app.use(express.json()); // 解析请求体，可以使用bodyParser()替换一下两个
// app.use(express.urlencoded());
app.use(express.bodyParser({keepExtensions: true, uploadDir: './public/images'})); // 保存原扩展
app.use(express.methodOverride()); // 中间件，可以协助处理POST，伪装PUT、DELETE和其他HTTP方法
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
  store: new MongoStore({
    url: 'mongodb://localhost/blog'
  })
}));
app.use(app.router); // 调用路由解析的规则
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err, req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
})

// development only
// 开发环境输出错误信息
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

// 创建http服务器并监听3000端口
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
