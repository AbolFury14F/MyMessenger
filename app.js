// اتصال امن به سرور
const socket = new WebSocket('wss://mymessenger-09ud.onrender.com');
let myUsername = "";

// تابع ورود
function login() {
    let input = document.getElementById("usernameInput").value.trim();
    if (input === "") {
        alert("لطفاً نام خود را وارد کنید.");
        return;
    }
    myUsername = input;
    document.getElementById("loginPopup").style.display = "none"; // مخفی کردن صفحه ورود
    document.querySelector(".header").innerText = "چت - " + myUsername; // تغییر هدر
}

// دریافت پیام از سرور
socket.onmessage = function(event) {
    try {
        let data = JSON.parse(event.data); // تبدیل رشته JSON به آبجکت
        var messagesBox = document.getElementById("messages");
        var newMessage = document.createElement("div");
        newMessage.className = "message received";
        
        // نمایش اسم فرستنده بالای پیام
        let nameTag = document.createElement("div");
        nameTag.className = "sender-name";
        nameTag.innerText = data.user;
        
        newMessage.appendChild(nameTag);
        newMessage.appendChild(document.createTextNode(data.text));
        
        messagesBox.appendChild(newMessage);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    } catch (e) {
        console.log("خطا در دریافت پیام:", e);
    }
};

// ارسال پیام
function sendMessage() {
    let input = document.getElementById("messageInput");
    let text = input.value.trim();
    
    if (text === "") return;
    
    // ساخت آبجکت پیام
    let messageData = {
        user: myUsername,
        text: text
    };
    
    socket.send(JSON.stringify(messageData)); // ارسال به صورت JSON
    
    // نمایش پیام خودت روی صفحه
    var messagesBox = document.getElementById("messages");
    var myMessage = document.createElement("div");
    myMessage.className = "message sent";
    
    let nameTag = document.createElement("div");
    nameTag.className = "sender-name";
    nameTag.innerText = "من (" + myUsername + ")";
    
    myMessage.appendChild(nameTag);
    myMessage.appendChild(document.createTextNode(text));
    
    messagesBox.appendChild(myMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    input.value = "";
}
