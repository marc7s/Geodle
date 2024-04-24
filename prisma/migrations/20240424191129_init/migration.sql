BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Country] (
    [id] INT NOT NULL IDENTITY(1,1),
    [iso2Code] VARCHAR(2) NOT NULL,
    [iso3Code] VARCHAR(3) NOT NULL,
    [englishShortName] NVARCHAR(1000) NOT NULL,
    [englishLongName] NVARCHAR(1000),
    [domesticName] NVARCHAR(1000) NOT NULL,
    [aliases] NVARCHAR(max) NOT NULL,
    [lat] FLOAT(53) NOT NULL,
    [long] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Country_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Country_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Country_iso2Code_key] UNIQUE NONCLUSTERED ([iso2Code]),
    CONSTRAINT [Country_iso3Code_key] UNIQUE NONCLUSTERED ([iso3Code]),
    CONSTRAINT [Country_englishShortName_key] UNIQUE NONCLUSTERED ([englishShortName]),
    CONSTRAINT [Country_domesticName_key] UNIQUE NONCLUSTERED ([domesticName])
);

-- CreateTable
CREATE TABLE [dbo].[City] (
    [id] INT NOT NULL IDENTITY(1,1),
    [englishName] NVARCHAR(1000) NOT NULL,
    [domesticName] NVARCHAR(1000),
    [aliases] NVARCHAR(1000) NOT NULL,
    [isCapital] BIT NOT NULL,
    [lat] FLOAT(53) NOT NULL,
    [long] FLOAT(53) NOT NULL,
    [countryId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [City_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [City_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [City_englishName_lat_long_key] UNIQUE NONCLUSTERED ([englishName],[lat],[long])
);

-- AddForeignKey
ALTER TABLE [dbo].[City] ADD CONSTRAINT [City_countryId_fkey] FOREIGN KEY ([countryId]) REFERENCES [dbo].[Country]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
