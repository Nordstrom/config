# config - Simple Yaml Config for Node.js

![Travis Build](https://travis-ci.org/Nordstrom/config.svg)

## Install
```
$ npm install config --save
```

## Get Started

Use config for yaml config files in Node.js projects.  For example you might have a project with the following 
config.yml file in the project dir.

```yaml

app:
    url: http://myapp.com/home
    cache: redis
    
db:
    location: mysql-db-prod
    
```

This config can be accessed like this.

```javascript

var config = require('config');

console.log(config.app.url);
console.log(config.app.cache);
console.log(config.db.location);

```    
    