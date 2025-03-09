            
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
        const response = await fetch("../../data/user.json");
        const data = await response.json();
        
        // "email"이 일치하는 데이터 찾기
        const email = data.find((item) => item.email === emailInput);
        
        if (typeof email == "object") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("isDuplicationEmail Error : ", error);
        return false;
    }
}

async function isDuplicationNickname(nicknameInput) {
    try {
        const response = await fetch("../../data/user.json");
        const data = await response.json();
        
        // "nickname"이 일치하는 데이터 찾기
        const nickname = data.find((item) => item.nickname === nicknameInput);
        
        if (typeof nickname == "object") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("isDuplicationNickname Error : ", error);
        return false;
    }
}

export { isDuplicationEmail, isDuplicationNickname, btnLoginActive, btnLoginDisabled };