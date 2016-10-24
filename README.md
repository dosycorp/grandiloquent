# grandiloquent
[![Node.js Version][node-version-image]][node-version-url]
[![License](https://img.shields.io/github/license/byoung2/grandiloquent.svg?maxAge=2592000?style=plastic)](https://github.com/byoung2/grandiloquent/blob/master/LICENSE)

A grammar parsing and manipulation library

## Install

```sh
$ npm install --save grandiloquent
```

## Introduction

Grandiloquent is a grammar manipulation library. You can use it to change the person or number of pronouns, and to transform verbs between tenses. This is particularly useful for creating grammar correction applications, preprocessing text for NLP or sentiment analysis applications, creating chatbots, etc.

Here are a few examples:

```js
const grandiloquent = require('grandiloquent');
```

### Pronouns
```js
let pronoun = grandiloquent.pronoun('they');

pronoun.setGender('female'); //pronoun default gender for singular

pronoun.toSingular();
console.log(pronoun.toString()); //she
```

### Verbs
```js
let verb = grandiloquent.verb('walks');

verb.toBase(); //verb is mutated
console.log(verb.toString()); //walk

verb.toPast();
console.log(verb.toString()); //walked

verb.toFuture();
console.log(verb.toString()); //will walk
```

## License

Grandiloquent.js is freely distributable under the terms of the [MIT license](https://github.com/byoung2/grandiloquent/blob/master/LICENSE).

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[node-version-image]: https://img.shields.io/badge/node-%3E%3D4.3.2-blue.svg
[node-version-url]: https://nodejs.org/en/download/