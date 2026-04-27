import { useState } from "react";
import { Button, Layout, Menu, Space, Typography } from "antd";

import AccountsPage from "./pages/AccountsPage";
import JournalsPage from "./pages/JournalsPage";
import TrialBalancePage from "./pages/TrialBalancePage";
import IncomeStatementPage from "./pages/IncomeStatementPage";
import BalanceSheetPage from "./pages/BalanceSheetPage";
import LoginPage from "./pages/LoginPage";

import "antd/dist/reset.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const savedUser = localStorage.getItem("mini_ledger_user");

  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : null
  );

  const [selectedKey, setSelectedKey] = useState("accounts");

  function handleLogout() {
    localStorage.removeItem("mini_ledger_token");
    localStorage.removeItem("mini_ledger_user");
    setUser(null);
  }

  function renderPage() {
    if (selectedKey === "accounts") {
      return <AccountsPage />;
    }

    if (selectedKey === "journals") {
      return <JournalsPage />;
    }

    if (selectedKey === "trial-balance") {
      return <TrialBalancePage />;
    }

    if (selectedKey === "income-statement") {
      return <IncomeStatementPage />;
    }

    if (selectedKey === "balance-sheet") {
      return <BalanceSheetPage />;
    }

    return <AccountsPage />;
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(loginUser) => setUser(loginUser)} />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220}>
        <div style={{ padding: 16 }}>
          <Title level={4} style={{ color: "white", margin: 0 }}>
            MiniLedger
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: "accounts",
              label: "科目表",
            },
            {
              key: "journals",
              label: "凭证管理",
            },
            {
              key: "trial-balance",
              label: "试算平衡表",
            },
            {
              key: "income-statement",
              label: "利润表",
            },
            {
              key: "balance-sheet",
              label: "资产负债表",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            paddingLeft: 24,
            paddingRight: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            入门财务系统
          </Title>

          <Space>
            <Text>当前用户：{user.username}</Text>
            <Button onClick={handleLogout}>退出登录</Button>
          </Space>
        </Header>

        <Content style={{ margin: 24 }}>{renderPage()}</Content>
      </Layout>
    </Layout>
  );
}

export default App;