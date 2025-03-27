import { api, decodeJWT } from "./utils.js";
import { btnLoginActive, btnLoginDisabled } from "./validation.js";
import { btnDeleteModal } from "./modal.js";

const MAX_TITLE_LENGTH = 26; // 게시글 제목 최대 글자수
const path = window.location.pathname; // 페이지 구분

// 로그인한 사용자 정보
const token = localStorage.getItem("accessToken");
const decoded = decodeJWT(token);
const currentUserId = decoded?.sub || decoded?.id;

// 댓글
const btnBigCommentEdit = document.getElementById("btnCommentEdit"); // 댓글 수정 submit
const btnSmallCommentEdit = null; // 댓글 수정/삭제 중 선택
const btnSmallDeleteEdit = null;

// 게시물 작성 버튼 이벤트
const createPostButton = document.getElementById("create-post-button");
if (createPostButton) {
    createPostButton.addEventListener("click", () => {
        location.href = "/html/posts/make.html";
    });
}

// ---------------------- 게시물 작성 ----------------------
if (path.includes("make.html")) {
    const titleInput = document.getElementById("posts-write-title-input");
    const contentInput = document.querySelector(".posts-write-contents-input");
    const makeButton = document.getElementById("post-make-button");
    const postThumbnailUpload = document.querySelector('#post-thumbnail-upload');

    // 이미지 업로드 미리보기
    postThumbnailUpload?.addEventListener('change', getPostThumbnailImage);

    titleInput?.addEventListener("input", validateInputs);
    contentInput?.addEventListener("input", validateInputs);
    makeButton?.addEventListener("click", handleSubmit);

    validateInputs();

    function validateInputs() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (title !== "" && content !== "") {
            btnLoginActive(makeButton);
        } else {
            btnLoginDisabled(makeButton);
        }
    }

    async function handleSubmit() {
        const title = titleInput.value.trim();
        const contents = contentInput.value.trim();

        if (!title || !contents) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("contents", contents);
        formData.append("postThumbnailPath", postThumbnailUpload.files[0]);


        try {
            const response = await fetch("http://localhost:8080/posts", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            //alert("성공적으로 게시물을 작성했습니다!");
            //window.location.href = "/html/posts/list.html";
        } catch (err) {
            alert("게시물 작성에 실패했습니다: " + err.message);
        }
    }
}

// ---------------------- 게시물 목록 ----------------------
if (path.includes("list.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        setList();
        setupCreateButton();
    });
}

async function setList() {
    try {
        const res = await fetch("http://localhost:8080/posts", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
        });
        const posts = res.data.posts;

        const postList = document.getElementById("posts-list");
        postList.innerHTML = "";

        posts.forEach(post => {
            const postItem = document.createElement("div");
            postItem.classList.add("post-area");

            const shortTitle = post.title.length > 26 ? post.title.slice(0, 26) + "..." : post.title;
            const profileImagePath = post.author.profileImagePath;

            postItem.innerHTML = `
                    <div id="postItem" style="cursor: pointer;">
                        <div class="posts-title">${shortTitle}</div>
                        <div class="posts-info">
                            <span class="posts-recommend" style="margin-right: 7px;">좋아요 ${formatNumber(post.countRecommendation)}</span>
                            <span id="posts-replyNum" style="margin-right: 7px;">댓글 ${formatNumber(post.countComment)}</span>
                            <span id="posts-viewsNum">조회수 ${formatNumber(post.countView)}</span>
                            <span id="posts-dateNum" style="float: right">${formatDateNTime(post.modifiedAt)}</span>
                        </div>
                        <div class="posts-profile">
                            <div class="posts-profileImage">
                                <img src="${profileImagePath != null ? "http://localhost:8080" + profileImagePath : 'http://localhost:8080/attachments/profileImage/default-profile.png'}" style="width: 36px; height: 36px; border-radius: 30px;">
                            </div>
                            <span class="posts-author">${post.author ? post.author.nickname : "알 수 없음"}</span>
                        </div>
                    </div>
                `;

            postItem.addEventListener("click", () => {
                location.href = `/html/posts/detail.html?id=${post.id}`;
            });

            postList.appendChild(postItem);
        });
    } catch (err) {
        alert("게시물 목록을 불러오지 못했습니다.");
        console.error(err);
    }
}

