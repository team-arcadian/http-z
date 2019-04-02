'use strict';

const _                   = require('lodash');
const { URLSearchParams } = require('url');
const consts              = require('./consts');

exports.splitIntoTwoParts = (str, delimiter) => {
  if (_.isEmpty(str)) {
    return [];
  }

  let delimiterIndex = str.indexOf(delimiter);
  if (delimiterIndex === -1) {
    return [];
  }

  let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
  res[0] = _.trim(res[0], ' ');
  res[1] = _.trim(res[1], ' ');

  return res;
};

exports.validateNotEmptyString = (val, name) => {
  if (_.isNil(val) || _.isEmpty(val) || !_.isString(val)) {
    throw exports.getErrorMessage(`${name} must be not empty string`);
  }
};

exports.validateNotZeroOrNegativeNumber = (val, name) => {
  if (_.isNil(val) || !_.isNumber(val) || val <= 0) {
    throw exports.getErrorMessage(`${name} must be not zero, positive number`);
  }
};

exports.generateUrl = ({ protocol, host, path, basicAuth, params }) => {
  let basicAuthStr = '';
  if (!_.isEmpty(basicAuth)) {
    basicAuthStr = (basicAuth.username || '') + ':' + (basicAuth.password || '') + '@';
  }

  let paramsStr = '';
  if (!_.isEmpty(params)) {
    let urlSPs = new URLSearchParams(params);
    paramsStr = '?' + urlSPs.toString();
  }

  return '' +
    protocol.toLowerCase() + '://' +
    basicAuthStr +
    host +
    path +
    paramsStr;
};

exports.getHeaderName = (name) => {
  return _.chain(name)
    .split('-')
    .map(_.capitalize)
    .join('-')
    .value();
};

// TODO: test it
exports.getBoundary = (contentType) => {
  if (!contentType || !contentType.params) {
    throw exports.getErrorMessage('Request with ContentType=FormData must have a header with boundary');
  }

  let boundaryMatch = contentType.params.match(consts.regexps.boundary);
  if (!boundaryMatch) {
    throw exports.getErrorMessage('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryAndValue = _.split(boundaryMatch, '=');
  if (boundaryAndValue.length !== 2) {
    throw exports.getErrorMessage('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryValue =  _.trim(boundaryAndValue[1]);
  if (!boundaryValue) {
    throw exports.getErrorMessage('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  return boundaryValue;
};

exports.getErrorMessage = (msg, data) => {
  if (data) {
    msg += `.\nDetails: "${data}"`;
  }

  let err = new Error(msg);
  err.type = 'HttpZError';
  return err;
};
