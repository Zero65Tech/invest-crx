var userId = 'DEMO';
var cookies = { timestamp: 0 };



async function init() {
  let userIds = await psHttpGet(`https://invest.zero65.in/api/user/zerodha-ids`);
  if(userId == 'DEMO')
    userId = userIds[0];
  chrome.storage.sync.set({ 'userIds': userIds });
}; init(); setInterval(init, 5 * 60 * 1000);



chrome.runtime.onMessage.addListener(async (data, sender, callback) => {

  console.log(sender.url, data);
  if((sender.origin != 'https://kite.zerodha.com' || data != 'login') && sender.id != 'bmimjjjamcpohjjfmdhneocpniahbapo')
    return;

  if(data != 'login') {
    userId = data;
    cookies.timestamp = 0;
  }


  cookies = await psHttpGet(`https://zerodha.zero65.in/api/session?userId=${ userId }&timestamp=${ cookies.timestamp }`);
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

  for(let c = 0; c < cookies.kite.length; c++)
    await psSetCookie(_cookie(cookies.kite[c], 'https://kite.zerodha.com'));

  for(let c = 0; c < cookies.console.length; c++)
    await psSetCookie(_cookie(cookies.console[c], 'https://console.zerodha.com'));


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
