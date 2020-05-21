import React, {useState} from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'

import Desk from './components/Desk'

import 'regenerator-runtime/runtime'
import './node_modules/material-design-icons/iconfont/material-icons.css'


const App = () => {
  const desk = new Desk()

  const [paired, setPaired] = useState(false)

  const onPair = async () => {
    try {
      await desk.request()
      await desk.connect()
      setPaired(true)
    } catch(error) {
      alert(error)
    }
  }

  const onUp = async () => {
    try {
      desk.moveUp()
    } catch(error) {
      alert(error)
    }
  }

  const onDown = async () => {
    try {
      desk.moveDown()
    } catch(error) {
      alert(error)
    }
  }

  return (
    <Root>
      <CtrlContainer>
        <Btn onClick={onPair} title="pair bluetooth">
          <i className="material-icons">bluetooth</i>
        </Btn>
        <Btn onClick={onUp} tile="move desk up" disabled={!paired}>
          <i className="material-icons">keyboard_arrow_up</i>
        </Btn>
        <Btn onClick={onDown} title="move deesk down" disabled={!paired}>
          <i className="material-icons">keyboard_arrow_down</i>
        </Btn>
      </CtrlContainer>
    </Root>
  )
}

const Root = styled.div`
  height: 100%;
`

const CtrlContainer = styled.div`
  width: 300px;
  height: 70px;
  margin: 100px auto;
  background: #222;
  border-radius: 20px;
  position: relative;
  display: block;
  text-align: center;
`

const Btn = styled.button`
  cursor: pointer;
  width: 5rem;
  height: 2rem;
  border: none;
  text-decoration: none;
  background-color: #222;
  color: #f2f2f2;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  margin: 20px 5px;

  &:disabled {
    cursor: not-allowed;
    border: 1px solid #888;
    color:  #888;
  }

  &:focus {
    outline: none;
  }
`

render(<App />, document.getElementById('app'));
