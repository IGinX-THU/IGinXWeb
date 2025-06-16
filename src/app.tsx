import { AvatarDropdown, AvatarName, Footer, Question, SelectLang } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React from 'react';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/login';
// import API from '@/services/iginx';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState() {
  // 如果不是登录页面，执行
  const { location } = history;
  console.log(loginPath);
  console.log(location.pathname);
  if (location.pathname !== loginPath) {
    try {
      const { default: API } = await import('@/services/iginx');
      // 每次刷新都重新获取用户信息
      let profile = await API.adminUserProfile();
      if (+profile.resultCode === 200) {
        return {
          currentUser: profile.data,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      }
    } catch (_) {}
    // 如果获取失败,比如token 过期,重定向到登录页面
    // message.error('登录失效，请重新登录！');
    history.replace({
      pathname: loginPath,
      query: {
        to: location.pathname,
      },
    });
  }
  return {
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    title: 'IGinX',
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: 'IGinX',
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        // history.push(loginPath);
        // message.error('登录失效，请重新登录！');
        history.replace({
          pathname: loginPath,
          query: {
            to: location.pathname,
          },
        });
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
// export const request = {
//   ...errorConfig,
// };
export const request = {
  timeout: 60000,
  errorConfig: {
    // errorThrower: (res) => {
    //   const { success, data, errorCode, errorMessage } = res;
    // } ,
    errorHandler: (error: any, opts: any) => {
      // message.error(error.message);
    },
  },
  requestInterceptors: [
    (config) => {
      // 拦截请求配置，进行个性化处理。
      console.info('Intecepter=' + config.url);
      const token = localStorage.getItem('tk');
      if (token && config.url != '/api/adminUser/login') {
        config.headers['token'] = token;
      }
      return config;
    },
  ],
  responseInterceptors: [
    // 不对相应做处理
    (response) => {
      return response;
    },
  ],
};
