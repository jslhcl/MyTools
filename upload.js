var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('child_process').exec;
var send = require('send');
var path = require('path');

http.createServer(function (req, res) {
	if (req.method == 'POST')
	{
		var form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			console.log(files.filetoupload.path);
			console.log(files.filetoupload.name);
			var newpath = './uploaded/' + files.filetoupload.name;
			console.log(newpath);
			fs.rename(files.filetoupload.path, newpath, function(err) {
				if (err) throw err;
				exec('xelatex ' + newpath, function(err, stdout, stderr) {
					if (err) throw err;
					var newFileName = path.basename(files.filetoupload.name, path.extname(files.filetoupload.name)) + '.pdf';
					console.log('newFileName: ' + newFileName);
					send(req, newFileName).pipe(res);
				});
			});

		});
		return;
	}
    	res.end(`
    		<!doctype html>
    		<html>
    		<body>
    			<form action="/fileupload" method="post" enctype="multipart/form-data">
    			<input type="file" name="filetoupload"><br />
				<input type="submit">
    			</form>
    		</body>
    		</html>
    		`);
}).listen(8080);
