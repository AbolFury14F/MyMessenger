// اتصال به سرور چت (چون سرور روی کامپیوتر خودت اجرا میشه، localhost استفاده میکنیم)
const socket = new WebSocket('ws://localhost:8765');

// وقتی پیامی از سرور می‌رسد، آن را نمایش بده
socket.onmessage = function(event) {
    var messagesBox = document.getElementById("messages");
    var newMessage = document.createElement("div");
    newMessage.className = "message";
    newMessage.textContent = event.data;
    messagesBox.appendChild(newMessage);
};

// تابع ارسال پیام
function sendMessage() {
    var input = document.getElementById("messageInput");
    var text = input.value;
    
    if (text === "") return;
    
    // پیام را به سرور بفرست
    socket.send(text);
    
    // پیام خودت را هم در صفحه نمایش بده (به رنگ سبز)
    var messagesBox = document.getElementById("messages");
    var myMessage = document.createElement("div");
    myMessage.className = "message";
    myMessage.style.backgroundColor = "#dcf8c6";
    myMessage.textContent = text;
    messagesBox.appendChild(myMessage);
    
    // خالی کردن کادر تایپ
    input.value = "";
}