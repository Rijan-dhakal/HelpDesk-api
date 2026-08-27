import { prisma } from "../config/prisma";

interface IAuditLog {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, any>;
}

const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  details,
}: IAuditLog) => {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details || {},
    },
  });
};
