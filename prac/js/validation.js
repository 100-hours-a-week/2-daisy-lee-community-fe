            
// const loginButton = document.querySelector('.login-button input');
function btnLoginActive(selectButton) {
    selectButton.disabled = false;
    selectButton.classList.add('active-button');
    selectButton.classList.remove('disable-button');
}

function btnLoginDisabled(selectButton) {
    selectButton.disabled = true;
    selectButton.classList.remove('active-button');
    selectButton.classList.add('disable-button');
}

async function isDuplicationEmail(emailInput) {
    try {
        const res = await fetch(`http://localhost:8080/users/check-email?email=${encodeURIComponent(emailInput)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        return data.data.duplicated;
    } catch (err) {
        console.error("isDuplicationEmail Error:", err);
        return false;
    }
}

async function isDuplicationNickname(nicknameInput) {
    try {
        const res = await fetch(`http://localhost:8080/users/check-nickname?nickname=${encodeURIComponent(nicknameInput)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await res.json();
        return data.data.duplicated;
    } catch (err) {
        console.error("isDuplicationNickname Error:", err);
        return false;
    }
}

export { isDuplicationEmail, isDuplicationNickname, btnLoginActive, btnLoginDisabled };