const BASE_URL = "http://localhost:8080";

// authorization 확인
export async function authFetch(path, options = {}) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "/html/user/login.html"; // 경로 맞게 수정
        return;
    }

    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "요청 실패");
    }

    return response.json();
}

// 인증 필요 없는 요청용
export async function publicFetch(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "요청 실패");
    }

    return response.json();
}

// 편하게 사용하기 위한 api 객체 (GET, POST, PUT, DELETE)
export const api = {
    get: (url) => authFetch(url),
    post: (url, body) => authFetch(url, {
        method: "POST",
        body: JSON.stringify(body)
    }),
    put: (url, body) => authFetch(url, {
        method: "PUT",
        body: JSON.stringify(body)
    }),
    patch: (url, body) => authFetch(url, {
        method: "PATCH",
        body: JSON.stringify(body)
    }),
    delete: (url) => authFetch(url, {
        method: "DELETE"
    }),
};

export function decodeJWT(token) {
    if (!token) return null;

    try {
        const payload = token.split('.')[1]; // 가운데 부분 (Base64 인코딩된 JSON)
        const decoded = atob(payload);       // base64 디코딩
        return JSON.parse(decoded);          // JSON으로 변환
    } catch (e) {
        console.error("JWT decode error:", e);
        return null;
    }
}

