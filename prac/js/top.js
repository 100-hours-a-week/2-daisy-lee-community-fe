const token = localStorage.getItem("accessToken");
const payload = JSON.parse(atob(token.split('.')[1]));
const userId = payload.sub || payload.id;
let userEmail = null;
document.addEventListener("DOMContentLoaded", async function () {
    fetch("/html/top.html")
        .then(res => res.text())
        .then(async (html) => {
            document.getElementById("header").innerHTML = html;

            if (token) {
                initTopBar();
                editUserInfo();

                
                await loadUserAvatar(userId);
            }
        })
        .catch((err) => console.error("헤더 로딩 실패:", err));

    function initTopBar() {
        const backButton = document.getElementById("back-button");
        const avatar = document.getElementById("userContainer");
        const menu = document.getElementById("dropdownMenu");
        const currentPage = window.location.pathname;

        // 뒤로가기 버튼이 필요한 페이지
        const pagesWithBackButton = ["/detail.html", "/signup.html", "/make.html", "/edit.html"];

        // 아바타 숨길 페이지
        const pagesWithoutAvatar = ["/login.html", "/signup.html"];

        // 뒤로가기 버튼 표시 여부
        if (backButton) {
            const showBack = pagesWithBackButton.some(page => currentPage.endsWith(page));
            backButton.style.display = showBack ? "block" : "none";
        }

        // 프로필 표시 여부
        if (avatar) {
            const hideAvatar = pagesWithoutAvatar.some(page => currentPage.endsWith(page));
            avatar.style.display = hideAvatar ? "none" : "block";
        }

        // 프로필 메뉴(토글)
        if (avatar && menu) {
            avatar.addEventListener("click", (e) => {
                e.stopPropagation(); // 드롭다운 외 클릭 감지 대비
                const isVisible = menu.style.display === "block";
                menu.style.display = isVisible ? "none" : "block";
            });

            document.addEventListener("click", (e) => {
                if (!avatar.contains(e.target) && !menu.contains(e.target)) {
                    menu.style.display = "none";
                }
            });
        }

    }

    function editUserInfo() {
        const editProfile = document.getElementById("edit-profile");
        const editPassword = document.getElementById("edit-password");

        if (editProfile) {
            editProfile.addEventListener("click", () => {
                window.location.href = "/html/user/edit_profile.html";
            });
        }

        if (editPassword) {
            editPassword.addEventListener("click", () => {
                window.location.href = "/html/user/edit_password.html";
            });
        }
    }

    async function loadUserAvatar(userId) {
        try {
            const res = await fetch("http://localhost:8080/users/" + userId, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) {
                throw new Error("응답 실패");
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("응답이 JSON이 아님");
            }

            const response = await res.json();
            const profileImageUrl = "http://localhost:8080" + (response.data.profileImagePath || "/attachments/profileImage/default-profile.png");
            userEmail = response.data.email;
            document.getElementById("userAvatar").src = profileImageUrl;

        } catch (err) {
            console.error("프로필 이미지 불러오기 실패", err);
        }
    }


});