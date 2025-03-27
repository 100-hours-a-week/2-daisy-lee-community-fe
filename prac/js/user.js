import { api, decodeJWT } from "./utils.js";

// 로그인한 사용자 정보
const token = localStorage.getItem("accessToken");
const decoded = decodeJWT(token);
const currentUserId = decoded?.sub || decoded?.id;

export async function signupUser(data) {
  try {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("nickname", data.nickname);

    if (data.profileImagePath) {
      formData.append("profileImagePath", data.profileImagePath);
    }

    const response = await fetch("http://localhost:8080/users", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "회원가입 실패");
    }

    return await response.json(); // 성공 시 응답 JSON 반환
  } catch (err) {
    alert(err.message);
    throw err;
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await fetch("http://localhost:8080/auth/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "로그인 실패");
    }

    return await response.json();
  } catch (err) {
    alert(err.message);
    throw err;
  }
}

