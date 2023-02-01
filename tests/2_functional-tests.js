const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isAbove(res.body.stockData.likes, 0);
        done();
      });
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        const firstLike = res.body.stockData.like;
        chai
          .request(server)
          .get('/api/stock-prices?stock=GOOG')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.like, firstLike);
            done();
          });
      });
  });

  // test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
  //   chai
  //     .request(server)
  //     .get('/api/stock-prices?stock=GOOG')
  //     .end((err, res) => {
  //       assert.equal(res.status, 200);
  //       assert.equal(res.body.stockData.stock, 'GOOG');
  //       assert.property(res.body.stockData, 'stock');
  //       assert.property(res.body.stockData, 'price');
  //       assert.property(res.body.stockData, 'likes');
  //       done();
  //     });
  // });

  // test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
  //   chai
  //     .request(server)
  //     .get('/api/stock-prices?stock=GOOG')
  //     .end((err, res) => {
  //       assert.equal(res.status, 200);
  //       assert.equal(res.body.stockData.stock, 'GOOG');
  //       assert.property(res.body.stockData, 'stock');
  //       assert.property(res.body.stockData, 'price');
  //       assert.property(res.body.stockData, 'likes');
  //       done();
  //     });
  // });
});
