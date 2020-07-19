var Chance = require('chance');
var RegexEscape = require("regex-escape");
var _ = require('lodash');

var chance = new Chance();

function Util(options) {
	var tokenRegexString = '';

	options = options || {};

	this.startToken = options.startToken || '<@';
	this.endToken = options.endToken || '@>';
	this.customReplacerFn = options.customReplacerFn || null;

	tokenRegexString = RegexEscape(this.startToken) + '.+?' + RegexEscape(this.endToken);

	this.PATTERN_TOKEN = new RegExp(tokenRegexString, 'g');
	this.evaluatedTokens = [];
}

Util.prototype = {

	cacheEvaluatedToken: function(s) {
		this.evaluatedTokens.push(s);
	},

	callMethod: function(methodName, configurationObject) {
		return chance[methodName](configurationObject);
	},

	isChanceMethod: function (methodName) {
		return !!chance[methodName];
	},

	getArray: function(token) {
		return this.stripAmpersands(token).split('#');
	},

	getConfigurationObject: function(token) {
		var configurationObject;
		try {
			configurationObject = JSON.parse(this.getArray(token)[1]);
		} catch (e) {
			configurationObject = null;
		} finally {
			return configurationObject;
		}
	},

	getConfigurationString: function(token) {
		return this.stripOuterCurlyBraces(this.getArray(token)[1]);
	},

	getMethodName: function(token) {
		return this.getArray(token)[0];
	},

	replaceBackreference: function(s) {
		var index = Number(this.trimLeftBang(s)) - 1;

		return this.evaluatedTokens[index];
	},

	replaceBackreferences: function(s) {
		return s.replace(this.PATTERN_BACKREFERENCE, this.replaceBackreference.bind(this));
	},

	replaceToken: function(token) {
		var evaluatedToken = token;
		var comapctToken = this.stripWhitespace(token);

		var methodName = this.getMethodName(comapctToken);
		var configurationObject = this.getConfigurationObject(comapctToken);

		if (this.isChanceMethod(methodName)) {
			evaluatedToken = this.callMethod(methodName, configurationObject);

			this.cacheEvaluatedToken(evaluatedToken);
		}

		if (!!this.customReplacerFn) {
			var customEvaluation = this.customReplacerFn(methodName);

			if (customEvaluation !== methodName) {
				evaluatedToken = customEvaluation;

				this.cacheEvaluatedToken(evaluatedToken);
			}
		}

		return evaluatedToken;
	},

	replaceTokens: function(s) {
		return s.replace(this.PATTERN_TOKEN, this.replaceToken.bind(this));
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
		token = _.trimStart(token, this.startToken);
		token = _.trimEnd(token, this.endToken);

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

	PATTERN_BACKREFERENCE: /!\d/gi

};

module.exports = Util;