import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Header from 'header'
import style from './index.css'

export default class Page extends Component {
  render () {
    const isAuthenticated = !['', undefined].includes(localStorage.userInfo)

    return isAuthenticated ? (
      <div className={style.container}>
        <Header />
        <div className={style.content}>
          {this.props.children}
        </div>
      </div>
      ) : (
      <Redirect to={{ pathname: '/login', state: {from: this.props.location} }} />
      )
  }
}
