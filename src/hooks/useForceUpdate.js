import {useState} from 'react';

export default () => {
    const [, setState] = useState(0);

    return () => setState(tick => tick + 1);
};
