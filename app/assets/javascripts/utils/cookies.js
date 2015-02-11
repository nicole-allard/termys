define([
], function (
) {
    return {
        create: function (name, value, options) {
            var cookie = name + '=' + value + '; path=' + (options.path || '/');
            var date;

            if (options.domain)
                cookie += '; domain=.' + options.domain;

            if (options.expiresIn) {
                // expiresIn is in ms
                date = new Date();
                date.setTime(date.getTime() + options.expiresIn);
                cookie += '; expires=' + date.toGMTString();
            }

            document.cookie = cookie;
        },

        read: function (name) {
            var nameEQ = name + '=';
            var cookies = document.cookie.split(';');
            var cookie;

            for (var i = 0; i < cookies.length; i++) {
                cookie = cookies[i];

                while (cookie.charAt(0) === ' ') {
                    cookie = cookie.substring(1, cookie.length);
                }

                if (cookie.indexOf(nameEQ) === 0) {
                    return cookie.substring(nameEQ.length, cookie.length);
                }
            }

            return null;
        }
    };
});
