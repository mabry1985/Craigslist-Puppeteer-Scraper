const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
require("dotenv").config();
const Listing = require("./model/Listing");
const ObjectsToCsv = require('objects-to-csv');

async function connectToMongoDb() {
  password = process.env.MONGO_PASSWORD
  await mongoose.connect(
    `mongodb+srv://Josh:${password}@craigslist-scraper-ktqjw.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  );
  console.log("connected to db")
}

async function createCsvFile(data) {
  const csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk("./test.csv");

}

async function scrapeListings(page) {
  await page.goto("https://portland.craigslist.org/d/software-qa-dba-etc/search/sof");

  const html = await page.content();
  const $ = cheerio.load(html);

  const listings = $(".result-info").map((index, element) => {
    const titleElement = $(element).find(".result-title");
    const timeElement = $(element).find(".result-date")
    const hoodElement = $(element).find(".result-hood");
    
    const title = $(titleElement).text();
    const url = $(titleElement).attr("href");
    const datePosted = new Date($(timeElement).attr("datetime"));
    const neighborhood = $(hoodElement).text().trim().replace("(","").replace(")","");
    
    return { title, url, datePosted, neighborhood };
  }).get();
  return listings;
}

async function scrapeJobDescriptions(listings, page) {
  for(var i = 0; i < listings.length / 10; i ++) {
    await page.goto(listings[i].url);
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $("#postingbody").text();
    const compensation = $("p.attrgroup > span:nth-child(1) > b").text()
    listings[i].jobDescription = jobDescription;
    listings[i].compensation = compensation;
    const listingModel = new Listing(listings[i]);
    await listingModel.save();
    
    await sleep(1000);
  }
}

async function sleep(mseconds) {
  return new Promise(resolve => setTimeout(resolve, mseconds));
}

async function main() {
  await connectToMongoDb();
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithDescriptions = await scrapeJobDescriptions(
    listings,
    page
  );
  await createCsvFile(listings);
  console.log(listings);
}

main();