const _ = require('lodash');
const Plugin = require('./plugin.js');
const pronouns = require('./../data/pronouns.js');

class Pronoun extends Plugin {
  constructor(string) {
    super(string);
    let matchedPronoun = _.find(pronouns, item => {
      let testPronoun = string
        .toLowerCase()
        .trim()
        .split(' ')
        .shift();
      return testPronoun === item.pronoun.toLowerCase();
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
    }
    this.gender = (this.meta ? this.meta.gender : 'slash');
  }

  setGender(gender) {
    this.gender = (_.isString(gender) && gender.match(/(male|female|or|slash)/) ? gender : null);
    if(this.meta.person == 3 && this.meta.count == 1) {
      this.toSingular();
    }
    return this;
  }

  getGender() {
    let matchedPronoun = _.find(pronouns, item => {
      let pronoun = this.clone().toBase().toString();
      if(pronoun == item.pronoun) {
        return true;
      }
    });
    if(matchedPronoun) {
      return matchedPronoun.gender;
    }
    return null;
  }

  getPerson() {
    let matchedPronoun = _.find(pronouns, item => {
      let pronoun = this.clone().toBase().toString();
      if(pronoun == item.pronoun) {
        return true;
      }
    });
    if(matchedPronoun) {
      return matchedPronoun.person;
    }
    return null;
  }

  toBase() {
    this.current = this.input
      .toLowerCase()
      .trim()
      .split(' ')
      .shift();
    return this;
  }

  toPlural() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === search.person
        && item.count === 2) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }

  toSingular() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === search.person
        && item.count === 1
        && (search.person !== 3 || _.isNull(this.gender) || item.gender === this.gender)) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }

  toFirstPerson() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === 1
        && item.count === search.count) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }

  toSecondPerson() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === 2
        && item.count === search.count) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }

  toThirdPerson() {
    let search = this.meta;
    let matchedPronoun = _.find(pronouns, item => {
      if(item.type === search.type
        && item.person === 3
        && item.count === search.count
        && (_.isNull(this.gender) || item.gender === this.gender)) {
          return true;
        }
    });
    if(matchedPronoun) {
      this.meta = matchedPronoun;
      let currentParts = this.current
        .toLowerCase()
        .trim()
        .split(' ')
        .slice(1);
      currentParts
        .unshift(matchedPronoun.pronoun);

      this.current = currentParts.join(' ');
    }
    return this;
  }
}

module.exports.instance = (string) => {
  return new Pronoun(string);
};
module.exports.model = Pronoun;
