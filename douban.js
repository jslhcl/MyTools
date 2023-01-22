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

let getBookISBN = async function(bookUrl) {
    let ret = '';
    await fetch(bookUrl, headers).then(response => response.text()).then(content => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(content, "text/html");
        let info = doc.getElementById("info");
        if (info !== null && info.innerText.indexOf("ISBN: ") >= 0) {
            ret = info.innerText.substring(info.innerText.indexOf("ISBN: ")+"ISBN: ".length).trim();
        }
    });
    return ret;
}

let getBookDetails = async function(bookDomNode) {
    let ret = {};
    ret.url = bookDomNode.getElementsByTagName("h2")[0].children[0].getAttribute("href");
    ret.title = bookDomNode.getElementsByTagName("h2")[0].children[0].getAttribute("title");
    ret.comment = bookDomNode.getElementsByClassName("comment");
    ret.comment = ret.comment.length > 0 ? ret.comment[0].innerText.trim() : "";

    ret.date = bookDomNode.getElementsByClassName("date");
    ret.date = ret.date.length > 0 ? ret.date[0].innerText.split(' ')[0].trim() : "";

    ret.tags = bookDomNode.getElementsByClassName("tags");
    ret.tags = ret.tags.length > 0 ? ret.tags[0].innerText : "";
    if (ret.tags.startsWith("标签: ")) ret.tags = ret.tags.substring("标签: ".length);
    
    ret.rate = 0;
    if (bookDomNode.getElementsByClassName("rating1-t").length == 1) ret.rate = 1;
    else if (bookDomNode.getElementsByClassName("rating2-t").length == 1) ret.rate = 2;
    else if (bookDomNode.getElementsByClassName("rating3-t").length == 1) ret.rate = 3;
    else if (bookDomNode.getElementsByClassName("rating4-t").length == 1) ret.rate = 4;
    else if (bookDomNode.getElementsByClassName("rating5-t").length == 1) ret.rate = 5;
    
    ret.isbn = await getBookISBN(ret.url);
    return ret;
}

let convertToCsvFormat = function(books) {
    let ret = "Title;ISBN;URL;My Rating;Date;Tags;Comment";
    for (let book of books) {
        ret += "\n" + book.title + ";" + book.isbn + ";" + book.url + ";" + book.rate + ";" + book.date + ";" + book.tags + ";" + book.comment;
    }
    return ret;
}

let saveFile = function(fileName, fileContent) {
    let bb = new Blob([fileContent ], { type: 'text/plain' });
    let a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(bb);
    a.click();
};

let doubanBooks = async function(userId) {
    let ret = [], index = 0, books = null; 
    do {
        let bookCollectUrl = "https://book.douban.com/people/" + userId + "/collect?start=" + index;
        books = null;
        await fetch(bookCollectUrl, headers).then(response => response.text()).then(content => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(content, "text/html");
            books = doc.getElementsByClassName("subject-item");
        });

        for (let bookDomNode of books) {
            let bookDetail = await getBookDetails(bookDomNode);
            await new Promise(r => setTimeout(r, 2000));
            console.log("bookDetail:"+bookDetail);
            ret.push(bookDetail);
        }

        index += books.length;
        console.log("index = " + index);
    } while (books.length > 0);
    return ret;
}

let exportDoubanBooks = async function() {
    let books = await doubanBooks("jslhcl");
    let fileContent = convertToCsvFormat(books);
    saveFile("jslhcl-book-collect.csv", fileContent);
}

//await exportDoubanBooks();

// run the following code snippet in Node.js
const fs = require("fs");
let doubanBooksCsvPath = "/mnt/c/Users/leca/Downloads/jslhcl-book-collect.csv";
let convertDoubanCsvToGoodReadsCsv = function(doubanCsvPath, goodReadsCsvPath) {
    let lines = fs.readFileSync(doubanCsvPath, "utf8").split("\n"), books = [];
    let meta = lines[0].split(";");
    for (let i = 1; i < lines.length; i++) {
        let fields = lines[i].split(";");
        if (fields.length == meta.length) {
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

convertDoubanCsvToGoodReadsCsv("/mnt/c/Users/leca/Downloads/jslhcl-book-collect.csv", "/mnt/c/Users/leca/Downloads/goodBooks.csv");