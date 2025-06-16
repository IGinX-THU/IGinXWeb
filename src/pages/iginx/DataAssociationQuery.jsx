import { PageContainer } from '@ant-design/pro-components';
import { ProTable, ProForm, ProFormGroup, ProFormText, Button } from '@ant-design/pro-components';
import API from '@/services/iginx';
import { useRef } from 'react';
import { message, Tooltip } from 'antd';
const columns = [
  {
    title: 'ID',
    dataIndex: 'key',
    key: 'key',
    search: false,
  },
  {
    title: '关键词',
    dataIndex: 'keywords',
    key: 'keywords',
    search: {
      transform: (value) => ({ keywords: value }),
    },
    render: (text) => (
      <Tooltip title={text}>
        <div
          style={{
            display: 'inline-block',
            maxWidth: 200,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </div>
      </Tooltip>
    ),
  },
  {
    title: 'fileName',
    dataIndex: 'fileName',
    key: 'fileName',
    search: false,
  },
  {
    title: 'fileType',
    dataIndex: 'fileType',
    key: 'fileType',
    search: false,
  },
  {
    title: 'filePath',
    dataIndex: 'filePath',
    key: 'filePath',
    search: false,
  },
  {
    title: 'createTime',
    dataIndex: 'createTime',
    key: 'createTime',
    search: false,
  },
];
const DataAssociationQuery = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const tableRef = useRef();

  return (
    <PageContainer>
      <div style={{ marginBottom: 16 }}>{contextHolder}</div>

      <ProTable
        rowKey={(record) => `${record.key}`}
        actionRef={tableRef}
        columns={columns}
        request={async (params) => {
          let result = await API.associationQuery(params);
          console.info('查询结果', result);
          return {
            data: result.data,
            success: result.success,
            total: result.total,
          };
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          pageSize: 5,
          onChange: (page) => console.log(page),
        }}
        headerTitle="文件列表"
        toolBarRender={false}
      />
    </PageContainer>
  );
};

export default DataAssociationQuery;
