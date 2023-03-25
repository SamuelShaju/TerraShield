
var testdata;
var prediction;


// Listen for messages from content scripts or other extension pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Check if the message contains a greeting
    if (request.threshold) {
        // Send a response to the content script or extension page
        sendResponse({ message: window.localStorage.getItem("threshold") });

        err.innerHTML = "Current Page: " + request.threshold ;
    }
});

  // Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Check if the message contains a greeting
    if (request.greeting) {
      // Send a response to the extension
      sendResponse({ message: prediction, pos: pos, neg: neg });
  
      // Log the message to the console
      console.log('Received message:', request.greeting);
    }
});





async function Parentpredict(data){
    // var f = 0;
    // weight = [3.33346292e-01,-1.11200396e-01,-7.77821806e-01,1.11058590e-01,3.89430647e-01,1.99992062e+00,4.44366975e-01,-2.77951957e-01,-6.00531647e-05,3.33200243e-01,2.66644002e+00,6.66735991e-01,5.55496098e-01,5.57022408e-02,2.22225591e-01,-1.66678858e-01];
    // for(var j=0;j<data.length;j++) {
    //   f += data[j] * weight[j];
    // }
    // return f > 0 ? 1 : -1;
    const modelUrl = chrome.extension.getURL('modelParent/model.json');
    const input=tf.tensor2d([data],[1,16]);
    const model = await tf.loadLayersModel(modelUrl);
    const pred =await  model.predict(input);
    return (pred.dataSync());
}

async function Childpredict(data){
    const modelUrl = chrome.extension.getURL('modelChild/model.json');
    const input=tf.tensor2d([data],[1,9]);
    const model = await tf.loadLayersModel(modelUrl);
    const pred = await model.predict(input);
    return (pred.dataSync());

}

function isIPInURL(url){
    var reg =/\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}[\.]{1}\d{1,3}/;
    if(reg.exec(url)==null){
        
        return -1;
    }
    else{
        
        return 1;
    }
}

function isLongURL(url){
    if(url.length<54){
        
        return -1;
    } 
    else if(url.length>=54 && url.length<=75){
        return 0;
    }
    else{
        
        return 1;
    }
}
function isTinyURL(url){
        
    if(url.length>20){
        
        return -1;
    } 
    else{
        
        return 1;
    }
}
function isAlphaNumericURL(url){
    var search ="@";
     
    if(url.match(search)==null){
        
        return -1;
    }
    else{
        
        return 1;
    }
}
function isRedirectingURL(url){
    var reg1 = /^http:/
    var reg2 = /^https:/
    var srch ="//";
     
    if(url.search(srch)==5 && reg1.exec(url)!=null && (url.substring(7)).match(srch)==null){
        
        return -1;
    }
    else if(url.search(srch)==6 && reg2.exec(url)!=null && (url.substring(8)).match(srch)==null){
        
        return -1;
    }
    else{
        
        return 1;
    }
}
function isHypenURL(url){
    var reg = /[a-zA-Z]\//;
    var srch ="-";
     
    if(((url.substring(0,url.search(reg)+1)).match(srch))==null){
        
        return -1;
    }    
    else{
        
        return 1;
    }
}
function isMultiDomainURL(url){
    var reg = /[a-zA-Z]\//;
    var srch ="-";
     
    if((url.substring(0,url.search(reg)+1)).split('.').length < 5){
        
        return -1;
    }    
    else{
        
        return 1;
    }
}
function isFaviconDomainUnidentical(url){
    var reg = /[a-zA-Z]\//;
     
    if(document.querySelectorAll("link[rel*='shortcut icon']").length>0){            
        var faviconurl = document.querySelectorAll("link[rel*='shortcut icon']")[0].href;
        if((url.substring(0,url.search(reg)+1))==(faviconurl.substring(0,faviconurl.search(reg)+1))){
            
            return -1;
        }    
        else{
            
            return 1;
        }
    }
    else{
        
        return -1;
    }
}

function isIllegalHttpsURL(url){
    var srch1 ="//";   
    var srch2 = "https";   
     
    if(((url.substring(url.search(srch1))).match(srch2))==null){
        
        return -1;
    }    
    else{
        
        return 1;
    }
}
function isImgFromDifferentDomain(){
	var totalCount = document.querySelectorAll("img").length
	var identicalCount = getIdenticalDomainCount("img");
	if(((totalCount-identicalCount)/totalCount)<0.22){
        
        return -1;
    } 
	else if((((totalCount-identicalCount)/totalCount)>=0.22) && (((totalCount-identicalCount)/totalCount)<=0.61)){
        return 0;
    } 	
    else{
        
        return 1;
    }
}
function isAnchorFromDifferentDomain(){
	var totalCount = document.querySelectorAll("a").length
	var identicalCount = getIdenticalDomainCount("a");
	if(((totalCount-identicalCount)/totalCount)<0.31){
        
        return -1;
    } 
	else if((((totalCount-identicalCount)/totalCount)>=0.31) && (((totalCount-identicalCount)/totalCount)<=0.67)){
        return 0;
    } 	
    else{
        
        return 1;
    }
}
function isScLnkFromDifferentDomain(){
	var totalCount = document.querySelectorAll("script").length + document.querySelectorAll("link").length
	var identicalCount = getIdenticalDomainCount("script") + getIdenticalDomainCount("link");
	if(((totalCount-identicalCount)/totalCount)<0.17){
        
        return -1;
    } 
	else if((((totalCount-identicalCount)/totalCount)>=0.17) && (((totalCount-identicalCount)/totalCount)<=0.81)){
        return 0;
    } 	
    else{
        
        return 1;
    }
}

