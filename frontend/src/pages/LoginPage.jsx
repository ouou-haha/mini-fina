import { Button, Card, Form, Input, Typography, message } from "antd";
import { login } from "../api/auth";

const { Title, Text } = Typography;

export default function LoginPage({ onLoginSuccess }) {
  const [form] = Form.useForm();

  async function handleSubmit(values) {
    try {
      const result = await login(values.username, values.password);

      localStorage.setItem("mini_ledger_token", result.access_token);
      localStorage.setItem("mini_ledger_user", JSON.stringify(result.user));

      message.success("登录成功");

      onLoginSuccess?.(result.user);
    } catch (error) {
      console.error(error);
      const detail = error?.response?.data?.detail || "登录失败";
      message.error(detail);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          MiniLedger 登录
        </Title>

        <Text type="secondary">
          默认账号：admin，密码：123456
        </Text>

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              {
                required: true,
                message: "请输入用户名",
              },
            ]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
            ]}
          >
            <Input.Password placeholder="123456" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}