var headers = {
    method: 'GET',
    credentials: "include",
    headers: new Headers({
        "Accept": "application/json;odata=minimalmetadata",
    })
};

function getGroupMembersWithIndex(groupID, region, index, totalNum, ret) {
        var memberUrl = 'https://www.douban.com/group/' + groupID + '/members?start='+index; 
        console.log(memberUrl);

        fetch(window.location.protocol + "//" + window.location.host + "/group/" + groupID + "/members?start="+index, headers).then(response => {
                return response.text();
        }).then(myJson => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(myJson, "text/html");
                var members = doc.getElementsByClassName("member-list"); 
                members = members[members.length-1].getElementsByClassName("name");
                for (var i=0; i<members.length; i++)
                {
                        if (members[i].children[2].innerText.includes(region))
                        {
                                ret.push(members[i].children[0].getAttribute("href"));
                                console.log(members[i].children[0].getAttribute("href"));
                        }
                }
                index += 35;
                if (index < totalNum) {
                        setTimeout(() => { getGroupMembersWithIndex(groupID, region, index, totalNum, ret); }, 2000);
                }
        })
}

function doubanGroup(groupID, region) {
        fetch(window.location.protocol + "//" + window.location.host + "/group/" + groupID, headers).then(function(response) {
                //ret = response.text();
                //console.log(ret);
                return response.text();
        }).then(myJson => {
                ret = []
                memberNum = /浏览所有\S+ \(([0-9]+)\)/g.exec(myJson)[1];
                //console.log("memberNum is " + memberNum[1]);
                idx = 0;
                getGroupMembersWithIndex(groupID, region, idx, memberNum, ret);
                // console.log(ret);    // wrong!! TODO 
        });
}

class DoubanItemsExportor {
    type = '';
    itemsClassNameInDom = '';
    parseIdFromText(text) {return text;};
    getItemUrl(itemNode) { return ''; }
    getItemTitle(itemNode) { return ''; }
    async getItemId(itemUrl) {
        let ret = '';
        await fetch(itemUrl, headers).then(response => response.text()).then(content => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(content, "text/html");
            let info = doc.getElementById("info");
            ret = this.parseIdFromText(info === null ? '' : info.innerText);
        });
        return ret;
    }
    async getItemDetails(itemNode) {
        let ret = {};
        ret.comment = itemNode.getElementsByClassName("comment");
        ret.comment = ret.comment.length > 0 ? ret.comment[0].innerText.trim() : "";

        ret.date = itemNode.getElementsByClassName("date");
        ret.date = ret.date.length > 0 ? ret.date[0].innerText.split(' ')[0].trim() : "";

        ret.tags = itemNode.getElementsByClassName("tags");
        ret.tags = ret.tags.length > 0 ? ret.tags[0].innerText : "";
        if (ret.tags.startsWith("标签: ")) ret.tags = ret.tags.substring("标签: ".length);
        
        ret.rate = 0;
        if (itemNode.getElementsByClassName("rating1-t").length == 1) ret.rate = 1;
        else if (itemNode.getElementsByClassName("rating2-t").length == 1) ret.rate = 2;
        else if (itemNode.getElementsByClassName("rating3-t").length == 1) ret.rate = 3;
        else if (itemNode.getElementsByClassName("rating4-t").length == 1) ret.rate = 4;
        else if (itemNode.getElementsByClassName("rating5-t").length == 1) ret.rate = 5;

        ret.title = this.getItemTitle(itemNode);
        ret.url = this.getItemUrl(itemNode);
        ret.id = await this.getItemId(ret.url);
        return ret;
    };
    async getItems(userId) {
        let ret = [], index = 0, itemsDomNode = null; 
        do {
            let itemCollectUrl = "https://"+this.type+".douban.com/people/" + userId + "/collect?start=" + index;
            itemsDomNode = null;
            await fetch(itemCollectUrl, headers).then(response => response.text()).then(content => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(content, "text/html");
                itemsDomNode = doc.getElementsByClassName(this.itemsClassNameInDom);
            });
    
            for (let itemNode of itemsDomNode) {
                let itemDetail = await this.getItemDetails(itemNode);
                await new Promise(r => setTimeout(r, 2000));
                console.log("itemDetail:"+itemDetail);
                ret.push(itemDetail);
            }
    
            index += itemsDomNode.length;
            console.log("index = " + index);
        } while (itemsDomNode.length > 0);
        return ret;
    };
    convertToCsvFormat(items) {
        let ret = "Title;Id;URL;My Rating;Date;Tags;Comment";
        for (let item of items) {
            ret += "\n" + item.title + ";" + item.id + ";" + item.url + ";" + item.rate + ";" + item.date + ";" + item.tags + ";" + item.comment;
        }
        return ret;
    };
    saveFile(fileName, fileContent) {
        let bb = new Blob([fileContent ], { type: 'text/plain' });
        let a = document.createElement('a');
        a.download = fileName;
        a.href = window.URL.createObjectURL(bb);
        a.click();
    };
    async Run(userId, fileName) {
        let items = await this.getItems(userId);
        let fileContent = this.convertToCsvFormat(items);
        this.saveFile(fileName, fileContent);
    }
}

