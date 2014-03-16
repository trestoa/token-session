
/*!
 * Connect - session - Store
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , Session = require('./session')
  , Cookie = require('./cookie');

/**
 * Initialize abstract `Store`.
 *
 * @api private
 */

var Store = module.exports = function Store(options){};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Store.prototype.__proto__ = EventEmitter.prototype;

/**
 * Load a `Session` instance via the given `sid`
 * and invoke the callback `fn(err, sess)`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

Store.prototype.load = function(sid, fn){
  var self = this;
  this.get(sid, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn();
    var req = { sessionToken: sid, sessionStore: self };
    sess = self.createSession(req, sess);
    fn(null, sess);
  });
};

/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */

Store.prototype.createSession = function(req, sess){
  req.session = new Session(req, sess);
  return req.session;
};
