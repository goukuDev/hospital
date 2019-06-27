import React from 'react';
import Page from 'page';
import menus from 'menus';
import { getRoles } from 'utils';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: auto;
`;

const Header = styled.div`
    color: #333;
    font-size: 36px;
    padding: 50px 0 40px 0;
`;

const MenuWrap = styled.div`
    width: 100%;
    margin: 40px 0 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    grid-gap: 0 30px;
    justify-items: center;
    justify-content: center;
    margin: 0 0 20px 0;

    a {
        display: block;
        width: 300px;
        padding-bottom: 30px;
    }
`;

const Menu = styled.div`
    height: 167px;
    background: ${props => props.background};
    border-radius: 20px;
    text-align: center;
    position: relative;
`;

const Icon = styled.img`
    top: ${props => props.top}px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
`;

const Label = styled.span`
    color: white;
    font-size: 24px;
    margin-top: 6px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 15px;
`;

function MenuItem({ label, iconPath, iconTop, background, roleName, url }) {
    if (getRoles().includes(roleName)) {
        return (
            <Link to={url} key={label}>
                <Menu background={background}>
                    <Icon src={iconPath} top={iconTop} />
                    <Label>{label}</Label>
                </Menu>
            </Link>
        );
    }
    return null;
}

export default () => (
    <Page>
        <Container>
            <Header>请选择您的工作台</Header>
            <MenuWrap>{menus.map(MenuItem)}</MenuWrap>
        </Container>
    </Page>
);