using POS.Main.Business.HumanResource.Models.EmployeeAddress;
using POS.Main.Business.HumanResource.Models.EmployeeEducation;
using POS.Main.Business.HumanResource.Models.EmployeeWorkHistory;
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
            Nationality = request.Nationality,
            Religion = request.Religion,
            LineId = request.LineId,
            PositionId = request.PositionId,
            Phone = request.Phone,
            Email = request.Email,
            IsFullTime = request.IsFullTime,
            Salary = request.Salary,
            HourlyRate = request.HourlyRate,
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
        entity.Nationality = request.Nationality;
        entity.Religion = request.Religion;
        entity.LineId = request.LineId;
        entity.PositionId = request.PositionId;
        entity.Phone = request.Phone;
        entity.Email = request.Email;
        entity.IsFullTime = request.IsFullTime;
        entity.Salary = request.Salary;
        entity.HourlyRate = request.HourlyRate;
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
            Nationality = entity.Nationality,
            Religion = entity.Religion,
            LineId = entity.LineId,
            PositionId = entity.PositionId,
            PositionName = entity.Position?.PositionName,
            Phone = entity.Phone,
            Email = entity.Email,
            IsFullTime = entity.IsFullTime,
            Salary = entity.Salary,
            HourlyRate = entity.HourlyRate,
            ImageFileId = entity.ImageFileId,
            ImageFileName = entity.ImageFile?.FileName,
            IsActive = entity.IsActive,
            UserId = entity.UserId,
            Username = entity.User?.Username,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            CreatedBy = entity.CreatedByEmployee?.Nickname ?? entity.CreatedBy?.ToString(),
            UpdatedBy = entity.UpdatedByEmployee?.Nickname ?? entity.UpdatedBy?.ToString(),
            Addresses = entity.Addresses?.Select(ToAddressResponse).ToList() ?? new(),
            Educations = entity.Educations?.Select(ToEducationResponse).ToList() ?? new(),
            WorkHistories = entity.WorkHistories?.Select(ToWorkHistoryResponse).ToList() ?? new()
        };

    public static MyProfileResponseModel ToMyProfileResponse(TbEmployee entity)
        => new()
        {
            FullNameThai = $"{entity.FirstNameThai} {entity.LastNameThai}",
            Nickname = entity.Nickname,
            PositionName = entity.Position?.PositionName,
            ImageFileId = entity.ImageFileId
        };

    // Address mapping
    public static TbEmployeeAddress ToAddressEntity(CreateEmployeeAddressRequestModel request, int employeeId)
        => new()
        {
            EmployeeId = employeeId,
            AddressType = request.AddressType,
            HouseNumber = request.HouseNumber,
            Building = request.Building,
            Moo = request.Moo,
            Soi = request.Soi,
            Yaek = request.Yaek,
            Road = request.Road,
            SubDistrict = request.SubDistrict,
            District = request.District,
            Province = request.Province,
            PostalCode = request.PostalCode
        };

    public static void UpdateAddressEntity(TbEmployeeAddress entity, UpdateEmployeeAddressRequestModel request)
    {
        entity.AddressType = request.AddressType;
        entity.HouseNumber = request.HouseNumber;
        entity.Building = request.Building;
        entity.Moo = request.Moo;
        entity.Soi = request.Soi;
        entity.Yaek = request.Yaek;
        entity.Road = request.Road;
        entity.SubDistrict = request.SubDistrict;
        entity.District = request.District;
        entity.Province = request.Province;
        entity.PostalCode = request.PostalCode;
    }

    public static EmployeeAddressResponseModel ToAddressResponse(TbEmployeeAddress entity)
        => new()
        {
            AddressId = entity.AddressId,
            EmployeeId = entity.EmployeeId,
            AddressType = entity.AddressType,
            HouseNumber = entity.HouseNumber,
            Building = entity.Building,
            Moo = entity.Moo,
            Soi = entity.Soi,
            Yaek = entity.Yaek,
            Road = entity.Road,
            SubDistrict = entity.SubDistrict,
            District = entity.District,
            Province = entity.Province,
            PostalCode = entity.PostalCode
        };

    // Education mapping
    public static TbEmployeeEducation ToEducationEntity(CreateEmployeeEducationRequestModel request, int employeeId)
        => new()
        {
            EmployeeId = employeeId,
            EducationLevel = request.EducationLevel,
            Major = request.Major,
            Institution = request.Institution,
            Gpa = request.Gpa,
            GraduationYear = request.GraduationYear
        };

    public static void UpdateEducationEntity(TbEmployeeEducation entity, UpdateEmployeeEducationRequestModel request)
    {
        entity.EducationLevel = request.EducationLevel;
        entity.Major = request.Major;
        entity.Institution = request.Institution;
        entity.Gpa = request.Gpa;
        entity.GraduationYear = request.GraduationYear;
    }

    public static EmployeeEducationResponseModel ToEducationResponse(TbEmployeeEducation entity)
        => new()
        {
            EducationId = entity.EducationId,
            EmployeeId = entity.EmployeeId,
            EducationLevel = entity.EducationLevel,
            Major = entity.Major,
            Institution = entity.Institution,
            Gpa = entity.Gpa,
            GraduationYear = entity.GraduationYear
        };

    // Work History mapping
    public static TbEmployeeWorkHistory ToWorkHistoryEntity(CreateEmployeeWorkHistoryRequestModel request, int employeeId)
        => new()
        {
            EmployeeId = employeeId,
            Workplace = request.Workplace,
            WorkPhone = request.WorkPhone,
            Position = request.Position,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

    public static void UpdateWorkHistoryEntity(TbEmployeeWorkHistory entity, UpdateEmployeeWorkHistoryRequestModel request)
    {
        entity.Workplace = request.Workplace;
        entity.WorkPhone = request.WorkPhone;
        entity.Position = request.Position;
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
    }

    public static EmployeeWorkHistoryResponseModel ToWorkHistoryResponse(TbEmployeeWorkHistory entity)
        => new()
        {
            WorkHistoryId = entity.WorkHistoryId,
            EmployeeId = entity.EmployeeId,
            Workplace = entity.Workplace,
            WorkPhone = entity.WorkPhone,
            Position = entity.Position,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate
        };
}
