(async () => {

  let zerodhaIds = (await chrome.storage.local.get(['zerodhaIds'])).zerodhaIds || [ 'DEMO' ];

  let tr = document.querySelector('body > table > tbody > tr');
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

})();