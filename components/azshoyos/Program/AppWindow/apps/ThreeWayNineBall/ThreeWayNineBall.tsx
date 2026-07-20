import styles from "./app.module.css";
import {ChangeEvent, useEffect, useState} from "react";



const App = () => {
  const [inMenu, setInMenu] = useState(true)
  const [nameA, setNameA] = useState("Player A")
  const [nameB, setNameB] = useState("Player B")
  const [nameC, setNameC] = useState("Player C")

  return (
    <div className={styles.main}>
      {inMenu ?
        <>
          <div>
          <div className={styles.header}>3 way 9 ball</div>
          <div className={styles.subheader}>Tracker of turns</div>
          </div>
      <div className={styles.players}>
        <input onChange={(e) => setNameA(e.target.value)} value={nameA}/>
        <input onChange={(e) => setNameB(e.target.value)} value={nameB}/>
        <input onChange={(e) => setNameC(e.target.value)} value={nameC}/>
        <div className={styles.button} onClick={() => setInMenu(false)}>StartGame</div>
      </div>
        </>
        :
      <ActualGame names={[nameA, nameB, nameC]}/>
      }
    </div>
  )
}

const ActualGame = ({names}:{names: [string, string, string]}) => {
  const [dir, setDir] = useState<1 | -1>(1)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [scoreC, setScoreC] = useState(0)
  const [cursor, setCursor] = useState(0)
  const [action, setAction] = useState<'' | 'next' | 'flip' | 'scoreA' | 'scoreB' | 'scoreC' | 'unscoreA' | 'unscoreB' | 'unscoreC' | 'randomize'>('')
  const nextPlayer = (c:number, d: 1 | -1) => {
    let nCursor = c + d
    if (nCursor < 0) nCursor = 2
    if (nCursor > 2) nCursor = 0
    setCursor(nCursor)
  }
  const swapDir = (d: 1 | -1) => {
    setDir((d * -1) as 1 | -1)
    return (d * -1) as 1 | -1
  }
  const randomize = () => {
    const d = Math.floor(Math.random()*1000) % 2
    const p = Math.floor(Math.random()*1000) % 3
    if (d == 0) setDir(1)
    if (d == 1) setDir(-1)
    setCursor(p)
  }
  const keypressHandler = (e:KeyboardEvent) => {
    e.preventDefault()
    if (e.key == " " || e.key == "Spacebar"){
      setAction('next')
    }
    if (e.key == "Backspace"){
      console.log("backspaced")
      setAction('flip')
    }
    if (e.key == "r"){
      console.log("backspaced")
      setAction('flip')
    }
    if (e.code == "Digit1"){
      if (!e.shiftKey) {
        setAction('scoreA')
      } else {
        setAction('unscoreA')
      }
    }
    if (e.code == "Digit2"){
      if (!e.shiftKey) {
        setAction('scoreB')
      } else {
        setAction('unscoreB')
      }
    }
    if (e.code == "Digit3"){
      if (!e.shiftKey) {
        setAction('scoreC')
      } else {
        setAction('unscoreC')
      }
    }
  }
  useEffect(() => {
    if (window && document){
      randomize()
      document.addEventListener('keydown', keypressHandler)
      return () => document.removeEventListener('keypress', keypressHandler)
    }
  }, [])
  useEffect(() => {
    if (action !== "") {
      setAction("")
      switch (action) {
        case "flip":
          nextPlayer(cursor, swapDir(dir))
          break
        case "next":
          nextPlayer(cursor, dir)
          break
        case "randomize":
          randomize()
          break
        case "scoreA":
          setScoreA(scoreA + 1)
          break
        case "unscoreA":
          setScoreA(scoreA - 1)
          break
        case "scoreB":
          setScoreB(scoreB + 1)
          break
        case "unscoreB":
          setScoreB(scoreB - 1)
          break
        case "scoreC":
          setScoreC(scoreC + 1)
          break
        case "unscoreC":
          setScoreC(scoreC - 1)
          break
      }
      setAction("")

    }
  }, [action, cursor, dir, scoreA, scoreB, scoreC])
  return (
    <div className={styles.game}>
      <div className={styles.helper}>
        <span className={styles.action}>Next</span>: <span className={styles.key}>Space</span>,
        <span className={styles.action}> Flip</span>: <span className={styles.key}>Backspace</span>,
          <span className={styles.action}> Score</span>: <span className={styles.key}>1</span> / <span className={styles.key}>2</span> / <span className={styles.key}>3</span> <span className={styles.hold}>[Hold <span className={styles.key}>Shift</span> to <span className={styles.action}>subtract</span>]</span></div>
      <div className={styles.tracker}>
        <div className={cursor == 0 ? styles.active : ""}>
          {names[0]}
          <br/>
          <span className={styles.score}>{scoreA}</span>
        </div>
        <div className={cursor == 1 ? styles.active : ""}>
          {names[1]}
          <br/>
          <span className={styles.score}>{scoreB}</span>
        </div>
        <div className={cursor == 2 ? styles.active : ""}>
          {names[2]}
          <br/>
          <span className={styles.score}>{scoreC}</span>
        </div>
      </div>
      <div className={styles.arrow}>
        <div className={dir == -1 ? styles.flipped : ""}>{"-->"}</div>
      </div>
    </div>
  )
}


export const ThreeWayNineBall = {
  name: "3way9ball",
  app: <App/>
}