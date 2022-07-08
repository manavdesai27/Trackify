const Track = require("../models/Track");
const User = require("../models/User");
const axios = require("axios").default;
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const updatePrices = () => {
  console.log("Updating prices...");
  Track.find({}, (err, tracks) => {
    if (err) {
      console.log(err);
    } else {
      tracks.forEach(async (track) => {
        const { url, currentPrice, reqPrice, user, name } = track;
        const selectedUserEmail = User.findById(user).email;

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

        if(price<=reqPrice){
          //send email
          console.log(`Sending email to ${selectedUserEmail}`.green.underline.bold);
          let mailOptions = {
            from: "manavtech27@gmail.com",
            to: selectedUserEmail,
            subject: "Price dropped for "+name,
            text: "Price changed for ${url} to ${price}",
          }
          
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          })
        }

        if (price != currentPrice) {
          track.currentPrice = price;
          track.save();
          console.log(
            `${selectedUserEmail} price updated`.green.underline.bold
          );
        }
      });
    }
  });
};

exports.updatePrices = updatePrices;
