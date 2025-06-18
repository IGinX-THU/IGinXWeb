import request from './request';

// 用户登录
const AdminUserlogin = (userName, passwordMd5) => {
  return request.post('/api/adminUser/login', { userName, passwordMd5 });
};

// 获取用户信息
const adminUserProfile = () => {
  return request.get('/api/adminUser/profile').then(({ resultCode, data }) => {
    console.info('resultCode=' + resultCode);
    console.info('data=' + data);
    if (data) {
      data = {
        ...data,
        name: data.nickName,
        avatar: '',
      };
    }
    return { resultCode, data };
  });
};

// 数据接入及汇聚
const addStorageEngines = (values) => {
  console.info('addStorageEngines' + values);
  return request.post('/api/iginx/addStorageEngines', values);
};

// 查询数据源信息
const getStorageEngines = () => {
  return request.get('/api/iginx/clusterInfo');
};

// 数据存储
const addNewFile = (file) => {
  console.log('File对象:', file instanceof File);
  const formData = new FormData();
  formData.append('file', file);

  return request.post('/api/iginx/addNewFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // 明确指定
    },
  });
};

// 关联查询
const associationQuery = (params) => {
  console.info('associationQuerys' + params);
  if (!params.keywords) {
    params.keyword = '';
  } else {
    params.keyword = params.keywords;
  }

  return request.get(
    '/api/iginx/associationQuery?current=' +
      params.current +
      '&pageSize=' +
      params.pageSize +
      '&keyword=' +
      params.keyword,
  );
};

// 查询脚本
const fetchScripts = (params) => {
  return request.post('/api/iginx/scripts/query', params);
};

// 新增脚本
const uploadScript = (uploadType, values) => {
  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('description', values.description || '');
  formData.append('type', uploadType);
  formData.append('className', values.className);
  formData.append('functionName', values.functionName);

  if (uploadType === 'UDF') {
    formData.append('udfType', values.udfType);
    formData.append('udfScript', values.file[0].originFileObj);
  } else {
    formData.append('transformScript', values.scripts[0].originFileObj);
  }

  return request.post('/api/iginx/scripts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 跳转到编辑脚本页，获取脚本内容
const handleEdit = (scriptId) => {
  return request.get('/api/iginx/scripts/' + scriptId);
};

// 保存编辑脚本
const handleSave = (currentScriptId, updatedScript) => {
  return request.put('/api/iginx/scripts/' + currentScriptId, updatedScript);
};

const handleRegister = (script) => {
  return request.put('/api/iginx/scripts/register/' + script.id, script);
};

const handleDelete = (scriptId) => {
  return request.delete('/api/iginx/scripts/delete/' + scriptId);
};

const handleExecute = (script) => {
  return request.post('/api/iginx/scripts/execute', script);
};

export default {
  AdminUserlogin,
  adminUserProfile,
  getStorageEngines,
  addStorageEngines,
  addNewFile,
  associationQuery,
  fetchScripts,
  uploadScript,
  handleEdit,
  handleSave,
  handleExecute,
  handleRegister,
  handleDelete,
};
