import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Button,
  Form,
  Input,
  Upload,
  message,
  Table,
  Modal,
  Tag,
  Space,
  Divider,
  Flex,
  Radio,
  Select,
  Tabs,
  Row,
  Col,
  Alert,
  DatePicker,
} from 'antd';
import {
  UploadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import API from '@/services/iginx';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DataGovernance = () => {
  // const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [scripts, setScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [executionResult, setExecutionResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('UDF');
  const [activeScriptFile, setActiveScriptFile] = useState(0);
  const editorRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [debugLoading, setDebugLoading] = useState(false);

  // 定义统一的label样式
  const formItemLayout = {
    labelCol: {
      span: 6, // 固定label宽度
      style: {
        textAlign: 'right',
        paddingRight: 8,
        whiteSpace: 'nowrap', // 防止label换行
      },
    },
    wrapperCol: { span: 18 }, // 内容区域宽度
  };

  // 新增分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 新增查询条件状态
  const [queryParams, setQueryParams] = useState({
    name: '',
    type: undefined,
    status: undefined,
    startTime: null,
    endTime: null,
  });

  useEffect(() => {
    fetchScripts();
  }, [pagination.current, pagination.pageSize, queryParams]); // 依赖分页和查询条件

  const fetchScripts = async () => {
    setLoading(true);
    try {
      // 构造查询参数
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...queryParams,
        // 转换时间格式
        startTime: queryParams.startTime
          ? queryParams.startTime.format('YYYY-MM-DD hh:mm:ss')
          : null,
        endTime: queryParams.endTime ? queryParams.endTime.format('YYYY-MM-DD hh:mm:ss') : null,
      };

      const response = await API.fetchScripts(params);
      if (response.success == true) {
        setScripts(response.data || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
        });
      } else {
        messageApi.error('获取脚本列表失败');
      }
    } catch (error) {
      messageApi.error('获取脚本列表失败');
    } finally {
      setLoading(false);
    }
  };
  // 新增：处理查询表单提交
  const handleQuerySubmit = (values) => {
    const { name, type, status, timeRange } = values;

    setQueryParams({
      name: name || '',
      type: type,
      status: status,
      startTime: timeRange ? timeRange[0] : null,
      endTime: timeRange ? timeRange[1] : null,
    });

    // 重置到第一页
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 新增：重置查询条件
  const handleResetQuery = () => {
    queryForm.resetFields();
    setQueryParams({
      name: '',
      type: undefined,
      status: undefined,
      startTime: null,
      endTime: null,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // 处理分页变化
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const handleEdit = async (script) => {
    setLoading(true);
    try {
      const response = await API.handleEdit(script.id);
      if (response.success == true) {
        setCurrentScript(response.data);
        setEditorValue(response.data.content || ''); // 直接使用API返回的数据
        setIsEditing(true);
      } else {
        messageApi.error('获取脚本内容失败');
      }
    } catch (error) {
      messageApi.error('获取脚本内容失败');
    } finally {
      setLoading(false);
    }
  };

  // 调试函数
  const handleDebug = async () => {
    setDebugLoading(true);
    try {
      const newContent = editorRef.current?.getValue();
      const debugScript = {
        ...currentScript,
        content: newContent,
      };

      const response = await API.handleExecute(debugScript);
      if (response.success == true) {
        setExecutionResult(`执行 ${currentScript.name} 的结果:\n${response.data.executeResult}\n`);
      } else {
        setExecutionResult('执行脚本失败');
      }
    } catch (error) {
      setExecutionResult('执行脚本失败');
    } finally {
      setDebugLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const newContent = editorRef.current?.getValue();
      // const description = form.getFieldValue('description');

      let updatedScript;
      updatedScript = {
        ...currentScript,
        // description,
        content: newContent,
      };

      // 调用更新接口
      let response = await API.handleSave(currentScript.id, updatedScript);
      if (response.success == true) {
        messageApi.success('脚本保存成功！');
        // 不再关闭编辑页面
        // 更新当前脚本状态
        setCurrentScript(updatedScript);
      }
    } catch (error) {
      messageApi.error('保存脚本失败');
    }
  };

  const handleRegister = async (script) => {
    setLoading(true);
    try {
      // 假设存在注册接口
      const response = await API.handleRegister(script);
      if (response.success) {
        messageApi.success('脚本注册成功！');
        fetchScripts(); // 刷新脚本列表
      } else {
        messageApi.error('脚本注册失败');
      }
    } catch (error) {
      messageApi.error('脚本注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (script) => {
    setLoading(true);
    try {
      // 假设存在删除接口
      const response = await API.handleDelete(script.id);
      if (response.success) {
        messageApi.success('脚本删除成功！');
        fetchScripts(); // 刷新脚本列表
      } else {
        messageApi.error('脚本删除失败');
      }
    } catch (error) {
      messageApi.error('脚本删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values) => {
    const { name, description, file, udfType, className, functionName } = values;

    try {
      const response = await API.uploadScript(uploadType, values);
      if (response.success == true) {
        messageApi.success(`脚本 ${name} 上传成功！`);
        setIsUploadModalVisible(false);
        uploadForm.resetFields();
        fetchScripts();
      } else {
        messageApi.error('上传脚本失败');
      }
    } catch (error) {
      messageApi.error('上传脚本失败');
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: () => {
        return {
          suggestions: [
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'print(${1:value})',
              documentation: '打印输出',
            },
            {
              label: 'import',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'import ',
              documentation: '导入模块',
            },
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}',
              documentation: '定义函数',
            },
          ],
        };
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '脚本名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '脚本类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <Tag color={type === 'UDF' ? 'blue' : 'purple'}>{type}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'gray'}>
          {status === 'ACTIVE' ? '已注册' : '未注册'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 'ACTIVE' ? (
            <Button danger size="small" onClick={() => handleDelete(record)}>
              删除
            </Button>
          ) : (
            <Button primary size="small" onClick={() => handleRegister(record)}>
              注册
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleExecute(record)}
          >
            执行
          </Button>
        </Space>
      ),
    },
  ];

  const [currentDescription, setCurrentDescription] = useState('');

  const udfDescriptions = {
    UDTF: 'UDTF (user-defined time series function) - 接受一行数据输入，并产生一行数据输出。',
    UDAF: 'UDAF (user-defined aggregate function) - 接受多行数据输入，并产生一行数据输出。',
    UDSF: 'UDSF (user-defined set transform function) - 接受多行数据输入，并产生多行数据输出。',
  };

  const handleTypeChange = (value) => {
    setCurrentDescription(udfDescriptions[value] || '');
    uploadForm.setFieldsValue({ udfType: value });
  };
  // 查询表单
  const renderQueryForm = () => (
    <Card bordered={false} style={{ marginBottom: 24 }}>
      <Form form={queryForm} onFinish={handleQuerySubmit}>
        <Row gutter={[16, 16]}>
          {/* 算法名称 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="name" label="算法名称" {...formItemLayout}>
              <Input placeholder="请输入算法名称" allowClear />
            </Form.Item>
          </Col>

          {/* 类型 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="type" label="类型" {...formItemLayout}>
              <Select placeholder="请选择类型" allowClear>
                <Option value="UDF">UDF</Option>
                <Option value="Transform">Transform</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* 创建时间 */}
          <Col xs={24} sm={24} md={16} lg={12}>
            <Form.Item name="timeRange" label="创建时间" {...formItemLayout}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始时间', '结束时间']}
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>
          </Col>

          {/* 状态 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="status" label="状态" {...formItemLayout}>
              <Select placeholder="请选择状态" allowClear>
                <Option value="ACTIVE">已注册</Option>
                <Option value="INACTIVE">未注册</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24} style={{ textAlign: 'right' }}>
            <Form.Item wrapperCol={{ span: 24 }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleResetQuery}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
  const renderUDFFields = () => (
    <>
      <Form.Item
        name="udfType"
        label="UDF类型"
        rules={[{ required: true, message: '请选择UDF类型' }]}
      >
        <Row gutter={16} align="middle">
          <Col span={5}>
            <Select
              placeholder="选择UDF类型"
              value={uploadForm.getFieldValue('udfType')}
              onChange={handleTypeChange}
            >
              <Option value="UDTF">UDTF</Option>
              <Option value="UDAF">UDAF</Option>
              <Option value="UDSF">UDSF</Option>
            </Select>
          </Col>
          <Col span={18}>
            {currentDescription && (
              <Alert message={currentDescription} type="info" showIcon style={{ marginTop: 4 }} />
            )}
          </Col>
        </Row>
      </Form.Item>

      <Form.Item
        name="file"
        label="Python文件"
        rules={[{ required: true, message: '请选择Python文件' }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload accept=".py" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Form.Item>
    </>
  );

  const renderTransformFields = () => (
    <>
      <Form.Item
        name="scripts"
        label="Python脚本"
        rules={[{ required: true, message: '请选择Python脚本' }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload accept=".py" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      </Form.Item>
    </>
  );

  return (
    <PageContainer>
      <div style={{ marginBottom: 16 }}>{contextHolder}</div>
      {/* 渲染查询表单 */}
      {renderQueryForm()}
      <Card
        title="Python算法管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            上传新脚本
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={scripts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={`编辑脚本: ${currentScript?.name || ''}`}
        open={isEditing}
        width="80%"
        style={{ top: 20 }}
        onCancel={() => setIsEditing(false)}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setIsEditing(false);
              setExecutionResult(null);
            }}
          >
            关闭
          </Button>,
          <Button
            key="debug"
            type="primary"
            onClick={handleDebug}
            loading={debugLoading}
            icon={<PlayCircleOutlined />}
          >
            调试
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            保存
          </Button>,
        ]}
        destroyOnClose
      >
        <div style={{ height: '40vh', border: '1px solid #d9d9d9', marginBottom: 16 }}>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={editorValue}
            onChange={setEditorValue}
            onMount={handleEditorDidMount}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: true },
            }}
          />
        </div>
        <Divider />
        {/* 调试结果展示区域 */}
        <span
          style={{
            color: 'rgba(0, 0, 0, 0.88)',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
            display: 'block',
            marginBottom: '16px',
          }}
        >
          调试结果
        </span>
        <div
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 4,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            minHeight: 100,
            maxHeight: '20vh',
            overflow: 'auto',
          }}
        >
          {executionResult || '调试结果将显示在这里...'}
        </div>
      </Modal>

      <Modal
        title="上传Python脚本"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onOk={() => uploadForm.submit()}
        destroyOnClose
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ type: 'UDF' }}
        >
          <Form.Item
            name="type"
            label="脚本类型"
            rules={[{ required: true, message: '请选择脚本类型' }]}
          >
            <Radio.Group
              onChange={(e) => setUploadType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio value="UDF">UDF</Radio>
              <Radio value="Transform">Transform</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="name"
            label="脚本名称"
            rules={[{ required: true, message: '请输入脚本名称' }]}
          >
            <Input placeholder="输入脚本名称" />
          </Form.Item>

          <Form.Item name="description" label="脚本描述">
            <Input.TextArea rows={2} placeholder="输入脚本描述" />
          </Form.Item>
          <Form.Item
            name="className"
            label="类名"
            rules={[{ required: true, message: '请输入类名' }]}
          >
            <Input placeholder="输入类名" />
          </Form.Item>
          <Form.Item
            name="functionName"
            label="函数名"
            rules={[{ required: true, message: '请输入函数名' }]}
          >
            <Input placeholder="输入函数名" />
          </Form.Item>

          {uploadType === 'UDF' ? renderUDFFields() : renderTransformFields()}

          <Form.Item>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              <h4>上传说明：</h4>
              <ul>
                <li>仅支持.py文件</li>
                <li>文件大小不超过10MB</li>
                {uploadType === 'UDF' ? (
                  <li>UDF脚本必须包含指定的类名和函数名</li>
                ) : (
                  <>
                    <li>Transform类型需要上传多个Python脚本和一个YAML配置文件</li>
                    <li>YAML文件用于定义数据处理流水线</li>
                  </>
                )}
              </ul>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DataGovernance;
