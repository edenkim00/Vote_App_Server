module.exports = {

    // Success
    SUCCESS: { "isSuccess": true, "code": 1000, "message": "성공" },

    WRONG_BODY: { "isSuccess": false, "code": 1001, "message": "body를 다시 확인하고 보내주세요." },
    WRONG_EMAIL: { "isSuccess": false, "code": 1002, "message": "email형식을 지켜서 보내주세요." },
    WRONG_PASSWORD_LENGTH: { "isSuccess": false, "code": 1003, "message": "비밀번호 길이는 4~12글자로 맞춰주세요." },
    ALREADY_EXIST_EMAIL: { "isSuccess": false, "code": 1004, "message": "이미 가입된 이메일입니다." },
    TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 1005, "message": "JWT TOKEN ERROR" },
    WRONG_QUERY_STRING: { "isSuccess": false, "code": 2001, "message": "query string을 다시 확인하고 보내주세요." },

    NOT_EXIST_USER: { "isSuccess": false, "code": 3001, "message": "잘못된 이메일 또는 패스워드입니다." },

    TOKEN_ERROR: { "isSuccess": false, "code": 4001, "message": "잘못된 토큰입니다." },

    ALREADY_EXIST_VOTE: { "isSuccess": false, "code": 5001, "message": "이미 투표하셨습니다." },

    DATE_ERROR: { "isSuccess": false, "code": 6001, "message": "아직 투표결과를 알 수 없습니다." }
}