(async () => {

  let zerodhaAccounts = (await chrome.storage.local.get(['zerodhaAccounts'])).zerodhaAccounts;

  let tr = document.querySelector('body > table > tbody > tr');

  if(zerodhaAccounts && zerodhaAccounts.length) {

    for(const zerodhaAccount of zerodhaAccounts) {

      let button = document.createElement('button');
      button.innerText = zerodhaAccount.name;
      button.className = 'btn btn-primary';

      button.onclick = () => chrome.runtime.sendMessage(zerodhaAccount.id);

      let td = document.createElement('td');
      td.style = 'padding:5px;'
      td.appendChild(button);
      tr.appendChild(td);

    }

  } else {

    let a = document.createElement('a');
    a.href = '#';
    a.innerText = 'https://invest.zero65.in/';

    a.onclick = () => chrome.tabs.create({ url: "https://invest.zero65.in/" });

    let td = document.createElement('td');
    td.style = 'padding:5px;'
    td.appendChild(a);
    tr.appendChild(td);

  }

})();