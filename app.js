const socket = new WebSocket('wss://mymessenger-09ud.onrender.com');

let myUsername = "";
let targetUsername = "";
let currentMode = "public";

function login() {
    let input = document.getElementById("usernameInput").value.trim();
    if (input === "") { alert("اسمت رو وارد کن!"); return; }
    myUsername = input;
    document.getElementById("loginPopup").style.display = "none";
    document.getElementById("headerTitle").innerText = "چت عمومی";
}

function switchTab(mode) {
    currentMode = mode;
    document.getElementById("messages").innerHTML = ""; 
    
    if (mode === "public") {
        document.getElementById("tab-public").classList.add("active");
        document.getElementById("tab-private").classList.remove("active");
        document.getElementById("targetBar").style.display = "none";
        document.getElementById("headerTitle").innerText = "چت عمومی";
    } else {
        document.getElementById("tab-public").classList.remove("active");
        document.getElementById("tab-private").classList.add("active");
        document.getElementById("targetBar").style.display = "flex";
        document.getElementById("headerTitle").innerText = targetUsername ? "چت با " + targetUsername : "چت خصوصی";
    }
}

function setTarget() {
    let target = document.getElementById("targetUserInput").value.trim();
    if (target === "") { alert("اسم مخاطب رو وارد کن!"); return; }
    targetUsername = target;
    document.getElementById("headerTitle").innerText = "چت با " + targetUsername;
    document.getElementById("messages").innerHTML = "";
}

socket.onmessage = function(event) {
    try {
        let data = JSON.parse(event.data);
        
        // 🔴 باگ‌گیری: اگر پیام از طرف خودم بود، اصلاً نمایش نده (چون خودم قبلاً نشون دادم)
        if (data.from === myUsername) return; 

        if (currentMode === "public" && data.type === "public") {
            displayMessage(data.from, data.text, false);
        } else if (currentMode === "private" && data.type === "private") {
            if ((data.from === myUsername && data.to === targetUsername) || 
                (data.from === targetUsername && data.to === myUsername)) {
                displayMessage(data.from, data.text, false);
            }
        }
    } catch (e) { console.log("خطا:", e); }
};

function displayMessage(sender, text, isMe) {
    var messagesBox = document.getElementById("messages");
    var newMessage = document.createElement("div");
    newMessage.className = isMe ? "message sent" : "message received";
    
    let nameTag = document.createElement("div");
    nameTag.className = "sender-name";
    nameTag.innerText = sender;
    
    newMessage.appendChild(nameTag);
    newMessage.appendChild(document.createTextNode(text));
    
    messagesBox.appendChild(newMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function sendMessage() {
    if (myUsername === "") { alert("اول اسمت رو وارد کن!"); return; }
    
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    if (text === "") return;
    
    let messageData = { from: myUsername, text: text };
    
    if (currentMode === "public") {
        messageData.type = "public";
    } else {
        if (targetUsername === "") { alert("اول اسم مخاطب رو تنظیم کن!"); return; }
        messageData.type = "private";
        messageData.to = targetUsername;
    }
    
    socket.send(JSON.stringify(messageData));
    
    // نمایش پیام خودم روی صفحه (فقط یک بار)
    displayMessage(myUsername, text, true);
    
    input.value = "";
}
