/*
1. Axes and labels
2. Infobox when hovered on tags
3. 


+ scrollable, zoomable, colors...
*/


//color scales.
var category10 = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
var category20 = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
var category20b = ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];
var category20c = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

// From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
var stopWords = /^(i|b|c|d|e|f|g|h|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    punctuation = /[!"'&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(@|https?:)/,
    htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
    matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;

var tags;
var dataset;
var oc;

$(document).ready(function(){
  $.get('data.csv', function(data) {
    ds = $.csv.toObjects(data);
    oc = {};
    for (var i = 0 ; i < ds.length; i++){
        oc[ds[i].Year] === undefined ?
        oc[ds[i].Year] = {Papers:[ds[i]], Words: {}, MaxCite: 0} :
        oc[ds[i].Year].Papers.push(ds[i]);
    }
    for (key in oc){
      for (var j = 0 ; j < oc[key].Papers.length; j++){
        parseText(oc[key].Papers[j].Title);
        var ta = [];
        for (keywords in tags){ta.push(keywords);}

        if (parseInt(oc[key].Papers[j].Cites) > parseInt(oc[key].MaxCite)){
          oc[key].MaxCite = oc[key].Papers[j].Cites;
        }

        for (var k = 0; k < ta.length; k++){
          oc[key].Words[ta[k]] === undefined ?
          oc[key].Words[ta[k]] = {Count:1, Origin:[], Cites: oc[key].Papers[j].Cites} :
          oc[key].Words[ta[k]].Count = oc[key].Words[ta[k]].Count + 1
          if (oc[key].Words[ta[k]].Cites < oc[key].Papers[j].Cites){
            oc[key].Words[ta[k]].Cites = oc[key].Papers[j].Cites}
          oc[key].Words[ta[k]].Origin.push(oc[key].Papers[j].Title);
        }
      }
    } 
    var bar;
    for (years in oc){
      //var years = 2012;
      if (years > 1982){
      bar = [];
      for (keywords in oc[years].Words){
        var wordelement = [];
        wordelement.push(keywords);
        wordelement.push(oc[years].Words[keywords].Count);//oc[years].Words[keywords].Cites);
        bar.push(wordelement);
      }
      var index = years - 1982;

      var $thisBar = $('<canvas id="year' + years + '" width="50" height="' + Math.log(oc[years].MaxCite) * 100 +'"></canvas>');
      $('body').append($thisBar);
      $thisBar.css({
        "position":"absolute",
        "left": (60 * index) + "px",
        "bottom":"100px"
      });

      var $Barlabel = $('<div align="center" id="label' + years + '"> ' + years + '</div>');
      $('body').append($Barlabel);
      $Barlabel.css({
        "position":"absolute",
        "left": (60 * index) + 6 + "px",
        "bottom":"50px"
      });

    
      var thisBarBG = $thisBar[0].getContext("2d").createLinearGradient(0,0,0,800);
      thisBarBG.addColorStop(0.5,"white");
      thisBarBG.addColorStop(1,"#fdd0a2");

      
      WordCloud( $thisBar[0], {
        list : bar,
        gridSize: 5,
        color: function(){
          i = Math.floor((Math.random()*20)+1);
          return category20[i];
        }, //'random-light'
        backgroundColor: thisBarBG,
        fontFamily: 'Helvetica, sans-serif',
        //fontWeight: 500, //'bold',
        hover: function(item) {
          $('.infobox').text(item[0]);
        },
        weightFactor: 10,
        origin: [($thisBar.width() / 2), ($thisBar.height() * 0)],
        rotateRatio:0,
        shape: 'diamond'
      });
      
      // sleeps until it stops.
      var wordcloudstop = false;
      var wordcloudabort = false;

      /*
      $thisBar[0].addEventListener('wordcloudstop', wordcloud_flag);
      $thisBar[0].addEventListener('wordcloudabort', wordcloud_flag);
      function wordcloud_flag(e){
        if(e.type = 'wordcloudstop') wordcloudstop = true;
        else if (e.type = 'wordcloudabort') wordcloudstop = true;
        //else case throw exception
      }
      //sleep checks (wordcloudstop || wordcloudabort)
      */
    };
  };

  // .yaxis {
  //   position: absolute;
  //   bottom: 50px;
  //   left: 30px;
  //   width: 50px; 
  //   height: 1250px;
  //   border-right: solid #CCCCCC;
  // }
  // .xaxis {
  //   position: absolute;
  //   left:50px; 
  //   width: 1900px; 
  //   bottom: 80px;
  //   border-top: solid #CCCCCC;
  // }

  }, 'text');
});




function parseText(text) {
  tags = {};
  var cases = {};
  text.split(wordSeparators).forEach(function(word) {
    if (discard.test(word)) return;
    word = word.replace(punctuation, "");
    if (stopWords.test(word.toLowerCase())) return;
    word = word.substr(0, 30); // Maximum length for one word is 30.
    cases[word.toLowerCase()] = word;
    tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
  });
}