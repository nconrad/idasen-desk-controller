import React, {useState, useEffect} from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'

import Desk from './components/Desk'

import 'regenerator-runtime/runtime'
import '../node_modules/material-design-icons/iconfont/material-icons.css'

const REPO_URL = 'https://github.com/nconrad/idasen-web-controller'

// import {version} from '../package.json'

const desk = new Desk()
const bufferToNum = buff => new Uint16Array(buff)[0]


// todo: this may be slope of .1
const toInches = (position) => {
  const mm = (381 / 3815) * position + 612.13
  return (mm / 25.4).toFixed(1)
}


const App = () => {
  const [paired, setPaired] = useState(false)
  const [storingMem, setStoringMem] = useState(false)

  const [movingTo, setMovingTo]  = useState({direction: null, position: null})
  const [position, setPosition] = useState(null)

  const [mem, setMem] = useState({
    1: localStorage.getItem('memory-1'),
    2: localStorage.getItem('memory-2'),
    3: localStorage.getItem('memory-3'),
    4: localStorage.getItem('memory-4')
  })

  const [memHover, setMemHover] = useState(null)

  // react to movingTo state
  useEffect(() => {
    if (!('direction' in movingTo)) {
      return
    }

    moveDesk(movingTo.direction)
    const interval = setInterval(() => {
      moveDesk(movingTo.direction)
    }, 700);

    return () => {
      clearInterval(interval)
    }
  }, [movingTo])

  // listen to movement and attempt to stop desk when needed
  useEffect(() => {
    if (
      (movingTo.direction == 'up' && position >= movingTo.position) ||
      (movingTo.direction == 'down' && position <= movingTo.position)
    ) {
      setMovingTo({})
      stopDesk()
    }
  }, [position])


  const onPair = async () => {
    try {
      await desk.request()
      await desk.connect()

      await desk.onPositionChange((evt) => {
        const value = evt.target.value
        setPosition(bufferToNum(value.buffer))
      })

      const currentPos = bufferToNum(await desk.getCurrentPosition())
      setPosition(currentPos)
      setPaired(true)
    } catch(error) {
      alert(error)
    }
  }

  const moveDesk = (direction = 'down') => {
    try {
      if (direction == 'up') desk.moveUp()
      else if (direction == 'down') desk.moveDown()
    } catch(error) {
      alert(error)
    }
  }

  const onPosition = async (memSpot) => {
    if (storingMem) {
      localStorage.setItem(`memory-${memSpot}`, position);
      setMem({...mem, [memSpot]: position});
      setStoringMem(false);
      return
    }

    // otherwise, move to position
    const storedPosition = Number(localStorage.getItem(`memory-${memSpot}`))
    const direction = position < storedPosition ? 'up' : 'down'
    setMovingTo({
      direction,
      position: storedPosition
    })
  }

  const stopDesk = () => {
    desk._stop()
  }

  const onClickMem = () => {
    setStoringMem(!storingMem)
  }

  return (
    <Root>
      <CtrlContainer>
        <TitleBar>
          <a href={REPO_URL} target="_blank">Deskomatik <small>v0.9.1</small></a>
        </TitleBar>

        <Btn onClick={onPair} title="pair bluetooth" className={`blue-tooth ${!paired && 'green'}`}>
          <i className="material-icons">bluetooth</i>
        </Btn>

        <Position className={!paired && 'disabled'}>
          {toInches(position)}
        </Position>

        <Btn onClick={() => moveDesk('up')} tile="move desk up" disabled={!paired || storingMem}>
          <i className="material-icons">arrow_upward</i>
        </Btn>
        <Btn onClick={() => moveDesk('down')} title="move desk down" disabled={!paired || storingMem}>
          <i className="material-icons">arrow_downward</i>
        </Btn>

        <Btn
          onClick={() => onPosition(1)}
          title={`move desk to memory 1 (${toInches(mem[1])})`}
          className={`mem-btn ${storingMem && 'green'}`}
          disabled={!paired}
        >
          1
        </Btn>
        <Btn
          onClick={() => onPosition(2)}
          title={`move desk to memory 2 (${toInches(mem[2])})`}
          className={`mem-btn ${storingMem && 'green'}`}
          disabled={!paired}
        >
          2
        </Btn>
        <Btn
          onClick={() => onPosition(3)}
          title={`move desk to memory 3 (${toInches(mem[3])})`}
          className={`mem-btn ${storingMem && 'green'}`}
          disabled={!paired}
        >
          3
        </Btn>
        <Btn
          onClick={() => onPosition(4)}
          title={`move desk to memory 4 (${toInches(mem[4])})`}
          className={`mem-btn ${storingMem && 'green'}`}
          disabled={!paired}
        >
          4
        </Btn>

        <Btn
          onClick={onClickMem}
          title="save to memory"
          className={`mem-btn ${storingMem && 'red'}`}
          disabled={!paired}
        >
          M
        </Btn>

      </CtrlContainer>
    </Root>
  )
}

const Root = styled.div`
  height: 100%;
`

const TitleBar = styled.div`
  font-size: .8em;
  color: #d2d2d2;

  & a,
  & a:visited {
    text-decoration: none;
    color: inherit;
  }

  & a:hover {
    color: #aaa;
  }

  & small {
    opacity: 0.75;
  }
`

const CtrlContainer = styled.div`
  -webkit-app-region: drag;
  width: 550px;
  height: 80px;
  background: #222;
  position: relative;
  display: block;
  padding: 10px;
  display: table;
`

const backgroundColor = '#222'
const btnOnColor = '#f2f2f2'
const btnHoverColor = '#aaa'

const disabledColor = '#888'

const smallBtnWidth = '1.75em'
const medBtnWidth = '50px'
const wideBtnWidth = '75px'

const Btn = styled.button`
  display: table-cell;
  user-select: none;
  cursor: pointer;
  width: ${medBtnWidth};
  height: 28px;
  text-decoration: none;
  background: ${backgroundColor};
  color: ${btnOnColor};
  border: 1px solid ${btnOnColor};
  border-radius: 5px;
  margin: 20px 5px;
  vertical-align: bottom;

  &.blue-tooth {
    width: ${wideBtnWidth};
  }

  :hover {
    color: ${btnHoverColor};
    border: 1px solid ${btnHoverColor};
    box-shadow: 0 0 3px ${btnHoverColor};

  }

  &:disabled {
    cursor: not-allowed;
    border-color: ${disabledColor};
    color: ${disabledColor};
  }

  &:focus {
    outline: none;
  }

  &.mem-btn,
  &.save-mem-btn {
    font-size: 22px;
    line-height: 1;
    width: ${smallBtnWidth};
  }

  &.green {
    border: 1px solid #00b24b;
    color: #00b24b;
    box-shadow: 0 0 5px #00b24b;

    animation: flash 1.2s infinite;

    @keyframes flash {
      50% { color: ${btnOnColor}; box-shadow: 0 0 5px ${btnOnColor};   border-color: ${btnOnColor}; }
    }
  }

  &.red {
    border: 1px solid #f50000;
    color: #f50000;
    box-shadow: 0 0 10px #f50000;
  }
`

const Position = styled.button`
  font-family: 'Orbitron';
  font-size: 1.2em;
  display: table-cell;
  user-select: none;
  width: ${wideBtnWidth};
  height: 28px;
  background: #000;
  color: ${btnOnColor};
  border: none;
  border-radius: 5px;
  margin: 20px 5px;

  outline-style: double;
  outline-color: #444;
  outline-width: 2px;

  &.disabled {
    color: ${disabledColor};
  }
`


render(<App />, document.getElementById('app'));
