const prisma = require('../config/database');
const { getPaginationParams, getPaginationMetadata } = require('../utils/pagination');
const bcrypt = require('bcrypt');

/**
 * Lấy danh sách người dùng kèm phân trang & tìm kiếm (Admin Only)
 */
const getAllUsers = async (queryParams) => {
  const { page, limit, skip, take } = getPaginationParams(queryParams);
  const { search } = queryParams;

  // Xây dựng điều kiện lọc
  const where = {};
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { fullName: { contains: search } },
    ];
  }

  // Lấy tổng số người dùng thỏa mãn điều kiện
  const total = await prisma.user.count({ where });

  // Lấy danh sách dữ liệu
  const users = await prisma.user.findMany({
    where,
    skip,
    take,
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      usedStorage: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const pagination = getPaginationMetadata(total, page, limit);

  return { users, pagination };
};

/**
 * Lấy thông tin người dùng theo ID (Admin Only)
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      usedStorage: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error('Không tìm thấy người dùng.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Cập nhật quyền của người dùng (Admin Only)
 */
const updateUserRole = async (id, role) => {
  // Kiểm tra user có tồn tại không
  await getUserById(id);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  return updatedUser;
};

/**
 * Xóa người dùng (Admin Only)
 */
const deleteUser = async (id) => {
  // Kiểm tra user có tồn tại không
  await getUserById(id);

  // Xóa tài khoản (các Document liên kết sẽ tự động bị xóa qua onDelete: Cascade)
  await prisma.user.delete({ where: { id } });
  return true;
};

/**
 * Cập nhật thông tin cá nhân của User hiện tại
 */
const updateProfile = async (userId, data) => {
  const { fullName, avatarUrl } = data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      usedStorage: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Tạo mới người dùng (Admin Only)
 */
const createUser = async (data) => {
  const { email, fullName, role, password } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email này đã được sử dụng trên hệ thống.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      fullName,
      role: role || 'USER',
      password: hashedPassword,
      isVerified: true,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return newUser;
};

/**
 * Cập nhật thông tin chi tiết người dùng (Admin Only)
 */
const updateUser = async (id, data) => {
  const { email, fullName, role, isVerified, storageLimit, password } = data;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('Không tìm thấy người dùng.');
    error.statusCode = 404;
    throw error;
  }

  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('Email này đã được sử dụng trên hệ thống.');
      error.statusCode = 400;
      throw error;
    }
  }

  const updateData = {
    ...(email !== undefined && { email }),
    ...(fullName !== undefined && { fullName }),
    ...(role !== undefined && { role }),
    ...(isVerified !== undefined && { isVerified }),
    ...(storageLimit !== undefined && { storageLimit }),
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
      usedStorage: true,
      storageLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  updateProfile,
  createUser,
  updateUser,
};