class BookExportor extends DoubanItemsExportor {
    type = 'book';
    itemsClassNameInDom = 'subject-item';
    parseIdFromText(text) {
        if (text.indexOf("ISBN: ") >= 0) {
            return text.substring(text.indexOf("ISBN: ")+"ISBN: ".length).trim();
        }
        return '';
    }
    getItemUrl(itemNode) { return itemNode.getElementsByTagName("h2")[0].children[0].getAttribute("href"); }
    getItemTitle(itemNode) { return itemNode.getElementsByTagName("h2")[0].children[0].getAttribute("title"); }
}

class MovieExportor extends DoubanItemsExportor {
    type = 'movie';
    itemsClassNameInDom = 'item';
    parseIdFromText(text) {
        for (let i of text.split('\n')) {
            if (i.indexOf("IMDb: ") >= 0) {
                return i.substring(i.indexOf("IMDb: ")+"IMDb: ".length).trim();
            }
        }
        return '';
    };
    getItemUrl(itemNode) { return itemNode.getElementsByClassName("title")[0].children[0].getAttribute("href"); }
    getItemTitle(itemNode) { return itemNode.getElementsByClassName("title")[0].children[0].innerText.split("/")[0].trim(); }
}

async function exportDoubanItems(userId, exportPath, bookOrMovie) {
    let exportor = null;
    if (bookOrMovie == "book") exportor = new BookExportor();
    else if (bookOrMovie == "movie") exportor = new MovieExportor();
    else {
        console.log("No exportor support for " + bookOrMovie);
        return;
    }
    exportor.Run(userId, exportPath);
}

//await exportDoubanItems("jslhcl", "jslhcl-book-collect2.csv", "book");
//await exportDoubanItems("jslhcl", "jslhcl-movie-collect2.csv", "movie");

// run the following code snippet in Node.js
const fs = require("fs");
let convertDoubanCsvToGoodReadsCsv = function(doubanCsvPath, goodReadsCsvPath) {
    let lines = fs.readFileSync(doubanCsvPath, "utf8").split("\n"), books = [];
    let meta = lines[0].split(";");
    for (let i = 1; i < lines.length; i++) {
        let fields = lines[i].split(";");
        if (fields.length === meta.length) {
            let book = {};
            book.title = fields[0];
            book.isbn = fields[1];
            book.url = fields[2];
            book.rate = fields[3];
            book.date = fields[4];
            book.tags = fields[5];
            book.comment = fields[6];
            books.push(book);
        } else {
            books[books.length-1].comment += " " + lines[i].trim();  // comment may have muliple lines
        }
    }
    console.log("book number:" + books.length);

    //let content = "ISBN,My Rating,Date Read,Shelves,Bookshelves,My Review";
    let content = "ISBN,My Rating,Date Read";
    for (let book of books) {
        // if (book.isbn.length > 0) content += "\n"+book.isbn+","+book.rate+","+book.date+",,"+book.tags+","+book.comment;
        if (book.isbn.length > 0) content += "\n"+book.isbn+","+book.rate+","+book.date; // try ASCII chars only
    }    
    fs.writeFileSync(goodReadsCsvPath, content);
}

convertDoubanCsvToGoodReadsCsv("/mnt/c/Users/leca/Downloads/jslhcl-book-collect.csv", "/mnt/c/Users/leca/Downloads/goodBooks_review.csv");

// IMDB
let doubanMoviesRate = function(doubanMovieCsvPath) {
    let lines = fs.readFileSync(doubanMovieCsvPath, "utf8").split("\n"), ret = {};
    let meta = lines[0].split(";");
    for (let i = 1; i < lines.length; i++) {
        let fields = lines[i].split(";");   // Title;IMDb;URL;My Rating;Date;Tags;Comment
        if (fields.length === meta.length) {
            if (fields[1].length === 0) console.log("No IMDb for:" + fields[0]);
            else {
                if (fields[3] === '0') console.log("No rate for:" + fields[0]);
                ret[fields[1]] = parseInt(fields[3]);
            }
        }
    }
    return ret;
}

let imdb2rate = doubanMoviesRate("/mnt/c/Users/leca/Downloads/jslhcl-movie-collect.csv"); 
console.log("count:" + Object.keys(imdb2rate).length + "\n" + JSON.stringify(imdb2rate));

let postImdbRate = async function(rating, titleId) {
    let postBody = {
        query:"mutation UpdateTitleRating($rating: Int!, $titleId: ID!) {rateTitle(input: {rating: $rating, titleId: $titleId}) {rating {value __typename} __typename}}",
        operationName:"UpdateTitleRating",
        variables:{"rating":rating,"titleId":titleId}
    };
    let postHeaders = {
        method: "POST",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(postBody),
    };
    await fetch("https://api.graphql.imdb.com/", postHeaders).then(response => response.json()).then(data => {console.log(data)});
}

let importDoubanRating2Imdb = async function(imdb2rate) {
    let rates = JSON.parse(imdb2rate);
    for (const imdb in rates) {
        let rate = rates[imdb] * 2;
        if (rate === 0) rate = 6;
        await postImdbRate(rate, imdb);
        await new Promise(r => setTimeout(r, 2000));
        console.log(imdb);
    }
}