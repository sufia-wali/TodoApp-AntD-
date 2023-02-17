import { useState, Fragment } from 'react';
import { Layout, Input, Button, Table, Modal, Form, Tag, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';


const { Header, Content } = Layout;
const { Search } = Input;
const { Option } = Select;


const TodoList = () => {

  const [data, setData] = useState([]); // to-do list data structure
  const [modalVisible, setModalVisible] = useState(false); // modal visibility state
  const [form] = Form.useForm(); // Ant Design form for modal
  const [filterTags, setFilterTags] = useState([]);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toJSON().toString());

  const [flag, setFlag] = useState(false);

  const statusOptions = [
    { text: 'OPEN', value: 'OPEN' },
    { text: 'WORKING', value: 'WORKING' },
    { text: 'DONE', value: 'DONE' },
    { text: 'OVERDUE', value: 'OVERDUE' },
  ];


  const tagOptions = filterTags.map((tag) => ({
    label: tag,
    value: tag
  }))


  function appendTagToLocalStorage(id, newTag) {
    const tags = JSON.parse(localStorage.getItem("tags")) || [];
    tags.push({ [id]: newTag });
    localStorage.setItem("tags", JSON.stringify(tags));
    const flatArray = tags.flatMap(obj => Object.values(obj)[0]);
    const uniqueArray = Array.from(new Set(flatArray));
    setFilterTags(uniqueArray)
    localStorage.setItem("uniqueTags", JSON.stringify(uniqueArray));
  }

  // function to remove tags if the task is removed
  function removeTagFromLocalStorage(id) {
    const tags = JSON.parse(localStorage.getItem("tags")) || [];
    const newData = tags.filter((task) => !task.hasOwnProperty(id));
    localStorage.setItem("tags", JSON.stringify(newData))
    const nD = JSON.parse(localStorage.getItem("tags")) || [];
    const flatArray = nD.flatMap(obj => Object.values(obj)[0]);
    const uniqueArray = Array.from(new Set(flatArray));
    setFilterTags(uniqueArray)
  }


  // function to add a new task to the list
  const handleAddTask = (values) => {

    const newTask = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      created: new Date(),
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      tags: values.tags,
      status: values.status
    };
    // appending to localstorage
    appendTagToLocalStorage(newTask['id'], newTask['tags'])
    localStorage.setItem("todos", JSON.stringify(newTask))
    const newtask = JSON.parse(localStorage.getItem("todos")) || [];

    // setData(updatedData);
    setData([...data, newtask]);
    setModalVisible(false);
    form.resetFields();
  };

  // function to modify an existing task
  const handleModifyTask = (values) => {
    const id = form.getFieldValue().id;
    const newDataInString = JSON.stringify(form.getFieldValue());
    const parsedDate = JSON.parse(newDataInString);
    const newData = data.map((task)=>task.id===id ? parsedDate :task)
    setData(newData);
    setModalVisible(false);
    form.resetFields();
    setFlag(false);
  };

  // function to delete a task
  const handleDeleteTask = (id) => {
    const newData = data.filter((task) => task.id !== id);
    setData(newData);
    removeTagFromLocalStorage(id)
  };

  // columns for the Ant Design table
  const columns = [
    {
      title: 'Timestamp created',
      dataIndex: 'created',
      key: 'created',
      sorter: (a, b) => a.created - b.created,
      render: (created) => <span>{created.toLocaleString()}</span>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a, b) => a.dueDate - b.dueDate,
      render: (dueDate) => <span>{dueDate.toLocaleString()}</span>
    },
    {
      title: 'Tag',
      dataIndex: 'tags',
      key: 'tags',
      filters: filterTags.map(item => ({ text: item, value: item, })),
      onFilter: (value, record) => record.tags.includes(value),
      render: (tagOptions) =>
      (
        <Fragment>
          {tagOptions.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Fragment>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'OPEN', value: 'OPEN' },
        { text: 'WORKING', value: 'WORKING' },
        { text: 'DONE', value: 'DONE' },
        { text: 'OVERDUE', value: 'OVERDUE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) =>
      (
        <Select
          value={status}
        >
          {statusOptions.map((option) => {
            return (
              <Option key={option.value} value={option.value}>
                {option.value}
              </Option>
            )
          })}
        </Select>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Fragment>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDeleteTask(record.id)}>
            Delete
          </Button>
        </Fragment>
      ),
    },
  ];

  const handleEdit = (record) => {
    setFlag(true);
    form.setFieldsValue(record);
    setModalVisible(true);
  };


  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ color: '#fff' }}>Todo List</h1>
        <Search
          placeholder="Search tasks"
          style={{ width: '200px', margin: '0 10px', backgroundColor: '#000' }}
        />
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add Task
        </Button>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title="Add a new task"
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => setModalVisible(false)}
        >
          <Form form={form} onFinish={flag ? handleModifyTask: handleAddTask} onFinishFailed={() => { }}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please input a title' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Due Date" name="dueDate" valuePropName='date'>
              <DatePicker
                value={form.getFieldValue().dueDate===undefined ? '': dayjs(form.getFieldValue().dueDate)}
                onChange={(date, dateString) => {
                  const newDate = JSON.stringify(date);
                  if (date) {
                    setSelectedDate(JSON.parse(newDate))
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="Tags" name="tags">
              <Select mode="tags" >
              </Select>
            </Form.Item>
            <Form.Item label="Status" name="status">
              <Select>
                {statusOptions.map((option) => {
                  return (
                    <Option key={option.value} value={option.value}>
                      {option.value}
                    </Option>
                  )
                }
                )}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default TodoList;
