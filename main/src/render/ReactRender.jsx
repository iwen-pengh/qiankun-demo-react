import React from 'react';
import ReactDOM from 'react-dom';
import { Menu } from 'antd';
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import './index.css';
/**
 * 渲染子应用
 */

function Render(props) {
  const { loading } = props;

  const handleClick = e => {
    console.log('click ', e);
    window.history.pushState(null, e.key, e.key) 
  };

  return (
    <>
      <Menu onClick={(e) => {handleClick(e)}} mode="horizontal">
        <Menu.Item key="/react1" icon={<MailOutlined />}>
          react1
        </Menu.Item>
        <Menu.Item key="/react2" icon={<AppstoreOutlined />}>
          react2
        </Menu.Item>
        <Menu.Item key="/purehtml" icon={<AppstoreOutlined />}>
        html
        </Menu.Item>
      </Menu>
      {loading && <h4 className="subapp-loading">Loading...</h4>}
      <div id="subapp-viewport" />
    </>
  );
}

export default function render({ loading }) {
  const container = document.getElementById('subapp-container');
  ReactDOM.render(<Render loading={loading} />, container);
}
