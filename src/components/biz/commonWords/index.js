import React, { useState, useEffect } from 'react';
import style from './index.css';
import Input from 'input';
import { Tree } from 'antd';

import confirm from 'confirm';

const { TreeNode } = Tree;

function InputNode(props) {
    const { id, callback, propValue } = props;
    const [value, setValue] = useState(propValue);
    useEffect(() => {
        document.getElementById(id).focus();
    }, [id]);

    return (
        <Input
            value={value}
            onChange={e => {
                setValue(e.target.value);
            }}
            onBlur={e => callback({ id, value })}
            onPressEnter={e =>callback({ id, value })}
            id={id}
            inputStyle={{
                width: '130px',
                marginLeft: '-4px',
                height: '22px',
                padding: '0 4px',
                fontSize: '14px',
                color: '#595959',
                outline: 'none',
            }}
        />
    );
}

export default function Index(props) {
    const [tree, setTree] = useState([]);
    const { fetchUpdate, } = props;
    const [currentNodeId, setCurrentNodeId] = useState(undefined);
    const [expandedKeys, setExpandedKeys] = useState([props.tree[0].id]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(false);

    useEffect(() => {
        setTree(props.tree);
        if (localStorage.expandedKeys) setExpandedKeys(JSON.parse(localStorage.expandedKeys))
    }, [props.tree]);
    
    
    /************************ handler ************************/
    const filterPureTree = node => {
        node.children = node.children
            .filter(item => typeof item.label === 'string')
            .map(child => {
                if (child.children && child.children.length) {
                    filterPureTree(child);
                }
                return child;
            });
        return node;
    };
    const addNode = (tree, currentNodeId, newNode) => {
        const add = tree => {
            for (let node of tree) {
                const { children = [] } = node;
                if (node.id === currentNodeId) {
                    node.children = children.concat(newNode);
                } else {
                    add(children);
                }
            }
        };
        add(tree);

        return tree;
    };

    const replaceNode = (tree, newNode) => {
        const replace = tree => {
            for (let node of tree) {
                const { children = [] } = node;
                if (node.id === newNode.id) {
                    node.label = newNode.label;
                } else {
                    replace(children);
                }
            }
        };
        replace(tree);
        return tree;
    };

    const deleteNode = (tree, nodeId) => {
        const parentId = nodeId
            .split('-')
            .slice(0, -1)
            .join('-');
        const del = tree => {
            for (let node of tree) {
                const { children = [] } = node;
                if (node.id === parentId) {
                    node.children = node.children.filter(child => child.id !== nodeId);
                } else {
                    del(children);
                }
            }
        };

        del(tree);
        return tree;
    };

    const findNode = (tree, targetId) => {
        const newTree = tree[0];
        let targetNode = null;

        const find = node => {
            const { children = [] } = node;

            if (node.id === targetId) {
                targetNode = node;
                return;
            }

            if (children.length) {
                children.map(find);
            }
        };

        find(newTree);
        return targetNode;
    };

    const handleAddNode = () => {
        const currentNode = findNode(tree, currentNodeId);

        let addId = 0;
        if (currentNode.children && currentNode.children.length) {
            let lastChildId = currentNode.children[currentNode.children.length - 1].id;
            let index = lastChildId.lastIndexOf('-');
            addId = Number(lastChildId.substr(index + 1, lastChildId.length)) + 1;
        }
        const nodeId = `${currentNodeId}-${addId}`;
        const newNode = [
            {
                id: nodeId,
                label: (
                    <InputNode
                        id={nodeId}
                        callback={({ id, value }) => {
                            if(value){
                                const newTree = replaceNode(tree, {
                                    id,
                                    label: value,
                                });
                                setTree([...newTree]);
                                fetchUpdate([...newTree]);
                            }
                            else setTree([filterPureTree([...newTree][0])]);
                        }}
                        propValue={''}
                    />
                ),
            },
        ];
        const newTree = addNode(tree, currentNodeId, newNode);
        setTree([...newTree]);
        if(!expandedKeys.includes(currentNodeId)){
            setExpandedKeys([...expandedKeys,currentNodeId])
        }
    };

    const handleUpdateNode = () => {
        const currentNode = findNode(tree, currentNodeId);
        currentNode.label = (
            <InputNode
                id={currentNode.id}
                callback={({ id, value }) => {
                    if(value){
                        const newTree = replaceNode(tree, {
                            id,
                            label: value,
                        });
                        setTree([...newTree]);
                        fetchUpdate([...newTree]);
                    }
                    else {
                        const currentNode = findNode(tree, currentNodeId);
                        confirm({
                            content: currentNode.children ? '当前输入框为空，将会删除这个节点及所有子节点？' : '当前输入框为空，将会删除这个节点',
                            onOk: e => {
                                setTree([filterPureTree([...newTree][0])]);
                                fetchUpdate(tree);
                            },
                            onCancel:e=>{
                                document.getElementById(currentNodeId).focus();
                            }
                        });
                        
                    }
                }}
                propValue={currentNode.label}
            />
        );
        const newTree = replaceNode(tree, currentNode);
        setTree([...newTree]);
    };

    const handleDeleteNode = () => {
        const currentNode = findNode(tree, currentNodeId);
        confirm({
            content: currentNode.children ? '下方子节点将会一起删除，确认删除？' : '确认删除吗？',
            onOk: e => {
                const newTree = deleteNode(tree, currentNodeId);
                setTree([...newTree]);
                fetchUpdate([...newTree]);
            },
        });
    };
    const hangleDbClick = (e, treeNode) => {
        e.persist();
        const node = findNode(tree,treeNode.props.eventKey);
        if (!treeNode.getNodeChildren().length) props.dbclick(node.label);
    };
   
    const filterSearch = (tree, searchValue) => {
        if(!searchValue) return
        let nodeId=[]
        const find = node => {
            const { children = [] } = node;
            if (node.label.indexOf(searchValue) >= 0) {
                if(node.children&&node.children.length) nodeId.push(node.id)
                else nodeId.push(node.id.split('-').slice(0, -1).join('-'))
            }
            if (children.length) children.map(find);
        };
        find(tree[0]);
        setExpandedKeys([...nodeId]);
        setAutoExpandParent(true);
        localStorage.setItem('expandedKeys', JSON.stringify([...nodeId]));
        return nodeId;
    };

    /************************ render ************************/

    const renderTreeNodes = data =>
        data.map(item => {
            let label
            if(typeof(item.label)==='string'){
                const index = item.label.indexOf(searchValue);
                const beforeStr = item.label.substr(0, index);
                const afterStr = item.label.substr(index + searchValue.length);
                label =
                    index > -1 ? (
                        <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{searchValue}</span>
                        {afterStr}
                        </span>
                    ) : (
                        <span>{item.label}</span>
                    );
            }
            else label=item.label
            return (
                <TreeNode title={label} key={item.id}>
                    {item.children && renderTreeNodes(item.children)}
                </TreeNode>
            );
            
          });

    return (
        <div className={style.wordwrap}>
            <div className={style.wordtitle}>
                常用词条
                <div className={style.searchbox}>
                    <input value={searchValue} onChange={e=>{setSearchValue(e.target.value);filterSearch(tree,e.target.value)}}/>
                    <img width="16" alt="搜索" src={require('@images/search.svg')} onClick={e=>filterSearch(tree,searchValue)} />
                </div>
            </div>
            {tree.length > 0 && (
                <Tree
                    showLine
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onExpand={e => {localStorage.setItem('expandedKeys', JSON.stringify(e));setExpandedKeys(e); }}
                    onSelect={([key]) => setCurrentNodeId(key)}
                    className={style.treenode}
                    onDoubleClick={hangleDbClick}
                >
                    {renderTreeNodes(tree)}
                </Tree>
            )}
            <div className={style.wordbottom}>
                <span onClick={currentNodeId === undefined ? e => e : e => handleAddNode()}>增加</span>
                <span onClick={currentNodeId === undefined ? e => e : e => handleUpdateNode()}>修改</span>
                <span onClick={currentNodeId === undefined ? e => e : e => handleDeleteNode()}>删除</span>
                <span onClick={e => props.resetWords()}>重置</span>
            </div>
        </div>
    );
}
