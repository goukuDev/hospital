import React, { useState } from 'react';
import Page from 'page';
import style from './index.css';
import {
    Input,
    InputConfig,
    INITIAL_INPUT_CONFIG
} from './components/molecules/input';
import {
    Select,
    SelectConfig,
    INITIAL_SELECT_CONFIG
} from './components/molecules/select';
import {
    TextArea,
    TextAreaConfig,
    INITIAL_TEXTAREA_CONFIG
} from './components/molecules/textarea';
import ReportConfig from './components/molecules/report';
import update from 'immutability-helper';
import deep from 'deep';

const loadData = (key, defaultValue) =>
    localStorage[key] ? JSON.parse(localStorage[key]) : defaultValue;

export default function Editor() {
    const [mode, setMode] = useState('normal');
    const [configs, setConfigs] = useState(loadData('configs', []));
    const [currentConfig, setCurrentConfig] = useState({});
    const [reportConfig, setReportConfig] = useState(
        loadData('reportConfig', {})
    );
    const [isInsertMode, setIsInsertMode] = useState(false);

    // 持久化数据
    const persistenceConfigs = configs => {
        return new Promise(resolve => {
            localStorage.configs = JSON.stringify(configs);
            resolve(configs);
        });
    };

    const getRandomId = () =>
        Math.random()
            .toString(36)
            .substr(2);

    /******************************************* 组件渲染 *******************************************/
    const addComponent = type => {
        let index = configs.length;

        if (isInsertMode) {
            index = configs.findIndex(config => config.id === currentConfig.id);
        }

        const initialConfig = {
            input: INITIAL_INPUT_CONFIG,
            select: INITIAL_SELECT_CONFIG,
            textarea: INITIAL_TEXTAREA_CONFIG
        };

        configs.splice(index, 0, {
            type,
            id: getRandomId(),
            ...initialConfig[type]
        });

        persistenceConfigs(configs.slice(0, configs.length)).then(setConfigs);

        setIsInsertMode(false);
    };

    const deleteComponent = id =>
        persistenceConfigs(configs.filter(config => config.id !== id)).then(
            setConfigs
        );

    const copyComponent = id => {
        const config = configs.find(config => config.id === id);

        if (config.options) {
            const options = deep.clone(config.options);

            options.map(option => {
                option.id = getRandomId();
                return option;
            });

            update(config, { options: { $set: options } });
        }

        persistenceConfigs(
            configs.concat(
                update(config, {
                    id: {
                        $set: getRandomId()
                    }
                })
            )
        ).then(setConfigs);
    };

    const moveUpComponent = id => {
        const config = configs.find(config => config.id === id);
        const index = configs.findIndex(config => config.id === id);

        if (index === 0) {
            return;
        }

        const prevConfig = configs[index - 1];

        configs[index - 1] = config;
        configs[index] = prevConfig;

        persistenceConfigs([...configs]).then(setConfigs);
    };

    const moveDownComponent = id => {
        const config = configs.find(config => config.id === id);
        const index = configs.findIndex(config => config.id === id);

        if (index === configs.length - 1) {
            return;
        }

        const nextConfig = configs[index + 1];

        configs[index + 1] = config;
        configs[index] = nextConfig;

        persistenceConfigs([...configs]).then(setConfigs);
    };

    const renderComponent = config => {
        const { id, type } = config;
        config.isActive = currentConfig.id === id;

        switch (type) {
            case 'input':
                return (
                    <Input
                        key={id}
                        mode={mode}
                        config={config}
                        updateConfig={updateConfig}
                        handleClick={e => e.stopPropagation() + showConfig(id)}
                        handleInsertBefore={e => setIsInsertMode(true)}
                    />
                );
            case 'select':
                return (
                    <Select
                        key={id}
                        mode={mode}
                        config={config}
                        updateConfig={updateConfig}
                        handleClick={e => e.stopPropagation() + showConfig(id)}
                    />
                );
            case 'textarea':
                return (
                    <TextArea
                        key={id}
                        mode={mode}
                        config={config}
                        updateConfig={updateConfig}
                        handleClick={e => e.stopPropagation() + showConfig(id)}
                    />
                );
            default:
                break;
        }
    };

    /******************************************* 配置更新 *******************************************/
    const renderConfig = () => {
        const { id, type } = currentConfig;

        const ConfigComponent = {
            input: InputConfig,
            select: SelectConfig,
            textarea: TextAreaConfig
        }[type];

        return ConfigComponent ? (
            <ConfigComponent
                config={currentConfig}
                updateConfig={updateConfig}
                handleCopy={e => copyComponent(id)}
                handleDelete={e => deleteComponent(id)}
                handleMoveUp={e => moveUpComponent(id)}
                handleMoveDown={e => moveDownComponent(id)}
            />
        ) : (
            <ReportConfig
                config={reportConfig}
                updateConfig={updateReportConfig}
            />
        );
    };

    const updateReportConfig = config => {
        setReportConfig(config);
        localStorage.reportConfig = JSON.stringify(config);
    };

    const showConfig = id => setCurrentConfig(configs.find(o => o.id === id));

    const updateConfig = config => {
        const index = configs.findIndex(o => o.id === config.id);
        configs.splice(index, 1, config);
        setConfigs(configs);
        setCurrentConfig(config);
        persistenceConfigs(configs);
    };

    return (
        <Page>
            <div className={style.operation}>
                <span
                    className={style.item}
                    onClick={e => addComponent('input')}
                >
                    输入框
                </span>
                <span
                    className={style.item}
                    onClick={e => addComponent('select')}
                >
                    不支持编辑的单选
                </span>
                <span
                    className={style.item}
                    onClick={e => addComponent('textarea')}
                >
                    多行输入框
                </span>
            </div>
            <div className={style.content} onClick={e => setCurrentConfig({})}>
                {configs.map(renderComponent)}

                <div className={style.btnGroup}>
                    <span
                        className={style.btn}
                        onClick={e => {
                            configs.map(config => {
                                config.value = null;
                                return config;
                            });
                            persistenceConfigs([...configs]).then(setConfigs);
                        }}
                    >
                        清空输入项
                    </span>

                    <span
                        className={style.btn}
                        onClick={e => {
                            localStorage.configs = '[]';
                            setConfigs([]);
                        }}
                    >
                        清空组件
                    </span>

                    <span
                        className={style.btn}
                        onClick={e =>
                            console.table(configs) + console.log(reportConfig)
                        }
                    >
                        保存
                    </span>
                    <span
                        className={style.btn}
                        onClick={e => setMode('preview')}
                    >
                        预览
                    </span>
                    <span
                        className={style.btn}
                        onClick={e => setMode('normal')}
                    >
                        编辑
                    </span>
                </div>
            </div>
            <div className={style.config}>{renderConfig()}</div>
        </Page>
    );
}
