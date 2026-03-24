using System.ComponentModel.DataAnnotations;

namespace POS.Main.Business.Admin.Models.UserManagement;

public class UpdateUserSettingsRequestModel
{
    [Required]
    public bool IsActive { get; set; }

    [Required]
    public bool IsLockedByAdmin { get; set; }

    public DateTime? AutoUnlockDate { get; set; }
}
