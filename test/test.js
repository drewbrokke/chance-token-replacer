var assert = require('assert');

var TokenReplacer = require('../index.js');

describe('TokenReplacer', function() {
	describe('#processString()', function() {
		var replacer = null;

		beforeEach(function() {
			replacer = new TokenReplacer();
		});

		it('should return a string', function() {
			var token = '<@first@>';

			assert.equal(typeof replacer.processString(token), 'string');
		});

		it('should strip whitespace before processing tokens chance method name', function() {
			var token = '<@ first @>';

			assert.notEqual(token, replacer.processString(token));
		});

		it('should process tokens that have a chance method name', function() {
			var token = '<@first@>';

			assert.notEqual(token, replacer.processString(token));
		});


		it('should return tokens that have an invalid chance method name', function() {
			var token = '<@asdfasdf@>';

			assert.equal(token, replacer.processString(token));
		});

		it('should cache tokens that have a valid chance method name', function() {
			var token = '<@first@>';

			replacer.processString(token);

			assert.equal(replacer.evaluatedTokens.length, 1);
		});

		it('should not cache tokens that have an invalid chance method name', function() {
			var token = '<@asdfasdf@>';

			replacer.processString(token);

			assert.equal(replacer.evaluatedTokens.length, 0);
		});

		it('should backreference previous replacements', function() {
			assert.equal(replacer.processString('<@first@>'), replacer.processString('!1'));
		});

		it('should accept configuration objects for the method calls', function() {
			var token = '<@sentence#{words:5}@>';

			var processedToken = replacer.processString(token);

			var numberOfWords = processedToken.split(' ').length;

			assert.equal(numberOfWords, 5);
			assert.notEqual(numberOfWords, 4);
		});
	});

	describe('#resetEvaluatedTokens()', function() {
		it('should reset the evaluated token count', function() {
			var replacer = new TokenReplacer();

			var token = '<@first@>';

			replacer.processString(token);

			assert.equal(replacer.evaluatedTokens.length, 1);

			replacer.resetEvaluatedTokens();

			assert.equal(replacer.evaluatedTokens.length, 0);
		});
	});
});