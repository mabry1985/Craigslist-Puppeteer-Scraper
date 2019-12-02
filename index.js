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

  const results = $(".result-title").map((index, element) => {
    const title = $(element).text();
    const url = $(element).attr("href");
    return { title, url };
  }).get();
  console.log(results);
}

main();