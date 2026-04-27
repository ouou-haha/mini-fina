import { useEffect, useState } from "react";
import { Card, Descriptions, Table, Tag, Typography, message } from "antd";
import { fetchIncomeStatement } from "../api/reports";

const { Title } = Typography;

export default function IncomeStatementPage() {
  const [data, setData] = useState({
    rows: [],
    summary: {
      total_revenue: 0,
      total_expense: 0,
      net_income: 0,
    },
  });

  const [loading, setLoading] = useState(false);

  async function loadIncomeStatement() {
    try {
      setLoading(true);
      const result = await fetchIncomeStatement();
      setData(result);
    } catch (error) {
      console.error(error);
      message.error("加载利润表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncomeStatement();
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
      render: (value) => (
        <Tag color={value === "revenue" ? "green" : "orange"}>
          {value === "revenue" ? "收入" : "费用"}
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
      title: "利润表金额",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => Number(value).toFixed(2),
    },
  ];

  return (
    <Card>
      <Title level={3}>利润表</Title>

      <Descriptions
        bordered
        size="small"
        column={3}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="营业收入">
          {Number(data.summary.total_revenue).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="成本费用">
          {Number(data.summary.total_expense).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="净利润">
          <span
            style={{
              fontWeight: 600,
              color: Number(data.summary.net_income) >= 0 ? "#1677ff" : "#cf1322",
            }}
          >
            {Number(data.summary.net_income).toFixed(2)}
          </span>
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