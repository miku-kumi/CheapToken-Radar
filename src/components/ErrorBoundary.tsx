import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** 自訂失敗畫面：收到錯誤物件與重設函式 */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  error: Error | null;
}

/** 可重用的錯誤邊界：把渲染崩潰限制在局部，不讓整頁白屏 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // 同步丟到 console，方便開發者／使用者回報確切錯誤
    console.error("[ErrorBoundary]", error);
    this.props.onError?.(error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback ? this.props.fallback(this.state.error, this.reset) : null;
    }
    return this.props.children;
  }
}
