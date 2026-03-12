namespace POS.Main.Business.HumanResource.Models.UserAccount;

public class CreateUserAccountResponseModel
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public bool EmailSent { get; set; }
}
