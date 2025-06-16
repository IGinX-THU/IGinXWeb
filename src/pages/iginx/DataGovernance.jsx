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
} from 'antd';
import { UploadOutlined, EditOutlined, PlayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import API from '@/services/iginx';

const { TabPane } = Tabs;
const { Option } = Select;

const DataGovernance = () => {
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [scripts, setScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [executionResult, setExecutionResult] = useState('');
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('UDF');
  const [activeScriptFile, setActiveScriptFile] = useState(0);
  const editorRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    setLoading(true);
    // setTimeout(() => {
    //   setScripts([
    //     {
    //       id: 1,
    //       name: '聚类算法',
    //       type: 'UDF',
    //       description: '用于从各中文件中提取的关键信息进行聚类分析的Python脚本',
    //       createdAt: '2023-06-01',
    //       udfType: 'UDAF',
    //       className: 'ClusterAlgorithm',
    //       functionName: 'execute_cluster',
    //     },
    //     {
    //       id: 2,
    //       name: '数据转换',
    //       type: 'Transform',
    //       description: '多步骤数据转换脚本',
    //       createdAt: '2023-06-05',
    //       files: [
    //         { name: 'preprocess.py', content: '# 预处理脚本' },
    //         { name: 'feature_eng.py', content: '# 特征工程脚本' },
    //         { name: 'pipeline.yaml', content: '# 配置流水线' },
    //       ],
    //     },
    //     {
    //       id: 3,
    //       name: 'test2',
    //       type: 'UDF',
    //       description: '测试脚本',
    //       createdAt: '2023-06-10',
    //       udfType: 'UDSF',
    //       className: 'TestClass',
    //       functionName: 'test_function',
    //     },
    //   ]);
    //   setLoading(false);
    // }, 800);
    try {
      const response = await API.fetchScripts();
      if (response.success == true) {
        setScripts(response.data);
      } else {
        messageApi.error('获取脚本列表失败');
      }
    } catch (error) {
      messageApi.error('获取脚本列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (script) => {
    setLoading(true);
    // setCurrentScript(script);
    try {
      const response = await API.handleEdit(script.id);
      if (response.success == true) {
        setCurrentScript(response.data);
      } else {
        messageApi.error('获取脚本内容失败');
      }
    } catch (error) {
      messageApi.error('获取脚本内容失败');
    } finally {
      setLoading(false);
    }

    if (script.type === 'Transform') {
      // 对于Transform类型，默认显示第一个文件
      setEditorValue(currentScript.files[0].content);
      setActiveScriptFile(0);
    } else {
      // UDF类型
      setEditorValue(`${currentScript.content}`);
    }

    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const newContent = editorRef.current?.getValue();
      const description = form.getFieldValue('description');

      let updatedScript;
      if (currentScript.type === 'Transform') {
        // 更新当前编辑的文件内容
        const updatedFiles = [...currentScript.files];
        updatedFiles[activeScriptFile] = {
          ...updatedFiles[activeScriptFile],
          content: newContent,
        };

        updatedScript = {
          ...currentScript,
          description,
          files: updatedFiles,
        };
      } else {
        // UDF类型
        updatedScript = {
          ...currentScript,
          description,
          content: newContent,
        };
      }

      // 调用更新接口
      let response = await API.handleSave(currentScript.id, updatedScript);
      if (response.success == true) {
        messageApi.success('脚本保存成功！');
        setIsEditing(false);
        setCurrentScript(null);
        fetchScripts();
      }
    } catch (error) {
      messageApi.error('保存脚本失败');
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
      } else {
        messageApi.error('上传脚本失败');
      }
    } catch (error) {
      messageApi.error('上传脚本失败');
    }
  };

  const handleExecute = async (script) => {
    console.info(script);
    try {
      const response = await API.handleExecute(script);
      if (response.success == true) {
        messageApi.success(`执行脚本 ${script.name} 成功！`);
        setExecutionResult(`执行 ${script.name} 的结果:\n${response.data.executeResult}\n`);
        setIsResultModalVisible(true);
      } else {
        messageApi.error('执行脚本失败');
      }
    } catch (error) {
      messageApi.error('执行脚本失败');
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
      key: 'status',
      render: () => <Tag color="green">已注册</Tag>,
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
      <Form.Item name="className" label="类名" rules={[{ required: true, message: '请输入类名' }]}>
        <Input placeholder="输入UDF类名" />
      </Form.Item>
      <Form.Item
        name="functionName"
        label="函数名"
        rules={[{ required: true, message: '请输入函数名' }]}
      >
        <Input placeholder="输入UDF函数名" />
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
        <Upload accept=".py" beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />}>选择多个脚本</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="configFile"
        label="YAML配置文件"
        rules={[{ required: true, message: '请选择YAML配置文件' }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload accept=".yaml,.yml" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>选择配置文件</Button>
        </Upload>
      </Form.Item>
    </>
  );

  return (
    <PageContainer>
      <div style={{ marginBottom: 16 }}>{contextHolder}</div>
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
          pagination={false}
        />
      </Card>

      <Modal
        title={`编辑脚本: ${currentScript?.name || ''}`}
        open={isEditing}
        width="80%"
        style={{ top: 20 }}
        onCancel={() => setIsEditing(false)}
        onOk={handleSave}
        destroyOnClose
      >
        {currentScript?.type === 'Transform' && (
          <Tabs
            activeKey={String(activeScriptFile)}
            onChange={(key) => {
              setActiveScriptFile(Number(key));
              setEditorValue(currentScript.files[Number(key)].content);
            }}
            style={{ marginBottom: 16 }}
          >
            {currentScript.files.map((file, index) => (
              <TabPane tab={file.name} key={String(index)} />
            ))}
          </Tabs>
        )}

        <div style={{ height: '50vh', border: '1px solid #d9d9d9', marginBottom: 16 }}>
          <Editor
            height="100%"
            language={
              currentScript?.files?.[activeScriptFile]?.name.endsWith('.yaml') ? 'yaml' : 'python'
            }
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
        <Form layout="vertical">
          <Form.Item label="脚本描述" name="description" initialValue={currentScript?.description}>
            <Input.TextArea rows={2} placeholder="输入脚本描述" />
          </Form.Item>
        </Form>
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

      <Modal
        title="脚本执行结果"
        open={isResultModalVisible}
        width="60%"
        onCancel={() => setIsResultModalVisible(false)}
        footer={null}
      >
        <div
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 4,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            minHeight: 300,
            maxHeight: '60vh',
            overflow: 'auto',
          }}
        >
          {executionResult}
        </div>
        <Divider />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="primary" onClick={() => setIsResultModalVisible(false)}>
            关闭
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default DataGovernance;
