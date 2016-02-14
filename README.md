# chance-token-replacer
A simple utility to replace tokens in a string with generations from the [Chance random generator helper](http://chancejs.com/).

## Installation
`npm install chance-token-replacer`

## Usage
`replacer.processString(tokenString)`

### Example
```
var TokenReplacer = require('chance-token-replacer');

var replacer = new TokenReplacer();

var tokenString = 'Hello, my name is <@first@> <@last@>.  You can email me at !1.!2@somedomain.com, or call me at <@phone@>. This is my catchphrase: <@sentence#{words:5}@>';

var processedString = replacer.processString(tokenString);

console.log(processedString); // Hello, my name is Landon McKinney.  You can email me at Landon.McKinney@somedomain.com, or call me at (266) 577-4845. This is my catchphrase: Rokbove ilevuzen ugze monvun mi.
```

### Basic Use
The replacer uses the [Chance random generator helper](http://chancejs.com/) to replace tokens in a string with generated data.  The replacer looks for the token format `<@chanceMethodName@>` and replaces it with the result of the corresponding Chance method call.

### Custom starting and ending tokens
You can use custom starting and ending tokens instead of the default `<@` and `@>` by passing an options object to the constructor:

```
var replacer = new TokenReplacer({
	endToken: '%]',
	startToken: '[%'
});

replacer.processString('My first name is [%first%].');
```

### Passing configuration to token methods
You can also pass a configuration object to the method by including a `#` followed by a configuration object:
```
'<@chanceMethodName#{key:value, key2:value2}@>'

'This is my social security number: <@ssn#{dashes:false}@>';

// Evaluates to:
'This is my social security number: 344750126';

```

### Backreferences
The replacer caches every evaluated token to an array using a 1-based index.  You can reference these values with bang (`!`) and a number corresponding to the order the tokens were replaced.
```
'My name is <@first@> <@last@>, but you can just call me !1.  Mr. !2 is my father.';

// Evaluates to:
'My name is Lawrence Armstrong, but you can just call me Lawrence.  Mr. Armstrong is my father.';
```

Evaluated tokens persist with the replacer instance, so you can even reference replacements from previous calls:
```
var TokenReplacer = require('./index.js');

var replacer = new TokenReplacer();

var tokenStringOne = 'Say hello to Mr. <@last@>.';
var tokenStringTwo = 'Hi, Mr. !1.';

var evaluatedStringOne = replacer.processString(tokenStringOne);
var evaluatedStringTwo = replacer.processString(tokenStringTwo);

console.log(evaluatedStringOne); // Say hello to Mr. Graham.
console.log(evaluatedStringTwo); // Hi, Mr. Graham.
```

The evaluated token cache can be reset by calling `replacer.resetEvaluatedTokens()`.

## API

### replacer.processString
Returns an evaluated string.
```
replacer.processString(tokenString)
```

### replacer.resetEvaluatedTokens
Removes cached evaluated token values.
```
replacer.resetEvaluatedTokens()
```
