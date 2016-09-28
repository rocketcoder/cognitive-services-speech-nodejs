"use strict"
const request = require('request');
const fs = require("fs");
const tokenUri = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
const ttsUri = "https://speech.platform.bing.com/synthesize";
const config = require("./config.js");
const key = config.key;
const outputFileName = config.fileName;	
const userAgent = config.userAgent;
const message = config.message;

function getBearerToken(){
  let tokenPromise = new Promise((resolve, reject) => {
    let options = {
      url : tokenUri,
      headers : {"Ocp-Apim-Subscription-Key" : key }
    }

    request.post(options, function(err,httpResponse,body){ 
      if(!err){
        console.log(body);
        resolve(body);
      }
      else{
        console.log(err);
        reject(err);
      }
    });
  });
  return tokenPromise;
}

function textToSpeech(bearerToken){
  let ttsPromise = new Promise((resolve, reject) => {
    let body = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>${message}</voice></speak>`;

    let options = {
      url : ttsUri,
      'auth': {
        'bearer': bearerToken
      },
      headers : {
        "Content-Type" : "application/ssml+xml",
        "X-Microsoft-OutputFormat" : "riff-16khz-16bit-mono-pcm",
        "User-Agent" : userAgent
      },
      "encoding": null,  //requestjs will encode response to utf-8 if this isn't here
      "body" : body
    };
    request.post(options, function(err,httpResponse,body){ 
      if(!err){
        console.log("tts worked");
        console.log(httpResponse.statusCode);
        console.log(httpResponse.statusMessage);
        resolve(body);
      }
      else{
        console.log(err);
        reject(err);
      }
    });
  });
  return ttsPromise;
}

function writeToFile(body){
  fs.writeFile("test.wav", body,(err, data) => {
    if(err){
      console.log(err);
    }
  });
}

getBearerToken().then(textToSpeech).then(writeToFile);