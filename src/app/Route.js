module.exports = function (app) {
    const controller = require('./Controller');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.post('/app/user-signup', controller.postUser);

    app.get('/app/forgot-password', controller.forgotPassword);

    app.patch('/app/change-password', controller.changePassword);

    // login
    app.post('/app/signin', controller.signIn);

    // mypage
    app.get('/app/mypage-info', jwtMiddleware, controller.mypageInfo);

    app.post('/app/vote', jwtMiddleware, controller.vote);

    app.get('/app/vote-result', controller.voteResult);
};