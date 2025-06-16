import { request } from '@umijs/max';

['GET', 'DELETE', 'HEAD', 'OPTIONS'].forEach((name) => {
  request[name.toLowerCase()] = function (url, options) {
    if (!options) options = {};
    options.method = name;
    return request(url, options);
  };
});
['POST', 'PUT', 'PATCH'].forEach((name) => {
  request[name.toLowerCase()] = function (url, data, options) {
    if (!options) options = {};
    options.method = name;
    options.data = data;
    return request(url, options);
  };
});

export default request;
