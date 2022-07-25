const Track = require("../models/Track");
const User = require("../models/User");
const cheerio = require("cheerio");
const axios = require("axios");

exports.postTrack = async (req, res) => {
  try {
    const { userId, trackUrl, name, reqPrice } = req.body;
    const user = await User.findById(userId);
    let price = 0;
    let image = "";

    if (trackUrl.includes("amazon.in")) {
      //crawl amazon
      console.log(`Crawling ${trackUrl}`.green.underline.bold);
      const html = await axios.get(trackUrl);
      const $ = cheerio.load(html.data);

      price = $(".a-price-whole").first().text();
      image = $("#landingImage").attr("src");
      console.log(`Image: ${image}`.green.underline.bold);

      console.log(
        `${name} price: ${parseFloat(price.replace(/[^0-9\.-]+/g, ""))}`.cyan
          .underline.bold
      );
      console.log(`Crawling ends...`.red.bold);
    } else if (trackUrl.includes("flipkart.com")) {
      //crawl flipkart
      console.log(`Crawling ${trackUrl}`.green.underline.bold);
      const html = await axios.get(trackUrl);
      const $ = cheerio.load(html.data);

      price = $("._16Jk6d").text();
      price.replace("₹", "");
      image = $("._396QI4").first().attr("src");
      image = image.replace("/image/0/0/", "/image/200/200/");
      console.log(`Image: ${image}`.green.underline.bold);

      console.log(
        `${name} price: ${parseFloat(price.replace(/[^0-9\.-]+/g, ""))}`.cyan
          .underline.bold
      );
      console.log(`Crawling ends...`.red.bold);
    } else if (
      trackUrl.indexOf("amazon.in") < 0 ||
      trackUrl.indexOf("flipkart.com") < 0
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
      image,
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

exports.editTrack = async (req, res) => {
  try {
    const { name, reqPrice } = req.body;

    const track = await Track.findById(req.params.id);

    track.name = name;
    track.reqPrice = reqPrice;
    await track.save();

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

exports.enableNotifications = async (req, res) => {
  try {
    const { notification } = req.body;
    const track = await Track.findById(req.params.id);
    console.log(track.notification, notification);

    track.notification = notification;

    await track.save();

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

exports.deleteTracks = async (req, res) => {
  try {
    const { userId, selectedTracks } = req.body;
    const user = await User.findById(userId);
    const trackids = selectedTracks.map((track) => track._id);
    const tracks = await Track.find({
      _id: {
        $in: trackids,
      },
    });

    await Track.deleteMany({
      _id: {
        $in: trackids,
      },
    });

    trackids.forEach(async (trackid) => {
      const index = user.addedUrls.indexOf(trackid);
      if (index > -1) {
        user.addedUrls.splice(index, 1);
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      deleted: tracks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.multiTrack = async (req, res, next) => {
  try {
    const { userId, createdTracks } = req.body;
    const user = await User.findById(userId);
    const trackids = createdTracks.map((track) => track._id);

    try {
      await new Promise((resolve, reject) => {
        createdTracks.forEach(async (track) => {
          try {
            const currentTrack = await Track.findById(track._id);
            const { url, currentPrice, reqPrice, name } = track;
            let price = 0;

            if (url.includes("amazon.in")) {
              //crawl amazon
              console.log(`Crawling ${url}`.green.underline.bold);
              const html = await axios.get(url);
              const $ = cheerio.load(html.data);

              price = $(".a-price-whole").first().text();

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

              console.log(
                `${name} price: ${parseFloat(price.replace(/[^0-9\.-]+/g, ""))}`
                  .cyan.underline.bold
              );
              console.log(`Crawling ends...`.red.bold);
            }
            price = parseFloat(price.replace(/[^0-9\.-]+/g, ""));
            if (price != currentPrice) {
              currentTrack.currentPrice = price;
              await currentTrack.save();
            }
          } catch (err) {
            console.log(err);
          }

          resolve();
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const tracks = await Track.find({
      _id: {
        $in: trackids,
      },
    });

    return res.status(200).json({
      success: true,
      data: tracks,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
  // Recrawl all the tracks
};
