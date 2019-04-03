'use strict';

const _              = require('lodash');
const sinon          = require('sinon');
const should         = require('should');
const nassert        = require('n-assert');
const RequestBuilder = require('../../src/builders/request');

describe('builders / request', () => {
  function getBuilderInstance(exRequestModel) {
    let requestModel = _.extend({
      method: 'get',
      protocol: 'http',
      protocolVersion: 'http/1.1',
      host: 'example.com',
      path: '/'
    }, exRequestModel);
    return new RequestBuilder(requestModel);
  }

  describe('build', () => {
    it('should call related methods and return request message', () => {
      let builder = getBuilderInstance();
      sinon.stub(builder, '_generateStartRow').returns('startRow\n');
      sinon.stub(builder, '_generateHostRow').returns('hostRow\n');
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows\n');
      sinon.stub(builder, '_generateCookieRows').returns('cookieRow\n');
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows');

      let expected = 'startRow\nhostRow\nheaderRows\ncookieRow\nbodyRows';
      let actual = builder.build();
      should(actual).eql(expected);

      nassert.validateCalledFn({ srvc: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateHostRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateCookieRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' });
    });
  });

  describe('_generateStartRow', () => {
    it('should throw error when method is not defined', () => {
      let builder = getBuilderInstance({ method: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'method is required'
      });
    });

    it('should throw error when protocol is not defined', () => {
      let builder = getBuilderInstance({ protocol: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'protocol is required'
      });
    });

    it('should throw error when protocolVersion is not defined', () => {
      let builder = getBuilderInstance({ protocolVersion: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'protocolVersion is required'
      });
    });

    it('should throw error when host is not defined', () => {
      let builder = getBuilderInstance({ host: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'host is required'
      });
    });

    it('should throw error when path is not defined', () => {
      let builder = getBuilderInstance({ path: null });

      should(builder._generateStartRow.bind(builder)).throw(Error, {
        message: 'path is required'
      });
    });

    it('should build startRow when all params are valid', () => {
      let builder = getBuilderInstance();

      let expected = 'GET http://example.com/ HTTP/1.1\n';
      let actual = builder._generateStartRow();
      should(actual).eql(expected);
    });
  });

  describe('_generateHostRow', () => {
    it('should build hostRow', () => {
      let builder = getBuilderInstance({ host: 'example.com' });

      let expected = 'Host: example.com\n';
      let actual = builder._generateHostRow();
      should(actual).eql(expected);
    });
  });

  describe('_generateCookieRows', () => {
    it('should return empty string when instance.cookies is undefined', () => {
      let builder = getBuilderInstance({ cookies: null });

      let expected = '';
      let actual = builder._generateCookieRows();
      should(actual).eql(expected);
    });

    it('should throw error when instance.cookies is not array', () => {
      let builder = getBuilderInstance({ cookies: 'wrong cookies' });

      should(builder._generateCookieRows.bind(builder)).throw(Error, {
        message: 'cookies must be an array'
      });
    });

    it('should throw error when instance.cookies is empty array', () => {
      let builder = getBuilderInstance({ cookies: [] });

      should(builder._generateCookieRows.bind(builder)).throw(Error, {
        message: 'cookies must be not empty array'
      });
    });

    it('should throw error when instance.cookies contains element with undefined name', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { value: 'v2' }
        ]
      });

      should(builder._generateCookieRows.bind(builder)).throw(Error, {
        message: 'cookie name is required.\nDetails: "cookie index: 1"'
      });
    });

    it('should throw error when instance.cookies contains element with undefined value', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { name: 'c2' }
        ]
      });

      should(builder._generateCookieRows.bind(builder)).throw(Error, {
        message: 'cookie value is required.\nDetails: "cookie index: 1"'
      });
    });

    it('should build cookies row when instance.cookies are valid', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { name: 'c2', value: 'v2' }
        ]
      });

      let expected = 'Cookie: c1=v1; c2=v2\n';
      let actual = builder._generateCookieRows();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should build request without body and headers', () => {
      let requestModel = {
        method: 'GET',
        protocol: 'HTTPS',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        params: { p1: 'v1' },
        basicAuth: {
          username: 'admin',
          password: 'pass'
        },
        headers: [],
        body: null
      };

      let requestMsg = [
        'GET https://admin:pass@example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        '',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should build request message without body (header names in lower case)', () => {
      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
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

      let requestMsg = [
        'GET http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should parse request with cookies and without body', () => {
      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def' }
        ],
        body: null
      };

      let requestMsg = [
        'GET http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Cookie: csrftoken=123abc; sessionid=456def',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should parse request with body and contentType=text/plain', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
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
        cookies: null,
        body: {
          contentType: 'text/plain',
          plain: 'Plain text'
        }
      };

      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'Plain text'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should parse request with body and contentType=application/json', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
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
        cookies: null,
        body: {
          contentType: 'application/json',
          json: { p1: 'v1', p2: 'v2' }
        }
      };

      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: application/json;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should parse request with body and contentType=application/x-www-form-urlencoded', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'application/x-www-form-urlencoded', params: 'charset=UTF-8' }
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
        cookies: null,
        body: {
          contentType: 'application/x-www-form-urlencoded',
          formDataParams: [
            { name: 'id', value: '11' },
            { name: 'message', value: 'Hello' }
          ]
        }
      };

      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'id=11&message=Hello'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });

    it('should parse request with body and contentType=multipart/form-data', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'multipart/form-data', params: 'boundary=------11136253119209' }
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
        cookies: null,
        body: {
          contentType: 'multipart/form-data',
          boundary: '------11136253119209',
          formDataParams: [
            { name: 'Name', value: 'Smith' },
            { name: 'Age', value: '25' }
          ]
        }
      };

      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: multipart/form-data;boundary=------11136253119209',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '-----------------------------11136253119209',
        'Content-Disposition: form-data; name="Name"',
        '',
        'Smith',
        '-----------------------------11136253119209',
        'Content-Disposition: form-data; name="Age"',
        '',
        '25',
        '-----------------------------11136253119209--'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(requestMsg);
    });
  });
});