function setupCreateButton() {
    const btn = document.getElementById("create-post-button");
    if (btn) {
        btn.addEventListener("click", () => {
            location.href = "/html/posts/make.html";
        });
    }
}

// ---------------------- 게시물 상세 ----------------------
if (path.includes("detail.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        setDetail();
        renderCommentEvent();
    });
}

async function setDetail() {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("id");

    if (!postId) {
        alert("잘못된 접근입니다.");
        location.href = "/html/posts/list.html";
        return;
    }

    try {
        const postRes = await api.get(`/posts/${postId}`);
        const post = postRes.data;
        const commentRes = await api.get(`/posts/${postId}/comments`);
        const comments = commentRes.data.comments;

        // 본문 바인딩
        document.querySelector(".posts-title").textContent = post.title;
        document.querySelector(".posts-text").textContent = post.contents;
        document.querySelector(".posts-date").textContent = formatDateNTime(post.modifiedAt);
        if (post.postThumbnailPath != null) {
            document.querySelector("#imgPostsThumbnailPath").src = "http://localhost:8080" + post.postThumbnailPath;
        } else {
            document.querySelector(".posts-thumbnail").style.display = "none";
        }

        // 좋아요/조회수/댓글 수
        const countBoxes = document.querySelectorAll(".posts-count p");
        countBoxes[0].textContent = post.countRecommendation;
        countBoxes[1].textContent = post.countView;
        countBoxes[2].textContent = post.countComment;

        // 좋아요 버튼 처리
        const likeBtn = document.getElementById("btnLike");
        likeBtn.dataset.postId = postId;
        countBoxes[0].textContent = post.countRecommendation;

        if (post.recommendationCreatedAt) {
            likeBtn.classList.add("liked");
        }

        likeBtn.addEventListener("click", async () => {
            try {
                if (likeBtn.classList.contains("liked")) {
                    alert("이미 좋아요를 눌렀습니다!");
                    return;
                }

                const token = localStorage.getItem("accessToken");
                const res = await fetch(`http://localhost:8080/posts/${postId}/recommendation`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error("좋아요 실패");

                const data = await res.json();
                countBoxes[0].textContent = data.data.recommendationCount;
                likeBtn.classList.add("liked");

            } catch (err) {
                alert("좋아요 처리 실패");
                console.error(err);
            }
        });

        // 작성자
        const profileImagePath = post.author.profileImagePath != null ? "http://localhost:8080" + post.author.profileImagePath : "http://localhost:8080/attachments/profileImage/default-profile.png";

        document.querySelector("#imgPostsProfileImage").src = profileImagePath;
        document.querySelector(".posts-author").textContent = post.author?.nickname || "알 수 없음";

        // 본인 게시글이면 수정/삭제 버튼 표시
        if (post.author?.id === Number(currentUserId)) {
            document.querySelector("#divPostsAdditionalBtn").innerHTML = `
              <button id="btnAdditionalEdit" class="posts-small-btn">수정</button>
              <button id="btnAdditionalDelete" class="posts-small-btn">삭제</button>
            `;
        }

        // 댓글 렌더링
        renderComments(comments);

    } catch (err) {
        alert("게시물 정보를 불러오지 못했습니다.");
        console.error(err);
    }
}

// 댓글 렌더링
function renderComments(comments) {
    const replyList = document.querySelector(".posts-reply-list");
    replyList.innerHTML = "";

    if (!Array.isArray(comments) || comments.length === 0) {
        replyList.innerHTML = `<div style="text-align: center; color: gray; margin: 50px 0px;">아직 댓글이 없습니다.</div>`;
        return;
    }

    comments.forEach(comment => {
        const isMyComment = Number(comment.author.id) === Number(currentUserId);
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("posts-reply-unit");
        commentDiv.setAttribute("data-comment-id", comment.id);

        const profileImagePath = comment.author.profileImagePath != null ? "http://localhost:8080" + comment.author.profileImagePath : "http://localhost:8080/attachments/profileImage/default-profile.png";

        commentDiv.innerHTML = `
        <div class="posts-profile" style="display: inline-flex; width: 70%;">
          <div class="posts-profileImage">
            <img src="${profileImagePath}" style="width: 36px; height: 36px; border-radius: 30px;">
          </div>
          <span class="posts-author">${comment.author.nickname || '익명'}</span>
          <span class="posts-date">${formatDateNTime(comment.modifiedAt)}</span>
        </div>
        <div style="margin-left: auto; display: inline-block;">
          ${isMyComment ? `
            <button id="btnCommentEditClick" class="posts-small-btn">수정</button>
            <button id="btnCommentDeleteClick" class="posts-small-btn">삭제</button>
          ` : ""}
        </div>
        <div class="posts-reply-text">${comment.comment}</div>
      `;

        replyList.appendChild(commentDiv);
    });
}

// ---------------------- 게시물 수정/삭제 (이벤트) ----------------------
document.addEventListener("click", function (event) {
    const target = event.target;

    // 게시물 수정
    if (target.id === "btnAdditionalEdit") {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("id");
        location.href = `/html/posts/edit.html?id=${postId}`;
    }

    // 게시물 삭제
    else if (target.id === "btnAdditionalDelete") {
        // 모달 열기 or 직접 삭제 함수 호출
        btnDeleteModal("post"); // 기존에 만든 모달 함수 사용
    }

    // 댓글 수정
    else if (target.id === "btnCommentEditClick") {
        editCommentSubmit(target);
        // editComment(target);
    }

    // 댓글 삭제
    else if (target.id === "btnCommentDeleteClick") {
        btnDeleteModal("comment", target);
    }
});

// ---------------------- 게시물 수정 ----------------------
export async function renderEdit() {
    try {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("id");

        if (!postId) {
            alert("해당 게시물을 찾을 수 없습니다.");
            location.href = "/html/posts/list.html";
            return;
        }

        const res = await api.get(`/posts/${postId}`);
        const post = res.data;

        document.getElementById("posts-edit-title-input").value = post.title;
        document.getElementById("posts-edit-contents-input").value = post.contents;

        if (post.postThumbnailPath) {
            document.getElementById("posts-file-name").textContent = post.postThumbnailPath;
        }

    } catch (error) {
        console.error("게시물 불러오기 오류:", error);
        alert("게시물 정보를 불러오는 데 실패했습니다.");
    }
}

export async function setupEditSubmit() {
    const editButton = document.getElementById("post-edit-button");

    editButton.addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get("id");

        const title = document.getElementById("posts-edit-title-input").value.trim();
        const contents = document.getElementById("posts-edit-contents-input").value.trim();
        const postThumbnailPath = document.getElementById("post-thumbnail-upload-edit").files[0];

        if (!title || !contents) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("contents", contents);
        if(postThumbnailPath) {
            formData.append("postThumbnailPath", postThumbnailPath);
        }
        
        try {
            const res = await fetch("http://localhost:8080/posts/" + postId, {
                method: "PATCH",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if(!res.ok) return;

            alert("게시글이 성공적으로 수정되었습니다!");
            location.href = `/html/posts/detail.html?id=${postId}`;
        } catch (err) {
            console.error("게시물 수정 실패:", err);
            alert("게시글 수정에 실패했습니다.");
        }
    });
}

// 게시물 삭제
export async function deleteContent(type, postId, commentId = null) {
    try {
        if (type === "post") {
            await api.delete(`/posts/${postId}`);
            alert("게시글이 삭제되었습니다.");
            location.href = "/html/posts/list.html";
        }

        if (type === "comment" && commentId) {
            await api.delete(`/posts/${postId}/comments/${commentId}`);
            alert("댓글이 삭제되었습니다.");
            location.reload(); // 현재 페이지 새로고침
        }
    } catch (err) {
        console.error(`${type} 삭제 실패:`, err);
        alert(`${type === "post" ? "게시글" : "댓글"} 삭제에 실패했습니다.`);
    }
}

// ---------------------- 게시물 목록 등 다른 페이지는 여기 추가 ----------------------
export function getPostThumbnailImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const preview = document.querySelector('#post-thumbnail-upload-preview');
        preview.style.backgroundImage = `url(${event.target.result})`;
    };
    reader.readAsDataURL(file);
}


