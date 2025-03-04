// document.addEventListener("DOMContentLoaded", async function() {
//     try {
//         const postJson = await fetch("/prac/data/posts.json");
//         const data = await postJson.json();


//     }

// });

const MAX_TITLE_LENGTH = 26;

async function setList() {
    try {
        const postJson = await fetch("/prac/data/posts.json");
        const data = await postJson.json();

        const posts = data.posts;

        const postList = document.getElementById("posts-list");
        postList.innerHTML = ""; // 목록 초기화

        posts.forEach( post => {
            const postItem = document.createElement("div");
            postItem.classList.add("post-area");

            let shortTitle = post.title.length > MAX_TITLE_LENGTH 
                                ? post.title.slice(0, MAX_TITLE_LENGTH) + "..." 
                                : post.title;
            

            postItem.innerHTML = `
                    <div id="postItem" style="cursor: pointer;">
                        <div class="posts-title">${shortTitle}</div>
                        <div class="posts-info">
                            <span class="posts-recommend" style="margin-right: 7px;">좋아요 ${formatNumber(post.countLike)}</span>
                            <span id="posts-replyNum" style="margin-right: 7px;">댓글 ${formatNumber(post.comments.length)}</span>
                            <span id="posts-viewsNum">조회수 ${formatNumber(post.countView)}</span>
                            <span id="posts-dateNum" style="float: right">${post.createdAt}</span>
                        </div>
                        <div class="posts-profile">
                            <div class="posts-profileImage"></div>
                            <span class="posts-author">${post.authorId}</span>
                        </div>
                    </div>
                `;

            const detailPostDiv = postItem.querySelector("#postItem");
            detailPostDiv.addEventListener("click", () => detailPost(post.id));

            postList.appendChild(postItem);
        });
    } catch (error) {
        console.error("게시물 목록 오류 : ", error);
    }
}

function formatNumber(num) {
    if (num >= 100000) return Math.floor(num / 1000) + "k";
    if (num >= 10000) return Math.floor(num / 1000) + "k";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "k";
    return num;
}


function detailPost(postId) {
    alert(`게시물 ${postId} 상세보기 페이지로 이동!`);
}

