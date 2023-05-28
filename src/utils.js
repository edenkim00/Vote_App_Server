const moment = require('moment');
const Controller = require('./app/Controller');
const methodToPath = {
    '/app/user-signup': 'POST',
    '/app/signin': 'POST',
    '/app/forgot-password': 'GET',
    '/app/change-password': 'PATCH',
    '/app/send-email': 'GET',
    '/app/vote': 'POST',
    '/app/vote-result': 'GET',
    '/app/vote-change': 'PATCH',
    '/app/mypage-info': 'GET',
}

function parseEvent(event) {
    try {
        const body = JSON.parse(event.body);
        const queryString = event.queryStringParameters || {};
        const { method, path } = event?.requestContext?.http;
        if (!(path && method)) return null;
        if (!(methodToPath[path] && methodToPath[path] === method)) return null;
        let next = null;
        let tokenRequired = false;
        switch (path) {
            case '/app/user-signup':
                next = Controller.postUser;
                break;
            case '/app/signin':
                next = Controller.signIn;
                break;
            case '/app/forgot-password':
                next = Controller.forgotPassword;
                break;
            case '/app/change-password':
                next = Controller.changePassword;
                break;
            case '/app/send-email':
                next = Controller.sendEmail;
                break;
            case '/app/vote':
                next = Controller.vote;
                tokenRequired = true;
                break;
            case '/app/vote-result':
                next = Controller.voteResult;
                tokenRequired = true;
                break;
            case '/app/vote-change':
                next = Controller.voteChange;
                tokenRequired = true;
                break;
            case '/app/mypage-info':
                next = Controller.mypageInfo;
                tokenRequired = true;
                break;
            default:
                return null;
        }
        return {
            method,
            path,
            tokenRequired,
            next,
            data: {
                ...body,
                ...queryString
            }
        }


    } catch (err) {
        console.error(err);
    }
    return null;
}

async function verifyAccessToken(token) {
    if (!token) {
        return null;
    }
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, verifiedToken) => {
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

function getWeekDateRange(year, month, week) {
    const paddedMonth = month.padStart(2, "0");
    let startDate, endDate;
    if (week == "4") {
        startDate = moment(`${year}-${paddedMonth}`).startOf('month').add(week - 1, 'week');
        endDate = moment(`${year}-${paddedMonth}`).endOf('month');
    } else {
        startDate = moment(`${year}-${paddedMonth}`).startOf('month').add(week - 1, 'week');
        endDate = moment(`${year}-${paddedMonth}`).startOf('month').add(week, 'week').subtract(1, 'day');
    }
    return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
    }
}

function isAvailableVoteDate(startDate) {
    const today = moment().format('YYYY-MM-DD');
    const oneMonthAfter = moment().add(1, 'month').format('YYYY-MM-DD');
    return oneMonthAfter <= startDate 
}

module.exports = {
    parseEvent,
    verifyAccessToken,
    getWeekDateRange,
    isAvailableVoteDate,
}