function formatDateNTime(date) {
    return date.replace("T", " ");
}

export async function renderCommentEvent() {
    // 댓글 입력 요소 & 버튼들
    const commentInput = document.getElementById("post-comment-input");
    const btnCommentRegist = document.getElementById("btnCommentRegist");
    const btnBigCommentEdit = document.getElementById("btnCommentEdit");

    // 초기 설정: 수정 버튼 숨기기
    btnBigCommentEdit.style.display = "none";

    // 댓글 이벤트
    commentInput.addEventListener("input", () => {
        const value = commentInput.value.trim();
        if (value !== "") {
            btnLoginActive(btnCommentRegist);
        } else {
            btnLoginDisabled(btnCommentRegist);
        }
    });

    // ✅ 댓글 입력 시 버튼 활성화
    commentInput.addEventListener("input", () => {
        const content = commentInput.value.trim();
        if (btnBigCommentEdit.style.display === "block") {
            content ? btnLoginActive(btnBigCommentEdit) : btnLoginDisabled(btnBigCommentEdit);
        } else {
            content ? btnLoginActive(btnCommentRegist) : btnLoginDisabled(btnCommentRegist);
        }
    });

    // ✅ 댓글 등록
    btnCommentRegist.addEventListener("click", async () => {
        const content = commentInput.value.trim();
        if (!content) return;

        const postId = new URLSearchParams(window.location.search).get("id");

        try {
            await api.post(`/posts/${postId}/comments`, { comment: content });
            location.reload();
        } catch (err) {
            console.error("댓글 등록 실패:", err);
            alert("댓글 등록에 실패했습니다.");
        }
    });
}

