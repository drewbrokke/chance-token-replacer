var assert = require('assert');
var _ = require('lodash');

var TokenReplacer = require('../index.js');

describe('TokenReplacer', function() {
	describe('#constructor', function() {
		it('should accept starting and ending tokens', function() {
			var startToken = '[%';
			var endToken = '%]';

			var options = {
				endToken: endToken,
				startToken: startToken
			};

			var replacer = new TokenReplacer(options);

			var tokenString = '[%first%]';

			assert.notEqual(tokenString, replacer.processString(tokenString));
		});

		it('should accept a custom evaluation function', function() {
			var dummyConfigObject = {
				customValue: 'ABC_123'
			};

			function customReplacerFn(s) {
				var customEvaluation = s;

				if (_.startsWith(s, 'dummyConfigObject')) {
					var key = s.split('.')[1];

					if (!!dummyConfigObject[key]) {
						customEvaluation = dummyConfigObject[key];
					}
				}

				return customEvaluation;
			}

			var options = {
				customReplacerFn: customReplacerFn
			};

			var replacer = new TokenReplacer(options);

			assert.equal(replacer.processString('<@dummyConfigObject.customValue@>'), dummyConfigObject.customValue);
		});
	});

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

			assert.equal(replacer.util.evaluatedTokens.length, 1);
		});

		it('should not cache tokens that have an invalid chance method name', function() {
			var token = '<@asdfasdf@>';

			replacer.processString(token);

			assert.equal(replacer.util.evaluatedTokens.length, 0);
		});

		it('should backreference previous replacements', function() {
			assert.equal(replacer.processString('<@first@>'), replacer.processString('!1'));
		});

		describe('should accept array as configuration object for the method calls', function () {
			const tests = [
				{args: '["A","B","C"]', in: ['A','B','C'] },
				{args: '[1,2,3]', in: ['1','2','3'] },
			];

			tests.forEach(function (test) {
				it(`when ${test.args} is used`, function () {
					var token = `<@pickone#${test.args}@>`;
					const processedToken = replacer.processString(token);
					assert.equal(test.in.indexOf(processedToken) >= 0, true);
				});
			});
		});

		describe('should accept configuration objects for the method calls', function () {
			const tests = [
				{args: '{words:5}', expected: 5 },
				{args: '{"words":5}', expected: 5 },
			];

			tests.forEach(function (test) {
				it(`when ${test.args} is used`, function () {
					var token = `<@sentence#${test.args}@>`;
					const processedToken = replacer.processString(token);
					const numberOfWords = processedToken.split(' ').length;
					assert.equal(numberOfWords, test.expected);
				});
			});
		});
	});

	describe('#resetEvaluatedTokens()', function() {
		it('should reset the evaluated token count', function() {
			var replacer = new TokenReplacer();

			var token = '<@first@>';

			replacer.processString(token);

			assert.equal(replacer.util.evaluatedTokens.length, 1);

			replacer.resetEvaluatedTokens();

			assert.equal(replacer.util.evaluatedTokens.length, 0);
		});
	});
});

var Util = require('../lib/Util.js');

describe('Util', function() {
	describe('getConfigurationObject', function() {
		describe('should convert a string boolean into a boolean value', function() {
			var key = 'key'
			var tests = [
				{args: `<@foo#{${key}:'false'}@>`, expected: false},
				{args: `<@foo#{${key}:false}@>`, expected: false},
				{args: `<@foo#{${key}:'true'}@>`, expected: true},
				{args: `<@foo#{${key}:true}@>`, expected: true},
				{args: `<@foo#{${key}:'foo'}@>`, expected: 'foo'}
			]

			var util = new Util({});

			tests.forEach(function (test) {
				it(`when "${test.args}" is used`, function () {
					// @ts-ignore
					assert.strictEqual(util.getConfigurationObject(test.args)[key], test.expected);
				});
			});
		})
	})
})
