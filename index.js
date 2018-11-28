const express = require('express');
const app = express();

app.set('port', process.env.PORT || 2222);

app.use(express.static('public'));

app.listen(app.get('port'), function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Running on port: ' + app.get('port'));
	}
});
