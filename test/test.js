var TokenReplacer = require('../index.js');

var replacer = new TokenReplacer();

var tokenString = 'Hello, my name is <@ first # { gender : male } @> <@ last @>.  You can email me at !1.!2@somedomain.com, or call me at <@phone@>. This is my catchphrase: <@sentence#{words:5}@>';

var processedString = replacer.processString(tokenString);

console.log(processedString);