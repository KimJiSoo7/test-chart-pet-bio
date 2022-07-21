import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Label } from "../common/Common";
import { PHONE_ID } from "../global/globalVariables";
import { URL_WEB_SERVER } from "../global/url";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
  background-color: #f2f3f7;
`;

const Box = styled.div`
  /* background-color: purple; */
  margin: 15px 20px;
`;

const Input = styled.input`
  width: 94%;
  height: 60px;
  margin-top: 15px;
  padding-left: 15px;
  font-size: 22px;
  /* border-color: ; */
  border: 2px solid #dedfe0;
  border-radius: 15px;
  color: #333333;
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    /* margin: 0; */
  }
  &:focus {
    /* outline: 1px solid #ff6f0b; */
    outline: none;
    border-color: #d6a8e9;
    box-shadow: 0 0 10px #d6a8e9;
  }
`;

const Button = styled.button`
  width: 90%;
  height: 60px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  margin-bottom: 30px;
  font-size: 24px;
  color: white;
  background-color: #602deb;
  border: 0;
  border-radius: 10px;
  &:hover {
    opacity: 0.9;
  }
`;

const WrapperModal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
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
  margin-top: 15px;
  font-size: 20px;
  color: #ff6f0b;
  font-weight: 350;
`;

function Register() {
  const [modal, setModal] = useState(false);
  const [registeredId, setRegisteredId] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const registerDevice = async (data) => {
    const response = await axios.post(`${URL_WEB_SERVER}/register`, {
      id: data.id,
      phoneId: PHONE_ID,
    });
    if (response.data.affectedRows) {
      navigate("/");
    } else {
      setModal(true);
    }
  };

  const getDeviceId = async () => {
    const response = await axios.get(`${URL_WEB_SERVER}/register`, {
      params: {
        id: PHONE_ID, // jskim(registered), jskim2(not registered)
      },
    });
    const data = response.data[0];
    if (response.data[0].length) {
      if (data[0].device_id !== "") {
        setRegisteredId((prev) => (prev = data[0].device_id));
      }
    } else {
      setRegisteredId((prev) => (prev = "현재 등록된 기기가 없습니다."));
    }
  };

  const onSubmit = (data) => {
    // https는 3000 port 사용 못하는 듯..?
    registerDevice(data);
  };

  /**
   * useState()
   * call function to web server , check registered id
   * if so, <p> {show registerd id} </p>
   * if not, <p> {there is nothing registerd id} </p>
   */
  useEffect(() => {
    try {
      getDeviceId();
    } catch (err) {
      console.log("Error>> ", err);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Wrapper>
        <Box>
          <Label
            style={{
              marginBottom: "30px",
            }}
            color={"#333333"}
          >
            현재 등록 기기
          </Label>
          <Paragraph>{registeredId}</Paragraph>
        </Box>
        <Box>
          <Label color={"#333333"}>기기 정보 등록</Label>
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
        </Box>

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
