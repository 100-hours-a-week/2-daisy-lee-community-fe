document.addEventListener("DOMContentLoaded", () => {
  fetch("/prac/html/top.html")
      .then((response) => {
          if (!response.ok) throw new Error("HTTP error " + response.status);
          return response.text();
      })
      .then((html) => {
          document.getElementById("header").innerHTML = html;
          
          const backButton = document.getElementById("back-button");
          const currentPage = window.location.pathname;

          const pagesWithBackButton = ["/detail.html", "/another_page.html"]; 

          if (pagesWithBackButton.some(page => currentPage.indexOf(page) !== -1)) {
              backButton.style.display = "block";
          } else {
              backButton.style.display = "none";
          }

      })
      .catch((error) => console.error("Top bar 로딩 오류:", error));
});
