import SelectContainer from './selectContainer';
import ConfigContainer from './configContainer';

const INITIAL_SELECT_CONFIG = {
    key: '',
    containerWidth: 500,
    isActive: false,
    breakLine: true,
    labelText: '标签',
    labelWeight: 400,
    labelWidth: 50,
    value: '',
    selectWidth: 150
};

export {
    SelectContainer as Select,
    ConfigContainer as SelectConfig,
    INITIAL_SELECT_CONFIG
};
