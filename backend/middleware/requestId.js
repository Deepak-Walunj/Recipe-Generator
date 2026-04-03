import { v4 as uuidv4 } from 'uuid';
import { withRequestId } from '../core/logger.js';

export default function requestId(req, res, next) {
  const id = uuidv4();
  withRequestId(id, () => {
    req.request_id = id;
    next();
  });
};
