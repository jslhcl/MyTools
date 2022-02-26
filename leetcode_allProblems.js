let getCSRFToken = function(cookies) {
    for (let ck of cookies) {
        let kvp = ck.split('=');
        if (kvp[0].indexOf('csrftoken') >= 0) return kvp[1];
    }
    return '';
};

let getQuestions = async function(csrfToken, skip, limit) {
    let postBody = {
        query: 'query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {problemsetQuestionList: questionList(categorySlug: $categorySlug limit: $limit skip: $skip  filters: $filters){total:totalNum questions: data{likes dislikes acRate difficulty freqBar frontendQuestionId: questionFrontendId isFavor paidOnly: isPaidOnly status title titleSlug topicTags{name id slug}}}}',
        variables: {"categorySlug":"","skip":skip,"limit":limit,"filters":{}},
    };
    let param = {
        method: 'POST',
        credentials: "include",
        headers: {
            'content-type': 'application/json',
            'x-csrftoken': csrfToken,
        },
        body: JSON.stringify(postBody),
    };
    let ret = null;
    await fetch('https://leetcode.com/graphql', param).then(response => response.json()).then(data => {
        ret = data.data.problemsetQuestionList.questions;
    });
    return ret;
};

let saveFile = function(fileName, fileContent) {
    let bb = new Blob([fileContent ], { type: 'text/plain' });
    let a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(bb);
    a.click();
};

let main = async function() {
    let csrfToken = getCSRFToken(document.cookie.split(';'));
    if (csrfToken.length <= 0) throw 'csrfToken is empty';
    let allProblems = [], batchSize = 100, batchQuestions = null;

    do {
        batchQuestions = await getQuestions(csrfToken, allProblems.length, batchSize);
        allProblems = allProblems.concat(batchQuestions);
        await new Promise(r => setTimeout(r, 2000));
        console.log('allProblems count:' + allProblems.length);
    } while (batchQuestions.length === batchSize);

    let fileName = 'leetcode_all' + allProblems.length + '_' + (new Date().toISOString().split('T')[0]) + '.json'
    let fileContent = JSON.stringify(allProblems); 
    saveFile(fileName, fileContent);
};

//main();

// running in Node.js
/**
 * @param {*} problem 
 * @param {*} filter: {likesAtLeast:100, ratioAtLeast:10, status:"ac"|"notac"|null, topic:"Array"|"Linked List"|"Hash Table"} 
 * @returns true means this problem is what we want, false otherwise
 */
let passCheck = function(problem, filter) {
    if ((filter.likesAtLeast !== undefined && problem.likes < filter.likesAtLeast) || 
        (filter.ratioAtLeast !== undefined && problem.likes/problem.dislikes < filter.ratioAtLeast) ||
        (filter.status !== undefined && problem.status !== filter.status)) {
            return false;
    }
    
    let matchTopic = (filter.topic === undefined);
    for (let topic of problem.topicTags) {
        if (topic.name === filter.topic) {
            matchTopic = true;
            break;
        }
    }

    return matchTopic;
};

const fs = require('fs');

let main2 = function(problemJsonFilePath, filter) {
    let ret = [];
    
    try {
        let data = fs.readFileSync(problemJsonFilePath, 'utf8');
        let problems = JSON.parse(data);
        problems.forEach(p => {
            if (passCheck(p, filter)) {
                console.log('here');
                ret.push({frontendQuestionId: p.frontendQuestionId, title: p.title, likes: p.likes, ratio: p.likes/p.dislikes});
                console.log('ret.length:'+ret.length);
            }
        });
    }
    catch (err) {
        console.log('err:'+err);
    }
    return ret;
};

let problemJsonFilePath = '/mnt/c/Users/leca/Downloads/leetcode_all2183_2022-02-22.json';
let filter = {
    likesAtLeast: 2000,
    ratioAtLeast: 10,
    status: null,
};
let ret = main2(problemJsonFilePath, filter);
ret.sort((a,b) => a.likes - b.likes);
console.log(ret);