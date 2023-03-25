// Listen for messages from content scripts or other extension pages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// Check if the message contains a greeting
if (request.pred) {
    // Send a response to the content script or extension page
    sendResponse({ message:"message" });

    // Log the message to the console
    // console.log('Received message:', request.pred);
    var err = document.getElementById("cs_err");
    alert((request.pred*100).toFixed(2));
    err.innerHTML = "Current Page: " + request.pred ;
}
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // Send the message to the first active tab
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'Hello from the extension' }, function(response) {
        console.log('Response from tab:', response);


        var err = document.getElementById("cs_err");
        err.innerHTML = "Current Page: " + (response['message'] *100).toFixed(2);

        
        var pos = document.getElementById("pos_link");
        pos.innerHTML = "No. of Positive links: " + response['pos']

        var neg = document.getElementById("neg_link");
        neg.innerHTML = "No. of Negative links: " + response['neg']

    });
});

// Make an event listener for the button and save the threshold in session storage
document.getElementById("threshold").addEventListener("click", function(){
    // get the value of the threshold
    var threshold_value = document.getElementById("threshold_inp").value;
    console.log(threshold_value);
    window.localStorage.setItem("threshold", threshold_value);
    document.cookie = "threshold=" + threshold_value;
    // Set the localStorage data
    // localStorage.setItem('myKey', 'myValue');

    // Send a message to the other tab
    chrome.runtime.sendMessage({ threshold: window.localStorage.getItem("threshold") }, function(response) {
    console.log('Message sent to other tab');
});

});

// Make event listener for the button and print session storage
document.getElementById("print_btn").addEventListener("click", function(){
// Retrieve a value from session storage

// chrome.storage.local.get(['threshold'], function(result) {
//     console.log('Value retrieved from session storage:', result.key);
    // put the value in the print div
    document.getElementById("print").innerHTML = window.localStorage.getItem("threshold");

//   });
  
});