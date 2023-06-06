"use strict";

require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('ffmpeg-static');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

async function converteMp3ToWav(inputFilePath, outputFilePath) {
  try {
    const startTime = performance.now();

    await execPromise(`${ffmpeg} -i ${inputFilePath} -ar 8000 -ac 1 -acodec pcm_mulaw -f wav ${outputFilePath}`);

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('converteMp3ToWav - Tempo de execução: ' + executionTime + ' ms');
    console.log('Conversão concluída com sucesso!');
  } catch (error) {
    console.error('Ocorreu um erro durante a conversão:', error);
    console.error('Erro completo:', error.stderr);
  }
}

async function base64ToAudio(base64Data, outputPath) {
  try {
    const startTime = performance.now();

    const base64Buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(outputPath, base64Buffer, 'base64');

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('base64ToAudio - Tempo de execução: ' + executionTime + ' ms');

    return base64Buffer;
  } catch (error) {
    console.error('Erro ao salvar o arquivo de áudio:', error);
    throw error;
  }
}

async function getAccessToken() {
  try {
    const url = 'https://na1.nice-incontact.com/authentication/v1/token/access-key';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic S1FQVEVIQ1kyS1Y2S05KMlJTU1lHUlJPWU1PU1o1SVJPN1o2TE1ZTUc3VTZURkZYWlRaUT09PT06VU9SNVhUTjJSQ1RYUjVCTVJLWUlISE5EWTJLVjZLTkpNMlJTVVNZR1JMUFdZTUNaNUlSTzdaNkxNWTJNRzdVNlRGVlhadFExPT09'
      };
    const data = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      accessKeySecret: process.env.ACCESS_KEY_SECRET
    };

    const response = await axios.post(url, data, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error('Erro na chamada da API de autenticação:', error);
    throw new Error('Erro na chamada da API de autenticação');
  }
}

async function downFileNice(req, res, token) {
  try {
    const startTime = performance.now();

    const response = await axios.get(`https://api-c37.nice-incontact.com/incontactapi/services/v26.0/files?fileName=${req.query.file}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('getFileNice - Tempo de execução: ' + executionTime + ' ms');

    return { fileName: response.data.files.fileName, bufferNice: response.data.files.file };
  } catch (error) {
    console.error('Erro na chamada da API Nice getFileNice:', error);
    throw error;
  }
}

async function upFileNice(req, res, data) {
  try {

    const startTime = performance.now();

    const base64Buffer = fs.readFileSync(`resposta_${data.fileName}`);

    const url = 'https://api-c37.nice-incontact.com/incontactapi/services/v26.0/files';

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${data.token}`
    };

    const body = new URLSearchParams();
    body.append('fileName', `Sazonov\\resposta_${data.fileName}`);
    body.append('file', base64Buffer.toString('base64'));
    body.append('overwrite', 'true');

    const response = await axios.post(url, body, { headers });

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('upFileNice - Tempo de execução: ' + executionTime + ' ms');

    return res.status(200).send("AUDIO ENVIADO COM SUCESSO!");
  } catch (error) {
    console.error('Erro na chamada da API Nice upFileNice:', error);
    throw error;
  }
}

async function createSession(req, res) {
  try {
    //const url = process.env.GPT_SESSION_API_URL;
    const url = 'https://pocgpt-orchestrator.azurewebsites.net/api/session?code=KXAWtf-F7Mkv8W1trIwuTVz_GrkahcjUHiH_gJkKTqp-AzFulIYz4w==';

    const startTime = performance.now();

    const response = await axios.get(url);

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('createSession - Tempo de execução: ' + executionTime + ' ms');

    return response.data;
  } catch (error) {
    console.error('Erro na chamada da API Session GPT:', error);
    throw error;
  }
}

function deleteSession(req, res, session) {
  //const url = `${process.env.GPT_SESSION_API_URL}?session_id=${data.session}`;
  const url = `https://pocgpt-orchestrator.azurewebsites.net/api/session?session_id=${session}&code=KXAWtf-F7Mkv8W1trIwuTVz_GrkahcjUHiH_gJkKTqp-AzFulIYz4w==`;

  try {
    axios.delete(url);
    //return res.status(200).json({ message: "sessao deletada" } || []);
  } catch (error) {
    console.error('Erro na chamada da API deleteSession GPT:', error);
    throw error;
  }
}

async function question(req, res, data) {
    
  try {
    //const url = `${process.env.GPT_QUESTION_API_URL}?code=${process.env.GPT_QUESTION_API_CODE}&session_id=${data.session}`;
    const url = `https://pocgpt-orchestrator.azurewebsites.net/api/question?code=9LterL3N0H1X8Lfqq1yAWZOI-GDMnxH0sGsjcmLmdZh6AzFuGPZiig==&session_id=${data.session}`;
    const startTime = performance.now();
    const bufferNice = Buffer.from(data.bufferNice, 'base64');
    const response = await axios.post(url, bufferNice, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Accept': 'audio/mp3',
      },
      responseType: 'arraybuffer',
    });

    //const bufferGPT = Buffer.from(response.data, 'base64');

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('question - Tempo de execução: ' + executionTime + ' ms');

    return response.data;
  } catch (error) {
    console.error('Erro na chamada da API Question GPT:', error);
    throw error;
  }
}

async function answer(req, res, data) {
  try {
    const startTime = performance.now();

    await base64ToAudio(data.bufferGPT, `resposta_${data.fileName.replace('.wav', '.mp3')}`);
    await converteMp3ToWav(`resposta_${data.fileName.replace('.wav', '.mp3')}`, `resposta_${data.fileName.replace('.mp3', '.wav')}`);

    const base64Buffer = fs.readFileSync(`resposta_${data.fileName}`);

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('answer - Tempo de execução: ' + executionTime + ' ms');

    return base64Buffer;
  } catch (error) {
    console.error('Erro ao processar a resposta:', error);
    throw error;
  }
}

async function main(req, res) {
  try {

    const startTime = performance.now();


    const token = await getAccessToken();
    const data = await downFileNice(req, res, token);
    const session = await createSession(req, res);
    const bufferGPT = await question(req, res, { ...data, session: session });
    const base64Buffer = await answer(req, res, { ...data, session: session, bufferGPT: bufferGPT });
    await upFileNice(req, res, { ...data, token });
    deleteSession(req, res, session);
    //return res.send("OK");

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log('TOTAL - Tempo de execução: ' + executionTime + ' ms');

  } catch (error) {
    console.error('Erro durante a execução:', error);
    return res.status(500).send('Erro durante a execução');
  }
}

module.exports = {main};
