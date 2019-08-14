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

function main(groupID, region) {
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
