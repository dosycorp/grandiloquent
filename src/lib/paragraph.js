const _ = require('lodash');
const Plugin = require('./plugin.js');
const Sentence = require('./sentence.js');
const Pronoun = require('./pronoun.js');
const nameGenders = require('./../data/nameGenders.js');
const abbreviations = require('./../data/abbreviations.js');
const Word = require('./word.js');

class Paragraph extends Plugin {
  constructor(string) {
    super(string);
    this.split();
  }

  reset(string) {
    this.input = string;
    this.current = string;
    this.split();
  }

  split() {
    let abbreviationList = [],
    abbreviationIndex = 0,
    abbreviationRegEx = new RegExp(`(${ abbreviations.join('|') })`, 'gi');
    let current = this.current.replace(abbreviationRegEx, (match, param) => {
      abbreviationList[abbreviationIndex] = match;
      let replacement = `[token-${ abbreviationIndex }]`;
      abbreviationIndex++;
      return replacement;
    });
    this.sentences = current
      .match(/[^.!?]+[.!?]+( |$)/g)
      .map(item => {
        item = item.trim()
          .replace(/\[token-([0-9]+)\]/g, (match, param) => {
            return abbreviationList[param];
          });
        return Sentence.instance(item);
      });
  }

  resolveCoreferences() {
    let ref = [];
    let lastReference = {
      male: null,
      female: null,
      unknown: null,
      plural: null
    };
    this.sentences = _.map(this.sentences, sentence => {
      sentence.tagged = _.map(sentence.tagged, item => {
        item.originalSentence = sentence;
        if(item.tags.current && item.tags.current.match(/^P/g)) {
          let pronoun = Pronoun.instance(item.word);
          let currLastReference = null;
          if(pronoun.getGender() && lastReference[pronoun.getGender()]) {
            currLastReference = lastReference[pronoun.getGender()];
          } else if(lastReference.unknown) {
            currLastReference = lastReference.unknown;
          }
          if(pronoun.getPerson() == 3 && currLastReference) {
            item.coreference = currLastReference;
          }
        } else if(item.tags.current && item.tags.current.match(/^NP/g)) {
          if(nameGenders[item.word.toLowerCase()]) {
            if(nameGenders[item.word.toLowerCase()].length == 2) {
              lastReference.unknown = item;
            } else {
              lastReference[nameGenders[item.word.toLowerCase()][0]] = item;
            }
          } else {
            lastReference.unknown = item;
          }
        } else if(item.tags.current && item.tags.current.match(/^NN/g)) {
          lastReference.unknown = item;
        }
        return item
      });
      return sentence;
    });
    return this;
  }

  replaceCoreferences() {
    this.sentences = _.map(this.sentences, sentence => {
      _.map(sentence.tagged, (word, index) => {
        if(word.coreference) {
          let nounPhrase = word.coreference.toString();
          if(!word.coreference.tags.current.match(/^NP/g)) {
            nounPhrase = word.coreference.originalSentence.getNounPhrase(word.coreference.toString());
          }
          sentence.replace(word.current, nounPhrase, 'string');
        }
        return sentence;
      });
      return sentence;
    });
    this.reset(this.sentences.join(' '));
    return this;



    this.sentences = _.map(this.sentences, item => {
      item.tagged = _.map(item.tagged, item => {
        if(item.coreference) {
          return Word.instance(item.coreference);
        }
        return item;
      });
      let sentence = _(item.tagged)
        .map(item => item.word)
        .value()
        .join(' ')
        .replace(/ ([,;:.!?]+)/g, '$1');
      return Sentence.instance(sentence);
    });
    this.reset(this.sentences.join(' '));
    return this;
  }

  getAssertions() {
    let assertions = [];
    _.each(this.sentences, item => {
      assertions.push([item.getSubject(), item.getMainVerb(), item.getPredicateTail()]);
    });
    return assertions;
  }
}

module.exports.instance = (string) => {
  return new Paragraph(string);
};
module.exports.model = Paragraph;
