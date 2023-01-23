function psHttpGet(url) {
  return new Promise((resolve, reject) => {
	  chrome.identity.getAuthToken({ 'interactive': true }, (token) => {

      if(!token)
        throw new Error('Failed to fetch auth token !');

	    let xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {

	      if(this.readyState != XMLHttpRequest.DONE)
	        return;

	      if(this.status != 200)
	        return reject(this);

	      resolve(JSON.parse(this.response));

	    }
	    xhttp.open('GET', url, true);
	    xhttp.setRequestHeader('Authorization', 'Bearer ' + token);
      xhttp.send();

	  });
  });
}


function psGetCookie(url, name) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({ url: url, name: name }, (cookie) => {
      resolve(cookie);
    });
  });
}

function psSetCookie(details) {
  console.log('Setting cookie ', details);
  return new Promise((resolve, reject) => {
    chrome.cookies.set(details, (cookie) => {
      resolve(cookie);
    });
  });
}
