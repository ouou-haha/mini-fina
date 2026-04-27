import { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, message } from "antd";
import { fetchAccounts } from "../api/accounts";

const { Title } = Typography;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      message.error("加载科目表失败，请检查后端服务是否启动");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  const columns = [
    {
      title: "科目编码",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "科目名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "科目类型",
      dataIndex: "type",
      key: "type",
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: "正常余额方向",
      dataIndex: "normal_balance",
      key: "normal_balance",
      render: (value) => (
        <Tag color={value === "debit" ? "blue" : "green"}>
          {value === "debit" ? "借方" : "贷方"}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "is_active",
      key: "is_active",
      render: (value) => (
        <Tag color={value ? "success" : "default"}>
          {value ? "启用" : "停用"}
        </Tag>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>科目表</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={accounts}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}