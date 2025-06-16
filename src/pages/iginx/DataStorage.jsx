import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

import { ProForm, ProFormUploadDragger } from '@ant-design/pro-components';
import { Switch, Avatar, List, message } from 'antd';
import { useState } from 'react';
import API from '@/services/iginx';
import {
  CodeOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  FileOutlined,
} from '@ant-design/icons';

export const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
let data = [];

const DataStorage = () => {
  const [listData, setListData] = useState([]);
  const getFileIcon = (filename) => {
    if (!filename) return null;

    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'json':
        return <Avatar icon={<CodeOutlined />} style={{ backgroundColor: '#f56a00' }} />;
      case 'xml':
        return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'mp3':
        return <Avatar icon={<CustomerServiceOutlined />} style={{ backgroundColor: '#722ed1' }} />;
      case 'mp4':
      case 'avi':
        return <Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#13c2c2' }} />;
      default:
        return <Avatar icon={<FileOutlined />} style={{ backgroundColor: '#d9d9d9' }} />;
    }
  };

  return (
    <PageContainer>
      <div
        style={{
          padding: 24,
        }}
      >
        <ProForm
          name="validate_other"
          onValuesChange={(_, values) => {
            console.log(values);
          }}
          onFinish={async (values) => {
            const files = values['drag-pic'];
            if (!files || files.length === 0) {
              message.warning('请先选择文件');
              return;
            }

            // 获取原始文件对象
            const file = files[0].originFileObj;
            if (!(file instanceof File)) {
              message.error('无效的文件对象');
              return;
            }
            let result = await API.addNewFile(file);
            console.log(result);
            setListData(result.data);
          }}
        >
          <ProFormUploadDragger name="drag-pic" label="可上传 JSON/XML/音频/图像/视频" />
        </ProForm>
        <List
          itemLayout="horizontal"
          dataSource={listData}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={getFileIcon(item.fileName)}
                title={<a href="https://ant.design">{item.fileName}</a>}
                description={item.labels}
              />
            </List.Item>
          )}
        />
      </div>
    </PageContainer>
  );
};

export default DataStorage;
