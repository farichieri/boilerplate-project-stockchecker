'use strict';
const fetch = require('node-fetch');
const Stock = require('../models/stock');

module.exports = function (app) {
  app.route('/api/stock-prices').get(async (req, res) => {
    let { stock, like } = req.query;
    like = like === 'true';

    try {
      const getUserIp = async () => {
        const fetchIp = await fetch(`https://api.ipify.org/?format=json`);
        const ipJson = await fetchIp.json();
        return ipJson.ip;
      };

      const getStockPrice = async (stock) => {
        const fetchStock = await fetch(
          `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
        );
        const stockJson = await fetchStock.json();
        return stockJson.latestPrice;
      };

      const getLikes = async (stock, ip, like) => {
        const stockInDB = await Stock.findOne({ stock }).then(async (doc) => {
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

      const getAllStockData = async (stock, ip, like) => {
        stock = stock.toUpperCase();
        const likes = await getLikes(stock, ip, like);
        const price = await getStockPrice(stock);
        return {
          stock: stock,
          price: price,
          likes: likes,
        };
      };

      let ip = await getUserIp();
      ip = ip.slice(8);

      if (Array.isArray(stock) && stock.length === 2) {
        const firstStock = await getAllStockData(stock[0], ip, like);
        const secondStock = await getAllStockData(stock[1], ip, like);
        const stockData = [
          {
            price: firstStock.price,
            stock: firstStock.stock,
            rel_likes: firstStock.likes - secondStock.likes,
          },
          {
            price: secondStock.price,
            stock: secondStock.stock,
            rel_likes: secondStock.likes - firstStock.likes,
          },
        ];
        return res.status(200).send({ stockData });
      } else {
        const stockData = await getAllStockData(stock, ip, like);
        res.status(200).send({ stockData });
      }
    } catch (error) {
      res.status(200).send({ error: error.message });
    }
  });
};
