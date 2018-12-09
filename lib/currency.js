'use strict';

var request = require('request');

function CurrencyController(options) {
  this.node = options.node;
  var refresh = options.currencyRefresh || CurrencyController.DEFAULT_CURRENCY_DELAY;
  this.currencyDelay = refresh * 60000;
  this.bitstampRate = 0; // USD/BTC
  this.poloniexRate = 0; // BTC/ZEC
  this.timestamp = Date.now();
}

CurrencyController.DEFAULT_CURRENCY_DELAY = 10;

CurrencyController.prototype.index = function(req, res) {
  var self = this;
  var currentTime = Date.now();
  if (self.bitstampRate === 0 || currentTime >= (self.timestamp + self.currencyDelay)) {
    self.timestamp = currentTime;
    request('https://www.bitstamp.net/api/ticker/', function(err, response, body) {
      if (err) {
        self.node.log.error(err);
      }
      if (!err && response.statusCode === 200) {
        self.bitstampRate = parseFloat(JSON.parse(body).last);
      }
	request('https://bitebtc.com/api/v1/ticker?market=koto_btc', function(err, response, body) {
//	request('https://api.crex24.com/v2/public/tickers?instrument=KOTO-BTC', function(err, response, body) {
        if (err) {
          self.node.log.error(err);
        }
        if (!err && response.statusCode === 200) {
          self.poloniexRate = parseFloat(JSON.parse(body).result.price);
//          self.poloniexRate = parseFloat((JSON.parse(body))[0].last);
        }
        res.jsonp({
          status: 200,
          data: {
            bitstamp: self.bitstampRate * self.poloniexRate
          }
        });
      });
    });
  } else {
    res.jsonp({
      status: 200,
      data: { 
        bitstamp: self.bitstampRate * self.poloniexRate
      }
    });
  }

};

module.exports = CurrencyController;
