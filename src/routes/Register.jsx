import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Label } from "../common/Common";
import { PHONE_ID } from "../global/deviceInfo";
import { URL_WEB_SERVER } from "../global/url";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  height: 80vh;
  width: 90vw;
  padding: 10px 3px;
`;

const Input = styled.input`
  width: 94%;
  height: 40px;
  margin-top: 4px;
  margin-left: 4px;
  padding-left: 4px;
  font-size: 22px;
`;

const Button = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 90%;
  font-size: 24px;
  background-color: yellow;
  border: 0;
  padding: 12px 1px;
`;

const WrapperModal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 80vh;
  width: 90vw;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 10px 3px; // same as Wrapper
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 180px;
  height: 120px;
  padding: 10px 10px;
  background-color: white;
  border-radius: 15px;
`;

const Paragraph = styled.p`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  margin-left: 4px;
  font-size: 20px;
  color: red;
  margin: 0px 5px;
  font-weight: 350;
`;

function Register() {
  const [modal, setModal] = useState(false);
  const [registeredId, setRegisteredId] = useState(""); // 스마트폰 단말기 하나당 등록가능한 디바이스는 하나로 가정, 여러대 등록 가능하면 []로 바꾸기
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const onSubmit = (data) => {
    // https는 3000 port 사용 못하는 듯..?
    axios
      .post(`${URL_WEB_SERVER}/register/update`, {
        id: data.id,
        phoneId: PHONE_ID,
      })
      .then((res) => {
        if (res.data.affectedRows) {
          navigate("/");
        } else {
          setModal((prev) => (prev = true));
        }
      });
  };

  /**
   * useState()
   * call function to web server , check registered id
   * if so, <p> {show registerd id} </p>
   * if not, <p> {there is nothing registerd id} </p>
   */
  useState(() => {
    try {
      axios
        .post(`${URL_WEB_SERVER}/register`, {
          id: PHONE_ID, // jskim(registered), jskim2(not registered)
        })
        .then((res) => {
          if (res.data[0].length) {
            if (res.data[0][0].device_id !== "") {
              setRegisteredId((prev) => (prev = res.data[0][0].device_id));
            }
          } else {
            setRegisteredId((prev) => (prev = "현재 등록된 기기가 없습니다."));
          }
        });
    } catch (err) {
      console.log("Error>> ", err);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrapper>
        <Label>현재 등록 기기</Label>
        <Paragraph>{registeredId}</Paragraph>
        <Label>기기 정보 등록</Label>
        <Input
          type="number"
          placeholder="기기 번호 입력"
          onKeyDown={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(
              /[^0-9]/g,
              ""
            );
          }}
          {...register("id", {
            required: "기기번호를 입력해 주세요",
            minLength: {
              value: 8,
              message: "기기번호를 정확히 입력해 주세요.",
            },
            maxLength: {
              value: 8,
              message: "기기번호를 정확히 입력해 주세요.",
            },
            // validate: {
            //   isRegistered: (value) => {
            //     const result = value === isValidDevice();
            //     return result || "기기번호를 정확히 입력해 주세요.";
            //   },
            // },
            // isValidLength: (value) => {
            //   console.log(value);
            //   const result = value.length === 8;
            //   return result || "기기번호를 정확히 입력해 주세요.";
            // },
          })}
        />
        <Paragraph>{errors?.id?.message}</Paragraph>
        <Button type="submit" disabled={!formState.isValid}>
          연결하기
        </Button>
        {modal && (
          <WrapperModal>
            <Modal>
              입력하신 기기 정보가 존재하지 않습니다. 기기 번호를 다시 확인해
              주세요.
              <button
                style={{ position: "absolute", bottom: 5 }}
                onClick={() => {
                  setModal((prev) => (prev = false));
                }}
              >
                확 인
              </button>
            </Modal>
          </WrapperModal>
        )}
      </Wrapper>
    </form>
  );
}
export default Register;
