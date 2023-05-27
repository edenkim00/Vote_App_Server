const baseResponse = require('./config/baseResponseStatus');
const Controller = require('./src/app/Controller');
require('dotenv').config();
exports.handler = async function (event) {
    const parsedData = _parseEvent(event);
    if (!parsedData) {
        return {
            statusCode: 400,
            body: baseResponse.INVALID_REQUEST
        };
    }
    if (parsedData.tokenRequired) {
        const { verifiedToken } = await _verifyAccessToken(parsedData?.accessToken);
        if (!verifiedToken) {
            return {
                statusCode: 400,
                body: baseResponse.TOKEN_VERIFICATION_FAILURE,
            };
        }
        parsedData.verifiedToken = verifiedToken;
    }
    const { body, next, verifiedToken } = parsedData;
    try {
        const response = next(body, verifiedToken);
        return {
            statusCode: 200,
            body: response,
        }
    } catch (err) {
        console.error('[Main]: err');
    }

    const response = {
        statusCode: 400,
        body: baseResponse.INVALID_REQUEST
    };
    return response;
};

function _parseEvent(event) {
    try {
        const body = JSON.parse(event.body);
        const queryString = event.queryStringParameters;
        const { method, path } = event?.requestContext?.http;
        const result = {
            method,
            path,
            data: {
                ...body,
                ...queryString
            }
        }
        switch (path) {
            case '/app/user-signup':
                if (method !== 'POST') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.postUser,
                }
            case '/app/signin':
                if (method !== 'POST') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.signIn,
                }
            case '/app/forgot-password':
                if (method !== 'GET') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.forgotPassword,
                }
            case '/app/change-password':
                if (method !== 'PATCH') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.changePassword,
                }
            case '/app/send-email':
                if (method !== 'GET') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.sendEmail,
                }
            case '/app/vote':
                if (method !== 'POST') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: true,
                    accessToken: event.headers['x-access-token'],
                    next: Controller.vote,
                }
            case '/app/vote-result':
                if (method !== 'GET') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: false,
                    next: Controller.voteResult,
                }
            case '/app/vote-change':
                if (method !== 'PATCH') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: true,
                    accessToken: event.headers['x-access-token'],
                    next: Controller.voteChange,
                }
            case '/app/mypage-info':
                if (method !== 'GET') {
                    return null;
                }
                return {
                    ...result,
                    tokenRequired: true,
                    accessToken: event.headers['x-access-token'],
                    next: Controller.mypageInfo,
                }
        }
    } catch (err) {
        console.error(err);
    }
    return null;
}

async function _verifyAccessToken(token) {
    if (!token) {
        return null;
    }
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, process.env.jwtsecret, (err, verifiedToken) => {
                if (err) reject(err);
                resolve(verifiedToken)
            })
        }
    );
    try {
        return (await p); // verified Token
    } catch (err) {
        return null;
    }
}
