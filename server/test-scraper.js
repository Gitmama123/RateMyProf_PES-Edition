const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('page.html'));

console.log("Pagination Container:", $('.pagination').html());
const links = [];
$('.pagination a').each((i, el) => links.push($(el).attr('href')));
console.log("Pagination Links:", links);
