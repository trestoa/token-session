/*!
 * Connect - session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Markus Klein
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var uid = require('uid2');

var Session = require('./session/session')
  , MemoryStore = require('./session/memory')
  , Store = require('./session/store')

// environment

var env = process.env.NODE_ENV;

/**
 * Expose the middleware.
 */

exports = module.exports = session;

/**
 * Expose constructors.
 */

exports.Store = Store;
exports.Session = Session;
exports.MemoryStore = MemoryStore;

exports.generateSession = function(req){
	req.sessionToken = uid(40);
	req.session = new Session(req);
}

/**
 * Warning message for `MemoryStore` usage in production.
 */

var warning = 'Warning: connect.session() MemoryStore is not\n'
  + 'designed for a production environment, as it will leak\n'
  + 'memory, and will not scale past a single process.';

/**
 * Session:
 *
 *   Setup session store with the given `options`.
 *
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.json())
 *       .use(connect.session()
 *
 * Options:
 *
 *   - `store` session store instance
 *	 - `logger` optional logger provided by [log4js-node](https://github.com/nomiddlename/log4js-node)
 *
 * ## req.session
 *
 *  To store or access session data, simply use the request property `req.session`,
 *  which is (generally) serialized as JSON by the store, so nested objects
 *  are typically fine. For example below is a user-specific view counter:
 *
 *       connect()
 *         .use(connect.favicon())
 *         .use(connect.json())
 *         .use(connect.session()
 *         .use(function(req, res, next){
 *           var sess = req.session;
 *           if (sess.views) {
 *             res.setHeader('Content-Type', 'text/html');
 *             res.write('<p>views: ' + sess.views + '</p>');
 *             res.end();
 *             sess.views++;
 *           } else {
 *             sess.views = 1;
 *             res.end('welcome to the session demo. refresh!');
 *           }
 *         }
 *       )).listen(3000);
 *
 * ## Session#destroy()
 *
 *  Destroys the session, removes `req.session`.
 *
 *      req.session.destroy(function(err){
 *        // cannot access session here
 *      });
 *
 * ## Session#reload()
 *
 *  Reloads the session data.
 *
 *      req.session.reload(function(err){
 *        // session updated
 *      });
 *
 * ## Session#save()
 *
 *  Save the session.
 *
 *      req.session.save(function(err){
 *        // session saved
 *      });
 *
 * ## Session#touch()
 *
 * Updates the `.maxAge` property. Typically this is
 * not necessary to call, as the session middleware does this for you.
 *
 * Session Store Implementation:
 *
 * Every session store _must_ implement the following methods
 *
 * - `.get(sid, callback)`
 * - `.set(sid, session, callback)`
 * - `.destroy(sid, callback)`
 *
 * Recommended methods include, but are not limited to:
 *
 * - `.length(callback)`
 * - `.clear(callback)`
 *
 * For an example implementation view the [token-session-redis](http://github.com/kleiinnn/token-session-redis) repo.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

function session(options){
  var options = options || {}
    , store = options.store || new MemoryStore()
    , storeReady = true
    , logger = options.logger;

  // notify user that this store is not
  // meant for a production environment
  if ('production' == env && store instanceof MemoryStore && logger) {
    logger.warn(warning);
  }

  store.on('disconnect', function(){ storeReady = false; });
  store.on('connect', function(){ storeReady = true; });

  return function session(req, res, next) {
    // self-awareness
    if (req.session) return next();

    // Handle connection as if there is no session if
    // the store has temporarily disconnected etc
    if (!storeReady && logger) return logger.error('store is disconnected'), next();

    // expose store
    req.sessionStore = store;

    // proxy end() to commit the session
    var end = res.end;
    res.end = function(data, encoding){
      res.end = end;
      if (!req.session || !req.sessionToken) return res.end(data, encoding);
      req.session.save(function(err){
        if (err) console.error(err.stack);
        res.end(data, encoding);
      });
    };

    // do not load a session if no session token
    if (!req.body.token) {
      next();
      return;
    }
	

    // generate the session object
    store.get(req.body.token, function(err, sess){
      // error handling
      if (err) {
        if(logger) logger.error(err);
        if ('ENOENT' == err.code) {
          next();
        } else {
          next(err);
        }
      // no session
      } else if (!sess) {
        next();
      // populate req.session
      } else {
	    // get the session token from the request body	
	  	req.sessionToken = req.body.token;
        store.createSession(req, sess);
        next();
      }
    });
  };
};
