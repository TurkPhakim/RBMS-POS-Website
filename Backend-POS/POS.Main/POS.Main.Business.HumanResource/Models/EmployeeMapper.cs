using POS.Main.Dal.Entities;

namespace POS.Main.Business.HumanResource.Models;

public static class EmployeeMapper
{
    public static TbEmployee ToEntity(CreateEmployeeRequestModel request)
        => new()
        {
            Title = request.Title,
            FirstNameThai = request.FirstNameThai,
            LastNameThai = request.LastNameThai,
            FirstNameEnglish = request.FirstNameEnglish,
            LastNameEnglish = request.LastNameEnglish,
            Nickname = request.Nickname,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            NationalId = request.NationalId,
            BankAccountNumber = request.BankAccountNumber,
            BankName = request.BankName,
            EmploymentStatus = request.EmploymentStatus,
            PositionId = request.PositionId,
            Phone = request.Phone,
            Email = request.Email,
            Salary = request.Salary,
            IsActive = request.IsActive,
            UserId = request.UserId
        };

    public static void UpdateEntity(TbEmployee entity, UpdateEmployeeRequestModel request)
    {
        entity.Title = request.Title;
        entity.FirstNameThai = request.FirstNameThai;
        entity.LastNameThai = request.LastNameThai;
        entity.FirstNameEnglish = request.FirstNameEnglish;
        entity.LastNameEnglish = request.LastNameEnglish;
        entity.Nickname = request.Nickname;
        entity.Gender = request.Gender;
        entity.DateOfBirth = request.DateOfBirth;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.NationalId = request.NationalId;
        entity.BankAccountNumber = request.BankAccountNumber;
        entity.BankName = request.BankName;
        entity.EmploymentStatus = request.EmploymentStatus;
        entity.PositionId = request.PositionId;
        entity.Phone = request.Phone;
        entity.Email = request.Email;
        entity.Salary = request.Salary;
        entity.IsActive = request.IsActive;
        entity.UserId = request.UserId;
    }

    public static EmployeeResponseModel ToResponse(TbEmployee entity)
        => new()
        {
            EmployeeId = entity.EmployeeId,
            Title = entity.Title,
            FirstNameThai = entity.FirstNameThai,
            LastNameThai = entity.LastNameThai,
            FirstNameEnglish = entity.FirstNameEnglish,
            LastNameEnglish = entity.LastNameEnglish,
            Nickname = entity.Nickname,
            Gender = entity.Gender,
            DateOfBirth = entity.DateOfBirth,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            NationalId = entity.NationalId,
            BankAccountNumber = entity.BankAccountNumber,
            BankName = entity.BankName,
            EmploymentStatus = entity.EmploymentStatus,
            PositionId = entity.PositionId,
            PositionName = entity.Position?.PositionName,
            Phone = entity.Phone,
            Email = entity.Email,
            Salary = entity.Salary,
            ImageFileId = entity.ImageFileId,
            ImageFileName = entity.ImageFile?.FileName,
            IsActive = entity.IsActive,
            UserId = entity.UserId,
            Username = entity.User?.Username,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString()
        };
}
