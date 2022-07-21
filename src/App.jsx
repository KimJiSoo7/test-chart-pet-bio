import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./common/Header";
import Home from "./routes/Home";
import Register from "./routes/Register";
import Notice from "./routes/Notice";
import Charts from "./routes/Charts";
import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { RecoilRoot } from "recoil";

/**
 * <BrowserRouter> is the recommended interface for running React Router in a web browser.
 * A <BrowserRouter> stores the current location in the browser's address bar using clean URLs and navigates using the browser's built-in history stack.
 * Whenever the location changes, <Routes> looks through all its children <Route> elements to find the best match and renders that branch of the UI.
 * <Route> elements may be nested to indicate nested UI, which also correspond to nested URL paths.
 * Parent routes render their child routes by rendering an <Outlet>.
 */

const GlobalStyle = createGlobalStyle`
${reset}
body{
  font-family: "Arial", "sans-serif";
  color: #474554;
    /* line-height: 1.5; */
  }
`;

function App() {
  return (
    <RecoilRoot>
      <Router>
        <GlobalStyle />
        <Header title={""} />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/notice" element={<Notice />}></Route>
          <Route path="/charts/:gubun" element={<Charts />}></Route>
        </Routes>
      </Router>
    </RecoilRoot>
  );
}

export default App;
