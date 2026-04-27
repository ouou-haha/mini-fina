import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import { createJournalEntry } from "../api/journals";

const { Text } = Typography;

export default function JournalEntryForm({
  open,
  onCancel,
  onSuccess,
  accounts,
}) {
  const [form] = Form.useForm();

  const watchedLines = Form.useWatch("lines", form) || [];

  const totalDebit = watchedLines.reduce(
    (sum, line) => sum + Number(line?.debit || 0),
    0
  );

  const totalCredit = watchedLines.reduce(
    (sum, line) => sum + Number(line?.credit || 0),
    0
  );

  const difference = totalDebit - totalCredit;
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  async function handleSubmit() {
    try {
      const values = await form.validateFields();

      const payload = {
        date: values.date.format("YYYY-MM-DD"),
        description: values.description,
        lines: values.lines.map((line) => ({
          account_id: line.account_id,
          debit: Number(line.debit || 0),
          credit: Number(line.credit || 0),
          description: line.description || "",
        })),
      };

      await createJournalEntry(payload);

      message.success("凭证创建成功");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      console.error(error);

      if (error?.errorFields) {
        return;
      }

      const detail = error?.response?.data?.detail || "凭证创建失败";
      message.error(detail);
    }
  }

  function handleCancel() {
    form.resetFields();
    onCancel?.();
  }

  return (
    <Modal
      title="新增凭证"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={980}
      okText="保存凭证"
      cancelText="取消"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          lines: [
            {
              debit: 0,
              credit: 0,
            },
            {
              debit: 0,
              credit: 0,
            },
          ],
        }}
      >
        <Form.Item
          label="凭证日期"
          name="date"
          rules={[
            {
              required: true,
              message: "请选择凭证日期",
            },
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="摘要"
          name="description"
          rules={[
            {
              required: true,
              message: "请输入摘要",
            },
          ]}
        >
          <Input placeholder="例如：老板投入资本金" />
        </Form.Item>

        <Divider orientation="left">分录明细</Divider>

        <Form.List
          name="lines"
          rules={[
            {
              validator: async (_, lines) => {
                if (!lines || lines.length < 2) {
                  return Promise.reject(new Error("至少需要两行分录"));
                }

                const debitSum = lines.reduce(
                  (sum, line) => sum + Number(line?.debit || 0),
                  0
                );

                const creditSum = lines.reduce(
                  (sum, line) => sum + Number(line?.credit || 0),
                  0
                );

                if (debitSum <= 0) {
                  return Promise.reject(new Error("借方合计必须大于 0"));
                }

                if (debitSum !== creditSum) {
                  return Promise.reject(
                    new Error(
                      `借贷不平衡：借方 ${debitSum.toFixed(
                        2
                      )}，贷方 ${creditSum.toFixed(2)}`
                    )
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <Space
                  key={field.key}
                  align="baseline"
                  style={{
                    display: "flex",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ width: 32 }}>{index + 1}</Text>

                  <Form.Item
                    {...field}
                    name={[field.name, "account_id"]}
                    rules={[
                      {
                        required: true,
                        message: "请选择科目",
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="选择科目"
                      style={{ width: 240 }}
                      optionFilterProp="label"
                      options={accounts.map((account) => ({
                        value: account.id,
                        label: `${account.code} ${account.name}`,
                      }))}
                    />
                  </Form.Item>

                    <Form.Item
                    {...field}
                    name={[field.name, "debit"]}
                    rules={[
                        {
                        required: true,
                        message: "请输入借方金额",
                        },
                    ]}
                    >
                    <InputNumber
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        addonBefore="借"
                        style={{ width: 140 }}
                    />
                    </Form.Item>

                    <Form.Item
                    {...field}
                    name={[field.name, "credit"]}
                    rules={[
                        {
                        required: true,
                        message: "请输入贷方金额",
                        },
                    ]}
                    >
                    <InputNumber
                        min={0}
                        precision={2}
                        placeholder="0.00"
                        addonBefore="贷"
                        style={{ width: 140 }}
                    />
                    </Form.Item>

                  <Form.Item {...field} name={[field.name, "description"]}>
                    <Input placeholder="行摘要" style={{ width: 240 }} />
                  </Form.Item>

                  {fields.length > 2 ? (
                    <MinusCircleOutlined
                      style={{ color: "#cf1322" }}
                      onClick={() => remove(field.name)}
                    />
                  ) : null}
                </Space>
              ))}

              <Form.ErrorList errors={errors} />

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      debit: 0,
                      credit: 0,
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  添加分录行
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider />

        <Space direction="vertical" style={{ width: "100%" }}>
          <Space size="large">
            <Text strong>借方合计：</Text>
            <Text>{totalDebit.toFixed(2)}</Text>

            <Text strong>贷方合计：</Text>
            <Text>{totalCredit.toFixed(2)}</Text>

            <Text strong>差额：</Text>
            <Text type={difference === 0 ? "success" : "danger"}>
              {difference.toFixed(2)}
            </Text>
          </Space>

          {isBalanced ? (
            <Alert
              type="success"
              showIcon
              message="借贷平衡，可以保存凭证"
            />
          ) : (
            <Alert
              type="warning"
              showIcon
              message="借贷暂未平衡"
              description="请确保借方合计等于贷方合计，并且借方合计大于 0。"
            />
          )}
        </Space>
      </Form>
    </Modal>
  );
}