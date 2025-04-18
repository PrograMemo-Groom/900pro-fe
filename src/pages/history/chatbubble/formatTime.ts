export function formatTime(timeStr: string) {
    const time = new Date(timeStr);
    const h = time.getHours();
    const m = String(time.getMinutes()).padStart(2, '0'); // 두자리 문자열 포맷팅
    const ampm = h >= 12 ? '오후' : '오전';
    const hour = h % 12 || 12;
    return `${ampm} ${hour}:${m}`;
}