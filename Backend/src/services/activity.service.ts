import AuditLog from "../models/audit-log.model.js";

interface ActivityQuery {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  module?: string;
  status?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getActivityHistory = async (userId: string, query: ActivityQuery) => {
  const { page, limit, search, type, module, status, date, dateFrom, dateTo } = query;

  const filter: Record<string, any> = { userId };

  // Action/type filter
  if (type) {
    filter.action = type;
  }

  // Module filter
  if (module) {
    filter.module = module;
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Single date filter
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: dayStart, $lte: dayEnd };
  }

  // Date range filter
  if (dateFrom || dateTo) {
    filter.createdAt = filter.createdAt || {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  // Search across description, action, module, metadata
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
      { module: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("action module description status metadata ipAddress createdAt"),
    AuditLog.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
