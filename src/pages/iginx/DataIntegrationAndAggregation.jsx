import { PageContainer } from '@ant-design/pro-components';
import { ProTable, ProForm, ProFormGroup, ProFormText, Button } from '@ant-design/pro-components';
import API from '@/services/iginx';
import { useRef } from 'react';
import { message } from 'antd';

export const waitTimePromise = async (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const waitTime = async (time = 100) => {
  await waitTimePromise(time);
};

const columns = [
  {
    title: 'IP',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: 'Port',
    dataIndex: 'port',
    key: 'port',
  },
  {
    title: '数据源名称',
    dataIndex: 'prefix',
    key: 'prefix',
  },
  {
    title: '数据源类型',
    dataIndex: 'type',
    key: 'type',
  },
];
const DataIntegrationAndAggregation = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const formRef = useRef();
  const tableRef = useRef();

  const submitForm = async (formData) => {
    try {
      let result = await API.addStorageEngines(formData);
      if (result === 'success') {
        console.info(result);
        if (tableRef.current) {
          messageApi.success('添加成功');
          tableRef.current.reload();
        }
      }
    } catch (error) {
      messageApi.error('添加失败');
    }

    return true;
  };

  return (
    <PageContainer>
      <div style={{ marginBottom: 16 }}>{contextHolder}</div>
      <ProForm
        formRef={formRef}
        name="add-storage-engines"
        submitter={{
          // 将按钮渲染在表单内
          render: (props, doms) => {
            return [
              <ProFormText
                key="dir-input"
                width="lg"
                name="dir"
                label="文件路径"
                placeholder="请输入文件路径,例如 /mnt/mydisk/data"
                rules={[{ required: true, message: '请输入文件路径' }]}
              />,
              ...doms,
            ];
          },
          // 重置按钮配置
          resetButtonProps: {
            style: {
              marginRight: 8,
            },
          },
          // 提交按钮配置
          submitButtonProps: {
            type: 'primary',
          },
          // 按钮容器样式
          searchConfig: {
            submitText: '提交',
            resetText: '重置',
          },
        }}
        onFinish={submitForm}
      ></ProForm>
      <ProTable
        rowKey={(record) => `${record.ip}:${record.port}`}
        actionRef={tableRef}
        columns={columns}
        request={async (params) => {
          let result = await API.getStorageEngines();
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
        headerTitle="数据源列表"
        search={false}
        toolBarRender={false}
      />
    </PageContainer>
  );
};

export default DataIntegrationAndAggregation;
