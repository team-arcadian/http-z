'use strict';

const _               = require('lodash');
const sinon           = require('sinon');
const should          = require('should');
const nassert         = require('n-assert');
const ResponseBuilder = require('../../src/builders/response');

describe('builders / response', () => {
  function getBuilderInstance(exResponseModel) {
    let responseModel = _.extend({
      protocolVersion: 'http/1.1',
      statusCode: 200,
      statusMessage: 'Ok'
    }, exResponseModel);
    return new ResponseBuilder(responseModel);
  }

  describe('build', () => {
    it('should call related methods and return response message', () => {
      let builder = getBuilderInstance();
      sinon.stub(builder, '_generateStartRow').returns('startRow\n');
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows\n');
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows');

      let expected = 'startRow\nheaderRows\nbodyRows';
      let actual = builder.build();
      should(actual).eql(expected);

      nassert.validateCalledFn({ srvc: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' });
    });
  });

  describe('_generateStartRow', () => {
    it('should throw error when protocolVersion is not defined', () => {
      let builder = getBuilderInstance({ protocolVersion: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'protocolVersion must be not empty string'
      });
    });

    it('should throw error when statusCode is not defined', () => {
      let builder = getBuilderInstance({ statusCode: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'statusCode must be not zero, positive number'
      });
    });

    it('should throw error when statusMessage is not defined', () => {
      let builder = getBuilderInstance({ statusMessage: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'statusMessage must be not empty string'
      });
    });

    it('should build startRow when all params are valid', () => {
      let builder = getBuilderInstance();

      let expected = 'HTTP/1.1 200 Ok\n';
      let actual = builder._generateStartRow();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should build response message without body (header names in lower case)', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'cache-Control',
            values: [
              { value: 'no-cache', params: null }
            ]
          },
          {
            name: 'Content-type',
            values: [
              { value: 'text/plain', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'content-encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          }
        ],
        body: null
      };

      let responseMsg = [
        'HTTP/1.1 201 Created',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        ''
      ].join('\n');

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(responseMsg);
    });

    it('should build response message with body and contentType=text/plain', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'text/plain', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        body: {
          contentType: 'text/plain',
          plain: 'Plain text'
        }
      };

      let responseMsg = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'Plain text'
      ].join('\n');

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(responseMsg);
    });

    it('should build response message with body and contentType=application/json', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'application/json', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        body: {
          contentType: 'application/json',
          json: { p1: 'v1', p2: 'v2' }
        }
      };

      let responseMsg = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: application/json;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(responseMsg);
    });
  });
});