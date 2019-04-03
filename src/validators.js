'use strict';

const _     = require('lodash');
const utils = require('./utils');

// TODO: test it
exports.validateRequired = (val, attr, details) => {
  if (_.isNil(val)) {
    throw utils.getError(`${attr} is required`, details);
  }
};

// TODO: test it
exports.validateString = (val, attr, details) => {
  exports.validateRequired(val, attr, details);
  if (!_.isString(val)) {
    throw utils.getError(`${attr} must be a string`, details);
  }
};

exports.validateNotEmptyString = (val, attr, details) => {
  exports.validateString(val, attr, details);
  if (_.isEmpty(val)) {
    throw utils.getError(`${attr} must be not empty string`, details);
  }
};

// TODO: test it
exports.validateArray = (val, attr, details) => {
  exports.validateRequired(val, attr, details);
  if (!_.isArray(val)) {
    throw utils.getError(`${attr} must be an array`, details);
  }
};

// TODO: test it
exports.validateNotEmptyArray = (val, attr, details) => {
  exports.validateArray(val, attr, details);
  if (val.length === 0) {
    throw utils.getError(`${attr} must be not empty array`, details);
  }
};

// TODO: test it
exports.validateNumber = (val, attr, details) => {
  exports.validateRequired(val, attr, details);
  if (!_.isNumber(val)) {
    throw utils.getError(`${attr} must be a number`, details);
  }
};

exports.validatePositiveNumber = (val, attr, details) => {
  exports.validateNumber(val, attr, details);
  if ( val <= 0) {
    throw utils.getError(`${attr} must be a positive number`, details);
  }
};
