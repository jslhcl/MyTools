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

let exportDoubanBooks = async function(userId, exportPath) {
    let books = await doubanBooks(userId);
    let fileContent = convertToCsvFormat(books);
    saveFile(exportPath, fileContent);
}

//await exportDoubanBooks("jslhcl", "jslhcl-book-collect.csv");

let getMovieImdb = async function(movieUrl) {
    let ret = '';
    await fetch(movieUrl, headers).then(response => response.text()).then(content => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(content, "text/html");
        let info = doc.getElementById("info");
        if (info !== null) {
            info = info.innerText.split("\n");
            for (let i of info) {
                if (i.indexOf("IMDb: ") >= 0) {
                    ret = i.substring(i.indexOf("IMDb: ")+"IMDb: ".length).trim();
                    break;
                }
            }
        }
    });
    return ret;
}

let getMovieDetails = async function(movieDomNode) {
    let ret = {};
    ret.url = movieDomNode.getElementsByClassName("title")[0].children[0].getAttribute("href");
    ret.title = movieDomNode.getElementsByClassName("title")[0].children[0].innerText.split("/")[0].trim();

    ret.comment = movieDomNode.getElementsByClassName("comment");
    ret.comment = ret.comment.length > 0 ? ret.comment[0].innerText.trim() : "";

    ret.date = movieDomNode.getElementsByClassName("date");
    ret.date = ret.date.length > 0 ? ret.date[0].innerText.split(' ')[0].trim() : "";

    ret.tags = movieDomNode.getElementsByClassName("tags");
    ret.tags = ret.tags.length > 0 ? ret.tags[0].innerText : "";
    if (ret.tags.startsWith("标签: ")) ret.tags = ret.tags.substring("标签: ".length);
    
    ret.rate = 0;
    if (movieDomNode.getElementsByClassName("rating1-t").length == 1) ret.rate = 1;
    else if (movieDomNode.getElementsByClassName("rating2-t").length == 1) ret.rate = 2;
    else if (movieDomNode.getElementsByClassName("rating3-t").length == 1) ret.rate = 3;
    else if (movieDomNode.getElementsByClassName("rating4-t").length == 1) ret.rate = 4;
    else if (movieDomNode.getElementsByClassName("rating5-t").length == 1) ret.rate = 5;
    
    ret.imdb = await getMovieImdb(ret.url);
    return ret;
}

let doubanMovies = async function(userId) {
    let ret = [], index = 0, movies = null; 
    do {
        let movieCollectUrl = "https://movie.douban.com/people/" + userId + "/collect?start=" + index;
        movies = null;
        await fetch(movieCollectUrl, headers).then(response => response.text()).then(content => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(content, "text/html");
            movies = doc.getElementsByClassName("item");
        });

        for (let movieDomNode of movies) {
            let movieDetail = await getMovieDetails(movieDomNode);
            await new Promise(r => setTimeout(r, 2000));
            console.log("movieDetail:"+movieDetail);
            ret.push(movieDetail);
        }

        index += movies.length;
        console.log("index = " + index);
    } while (movies.length > 0);
    return ret;
}

let convertToCsvFormat2 = function(movies) {
    let ret = "Title;IMDb;URL;My Rating;Date;Tags;Comment";
    for (let movie of movies) {
        ret += "\n" + movie.title + ";" + movie.imdb + ";" + movie.url + ";" + movie.rate + ";" + movie.date + ";" + movie.tags + ";" + movie.comment;
    }
    return ret;
}

let exportDoubanMovies = async function(userId, exportPath) {
    let movies = await doubanMovies(userId);
    let fileContent = convertToCsvFormat2(movies);
    saveFile(exportPath, fileContent);
}

await exportDoubanMovies("jslhcl", "jslhcl-movie-collect.csv");

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