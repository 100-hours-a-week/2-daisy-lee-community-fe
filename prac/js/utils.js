document.addEventListener("DOMContentLoaded", () => {
    // 다른 HTML 파일을 불러와 삽입
    fetch("/prac/html/top.html")
      .then((response) => {
        if (!response.ok) throw new Error("HTTP error " + response.status);
        return response.text();
      })
      .then((html) => {
        document.getElementById("header").innerHTML = html;
      })
});