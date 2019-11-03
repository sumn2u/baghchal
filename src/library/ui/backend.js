export class Backend {
    constructor(backendUrl){
    this.backendUrl = backendUrl;
    this.request =  (url, method, params) => {
        return new Promise(function (resolve, reject) {
            const xmlhttp = new window.XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    const json = JSON.parse(xmlhttp.responseText);
                    if (json.success) {
                        resolve(json);
                    } else {
                        reject(json.error);
                    }
                }
            };
            xmlhttp.onerror = function (err) {
                reject(err);
            };
            xmlhttp.open(method, url, true);
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.send(JSON.stringify(params));
        });
    };

    this.save = (contextId, player, signature, socketId, friendSocketId) => {
        const url = this.backendUrl + '/save-match';
        const method = 'POST';
        const payload = {
            'contextId': contextId,
            'signature': signature,
            'player': player,
            'socketId': socketId,
            'friendSocketId': friendSocketId
        };
        return this.request(url, method, payload);
    };
    this.delete = (friendSocketId, socketId) => {
        const url = this.backendUrl + '/delete-match';
        const method = 'POST';
        const payload = {
            'socketId': socketId,
            'friendSocketId': friendSocketId
        };
        return this.request(url, method, payload);
    };

    this.load =  (signature) => {
        const url = this.backendUrl + '/get-match';
        const method = 'POST';
        const payload = {
            'signature': signature
        };
        return this.request(url, method, payload);
    };
};
};