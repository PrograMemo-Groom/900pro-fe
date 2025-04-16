// import React from 'react'
import styles from '@/css/history/Chat.module.scss'

function ChatInput() {
  return (
    <footer className={styles.input_container}>
        <input type='text' placeholder='메시지 입력'></input>
        <button>↑
        </button>
  </footer>
  )
}

export default ChatInput
