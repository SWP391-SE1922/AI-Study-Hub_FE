const prisma = require('../config/database');
const { getStorageService } = require('../config/storage');
const { getPaginationParams, getPaginationMetadata } = require('../utils/pagination');

const storageService = getStorageService();

const createDocument = async (userId, file, data) => {
  const { title, description, subject, subjectId, categoryId, isPublic } = data;

  const fileData = await storageService.upload(file);

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new Error('Danh mục tài liệu không hợp lệ hoặc đã bị xóa');
    }
  }

  if (subjectId) {
    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subjectExists) {
      throw new Error('Môn học không hợp lệ hoặc đã bị xóa');
    }
  }

  const document = await prisma.document.create({
    data: {
      title,
      description,
      subject,
      subjectId: subjectId || null,
      categoryId: categoryId || null,
      isPublic: isPublic !== undefined ? isPublic : true,

      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,

      uploadedBy: userId,
      currentVersion: 1,
    },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      subjectRef: {
        select: { id: true, name: true, code: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
  });

  await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      version: 1,
      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
      uploadedBy: userId,
    },
  });

  return document;
};

const getAllDocuments = async (currentUser, queryParams) => {
  const { page, limit, skip, take } = getPaginationParams(queryParams);
  const { search, categoryId, subject, subjectId, uploadedBy, sortBy, sortOrder } = queryParams;

  let visibilityCondition = { isPublic: true };

  if (currentUser) {
    if (currentUser.role === 'ADMIN') {
      visibilityCondition = {};
    } else {
      visibilityCondition = {
        OR: [{ isPublic: true }, { uploadedBy: currentUser.id }],
      };
    }
  }

  const where = {
    ...visibilityCondition,
  };

  if (search) {
    const cleanSearch = search.trim();
    where.OR = [
      ...(where.OR || []),
      { title: { contains: cleanSearch } },
      { description: { contains: cleanSearch } },
      { subject: { contains: cleanSearch } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (subject) where.subject = { contains: subject };
  if (subjectId) where.subjectId = subjectId;

  if (uploadedBy && currentUser && currentUser.role === 'ADMIN') {
    where.uploadedBy = uploadedBy;
  }

  const allowedSortFields = ['createdAt', 'title', 'downloadCount', 'fileSize'];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const total = await prisma.document.count({ where });

  const documents = await prisma.document.findMany({
    where,
    skip,
    take,
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      subjectRef: {
        select: { id: true, name: true, code: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      [finalSortBy]: finalSortOrder,
    },
  });

  const pagination = getPaginationMetadata(total, page, limit);

  return { documents, pagination };
};

const getDocumentById = async (currentUser, id) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      subjectRef: {
        select: { id: true, name: true, code: true },
      },
      category: {
        select: { id: true, name: true },
      },
      versions: {
        orderBy: { version: 'desc' },
      },
    },
  });

  if (!document) {
    const error = new Error('Không tìm thấy tài liệu yêu cầu.');
    error.statusCode = 404;
    throw error;
  }

  if (!document.isPublic) {
    if (!currentUser || (document.uploadedBy !== currentUser.id && currentUser.role !== 'ADMIN')) {
      const error = new Error('Bạn không có quyền truy cập tài liệu riêng tư này.');
      error.statusCode = 403;
      throw error;
    }
  }

  return document;
};

const updateDocument = async (userId, userRole, id, data, file = null) => {
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    const error = new Error('Không tìm thấy tài liệu.');
    error.statusCode = 404;
    throw error;
  }

  if (document.uploadedBy !== userId && userRole !== 'ADMIN') {
    const error = new Error('Bạn không có quyền chỉnh sửa tài liệu này.');
    error.statusCode = 403;
    throw error;
  }

  const { title, description, subject, subjectId, categoryId, isPublic } = data;

  if (categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new Error('Danh mục tài liệu không hợp lệ');
    }
  }

  if (subjectId) {
    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subjectExists) {
      throw new Error('Môn học không hợp lệ');
    }
  }

  const updateData = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(subject !== undefined && { subject }),
    ...(subjectId !== undefined && { subjectId: subjectId || null }),
    ...(categoryId !== undefined && { categoryId: categoryId || null }),
    ...(isPublic !== undefined && { isPublic }),
  };

  if (file) {
    const fileData = await storageService.upload(file);
    const nextVersion = document.currentVersion + 1;

    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: nextVersion,
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
        uploadedBy: userId,
      },
    });

    updateData.fileUrl = fileData.fileUrl;
    updateData.fileName = fileData.fileName;
    updateData.fileSize = fileData.fileSize;
    updateData.mimeType = fileData.mimeType;
    updateData.currentVersion = nextVersion;
  }

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      subjectRef: {
        select: { id: true, name: true, code: true },
      },
      category: {
        select: { id: true, name: true },
      },
      versions: {
        orderBy: { version: 'desc' },
      },
    },
  });

  return updatedDocument;
};

const deleteDocument = async (userId, userRole, id) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      versions: true,
    },
  });

  if (!document) {
    const error = new Error('Không tìm thấy tài liệu.');
    error.statusCode = 404;
    throw error;
  }

  if (document.uploadedBy !== userId && userRole !== 'ADMIN') {
    const error = new Error('Bạn không có quyền xóa tài liệu này.');
    error.statusCode = 403;
    throw error;
  }

  for (const version of document.versions) {
    await storageService.delete(version.fileUrl);
  }

  await prisma.document.delete({
    where: { id },
  });

  return true;
};

const downloadDocument = async (currentUser, id) => {
  const document = await getDocumentById(currentUser, id);

  await prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });

  const downloadUrl = storageService.getDownloadUrl(document.fileUrl);

  return {
    downloadUrl,
    fileName: document.fileName,
    mimeType: document.mimeType,
  };
};

const getMyDocuments = async (userId, queryParams) => {
  const { page, limit, skip, take } = getPaginationParams(queryParams);
  const { search, sortBy, sortOrder } = queryParams;

  const where = {
    uploadedBy: userId,
  };

  if (search) {
    const cleanSearch = search.trim();
    where.OR = [
      { title: { contains: cleanSearch } },
      { description: { contains: cleanSearch } },
      { subject: { contains: cleanSearch } },
    ];
  }

  const allowedSortFields = ['createdAt', 'title', 'downloadCount', 'fileSize'];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const finalSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const total = await prisma.document.count({ where });

  const documents = await prisma.document.findMany({
    where,
    skip,
    take,
    include: {
      subjectRef: {
        select: { id: true, name: true, code: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      [finalSortBy]: finalSortOrder,
    },
  });

  const pagination = getPaginationMetadata(total, page, limit);

  return { documents, pagination };
};

const getDocumentVersions = async (userId, userRole, documentId) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    const error = new Error('Không tìm thấy tài liệu');
    error.statusCode = 404;
    throw error;
  }

  if (!document.isPublic && document.uploadedBy !== userId && userRole !== 'ADMIN') {
    const error = new Error('Bạn không có quyền xem tài liệu này');
    error.statusCode = 403;
    throw error;
  }

  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: 'desc' },
  });
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getMyDocuments,
  getDocumentVersions,
};