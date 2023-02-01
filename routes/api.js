'use strict';
const fetch = require('node-fetch');
const Stock = require('../models/stock');

module.exports = function (app) {
  app.route('/api/stock-prices').get(async (req, res) => {
    let { stock, like } = req.query;
    stock = stock.toUpperCase();
    like = like === 'true';

    try {
      const fetchData = async (stock) => {
        const response = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
        );
        const data = await response.json();
        return data.latestPrice;
      };

      const price = await fetchData(stock);

      if (!price) {
        throw new Error(`Can not find price with the symbol: ${stock}`);
      }

      const getIp = async () => {
        const response = await fetch('https://api.ipify.org/?format=json');
        const json = response.json();
        return json.ip;
      };

      const userIp = await getIp();

      const getLikes = async (like, stock, ip) => {
        const stockInDB = await Stock.findOne({ stock }).then((doc) => {
          if (doc && like && !doc.ips.includes(ip)) {
            doc.ips = doc.ips.concat(ip);
            doc.likes = doc.likes + 1;
            doc.save().then((docUpdated) => {
              return docUpdated;
            });
          } else if (doc) {
            return doc;
          }
        });

        if (stockInDB) {
          return stockInDB.likes;
        } else {
          const docCreated = await Stock.create({
            stock: stock,
            ips: like ? [ip] : [],
            likes: like ? 1 : 0,
          }).then((doc) => {
            return doc;
          });
          return docCreated.likes;
        }
      };

      const likes = await getLikes(like, stock, userIp);

      const stockData = {
        stock: stock,
        price: price,
        likes: likes,
      };
      res.status(200).send({ stockData });
    } catch (error) {
      res.status(200).send({ error: error.message });
    }
  });
};
