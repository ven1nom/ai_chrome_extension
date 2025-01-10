(function () {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
            try {
                if (this.status === 200 && this._url.match(/https:\/\/api2\.maang\.in\/problems\/user\/\d+/)) {
                    const data = {
                        url: this._url,
                        status: this.status,
                        response: JSON.parse(this.responseText)
                    };
                    
                    window.dispatchEvent(new CustomEvent("xhrDataFetched", { 
                        detail: data 
                    }));
                }
            } catch (error) {
                console.error('Error processing XHR response:', error);
            }
        });

        return originalSend.apply(this, arguments);
    };
})();