function isFormActionInvalid(){
    var totalCount = document.querySelectorAll("form").length
	var identicalCount = getIdenticalDomainCount("form");
	if(document.querySelectorAll('form[action]').length<=0){
	    
        return -1;
	}	
	else if(identicalCount!=totalCount){
        return 0;
    } 	
    else if(document.querySelectorAll('form[action*=""]').length>0){
        
        return 1;
    } 
    else{
        
        return -1;
    } 
}

function isMailToAvailable(){
    if(document.querySelectorAll('a[href^=mailto]').length<=0){
        
        return -1;
    } 	
    else{
        
        return 1;
    }
}

function isStatusBarTampered(){
    if((document.querySelectorAll("a[onmouseover*='window.status']").length<=0) || (document.querySelectorAll("a[onclick*='location.href']").length<=0)){
        
        return -1;
    }
    else{
        
        return 1;
    } 
}

function isIframePresent(){
    if(document.querySelectorAll('iframe').length<=0){
        
        return -1;
    }
    else{
        
        return 1;
    }
}

function getIdenticalDomainCount(tag){    
    var i;
	var identicalCount=0;
	var reg = /[a-zA-Z]\//;    
    
    var mainDomain = url.substring(0,url.search(reg)+1);    
    var nodeList = document.querySelectorAll(tag);
    if(tag=="img" || tag=="script"){
        nodeList.forEach(function(element,index) {        
        i = nodeList[index].src
        if(mainDomain==(i.substring(0,i.search(reg)+1))){
           identicalCount++;
        }   
      });
    }  
    else if(tag=="form"){
        nodeList.forEach(function(element,index) {        
        i = nodeList[index].action
        if(mainDomain==(i.substring(0,i.search(reg)+1))){
           identicalCount++;
        }   
      });
    }  
    else if(tag=="a"){
        nodeList.forEach(function(element,index) {        
        i = nodeList[index].href
        if((mainDomain==(i.substring(0,i.search(reg)+1))) && ((i.substring(0,i.search(reg)+1))!=null) && ((i.substring(0,i.search(reg)+1))!="")){
           identicalCount++;
        }    
      });
    } 
    else{
        nodeList.forEach(function(element,index) {        
        i = nodeList[index].href
        if(mainDomain==(i.substring(0,i.search(reg)+1))){
           identicalCount++;
        }    
      });
    }  
    return identicalCount;
} 

var predictionArray = [];
var url = window.location.href;


// function getPred(){
//     return new Promise((resolve,reject)=> {
//     parenttestdata = [isIPInURL(url),isLongURL(url),isTinyURL(url),isAlphaNumericURL(url),isRedirectingURL(url),isHypenURL(url),isMultiDomainURL(url),isFaviconDomainUnidentical(url),isIllegalHttpsURL(url),isImgFromDifferentDomain(),isAnchorFromDifferentDomain(),isScLnkFromDifferentDomain(),isFormActionInvalid(),isMailToAvailable(),isStatusBarTampered(),isIframePresent()];
//     Parentpredict(parenttestdata).then((predictedValue) => {
//         prediction = predictedValue;
//     })

//     // chrome.extension.sendRequest(prediction);
//     // console.log(url, prediction);


//     var x = document.querySelectorAll("a");
//     // var myarray = [];
 
//     for (var i = 0; i < x.length; i++) {
//     var nametext = x[i].textContent;
//     var cleantext = nametext.replace(/\s+/g, " ").trim();
//     var cleanlink = x[i].href;
//     if(cleanlink==null || cleanlink==""){
//             continue;
//         }
//     //   myarray.push([cleantext, cleanlink]);
//     var childTestData=[isIPInURL(cleanlink),isLongURL(cleanlink),isTinyURL(cleanlink),isAlphaNumericURL(cleanlink),isRedirectingURL(cleanlink),isHypenURL(cleanlink),isMultiDomainURL(cleanlink),isFaviconDomainUnidentical(cleanlink),isIllegalHttpsURL(url)];
//     var obj = {};
//     obj["name"] = cleantext;
//     obj["link"] = cleanlink;
//     Childpredict(childTestData).then((predictedValue) => {
//         obj["prediction"] = predictedValue[0];
//         predictionArray.push(obj);
//     })
//     }
// })


