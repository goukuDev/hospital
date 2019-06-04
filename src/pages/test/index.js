import React, {Component} from 'react';
import Table from 'table';
import Page from 'page';

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        filters: [
            {
                text: 'Joe',
                value: 'Joe'
            },
            {
                text: 'Jim',
                value: 'Jim'
            },
            {
                text: 'Submenu',
                value: 'Submenu',
                children: [
                    {
                        text: 'Green',
                        value: 'Green'
                    },
                    {
                        text: 'Black',
                        value: 'Black'
                    }
                ]
            }
        ],
        onFilter: (value, record) => record.name.indexOf(value) === 0
    },
    {
        title: 'Age',
        dataIndex: 'age',
        count: 4
    },
    {
        title: 'Address',
        dataIndex: 'address'
    }
];
const data = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park'
    },
    {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park'
    },
    {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park'
    },
    {
        key: '4',
        name: 'Disabled User',
        age: 99,
        address: 'Sidney No. 1 Lake Park',
        disabled: true
    }
];
export default class index extends Component {
    render() {
        return (
            <Page>
                <Table columns={columns} data={data} showPagination={true} onSelectChange={e => console.log(e)} />
            </Page>
        );
    }
}
