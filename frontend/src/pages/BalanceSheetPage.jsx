import { useEffect, useState } from "react";
import { Card, Col, Descriptions, Row, Table, Tag, Typography, message } from "antd";
import { fetchBalanceSheet } from "../api/reports";

const { Title } = Typography;

export default function BalanceSheetPage() {
  const [data, setData] = useState({
    assets: {
      rows: [],
      total: 0,
    },
    liabilities: {
      rows: [],
      total: 0,
    },
    equity: {
      rows: [],
      total_without_retained_earnings: 0,
      retained_earnings: 0,
      total: 0,
    },
    summary: {
      total_assets: 0,
      total_liabilities: 0,
      total_equity: 0,
      right_side_total: 0,
      is_balanced: false,
    },
  });

  const [loading, setLoading] = useState(false);

  async function loadBalanceSheet() {
    try {
      setLoading(true);
      const result = await fetchBalanceSheet();
      setData(result);
    } catch (error) {
      console.error(error);
      message.error("加载资产负债表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBalanceSheet();
  }, []);

  const commonColumns = [
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
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => Number(value).toFixed(2),
    },
  ];

  return (
    <Card>
      <Title level={3}>资产负债表</Title>

      <Descriptions
        bordered
        size="small"
        column={4}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="资产合计">
          {Number(data.summary.total_assets).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="负债合计">
          {Number(data.summary.total_liabilities).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="所有者权益合计">
          {Number(data.summary.total_equity).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="是否平衡">
          <Tag color={data.summary.is_balanced ? "success" : "error"}>
            {data.summary.is_balanced ? "平衡" : "不平衡"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="资产"
            size="small"
            extra={
              <strong>
                合计：{Number(data.assets.total).toFixed(2)}
              </strong>
            }
          >
            <Table
              rowKey={(record) => record.account_code}
              columns={commonColumns}
              dataSource={data.assets.rows}
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="负债"
            size="small"
            style={{ marginBottom: 16 }}
            extra={
              <strong>
                合计：{Number(data.liabilities.total).toFixed(2)}
              </strong>
            }
          >
            <Table
              rowKey={(record) => record.account_code}
              columns={commonColumns}
              dataSource={data.liabilities.rows}
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>

          <Card
            title="所有者权益"
            size="small"
            extra={
              <strong>
                合计：{Number(data.equity.total).toFixed(2)}
              </strong>
            }
          >
            <Table
              rowKey={(record) => record.account_code}
              columns={commonColumns}
              dataSource={data.equity.rows}
              loading={loading}
              pagination={false}
              size="small"
            />

            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="权益类科目合计">
                {Number(data.equity.total_without_retained_earnings).toFixed(2)}
              </Descriptions.Item>

              <Descriptions.Item label="未分配利润">
                {Number(data.equity.retained_earnings).toFixed(2)}
              </Descriptions.Item>

              <Descriptions.Item label="权益合计">
                {Number(data.equity.total).toFixed(2)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}