(async () => {

  let zerodhaIds = (await chrome.storage.local.get(['zerodhaIds'])).zerodhaIds;

  let tr = document.querySelector('body > table > tbody > tr');

  if(zerodhaIds && zerodhaIds.length) {

    for(const zerodhaId of zerodhaIds) {

      let button = document.createElement('button');
      button.innerText = zerodhaId;
      button.className = 'btn btn-primary';

      button.onclick = () => chrome.runtime.sendMessage(zerodhaId);

      let td = document.createElement('td');
      td.style = 'padding:5px;'
      td.appendChild(button);
      tr.appendChild(td);

    }

  } else {

    let a = document.createElement('a');
    a.href = 'https://invest.zero65.in/';
    a.innerText = 'https://invest.zero65.in/';

    let td = document.createElement('td');
    td.style = 'padding:5px;'
    td.appendChild(a);
    tr.appendChild(td);

  }

})();