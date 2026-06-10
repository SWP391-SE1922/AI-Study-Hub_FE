BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[documents] ADD [currentVersion] INT NOT NULL CONSTRAINT [documents_currentVersion_df] DEFAULT 1;

-- CreateTable
CREATE TABLE [dbo].[document_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL,
    [fileUrl] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [fileSize] INT NOT NULL,
    [mimeType] NVARCHAR(1000) NOT NULL,
    [uploadedBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [document_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [document_versions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[document_versions] ADD CONSTRAINT [document_versions_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[documents]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
