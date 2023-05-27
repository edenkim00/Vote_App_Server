// module.exports = function (app) {
//     const controller = require('./Controller');
//     const jwtMiddleware = require('../../config/jwtMiddleware');
//     // signup
//     app.post('/app/user-signup', controller.postUser);
    
//     // login
//     app.post('/app/signin', controller.signIn);
    
//     // check if the user is exist
//     app.get('/app/forgot-password', controller.forgotPassword);
    
//     // change password
//     app.patch('/app/change-password', controller.changePassword);
    
//     // email send
//     app.get('/app/send-email', controller.sendEmail);

//     // vote
//     app.post('/app/vote', jwtMiddleware, controller.vote);
    
//     // get vote result
//     app.get('/app/vote-result', controller.voteResult);

//     // vote change
//     app.patch('/app/vote-change', jwtMiddleware, controller.voteChange);

//     // mypage
//     app.get('/app/mypage-info', jwtMiddleware, controller.mypageInfo);


// };