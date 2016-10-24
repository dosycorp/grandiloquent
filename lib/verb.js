const _ = require('lodash');
const Plugin = require('./plugin.js');
const Pronoun = require('./pronoun.js');
const irregular = require('./../data/irregularVerbs.js');

class Verb extends Plugin {
  constructor(string) {
    super(string);
  }

  toBase() {
    let irregularVerb = _.find(irregular, item => {
      let testVerb = this.input
        .trim()
        .split(' ')
        .pop();

      return _.find(_.concat(
        [item.present.default, item.past.default],
        _.values(item.present.singular),
        _.values(item.present.plural),
        _.values(item.past.singular),
        _.values(item.past.plural)
      ), item => {
        return testVerb === item;
      });
    })
    if(irregularVerb) {
      this.current = irregularVerb.base;
    } else {
      this.current = this.input
        .trim()
        .split(' ')
        .pop()
        .replace(/ied$/, 'yed')
        .replace(/([rlp])ies$/, '$1ys')
        .replace(/([aeiou])([kt])(ed|ing)$/, '$1$2e$3')
        .replace(/tt(ed|ing)$/, 't$1')
        .replace(/(ed|ing|s)$/, '');
    }
    return this;
  }

  toInfinitive() {
    this.current = 'to ' + this.toBase();
    return this;
  }

  toGerund() {
    let baseVerb = this.toBase()
      .toString()
      .replace(/ie$/, 'y')
      .replace(/([^aeiou])e$/, '$1')
      .replace(/t$/, 'tt');
    this.current = baseVerb + 'ing';
    return this;
  }

  toPresentParticiple() {
    this.toGerund();
    return this;
  }

  toPastParticiple() {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      this.current = irregular[baseVerb].pastParticiples[0];
    } else if(baseVerb == 'be') {
      this.current = 'been';
    } else if(baseVerb == 'have') {
      this.current = 'had';
    } else {
      this.current = baseVerb
        .replace(/y$/, 'i')
        .replace(/([rlp])y$/, '$1i');
      this.current = baseVerb + 'ed';
    }
    return this;
  }

  toPresent(pronoun) {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      if(pronoun && pronoun instanceof Pronoun.model) {
        if(pronoun.meta.count == 1) {
          this.current = (irregular[baseVerb].present.singular[pronoun.meta.person] ?
            irregular[baseVerb].present.singular[pronoun.meta.person] :
            irregular[baseVerb].present.default);
        } else if(pronoun.meta.count == 2) {
          this.current = (irregular[baseVerb].present.plural[pronoun.meta.person] ?
            irregular[baseVerb].present.plural[pronoun.meta.person] :
            irregular[baseVerb].present.default);
        }
      } else {
        this.current = irregular[baseVerb].present.default;
      }
    } else {
      this.current = baseVerb
        .replace(/y$/, 'ie')
        .replace(/([rlp])y$/, '$1ie');
        if(pronoun && pronoun instanceof Pronoun.model) {
          if(pronoun.meta.count == 1 && pronoun.meta.person == 3) {
            this.current += 's';
          }
        }
    }
    let prepend = (pronoun ? pronoun + ' ' : '');
    this.current = prepend + this.current;
    return this;
  }

  toFuture(pronoun) {
    this.current = this.toBase().toString();
    let prepend = (pronoun ? pronoun + ' ' : '').concat('will ');
    this.current = prepend + this.current;
    return this;
  }

  toPast(pronoun) {
    let baseVerb = this.toBase().toString();
    if(irregular[baseVerb]) {
      if(pronoun && pronoun instanceof Pronoun.model) {
        if(pronoun.meta.count == 1) {
          this.current = (irregular[baseVerb].past.singular[pronoun.meta.person] ?
            irregular[baseVerb].past.singular[pronoun.meta.person] :
            irregular[baseVerb].past.default);
        } else if(pronoun.meta.count == 2) {
          this.current = (irregular[baseVerb].past.plural[pronoun.meta.person] ?
            irregular[baseVerb].past.plural[pronoun.meta.person] :
            irregular[baseVerb].past.default);
        }
      } else {
        this.current = irregular[baseVerb].past.default;
      }
    } else {
      this.current = baseVerb
        .replace(/y$/, 'i')
        .replace(/([rlp])y$/, '$1i')
        .concat('ed');
    }
    let prepend = (pronoun ? pronoun + ' ' : '');
    this.current = prepend + this.current;
    return this;
  }

  toPresentProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPresent(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toFutureProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toFuture(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toPastProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPast(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toPresentPerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toPresent(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toFuturePerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toFuture(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toPastPerfect(pronoun) {
    this.toPastParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('have');
      helperVerb.toPast(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toPresentPerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPresentPerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toFuturePerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toFuturePerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }

  toPastPerfectProgressive(pronoun) {
    this.toPresentParticiple();
    let prepend = (pronoun ? pronoun + ' ' : '');
    if(pronoun) {
      let helperVerb = new Verb('be');
      helperVerb.toPastPerfect(pronoun);
      this.current = helperVerb.toString() + ' ' + this.current;
    } else {
      this.current = prepend + this.current;
    }
    return this;
  }
}

module.exports.instance = (string) => {
  return new Verb(string);
};
module.exports.model = Verb;