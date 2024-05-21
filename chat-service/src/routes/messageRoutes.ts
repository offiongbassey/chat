import express from 'express';
import MessageController from '../controllers/MessageController';
import { authMiddleware } from '../middleware';

const router = express.Router();

//@ts-ignore
router.post('/send', authMiddleware, MessageController.send);
router.get(
    '/get/:receiverId',
    //@ts-ignore
    authMiddleware,
    MessageController.getConversation
);

export default router;