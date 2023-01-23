var zerodhaId = null;
var cookies = { timestamp: 0 };



async function init() {

  zerodhaId = (await chrome.storage.local.get(['zerodhaId'])).zerodhaId;

  let ret = await fetch('https://invest.zero65.in/api/zerodha/ids', { credentials: 'include' });
  if(ret.status == 200) {

    let zerodhaIds = (await ret.json()).ids;
    if(!zerodhaIds || !zerodhaIds.length)
      zerodhaId = null;
    else if(!zerodhaId || zerodhaIds.indexOf(zerodhaId) == -1)
      zerodhaId = zerodhaIds[0];

    chrome.storage.local.set({
      'zerodhaId' : zerodhaId,
      'zerodhaIds': zerodhaIds
    });

  } else if(ret.status == 401 || ret.status == 403) {

    chrome.tabs.create({ url: "https://invest.zero65.in/" });

  } else {

    console.log(ret.status, await ret.text());

  }

}; init(); setInterval(init, 5 * 60 * 1000);



chrome.runtime.onMessage.addListener(async (data, sender, callback) => {

  if(sender.id != 'bmimjjjamcpohjjfmdhneocpniahbapo')
    return;

  console.log(sender.origin, data);

  if(sender.origin == 'chrome-extension://bmimjjjamcpohjjfmdhneocpniahbapo') {
    zerodhaId = data;
    cookies.timestamp = 0;
  } else if(sender.origin == 'https://kite.zerodha.com') {
    if(data != 'login')
      return console.log('No action required !');
    if(!zerodhaId)
      return console.log('No zerodhaId available !');
  } else {
    return console.log('No action required !');
  }

  let ret = await fetch(`https://invest.zero65.in/api/zerodha/session?id=${ zerodhaId }&timestamp=${ cookies.timestamp }`, { credentials: 'include' });
  
  if(ret.status == 401 || ret.status == 403)
    chrome.tabs.create({ url: "https://invest.zero65.in/" });
  
  if(ret.status != 200)
    return console.log(`${ await ret.text() } (${ ret.status }), while fetching cookies`);

  cookies = await ret.json();

  console.log(cookies);

  let _cookie = (str, host) => {
    let details = {};
    str.split(';').forEach((kv, i) => {
      kv = kv.trim();
      let [ key, value ] = kv.indexOf('=') == -1 ? [ kv, true ] : [ kv.substring(0, kv.indexOf('=')), kv.substring(kv.indexOf('=') + 1) ];
      if(i == 0) {
        details.name = key;
        details.value = value;
      } else if(key == 'path')
        details.url = host + value;
      else if(key == 'expires')
        details.expirationDate = Math.ceil(new Date(value).getTime()/1000);
      else if(key == 'HttpOnly')
        details.httpOnly = value;
      else if(key == 'SameSite') {
        if(value == 'None')
          return;
        details.sameSite = value.toLowerCase();
      } else if(key == 'Secure')
        details.secure = value;

      else if(key == 'Max-Age')
        return;
      else
        details[key] = value;
    });
    return details;
  };

  for(let c = 0; c < cookies.kite.length; c++) {
    let details = _cookie(cookies.kite[c], 'https://kite.zerodha.com');
    console.log('Setting cookie ', details);
    await chrome.cookies.set(details);
  }

  for(let c = 0; c < cookies.console.length; c++) {
    let details = _cookie(cookies.console[c], 'https://console.zerodha.com');
    console.log('Setting cookie ', details);
    await chrome.cookies.set(details);
  }

  console.log('Reloading tabs ...')

  chrome.tabs.query({ url:'*://kite.zerodha.com/*' }, (tabs) => {
    if(!tabs.length)
      chrome.tabs.create({ 'url': 'https://kite.zerodha.com/positions', 'active':true });
    else
      tabs.forEach((tab) => {
        if(!tab.url.startsWith('https://kite.zerodha.com/chart/ext/'))
          chrome.tabs.reload(tab.id);
      });
  });

  chrome.tabs.query({url:'*://console.zerodha.com/*'}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });

});
