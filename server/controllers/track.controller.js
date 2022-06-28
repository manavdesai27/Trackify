const Track = require("../models/Track");
const User = require("../models/User");
const cheerio = require("cheerio");
const axios = require("axios");

exports.postTrack = async (req, res) => {
  try {
    const { userId, trackUrl, name, reqPrice } = req.body;
    const user = await User.findById(userId);

    if (trackUrl.includes("amazon")) {
      //crawl amazon
      console.log(`Crawling ${trackUrl}`.green.underline.bold);
      const html = await axios.get(trackUrl);
      const $ = cheerio.load(html.data);

      const price = $(".a-price-whole").text();

      console.log(`${name} price: ${price}`.cyan.underline.bold);
      console.log(`Crawling ends...`.red.bold);
    } else if (trackUrl.includes("flipkart")) {
      //crawl flipkart
      console.log(`Crawling ${trackUrl}`.green.underline.bold);
      console.log(`Crawling ${trackUrl}`.green.underline.bold);
      const html = await axios.get(trackUrl);
      const $ = cheerio.load(html.data);

      const price = $("._30jeq3").text();

      console.log(`${name} price: ${price}`.cyan.underline.bold);
      console.log(`Crawling ends...`.red.bold);
    } else if (
      trackUrl.indexof("amazon") < 0 ||
      trackUrl.indexof("flipkart") < 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid URL",
      });
    }

    const newTrack = new Track({
      user: user._id,
      reqPrice,
      name,
      url: trackUrl,
      currentPrice: parseFloat(price.replace(/[^0-9\.-]+/g, "")),
      image: "",
    });

    const track = await Track.create(newTrack);
    user.addedUrls.unshift(track._id);
    await user.save();
    return res.status(200).json({
      success: true,
      data: track,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
