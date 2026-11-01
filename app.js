const socket = new WebSocket('wss://mymessenger-09ud.onrender.com');
let myUsername = localStorage.getItem("myUsername") || "";
let myProfilePic = localStorage.getItem("myProfilePic") || "";
let targetUsername = "";
let currentMode = "public";

window.onload = function() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
    if (myUsername !== "") {
        document.getElementById("loginPopup").style.display = "none";
        document.getElementById("headerTitle").innerText = "چت عمومی";
        updateHeaderProfilePic();
        // 📌 ارسال درخواست تاریخچه به سرور
        socket.send(JSON.stringify({ type: "init", from: myUsername }));
    } else {
        document.getElementById("loginPopup").style.display = "flex";
    }
};

function updateHeaderProfilePic() {
    let headerPic = document.getElementById("headerProfilePic");
    if (myProfilePic) {
        headerPic.src = myProfilePic;
        headerPic.style.display = "block";
    } else {
        headerPic.style.display = "none";
    }
}

function login() {
    let input = document.getElementById("usernameInput").value.trim();
    if (input === "") { alert("اسمت رو وارد کن!"); return; }
    myUsername = input;
    localStorage.setItem("myUsername", myUsername);
    document.getElementById("loginPopup").style.display = "none";
    document.getElementById("headerTitle").innerText = "چت عمومی";
    updateHeaderProfilePic();
    // 📌 ارسال درخواست تاریخچه به سرور
    socket.send(JSON.stringify({ type: "init", from: myUsername }));
}

function logout() {
    localStorage.removeItem("myUsername");
    localStorage.removeItem("myProfilePic");
    myUsername = "";
    myProfilePic = "";
    closeSettings();
    document.getElementById("loginPopup").style.display = "flex";
    document.getElementById("messages").innerHTML = "";
    document.getElementById("headerProfilePic").style.display = "none";
}

function openSettings() {
    if (myUsername === "") return;
    document.getElementById("newUsernameInput").value = myUsername;
    document.getElementById("settingsPopup").style.display = "flex";
}

function closeSettings() {
    document.getElementById("settingsPopup").style.display = "none";
}

function changeUsername() {
    let newName = document.getElementById("newUsernameInput").value.trim();
    if (newName === "") { alert("نام جدید رو وارد کن!"); return; }
    myUsername = newName;
    localStorage.setItem("myUsername", myUsername);
    alert("نام شما با موفقیت تغییر کرد.");
    closeSettings();
}

function saveProfilePic() {
    let fileInput = document.getElementById("profilePicFile");
    let file = fileInput.files[0];
    
    if (!file) {
        alert("لطفاً ابتدا یک عکس انتخاب کنید.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(e) {
        myProfilePic = e.target.result;
        localStorage.setItem("myProfilePic", myProfilePic);
        updateHeaderProfilePic();
        alert("عکس پروفایل با موفقیت ذخیره شد!");
    };
    reader.readAsDataURL(file);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function clearChat() {
    document.getElementById("messages").innerHTML = "";
    closeSettings();
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

function toggleEmoji() {
    let picker = document.getElementById("emojiPicker");
    picker.style.display = picker.style.display === "grid" ? "none" : "grid";
}

function addEmoji(emoji) {
    let input = document.getElementById("messageInput");
    input.value += emoji;
    document.getElementById("emojiPicker").style.display = "none"; 
}

// 📌 دریافت پیام‌ها از سرور
socket.onmessage = function(event) {
    try {
        let data = JSON.parse(event.data);
        if (data.type === "init") return;
        if (data.from === myUsername && data.type !== "tick") return; 

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
    displayMessage(myUsername, text, true);
    
    input.value = "";
}
