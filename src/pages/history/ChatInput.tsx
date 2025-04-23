import {useState} from 'react'
import styles from '@/css/history/ChatInput.module.scss'

type Content = {
  onSubmit: (msg: string) => void;
}

function ChatInput({onSubmit} : Content) {
  const [content, setContent] = useState('');
  // useKeyword에서 관리중인 isComposing 상태 -> 한글이 두번 입력되는 오류 해결
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (trimmedContent === '') return;
    onSubmit(trimmedContent); // 전송하는 코드
    setContent('');
  }

  const handelKeyDown = (e: React.KeyboardEvent) =>{
    if (isComposing) return;
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <footer className={styles.input_container}>
        <input type='text' placeholder='메시지 입력'
               value={content}
               onChange={(e) => setContent(e.target.value)}
               onKeyDown={handelKeyDown}
               onCompositionStart={() => setIsComposing(true)}
               onCompositionEnd={() => setIsComposing(false)}
        ></input>
        <button onClick={handleSubmit}>↑
        </button>
  </footer>
  )
}

export default ChatInput
