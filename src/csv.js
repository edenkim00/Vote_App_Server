const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// CSV 파일 데이터
const csvData = [
    ['Name', 'Email'],
    ['John Doe', 'johndoe@example.com'],
    ['Jane Smith', 'janesmith@example.com']
];

// CSV 파일 생성
const csvFilePath = path.join('/tmp', 'data.csv');
const csvContent = csvData.map(row => row.join(',')).join('\n');
fs.writeFileSync(csvFilePath, csvContent);


// nodemailer 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nlcsjejusportshall@gmail.com',
        pass: 'jpqiebiijnmdatoh'
    }
});

// 메일 옵션 설정
const mailOptions = {
    from: 'nlcsjejusportshall@gmail.com',
    to: 'eotjd0986@naver.com',
    subject: 'CSV 파일 첨부',
    text: 'CSV 파일이 첨부되었습니다.',
    attachments: [
        {
            filename: 'data.csv',
            path: csvFilePath
        }
    ]
};

exports.sendEmail = async function () {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }

            // 생성한 CSV 파일 삭제
            fs.unlinkSync(csvFilePath);
            resolve();
        });
    });

}

// 이메일 전송

