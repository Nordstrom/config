# config-yml - Simple Yaml Config for Node.js

![Travis Build](https://travis-ci.org/Nordstrom/config.svg)

## Install
```
$ npm install config-yml --save
```

## Usage
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

var config = require('config-yml');

console.log(config.app.url);
console.log(config.app.cache);
console.log(config.db.location);

```    

## Substitution
You can substitute variables in the config.yml like this.

```yaml

dns: myapp.com

app:
    url: http://${dns}/home
    cache: redis
    
db:
    location: mysql-db-prod

```

This config would yield the following.

```javascript

console.log(config.app.url);

// outputs - http://myapp.com/home

```