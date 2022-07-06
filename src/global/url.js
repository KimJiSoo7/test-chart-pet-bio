// https://stackoverflow.com/questions/60548707/neterr-ssl-protocol-error-on-http-post-to-express-server
const PROTOCAL = "http"; // https사용하려면 certificate 필요한듯..?
const HOST = "localhost";
const PORT_WEB = 8081;
const PORT_API = 8080;

export const URL_WEB_SERVER = `${PROTOCAL}://${HOST}:${PORT_WEB}`;
// export const URL_API_SERVER = `${PROTOCAL}://${HOST}:${PORT_API}`;
