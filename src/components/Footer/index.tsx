import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'IGinX',
          title: 'IGinX',
          href: 'https://github.com/IGinX-THU/IGinX',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/IGinX-THU/IGinX',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
