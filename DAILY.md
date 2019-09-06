### 表格列宽规则

原则：保证列头名称不会换行，大部分数据能一行展示

| 列名       | 宽度  |
| :--------- | :---: |
| 姓名、年龄 | 110px |
| 时间       | 200px |

表格滚动 x、y 设置规则：
x = 所有固定列宽之和 + 动态列最小列宽 (一般动态列为备注，设置为 200px)
y = 100vh - 除 tbody 外所有元素高度之和 (别忘了加上滚动条的高度)

#### 在组件内全局修改 ant-design 组件样式

```css
:global {
    .ant-table-tbody > tr > td {
        border: none;
    }
}
```

#### 常用代码块

1. 计算表格列宽之和

```javascript
columns
    .filter(col => col.width)
    .map(col => col.width)
    .reduce((a, b) => a + b, 0);
```
