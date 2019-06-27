import TextAreaContainer from './textareaContainer';
import ConfigContainer from './configContainer';

const INITIAL_TEXTAREA_CONFIG = {
    key: '',
    containerWidth: 500,
    isActive: false,
    breakLine: true,
    labelText: '标签',
    labelWidth: 50,
    value: null,
    textareaWidth: 200,
    textareaHeight: 100
};

export {
    TextAreaContainer as TextArea,
    ConfigContainer as TextAreaConfig,
    INITIAL_TEXTAREA_CONFIG
};
