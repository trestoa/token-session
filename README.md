# express-token-session

Setup session store with the given `options`.

express-token-session is a fork of [express-session](https://github.com/expressjs/session/).
While [express-session](https://github.com/expressjs/session/) uses cookies for saving the session id
on the client, express-token-session generates a session token which can be sent to the client manually
and should be send to the server on every request.
This means that your request's body MUST be json formated and MUST include a `token` property in the request body.



## Example

```js
 app.use(bodyParser)
 app.use(connect.session()
```

**Options**

  - `store` session store instance

## req.session

To store or access session data, simply use the request property `req.session`,
which is (generally) serialized as JSON by the store, so nested objects
are typically fine. For example below is a user-specific view counter:

```js
app.use(cookieParser())
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.use(function(req, res, next){
  var sess = req.session;
  if (sess.views) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<pre>' + sess + '</pre>');
    res.end();
    sess.views++;
  } else {
    sess.views = 1;
    res.end('welcome to the session demo. refresh!');
  }
})
```

## Session#destroy()

Destroys the session, removing `req.session`.

```js
req.session.destroy(function(err){
  // cannot access session here
});
```

## Session#reload()

Reloads the session data.

```js
req.session.reload(function(err){
  // session updated
});
```

## Session#save()

Save the session.

```js
req.session.save(function(err){
  // session saved
});
```

## Session Store Implementation

Every session store _must_ implement the following methods

   - `.get(sid, callback)`
   - `.set(sid, session, callback)`
   - `.destroy(sid, callback)`

Recommended methods include, but are not limited to:

   - `.length(callback)`
   - `.clear(callback)`
