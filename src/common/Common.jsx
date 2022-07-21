import styled from "styled-components";

export const Label = styled.label`
  font-size: 24px;
  font-weight: ${(props) => props.weight || "bold"};
  color: ${(props) => props.color || "black"};
`;

export const Hr = styled.div`
  width: 100%;
  height: ${(props) => props.height || "1px"};
  background-color: #5a5865;
`;
