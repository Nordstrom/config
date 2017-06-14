# config-yml - Simple Yaml Config for Node.js

[![Travis Build](https://travis-ci.org/Nordstrom/config.svg)](https://travis-ci.org/Nordstrom/config) [![Coverage Status](https://coveralls.io/repos/github/Nordstrom/config/badge.svg?branch=master)](https://coveralls.io/github/Nordstrom/config?branch=master) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![config-yml](https://img.shields.io/npm/v/config-yml.svg)](https://www.npmjs.com/package/config-yml)

## Install
```
$ yarn add config-yml
```
or
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

## Environment Specific Settings
Based on an Environment ID, you can designate specific override settings for different types of environments.  First
you have to specify your Environment ID.  You can do so in one of several ways.  The first Environment ID that is
found in the following order wins.

1. [--env command line argument](#Environment-ID:---env-Argument)
2. [--${static-environment} command line argument](#Environment-ID:---${static-environment}-Argument)
3. [ENVIRONMENT_ID process environment setting](#Environment-ID:-ENVIRONMENT_ID)
4. [git branch name with regex filtering](#Environment-ID:-git-branch)

### Static Environments
To understand this better let's first talk about Static Environments.  These are environments that have their own
environment specific settings or [Environment Overrides](#Environment-Overrides).  Not necessarily all environments
have their own environment specific settings, but those that do should be defined as Static Environments in
the config.yml as follows:

```yaml

environments:
    static:
        - dev
        - test
        - prod

```


### Environment ID: --env Argument
Set the Environment ID using --env command line argument.

```
node app.js --env feature-xyz
```

This is often helpful when running gulp tasks.

```
gulp deploy --env feature-xyz
```

### Environment ID: --${static-environment} Argument
For Static Environments set the Environment ID using the static environment id as an argument.

```
gulp deploy --prod
```

#### Config folder 
If you want to separate your environments by file
* create a `config` folder in the root directory of your project
* move the existing `config.yml` file to `config/defaults.config.yml`
* create custom environments via `config/[env].config.yml`
* use via the `--[env]` argument

### Environment ID: ENVIRONMENT_ID
Set the Environment ID using ENVIRONMENT_ID process environment variable.

```
export ENVIRONMENT_ID=feature-xyz
```

### Environment ID: git branch
If an Environment ID is not found using one of the other methods, it will use the git branch for the current project
folder.  This branch can be filtered using regex.  Let's say your current branch is `Features/ISSUE-123-feature-xyz`,
and you have the following setting in your config.yml.

```yaml

branchRegex: Features/ISSUE-\d+-((\w|-)+)

```

The Environment ID will be `feature-zyz`.  If no branchRegex is given the branch name will be taken as is.


### Environment ID Substitution
The Environment ID can be substituted into the config.yml.  Let's say you have an Environment ID `feature-xyz` and
the following config.yml.

```yaml
dns: ${envId}.myapp.com

app:
    url: http://${dns}/home
    cache: redis

db:
    location: MYSQL-DB-${ENVID}
```

This will yield the following:

```javascript
var config = require('config-yml');

console.log(config.dns);          // feature-xyz.myapp.com
console.log(config.app.url);      // http://feature-xyz.myapp.com
console.log(config.db.location);  // MYSQL-DB-FEATURE-XYZ

```

### Environment Overrides

For Static Environments, settings can be overridden for that specific environment.  For example, with the following
config.yml:

```yaml
dns: ${envId}.myapp.com

app:
    url: http://${dns}/home
    cache: redis

db:
    location: MYSQL-DB-${ENVID}

prod:
    app:
        url: https://${dns}
    db:
        location: DB-${ENVID}

```

and the following app.js file:


```javascript
var config = require('config-yml');

console.log(config.dns);
console.log(config.app.url);
console.log(config.app.cache);
console.log(config.db.location);

```

the following command:

```
node app.js --prod
```

would output the following:

```
prod.myapp.com
https://prod.myapp.com
redis
MYSQL-DB-PROD
```
