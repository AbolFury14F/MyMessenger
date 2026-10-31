// اتصال امن به سرور
const socket = new WebSocket('wss://mymessenger-09ud.onrender.com');

socket.onmessage = function(event) {
    var messagesBox = document.getElementById("messages");
    var newMessage = document.createElement("div");
    newMessage.className = "message received";
    newMessage.textContent = event.data;
    messagesBox.appendChild(newMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight; // اسکرول خودکار به پایین
};

function sendMessage() {
    var input = document.getElementById("messageInput");
    var text = input.value;
    
    if (text.trim() === "") return;
    
    socket.send(text);
    
    var messagesBox = document.getElementById("messages");
    var myMessage = document.createElement("div");
    myMessage.className = "message sent";
    myMessage.textContent = text;
    messagesBox.appendChild(myMessage);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    
    input.value = "";
}
