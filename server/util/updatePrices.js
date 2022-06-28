const Track = require("../models/Track");
const User = require("../models/User");

const updatePrices = () => {
  Track.find({}, (err, tracks) => {
    if (err) {
      console.log(err);
    } else {
      tracks.forEach(async (track) => {
        const { url, currentPrice, reqPrice, user } = track;
        const selectedUserEmail = User.findById(user).email;

        let price = 0;
        let image = "";

        console.log(url);

        if (url.includes("amazon.in")) {
          //crawl amazon
          console.log(`Crawling ${url}`.green.underline.bold);
          const html = await axios.get(url);
          const $ = cheerio.load(html.data);

          price = $(".a-price-whole").first().text();
          image = $("#landingImage").attr("src");
          console.log(`Image: ${image}`.green.underline.bold);

          console.log(
            `${name} price: ${parseFloat(price.replace(/[^0-9\.-]+/g, ""))}`
              .cyan.underline.bold
          );
          console.log(`Crawling ends...`.red.bold);
        } else if (url.includes("flipkart.com")) {
          //crawl flipkart
          console.log(`Crawling ${url}`.green.underline.bold);
          const html = await axios.get(url);
          const $ = cheerio.load(html.data);

          price = $("._16Jk6d").text();
          image = $("._396QI4").first().attr("src");
          image = image.replace("/image/0/0/", "/image/500/500/");

          console.log(`Image: ${image}`.green.underline.bold);

          console.log(
            `${name} price: ${parseFloat(price.replace(/[^0-9\.-]+/g, ""))}`
              .cyan.underline.bold
          );
          console.log(`Crawling ends...`.red.bold);
        }

        if (price != currentPrice) {
          track.currentPrice = price;
          track.save();
          console.log(
            `${selectedUserEmail} price updated`.green.underline.bold
          );
        }

        if(price <= reqPrice) {
          console.log(`${selectedUserEmail} price reached`.green.underline.bold);
        }
      });
    }
  });
};

exports.updatePrices = updatePrices;