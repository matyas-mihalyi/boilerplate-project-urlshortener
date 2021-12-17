
const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

const UrlObject = mongoose.model('UrlObject', urlSchema);

async function createNewUrl (inputUrl) {
  const _numberOfRecords = await UrlObject.estimatedDocumentCount();
  const newUrl = new UrlObject({original_url: inputUrl, short_url: _numberOfRecords + 1});
  await newUrl.save();
  return newUrl;
};


async function findOriginalUrl (inputNumber) {
  const _inputNumber = Number(inputNumber);
  const url = await UrlObject.findOne({short_url: _inputNumber});
  return url.original_url;
};

function runAsyncWrapper (callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(next)
  };
};

module.exports = { createNewUrl, findOriginalUrl, runAsyncWrapper };
