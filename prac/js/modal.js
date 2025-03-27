import { api } from "./utils.js";
import { deleteContent } from "./posts.js";

async function btnDeleteModal(type, target) {
  const modalContainer = document.getElementById("modal-container");

  try {
    const response = await fetch("../modal.html");
    const modalHtml = await response.text();
    modalContainer.innerHTML = modalHtml;

    const modal = modalContainer.querySelector(".modal");
    const modalOverlay = document.querySelector(".modal-overlay");
    const btnConfirmModal = modalContainer.querySelector(".btn-confirm-modal");
    const btnCloseModal = modalContainer.querySelector(".btn-close-modal");

    modal.classList.add("show");
    modalOverlay.classList.add("show");

    btnCloseModal.addEventListener("click", () => {
      modal.classList.remove("show");
      modalOverlay.classList.remove("show");
    });

    const title = type === "post" ? "게시물을 삭제하시겠습니까?" : "댓글을 삭제하시겠습니까?";
    modal.querySelector(".modal_body h2").textContent = title;
    modal.querySelector(".modal_body p").textContent = "삭제한 내용은 복구할 수 없습니다.";

    btnConfirmModal.addEventListener("click", async () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get("id");

      if (type === "post") {
        await api.delete(`/posts/${postId}`);
        alert("게시물이 삭제되었습니다.");
        location.href = "/html/posts/list.html";

      } else if (type === "comment") {
        const commentDiv = target.closest(".posts-reply-unit");
        const commentId = commentDiv.dataset.commentId;

        if (!commentId) {
          alert("댓글 ID를 찾을 수 없습니다.");
          return;
        }

        await api.delete(`/posts/${postId}/comments/${commentId}`);
        alert("댓글이 삭제되었습니다.");
        location.reload(); // 댓글 목록 새로고침
      }

      // 모달 닫기
      modal.classList.remove("show");
      modalOverlay.classList.remove("show");
    });
  } catch (error) {
    console.error("모달을 불러오는 중 오류 발생:", error);
  }
}


export { btnDeleteModal };