export async function editCommentSubmit(target) {
    const commentDiv = target.closest(".posts-reply-unit");
    const commentText = commentDiv.querySelector(".posts-reply-text").innerText;
    const commentInput = document.getElementById("post-comment-input");

    const currentEditCommentId = commentDiv.dataset.commentId;
    commentInput.value = commentText;

    btnCommentRegist.style.display = "none";
    btnCommentEdit.style.display = "inline-block";

    btnLoginActive(btnCommentEdit);

    // ✅ 댓글 수정 완료
    btnCommentEdit.addEventListener("click", async () => {
        const postId = new URLSearchParams(window.location.search).get("id");
        const content = commentInput.value.trim();

        if (!currentEditCommentId || !content) return;

        try {
            await api.patch(`/posts/${postId}/comments/${currentEditCommentId}`, {
                comment: content,
            });

            alert("댓글이 수정되었습니다.");
            location.reload();
        } catch (err) {
            console.error("댓글 수정 실패:", err);
            alert("댓글 수정에 실패했습니다.");
        } finally {
            resetCommentForm();
        }
    });
}

// 댓글 입력창 초기화
function resetCommentForm() {
    // currentEditCommentId = null;
    document.getElementById("post-comment-input").value = "";

    btnCommentRegist.style.display = "inline-block";
    btnCommentEdit.style.display = "none";

    btnLoginDisabled(btnCommentEdit);
}

// ^^^^^^ 수정 완료 ^^^^^^

function formatNumber(num) {
    if (num >= 100000) return Math.floor(num / 1000) + "k";
    if (num >= 10000) return Math.floor(num / 1000) + "k";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "k";
    return num;
}

function detailPost(postId) {
    location.href = `/html/posts/detail.html?id=${postId}`;
}

function editPost(postId) {
    location.href = `/html/posts/edit.html?id=${postId}`;
}

export function createPost() {
    location.href = "/html/posts/make.html";
}


// 게시물 수정 시 이미지 선택
export function getPostThumbnailImageEdit(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileName = document.getElementById("posts-file-name");
        fileName.textContent = file.name;
    };
    reader.readAsDataURL(file);
}

// 파일 업로드 변경 감지
const postThumbnailEdit = document.querySelector('#post-thumbnail-upload-edit');
if (postThumbnailEdit) {
    postThumbnailEdit.addEventListener('change', getPostThumbnailImageEdit);
}
