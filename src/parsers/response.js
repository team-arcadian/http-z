'use strict';

const consts = require('../consts');
const utils  = require('../utils');
const Base   = require('./base');

class HttpZResponseParser extends Base {
  static parse(params) {
    let instance = new HttpZResponseParser(params);
    return instance.parse();
  }

  parse() {
    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseBodyRows();

    return this._generateModel();
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = startRow;
    this.headerRows = headerRows;
    this.bodyRows = bodyRows;
  }

  _parseStartRow() {
    if (!consts.regexps.responseStartRow.test(this.startRow)) {
      throw utils.getErrorMessage(
        'Incorrect startRow format, expected: HTTP-Version SP Status-Code SP Status-Message CRLF',
        this.startRow
      );
    }

    let rowElems = this.startRow.split(' ');
    this.protocolVersion = rowElems[0].toUpperCase();
    this.statusCode = +rowElems[1];
    this.statusMessage = rowElems.splice(2).join(' ');
  }

  _generateModel() {
    return {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headers: this.headers,
      body: this.body
    };
  }
}

module.exports = HttpZResponseParser;