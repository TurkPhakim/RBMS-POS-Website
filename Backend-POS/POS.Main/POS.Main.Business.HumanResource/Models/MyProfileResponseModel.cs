namespace POS.Main.Business.HumanResource.Models;

public class MyProfileResponseModel
{
    public string FullNameThai { get; set; } = string.Empty;
    public string? Nickname { get; set; }
    public string? PositionName { get; set; }
    public int? ImageFileId { get; set; }
}
