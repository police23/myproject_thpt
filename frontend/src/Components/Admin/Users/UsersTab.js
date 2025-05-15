import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Modal, Form, Popconfirm, Tag, Tooltip, message } from 'antd';
import { SearchOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [form] = Form.useForm();

    // Fetch users from API
    const fetchUsers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            // Replace with your actual API endpoint
            const response = await axios.get('/api/users', {
                params: { page, pageSize, search: searchText, role: filterRole !== 'all' ? filterRole : undefined }
            });
            setUsers(response.data.users || []);
            setPagination({
                ...pagination,
                total: response.data.total || 0,
                current: page,
                pageSize: pageSize,
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, filterRole]);

    const handleTableChange = (pagination) => {
        fetchUsers(pagination.current, pagination.pageSize);
    };

    const showAddUserModal = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditUserModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingUser) {
                // Update existing user
                await axios.put(`/api/users/${editingUser._id}`, values);
                message.success('Cập nhật người dùng thành công');
            } else {
                // Add new user
                await axios.post('/api/users', values);
                message.success('Thêm người dùng mới thành công');
            }

            setIsModalVisible(false);
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Form submission failed:', error);
            message.error('Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        setLoading(true);
        try {
            await axios.delete(`/api/users/${userId}`);
            message.success('Xóa người dùng thành công');
            fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Delete failed:', error);
            message.error('Không thể xóa người dùng');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên người dùng',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </Tag>
            ),
            filters: [
                { text: 'Quản trị viên', value: 'admin' },
                { text: 'Người dùng', value: 'user' },
            ],
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
            sorter: true,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, user) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => showEditUserModal(user)}
                            type="primary"
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa người dùng này?"
                            onConfirm={() => handleDeleteUser(user._id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="users-management">
            <div className="table-operations" style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={showAddUserModal}
                    >
                        Thêm người dùng
                    </Button>

                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />

                    <Select
                        defaultValue="all"
                        style={{ width: 150 }}
                        onChange={setFilterRole}
                    >
                        <Option value="all">Tất cả vai trò</Option>
                        <Option value="admin">Quản trị viên</Option>
                        <Option value="user">Người dùng</Option>
                    </Select>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchUsers(1, pagination.pageSize)}
                    >
                        Tải lại
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title={editingUser ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                        {editingUser ? "Cập nhật" : "Thêm mới"}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Tên người dùng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select>
                            <Option value="user">Người dùng</Option>
                            <Option value="admin">Quản trị viên</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default UsersTab;
