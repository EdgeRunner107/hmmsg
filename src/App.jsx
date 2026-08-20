import SenderPage from "./pages/SenderPage.jsx";
import DisplayPage from "./pages/DisplayPage.jsx";

function normalizePath(pathname) {
  const clean = pathname.replace(/\/+$/, "");
  return clean || "/";
}

export default function App() {
  const path = normalizePath(window.location.pathname);

  if (path === "/hyukmin") {
    return <SenderPage sender="혁민" title="혁민 메시지 입력" />;
  }

  if (path === "/iroi") {
    return <SenderPage sender="이로이" title="이로이 메시지 입력" />;
  }

  if (path === "/display" || path === "/") {
    return <DisplayPage />;
  }

  return (
    <main className="not-found">
      <h1>페이지를 찾을 수 없습니다.</h1>
      <a href="/hyukmin">혁민 메시지 페이지</a>
      <a href="/iroi">이로이 메시지 페이지</a>
      <a href="/display">통합 메시지 페이지</a>
    </main>
  );
}
