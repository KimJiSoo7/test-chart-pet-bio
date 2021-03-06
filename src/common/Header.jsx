import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80px;
`;

const Title = styled.span`
  color: #333333;
  font-weight: bold;
  font-size: 30px;
`;

const Button = styled.button`
  width: 60px;
  height: 50px;
  border: none;
  background-color: transparent;
  color: #333333;
  font-weight: bold;
  margin-left: 8px;
  &:hover {
    cursor: pointer;
  }
`;

const RightButton = styled(Button)`
  visibility: ${(props) => (props.path !== "" ? "hidden" : "")};
  margin-right: 8px;
`;

const Img = styled.img`
  width: 50px;
  height: 50px;
`;

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  let path = "";
  let title = "";

  if (location) {
    path = location.pathname.substring(1);
    switch (path) {
      case "": // Home
        title = "요약";
        break;
      case "register":
        title = "";
        break;
      case "charts/1":
        title = "심박수";
        break;
      case "charts/2":
        title = "호흡수";
        break;
      case "notice":
        title = "건강 이상 알림";
        break;
    }
  }

  console.log("location>> ", location);
  return (
    <Wrapper path={path}>
      <Button
        path={path}
        onClick={() => {
          if (path === "") {
            navigate("/register");
          } else {
            navigate("/");
          }
        }}
      >
        {path === "" ? "Register" : "Home"}
      </Button>
      <Title>{title}</Title>
      <RightButton
        path={path}
        onClick={() => {
          navigate("/notice");
        }}
      >
        {/* <Img src="https://cdn0.iconfinder.com/data/icons/user-interface-material-4-1/26/368-512.png" /> */}
        Notice
      </RightButton>
    </Wrapper>
  );
}
export default Header;
