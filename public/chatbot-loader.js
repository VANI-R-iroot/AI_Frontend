(function() {
    var iframe = document.createElement('iframe');
    iframe.src = "https://amd.ai.in/chatbot-widget"; // 🟰 chatbot route
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "350px";
    iframe.style.height = "500px";
    iframe.style.zIndex = "9999";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
  })();
  