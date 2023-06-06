"use strict";

const express = require('express');
const fs = require('fs');
const { base64ToAudio, converteMp3ToWav, getAccessToken, downFileNice, upFileNice, createSession, deleteSession, question } = require('./funcoes2');
const {main} = require('./Funcoes3')
const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: false }));

app.get('/teste',  async (req, res) => {

    main(req, res);

});



app.get('/gpt',  async (req, res) => {

    //const accessToken = await getAccessToken().then((accessToken) => {
    //    console.log('Token de acesso:', accessToken);
    //}).catch((error) => {
    //    console.error(error);
    //});

    const accessToken = await getAccessToken();
   

    const { fileName, bufferNice } = await downFileNice(req, res, accessToken);
    //console.log(fileName);
    //console.log(bufferNice);

    const session = await createSession(req, res);

    const data = {fileName:fileName, bufferNice:bufferNice, token:accessToken, session:session};
    const bufferGPT = await question(req, res, data);

    await base64ToAudio(bufferGPT, `resposta_${data.fileName}.mp3`);
    await converteMp3ToWav(`resposta_${data.fileName}.mp3`, `resposta_${data.fileName}`);

    await upFileNice(req, res, data);

    //deleteSession(req, res, data);
    
    //
});

app.get('/createSession', async (req, res) => {

    createSession(req, res);
    
});

app.get('/deleteSession/:session', (req, res) => {
   
    deleteSession(req, res);

});

app.get('/question', async (req, res) => {
    
    question(req, res);
  
});


app.get('/downloadAudio', async (req, res) => {
    
    downloadAudio(req, res);

});

app.listen(port, () => {
    console.log(`Web Service rodando em http://localhost:${port}`);
});

