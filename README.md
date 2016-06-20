# cfn - Simple Cloud Formation for Node.js

![CircleCI](https://circleci.com/gh/Nordstrom/cfn.svg?style=shield)

## Install
```
$ npm install cfn --save-dev
```

## Usage

Use cfn to create or update a Cloud Formation stack.  It returns a promise.  You can use Node.js modules or standard 
json for Cloud Formation Templates.

```javascript

var cfn = require('cfn');


// Create or update (if it exists) the Foo-Bar stack with the template.js Node.js module.
cfn('Foo-Bar', __dirname + '/template.js')
    .then(function() {
        console.log('done');
    });
    
// Create or update the Foo-Bar stack with the template.json json template.
cfn('Foo-Bar', 'template.json');

// Delete the Foo-Bar stack
cfn.delete('Foo-Bar');

```
    
    