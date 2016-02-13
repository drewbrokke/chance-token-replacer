var Chance = require('chance');

var chance = new Chance();
var _ = require('lodash');

function TokenReplacer() {
	this.evaluatedTokens = [];
}

TokenReplacer.prototype = {

	cacheEvaluatedToken: function(s) {
		this.evaluatedTokens.push(s);
	},

	callMethod: function(methodName, configurationObject) {
		return chance[methodName](configurationObject);
	},

	getArray: function(token) {
		return this.stripAmpersands(token).split('#');
	},

	getConfigurationObject: function(token) {
		var configurationObject = null;
		var configurationString = this.getConfigurationString(token);

		if (!!configurationString) {
			var configurationArray = this.splitByComma(configurationString);

			configurationArray = _.map(configurationArray, this.splitByColon);

			configurationObject = _.fromPairs(configurationArray);

			this.setBooleans(configurationObject);
		}

		return configurationObject;
	},

	getConfigurationString: function(token) {
		return this.stripOuterCurlyBraces(this.getArray(token)[1]);
	},

	getMethodName: function(token) {
		return this.getArray(token)[0];
	},

	processString: function(s) {
		s = this.replaceTokens(s);
		s = this.replaceBackreferences(s);

		return s;
	},

	replaceBackreference: function(s) {
		var index = Number(this.trimLeftBang(s)) - 1;

		return this.evaluatedTokens[index];
	},

	replaceBackreferences: function(s) {
		return s.replace(this.PATTERN_BACKREFERENCE, this.replaceBackreference.bind(this));
	},

	replaceToken: function(token) {
		token = this.stripWhitespace(token);

		var methodName = this.getMethodName(token);
		var configurationObject = this.getConfigurationObject(token);

		var evaluatedToken = this.callMethod(methodName, configurationObject);

		this.cacheEvaluatedToken(evaluatedToken);

		return evaluatedToken;
	},

	replaceTokens: function(s) {
		return s.replace(this.PATTERN_TOKEN, this.replaceToken.bind(this));
	},

	resetEvaluatedTokens: function() {
		this.evaluatedTokens = [];
	},

	setBooleans: function(configurationObject) {
		_.forEach(configurationObject, function(value, key) {
			if (value === 'false') {
				configurationObject[key] = false;
			}
			else if (value === 'true') {
				configurationObject[key] = true;
			}
		});
	},

	splitByComma: function(s) {
		return s.split(',');
	},

	splitByColon: function(s) {
		return s.split(':');
	},

	stripAmpersands: function(token) {
		token = _.trimStart(token, '<@');
		token = _.trimEnd(token, '@>');

		return token;
	},

	stripOuterCurlyBraces: function(s) {
		s = _.trimStart(s, '{');
		s = _.trimEnd(s, '}');

		return s;
	},

	stripWhitespace: function(s) {
		return s.replace(/ /g, '');
	},

	trimLeftBang: function(s) {
		return _.trimStart(s, '!');
	},

	PATTERN_BACKREFERENCE: /!\d/gi,
	PATTERN_TOKEN: /<@.+?@>/gi

};

module.exports = TokenReplacer;