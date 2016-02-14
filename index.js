var Util = require('./lib/Util.js');

function TokenReplacer(options) {
	this.util = new Util(options);
}

TokenReplacer.prototype = {

	processString: function(s) {
		s = this.util.replaceTokens(s);
		s = this.util.replaceBackreferences(s);

		return s;
	},

	resetEvaluatedTokens: function() {
		this.util.evaluatedTokens = [];
	}

};

module.exports = TokenReplacer;