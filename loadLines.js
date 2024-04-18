var data = [];
let windowsize = 8;
let segmentor = '  ';

String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};

function loadMetadata(){
    fetch("metadata.csv")
    .then((response) => response.text())
    .then(_data => {
        let templist = _data.split("\n");
        let header = templist.shift().split(",");
        for (let i = 0; i < templist.length; ++i) {
            if (templist[i] == '') {
                continue;
            }
            let temp = templist[i].split(",");
            let entry = {};
            for (let j = 0; j < header.length; ++j) {
                entry[header[j]] = temp[j];
            }
            data.push(entry);
            fetch("text/"+entry.file+".txt").then((response) => {
                if (!response.ok) {
                    throw new Error("Not 2xx response", {cause: response});
                } else {
                    return response.text()
                }
            })
            .catch(error => {
                console.error("File Fetch Error: ", error);
            })
            .then(_data => {
                entry.segments = _data.split(segmentor);
            }).catch(error => {
                console.error("Segment Split Error: ", error);
            });
        }
    }).catch(error => {
        console.error("Error: ", error);
    });
}

function addSearchForm() {
    document.getElementById('searchForm').addEventListener("submit", (e) => {
        e.preventDefault();
    
        let keyword = document.getElementById('searchText').value;
        let word = keyword.trim();
        let source = document.querySelector('input[name="source"]:checked').value;
        let style = document.querySelector('input[name="style"]:checked').value;
        let topic = document.querySelector('input[name="topic"]:checked').value;
        
        let resultTable = document.getElementById('resultTable');
        let resultCount = 0;
    
        resultTable.innerHTML = "";
        data.forEach(entry => {
            if (entry.segments) {
                for (let i = 0; i < entry.segments.length; ++i) {
                    if (entry.segments[i].indexOf(word) > -1) {
                        if ((source == "all" || entry.source.indexOf(source) > -1) && (style == "all" || entry.style.indexOf(style) > -1) && (topic == "all" || entry.topic.indexOf(topic) > -1)) {
                                resultTable.innerHTML += generateLine(word,entry,i);
                                resultCount++;
                        }
                    }
                }
            }
        });
        let resultCountElement = document.createElement("p");
        resultCountElement.innerHTML = "共"+resultCount+"項結果";
        resultTable.appendChild(resultCountElement);    
    });
}

function generateLine(word,entry,loc) {
    return "<tr><td class='annotation'>"
        + "<a href='text/" + entry.file + ".txt'>" + entry.file + "</a><br>第"  + (loc+1) + "欄" + "<br/>" + entry.source + " " + entry.style + "<br/>" + entry.topic
        + "</td><td class='pre'>" 
        + entry.segments.slice(loc-windowsize,loc).join(" ") + "</td><td class='word'>"
        + entry.segments[loc].replaceAll(word,"<span style='color: blue'>"
        +word
        +"</span>").replaceAll("(","<span class='tags'>(").replaceAll(")",")</span>").replaceAll("[","<span class='tags2'>[").replaceAll("]","]</span>")
        + "</td><td class='post'>" + entry.segments.slice(loc+1,loc+windowsize).join(" ") + "</td></tr>";
}

// Do this after page is loaded
document.addEventListener("DOMContentLoaded", function() {
    loadMetadata();
    addSearchForm();
});
