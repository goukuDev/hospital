import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import AddPop from 'addPop';
import Input from 'input';
import Table from 'table';
import { api } from 'utils';
import { CODE } from 'myConstants';
import Message from 'message';
import deep from 'deep';

const Container = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
    width: 100%;
    height: 38px;
    line-height: 38px;
    background: rgba(64, 120, 236, 0.21);
    font-size: 15px;
    color: #317ded;
    font-weight: 500;
    padding: 0 12px;

    & > span {
        margin: 0 50px 0 0;
        display: inline-block;
        vertical-align: middle;
    }

    & > span:nth-child(2) {
        width: 520px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

const Body = styled.div`
    padding: 12px;
    position: relative;
`;

const SelectWrap = styled.div`
    position: absolute;
    right: 0;
    top: 12px;
`;

const Button = styled.span`
    height: 34px;
    line-height: 34px;
    padding: 0 16px;
    background: ${props => (props.disabled ? '#CDD0CF' : '#2399F1!important')};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer!important')};
    color: white;
    display: inline-block;
    border-radius: 4px;
    margin: 0 10px 0 0;
`;

const DeleteButton = styled(Button)`
    background: ${props => (props.disabled ? '#CDD0CF' : '#f25b24!important')};
    height: 24px;
    line-height: 24px;
    width: 43px;
    padding: 0;
    text-align: center;
`;

const TableWrap = styled.div`
    margin: 8px 0 0 0;
`;

const ButttonGroup = styled.div`
    margin: 12px 0 0 0;
`;

var ipcRenderer = window.electron && window.electron.ipcRenderer;
var remote = window.electron && window.electron.remote;


function SampleTable(props) {
    const columns = [
        {
            title: '标本来源',
            dataIndex: 'sample_source',
            width: 125,
            render: value => ({ 0: '本院', 1: '外院', 2: '会诊' }[value])
        },
        {
            title: '标本类型',
            dataIndex: 'sample_type',
            width: 125,
            render: (value, record) => {
                const { isParent } = record;
                if (isParent) {
                    return {
                        0: '蜡块',
                        1: '蜡块，外周血',
                        2: '白片',
                        3: '胸水',
                        4: 'DNA',
                        5: '外周血',
                        6: '腹水',
                        7: '血浆',
                        8: '血清',
                        9: '骨髓',
                        10: '其他'
                    }[value];
                } else {
                    return { 0: '切片', 1: '血' }[value];
                }
            }
        },
        {
            title: '病理号',
            dataIndex: 'sample_pathnum',
            width: 110
        },
        {
            title: '蜡块号/标本号',
            dataIndex: 'sample_num',
            width: 165
        },
        {
            title: '标签类型',
            dataIndex: 'tag_type',
            width: 110,
            render: value => ({ 0: '样本管', 1: '质控HE', 2: '白片' }[value])
        },
        {
            title: '标签打印状态',
            dataIndex: 'tag_printed',
            width: 155,
            render: value => ({ 0: '未打印', 1: '已打印' }[value])
        },
        {
            title: '备注',
            dataIndex: 'sample_comment',
            width: 110,
        },
        {
            title: '操作',
            dataIndex: 'option',
            width: 80,
            render: (value, record) => {
                const { isParent } = record;
                return (
                    !isParent && (
                        <DeleteButton
                            disabled={deleteButtonDisabled}
                            onClick={() => !deleteButtonDisabled && handleDeleteButtonClick(record)}
                        >
                            删除
                        </DeleteButton>
                    )
                );
            }
        }
    ];

    const {
        data,
        deleteSample,
        deleteButtonDisabled,
        selectedRowKeys,
        onSelectChange,
    } = props;

    if (!data.length) return null;

    const handleDeleteButtonClick = record => {
        deleteSample(record.id);
    };

    return (
        <TableWrap>
            <Table
                columns={columns}
                data={data}
                rowKey={'id'}
                expandedRowKeys={data.map(o=>o.id)}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={ids=>onSelectChange(ids)}
                indentSize={12}
                onRow={({ id }) => ({
                    onDoubleClick: event => {}
                })}
                scroll={{ y: 480 }}
            />
        </TableWrap>
    );
}

function Index(props) {
    const { data, onClose, onSave, onConfirm} = props;
    const {
        name,
        apply_id,
        molecule_pathnum,
        reuse_molecule_pathnum,
        testsName,
        status,
        //receive_status
    } = data;

    const [samples, setSamples] = useState([]);
    const [reusePathnum,setReusePathnum] = useState(reuse_molecule_pathnum);
    const [selectSampleIds,setSelectSampleIds] = useState([]);

    const [buttonFlag,setButtonFlag] = useState(!!reuse_molecule_pathnum);

    // 缓存初始数据

    const buttonDisabled = !!(!selectSampleIds.length || reuse_molecule_pathnum) || buttonFlag;

    const deleteButtonDisabled = !!reuse_molecule_pathnum || buttonFlag;

    /************************ api ************************/

    const getSlices = useCallback((reuseMoleculePathnum) => {
        return new Promise(resolve=>{
            api('molecule/get_slices', { apply_ids:JSON.stringify([apply_id]),reuse_molecule_pathnum:reuseMoleculePathnum }).then(
                ({ code, data }) => {
                    if (code === CODE.SUCCESS) {
                        let temp = data[0].samples.map(o=>{
                            o.isParent = true;
                            o.id = o.sample_id;
                            o.children = o.slices.map(a=>{
                                a.id = o.id + Math.random();
                                a.sample_type = a.slice_type;
                                // a.sample_pathnum = o.sample_pathnum;
                                a.disabled = true;
                                return a;
                            })
                            return o;
                        })
                        
                        setSamples(temp);
                        resolve();
                    }
                }
            );
        })
    }, [apply_id,]);

    const saveSamples = (params,message) => {
        return new Promise(resolve=>{
            api('molecule/alter_slices', params).then(({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    !message && onSave();
                    // handleClose();
                    !message && Message.success('保存成功')
                    getSlices();
                    resolve()
                }else{
                    Message.error('保存失败')
                }
            });
        })
    };

    const handleCustomButtonClick = async () => {
        let params = saveParams();
        await saveSamples(params,'message');
        api('molecule/alter_app_receive_status', {apply_ids:JSON.stringify([apply_id])}).then(
            ({ code, data }) => {
                if (code === CODE.SUCCESS) {
                    Message.success('确认成功!');
                    onConfirm();
                }else{
                    Message.error('确认失败')
                }
            }
        );
        
    };

    // ----------------------------------- methods ----------------------------------------

    const deleteSample = id => {
        let temp = samples.map(o=>{
            if(o.id === parseInt(id)){
                o.children = o.children.filter(a=>a.id !== id)
            }
            return o;
        })

        setSamples(temp);
    };

    const addSample = sample => {
        if (buttonDisabled) return;

        let temp = samples.map(o=>{
            if(selectSampleIds.includes(o.id)){
                let tmp = deep.clone(sample);
                tmp.id = o.id+Math.random();
                // tmp.sample_source = o.sample_source;
                tmp.sample_type = sample.tag_type === 0 ? '' : 0;
                tmp.disabled = true;
                o.children.push(tmp);
            }
            return o;
        })
        setSamples(temp);
    };

    const addSlices = slices => {
        if (buttonDisabled) return;
        samples.map(o => {
            if(selectSampleIds.includes(o.id)){
                let tmp = deep.clone(slices);
                tmp = tmp.map(a=>{a.id += o.id; return a})
                o.children = o.children.concat(tmp);
            }
            return o;
        });

        setSamples([...samples]);
    };

    /************************ handler ************************/

    const handleClose = () => {
        onClose();
    };

    const saveParams = () => {
        let temp = []
        samples.forEach(o=>{
            o.children.forEach(a=>{
                a.sample_id = o.sample_id
                temp = temp.concat([a])
            })
            
        })

        let params = {
            apply_id,
            slices: JSON.stringify(temp),
        };
        (reusePathnum && reusePathnum.trim() && buttonDisabled) && (params.reuse_molecule_pathnum = reusePathnum);
        
        return params;
    }
    const handleConfirm = () => {
        let params = saveParams();
        saveSamples(params);
    };

    const handleReuseButtonClick = () => {
        if(!reusePathnum.trim())return;
        getSlices(reusePathnum).then(data=>{
            setButtonFlag(true);
        });
    };

    const handleAddFiveSlice = () => {
        if (buttonDisabled) return;

        const slices = new Array(5).fill(0).map(o => ({
            id: Math.random(),
            slice_type: 0,
            sample_type:0,
            tag_type: 2,
            tag_printed: 0,
            disabled:true
        }));

        addSlices(slices);
    };

    useEffect(() => {
        getSlices();
    }, [getSlices]);

    // ---------------------------- 打印 -------------------------------------------

    const printCode = () => {
        if ((!remote && !ipcRenderer) || !selectSampleIds.length) return;
        let codeFlag = remote.getGlobal('sharedObject').printMoleculeLabelStatus;
        if (codeFlag) return;

        let result = [];
        let sliceIds = [];

        let temp = samples.filter(o=>selectSampleIds.includes(o.sample_id));
        temp.forEach(item => {
            item.children.forEach(child => {
                sliceIds = sliceIds.concat([child.slice_id]);
                result = result.concat([
                    {
                        moleculePathnum: molecule_pathnum,
                        resueMoleculePathnum: reusePathnum,
                        samplePathnum: item.sample_pathnum,
                        paraffinNum: item.sample_num,
                        tagType: child.tag_type
                    }
                ]);
            });
        });

        if (!result.length) {
            Message.info('无内容可打印');
            return;
        }


        remote.getGlobal('sharedObject').moleculeLabel = result;

        let params = {
            message_type: 'moleculeLabelPre',
            content: 'template/molecular/barcode.html'
        };

        ipcRenderer.send('print', params);

        api('molecule/alter_slice_print_status', {
            slice_ids: JSON.stringify(sliceIds)
        }).then(({ code, data, message }) => {
            if (code === CODE.SUCCESS) getSlices();
            else Message.error(message);
        });
    };

    return (
        <Container>
            <AddPop
                title='申请项目'
                confirmButtonText='保存'
                popStyle={{ width: '894px' }}
                onClose={handleClose}
                onCancel={handleClose}
                onConfirm={handleConfirm}
                renderCustomButtons={() => (
                    <Button
                        disabled={status === 2}
                        onClick={e=>!(status === 2) && handleCustomButtonClick()}
                    >
                        确认接收
                    </Button>
                )}
            >
                <Header>
                    <span>{name}</span>
                    <span style={{ width: '600px' }}>
                        申请项目：{testsName}
                    </span>
                    {/* <span style={{ margin: '0' }}>
                        病理号：{sample_pathnum}
                    </span> */}
                </Header>
                <Body>
                    <Input
                        label='分子病理号：'
                        disabled
                        value={molecule_pathnum}
                        required={true}
                        containerStyle={{ width: '50%' }}
                        inputStyle={{ width: '175px' }}
                        labelStyle={{ color: '#20252B' }}
                        lineFeed={false}
                    />
                    <SelectWrap>
                        <Input
                            lineFeed={false}
                            value={reusePathnum}
                            onChange={e=>setReusePathnum(e.target.value)}
                            containerStyle={{
                                width: 'auto',
                                marginRight: '10px'
                            }}
                            inputStyle={{ width: '175px' }}
                        ></Input>
                        <Button onClick={handleReuseButtonClick}>
                            DNA同分子号
                        </Button>
                    </SelectWrap>
                    <SampleTable
                        data={samples}
                        deleteSample={deleteSample}
                        selectedRowKeys={selectSampleIds}
                        onSelectChange={ids=>setSelectSampleIds(ids)}
                        deleteButtonDisabled={deleteButtonDisabled}
                    />
                    <ButttonGroup>
                        <Button
                            disabled={buttonDisabled}
                            onClick={() =>
                                addSample({
                                    tag_type: 0,
                                    slice_type: 2,
                                    tag_printed: 0
                                })
                            }
                        >
                            增加样本管
                        </Button>
                        <Button
                            disabled={buttonDisabled}
                            onClick={() =>
                                addSample({
                                    tag_type: 1,
                                    slice_type: 0,
                                    tag_printed: 0
                                })
                            }
                        >
                            增加质控切片
                        </Button>
                        <Button
                            disabled={buttonDisabled}
                            onClick={() =>
                                addSample({
                                    tag_type: 2,
                                    slice_type: 0,
                                    tag_printed: 0
                                })
                            }
                        >
                            增加1张白片
                        </Button>
                        <Button disabled={buttonDisabled} onClick={handleAddFiveSlice}>
                            增加5张白片
                        </Button>
                        <Button disabled={!selectSampleIds.length} onClick={printCode}>打印标签</Button>
                    </ButttonGroup>
                </Body>
            </AddPop>
        </Container>
    );
}

export default Index;