// }


// async function run(){
//     await getPred().then((res)=>
// {    console.log(predictionArray);
//     console.log(predictionArray[150]);
// });
// }
// run()

let names = [];
let links = [];
let preds = [];


function getPred(){
    parenttestdata = [isIPInURL(url),isLongURL(url),isTinyURL(url),isAlphaNumericURL(url),isRedirectingURL(url),isHypenURL(url),isMultiDomainURL(url),isFaviconDomainUnidentical(url),isIllegalHttpsURL(url),isImgFromDifferentDomain(),isAnchorFromDifferentDomain(),isScLnkFromDifferentDomain(),isFormActionInvalid(),isMailToAvailable(),isStatusBarTampered(),isIframePresent()];
    Parentpredict(parenttestdata).then((predictedValue) => {
        prediction = predictedValue[0];
        console.log(prediction);
    })

    // chrome.extension.sendRequest(prediction);
    // console.log(url, prediction);


    var x = document.querySelectorAll("a");
    // var myarray = [];
    var childPromises = [];
    var predictionArray = [];
    for (var i = 0; i < x.length; i++) {
        var nametext = x[i].textContent;
        var cleantext = nametext.replace(/\s+/g, " ").trim();
        var cleanlink = x[i].href;
        if(cleanlink==null || cleanlink==""){
            continue;
        }
        //   myarray.push([cleantext, cleanlink]);
        var childTestData=[isIPInURL(cleanlink),isLongURL(cleanlink),isTinyURL(cleanlink),isAlphaNumericURL(cleanlink),isRedirectingURL(cleanlink),isHypenURL(cleanlink),isMultiDomainURL(cleanlink),isFaviconDomainUnidentical(cleanlink),isIllegalHttpsURL(url)];
        // var obj = {};
        // obj["name"] = cleantext;
        // obj["link"] = cleanlink;
        // console.log(cleanlink);

        // var obj = {
        //     name: cleantext,
        //     link: cleanlink,
        // };
        names.push(cleantext);
        links.push(cleanlink);
        var childPromise = Childpredict(childTestData).then((predictedValue) => {
            // obj["prediction"] = predictedValue[0];
            // obj["prediction"] = predictedValue[0];
            // let copy = JSON.parse(JSON.stringify(obj));
            preds.push(predictedValue[0]);
            // predictionArray.push(copy);
        });
        childPromises.push(childPromise);
    }
    return Promise.all(childPromises).then(() => {
        return predictionArray;
    });
}

async function run(){
    const predictionArray = await getPred();
    // console.log(names);
    // console.log(links);
    // console.log(preds);


    highlightLink();
result={};
    links.forEach((link, i) => result[link] = preds[i]);
    console.log(result);
}

run();

function getGreenToRedColor(value) {
    // Calculate the green and red values based on the input value
    var green = Math.round(255 * value);
    var red = Math.round(255 * (1 - value));
    
    // Return the RGB color code
    return "rgba(" + green + "," + red + ",0, 0.2)";
  }
  
  var pos = 0;
  var neg = 0;
function highlightLink() {
    var x = document.querySelectorAll("a");

    var threshold = prompt("Enter the threshold percentage value")/100;

    for(var i = 0; i<x.length;i++)
    {
        var index = links.indexOf(x[i].href);
        // x[i].setAttribute("style", "background-color:"+getGreenToRedColor(preds[index]));
        // x[i].setAttribute("title", "Probability:"+(preds[index]*100).toFixed(2));
        
        if(preds[index] >threshold)
        {
            x[i].setAttribute("style", "background-color:rgba(255,0,0,0.2)");
            x[i].setAttribute("title", "Probability:"+(preds[index]*100).toFixed(2));
            neg += 1;
        }
        else
        {
            x[i].setAttribute("style", "background-color:rgba(0,255,0,0.2)");
            x[i].setAttribute("title", "Probability:"+(preds[index]*100).toFixed(2));
            pos += 1;
        }
    }

    console.log("Positive Links: "+pos);
    console.log("Negative Links: "+neg);

    

    // x.forEach(function(tag){
    //     tag.addEventListener("mouseover", function(){
    //         const newSib = document.createElement("sup");
    //         newSib.classList.add('child');
    //         newSib.textContent = "<a href='https://www.google.com'>Report</a>"
    //     })
    // })

}

// tdata = [isIPInURL(),isLongURL(),isTinyURL(),isAlphaNumericURL(),isRedirectingURL(),isHypenURL(),isMultiDomainURL(),isFaviconDomainUnidentical(),isIllegalHttpsURL(),isImgFromDifferentDomain(),isAnchorFromDifferentDomain(),isScLnkFromDifferentDomain(),isFormActionInvalid(),isMailToAvailable(),isStatusBarTampered(),isIframePresent()];
// Parentprediction = predict(testdata);
// //chrome.extension.sendRequest(prediction);
// console.log(url,Parentprediction);
// console.log(predictionArray);