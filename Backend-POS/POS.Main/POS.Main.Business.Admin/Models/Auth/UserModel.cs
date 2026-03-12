namespace POS.Main.Business.Admin.Models.Auth;

/// <summary>
/// User data transfer object
/// </summary>
public class UserModel
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int? EmployeeId { get; set; }

    public int? PositionId { get; set; }

    public string? PositionName { get; set; }

    public List<string> Permissions { get; set; } = new();
}
