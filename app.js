// اتصال امن به سرور
const socket = new WebSocket('wss://mymessenger-09ud.onrender.com');

let myUsername = "";
let targetUsername = ""; // نام کسی که می‌خوایم باهاش چت کنیم

function login() {
    let input = document.getElementById("usernameInput").value.trim();
    if (input === "") { alert("اسمت رو وارد کن!"); return; }
    myUsername = input;
    document.getElementById("loginPopup").style.display = "none";
    document.getElementById("headerTitle").innerText = "چت - " + myUsername;
}

function setTarget() {
    let target = document.getElementById("targetUserInput").value.trim();
    if (target === "") { alert("اسم مخاطب رو وارد کن!"); return; }
    targetUsername = target;
    document.getElementById("headerTitle").innerText = "چت با " + targetUsername;
    document.getElementById("messages").innerHTML = ""; // پاک کردن پیام‌های قبلی
}

// دریافت پیام از سرور
socket.onmessage = function(event) {
    try {
        let data = JSON.parse(event.data);
        // فقط پیام‌هایی رو نشون بده که مربوط به من و مخاطبمه
        if ((data.from === myUsername && data.to === targetUsername) || 
            (data.from === targetUsername && data.to === myUsername)) {
            
            var messagesBox = document.getElementById("messages");
            var newMessage = document.createElement("div");
            
            // اگه پیام از طرف خودمه، سبز. وگرنه سفید.
            if (data.from === myUsername) {
                newMessage.className = "message sent";
            } else {
                newMessage.className = "message received";
            }
            
            let nameTag = document.createElement("div");
            nameTag.className = "sender-name";
            nameTag.innerText = data.from;
            
            newMessage.appendChild(nameTag);
            newMessage.appendChild(document.createTextNode(data.text));
            
            messagesBox.appendChild(newMessage);
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }
    } catch (e) { console.log("خطا در دریافت:", e); }
};

// ارسال پیام
function sendMessage() {
    if (myUsername === "" || targetUsername === "") {
        alert("اول اسم خودت و مخاطبت رو وارد کن!");
        return;
    }

    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    if (text === "") return;
    
    let messageData = {
        from: myUsername,
        to: targetUsername,
        text: text
    };
    
    socket.send(JSON.stringify(messageData));
    
    // نمایش پیام خودم روی صفحه
    var messagesBox = document.getElementById("messages");
    var myMessage = document.createElement("div");
    myMessage.className = "message sent";
    
    let nameTag = document.createElement("div");
    nameTag.className = "sender-name";
    nameTag.innerText = "من";
    
    myMessage.appendChild(nameTag);
    myMessage.appendChild(document.createTextNode(text));
    
    messagesBox.appendChild(myMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    input.value = "";
}
