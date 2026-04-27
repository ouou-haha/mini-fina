import { useEffect, useState } from "react";
import { Card, Descriptions, Table, Tag, Typography, message } from "antd";
import { fetchTrialBalance } from "../api/reports";

const { Title } = Typography;

export default function TrialBalancePage() {
  const [data, setData] = useState({
    rows: [],
    summary: {
      total_debit: 0,
      total_credit: 0,
      is_balanced: false,
    },
  });

  const [loading, setLoading] = useState(false);

  async function loadTrialBalance() {
    try {
      setLoading(true);
      const result = await fetchTrialBalance();
      setData(result);
    } catch (error) {
      console.error(error);
      message.error("加载试算平衡表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrialBalance();
  }, []);

  const columns = [
    {
      title: "科目编码",
      dataIndex: "account_code",
      key: "account_code",
      width: 120,
    },
    {
      title: "科目名称",
      dataIndex: "account_name",
      key: "account_name",
    },
    {
      title: "科目类型",
      dataIndex: "account_type",
      key: "account_type",
      width: 140,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: "余额方向",
      dataIndex: "normal_balance",
      key: "normal_balance",
      width: 120,
      render: (value) => (
        <Tag color={value === "debit" ? "blue" : "green"}>
          {value === "debit" ? "借方" : "贷方"}
        </Tag>
      ),
    },
    {
      title: "借方发生额",
      dataIndex: "debit",
      key: "debit",
      align: "right",
      render: (value) => Number(value).toFixed(2),
    },
    {
      title: "贷方发生额",
      dataIndex: "credit",
      key: "credit",
      align: "right",
      render: (value) => Number(value).toFixed(2),
    },
    {
      title: "期末余额",
      dataIndex: "ending_balance",
      key: "ending_balance",
      align: "right",
      render: (value) => Number(value).toFixed(2),
    },
  ];

  return (
    <Card>
      <Title level={3}>试算平衡表</Title>

      <Descriptions
        bordered
        size="small"
        column={3}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="借方合计">
          {Number(data.summary.total_debit).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="贷方合计">
          {Number(data.summary.total_credit).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="是否平衡">
          <Tag color={data.summary.is_balanced ? "success" : "error"}>
            {data.summary.is_balanced ? "平衡" : "不平衡"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Table
        rowKey="account_id"
        columns={columns}
        dataSource={data.rows}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}