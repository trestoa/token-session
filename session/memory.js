
/*!
 * Connect - session - MemoryStore
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Markus Klein
 * MIT Licensed
 */

/**
 * Mod ule dependencies.
 */

var Store = require('./store');

/**
 * Initialize a new `MemoryStore`.
 * This session store implementation is ONLY meant for testing and should never be used in production.
 *
 * @api public
 */

var MemoryStore = module.exports = function MemoryStore() {
  this.sessions = {};
};

/**
 * Inherit from `Store.prototype`.
 */

MemoryStore.prototype.__proto__ = Store.prototype;

/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.get = function(sid, fn){
  var self = this;
  setImmediate(function(){
    var expires
      , sess = self.sessions[sid];
    if (sess) {
      sess = JSON.parse(sess);
      fn(null, sess);
    } else {
      fn();
    }
  });
};

/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.set = function(sid, sess, fn){
  var self = this;
  setImmediate(function(){
    self.sessions[sid] = JSON.stringify(sess);
    fn && fn();
  });
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

MemoryStore.prototype.destroy = function(sid, fn){
  var self = this;
  setImmediate(function(){
    delete self.sessions[sid];
    fn && fn();
  });
};

/**
 * Invoke the given callback `fn` with all active sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.all = function(fn){
  var arr = []
    , keys = Object.keys(this.sessions);
  for (var i = 0, len = keys.length; i < len; ++i) {
    arr.push(this.sessions[keys[i]]);
  }
  fn(null, arr);
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.clear = function(fn){
  this.sessions = {};
  fn && fn();
};

/**
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.length = function(fn){
  fn(null, Object.keys(this.sessions).length);
};
