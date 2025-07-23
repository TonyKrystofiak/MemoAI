'use strict';
var isRequesting = false;
var model = 'ChatGPT';

console.log('content script index.js loaded')

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.action === 'scrape') {
    console.log('scraping webpage...')
    scrape();
  }
  if (request.action === 'model') {
    console.log('requesting model...')
    model = request.model;
  }
  sendResponse({ success: true });
  return true;
});

async function scrape() {
  const htmlDoc = document.documentElement.innerHTML;
  if (!htmlDoc || isRequesting) return;

  isRequesting = true;

  const apiUrl = `${window.EXTENSION_CONFIG.baseUrl}/api/conversation`; 
  const body = new FormData();

  // raw HTML
  body.append('htmlDoc', new Blob([htmlDoc], { type: 'text/plain; charset=utf-8' }));
  // model
  body.append('model', model);
  console.log(document.documentElement.innerHTML)
  try {
    const res = await fetch(apiUrl, { method: 'POST', body });
    console.log('res =>', res, apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { url } = await res.json();
    window.open(url, '_blank'); // view the saved conversation
  } catch (err) {
    alert(`Error saving conversation: ${err.message}`);
  } finally {
    isRequesting = false;
  }
}
