import React, { useState } from 'react';
import Page from 'page';
import Tabs from 'tabs';
import Apply from './apply';
import Receive from './receive';
import Section from './section';
import QualityControl from './qualityControl';
import styled from 'styled-components';

const TAB_NAMES = { APPLY: 0, RECEIVE: 1, SECTION: 2, QUALITYCONTROL: 3 };

const TAB_LIST = [
    { type: '登记分子申请', value: TAB_NAMES.APPLY },
    { type: '接收分子申请', value: TAB_NAMES.RECEIVE },
    { type: '切片', value: TAB_NAMES.SECTION },
    { type: 'HE染色评价', value: TAB_NAMES.QUALITYCONTROL }
];

const Container = styled.div`
    position: absolute;
    left: 16px;
    right: 16px;
    top: 18px;
    bottom: 18px;
`;

export default function Index() {
    const [currentTab, setCurrentTab] = useState(TAB_NAMES.APPLY);

    return (
        <Page>
            <Container>
                <Tabs
                    curCompnent={currentTab}
                    tabList={TAB_LIST}
                    switchChildren={setCurrentTab}
                    editable={true}
                >
                    {currentTab === TAB_NAMES.APPLY && <Apply />}
                    {currentTab === TAB_NAMES.RECEIVE && <Receive />}
                    {currentTab === TAB_NAMES.SECTION && <Section />}
                    {currentTab === TAB_NAMES.QUALITYCONTROL && (
                        <QualityControl />
                    )}
                </Tabs>
            </Container>
        </Page>
    );
}
