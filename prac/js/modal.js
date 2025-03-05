async function btnDeleteModal(type) {
    const modalContainer = document.getElementById("modal-container");

    try {
        const response = await fetch("../modal.html");
        const modalHtml = await response.text();
        modalContainer.innerHTML = modalHtml;

        // 새로 추가된 모달 요소 가져오기
        const modal = modalContainer.querySelector(".modal");
        const modalOverlay = document.querySelector(".modal-overlay");
        const btnConfirmModal = modalContainer.querySelector(".btn-confirm-modal");
        const btnCloseModal = modalContainer.querySelector(".btn-close-modal");

        // 모달 표시
        modal.classList.add("show");
        modalOverlay.classList.add("show");

        // 닫기 버튼 이벤트 추가
        btnCloseModal.addEventListener("click", () => {
            modal.classList.remove("show");
            modalOverlay.classList.remove("show");
        });

        // 확인 버튼 이벤트 추가
        btnConfirmModal.addEventListener("click", () => {
            alert("게시물이 삭제되었습니다.");
            location.href = "/prac/html/posts/list.html";
        });

        // 배경 클릭 시 모달 닫기
        // modalOverlay.addEventListener("click", function () {
        //     modal.classList.remove("show");
        //     modalOverlay.classList.remove("show");
        // });

        if(type === "post") {
            modal.querySelector(".modal_body h2").textContent = "게시물을 삭제하시겠습니까?";
        } else if (type === "comment") {
            modal.querySelector(".modal_body h2").textContent = "댓글을 삭제하시겠습니까?";
        }

        modal.querySelector(".modal_body p").textContent = "삭제한 내용은 복구할 수 없습니다.";

    } catch (error) {
        console.error("모달을 불러오는 중 오류 발생:", error);
    }
}


export {btnDeleteModal};