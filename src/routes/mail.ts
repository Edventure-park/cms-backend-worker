// routes/mail.ts
import { Hono } from 'hono'
import { mail_server_1 } from '../controllers/mails/mail-server-1'
import { mail_server_2 } from '../controllers/mails/mail-server-2';
import { addMailServer, getAllMailServers, getMailServerById, updateMailServerById, deleteMailServerById } from '../controllers/mails/add-mail-servers';

const mailRoute = new Hono()

mailRoute.post('/send-on-server-1', mail_server_1);
mailRoute.post('/send-on-server-2', mail_server_2);

mailRoute.post("/add-server", addMailServer);
mailRoute.get("/get-servers", getAllMailServers);
mailRoute.get("/get/server/:serverId", getMailServerById);
mailRoute.put("/update/server/:serverId", updateMailServerById);
mailRoute.delete("/delete/server/:serverId", deleteMailServerById);

export default mailRoute