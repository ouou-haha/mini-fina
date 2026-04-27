import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import { fetchAccounts } from "../api/accounts";
import { fetchJournalEntries, postJournalEntry } from "../api/journals";
import JournalEntryForm from "../components/JournalEntryForm";

const { Title } = Typography;

export default function JournalsPage() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await fetchJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error(error);
      message.error("加载凭证列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      message.error("加载科目表失败");
    }
  }

  async function handlePost(entryId) {
    try {
      setPostingId(entryId);
      await postJournalEntry(entryId);
      message.success("过账成功");
      await loadEntries();
    } catch (error) {
      console.error(error);
      const detail = error?.response?.data?.detail || "过账失败";
      message.error(detail);
    } finally {
      setPostingId(null);
    }
  }

  useEffect(() => {
    loadEntries();
    loadAccounts();
  }, []);

  const columns = [
    {
      title: "凭证编号",
      dataIndex: "entry_no",
      key: "entry_no",
      width: 140,
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "摘要",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => (
        <Tag color={value === "posted" ? "success" : "warning"}>
          {value === "posted" ? "已过账" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          disabled={record.status === "posted"}
          loading={postingId === record.id}
          onClick={() => handlePost(record.id)}
        >
          过账
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const lineColumns = [
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
        title: "借方",
        dataIndex: "debit",
        key: "debit",
        align: "right",
        render: (value) => Number(value).toFixed(2),
      },
      {
        title: "贷方",
        dataIndex: "credit",
        key: "credit",
        align: "right",
        render: (value) => Number(value).toFixed(2),
      },
      {
        title: "行摘要",
        dataIndex: "description",
        key: "description",
      },
    ];

    const totalDebit = record.lines.reduce(
      (sum, line) => sum + Number(line.debit),
      0
    );
    const totalCredit = record.lines.reduce(
      (sum, line) => sum + Number(line.credit),
      0
    );

    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="借方合计">
            {totalDebit.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="贷方合计">
            {totalCredit.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="是否平衡">
            <Tag color={totalDebit === totalCredit ? "success" : "error"}>
              {totalDebit === totalCredit ? "平衡" : "不平衡"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Table
          rowKey="id"
          columns={lineColumns}
          dataSource={record.lines}
          pagination={false}
          size="small"
        />
      </Space>
    );
  };

  return (
    <Card>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          凭证管理
        </Title>

        <Button type="primary" onClick={() => setFormOpen(true)}>
          新增凭证
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={entries}
        loading={loading}
        expandable={{ expandedRowRender }}
      />

      <JournalEntryForm
        open={formOpen}
        accounts={accounts}
        onCancel={() => setFormOpen(false)}
        onSuccess={async () => {
          setFormOpen(false);
          await loadEntries();
        }}
      />
    </Card>
  );
}