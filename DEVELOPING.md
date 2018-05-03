# redalert-widget

The widget is made of two parts:

* [widget.js](https://github.com/fightforthefuture/redalert-widget/blob/master/static/widget.js) is injected into the host site and handles loading the widget iframe, ideally with minimal changes to the parent frame. This file is intentionally unminified, so it's easy for hosts to read and understand it.
* The main widget iframe, which is compiled by webpack from the files in [src](https://github.com/fightforthefuture/redalert-widget/blob/master/src). The iframe gets all babeled up and minified into a single file, with the goal of keeping the final asset as small as possible. (Our only indulgence is Futura.) 

## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:8080
$ npm run dev

# build for production
$ npm run build
```

## Automated Deploys

[CircleCI](https://circleci.com/gh/fightforthefuture/redalert-widget/tree/master) is set up to build the widget and upload it to Amazon S3 on every commit to the master branch.

## Manual Deploys

``` bash
# build for production
$ npm run build

# deploy to S3
$ npm run deploy
```
