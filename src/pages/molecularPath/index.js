import React, { useState } from 'react'
import Page from 'page'
import Tabs from 'tabs'
import Apply from './apply'
import Receive from './receive'
import Section from './section'
import Pickup from './pickup'
import QualityControl from './qualityControl'
import DNAQualityControl from './DNAQualityControl'
import Report from './report'
import styled from 'styled-components'

const TAB_NAMES = {
  APPLY: 0,
  RECEIVE: 1,
  SECTION: 2,
  PICKUP: 3,
  QUALITYCONTROL: 4,
  DNAQUALITYCONTROL: 5,
  REPORT: 6
}

const TAB_LIST = [
  { type: '登记分子申请', value: TAB_NAMES.APPLY },
  { type: '接收分子申请', value: TAB_NAMES.RECEIVE },
  { type: '切片', value: TAB_NAMES.SECTION },
  { type: '取片', value: TAB_NAMES.PICKUP },
  { type: 'HE质控', value: TAB_NAMES.QUALITYCONTROL },
  { type: '实验质控', value: TAB_NAMES.DNAQUALITYCONTROL },
  { type: '实验结果', value: TAB_NAMES.REPORT }
]

const Container = styled.div`
    position: absolute
    left: 16px
    right: 16px
    top: 18px
    bottom: 18px
`

export default function Index () {
  const [currentTab, setCurrentTab] = useState(TAB_NAMES.APPLY)

  return (
    <Page>
      <Container>
        <Tabs
          curCompnent={currentTab}
          tabList={TAB_LIST}
          switchChildren={setCurrentTab}
          editable={true}>
          {currentTab === TAB_NAMES.APPLY && <Apply />}
          {currentTab === TAB_NAMES.RECEIVE && <Receive />}
          {currentTab === TAB_NAMES.SECTION && <Section />}
          {currentTab === TAB_NAMES.PICKUP && <Pickup />}
          {currentTab === TAB_NAMES.QUALITYCONTROL && <QualityControl />}
          {currentTab === TAB_NAMES.DNAQUALITYCONTROL && <DNAQualityControl />}
          {currentTab === TAB_NAMES.REPORT && <Report />}
        </Tabs>
      </Container>
    </Page>
  )
}
