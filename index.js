const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrapingResults = [
  {
    title: "",
    datePosted: new Date("2019-07-25 12:34:00"),
    neighborhood: "(palo alto)",
    url: "https://portland.craigslist.org/mlt/sof/d/vancouver-entry-level-python-yaml/7028441064.html",
    jobDescription: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, voluptatum.",
    compensation: "Up to $5.00 per hour"
  }
]

async function main() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto("https://portland.craigslist.org/d/software-qa-dba-etc/search/sof");

  const html = await page.content();
  const $ = cheerio.load(html);

  const results = $(".result-info").map((index, element) => {
    const titleElement = $(element).find(".result-title");
    const timeElement = $(element).find(".result-date")
    const hoodElement = $(element).find(".result-hood");
    
    const title = $(titleElement).text();
    const url = $(titleElement).attr("href");
    const datePosted = new Date($(timeElement).attr("datetime"));
    const neighborhood = $(hoodElement).text().trim().replace("(","").replace(")","");
    
    return { title, url, datePosted, neighborhood };
  }).get();
  console.log(results);
}

main();