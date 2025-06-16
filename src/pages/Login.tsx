import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel, useSearchParams } from '@umijs/max';
import { Tabs, message, theme } from 'antd';
import Footer from '@/components/Footer/index';
import API from '@/services/iginx';
import md5 from 'blueimp-md5';
import { flushSync } from 'react-dom';

import { useState, useRef, useEffect } from 'react';
import React from 'react';

type LoginType = 'phone' | 'account';

export default () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();
  const [loginType, setLoginType] = useState<LoginType>('account');
  //解析问号传递的参数，登陆成功后直接进入to参数指定的页面
  const [usp] = useSearchParams();
  // 获取用户信息
  const { initialState, setInitialState } = useModel('@@initialState');
  // 创建表单对象
  const formRef = useRef(null);
  let char = '******';
  useEffect(() => {
    // 自动登录
    let autoLogin = Boolean(localStorage.getItem('autoLogin'));
    if (!autoLogin) return;
    let username = localStorage.getItem('username');
    formRef.current?.setFieldsValue({ username, char, autoLogin: true });
  }, []);

  const submit = async (values: any) => {
    let { autoLogin, username, password } = values;
    // 密码加密
    if (password != char) {
      password = md5(password);
    } else {
      password = localStorage.getItem('password');
    }

    try {
      let { resultCode, data, msg } = await API.AdminUserlogin(username, password);
      console.log('登录', resultCode, data, msg);
      if (+resultCode != 200) {
        messageApi.success('登录失败！');
      }

      // 存储token
      localStorage.setItem('tk', data);
      // 带token获取用户信息
      let profile = await API.adminUserProfile();
      console.log('登录', profile);
      // 同步存储用户信息 ,执行完更新状态后再向下执行
      flushSync(() => {
        setInitialState({ ...initialState, currentUser: profile.data });
      });

      //是否自动登录
      if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
      }
      messageApi.success('登录成功');
      // 跳转到首页或者to参数指定的页面
      let to = usp.get('to');
      //console.info('登录 to=' + to);
      to ? history.replace(to) : history.replace('/');
    } catch (_) {
      messageApi.error('登录失败！');
    }
  };

  return (
    <ProConfigProvider hashed={false}>
      <div style={{ backgroundColor: token.colorBgContainer }}>
        {contextHolder}
        <LoginForm
          title="IGinX"
          subTitle="一个开源的多模态存储系统"
          onFinish={submit}
          formRef={formRef}
        >
          <Tabs
            centered
            activeKey={loginType}
            onChange={(activeKey) => setLoginType(activeKey as LoginType)}
          >
            <Tabs.TabPane key={'account'} tab={'账号密码登录'} />
            <Tabs.TabPane key={'phone'} tab={'手机号登录'} disabled />
          </Tabs>
          {loginType === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={'prefixIcon'} />,
                }}
                placeholder={'用户名: admin or user'}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                  strengthText:
                    'Password should contain numbers, letters and special characters, at least 8 characters long.',
                  statusRender: (value) => {
                    const getStatus = () => {
                      if (value && value.length > 12) {
                        return 'ok';
                      }
                      if (value && value.length > 6) {
                        return 'pass';
                      }
                      return 'poor';
                    };
                    const status = getStatus();
                    if (status === 'pass') {
                      return <div style={{ color: token.colorWarning }}>强度：中</div>;
                    }
                    if (status === 'ok') {
                      return <div style={{ color: token.colorSuccess }}>强度：强</div>;
                    }
                    return <div style={{ color: token.colorError }}>强度：弱</div>;
                  },
                }}
                placeholder={'密码: ant.design'}
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
            </>
          )}
          {loginType === 'phone' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={'prefixIcon'} />,
                }}
                name="mobile"
                placeholder={'手机号'}
                rules={[
                  {
                    required: true,
                    message: '请输入手机号！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'获取验证码'}`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
                onGetCaptcha={async () => {
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </ProConfigProvider>
  );
};
