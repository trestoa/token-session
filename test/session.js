
var connect = require('connect')
  , express = require('express')
  , assert = require('assert')
  , request = require('supertest')
  , should = require('should')
  , session = require('../')


function respond(req, res) {
  res.end();
}

var TOKEN_KEY = 'token';

var app = connect()
  .use(session({ key: TOKEN_KEY }))
  .use(respond);

describe('session()', function (){
  it('should export constructors', function (){
    session.Session.should.be.a.Function;
    session.Store.should.be.a.Function;
    session.MemoryStore.should.be.a.Function;
  });

  describe('req.session', function (){
    it('should persist', function (done){
      var app = express()
        .use(express.json())
        .all('*', session({ key: TOKEN_KEY }))
        .post('/login', function (req, res) {
          session.generate(req, 'thisIsMyToken__');
          res.end(req.sessionToken);
        })
        .post('/count', function (req, res) {
          if (!req.session) {
            return res.end('No session found');
          }
          req.session.count = req.session.count || 0;
          req.session.count++;
          res.end(req.session.count.toString());          
        });

      request(app)
      .post('/login')
      .end(function (err, res) {
        res.text.should.equal('thisIsMyToken__');
        var p = {};
        p[TOKEN_KEY] = res.text;
        request(app)
        .post('/count')
        .send(p)
        .end(function (err, res){
          res.text.should.equal('1');
          request(app)
          .post('/count')
          .send(p)
          .end(function (err, res){
            res.text.should.equal('2');
            done();
          });
        });
      });
    });

    it('should be able to retrieve token on URI', function (done) {
      var app = express()
        .use(express.json())
        .use(session({ key: TOKEN_KEY }))
        .post('/login', function (req, res) {
          session.generate(req, 'thisIsMyToken__');
          req.session.value = 'Wouahouuuu';
          res.end(req.sessionToken);
        })
        .get('/my/route', function (req, res) {
          req.session.should.be.an.instanceOf(session.Session);
          res.end(req.session.value);
        });

      request(app)
      .post('/login')
      .end(function (err, res) {
        res.text.should.equal('thisIsMyToken__');
        request(app)
        .get('/my/route?' + TOKEN_KEY + '=thisIsMyToken__')
        .end(function (err, res){
          res.text.should.equal('Wouahouuuu');
          done();
        });
      });
    });

    describe('.destroy()', function (){
      it('should destroy the previous session', function (done){
        var app = express()
          .use(express.json())
          .use(session({ key: TOKEN_KEY }))
          .post('/login', function (req, res) {
            session.generate(req, 'thisIsMyToken__');
            res.end(req.sessionToken);
          })
          .post('/test', function (req, res) {
            req.session.count = req.session.count || 0;
            req.session.count++;
            if (req.session.count <= 2) {
              res.end(req.session.count.toString());
            }
            else {
              req.session.destroy(function (err){
                if (err) throw err;
                assert(!req.session, 'req.session after destroy');
                res.end('session destroyed');
              });              
            }
          });

        request(app)
        .post('/login')
        .end(function (err, res) {
          res.text.should.equal('thisIsMyToken__');
          var p = {};
          p[TOKEN_KEY] = res.text;
          request(app)
          .post('/test')
          .send(p)
          .end(function (err, res){
            res.text.should.equal('1');
            request(app)
            .post('/test')
            .send(p)
            .end(function (err, res){
              res.text.should.equal('2');
                request(app)
                .post('/test')
                .send(p)
                .end(function (err, res){
                  res.text.should.equal('session destroyed');
                  done();
                });
            });
          });
        });
      });
    });

    // describe('.regenerate()', function (){
    //   it('should destroy/replace the previous session', function (done){
    //     var app = connect()
    //       .use(express.json())
    //       .use(session({ key: TOKEN_KEY }))
    //       .post('/login', function (req, res) {
    //         session.generate(req, 'thisIsMyToken__');
    //         res.end(req.sessionToken);
    //       })
    //       .post('/regenerate', function (req, res, next){
    //         var id = req.session.id;
    //         req.session.regenerate(function (err){
    //           if (err) throw err;
    //           id.should.not.equal(req.session.id);
    //           res.end();
    //         });
    //       });

    //     request(app)
    //     .get('/')
    //     .end(function (err, res){
    //       var id = sid(res);
    //       request(app)
    //       .get('/')
    //       .set('Cookie', 'connect.sid=' + id)
    //       .end(function (err, res){
    //         sid(res).should.not.equal('');
    //         sid(res).should.not.equal(id);
    //         done();
    //       });
    //     });
    //   })
    // })
  })
})
