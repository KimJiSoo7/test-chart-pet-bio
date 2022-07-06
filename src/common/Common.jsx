import styled from "styled-components";

export const Label = styled.label`
  padding: 12px;
  /* background-color: red; */
  font-size: 24px;
  font-weight: ${(props) => props.weight && "bold"};
  padding-left: 5px;
  color: ${(props) => props.color || "black"};
`;
