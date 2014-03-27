  - [exports.Store](#exportsstore)
  - [warning](#warning)
  - [session()](#session)
  - [req.session](#reqsession)
  - [Session#destroy()](#sessiondestroy)
  - [Session#reload()](#sessionreload)
  - [Session#save()](#sessionsave)
  - [Session#touch()](#sessiontouch)

## exports.Store

  Expose constructors.

## warning

  Warning message for `MemoryStore` usage in production.

## session()

  Session:
  
```js
Setup session store with the given `options`.
```

  
  
  Examples:
  
```js
  connect()
    .use(connect.json())
    .use(connect.session()
```

  
  Options:
  
```js
- `store` session store instance
```

  	 - `logger` optional logger provided by [log4js-node](https://github.com/nomiddlename/log4js-node)
  
# req.session
  
   To store or access session data, simply use the request property `req.session`,
   which is (generally) serialized as JSON by the store, so nested objects
   are typically fine. For example below is a user-specific view counter:
  
```js
    connect()
      .use(connect.favicon())
      .use(connect.json())
      .use(connect.session()
      .use(function(req, res, next){
        var sess = req.session;
        if (sess.views) {
          res.setHeader('Content-Type', 'text/html');
          res.write('<p>views: ' + sess.views + '</p>');
          res.end();
          sess.views++;
        } else {
          sess.views = 1;
          res.end('welcome to the session demo. refresh!');
        }
      }
    )).listen(3000);
```

  
# Session#destroy()
  
   Destroys the session, removes `req.session`.
  
```js
   req.session.destroy(function(err){
     // cannot access session here
   });
```

  
# Session#reload()
  
   Reloads the session data.
  
```js
   req.session.reload(function(err){
     // session updated
   });
```

  
# Session#save()
  
   Save the session.
  
```js
   req.session.save(function(err){
     // session saved
   });
```

  
# Session#touch()
  
```js
Updates the `.maxAge` property. Typically this is
not necessary to call, as the session middleware does this for you.
```

  
  Session Store Implementation:
  
  Every session store _must_ implement the following methods
  
```js
 - `.get(sid, callback)`
 - `.set(sid, session, callback)`
 - `.destroy(sid, callback)`
```

  
  Recommended methods include, but are not limited to:
  
```js
 - `.length(callback)`
 - `.clear(callback)`
```

  
  For an example implementation view the [token-session-redis](http://github.com/kleiinnn/token-session-redis) repo.
