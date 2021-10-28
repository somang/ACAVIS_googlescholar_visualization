//color scales.
var category10 = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
var category20 = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
var category20b = ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
var category20c = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

// From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
var stopWords = /^([0-9]*|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    punctuation = /[!"'&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(using|future|hci|@|https?:)/



var tags;
var dataset;
var oc;

$(function() {
    // Make the DIV element draggable:
    dragElement(document.getElementById("infobox"));

    // $(document).on('mousemove', function(e){
    //   $('#infobox').css({
    //      left:  e.pageX
    //   });
    // });














    $.get('data.csv', function(data) {
        ds = $.csv.toObjects(data);
        oc = {};
        // oc = {Year: [Paper, Word, MaxCite]}
        for (var i = 0; i < ds.length; i++) {
            oc[ds[i].Year] === undefined ?
                oc[ds[i].Year] = { Papers: [ds[i]], Words: {}, MaxCite: 0 } :
                oc[ds[i].Year].Papers.push(ds[i]);
        }
        console.log(oc);

        // sort the array. 
        numbers = Object.keys(oc).sort(function(a, b) { return a - b; });
        // pick up the first number.
        firstYear = numbers.slice(0, 1);

        wc = {}; //wordcollection

        // Put Words in each years
        for (key in oc) {
            for (var j = 0; j < oc[key].Papers.length; j++) { // For Each Paper
                parseText(oc[key].Papers[j].Title); // Parse Text, omit stopwords etc
                var ta = [];
                for (keywords in tags) {
                    ta.push(keywords);
                }
                if (parseInt(oc[key].Papers[j].Cites) > parseInt(oc[key].MaxCite)) {
                    oc[key].MaxCite = oc[key].Papers[j].Cites;
                }
                for (var k = 0; k < ta.length; k++) { // For every words 
                    wc[ta[k]] === undefined ?
                        wc[ta[k]] = { Origin: [oc[key].Papers[j]] } :
                        wc[ta[k]].Origin.push(oc[key].Papers[j]);

                    oc[key].Words[ta[k]] === undefined ?
                        oc[key].Words[ta[k]] = { Count: 1, Origin: [], Cites: oc[key].Papers[j].Cites } :
                        oc[key].Words[ta[k]].Count = oc[key].Words[ta[k]].Count + 1
                    if (oc[key].Words[ta[k]].Cites < oc[key].Papers[j].Cites) {
                        oc[key].Words[ta[k]].Cites = oc[key].Papers[j].Cites
                    }
                    oc[key].Words[ta[k]].Origin.push(oc[key].Papers[j].Title);
                }
            }
        }
        var bar;
        var index = 0;
        for (years in oc) { //Draw Each bars
            if (years > firstYear) {
                bar = [];
                for (keywords in oc[years].Words) {
                    var wordelement = [];
                    wordelement.push(keywords);
                    wordelement.push(oc[years].Words[keywords].Count); //oc[years].Words[keywords].Cites);
                    bar.push(wordelement);
                }
                index += 1;
                console.log(years, index);
                var $thisBar = $('<canvas id="year' + years + '" width="50" height="' + Math.log(oc[years].MaxCite) * 100 + '"></canvas>');
                $('#timeline').append($thisBar);
                $thisBar.css({
                    "position": "absolute",
                    "left": (60 * index) + "px",
                    "bottom": "100px"
                });

                var $Barlabel = $('<div align="center" id="label' + years + '"> ' + years + '</div>');
                $('#timeline').append($Barlabel);
                $Barlabel.css({
                    "position": "absolute",
                    "left": (60 * index) + 6 + "px",
                    "bottom": "50px"
                });

                var thisBarBG = $thisBar[0].getContext("2d").createLinearGradient(0, 0, 0, 800);
                thisBarBG.addColorStop(0.5, "white");
                thisBarBG.addColorStop(1, "#FAF9F6");

                WordCloud($thisBar[0], {
                    list: bar,
                    gridSize: 1,
                    color: function() {
                        i = Math.floor((Math.random() * 20) + 1);
                        return category20[i];
                    }, //'random-light'
                    backgroundColor: thisBarBG,
                    fontFamily: 'Helvetica, sans-serif',
                    //fontWeight: 500, //'bold',
                    click: function(item) {
                        var t = "";
                        // console.log(wc[item[0]].Origin[0]);
                        for (i = 0; i < wc[item[0]].Origin.length; i++) {
                            t = t + "<p>Authors : " + wc[item[0]].Origin[i]["Authors"] + "</p>" +
                                "<p>Title : " + wc[item[0]].Origin[i]["Title"] + "</p>" +
                                "<p>Year : " + wc[item[0]].Origin[i]["Year"] + "</p>" +
                                "<p>Cites : " + wc[item[0]].Origin[i]["Cites"] + "</p><hr>";
                        }
                        $('#infobox').html(t);
                    },
                    weightFactor: 10,
                    origin: [($thisBar.width() / 2), ($thisBar.height() * 1.1)],
                    // origin: [($thisBar.width() / 2), ($thisBar.height() / 2)],
                    rotateRatio: 0,
                    shape: 'square',
                    ellipticity: 1
                });

                // sleeps until it stops.
                var wordcloudstop = false;
                var wordcloudabort = false;
            }; // end if
        }; // end for loop
    }, 'text'); // end csv data load

    // $('#timeline')

}); // end $(function)




function parseText(text) {
    tags = {};
    var cases = {};
    text.split(wordSeparators).forEach(function(word) {
        word = word.toLowerCase();
        if (discard.test(word)) return;
        word = word.replace(punctuation, "");
        word = word.replace(discard, "");
        if (stopWords.test(word)) return;
        word = word.substr(0, 30); // Maximum length for one word is 30.
        cases[word.toLowerCase()] = word;
        tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
    });
}



function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  // move the DIV from anywhere inside the DIV:
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}